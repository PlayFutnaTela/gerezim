import { createClient } from '@/lib/supabase/server'
import OpportunitiesStore from '@/components/opportunities-store'
// hero removed

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
  commission_percent?: number
  category: string
  status: string
  type?: string
  tags?: string[]
  stock: number
  images: string[]
  created_at: string
}

export default async function OpportunitiesPage() {
  const supabase = createClient()

  // Fetch opportunities (limit columns to reduce payload)
  let opportunities = []
  try {
    const { data: oppData, error: oppError } = await supabase
      .from('opportunities')
      .select('id, title, category, value, description, photos, location, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (oppError) {
      console.error('Error fetching opportunities:', oppError)
    } else {
      opportunities = oppData || []
    }
  } catch (err) {
    console.error('Unexpected error fetching opportunities', err)
  }

  // Fetch products
  // Fetch products but select only columns we need and limit to avoid heavy queries
  let products = []
  try {
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .select('id, title, subtitle, price, category, status, type, images, commission_percent, stock, created_at')
      .eq('status', 'active') // Only show active products
      .order('created_at', { ascending: false })
      .limit(200)

    if (prodError) {
      console.error('Error fetching products:', prodError)
    } else {
      products = prodData || []
    }
  } catch (err) {
    console.error('Unexpected error fetching products', err)
  }

  return (
    <OpportunitiesStore
      initialOpportunities={opportunities || []}
      initialProducts={products || []}
    />
  )
}