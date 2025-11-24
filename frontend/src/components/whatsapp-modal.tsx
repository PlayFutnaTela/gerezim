"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Database } from "@/types/supabase"
import { Copy, MessageCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Opportunity = Database['public']['Tables']['opportunities']['Row']

export function WhatsAppModal({ opportunity }: { opportunity: Opportunity }) {
  const [isOpen, setIsOpen] = useState(false)

  const generateText = () => {
    return `*${opportunity.title}*
    
📍 ${opportunity.location || 'Localização não informada'}
💰 ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opportunity.value)}

${opportunity.description || ''}

${opportunity.photos && opportunity.photos.length > 0 ? `📸 Fotos: ${opportunity.photos[0]}` : ''}

Interessado? Me chame aqui!`
  }

  const text = generateText()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
    toast.success("Texto copiado!")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Gerar Ficha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ficha para WhatsApp</DialogTitle>
          <DialogDescription>
            Copie o texto abaixo para enviar aos clientes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            className="h-[300px] resize-none font-mono text-sm"
            value={text}
            readOnly
          />
        </div>
        <DialogFooter>
          <Button onClick={copyToClipboard} className="w-full gap-2">
            <Copy className="h-4 w-4" />
            Copiar Texto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
