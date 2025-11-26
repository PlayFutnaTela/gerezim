"use client"

import React, { useState } from 'react'
import InsumosList from '@/components/insumos/insumos-list'
import InsumoForm from '@/components/insumos/insumo-form'

export default function InsumosPageClient() {
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Insumos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie arquivos, contratos e minutas, vinculando-os aos seus produtos.
                    </p>
                </div>
                <InsumoForm
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                    currentFolderId={currentFolderId}
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <InsumosList
                    refreshTrigger={refreshTrigger}
                    currentFolderId={currentFolderId}
                    onFolderChange={setCurrentFolderId}
                />
            </div>
        </div>
    )
}
