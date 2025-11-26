"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from 'sonner'
import LoginCarousel from '@/components/login-carousel'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string; forgot?: string }
}) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Show a toast if we were redirected to /login with a message explaining why
  React.useEffect(() => {
    if (searchParams?.message) {
      try { toast.error(searchParams.message) } catch (e) { console.warn('toast failed:', e) }
    }
  }, [searchParams?.message])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!email || !password) {
      toast.error('Preencha todos os campos')
      setLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (/Failed to fetch|NetworkError|ERR_NAME_NOT_RESOLVED/i.test(error.message)) {
          toast.error('Falha ao conectar ao servidor. Verifique sua conexão.')
        } else {
          toast.error('Email ou senha incorretos')
        }
      } else {
        toast.success('Login realizado com sucesso!')
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      toast.error('Erro inesperado no login.')
    }
    setLoading(false)
  }

  const signUp = async () => {
    setLoading(true)
    if (!email || !password) {
      toast.error('Preencha email e senha para criar conta')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) {
        toast.error('Erro ao criar conta: ' + error.message)
      } else {
        toast.success('Verifique o email para confirmar o cadastro')
      }
    } catch (err) {
      toast.error('Erro inesperado no cadastro')
    }
    setLoading(false)
  }

  const forgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!email) {
      toast.error('Digite seu email')
      setLoading(false)
      return
    }

    const supabase = createClient()
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/auth/reset-password`,
      })
      if (error) {
        toast.error('Erro ao enviar email de recuperação')
      } else {
        toast.success('Email de recuperação enviado. Verifique sua caixa de entrada.')
      }
    } catch (err) {
      toast.error('Erro inesperado na recuperação de senha')
    }
    setLoading(false)
  }

  const showForgotPassword = searchParams.forgot === 'true'

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/BG - GEREZIM - TELA DE LOGIN.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Centered Card Container */}
      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl">

        {/* Left Side - Carousel */}
        <div className="hidden lg:block lg:w-[65%] relative bg-black">
          <LoginCarousel />
          <div className="absolute top-8 left-8 z-20">
            {/* Optional: Add Logo here if needed */}
            {/* <img src="/logo.png" alt="Logo" className="h-8" /> */}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-[35%] flex items-center justify-center p-8 lg:p-12 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
            </div>

            {showForgotPassword ? (
              <form onSubmit={forgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <Button className="w-full h-11 bg-gold-500 hover:bg-gold-600 text-white" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </Button>

                <Button
                  className="w-full h-11"
                  variant="ghost"
                  type="button"
                  onClick={() => window.location.href = '/login'}
                >
                  Voltar para Login
                </Button>
              </form>
            ) : (
              <form onSubmit={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <a href="/login?forgot=true" className="text-sm font-medium text-gold-600 hover:text-gold-500 hover:underline">
                      Esqueceu a senha?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <Button className="w-full h-11 bg-gold-500 hover:bg-gold-600 text-white" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">
                        Ou
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-11"
                    variant="outline"
                    type="button"
                    onClick={signUp}
                    disabled={loading}
                  >
                    Criar Nova Conta
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
