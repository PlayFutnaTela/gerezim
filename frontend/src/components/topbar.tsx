import React from "react"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default async function Topbar({ user }: { user: any }) {
  const supabase = createClient()

  // Buscar dados do perfil
  let profile = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single()
    profile = data
  } catch (error) {
    console.error('Error loading profile in topbar', error)
  }

  // Determinar o nome a ser exibido
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário'

  // role reading (profile?.role can be 'user' | 'adm')
  const role = profile?.role || 'user'

  // URL do avatar do Storage
  let avatarUrl = null
  if (profile?.avatar_url) {
    const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url)
    avatarUrl = data.publicUrl
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-800 bg-black text-white h-16 flex items-center px-6 justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-gold-300">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={displayName} />
          ) : (
            <AvatarFallback className="bg-navy-600 text-gold-300 font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <div>
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <span>{displayName}</span>
            {role === 'adm' && (
              <span className="inline-block text-xs px-2 py-0.5 rounded text-white bg-gold-300 font-semibold">ADM</span>
            )}
          </div>
          {user?.email && <div className="text-xs text-white/70">{user.email}</div>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <form action="/auth/signout" method="post">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="gap-2 text-white hover:text-gold-300 hover:bg-navy-600"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
    </header>
  )
}
