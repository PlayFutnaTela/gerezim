"use client"

import { TextRotate } from "@/style/efect-hover-text"

export default function HeroHover() {
  return (
    <section className="w-full flex flex-col items-center justify-center py-20 bg-white">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-center">
        <TextRotate
          texts={["Oportunidades únicas", "Negócios exclusivos", "Seu próximo investimento", "Conquiste seus sonhos"]}
          rotationInterval={3000}
          mainClassName="text-blue-600"
          splitBy="words"
          staggerDuration={0.12}
        />
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-2xl">
        Descubra, negocie e realize grandes negócios com a Gerezim.
      </p>
    </section>
  )
}
