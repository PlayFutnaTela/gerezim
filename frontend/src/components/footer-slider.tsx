"use client"

import React from 'react'
import { InfiniteSlider } from '@/style/carrosel-infinite'

export default function FooterSlider() {
  const images = [
    '/slide-desktop/2.png',
    '/slide-desktop/3.png',
    '/slide-desktop/4.png',
    '/slide-desktop/5.png',
  ]

  return (
    <footer className="h-16 flex items-center justify-center">
      <div className="flex-1 w-full">
        <InfiniteSlider className="w-full" gap={24} duration={20} durationOnHover={5}>
          {images.map((src, idx) => (
            <div key={idx} className="flex items-center justify-center px-2">
              <img src={src} alt={`logo-${idx}`} className="h-10 object-contain" />
            </div>
          ))}
        </InfiniteSlider>
      </div>
    </footer>
  )
}
