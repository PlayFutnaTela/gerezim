"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Contact = {
  id: string
  name: string
  phone: string | null
}

type Product = {
  id: string
  title: string
  price: number
  category: string
}

type Opportunity = {
  id: string
  title: string
  category?: string
  value: number
  contact_id?: string | null
  product_id?: string | null
  notes?: string | null
  pipeline_stage: string
}

type Props = {
  opportunity: Opportunity
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = [
  { value: 'carro', label: 'Carro' },
  { value: 'imovel', label: 'Imóvel' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'item_premium', label: 'Item Premium' }
]

export default function EditOpportunityModal({ opportunity, isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Form states
  const [title, setTitle] = useState(opportunity.title)
  const [contactId, setContactId] = useState<string>(opportunity.contact_id || 'none')
  const [productId, setProductId] = useState<string>(opportunity.product_id || 'none')
  const [value, setValue] = useState<string>(opportunity.value.toString())
  const [category, setCategory] = useState<string>(opportunity.category || '')
  const [notes, setNotes] = useState(opportunity.notes || '')

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchContacts()
      fetchProducts()
      // Reset form with opportunity data
      setTitle(opportunity.title)
      setContactId(opportunity.contact_id || 'none')
      setProductId(opportunity.product_id || 'none')
      setValue(opportunity.value.toString())
      setCategory(opportunity.category || '')
      setNotes(opportunity.notes || '')
    }
  }, [isOpen, opportunity])

  async function fetchContacts() {
    const { data } = await supabase
      .from('contacts')
      .select('id, name, phone')
      .order('name')
    
    if (data) setContacts(data)
  }

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('id, title, price, category')
      .order('title')
    
    if (data) setProducts(data)
  }

  function handleProductChange(prodId: string) {
    setProductId(prodId)
    
    if (prodId !== 'none') {
      const product = products.find(p => p.id === prodId)
      if (product) {
        setValue(product.price.toString())
        setCategory(product.category)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Digite um título para a oportunidade')
      return
    }

    if (!value || parseFloat(value) <= 0) {
      toast.error('Digite um valor válido')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('opportunities')
        .update({
          title: title.trim(),
          category: category || null,
          value: parseFloat(value),
          contact_id: contactId === 'none' ? null : contactId,
          product_id: productId === 'none' ? null : productId,
          notes: notes.trim() || null,
        })
        .eq('id', opportunity.id)

      if (error) throw error

      toast.success('Oportunidade atualizada!')
      onClose()
      onSuccess()
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir "${opportunity.title}"?`)) return

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunity.id)

      if (error) throw error

      toast.success('Oportunidade excluída!')
      onClose()
      onSuccess()
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Oportunidade</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Venda de Apartamento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Cliente</Label>
            <Select value={contactId} onValueChange={setContactId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem cliente vinculado</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name} {contact.phone && `(${contact.phone})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Select value={productId} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem produto vinculado</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.title} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações sobre a oportunidade..."
              className="resize-none h-20"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="mr-auto"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Excluir
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-gold-500 hover:bg-gold-600 text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
