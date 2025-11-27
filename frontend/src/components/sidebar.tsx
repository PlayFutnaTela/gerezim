import Link from "next/link"
import { LayoutDashboard, Briefcase, Users, KanbanSquare, BarChart3, LogOut, ShoppingCart, User, FileText, Heart, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

import Image from "next/image"
import { createClient } from '@/lib/supabase/server'

// Sidebar is a server component — we'll check the session/profile to hide admin-only links for non-admin users
const getProfileRole = async () => {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    return profile?.role || null
  } catch (err) {
    console.error('sidebar: failed to read profile role', err)
    return null
  }
}

export default async function Sidebar() {
  const role = await getProfileRole()
  const isAdmin = role === 'adm'
  return (
    // sidebar fixed to the left of the viewport
    <div className="fixed inset-y-0 left-0 w-[12.8rem] flex flex-col border-r bg-navy-500 text-white border-navy-700">
      <div className="flex h-14 items-center border-b border-navy-700 px-4 font-semibold tracking-tight text-white">
        {/* Logo (left) and name (right) - name increased by 20% */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Gerezim" width={40} height={40} style={{ height: 'auto' }} className="object-contain rounded" />
          <div className="text-[1.2rem] font-semibold">Gerezim</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {isAdmin && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/90 transition-all hover:text-white hover:bg-navy-600"
            >
              <LayoutDashboard className="h-4 w-4 text-gold-300" />
              Dashboard
            </Link>
          )}
          <Link
            href="/oportunidades"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
          >
            <Briefcase className="h-4 w-4 text-gold-300" />
            Oportunidades
          </Link>
          <Link
            href="/favoritos"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
          >
            <Heart className="h-4 w-4 text-gold-300" />
            Favoritos
          </Link>
          {isAdmin && (
            <Link
              href="/produtos"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
            >
              <ShoppingCart className="h-4 w-4 text-gold-300" />
              Produtos
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/insumos"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
            >
              <FileText className="h-4 w-4 text-gold-300" />
              Insumos
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/contatos"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
            >
              <Users className="h-4 w-4 text-gold-300" />
              Contatos
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/pipeline"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
            >
              <KanbanSquare className="h-4 w-4 text-gold-300" />
              Pipeline
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/relatorios"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
            >
              <BarChart3 className="h-4 w-4 text-gold-300" />
              Relatórios
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/concierge"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
            >
              <MessageSquare className="h-4 w-4 text-gold-300" />
              Concierge GME
            </Link>
          )}
          <Link
            href="/perfil"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
          >
            <User className="h-4 w-4 text-gold-300" />
            Perfil
          </Link>
        </nav>
      </div>
      <div className="border-t border-navy-700 p-4">
        <form action="/auth/signout" method="post">
          <Button variant="ghost" className="w-full justify-start gap-3 text-white/80 hover:text-white">
            <LogOut className="h-4 w-4 text-gold-300" />
            Sair
          </Button>
        </form>
      </div>
    </div>
  )
}
