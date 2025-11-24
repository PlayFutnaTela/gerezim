'use client'

import { useState, useEffect } from 'react'
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

export default function OpportunitiesStore({ initialOpportunities }: { initialOpportunities: Opportunity[] }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities || [])
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>(initialOpportunities || [])
  const [loading] = useState(false) // Data is already loaded server-side
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortOption, setSortOption] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Filter and sort opportunities
  useEffect(() => {
    let result = [...opportunities]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(opp => 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(opp => opp.category === selectedCategory)
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(opp => opp.status === selectedStatus)
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
        result.sort((a, b) => Number(a.value) - Number(b.value))
        break
      case 'price_desc':
        result.sort((a, b) => Number(b.value) - Number(a.value))
        break
      default:
        break
    }

    setFilteredOpportunities(result)
  }, [searchTerm, selectedCategory, selectedStatus, sortOption, opportunities])

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const categories = ['all', 'carro', 'imovel', 'empresa', 'item_premium']
  const statuses = ['all', 'novo', 'em_negociacao', 'vendido']

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Oportunidades</h1>
          <p className="text-muted-foreground mt-1">
            Descubra as melhores oportunidades disponíveis no mercado
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-gold-500 font-semibold">
            {filteredOpportunities?.length || 0} produtos
          </span>
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
          <p>Carregando oportunidades...</p>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Nenhuma oportunidade encontrada</h3>
          <p className="text-muted-foreground mt-1">Tente ajustar seus filtros</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="overflow-hidden flex flex-col h-full">
              <div className="relative">
                {/* Product Image Placeholder */}
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                  <span className="text-gray-500">Imagem de {opp.category}</span>
                </div>

                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white"
                  onClick={() => toggleFavorite(opp.id)}
                >
                  <Heart
                    className={`h-5 w-5 ${favorites.has(opp.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                  />
                </Button>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant={opp.status === 'vendido' ? 'secondary' : 'default'}>
                    {opp.category.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{opp.title}</CardTitle>
                  <Badge variant="outline">{opp.status === 'em_negociacao' ? 'Em negociação' : opp.status.charAt(0).toUpperCase() + opp.status.slice(1)}</Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-2xl font-bold mb-2 text-gold-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(opp.value))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {opp.description}
                </p>
                {opp.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {opp.location}
                  </p>
                )}
              </CardContent>

              <CardFooter>
                <div className="flex w-full gap-2">
                  <Button variant="outline" className="flex-1">
                    Ver detalhes
                  </Button>
                  <Button className="flex-1 bg-gold-500 text-white hover:bg-gold-600">
                    <ShoppingCart className="h-4 w-4 mr-2" /> Comprar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredOpportunities.map((opp) => (
            <Card key={opp.id}>
              <div className="flex gap-6 p-4">
                {/* Product Image Placeholder */}
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">Imagem</span>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <CardTitle className="text-xl">{opp.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(opp.id)}
                      >
                        <Heart
                          className={`h-5 w-5 ${favorites.has(opp.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                        />
                      </Button>
                      <Badge variant={opp.status === 'vendido' ? 'secondary' : 'default'}>
                        {opp.category.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(opp.value))}
                    </div>
                    <Badge variant="outline">
                      {opp.status === 'em_negociacao' ? 'Em negociação' : opp.status.charAt(0).toUpperCase() + opp.status.slice(1)}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mt-2 line-clamp-2">
                    {opp.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    {opp.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {opp.location}
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
                    <Button variant="outline">
                      Ver detalhes
                    </Button>
                    <Button>
                      <ShoppingCart className="h-4 w-4 mr-2" /> Comprar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Footer Section */}
      <Separator className="my-8" />
      <div className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Gerezim Intermediações. Todos os direitos reservados.
      </div>
    </div>
  )
}