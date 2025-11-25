"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import { toast } from 'sonner'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string; forgot?: string }
}) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!email || !password) {
      toast.error('Preencha todos os campos')
      setLoading(false)
      return
    }

    console.log('Tentando login com email:', email)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Erro no login:', error.message)
      toast.error('Email ou senha incorretos')
    } else {
      console.log('Login bem-sucedido para:', email)
      toast.success('Login realizado com sucesso!')
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!email || !password) {
      toast.error('Preencha todos os campos')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    console.log('Tentando cadastro com email:', email)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      console.error('Erro no cadastro:', error.message)
      toast.error('Erro ao criar conta: ' + error.message)
    } else {
      console.log('Cadastro iniciado para:', email)
      toast.success('Verifique o email para confirmar o cadastro')
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

    console.log('Tentando recuperação de senha para:', email)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    })

    if (error) {
      console.error('Erro na recuperação de senha:', error.message)
      toast.error('Erro ao enviar email de recuperação')
    } else {
      console.log('Email de recuperação enviado para:', email)
      toast.success('Email de recuperação enviado. Verifique sua caixa de entrada.')
    }
    setLoading(false)
  }

  // Check if we're showing the forgot password form
  const showForgotPassword = searchParams.forgot === 'true'

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/background-login.jpg')" }}
    >
      {/* Overlay to improve readability over the image */}
      <div className="absolute inset-0 bg-black/50" />

      <Card className="w-full max-w-[22.4rem] relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl">
            {showForgotPassword ? "Recuperar Senha" : "Entrar na Plataforma"}
          </CardTitle>
          <CardDescription>
            {showForgotPassword
              ? "Digite seu email para receber instruções de recuperação de senha"
              : "Digite seu email e senha para acessar o sistema."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <form onSubmit={forgotPassword} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {searchParams?.message && (
                <p className="text-sm text-red-500">{searchParams.message}</p>
              )}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Instruções'}
              </Button>
              <Button className="w-full" variant="outline" type="button" onClick={() => window.location.href = '/login'}>Voltar</Button>
            </form>
          ) : (
            <form onSubmit={signIn} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="text-center text-sm">
                <a href="/login?forgot=true" className="text-blue-600 hover:underline">Esqueceu sua senha?</a>
              </div>
              {searchParams?.message && (
                <p className="text-sm text-red-500">{searchParams.message}</p>
              )}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button className="w-full" variant="outline" type="button" onClick={signUp} disabled={loading}>
                {loading ? 'Criando...' : 'Criar Conta'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
