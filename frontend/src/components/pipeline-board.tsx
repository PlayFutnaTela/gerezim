"use client"

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import AddOpportunityModal from './add-opportunity-modal'

type Opportunity = {
    id: string
    title: string
    category: string
    value: number
    location?: string
    pipeline_stage: string
    created_at: string
    notes?: string
    contact_id?: string
    product_id?: string
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

    const supabase = createClient()

    async function refreshOpportunities() {
        const { data } = await supabase
            .from('opportunities')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setOpportunities(data)
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
            // Update in database
            const { error } = await supabase
                .from('opportunities')
                .update({ pipeline_stage: targetStage })
                .eq('id', draggingId)

            if (error) throw error

            toast.success(`Oportunidade movida para "${COLUMNS.find(c => c.id === targetStage)?.title}"`)
        } catch (error: any) {
            // Revert on error
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

    return (
        <div className="h-full flex flex-col space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>
                <p className="text-muted-foreground mt-1">
                    Arraste e solte os cards para mudar o estágio ou clique no + para criar nova oportunidade
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
                                        columnOpportunities.map((opp) => (
                                            <Card
                                                key={opp.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, opp.id)}
                                                onDragEnd={handleDragEnd}
                                                className={cn(
                                                    "cursor-grab active:cursor-grabbing hover:shadow-md transition-all",
                                                    draggingId === opp.id && "opacity-50 rotate-2"
                                                )}
                                            >
                                                <CardHeader className="p-4 pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {opp.category || 'Sem categoria'}
                                                        </Badge>
                                                    </div>
                                                    <CardTitle className="text-sm font-medium leading-tight mt-2">
                                                        {opp.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-2">
                                                    <div className="text-sm font-bold text-slate-700">
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(opp.value)}
                                                    </div>
                                                    {opp.notes && (
                                                        <div className="text-xs text-slate-500 mt-1 truncate">
                                                            {opp.notes}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
