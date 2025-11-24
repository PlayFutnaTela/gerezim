"use client"

import React, { useEffect, useState } from "react"

type Slide = {
  id: string
  title?: string
  subtitle?: string
  image: string
}

const slides: Slide[] = [
  { id: "1", title: "Novas Promoções", subtitle: "Ofertas especiais por tempo limitado", image: "/background-login.jpg" },
  { id: "2", title: "Destaque Premium", subtitle: "Itens exclusivos para clientes Premium", image: "/logo.png" },
  { id: "3", title: "Serviços de Concierge", subtitle: "Atendimento personalizado para clientes especiais", image: "/background-login.jpg" },
]

export default function HeroCarousel({ interval = 5000 }: { interval?: number }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, interval)
    return () => clearInterval(id)
  }, [interval])

  const go = (i: number) => setIndex((i + slides.length) % slides.length)

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="relative">
        {/* Slide container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-500">
          <div
            className="whitespace-nowrap transition-transform duration-700"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((s) => (
              <div key={s.id} className="inline-block w-full align-top px-4 py-4 sm:px-6 sm:py-6">
                {/* image-only slide: image fills the slide container, centered and responsive */}
                <div className="w-full h-40 sm:h-56 md:h-72 lg:h-80 xl:h-96 flex items-center justify-center overflow-hidden rounded-2xl">
                  <img
                    src={s.image}
                    alt={s.title ?? "slide"}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute inset-y-0 left-3 flex items-center">
          <button
            onClick={() => go(index - 1)}
            className="bg-white/90 text-slate-800 rounded-full p-1.5 hover:bg-white border border-transparent shadow"
            aria-label="Anterior"
          >
            ‹
          </button>
        </div>

        <div className="absolute inset-y-0 right-3 flex items-center">
          <button
            onClick={() => go(index + 1)}
            className="bg-white/90 text-slate-800 rounded-full p-1.5 hover:bg-white border border-transparent shadow"
            aria-label="Próximo"
          >
            ›
          </button>
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-2 mt-3 justify-center">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => go(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === index ? "bg-gold-500 w-4" : "bg-slate-300"}`}
              aria-label={`Ir para slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
