import ProductForm from '@/components/product-form'
import ProductList from '@/components/product-list'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProdutosPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  // Get server session to pass into the client component so createBrowserClient
  // in the client will have the authenticated session and uploads won't be anonymous.
  const { data: { session } } = await supabase.auth.getSession()
  if (!user) redirect('/login')

  // Fetch existing products — select only needed columns and limit to reduce payload
  let products = []
  try {
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .select('id, title, subtitle, price, category, status, tags, stock, images, created_at, commission_percent, type')
      .order('created_at', { ascending: false })
      .limit(500)

    if (prodError) {
      console.error('Error fetching products:', prodError)
    } else {
      products = prodData || []
    }
  } catch (err) {
    console.error('Unexpected error fetching products:', err)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produtos</h1>
        <p className="text-muted-foreground mt-1">Gerencie os produtos: cadastro, imagens e estoque.</p>

        <div className="mt-6 space-y-8">
          {/* Product form is client-side (handles uploads directly) - moved above the list */}
          <ProductForm initialSession={session} />

          {/* Product list */}
          <ProductList products={products || []} />
        </div>
      </div>
    </div>
  )
}
