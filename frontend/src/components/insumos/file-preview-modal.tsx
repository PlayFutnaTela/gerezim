"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, FileText, Calendar } from 'lucide-react'

type Insumo = {
    id: string
    title: string
    file_url?: string
    file_type?: string
    created_at: string
}

type Props = {
    file: Insumo | null
    isOpen: boolean
    onClose: () => void
}

export default function FilePreviewModal({ file, isOpen, onClose }: Props) {
    if (!file || !file.file_url) return null

    const isImage = file.file_type?.startsWith('image/') || file.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    const isPdf = file.file_type === 'application/pdf' || file.file_url.match(/\.pdf$/i)

    const formattedDate = new Date(file.created_at).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gold-500" />
                        {file.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 bg-gray-100 overflow-hidden relative flex items-center justify-center">
                    {isImage ? (
                        <img
                            src={file.file_url}
                            alt={file.title}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : isPdf ? (
                        <iframe
                            src={`${file.file_url}#toolbar=0`}
                            className="w-full h-full"
                            title={file.title}
                        />
                    ) : (
                        <div className="text-center p-8">
                            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Pré-visualização não disponível para este tipo de arquivo.</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => window.open(file.file_url, '_blank')}
                            >
                                Abrir em nova aba
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 border-t bg-white flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>Enviado em: <strong>{formattedDate}</strong></span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                            Fechar
                        </Button>
                        <Button
                            className="bg-gold-500 hover:bg-gold-600 text-white flex-1 sm:flex-none"
                            onClick={() => window.open(file.file_url, '_blank')}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Baixar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
