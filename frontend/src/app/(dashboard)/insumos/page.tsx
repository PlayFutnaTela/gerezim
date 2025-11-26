import React from 'react'
import InsumosList from '@/components/insumos/insumos-list'
import InsumoForm from '@/components/insumos/insumo-form'
import { createClient } from '@/lib/supabase/server'
import { requireAdminOrRedirect } from '@/lib/server-admin'
import InsumosPageClient from '@/components/insumos/insumos-page-client'

export default async function InsumosPage() {
    const supabase = createClient()

    // Only admins can access insumos
    await requireAdminOrRedirect(supabase)

    return <InsumosPageClient />
}
