import { createClient } from '@/lib/supabase/server'
import FavoritesList from '@/components/favorites-list'

export default async function FavoritosPage() {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Você precisa estar logado para ver seus favoritos</p>
            </div>
        )
    }

    // Fetch user's favorites with product details
    const { data: favorites, error } = await supabase
        .from('favorites')
        .select(`
      id,
      created_at,
      product:products (
        id,
        title,
        subtitle,
        price,
        category,
        images,
        commission_percent,
        stock,
        tags
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching favorites:', error)
    }

    // Extract products from favorites
    const products = favorites?.map(fav => ({
        ...fav.product,
        favorite_id: fav.id,
        favorited_at: fav.created_at
    })).filter(p => p.id) || []

    return <FavoritesList initialProducts={products} userId={user.id} />
}
