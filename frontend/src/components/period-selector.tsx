"use client"

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function PeriodSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams?.get('range') || '30d'

  const onChange = (value: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (value === 'all') {
      params.delete('range')
    } else {
      params.set('range', value)
    }
    const url = `${window.location.pathname}?${params.toString()}`
    router.replace(url)
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">Período</label>
      <Select value={current} onValueChange={onChange}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Últimos 7 dias</SelectItem>
          <SelectItem value="30d">Últimos 30 dias</SelectItem>
          <SelectItem value="90d">Últimos 90 dias</SelectItem>
          <SelectItem value="365d">Últimos 12 meses</SelectItem>
          <SelectItem value="all">Todo o período</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
