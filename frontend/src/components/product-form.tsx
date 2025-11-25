"use client"

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  onCreated?: () => void
  initialSession?: any
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILES = 15
const MAX_FILE_MB = 15

export default function ProductForm({ onCreated, initialSession }: Props) {
  // Supabase client for database operations (insert/update products)
  const supabase = createClient(initialSession)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('draft')
  const [tags, setTags] = useState('')
  const [stock, setStock] = useState<number | ''>('')

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addFiles(list: FileList | null) {
    if (!list) return
    const arr = Array.from(list)
    // checks
    if (files.length + arr.length > MAX_FILES) {
      setError(`Máximo ${MAX_FILES} imagens`) ; return
    }
    for (const f of arr) {
      if (!SUPPORTED_TYPES.includes(f.type)) { setError('Formato não permitido'); return }
      if (f.size > MAX_FILE_MB * 1024 * 1024) { setError(`Arquivo maior que ${MAX_FILE_MB}MB`); return }
    }
    const newFiles = [...files, ...arr]
    setFiles(newFiles)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setPreviews(newPreviews)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Insert product record first (without images)

      const payload = {
        title,
        subtitle,
        description,
        price: Number(price || 0),
        // SKU removed — not included in payload
        category,
        status,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        stock: Number(stock || 0),
        images: []
      }

      console.debug('Creating product payload', payload)

      const { data, error: insertError } = await supabase.from('products').insert(payload).select('id').single()

      if (insertError || !data?.id) {
        // If DB reports conflict (409) the Supabase error usually has status === 409
        if ((insertError as any)?.status === 409) {
          // give a user-friendly explanation — most common is unique constraint (e.g. duplicate unique field)
          setError('Conflito ao inserir produto (409). Provavelmente uma constraint única foi violada — verifique campos únicos.')
        } else {
          setError(insertError?.message || 'Erro ao inserir produto')
        }
        console.error('Insert product error', { insertError })
        setLoading(false)
        return
      }

      const id = data.id
      const uploadedPaths: string[] = []

      // Upload files via server API route (uses service role, avoids client RLS issues)
      if (files.length > 0) {
        const formData = new FormData()
        formData.append('productId', id)
        files.forEach(file => formData.append('files', file))

        const uploadResponse = await fetch('/api/upload-images', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          setError(`Upload falhou: ${uploadError.error}`)
          setLoading(false)
          return
        }

        const uploadResult = await uploadResponse.json()
        uploadedPaths.push(...uploadResult.urls)
      }

      // update product with images
      const { error: updateError } = await supabase.from('products').update({ images: uploadedPaths }).eq('id', id)
      if (updateError) { setError(updateError.message); setLoading(false); return }

      // reset
      setTitle(''); setSubtitle(''); setDescription(''); setPrice('0'); setCategory(''); setTags(''); setStock('')
      setFiles([]); setPreviews([])
      setLoading(false)
      if (onCreated) onCreated()
    } catch (err:any) {
      setError(err?.message || String(err))
      setLoading(false)
    }
  }

  function removeAt(i:number){
    const copy = [...files]; copy.splice(i,1); setFiles(copy)
    const prev = [...previews]; prev.splice(i,1); setPreviews(prev)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow sm:max-w-3xl">
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Título</label>
          <input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Subtítulo</label>
          <input value={subtitle} onChange={e=>setSubtitle(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Descrição</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded px-3 py-2 mt-1 min-h-[120px]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-sm font-medium">Preço (BRL)</label>
          <input type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
        {/* SKU removed - no longer collected */}
        <div>
          <label className="text-sm font-medium">Categoria</label>
          <input value={category} onChange={e=>setCategory(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border rounded px-3 py-2 mt-1">
            <option value="draft">Rascunho</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
          <input value={tags} onChange={e=>setTags(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Estoque</label>
          <input type="number" value={stock} onChange={e=>setStock(Number(e.target.value) || '')} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Imagens (até {MAX_FILES}, cada até {MAX_FILE_MB}MB)</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>addFiles(e.target.files)} className="block mt-2" />
        <div className="flex gap-2 mt-3 flex-wrap">
          {previews.map((p,i)=> (
            <div key={p} className="relative w-28 h-20 rounded overflow-hidden border">
              <img src={p} className="w-full h-full object-cover" />
              <button type="button" onClick={()=>removeAt(i)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button disabled={loading} type="submit" className="bg-navy-500 hover:bg-navy-600 text-white px-4 py-2 rounded">
          {loading ? 'Enviando...' : 'Criar produto'}
        </button>
      </div>
    </form>
  )
}
