"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Download, FileText, Search, Loader2, Folder, Grid, List, ChevronRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import FilePreviewModal from './file-preview-modal'

type Insumo = {
    id: string
    title: string
    description?: string
    file_url?: string
    file_type?: string
    file_size?: number
    created_at: string
    is_folder: boolean
    parent_id?: string
    product?: {
        title: string
    }
}

type Props = {
    refreshTrigger: number
    currentFolderId: string | null
    onFolderChange: (id: string | null) => void
}

export default function InsumosList({ refreshTrigger, currentFolderId, onFolderChange }: Props) {
    const [insumos, setInsumos] = useState<Insumo[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string, title: string }[]>([])
    const [previewFile, setPreviewFile] = useState<Insumo | null>(null)

    const supabase = createClient()

    useEffect(() => {
        fetchInsumos()
    }, [refreshTrigger, currentFolderId])

    // Update breadcrumbs when entering a folder
    useEffect(() => {
        async function updateBreadcrumbs() {
            if (!currentFolderId) {
                setBreadcrumbs([])
                return
            }

            const { data } = await supabase.from('insumos').select('id, title, parent_id').eq('id', currentFolderId).single()
            if (data) {
                setBreadcrumbs([{ id: data.id, title: data.title }])
            }
        }
        updateBreadcrumbs()
    }, [currentFolderId])

    async function fetchInsumos() {
        setLoading(true)
        let query = supabase
            .from('insumos')
            .select('*, product:products(title)')
            .order('is_folder', { ascending: false }) // Folders first
            .order('title', { ascending: true })

        if (currentFolderId) {
            query = query.eq('parent_id', currentFolderId)
        } else {
            query = query.is('parent_id', null)
        }

        const { data, error } = await query

        if (error) {
            toast.error('Erro ao carregar insumos: ' + error.message)
        } else {
            setInsumos(data || [])
        }
        setLoading(false)
    }

    async function handleDelete(item: Insumo) {
        if (!confirm(`Tem certeza que deseja excluir "${item.title}"?`)) return

        try {
            // 1. Delete from Storage if it's a file
            if (!item.is_folder && item.file_url) {
                const fileName = item.file_url.split('/').pop()
                if (fileName) {
                    const { error: storageError } = await supabase.storage
                        .from('insumos')
                        .remove([fileName])

                    if (storageError) console.error('Erro ao excluir do storage:', storageError)
                }
            }

            // 2. Delete from Database (Cascade will handle children if it's a folder)
            const { error: dbError } = await supabase
                .from('insumos')
                .delete()
                .eq('id', item.id)

            if (dbError) throw dbError

            toast.success('Item excluído com sucesso')
            setInsumos(insumos.filter(i => i.id !== item.id))
        } catch (error: any) {
            toast.error('Erro ao excluir: ' + error.message)
        }
    }

    // Drag and Drop Handlers
    function handleDragStart(e: React.DragEvent, item: Insumo) {
        e.dataTransfer.setData('itemId', item.id)
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault() // Allow drop
    }

    async function handleDrop(e: React.DragEvent, targetFolderId: string) {
        e.preventDefault()
        const itemId = e.dataTransfer.getData('itemId')
        if (!itemId || itemId === targetFolderId) return

        try {
            const { error } = await supabase
                .from('insumos')
                .update({ parent_id: targetFolderId })
                .eq('id', itemId)

            if (error) throw error

            toast.success('Item movido com sucesso!')
            fetchInsumos() // Refresh list
        } catch (error: any) {
            toast.error('Erro ao mover item: ' + error.message)
        }
    }

    const filteredInsumos = insumos.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product?.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    function formatBytes(bytes?: number) {
        if (!bytes) return '-'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="space-y-4">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                {/* Breadcrumbs / Navigation */}
                <div className="flex items-center gap-2 text-sm text-gray-600 w-full sm:w-auto overflow-hidden">
                    {currentFolderId && (
                        <Button variant="ghost" size="icon" onClick={() => onFolderChange(null)} className="shrink-0">
                            <ArrowLeft size={16} />
                        </Button>
                    )}
                    <div className="flex items-center gap-1 truncate">
                        <span
                            className={cn("cursor-pointer hover:underline", !currentFolderId && "font-bold text-gray-900")}
                            onClick={() => onFolderChange(null)}
                        >
                            Insumos
                        </span>
                        {breadcrumbs.map((crumb) => (
                            <React.Fragment key={crumb.id}>
                                <ChevronRight size={14} />
                                <span className="font-bold text-gray-900 truncate">{crumb.title}</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Search and View Toggle */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <div className="flex border rounded-md overflow-hidden shrink-0">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 hover:bg-gray-100", viewMode === 'list' ? "bg-gray-100 text-blue-600" : "text-gray-600")}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 hover:bg-gray-100", viewMode === 'grid' ? "bg-gray-100 text-blue-600" : "text-gray-600")}
                        >
                            <Grid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredInsumos.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed rounded-lg bg-gray-50 text-muted-foreground">
                    Pasta vazia
                </div>
            ) : viewMode === 'list' ? (
                // LIST VIEW
                <div className="border rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium w-8"></th>
                                <th className="px-4 py-3 font-medium">Nome</th>
                                <th className="px-4 py-3 font-medium hidden sm:table-cell">Produto</th>
                                <th className="px-4 py-3 font-medium hidden sm:table-cell">Tamanho</th>
                                <th className="px-4 py-3 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredInsumos.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 group"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragOver={(e) => item.is_folder && handleDragOver(e)}
                                    onDrop={(e) => item.is_folder && handleDrop(e, item.id)}
                                >
                                    <td className="px-4 py-3 text-gray-400">
                                        {item.is_folder ? <Folder size={20} className="fill-yellow-100 text-yellow-500" /> : <FileText size={20} />}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div
                                            className={cn("font-medium text-gray-900 cursor-pointer hover:underline", item.is_folder && "text-blue-600")}
                                            onClick={() => item.is_folder ? onFolderChange(item.id) : setPreviewFile(item)}
                                        >
                                            {item.title}
                                        </div>
                                        {item.description && <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</div>}
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        {item.product && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                {item.product.title}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                                        {formatBytes(item.file_size)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!item.is_folder && item.file_url && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(item.file_url, '_blank')}>
                                                    <Download size={16} />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // GRID VIEW
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredInsumos.map((item) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragOver={(e) => item.is_folder && handleDragOver(e)}
                            onDrop={(e) => item.is_folder && handleDrop(e, item.id)}
                            className={cn(
                                "group relative border rounded-lg p-4 flex flex-col items-center gap-3 text-center bg-white hover:shadow-md transition-all cursor-pointer",
                                item.is_folder && "hover:border-blue-300 hover:bg-blue-50/30"
                            )}
                            onClick={() => item.is_folder ? onFolderChange(item.id) : setPreviewFile(item)}
                        >
                            <div className="p-3 rounded-full bg-gray-50 group-hover:bg-white transition-colors">
                                {item.is_folder ? (
                                    <Folder size={40} className="fill-yellow-100 text-yellow-500" />
                                ) : (
                                    <FileText size={40} className="text-gray-400" />
                                )}
                            </div>
                            <div className="w-full">
                                <div className="font-medium text-sm text-gray-900 truncate w-full" title={item.title}>
                                    {item.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {item.is_folder ? 'Pasta' : formatBytes(item.file_size)}
                                </div>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <FilePreviewModal
                file={previewFile}
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
            />
        </div>
    )
}
