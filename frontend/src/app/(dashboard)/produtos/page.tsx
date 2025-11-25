import ProductForm from '@/components/product-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProdutosPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  // Get server session to pass into the client component so createBrowserClient
  // in the client will have the authenticated session and uploads won't be anonymous.
  const { data: { session } } = await supabase.auth.getSession()
  if (!user) redirect('/login')

  // Could fetch products here if needed; for now render form
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produtos</h1>
        <p className="text-muted-foreground mt-1">Gerencie os produtos: cadastro, imagens e estoque.</p>

        <div className="mt-6">
          {/* Product form is client-side (handles uploads directly) */}
          {/* @ts-expect-error Server -> Client */}
          <ProductForm initialSession={session} />
        </div>
      </div>
    </div>
  )
}
