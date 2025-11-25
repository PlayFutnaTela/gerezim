"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  '/slide-desktop/1.png',
  '/slide-desktop/2.png',
  '/slide-desktop/3.png',
  '/slide-desktop/4.png',
  '/slide-desktop/5.png',
]

export default function ImageHeroCarousel({ interval = 10000 }: { interval?: number }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval)
    return () => clearInterval(id)
  }, [interval])

  const prev = () => setIndex(i => (i - 1 + slides.length) % slides.length)
  const next = () => setIndex(i => (i + 1) % slides.length)

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl relative rounded-xl overflow-hidden shadow-lg bg-gold-50">
        <div className="w-full h-44 sm:h-56 md:h-64 lg:h-72 xl:h-80 relative flex items-center justify-center bg-gold-50">
          <AnimatePresence initial={false} mode="wait">
            <motion.img
              key={slides[index]}
              src={slides[index]}
              alt={`slide-${index + 1}`}
              className="max-w-full max-h-full object-contain w-full h-full"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.7 }}
            />
          </AnimatePresence>
        </div>

        {/* Controls */}
          <button
          onClick={prev}
          aria-label="Prev slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2.5 shadow transition text-gold-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

          <button
          onClick={next}
          aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2.5 shadow transition text-gold-500"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2.5 bg-gold-300/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all duration-300 ${i === index ? 'w-3 h-3 bg-gold-500' : 'w-2 h-2 bg-white/70 hover:bg-white'}`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
