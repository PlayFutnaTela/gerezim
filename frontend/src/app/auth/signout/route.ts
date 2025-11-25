import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = createClient()

  console.log('Tentando logout')
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Erro no logout:', error.message)
  } else {
    console.log('Logout bem-sucedido')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}