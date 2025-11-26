import { createClient } from "@/lib/supabase/server"
import { requireAdminOrRedirect } from '@/lib/server-admin'
import PipelineBoard from '@/components/pipeline-board'

export default async function PipelinePage() {
  const supabase = createClient()

  // Ensure only admins can access pipeline
  await requireAdminOrRedirect(supabase)

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })

  return <PipelineBoard initialOpportunities={opportunities || []} />
}
