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

// Type for product data
type Product = {
  id: string
  title: string
  subtitle?: string
  description: string
  price: number
  category: string
  status: string
  tags?: string[]
  stock: number
  images: string[]
  created_at: string
}

export default async function OpportunitiesPage() {
  const supabase = createClient()

  // Fetch opportunities
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active') // Only show active products
    .order('created_at', { ascending: false })

  return (
    <OpportunitiesStore
      initialOpportunities={opportunities || []}
      initialProducts={products || []}
    />
  )
}