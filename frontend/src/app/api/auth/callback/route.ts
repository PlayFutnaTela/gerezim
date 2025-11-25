import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    console.log('Tentando trocar código por sessão')
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      console.log('Sessão criada com sucesso')
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // We can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('Erro ao trocar código por sessão:', error.message)
    }
  }

  // return the user to an error page with instructions
  console.log('Falha na autenticação, redirecionando para login')
  return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`)
}