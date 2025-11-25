"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { User } from '@supabase/supabase-js'
import { UserCircle, Mail, Calendar, Shield } from 'lucide-react'
import ChangePasswordModal from '@/components/change-password-modal'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        getUser()
    }, [supabase])

    if (loading) {
        return <div className="p-8">Carregando perfil...</div>
    }

    if (!user) {
        return <div className="p-8">Usuário não encontrado.</div>
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-navy-900">Meu Perfil</h1>
                <p className="text-gray-500 mt-2">Gerencie suas informações pessoais e segurança.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Cartão de Informações Pessoais */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-blue-600" />
                            Informações da Conta
                        </CardTitle>
                        <CardDescription>Detalhes da sua conta no sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                Email
                            </Label>
                            <Input id="email" value={user.email} disabled className="bg-gray-50" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="created_at" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                Membro desde
                            </Label>
                            <Input
                                id="created_at"
                                value={new Date(user.created_at).toLocaleDateString('pt-BR')}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Cartão de Segurança */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Segurança
                        </CardTitle>
                        <CardDescription>Gerencie sua senha e acesso</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 className="font-medium text-blue-900 mb-1">Senha</h4>
                            <p className="text-sm text-blue-700 mb-4">
                                Recomendamos alterar sua senha periodicamente para manter sua conta segura.
                            </p>
                            <div className="flex justify-start">
                                <div className="[&>button]:bg-white [&>button]:text-blue-700 [&>button]:border [&>button]:border-blue-200 [&>button]:hover:bg-blue-50 [&>button]:shadow-sm">
                                    <ChangePasswordModal />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
