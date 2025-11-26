import Link from "next/link"
import { LayoutDashboard, Briefcase, Users, KanbanSquare, BarChart3, LogOut, ShoppingCart, User } from "lucide-react"
import { Button } from "@/components/ui/button"

import Image from "next/image"

export default function Sidebar() {
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
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/90 transition-all hover:text-white hover:bg-navy-600"
          >
            <LayoutDashboard className="h-4 w-4 text-gold-300" />
            Dashboard
          </Link>
          <Link
            href="/oportunidades"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
          >
            <Briefcase className="h-4 w-4 text-gold-300" />
            Oportunidades
          </Link>
          <Link
            href="/produtos"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
          >
            <ShoppingCart className="h-4 w-4 text-gold-300" />
            Produtos
          </Link>
          <Link
            href="/contatos"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
          >
            <Users className="h-4 w-4 text-gold-300" />
            Contatos
          </Link>
          <Link
            href="/pipeline"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
          >
            <KanbanSquare className="h-4 w-4 text-gold-300" />
            Pipeline
          </Link>
          <Link
            href="/relatorios"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition-all hover:text-white hover:bg-navy-600"
          >
            <BarChart3 className="h-4 w-4 text-gold-300" />
            Relatórios
          </Link>
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
