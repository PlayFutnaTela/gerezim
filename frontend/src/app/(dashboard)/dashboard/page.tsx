import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { DollarSign, Users, Briefcase, Activity } from "lucide-react"
import DashboardCharts from "@/components/dashboard-charts"

export default async function DashboardPage() {
  const supabase = createClient()

  // Fetch summary data
  const { count: opportunitiesCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true })
  const { count: contactsCount } = await supabase.from('contacts').select('*', { count: 'exact', head: true })

  // Calculate total value in negotiation (simplified)
  const { data: opportunities } = await supabase.from('opportunities').select('value, status, category, created_at')
  const totalValue = opportunities?.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0) || 0
  const activeValue = opportunities?.filter(o => o.status === 'em_negociacao').reduce((acc, curr) => acc + (Number(curr.value) || 0), 0) || 0

  // Prepare data for charts
  // Oportunidades por categoria
  const categoryCounts: Record<string, number> = {
    carro: 0,
    imovel: 0,
    empresa: 0,
    'item_premium': 0
  };

  opportunities?.forEach(opp => {
    if (opp.category in categoryCounts) {
      categoryCounts[opp.category]++;
    }
  });

  const opportunityData = Object.entries(categoryCounts).map(([category, count]) => ({
    category: category === 'item_premium' ? 'Item Premium' : category.charAt(0).toUpperCase() + category.slice(1),
    count,
    value: opportunities?.filter(opp => opp.category === category).reduce((acc, curr) => acc + (Number(curr.value) || 0), 0) || 0
  }));

  // Status das oportunidades
  const statusCounts: Record<string, number> = {
    novo: 0,
    'em_negociacao': 0,
    vendido: 0
  };

  opportunities?.forEach(opp => {
    if (opp.status in statusCounts) {
      statusCounts[opp.status]++;
    }
  });

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status === 'em_negociacao' ? 'Em Negociação' : status.charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
    value: count
  })).filter(item => item.value > 0); // Apenas status com valores

  // Timeline (últimos 6 meses)
  const now = new Date();
  const timelineData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

    const monthOpportunities = opportunities?.filter(opp => {
      const oppDate = new Date(opp.created_at);
      return oppDate.getMonth() === monthDate.getMonth() &&
             oppDate.getFullYear() === monthDate.getFullYear();
    }) || [];

    return {
      month: monthStr,
      opportunities: monthOpportunities.length,
      value: monthOpportunities.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
    };
  }).reverse();

  // Pipeline de vendas
  const { data: pipelineOpportunities } = await supabase.from('opportunities').select('pipeline_stage')
  const pipelineCounts: Record<string, number> = {
    'Novo': 0,
    'Interessado': 0,
    'Proposta enviada': 0,
    'Negociação': 0,
    'Finalizado': 0
  };

  pipelineOpportunities?.forEach(opp => {
    if (opp.pipeline_stage in pipelineCounts) {
      pipelineCounts[opp.pipeline_stage]++;
    }
  });

  const pipelineData = Object.entries(pipelineCounts).map(([stage, count]) => ({
    name: stage,
    value: count
  })).filter(item => item.value > 0); // Apenas estágios com valores

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Oportunidades</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunitiesCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume em Negociação</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activeValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <DashboardCharts
        opportunityData={opportunityData}
        statusData={statusData}
        timelineData={timelineData}
        pipelineData={pipelineData}
      />
    </div>
  )
}
