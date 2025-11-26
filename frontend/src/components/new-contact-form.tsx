"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function NewContactForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = (formData.get('name') as string || '').trim()
    const phone = (formData.get('phone') as string || '').trim()
    const source = (formData.get('source') as string || '').trim()
    const interests = (formData.get('interests') as string || '').trim()
    const status = (formData.get('status') as string || 'novo')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('Usuário não autenticado. Redirecionando para login.')
      toast.error('Você precisa estar logado para criar contatos')
      router.push('/login')
      setLoading(false)
      return
    }

    // Basic validation
    if (!name) {
      toast.error('Nome é obrigatório')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.from('contacts').insert({
      user_id: user.id,
      name,
      phone,
      source,
      interests,
      status
    }).select('id').single()

    if (error) {
      console.error('Erro ao inserir contato:', error)
      toast.error('Erro ao criar contato: ' + (error.message || 'verifique o console'))
    } else {
      console.log('Contato criado com sucesso', data)
      toast.success('Contato criado!')
      router.push('/contatos')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Novo Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status do Lead</Label>
                <Select name="status" defaultValue="novo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="quente">Quente</SelectItem>
                    <SelectItem value="morno">Morno</SelectItem>
                    <SelectItem value="frio">Frio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Como chegou?</Label>
              <Input id="source" name="source" placeholder="Ex: Indicação, Instagram" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interesses</Label>
              <Input id="interests" name="interests" placeholder="Ex: Carros esportivos, Imóveis na planta" />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Contato'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
