import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      return redirect("/login?message=Não foi possível criar a conta")
    }

    return redirect("/login?message=Verifique o email para continuar o processo de cadastro")
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/background-login.jpg')" }}
    >
      {/* Overlay to improve readability over the image */}
      <div className="absolute inset-0 bg-black/50" />

      <Card className="w-full max-w-md relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl">Entrar na Plataforma</CardTitle>
          <CardDescription>
            Digite seu email e senha para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signIn} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {searchParams?.message && (
              <p className="text-sm text-red-500">{searchParams.message}</p>
            )}
            <Button className="w-full" type="submit">Entrar</Button>
            <Button className="w-full" variant="outline" formAction={signUp}>Criar Conta</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
