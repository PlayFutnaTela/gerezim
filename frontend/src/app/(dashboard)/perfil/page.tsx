"use client"

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User } from '@supabase/supabase-js'
import { UserCircle, Mail, Calendar, Shield, Save, Loader2 } from 'lucide-react'
import ChangePasswordModal from '@/components/change-password-modal'
import { Button } from '@/components/ui/button'
import AvatarUpload from '@/components/avatar-upload'
import { toast } from 'sonner'

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [bio, setBio] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [role, setRole] = useState<'user' | 'adm'>('user')

    const supabase = createClient()

    const getProfile = useCallback(async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUser(user)

                const { data, error, status } = await supabase
                    .from('profiles')
                    .select(`full_name, phone, city, state, bio, avatar_url, role`)
                    .eq('id', user.id)
                    .single()

                if (error && status !== 406) {
                    throw error
                }

                if (data) {
                    setFullName(data.full_name || '')
                    setPhone(data.phone || '')
                    setCity(data.city || '')
                    setState(data.state || '')
                    setBio(data.bio || '')
                    setAvatarUrl(data.avatar_url)
                    if (data.role) setRole(data.role)
                }
            }
        } catch (error) {
            console.error('Error loading user data!', error)
            // Friendly toast for the user
            try { toast.error('Não foi possível carregar seus dados — confira o console para detalhes.') } catch (e) { }
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        getProfile()
    }, [getProfile])

    async function updateProfile() {
        try {
            setSaving(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('No user')

            const updates = {
                id: user.id,
                full_name: fullName,
                phone,
                city,
                state,
                bio,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) throw error

            toast.success("Perfil atualizado com sucesso!")
        } catch (error) {
            toast.error("Não foi possível salvar suas informações.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
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

            <div className="grid gap-6 md:grid-cols-3">
                {/* Coluna da Esquerda - Avatar e Info Básica */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <AvatarUpload
                                uid={user.id}
                                url={avatarUrl}
                                onUpload={(url) => {
                                    setAvatarUrl(url)
                                }}
                            />
                            <h3 className="mt-4 font-semibold text-lg text-navy-900 flex items-center gap-2">
                                {fullName || 'Usuário'}
                                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gold-300 text-white font-semibold">{role.toUpperCase()}</span>
                            </h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna da Direita - Formulários */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5 text-blue-600" />
                                Informações Pessoais
                            </CardTitle>
                            <CardDescription>Atualize seus dados públicos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nome Completo</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome completo"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    type="tel"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    Email
                                </Label>
                                <Input id="email" value={user.email} disabled className="bg-gray-50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input
                                        id="city"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Sua cidade"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">Estado</Label>
                                    <Input
                                        id="state"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        placeholder="UF (ex: SP)"
                                        maxLength={2}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Conte um pouco sobre você..."
                                    className="resize-none h-24"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={updateProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

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
                                    <ChangePasswordModal
                                        trigger={
                                            <Button variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-800">
                                                Alterar Senha
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Calendar className="h-4 w-4" />
                                    Membro desde: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </Label>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
