import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ArrowLeft, ShoppingCart } from 'lucide-react'

type Props = {
    params: {
        categoria: string
    }
}

export default async function CategoriaPage({ params }: Props) {
    const supabase = createClient()

    // Map URL slug to proper category name
    const categorySlugMap: Record<string, string> = {
        'carros-de-luxo': 'Carros de Luxo',
        'imoveis': 'Imóveis',
        'empresas': 'Empresas',
        'premium': 'Premium',
        'eletronicos': 'Eletrônicos',
        'cartas-contempladas': 'Cartas Contempladas',
        'industrias': 'Indústrias',
        'embarcacoes': 'Embarcações'
    }

    const categorySlug = params.categoria
    const categoryName = categorySlugMap[categorySlug] || categorySlug.replace(/-/g, ' ')

    // Fetch products for this category
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('category', categoryName)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching products:', error)
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <Link
                    href="/oportunidades"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold-500 transition-colors mb-6"
                >
                    <ArrowLeft size={16} />
                    Voltar para Oportunidades
                </Link>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-gold-500">
                        {categoryName}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {products?.length || 0} {products?.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                    </p>
                </div>

                {/* Products Grid */}
                {!products || products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Package size={64} className="text-slate-300 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700">
                            Nenhum produto nesta categoria
                        </h3>
                        <p className="text-muted-foreground mt-2">
                            Explore outras categorias ou volte para ver todos os produtos
                        </p>
                        <Link href="/oportunidades">
                            <Button className="mt-6 bg-gold-500 hover:bg-gold-600 text-white">
                                Ver Todos os Produtos
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => {
                            const thumbnail = product.images?.[0]

                            return (
                                <Link key={product.id} href={`/oportunidades/${product.id}`}>
                                    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer h-full">
                                        {/* Product Image */}
                                        <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                            {thumbnail ? (
                                                <img
                                                    src={thumbnail}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package size={48} className="text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {product.category}
                                                </Badge>
                                                {product.stock !== undefined && (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        Estoque: {product.stock}
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
                                                {product.title}
                                            </CardTitle>
                                            {product.subtitle && (
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                    {product.subtitle}
                                                </p>
                                            )}
                                        </CardHeader>

                                        <CardContent className="p-4 pt-2">
                                            <div className="flex items-baseline justify-between mb-3">
                                                <div className="text-lg font-bold text-slate-900">
                                                    {new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(product.price)}
                                                </div>
                                            </div>

                                            {product.tags && product.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {product.tags.slice(0, 3).map((tag: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <Button className="w-full mt-4 bg-gold-500 hover:bg-gold-600 text-white">
                                                <ShoppingCart size={16} className="mr-2" />
                                                Ver Detalhes
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
