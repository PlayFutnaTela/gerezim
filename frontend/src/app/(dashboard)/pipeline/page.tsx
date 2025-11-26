import { createClient } from "@/lib/supabase/server"
import { requireAdminOrRedirect } from '@/lib/server-admin'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function PipelinePage() {
  const supabase = createClient()

  // Ensure only admins can access pipeline
  await requireAdminOrRedirect(supabase)
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })

  const columns = [
    { id: 'Novo', title: 'Novo' },
    { id: 'Interessado', title: 'Interessado' },
    { id: 'Proposta enviada', title: 'Proposta Enviada' },
    { id: 'Negociação', title: 'Em Negociação' },
    { id: 'Finalizado', title: 'Finalizado' },
  ]

  return (
    <div className="h-full flex flex-col space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-[1000px]">
          {columns.map((col) => (
            <div key={col.id} className="w-80 flex-shrink-0 flex flex-col gap-4">
              <div className="font-semibold text-sm text-slate-500 uppercase tracking-wider">
                {col.title}
              </div>
              <div className="flex-1 bg-slate-100/50 rounded-lg p-2 space-y-3">
                {opportunities
                  ?.filter((opp) => opp.pipeline_stage === col.id)
                  .map((opp) => (
                    <Card key={opp.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="text-[10px]">{opp.category}</Badge>
                        </div>
                        <CardTitle className="text-sm font-medium leading-tight mt-2">
                          {opp.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="text-sm font-bold text-slate-700">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opp.value)}
                        </div>
                        {opp.location && (
                          <div className="text-xs text-slate-500 mt-1 truncate">
                            {opp.location}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
