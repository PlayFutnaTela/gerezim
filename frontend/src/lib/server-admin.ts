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
    redirect('/login')
  }

  // Fetch role from profiles - allowed since this is checking the current user's profile
  const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (error) {
    // If profile read fails treat as unauthorized
    console.error('requireAdminOrRedirect: error reading profile', error)
    redirect('/login')
  }

  if (!profile || profile.role !== 'adm') {
    // Not an admin — redirect to main oportunidades page
    redirect('/oportunidades')
  }

  return { user, profile }
}

export default requireAdminOrRedirect
