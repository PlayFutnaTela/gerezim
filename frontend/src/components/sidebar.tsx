import Link from "next/link"
import { LayoutDashboard, Briefcase, Users, KanbanSquare, BarChart3, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Sidebar() {
  return (
    <div className="flex h-screen w-[12.8rem] flex-col border-r bg-navy-500 text-white border-navy-700">
      <div className="flex h-14 items-center border-b border-navy-700 px-6 font-semibold tracking-tight text-white">
        Gerezim
      </div>
      <div className="flex-1 overflow-auto py-4">
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
