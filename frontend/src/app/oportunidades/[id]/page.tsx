import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/product-detail'

export default async function OpportunityDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  // Try to fetch as opportunity first
  let { data: item, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', params.id)
    .single()

  let isProduct = false

  if (!item || error) {
    // Try to fetch as product
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    if (product && !prodError) {
      item = product
      isProduct = true
    } else {
      notFound()
    }
  }

  return <ProductDetail item={item} isProduct={isProduct} />
}