import { createClient } from '@/lib/supabase/server'
import OpportunitiesStore from '@/components/opportunities-store'

// Type for opportunity data
type Opportunity = {
  id: string
  title: string
  category: string
  value: number | string
  description: string
  location: string
  status: string
  photos?: string[]
  created_at: string
}

export default async function OpportunitiesPage() {
  const supabase = createClient()
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <OpportunitiesStore initialOpportunities={opportunities || []} />
  )
}