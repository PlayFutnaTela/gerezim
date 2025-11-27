import { createClient } from '@/lib/supabase/server'
import OpportunitiesStore from '@/components/opportunities-store'

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
  currency?: string
}

export default async function OpportunitiesPage() {
  const supabase = createClient()

  // Fetch user profile for avatar
  let userProfile = null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', user.id)
        .single()

      // Construct full avatar URL from Supabase storage
      if (data?.avatar_url) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.avatar_url)

        userProfile = {
          ...data,
          avatar_url: publicUrlData.publicUrl
        }
      } else {
        userProfile = data
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }

  // Fetch ONLY products (removed opportunities)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, title, subtitle, price, category, status, type, images, commission_percent, stock, created_at, description, currency')
    .eq('status', 'active') // Only show active products
    .order('created_at', { ascending: false })
    .limit(200)

  if (productsError) {
    console.error('Error fetching products:', productsError)
  }

  return (
    <OpportunitiesStore
      initialOpportunities={[]}
      initialProducts={products || []}
      userProfile={userProfile}
    />
  )
}