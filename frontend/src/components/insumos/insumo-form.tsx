"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, Plus, FolderPlus } from 'lucide-react'
import { toast } from 'sonner'

type Product = {
    id: string
    title: string
}

type Props = {
    onSuccess: () => void
    currentFolderId: string | null
}

export default function InsumoForm({ onSuccess, currentFolderId }: Props) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<Product[]>([])

    // Form States
    const [mode, setMode] = useState<'file' | 'folder'>('file')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [productId, setProductId] = useState<string>('none')
    const [file, setFile] = useState<File | null>(null)

    const supabase = createClient()

    useEffect(() => {
        if (open) {
            fetchProducts()
        }
    }, [open])

    async function fetchProducts() {
        const { data } = await supabase.from('products').select('id, title').order('title')
        if (data) setProducts(data)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            if (mode === 'folder') {
                if (!title) {
                    toast.error('Digite o nome da pasta')
                    setLoading(false)
                    return
                }

                const { error } = await supabase.from('insumos').insert({
                    title,
                    is_folder: true,
                    parent_id: currentFolderId
                })

                if (error) throw error
                toast.success('Pasta criada com sucesso!')

            } else {
                // File Mode
                if (!file || !title) {
                    toast.error('Preencha o título e selecione um arquivo')
                    setLoading(false)
                    return
                }

                // 1. Upload File
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('insumos')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('insumos')
                    .getPublicUrl(filePath)

                // 2. Save Metadata
                const { error: dbError } = await supabase.from('insumos').insert({
                    title,
                    description,
                    file_url: publicUrl,
                    file_type: file.type,
                    file_size: file.size,
                    product_id: productId === 'none' ? null : productId,
                    is_folder: false,
                    parent_id: currentFolderId
                })

                if (dbError) throw dbError
                toast.success('Insumo salvo com sucesso!')
            }

            setOpen(false)
            resetForm()
            onSuccess()
        } catch (error: any) {
            toast.error('Erro: ' + error.message)
        }
        setLoading(false)
    }

    function resetForm() {
        setTitle('')
        setDescription('')
        setProductId('none')
        setFile(null)
        setMode('file')
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gold-500 hover:bg-gold-600 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Item</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="file" value={mode} onValueChange={(v) => setMode(v as 'file' | 'folder')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="file">Arquivo</TabsTrigger>
                        <TabsTrigger value="folder">Pasta</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                {mode === 'folder' ? 'Nome da Pasta *' : 'Título do Arquivo *'}
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={mode === 'folder' ? "Ex: Contratos 2024" : "Ex: Contrato de Venda"}
                                required
                            />
                        </div>

                        {mode === 'file' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="product">Vincular a Produto (Opcional)</Label>
                                    <Select value={productId} onValueChange={setProductId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um produto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nenhum vínculo</SelectItem>
                                            {products.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="file">Arquivo *</Label>
                                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                        <Input
                                            id="file"
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            required
                                        />
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <Upload size={24} />
                                            {file ? (
                                                <span className="text-sm font-medium text-green-600">{file.name}</span>
                                            ) : (
                                                <span className="text-sm">Clique ou arraste para selecionar um arquivo</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição (Opcional)</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Detalhes adicionais sobre o arquivo..."
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-gold-500 hover:bg-gold-600 text-white">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {mode === 'folder' ? 'Criar Pasta' : 'Salvar Arquivo'}
                            </Button>
                        </div>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
