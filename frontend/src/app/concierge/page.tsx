import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConciergeLayoutClient from './layout-client'
import Sidebar from '@/components/sidebar'
import Topbar from '@/components/topbar'

export default async function ConciergePage() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'adm') {
        redirect('/dashboard')
    }

    // Fetch initial data
    const { data: folders } = await supabase
        .from('concierge_folders')
        .select('*')
        .order('position', { ascending: true })

    const { data: conversations } = await supabase
        .from('concierge_conversations')
        .select('*')
        .order('updated_at', { ascending: false })

    const { data: settings } = await supabase
        .from('concierge_settings')
        .select('*')

    const webhookUrl = settings?.find(s => s.key === 'webhook_url')?.value || ''

    return (
        <div className="flex min-h-screen bg-navy-900">
            <Sidebar />
            <main className="flex-1 ml-[12.8rem] flex flex-col h-screen overflow-hidden">
                <Topbar user={user} />
                <div className="flex-1 overflow-hidden">
                    <ConciergeLayoutClient
                        initialFolders={folders || []}
                        initialConversations={conversations || []}
                        initialWebhookUrl={webhookUrl}
                        user={user}
                    />
                </div>
            </main>
        </div>
    )
}
