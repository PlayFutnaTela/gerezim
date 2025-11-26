"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Search, 
  Filter, 
  MapPin,
  Heart,
  Star,
  ShoppingCart,
  Grid3X3,
  List
} from 'lucide-react'

import { TextRotate } from '@/style/efect-hover-text'
import ImageHeroCarousel from './image-hero-carousel'
import FooterSlider from './footer-slider'
import AreasOfOperation from './areas-of-operation'

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

export default function OpportunitiesStore({
  initialOpportunities,
  initialProducts
}: {
  initialOpportunities: Opportunity[]
  initialProducts: Product[]
}) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities || [])
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [filteredItems, setFilteredItems] = useState<(Opportunity | Product)[]>([])
  const [loading] = useState(false) // Data is already loaded server-side
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState<'all' | 'opportunities' | 'products'>('all')
  const [sortOption, setSortOption] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(new Set<string>())

  // Filter and sort items (opportunities and products)
  useEffect(() => {
    let result: (Opportunity | Product)[] = []

    // Combine opportunities and products based on selected type
    if (selectedType === 'all') {
      result = [...opportunities, ...products]
    } else if (selectedType === 'opportunities') {
      result = [...opportunities, ...products.filter(p => p.type === 'oportunidade')]
    } else if (selectedType === 'products') {
      result = [...products.filter(p => p.type === 'produto' || !p.type)]
    }

    // Apply search filter
    if (searchTerm) {
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ('location' in item && item.location?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ('subtitle' in item && item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ('tags' in item && item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory)
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(item => item.status === selectedStatus)
    }

    // Apply sorting
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'price_asc':
        result.sort((a, b) => {
          const priceA = 'price' in a ? a.price : Number(a.value)
          const priceB = 'price' in b ? b.price : Number(b.value)
          return priceA - priceB
        })
        break
      case 'price_desc':
        result.sort((a, b) => {
          const priceA = 'price' in a ? a.price : Number(a.value)
          const priceB = 'price' in b ? b.price : Number(b.value)
          return priceB - priceA
        })
        break
      default:
        break
    }

    setFilteredItems(result)
  }, [searchTerm, selectedCategory, selectedStatus, selectedType, sortOption, opportunities, products])

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const handleWhatsApp = (item: Opportunity | Product) => {
    const isProduct = 'images' in item
    const message = isProduct
      ? `Olá! Tenho interesse no produto: ${item.title}. ${('subtitle' in item && item.subtitle) ? `(${item.subtitle})` : ''} Poderia me fornecer mais informações?`
      : `Olá! Tenho interesse na oportunidade: ${item.title}. Poderia me fornecer mais informações?`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/5511981442518?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const categories = ['all', 'carro', 'imovel', 'empresa', 'Premium', 'eletronicos', 'Cartas Contempladas', 'Industrias', 'Embarcações']
  const statuses = ['all', 'novo', 'em_negociacao', 'vendido', 'Ativo']
  const types = [
    { value: 'all', label: 'Todos' },
    { value: 'opportunities', label: 'Oportunidades' },
    { value: 'products', label: 'Produtos' }
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="Gerezim logo" className="h-12 sm:h-14 md:h-16 lg:h-20 object-contain" style={{ height: 'auto' }} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gerezim</h1>
              <div className="text-muted-foreground mt-1">
                <TextRotate
                  texts={["Negócios exclusivos", "Oportunidades únicas", "Produtos Premium"]}
                  splitBy="words"
                  // keep the same visual size/position; TextRotate will inherit styles from this parent div
                  animate={{ y: 0, opacity: 1 }}
                  initial={{ y: '100%', opacity: 0 }}
                  exit={{ y: '-120%', opacity: 0 }}
                  rotationInterval={3000}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-gold-500 font-semibold">
              {filteredItems?.length || 0} itens
            </span>
          </div>
        </div>

        {/* Banner/carrossel de destaque */}
        <div className="w-full flex justify-center mt-8">
          <div className="w-full max-w-6xl">
            <ImageHeroCarousel interval={10000} />
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-300 h-4 w-4" />
          <Input
            placeholder="Buscar oportunidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-5 text-base sm:text-lg"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Selects */}
          <div className="flex flex-col sm:flex-row flex-1 gap-4">
            {/* Type Filter */}
            <div className="flex-1">
              <Select value={selectedType} onValueChange={(value: 'all' | 'opportunities' | 'products') => setSelectedType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <Filter className="h-4 w-4 mr-2 text-gold-300" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'Todas as categorias' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'Todos os status' : status === 'em_negociacao' ? 'Em negociação' : status.charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="flex-1">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="price_asc">Menor preço</SelectItem>
                  <SelectItem value="price_desc">Maior preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className={`h-4 w-4 ${viewMode === 'grid' ? 'text-gold-500' : ''}`} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className={`h-4 w-4 ${viewMode === 'list' ? 'text-gold-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Carregando itens...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Nenhum item encontrado</h3>
          <p className="text-muted-foreground mt-1">Tente ajustar seus filtros</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col h-full">
              <div className="relative">
                {/* Product Image */}
                {'images' in item && item.images?.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                ) : 'photos' in item && item.photos?.length > 0 ? (
                  <img
                    src={item.photos[0]}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                    <span className="text-gray-500">Sem imagem</span>
                  </div>
                )}

                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white"
                  onClick={() => toggleFavorite(item.id)}
                >
                  <Heart
                    className={`h-5 w-5 ${favorites.has(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                  />
                </Button>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant={'status' in item && item.status === 'vendido' ? 'secondary' : 'default'}>
                    {item.category.toUpperCase()}
                  </Badge>
                </div>

                {/* Type Badge */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <Badge variant="outline" className="text-xs">
                    {'images' in item ? 'Produto' : 'Oportunidade'}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                    {'subtitle' in item && item.subtitle && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.subtitle}</p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {'status' in item && item.status === 'em_negociacao' ? 'Em negociação' :
                     'status' in item && item.status === 'active' ? 'Ativo' :
                     'status' in item ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Novo'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-2xl font-bold mb-2 text-gold-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    'price' in item ? item.price : Number(item.value)
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.description}
                </p>
                {'location' in item && item.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" /> {item.location}
                  </p>
                )}
                {'tags' in item && item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                {'stock' in item && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Estoque: {item.stock}
                  </p>
                )}
              </CardContent>

              <CardFooter>
                <div className="flex w-full gap-2">
                  <Link href={`/oportunidades/${item.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Ver detalhes
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => handleWhatsApp(item)}
                    className="flex-1 bg-gold-500 text-white hover:bg-gold-600"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" /> {'images' in item ? 'Comprar' : 'Negociar'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              <div className="flex gap-6 p-4">
                {/* Product Image */}
                {'images' in item && item.images?.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                ) : 'photos' in item && item.photos?.length > 0 ? (
                  <img
                    src={item.photos[0]}
                    alt={item.title}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-lg w-32 h-32 flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Sem imagem</span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      {'subtitle' in item && item.subtitle && (
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(item.id)}
                      >
                        <Heart
                          className={`h-5 w-5 ${favorites.has(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                        />
                      </Button>
                      <Badge variant={'status' in item && item.status === 'vendido' ? 'secondary' : 'default'}>
                        {item.category.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {'images' in item ? 'Produto' : 'Oportunidade'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-2xl font-bold text-gold-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        'price' in item ? item.price : Number(item.value)
                      )}
                    </div>
                    <Badge variant="outline">
                      {'status' in item && item.status === 'em_negociacao' ? 'Em negociação' :
                       'status' in item && item.status === 'active' ? 'Ativo' :
                       'status' in item ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Novo'}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mt-2 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    {'location' in item && item.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {item.location}
                      </p>
                    )}
                    {'tags' in item && item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    {'stock' in item && (
                      <p className="text-sm text-muted-foreground">
                        Estoque: {item.stock}
                      </p>
                    )}
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm ml-1">4.8 (120)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="flex gap-2">
                    <Link href={`/oportunidades/${item.id}`}>
                      <Button variant="outline">
                        Ver detalhes
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => handleWhatsApp(item)}
                      className="bg-gold-500 text-white hover:bg-gold-600"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" /> {'images' in item ? 'Comprar' : 'Negociar'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Areas de atuação (inserido antes do footer) */}
      <div className="mt-8">
        <AreasOfOperation />
      </div>

      {/* Footer Section */}
      <Separator className="my-8" />
      <FooterSlider />
    </div>
  )
}