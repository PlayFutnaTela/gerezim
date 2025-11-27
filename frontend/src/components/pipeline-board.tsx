"use client"

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import AddOpportunityModal from './add-opportunity-modal'
import EditOpportunityModal from './edit-opportunity-modal'
import { User, Package } from 'lucide-react'

type Opportunity = {
    id: string
    title: string
    category: string
    value: number
    pipeline_stage: string
    created_at: string
    notes?: string
    contact_id?: string
    product_id?: string
    // Joined data
    contact_name?: string
    contact_avatar?: string
    product_images?: string[]
    product_title?: string
}

type Props = {
    initialOpportunities: Opportunity[]
}

const COLUMNS = [
    { id: 'Novo', title: 'Novo' },
    { id: 'Interessado', title: 'Interessado' },
    { id: 'Proposta enviada', title: 'Proposta Enviada' },
    { id: 'Negociação', title: 'Em Negociação' },
    { id: 'Finalizado', title: 'Finalizado' },
]

export default function PipelineBoard({ initialOpportunities }: Props) {
    const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities)
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
    const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)

    const supabase = createClient()

    // Load enriched data on mount
    React.useEffect(() => {
        refreshOpportunities()
    }, [])

    async function refreshOpportunities() {
        try {
            // Fetch opportunities with basic data
            const { data: opps, error } = await supabase
                .from('opportunities')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching opportunities:', error)
                return
            }

            if (!opps || opps.length === 0) {
                setOpportunities([])
                return
            }

            // Enrich each opportunity with contact and product data
            const enrichedData = await Promise.all(
                opps.map(async (opp: any) => {
                    let contact_name = null
                    let contact_avatar = null
                    let product_title = null
                    let product_images = null

                    // Fetch contact data if contact_id exists
                    if (opp.contact_id) {
                        const { data: contact } = await supabase
                            .from('contacts')
                            .select('name, user_id')
                            .eq('id', opp.contact_id)
                            .single()

                        if (contact) {
                            contact_name = contact.name

                            // Try to fetch avatar from profiles
                            if (contact.user_id) {
                                const { data: profile } = await supabase
                                    .from('profiles')
                                    .select('avatar_url')
                                    .eq('id', contact.user_id)
                                    .single()

                                if (profile?.avatar_url) {
                                    const { data: publicData } = supabase.storage
                                        .from('avatars')
                                        .getPublicUrl(profile.avatar_url)
                                    contact_avatar = publicData.publicUrl
                                }
                            }
                        }
                    }

                    // Fetch product data if product_id exists
                    if (opp.product_id) {
                        const { data: product } = await supabase
                            .from('products')
                            .select('title, images')
                            .eq('id', opp.product_id)
                            .single()

                        if (product) {
                            product_title = product.title
                            product_images = product.images
                        }
                    }

                    return {
                        ...opp,
                        contact_name,
                        contact_avatar,
                        product_title,
                        product_images,
                    }
                })
            )

            setOpportunities(enrichedData)
        } catch (error) {
            console.error('Error in refreshOpportunities:', error)
        }
    }

    function handleDragStart(e: React.DragEvent, oppId: string) {
        setDraggingId(oppId)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/html', oppId)
    }

    function handleDragEnd() {
        setDraggingId(null)
        setDragOverColumn(null)
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    function handleDragEnter(columnId: string) {
        setDragOverColumn(columnId)
    }

    function handleDragLeave() {
        setDragOverColumn(null)
    }

    async function handleDrop(e: React.DragEvent, targetStage: string) {
        e.preventDefault()
        setDragOverColumn(null)

        if (!draggingId) return

        const opportunity = opportunities.find(opp => opp.id === draggingId)
        if (!opportunity || opportunity.pipeline_stage === targetStage) {
            setDraggingId(null)
            return
        }

        // Optimistic UI update
        setOpportunities(prev =>
            prev.map(opp =>
                opp.id === draggingId
                    ? { ...opp, pipeline_stage: targetStage }
                    : opp
            )
        )

        try {
            const { error } = await supabase
                .from('opportunities')
                .update({ pipeline_stage: targetStage })
                .eq('id', draggingId)

            if (error) throw error

            toast.success(`Oportunidade movida para "${COLUMNS.find(c => c.id === targetStage)?.title}"`)
        } catch (error: any) {
            setOpportunities(prev =>
                prev.map(opp =>
                    opp.id === draggingId
                        ? { ...opp, pipeline_stage: opportunity.pipeline_stage }
                        : opp
                )
            )
            toast.error('Erro ao mover: ' + error.message)
        }

        setDraggingId(null)
    }

    function handleCardClick(e: React.MouseEvent, opp: Opportunity) {
        // Only open edit if not dragging
        if (!draggingId) {
            e.stopPropagation()
            setEditingOpportunity(opp)
        }
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>
                <p className="text-muted-foreground mt-1">
                    Arraste e solte os cards · Clique no + para criar · Clique no card para editar
                </p>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-4 h-full min-w-[1000px]">
                    {COLUMNS.map((col) => {
                        const columnOpportunities = opportunities.filter(
                            opp => opp.pipeline_stage === col.id
                        )

                        return (
                            <div
                                key={col.id}
                                className="w-80 flex-shrink-0 flex flex-col gap-4"
                                onDragOver={handleDragOver}
                                onDragEnter={() => handleDragEnter(col.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold text-sm text-slate-500 uppercase tracking-wider">
                                            {col.title}
                                        </div>
                                        <Badge variant="secondary" className="rounded-full">
                                            {columnOpportunities.length}
                                        </Badge>
                                    </div>
                                    <AddOpportunityModal
                                        columnId={col.id}
                                        columnTitle={col.title}
                                        onSuccess={refreshOpportunities}
                                    />
                                </div>

                                <div
                                    className={cn(
                                        "flex-1 bg-slate-100/50 rounded-lg p-3 space-y-3 transition-all",
                                        dragOverColumn === col.id && "bg-blue-100 ring-2 ring-blue-400"
                                    )}
                                >
                                    {columnOpportunities.length === 0 ? (
                                        <div className="text-center text-sm text-slate-400 py-8">
                                            Nenhuma oportunidade
                                        </div>
                                    ) : (
                                        columnOpportunities.map((opp) => {
                                            const productThumbnail = opp.product_images?.[0]
                                            const hasAvatar = !!opp.contact_avatar

                                            return (
                                                <Card
                                                    key={opp.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, opp.id)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={(e) => handleCardClick(e, opp)}
                                                    className={cn(
                                                        "cursor-pointer transition-all duration-200 relative overflow-hidden",
                                                        "shadow-[0_2px_8px_rgba(197,154,0,0.2)]",
                                                        "hover:shadow-[0_4px_16px_rgba(197,154,0,0.35)] hover:-translate-y-1",
                                                        "active:cursor-grabbing",
                                                        draggingId === opp.id && "opacity-50 rotate-2"
                                                    )}
                                                >
                                                    {/* Product thumbnail as background */}
                                                    {productThumbnail && (
                                                        <div
                                                            className="absolute inset-0 bg-cover bg-center opacity-5"
                                                            style={{ backgroundImage: `url(${productThumbnail})` }}
                                                        />
                                                    )}

                                                    <CardHeader className="p-4 pb-2 relative z-10">
                                                        <div className="flex justify-between items-start gap-2">
                                                            {/* Avatar */}
                                                            <div className="flex-shrink-0">
                                                                {hasAvatar ? (
                                                                    <img
                                                                        src={opp.contact_avatar}
                                                                        alt={opp.contact_name || 'Cliente'}
                                                                        className="w-10 h-10 rounded-full object-cover border-2 border-gold-300"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
                                                                        <User size={20} className="text-slate-400" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Category badge */}
                                                            <Badge variant="outline" className="text-[10px] flex-shrink-0">
                                                                {opp.category || 'Sem categoria'}
                                                            </Badge>
                                                        </div>

                                                        <CardTitle className="text-sm font-medium leading-tight mt-2">
                                                            {opp.title}
                                                        </CardTitle>

                                                        {opp.contact_name && (
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                {opp.contact_name}
                                                            </div>
                                                        )}
                                                    </CardHeader>

                                                    <CardContent className="p-4 pt-2 relative z-10">
                                                        <div className="text-sm font-bold text-slate-700">
                                                            {new Intl.NumberFormat('pt-BR', {
                                                                style: 'currency',
                                                                currency: 'BRL'
                                                            }).format(opp.value)}
                                                        </div>

                                                        {opp.notes && (
                                                            <div className="text-xs text-slate-500 mt-1 truncate">
                                                                📝 {opp.notes}
                                                            </div>
                                                        )}

                                                        {/* Product thumbnail preview */}
                                                        {productThumbnail && (
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <img
                                                                    src={productThumbnail}
                                                                    alt={opp.product_title || 'Produto'}
                                                                    className="w-12 h-12 rounded object-cover border border-slate-200"
                                                                />
                                                                {opp.product_title && (
                                                                    <div className="text-xs text-slate-600 truncate flex-1">
                                                                        {opp.product_title}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {!productThumbnail && opp.product_title && (
                                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                                                <Package size={14} />
                                                                <span className="truncate">{opp.product_title}</span>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Edit Modal */}
            {editingOpportunity && (
                <EditOpportunityModal
                    opportunity={editingOpportunity}
                    isOpen={!!editingOpportunity}
                    onClose={() => setEditingOpportunity(null)}
                    onSuccess={() => {
                        refreshOpportunities()
                        setEditingOpportunity(null)
                    }}
                />
            )}
        </div>
    )
}
