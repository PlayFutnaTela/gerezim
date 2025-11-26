import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { DollarSign, Users, Briefcase, Activity } from "lucide-react"
import DashboardCharts from "@/components/dashboard-charts"
import PeriodSelector from '@/components/period-selector'

export default async function DashboardPage({ searchParams }: { searchParams?: { range?: string } }) {
  const supabase = createClient()

  // Determine date range filter from query param `range` (server-side)
  const range = searchParams?.range || '30d'
  const now = new Date()
  let startDate: Date | null = null
  if (range === '7d') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
  else if (range === '30d') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  else if (range === '90d') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)
  else if (range === '365d') startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate())
  else startDate = null

  // Fetch summary data with optional range filter (opportunities count)
  const opportunitiesQuery = supabase.from('opportunities')
    .select('*', { count: 'exact', head: true })
  const contactsQuery = supabase.from('contacts').select('*', { count: 'exact', head: true })

  if (startDate) {
    opportunitiesQuery.gte('created_at', startDate.toISOString())
  }

  const { count: opportunitiesCount } = await opportunitiesQuery
  const { count: contactsCount } = await contactsQuery

  // Calculate total value in negotiation (simplified)
  // Load opportunities fields in the selected range for charts
  const oppSelect = supabase.from('opportunities').select('value, status, category, created_at, pipeline_stage')
  if (startDate) oppSelect.gte('created_at', startDate.toISOString())
  const { data: opportunities } = await oppSelect
  const totalValue = opportunities?.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0) || 0
  const activeValue = opportunities?.filter(o => o.status === 'em_negociacao').reduce((acc, curr) => acc + (Number(curr.value) || 0), 0) || 0

  // Prepare data for charts
  // Oportunidades por categoria
  // Ensure we count ALL categories present in the DB and also include default known categories
  const knownCategories = ['carro', 'imovel', 'empresa', 'item_premium']
  const categoriesSet = new Set<string>(knownCategories)
  opportunities?.forEach(opp => { if (opp.category) categoriesSet.add(opp.category) })

  const opportunityData = Array.from(categoriesSet).map(category => {
    const count = (opportunities || []).filter(opp => opp.category === category).length
    const value = (opportunities || []).filter(opp => opp.category === category).reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
    return {
      category: category === 'item_premium' ? 'Item Premium' : category.charAt(0).toUpperCase() + category.slice(1),
      count,
      value
    }
  })

  // Status counts are not used directly as we will display top products instead.

  // Timeline (compute months based on selected range)
  // reuse the `now` already declared earlier above
  // choose number of buckets depending on range
  let buckets = 6
  if (range === '7d') buckets = 7
  if (range === '30d') buckets = 6
  if (range === '90d') buckets = 12
  if (range === '365d') buckets = 12

  const timelineData = Array.from({ length: buckets }, (_, i) => {
    // For small windows, use day labels; otherwise month
    let pointDate: Date
    let label: string
    if (range === '7d') {
      pointDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (buckets - 1 - i))
      label = pointDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    } else {
      pointDate = new Date(now.getFullYear(), now.getMonth() - (buckets - 1 - i), 1)
      label = pointDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    }

    const monthRangeStart = new Date(pointDate)
    const monthRangeEnd = new Date(pointDate)
    if (range === '7d') {
      monthRangeStart.setHours(0,0,0,0)
      monthRangeEnd.setHours(23,59,59,999)
    } else {
      monthRangeStart.setDate(1)
      monthRangeStart.setHours(0,0,0,0)
      monthRangeEnd.setMonth(pointDate.getMonth()+1, 0)
      monthRangeEnd.setHours(23,59,59,999)
    }

    const monthOpportunities = opportunities?.filter(opp => {
      const oppDate = new Date(opp.created_at)
      return oppDate >= monthRangeStart && oppDate <= monthRangeEnd
    }) || []

    return {
      month: label,
      opportunities: monthOpportunities.length,
      value: monthOpportunities.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
    }
  }).reverse();

  // Pipeline de vendas
  const { data: pipelineOpportunities } = await supabase.from('opportunities').select('pipeline_stage').gte(startDate ? 'created_at' : 'created_at', startDate ? startDate.toISOString() : '1970-01-01T00:00:00Z')
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

  // Top 5 produtos mais caros (do banco)
  const { data: topProductsRaw } = await supabase
    .from('products')
    .select('id, title, price')
    .order('price', { ascending: false })
    .limit(5)

  const topProducts = (topProductsRaw || []).map((p: any) => ({
    name: p.title,
    price: Number(p.price || 0)
  }))

  // Render header with period selector
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <PeriodSelector />
      </div>

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
        topProducts={topProducts}
        timelineData={timelineData}
        pipelineData={pipelineData}
      />
    </div>
  )
}
