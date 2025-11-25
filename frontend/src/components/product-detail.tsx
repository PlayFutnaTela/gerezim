"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, MessageCircle, MapPin, ArrowLeft } from 'lucide-react'

type Item = {
  id: string
  title: string
  subtitle?: string
  description: string
  price?: number
  value?: number | string
  category: string
  status: string
  tags?: string[]
  stock?: number
  images?: string[]
  photos?: string[]
  location?: string
  created_at: string
}

type Props = {
  item: Item
  isProduct: boolean
}

export default function ProductDetail({ item, isProduct }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = isProduct ? (item.images || []) : (item.photos || [])
  const price = isProduct ? item.price : Number(item.value)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleWhatsApp = () => {
    const message = `Olá! Tenho interesse no ${isProduct ? 'produto' : 'oportunidade'}: ${item.title}. ${item.subtitle ? `(${item.subtitle})` : ''} Poderia me fornecer mais informações?`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/5511981442518?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const handleBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-navy-500">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-white hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Carousel */}
          <div className="relative h-96 bg-gray-100">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-700" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">Sem imagem disponível</span>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-navy-500 text-white">
                {item.category.toUpperCase()}
              </Badge>
            </div>

            {/* Type Badge */}
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-white/90">
                {isProduct ? 'Produto' : 'Oportunidade'}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              {item.subtitle && (
                <p className="text-xl text-gray-600">{item.subtitle}</p>
              )}
            </div>

            <div className="mb-6">
              <div className="text-4xl font-bold text-gold-500 mb-4">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">
                  Status: {item.status === 'em_negociacao' ? 'Em negociação' :
                           item.status === 'active' ? 'Ativo' :
                           item.status.charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                </Badge>
                {isProduct && item.stock !== undefined && (
                  <Badge variant="outline">
                    Estoque: {item.stock}
                  </Badge>
                )}
              </div>

              {item.location && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-4">
                  <MapPin className="h-4 w-4" /> {item.location}
                </p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Descrição</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleWhatsApp}
                className="w-4/5 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}