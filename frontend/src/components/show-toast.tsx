"use client"

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function ShowToast() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const message = searchParams.get('message')

  useEffect(() => {
    if (success) {
      toast.success(success)
    } else if (message && !message.includes('Não foi possível')) {
      toast.info(message)
    } else if (message) {
      toast.error(message)
    }
  }, [success, message])

  return null
}