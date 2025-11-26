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
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  } catch (error) {
    console.log('Error loading profile in topbar')
  }

  // Determinar o nome a ser exibido
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário'

  // URL do avatar do Storage
  let avatarUrl = null
  if (profile?.avatar_url) {
    const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url)
    avatarUrl = data.publicUrl
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white h-16 flex items-center px-6 justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-blue-100">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={displayName} />
          ) : (
            <AvatarFallback className="bg-blue-600 text-white font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <div>
          <div className="text-sm font-semibold text-gray-900">{displayName}</div>
          {user?.email && <div className="text-xs text-gray-500">{user.email}</div>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <form action="/auth/signout" method="post">
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
    </header>
  )
}
