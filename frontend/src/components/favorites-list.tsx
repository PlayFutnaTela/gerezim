"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Heart, Search, Package } from 'lucide-react'
import { toast } from 'sonner'

type Product = {
    id: string
    title: string
    subtitle?: string
    price: number
    category: string
    images?: string[]
    stock: number
    tags?: string[]
    favorite_id?: string
    favorited_at?: string
}

type Props = {
    initialProducts: Product[]
    userId: string
}

export default function FavoritesList({ initialProducts, userId }: Props) {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [searchTerm, setSearchTerm] = useState('')
    const supabase = createClient()

    // Filter products based on search
    const filteredProducts = products.filter(product => {
        const search = searchTerm.toLowerCase()
        return (
            product.title.toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search) ||
            product.tags?.some(tag => tag.toLowerCase().includes(search)) ||
            product.subtitle?.toLowerCase().includes(search)
        )
    })

    async function handleUnfavorite(productId: string, favoriteId?: string, e?: React.MouseEvent) {
        // Prevent navigation when clicking unfavorite button
        e?.stopPropagation()
        e?.preventDefault()

        //Optimistic UI update
        setProducts(prev => prev.filter(p => p.id !== productId))

        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('product_id', productId)
                .eq('user_id', userId)

            if (error) throw error

            toast.success('Produto removido dos favoritos')
        } catch (error: any) {
            // Revert on error
            setProducts(prev => [...prev, products.find(p => p.id === productId)!])
            toast.error('Erro ao remover favorito: ' + error.message)
        }
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Meus Favoritos</h1>
                <p className="text-muted-foreground mt-1">
                    Produtos que você salvou para consultar depois
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Buscar nos favoritos..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                        <Heart size={32} className="text-slate-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700">
                            {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum favorito ainda'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {searchTerm
                                ? 'Tente buscar com outros termos'
                                : 'Explore produtos em Oportunidades e adicione seus favoritos!'
                            }
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => {
                        const thumbnail = product.images?.[0]

                        return (
                            <Link
                                key={product.id}
                                href={`/oportunidades/${product.id}`}
                                className="block"
                            >
                                <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer">
                                    {/* Favorite Button */}
                                    <button
                                        onClick={(e) => handleUnfavorite(product.id, product.favorite_id, e)}
                                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-colors"
                                        title="Remover dos favoritos"
                                    >
                                        <Heart size={16} className="fill-red-500 text-red-500" />
                                    </button>

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
                                        <div className="flex items-baseline justify-between">
                                            <div className="text-lg font-bold text-slate-900">
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(product.price)}
                                            </div>
                                            {product.stock !== undefined && (
                                                <div className="text-xs text-muted-foreground">
                                                    Estoque: {product.stock}
                                                </div>
                                            )}
                                        </div>

                                        {product.tags && product.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {product.tags.slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* Results Count */}
            {filteredProducts.length > 0 && (
                <div className="text-sm text-muted-foreground">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
                    {searchTerm && ' encontrado(s)'}
                </div>
            )}
        </div>
    )
}
