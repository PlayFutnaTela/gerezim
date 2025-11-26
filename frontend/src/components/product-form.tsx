"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Product = {
  id: string
  title: string
  subtitle?: string
  description?: string
  price: number
  commission_percent?: number
  category: string
  status: string
  type: string
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
const MAX_FILES = 30
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

// Brazilian states for location selection
const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' }
]

// Categories that require location information
const CATEGORIES_REQUIRING_LOCATION = ['Imovel', 'Empresas', 'Industrias']


export default function ProductForm({ onCreated, onUpdated, onCancel, initialSession, product }: Props) {
  // Supabase client for database operations (insert/update products)
  const supabase = createClient(initialSession)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [currency, setCurrency] = useState('BRL')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('draft')
  const [tags, setTags] = useState('')
  const [stock, setStock] = useState<number | ''>('')
  const [commission, setCommission] = useState('0')
  const [type, setType] = useState('produto')

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Location-related states
  const [isNational, setIsNational] = useState<boolean | null>(null)
  const [locationInfo, setLocationInfo] = useState('')
  const [showLocationFields, setShowLocationFields] = useState(false)

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setTitle(product.title)
      setSubtitle(product.subtitle || '')
      setDescription(product.description || '')
      setPrice(product.price.toString())
      setCurrency((product as any).currency || 'BRL')
      setCategory(product.category)
      setStatus(product.status)
      setTags(product.tags.join(', '))
      setStock(product.stock)
      setExistingImages(product.images)
      setType((product as any).type || 'produto')
      setCommission(((product as any).commission_percent ?? 0).toString())

      // Initialize location fields
      const prodWithLocation = product as any
      setIsNational(prodWithLocation.is_national ?? null)
      setLocationInfo(prodWithLocation.location_info || '')
      setShowLocationFields(CATEGORIES_REQUIRING_LOCATION.includes(product.category))
    } else {
      // Reset for new product
      setTitle('')
      setSubtitle('')
      setDescription('')
      setPrice('0')
      setCurrency('BRL')
      setCategory('')
      setStatus('draft')
      setTags('')
      setStock('')
      setType('produto')
      setCommission('0')
      setExistingImages([])
      setFiles([])
      setPreviews([])

      // Reset location fields
      setIsNational(null)
      setLocationInfo('')
      setShowLocationFields(false)
    }
  }, [product])

  // Update showLocationFields when category changes
  useEffect(() => {
    const shouldShow = CATEGORIES_REQUIRING_LOCATION.includes(category)
    setShowLocationFields(shouldShow)

    // Reset location fields when hiding
    if (!shouldShow) {
      setIsNational(null)
      setLocationInfo('')
    }
  }, [category])

  function addFiles(list: FileList | null) {
    if (!list) return
    const arr = Array.from(list)
    // checks — consider already existing images plus new pending files
    if ((existingImages.length || 0) + files.length + arr.length > MAX_FILES) {
      setError(`Máximo ${MAX_FILES} imagens no total`); return
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
      // Validate location fields for specific categories
      if (CATEGORIES_REQUIRING_LOCATION.includes(category)) {
        if (isNational === null) {
          setError('Por favor, informe se é nacional ou internacional.')
          setLoading(false)
          return
        }
        if (!locationInfo || locationInfo.trim() === '') {
          setError(isNational
            ? 'Por favor, selecione o estado.'
            : 'Por favor, informe a localização internacional.')
          setLoading(false)
          return
        }
      }

      const payload = {
        title,
        subtitle,
        description,
        price: Number(price || 0),
        currency,
        category,
        status,
        type,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        stock: Number(stock || 0),
        commission_percent: Number(commission || 0),
        is_national: showLocationFields ? isNational : null,
        location_info: showLocationFields ? locationInfo : null,
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
        setCommission('0')
      }

      setLoading(false)
      if (product && onUpdated) {
        // Fetch updated product
        const { data: updatedProduct } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        if (updatedProduct) {
          toast.success('✅ Produto atualizado com sucesso!', {
            description: `"${title}" foi atualizado.`
          })
          onUpdated(updatedProduct as Product)
        }
      } else if (onCreated) {
        toast.success('🎉 Produto cadastrado com sucesso!', {
          description: `"${title}" foi adicionado ao catálogo.`
        })
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
          <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Subtítulo</label>
          <input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Descrição</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 mt-1 min-h-[120px]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div>
          <label className="text-sm font-medium">Preço</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Moeda</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full border rounded px-3 py-2 mt-1">
            <option value="BRL">BRL (Real Brasileiro)</option>
            <option value="EUR">EUR (Euro)</option>
            <option value="USD">USD (Dólar Americano)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Tipo</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-3 py-2 mt-1">
            <option value="produto">Produto</option>
            <option value="oportunidade">Oportunidade</option>
          </select>
        </div>
        {/* SKU removed - no longer collected */}
        <div>
          <label className="text-sm font-medium">Categoria</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded px-3 py-2 mt-1">
            <option value="">Selecione abaixo</option>
            {AVAILABLE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded px-3 py-2 mt-1">
            <option value="draft">Rascunho</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">% Comissão</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={commission}
            onChange={e => setCommission(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
          <input value={tags} onChange={e => setTags(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Estoque</label>
          <input type="number" value={stock} onChange={e => setStock(Number(e.target.value) || '')} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
      </div>

      {/* Conditional Location Fields - Only for specific categories */}
      {showLocationFields && (
        <div className="border-2 border-gold-300 rounded-lg p-4 space-y-3 bg-gold-50">
          <h3 className="text-sm font-semibold text-gold-700">📍 Informações de Localização (Obrigatório)</h3>

          {/* National/International Checkbox */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="location-type"
                checked={isNational === true}
                onChange={() => {
                  setIsNational(true)
                  setLocationInfo('')
                }}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Nacional 🇧🇷</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="location-type"
                checked={isNational === false}
                onChange={() => {
                  setIsNational(false)
                  setLocationInfo('')
                }}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Internacional 🌍</span>
            </label>
          </div>

          {/* Conditional fields based on national/international selection */}
          {isNational === true && (
            <div>
              <label className="text-sm font-medium">Estado *</label>
              <select
                value={locationInfo}
                onChange={e => setLocationInfo(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                <option value="">Selecione o estado</option>
                {BRAZILIAN_STATES.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name} ({state.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isNational === false && (
            <div>
              <label className="text-sm font-medium">Localização Internacional *</label>
              <input
                type="text"
                value={locationInfo}
                onChange={e => setLocationInfo(e.target.value)}
                placeholder="Ex: Miami, USA ou Paris, France"
                className="w-full border rounded px-3 py-2 mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Informe a cidade e país</p>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Imagens (até {MAX_FILES}, cada até {MAX_FILE_MB}MB)</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => addFiles(e.target.files)} className="block mt-2" />
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
