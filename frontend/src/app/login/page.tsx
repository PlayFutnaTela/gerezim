import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string; forgot?: string }
}) {
  const signIn = async (formData: FormData) => {
    "use server"

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect("/login?message=Não foi possível autenticar o usuário")
    }

    return redirect("/dashboard")
  }

  const signUp = async (formData: FormData) => {
    "use server"

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      },
    })

    if (error) {
      return redirect("/login?message=Não foi possível criar a conta")
    }

    return redirect("/login?message=Verifique o email para continuar o processo de cadastro")
  }

  const forgotPassword = async (formData: FormData) => {
    "use server"

    const email = formData.get("email") as string
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    })

    if (error) {
      return redirect("/login?message=Não foi possível enviar o email de recuperação")
    }

    return redirect("/login?message=Email de recuperação enviado. Verifique sua caixa de entrada.")
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
            <form action={forgotPassword} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              {searchParams?.message && (
                <p className="text-sm text-red-500">{searchParams.message}</p>
              )}
              <Button className="w-full" type="submit">Enviar Instruções</Button>
              <Button className="w-full" variant="outline" type="button" onClick={() => window.history.back()}>Voltar</Button>
            </form>
          ) : (
            <form action={signIn} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="text-center text-sm">
                <a href="/login?forgot=true" className="text-blue-600 hover:underline">Esqueceu sua senha?</a>
              </div>
              {searchParams?.message && (
                <p className="text-sm text-red-500">{searchParams.message}</p>
              )}
              <Button className="w-full" type="submit">Entrar</Button>
              <Button className="w-full" variant="outline" formAction={signUp}>Criar Conta</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
