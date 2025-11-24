import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Phone, User } from "lucide-react"
import Link from "next/link"

export default async function ContactsPage() {
  const supabase = createClient()
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quente': return 'bg-red-500 hover:bg-red-600'
      case 'morno': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'frio': return 'bg-blue-500 hover:bg-blue-600'
      default: return 'bg-slate-500 hover:bg-slate-600'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
        <Link href="/contatos/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Contato
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contacts?.map((contact) => (
          <Card key={contact.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                {contact.name}
              </CardTitle>
              <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {contact.phone || 'Sem telefone'}
                </div>
                <div>
                  <span className="font-medium">Interesses: </span>
                  {contact.interests || '-'}
                </div>
                <div>
                  <span className="font-medium">Origem: </span>
                  {contact.source || '-'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
