"use client"

import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ShaderPlane, EnergyRing } from './shader1'

export default function ShaderBg({
  color1 = '#ffffff',
  color2 = '#C59A00',
  className = ''
}: { color1?: string; color2?: string; className?: string }) {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null)

  useEffect(() => {
    // Detect WebGL availability in the client
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setHasWebGL(!!ctx)
    } catch (e) {
      setHasWebGL(false)
    }
  }, [])

  // While detection is running, render nothing (or a lightweight placeholder)
  if (hasWebGL === null) return null

  // Fallback to static image background if WebGL not supported
  if (!hasWebGL) {
    return (
      <div
        aria-hidden
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
          backgroundImage: "url('/BG - GEREZIM - TELA DE LOGIN.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.6
        }}
      />
    )
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight intensity={0.5} position={[5, 5, 5]} />

        {/* A single large plane that fills the view */}
        <ShaderPlane position={[0, 0, 0]} color1={color1} color2={color2} />

        {/* Gentle energy ring for subtle motion */}
        <EnergyRing radius={1.8} position={[0, 0, 0.2]} />

      </Canvas>
    </div>
  )
}
