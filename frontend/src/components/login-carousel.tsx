"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const slides = [
    '/slide-desktop/1.png',
    '/slide-desktop/2.png',
    '/slide-desktop/3.png',
    '/slide-desktop/4.png',
    '/slide-desktop/5.png',
]

export default function LoginCarousel({ interval = 5000 }: { interval?: number }) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval)
        return () => clearInterval(id)
    }, [interval])

    return (
        <div className="relative w-full h-full overflow-hidden bg-black">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slides[index]})` }}
                    />
                    <div className="absolute inset-0 bg-black/30" /> {/* Overlay for better text contrast if needed later */}
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
