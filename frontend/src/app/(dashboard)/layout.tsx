import Sidebar from "@/components/sidebar"
import Topbar from "@/components/topbar"
import ShowToast from "@/components/show-toast"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.warn('DashboardLayout: no user session — redirecting to login')
    return redirect(`/login?message=${encodeURIComponent('Sessão inválida ou expirada. Faça login novamente.')}`)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      {/* main content shifted right by sidebar width (12.8rem) */}
      <main className="flex-1 bg-slate-50 ml-[12.8rem]">
        <div className="flex flex-col min-h-screen">
          <Topbar user={user} />
          <div className="flex-1 overflow-y-auto p-8">
            <ShowToast />
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
