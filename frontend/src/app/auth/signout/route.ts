import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = createClient()

  console.log('Tentando logout')
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Erro no logout:', error.message, error)
    revalidatePath('/', 'layout')
    // redirect to login with error message
    redirect(`/login?message=${encodeURIComponent('Erro ao realizar logout: ' + error.message)}`)
  } else {
    console.log('Logout bem-sucedido')
    revalidatePath('/', 'layout')
    redirect(`/login?message=${encodeURIComponent('Logout realizado com sucesso.')}`)
  }
}