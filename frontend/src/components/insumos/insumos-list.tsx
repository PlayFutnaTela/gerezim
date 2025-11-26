"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Download, FileText, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type Insumo = {
    id: string
    title: string
    description?: string
    file_url: string
    file_type?: string
    file_size?: number
    created_at: string
    product?: {
        title: string
    }
}

export default function InsumosList({ refreshTrigger }: { refreshTrigger: number }) {
    const [insumos, setInsumos] = useState<Insumo[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchInsumos()
    }, [refreshTrigger])

    async function fetchInsumos() {
        setLoading(true)
        const { data, error } = await supabase
            .from('insumos')
            .select('*, product:products(title)')
            .order('created_at', { ascending: false })

        if (error) {
            toast.error('Erro ao carregar insumos: ' + error.message)
        } else {
            setInsumos(data || [])
        }
        setLoading(false)
    }

    async function handleDelete(id: string, fileUrl: string) {
        if (!confirm('Tem certeza que deseja excluir este arquivo?')) return

        try {
            // 1. Delete from Storage
            const fileName = fileUrl.split('/').pop()
            if (fileName) {
                const { error: storageError } = await supabase.storage
                    .from('insumos')
                    .remove([fileName])

                if (storageError) console.error('Erro ao excluir do storage:', storageError)
            }

            // 2. Delete from Database
            const { error: dbError } = await supabase
                .from('insumos')
                .delete()
                .eq('id', id)

            if (dbError) throw dbError

            toast.success('Insumo excluído com sucesso')
            setInsumos(insumos.filter(i => i.id !== id))
        } catch (error: any) {
            toast.error('Erro ao excluir: ' + error.message)
        }
    }

    const filteredInsumos = insumos.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product?.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    function formatBytes(bytes: number, decimals = 2) {
        if (!bytes) return '0 Bytes'
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                    placeholder="Buscar por nome ou produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredInsumos.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-gray-50 text-muted-foreground">
                    Nenhum insumo encontrado.
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium">Nome</th>
                                <th className="px-4 py-3 font-medium">Produto Vinculado</th>
                                <th className="px-4 py-3 font-medium">Tamanho</th>
                                <th className="px-4 py-3 font-medium">Data</th>
                                <th className="px-4 py-3 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredInsumos.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{item.title}</div>
                                                {item.description && (
                                                    <div className="text-xs text-gray-500 max-w-[200px] truncate">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.product ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {item.product.title}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {item.file_size ? formatBytes(item.file_size) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => window.open(item.file_url, '_blank')}
                                                title="Baixar"
                                            >
                                                <Download size={16} className="text-gray-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(item.id, item.file_url)}
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
