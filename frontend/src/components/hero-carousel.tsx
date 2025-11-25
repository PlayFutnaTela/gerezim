"use client"

import React, { useEffect, useState } from "react"

type Slide = { id: string; image: string }

const slides: Slide[] = [
  { id: "1", image: "/background-login.jpg" },
  { id: "2", image: "/logo.png" },
  { id: "3", image: "/background-login.jpg" },
]

export default function HeroCarousel({ interval = 5000 }: { interval?: number }) {
  const [index, setIndex] = useState<number>(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval)
    return () => clearInterval(id)
  }, [interval])

  const go = (i: number) => setIndex((i + slides.length) % slides.length)

  return (
    <div className="w-full py-6 px-4 sm:px-6">
      <div className="w-full">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-500">
          {/* track */}
          <div
            className="flex transition-transform duration-700"
            style={{ transform: `translateX(-${index * 100}%)`, width: `${slides.length * 100}%` }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className="flex-shrink-0 w-full">
                <div className="w-full h-40 sm:h-56 md:h-72 lg:h-80 xl:h-96 flex items-center justify-center overflow-hidden">
                  <img src={slide.image} alt="slide" className="w-full h-full object-cover object-center" />
                </div>
              </div>
            ))}
          </div>

          {/* controls inside the centered container */}
          <div className="absolute inset-y-0 left-3 flex items-center z-10">
            <button
              onClick={() => go(index - 1)}
              className="bg-white/90 text-slate-800 rounded-full p-1.5 hover:bg-white border border-transparent shadow"
              aria-label="Anterior"
            >
              ‹
            </button>
          </div>

          <div className="absolute inset-y-0 right-3 flex items-center z-10">
            <button
              onClick={() => go(index + 1)}
              className="bg-white/90 text-slate-800 rounded-full p-1.5 hover:bg-white border border-transparent shadow"
              aria-label="Próximo"
            >
              ›
            </button>
          </div>

          {/* indicators (outside the track) */}
          <div className="flex items-center gap-2 mt-3 justify-center pt-4 pb-4">
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
    </div>
  )
}
