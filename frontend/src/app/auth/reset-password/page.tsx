"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ResetPasswordModal from '@/components/reset-password-modal'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
    const [isOpen, setIsOpen] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // Se não houver sessão, redireciona para login
                router.push('/login?message=Sessão expirada. Por favor, solicite a redefinição novamente.')
            } else {
                setCheckingSession(false)
                setIsOpen(true)
            }
        }

        checkSession()
    }, [router, supabase])

    const handleClose = () => {
        // Se fechar o modal sem redefinir, redireciona para o dashboard (já que está logado) ou login
        router.push('/dashboard')
    }

    const handleSuccess = () => {
        // Após sucesso, redireciona para o dashboard
        router.push('/dashboard')
    }

    if (checkingSession) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Verificando sessão...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ResetPasswordModal
                isOpen={isOpen}
                onClose={handleClose}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
