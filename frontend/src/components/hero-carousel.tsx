"use client"

import React, { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Slide = { id: string; desktopImage: string; mobileImage: string }

const slides: Slide[] = [
  { id: "1", desktopImage: "/slide-desktop/1.svg", mobileImage: "/slide-mobile/1.svg" },
  { id: "2", desktopImage: "/slide-desktop/2.svg", mobileImage: "/slide-mobile/2.svg" },
  { id: "3", desktopImage: "/slide-desktop/3.svg", mobileImage: "/slide-mobile/3.svg" },
  { id: "4", desktopImage: "/slide-desktop/4.svg", mobileImage: "/slide-mobile/4.svg" },
  { id: "5", desktopImage: "/slide-desktop/5.svg", mobileImage: "/slide-mobile/5.svg" },
]

export default function HeroCarousel({ interval = 5000 }: { interval?: number }) {
  const [index, setIndex] = useState<number>(0)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    // Check if mobile on initial render
    setIsMobile(window.innerWidth < 768)

    // Listen for window resize
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval)
    return () => clearInterval(id)
  }, [interval])

  const go = (i: number) => setIndex((i + slides.length) % slides.length)

  if (!mounted) return null

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg bg-gray-100">
        {/* Carousel Track */}
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)`, width: `${slides.length * 100}%` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="flex-shrink-0 w-full">
              {/* Image Container - 267px em desktop */}
              <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-[267px] flex items-center justify-center bg-gray-100">
                <img
                  src={isMobile ? slide.mobileImage : slide.desktopImage}
                  alt={`slide-${slide.id}`}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {slides.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={() => go(index - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/85 hover:bg-white text-navy-500 rounded-full p-2.5 shadow-lg transition-all duration-200 hover:shadow-xl"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={3} />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => go(index + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/85 hover:bg-white text-navy-500 rounded-full p-2.5 shadow-lg transition-all duration-200 hover:shadow-xl"
              aria-label="Próximo slide"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={3} />
            </button>
          </>
        )}

        {/* Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2.5 bg-black/35 backdrop-blur-sm px-4 py-2.5 rounded-full">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === index
                    ? "w-3 h-3 bg-gold-500"
                    : "w-2 h-2 bg-white/70 hover:bg-white cursor-pointer"
                }`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
