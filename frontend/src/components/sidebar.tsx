import Link from "next/link"
import { LayoutDashboard, Briefcase, Users, KanbanSquare, BarChart3, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Sidebar() {
  return (
    <div className="flex h-screen w-[12.8rem] flex-col border-r bg-slate-50/50">
      <div className="flex h-14 items-center border-b px-6 font-semibold tracking-tight">
        Intermediador
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 transition-all hover:text-slate-900 hover:bg-slate-100"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/oportunidades"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100"
          >
            <Briefcase className="h-4 w-4" />
            Oportunidades
          </Link>
          <Link
            href="/contatos"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100"
          >
            <Users className="h-4 w-4" />
            Contatos
          </Link>
          <Link
            href="/pipeline"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100"
          >
            <KanbanSquare className="h-4 w-4" />
            Pipeline
          </Link>
          <Link
            href="/relatorios"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100"
          >
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </Link>
        </nav>
      </div>
      <div className="border-t p-4">
        <form action="/auth/signout" method="post">
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-500">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
    </div>
  )
}
