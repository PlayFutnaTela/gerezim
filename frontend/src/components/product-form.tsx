"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Product = {
  id: string
  title: string
  subtitle?: string
  description?: string
  price: number
  category: string
  status: string
  tags: string[]
  stock: number
  images: string[]
  created_at: string
}

type Props = {
  onCreated?: () => void
  onUpdated?: (product: Product) => void
  onCancel?: () => void
  initialSession?: any
  product?: Product | null
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILES = 15
const MAX_FILE_MB = 15

// Available categories from the opportunities search system
const AVAILABLE_CATEGORIES = [
  'Carro',
  'Imovel',
  'Empresa',
  'Premium',
  'Eletronicos',
  'Cartas Contempladas',
  'Industrias',
  'Embarcações'
]

export default function ProductForm({ onCreated, onUpdated, onCancel, initialSession, product }: Props) {
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
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setTitle(product.title)
      setSubtitle(product.subtitle || '')
      setDescription(product.description || '')
      setPrice(product.price.toString())
      setCategory(product.category)
      setStatus(product.status)
      setTags(product.tags.join(', '))
      setStock(product.stock)
      setExistingImages(product.images)
    } else {
      // Reset for new product
      setTitle('')
      setSubtitle('')
      setDescription('')
      setPrice('0')
      setCategory('')
      setStatus('draft')
      setTags('')
      setStock('')
      setExistingImages([])
      setFiles([])
      setPreviews([])
    }
  }, [product])

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
      const payload = {
        title,
        subtitle,
        description,
        price: Number(price || 0),
        category,
        status,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        stock: Number(stock || 0),
        images: []
      }

      let id: string
      if (product) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id)
        if (updateError) {
          setError(updateError.message)
          setLoading(false)
          return
        }
        id = product.id
      } else {
        // Insert new product
        const { data, error: insertError } = await supabase
          .from('products')
          .insert(payload)
          .select('id')
          .single()

        if (insertError || !data?.id) {
          if ((insertError as any)?.status === 409) {
            setError('Conflito ao inserir produto (409). Provavelmente uma constraint única foi violada.')
          } else {
            setError(insertError?.message || 'Erro ao inserir produto')
          }
          setLoading(false)
          return
        }
        id = data.id
      }

      const uploadedPaths: string[] = [...existingImages] // Keep existing images

      // Upload new files if any
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

      // Update product with all images
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: uploadedPaths })
        .eq('id', id)
      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      // Reset form if creating new
      if (!product) {
        setTitle('')
        setSubtitle('')
        setDescription('')
        setPrice('0')
        setCategory('')
        setTags('')
        setStock('')
        setFiles([])
        setPreviews([])
        setExistingImages([])
      }

      setLoading(false)
      if (product && onUpdated) {
        // Fetch updated product
        const { data: updatedProduct } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        if (updatedProduct) onUpdated(updatedProduct as Product)
      } else if (onCreated) {
        onCreated()
      }
    } catch (err: any) {
      setError(err?.message || String(err))
      setLoading(false)
    }
  }

  function removeAt(i: number) {
    const copy = [...files]; copy.splice(i, 1); setFiles(copy)
    const prev = [...previews]; prev.splice(i, 1); setPreviews(prev)
  }

  function removeExistingImage(i: number) {
    const copy = [...existingImages]; copy.splice(i, 1); setExistingImages(copy)
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
          <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full border rounded px-3 py-2 mt-1">
            <option value="">Selecione abaixo</option>
            {AVAILABLE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
          {/* Existing images */}
          {existingImages.map((img, i) => (
            <div key={`existing-${i}`} className="relative w-28 h-20 rounded overflow-hidden border">
              <img src={img} className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeExistingImage(i)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
            </div>
          ))}
          {/* New previews */}
          {previews.map((p, i) => (
            <div key={`new-${i}`} className="relative w-28 h-20 rounded overflow-hidden border">
              <img src={p} className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeAt(i)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">
            Cancelar
          </button>
        )}
        <button disabled={loading} type="submit" className="bg-navy-500 hover:bg-navy-600 text-white px-4 py-2 rounded">
          {loading ? 'Salvando...' : product ? 'Atualizar produto' : 'Criar produto'}
        </button>
      </div>
    </form>
  )
}
