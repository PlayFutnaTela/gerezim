import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ensures the current session belongs to an admin user.
 * If not authenticated, redirects to /login. If authenticated but not admin, redirects to /oportunidades.
 * Accepts a server-side Supabase client (createClient from src/lib/supabase/server).
 */
export async function requireAdminOrRedirect(supabase: SupabaseClient<any>) {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) {
    // No active session — probably expired or user cleared cookies.
    console.warn('requireAdminOrRedirect: no active user session found (user is null) - redirecting to login')
    redirect(`/login?message=${encodeURIComponent('Sessão expirada ou usuário não autenticado. Faça login novamente.')}`)
  }

  // Fetch role from profiles - allowed since this is checking the current user's profile
  const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (error) {
    // If profile read fails treat as unauthorized
    console.error('requireAdminOrRedirect: error reading profile', error)
    redirect(`/login?message=${encodeURIComponent('Erro ao carregar perfil. Faça login novamente ou contate o suporte.')}`)
  }

  if (!profile || profile.role !== 'adm') {
    // Not an admin — redirect to main oportunidades page with clear reason
    console.info('requireAdminOrRedirect: authenticated user is not admin - redirecting to oportunidades')
    redirect(`/oportunidades?message=${encodeURIComponent('Acesso negado: painel reservado apenas para administradores.')}`)
  }

  return { user, profile }
}

export default requireAdminOrRedirect
