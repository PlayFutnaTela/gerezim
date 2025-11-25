"use client"

import React from 'react'
import { Globe, Truck, Home, Users } from 'lucide-react'

export default function AreasOfOperation() {
  const items = [
    {
      Icon: Globe,
      title: 'Atuação Nacional',
      description: 'Cobertura em todo o Brasil com atendimento dedicado a compradores e vendedores.'
    },
    {
      Icon: Truck,
      title: 'Veículos',
      description: 'Intermediações e vendas de automóveis, motos e embarcações.'
    },
    {
      Icon: Home,
      title: 'Imóveis',
      description: 'Negociação de residências, terrenos e empreendimentos comerciais.'
    },
    {
      Icon: Users,
      title: 'Empresas & Ativos',
      description: 'Compra e venda de empresas, ativos e operações corporativas.'
    }
  ]

  return (
    <section className="w-full bg-gradient-to-tr from-white via-slate-50 to-white rounded-lg shadow-inner p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold">Áreas de Atuação</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Conheça as frentes de atuação da Gerezim — soluções personalizadas para cada tipo de negócio.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it, idx) => (
            <div key={idx} className="bg-white/80 border rounded-lg p-4 sm:p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-gold-50 text-gold-600 inline-flex items-center justify-center">
                  <it.Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold">{it.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{it.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
