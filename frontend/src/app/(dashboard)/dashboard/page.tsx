import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { requireAdminOrRedirect } from '@/lib/server-admin'
import { DollarSign, Users, Briefcase, Activity } from "lucide-react"
import DashboardCharts from "@/components/dashboard-charts"
import PeriodSelector from '@/components/period-selector'

export default async function DashboardPage({ searchParams }: { searchParams?: { range?: string } }) {
  const supabase = createClient()

  // Ensure the user is an admin — redirects otherwise
  await requireAdminOrRedirect(supabase)

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
  const oppSelect = supabase.from('opportunities').select('value, status, category, created_at, pipeline_stage, closed_date')
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

  // Calculate Average Value by Category
  const avgValueByCategoryData = Array.from(categoriesSet).map(category => {
    const categoryOpps = (opportunities || []).filter(opp => opp.category === category)
    if (categoryOpps.length === 0) return { category: category === 'item_premium' ? 'Item Premium' : category.charAt(0).toUpperCase() + category.slice(1), avgValue: 0 }
    const totalValue = categoryOpps.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
    const avgValue = totalValue / categoryOpps.length
    return {
      category: category === 'item_premium' ? 'Item Premium' : category.charAt(0).toUpperCase() + category.slice(1),
      avgValue: avgValue
    }
  }).filter(item => item.avgValue > 0)

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
  const { data: pipelineOpportunities } = await supabase.from('opportunities').select('pipeline_stage, status').gte(startDate ? 'created_at' : 'created_at', startDate ? startDate.toISOString() : '1970-01-01T00:00:00Z')
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

  // Calculate Conversion Rate by Stage
  const allOpportunities = pipelineOpportunities || []
  const totalNew = allOpportunities.filter(opp => opp.pipeline_stage === 'Novo').length
  const totalInterested = allOpportunities.filter(opp => opp.pipeline_stage === 'Interessado').length
  const totalProposal = allOpportunities.filter(opp => opp.pipeline_stage === 'Proposta enviada').length
  const totalNegotiation = allOpportunities.filter(opp => opp.pipeline_stage === 'Negociação').length
  const totalClosed = allOpportunities.filter(opp => opp.pipeline_stage === 'Finalizado').length

  const conversionRateData = [
    { stage: 'Novo → Interessado', conversionRate: totalNew > 0 ? (totalInterested / totalNew) * 100 : 0 },
    { stage: 'Interessado → Proposta', conversionRate: totalInterested > 0 ? (totalProposal / totalInterested) * 100 : 0 },
    { stage: 'Proposta → Negociação', conversionRate: totalProposal > 0 ? (totalNegotiation / totalProposal) * 100 : 0 },
    { stage: 'Negociação → Finalizado', conversionRate: totalNegotiation > 0 ? (totalClosed / totalNegotiation) * 100 : 0 }
  ].filter(item => item.conversionRate > 0)

  // Calculate Value Distribution
  const valueRanges = [
    { min: 0, max: 5000, label: 'R$ 0 - 5.000' },
    { min: 5001, max: 25000, label: 'R$ 5.001 - 25.000' },
    { min: 25001, max: 50000, label: 'R$ 25.001 - 50.000' },
    { min: 50001, max: 100000, label: 'R$ 50.001 - 100.000' },
    { min: 100001, max: Infinity, label: 'R$ 100.001+' }
  ]

  const valueDistributionData = valueRanges.map(range => {
    const count = (opportunities || []).filter(opp => {
      const value = Number(opp.value) || 0
      return value >= range.min && (range.max === Infinity ? value <= 10000000 : value <= range.max)
    }).length

    return {
      range: range.label,
      count: count
    }
  }).filter(item => item.count > 0)

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

  // Top selling products - only count closed/finalized opportunities
  const { data: productsWithOpportunities } = await supabase
    .from('opportunities')
    .select(`
      product_id,
      products (title),
      value,
      status
    `)
    .not('product_id', 'is', null)
    .eq('status', 'finalizado') // Only count finalized opportunities

  // Count how many times each product appears in finalized opportunities
  const productCounts: Record<string, { title: string, count: number, revenue: number }> = {}
  productsWithOpportunities?.forEach(opp => {
    if (opp.product_id && opp.products) {
      const productId = opp.product_id
      const title = opp.products.title
      if (!productCounts[productId]) {
        productCounts[productId] = { title, count: 0, revenue: 0 }
      }
      productCounts[productId].count++
      productCounts[productId].revenue += Number(opp.value) || 0
    }
  })

  // Transform to array and sort by count
  const topSellingProductsData = Object.entries(productCounts)
    .map(([id, data]) => ({
      name: data.title,
      sold: data.count,
      revenue: data.revenue
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)

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
        conversionRateData={conversionRateData}
        avgValueByCategoryData={avgValueByCategoryData}
        valueDistributionData={valueDistributionData}
        topSellingProductsData={topSellingProductsData}
      />
    </div>
  )
}
