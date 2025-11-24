import React from "react"
import { User as UserIcon } from "lucide-react"

export default function Topbar({ user }: { user: any }) {
  const name = user?.user_metadata?.full_name || user?.email || "Usuário"

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-black text-white h-14 flex items-center px-6 justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-slate-700/20 p-1">
          <UserIcon className="h-5 w-5 text-white" />
        </div>

        <div>
          <div className="text-sm font-semibold text-white">{name}</div>
          {user?.email && <div className="text-xs text-white/70">{user.email}</div>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-white text-sm hover:text-white/80">
            Sair
          </button>
        </form>
      </div>
    </header>
  )
}
