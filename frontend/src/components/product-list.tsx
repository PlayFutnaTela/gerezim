"use client"

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, Package, Search } from 'lucide-react'
import ProductForm from './product-form'

type Product = {
  id: string
  title: string
  subtitle?: string
  description?: string
  price: number
  commission_percent?: number
  category: string
  status: string
  tags: string[]
  stock: number
  images: string[]
  created_at: string
}

type Props = {
  products: Product[]
}

export default function ProductList({ products: initialProducts }: Props) {
  const supabase = createClient()
  const [products, setProducts] = useState(initialProducts)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase()
    return (
      product.title.toLowerCase().includes(term) ||
      (product.subtitle && product.subtitle.toLowerCase().includes(term)) ||
      (product.description && product.description.toLowerCase().includes(term)) ||
      product.category.toLowerCase().includes(term) ||
      product.tags.some(tag => tag.toLowerCase().includes(term))
    )
  })

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    setLoading(true)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir produto: ' + error.message)
    } else {
      setProducts(products.filter(p => p.id !== id))
    }
    setLoading(false)
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
  }

  function handleCloseEdit() {
    setEditingProduct(null)
  }

  function handleProductUpdated(updatedProduct: Product) {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p))
    setEditingProduct(null)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Produtos Cadastrados</h2>
      
      {/* Search input */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título, subtítulo, descrição, categoria ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {products.length === 0 ? (
        <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-muted-foreground">Nenhum produto encontrado para a busca.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Título</th>
                <th className="text-left py-2">Categoria</th>
                <th className="text-left py-2">Preço</th>
                <th className="text-left py-2">Estoque</th>
                <th className="text-left py-2">Comissão (R$)</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Imagens</th>
                <th className="text-left py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b">
                  <td className="py-2">
                    <div>
                      <div className="font-medium">{product.title}</div>
                      {product.subtitle && <div className="text-muted-foreground text-xs">{product.subtitle}</div>}
                    </div>
                  </td>
                  <td className="py-2">{product.category}</td>
                  <td className="py-2">R$ {product.price.toFixed(2)}</td>
                  <td className="py-2">{product.stock}</td>
                  <td className="py-2">
                    {(() => {
                      const price = Number(product.price || 0)
                      const pct = Number((product as any).commission_percent ?? 0)
                      if (!price || !pct) return '-'
                      const commissionValue = (price * pct) / 100
                      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commissionValue)
                    })()}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status === 'active' ? 'Ativo' :
                       product.status === 'draft' ? 'Rascunho' :
                       product.status === 'inactive' ? 'Inativo' : 'Arquivado'}
                    </span>
                  </td>
                  <td className="py-2">{product.images.length} imagem(ns)</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={loading}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Editar Produto</h3>
              <button onClick={handleCloseEdit} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <ProductForm
              initialSession={null}
              product={editingProduct}
              onUpdated={handleProductUpdated}
              onCancel={handleCloseEdit}
            />
          </div>
        </div>
      )}
    </div>
  )
}