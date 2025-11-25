"use client"

import React from 'react'
import { InfiniteSlider } from '@/style/carrosel-infinite'

export default function FooterSlider() {
  const images = [
    '/slide-footer/2.png',
    '/slide-footer/3.png',
    '/slide-footer/4.png',
    '/slide-footer/5.png',
    '/slide-footer/6.png',
    '/slide-footer/7.png',
    '/slide-footer/8.png',
    '/slide-footer/9.png',
    '/slide-footer/10.png',
    '/slide-footer/11.png',
    '/slide-footer/12.png',
    '/slide-footer/13.png',
    '/slide-footer/14.png',
    '/slide-footer/15.png',
    '/slide-footer/16.png',
    '/slide-footer/17.png',
    '/slide-footer/18.png',
    '/slide-footer/19.png',
    '/slide-footer/20.png',
    '/slide-footer/21.png',
    '/slide-footer/22.png',
    '/slide-footer/23.png',
    '/slide-footer/24.png',
    '/slide-footer/25.png',
    '/slide-footer/26.png',
    '/slide-footer/27.png',
    '/slide-footer/28.png',
    '/slide-footer/29.png',
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
