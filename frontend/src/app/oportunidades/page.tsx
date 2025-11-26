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

  const [opportunitiesResponse, productsResponse] = await Promise.all([
    supabase
      .from('opportunities')
      .select('id, title, category, value, description, photos, location, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('products')
      .select('id, title, subtitle, price, category, status, type, images, commission_percent, stock, created_at')
      .eq('status', 'active') // Only show active products
      .order('created_at', { ascending: false })
      .limit(200)
  ]);

  let opportunities = []
  if (opportunitiesResponse.error) {
    console.error('Error fetching opportunities:', opportunitiesResponse.error)
  } else {
    opportunities = opportunitiesResponse.data || []
  }

  let products = []
  if (productsResponse.error) {
    console.error('Error fetching products:', productsResponse.error)
  } else {
    products = productsResponse.data || []
  }

  return (
    <OpportunitiesStore
      initialOpportunities={opportunities}
      initialProducts={products}
    />
  )
}