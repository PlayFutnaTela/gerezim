"use client"

import { Button } from "@/components/ui/button"

export default function BackButton() {
  return (
    <Button className="w-full" variant="outline" type="button" onClick={() => window.history.back()}>
      Voltar
    </Button>
  )
}