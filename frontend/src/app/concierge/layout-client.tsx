'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FolderList } from './components/folder-list'
import { ChatArea } from './components/chat-area'
import { WebhookSettings } from './components/webhook-settings'
import { Button } from '@/components/ui/button'
import { Settings, Plus, FolderPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Folder {
    id: string
    name: string
    position: number
}

interface Conversation {
    id: string
    title: string
    folder_id: string | null
    updated_at: string
}

interface ConciergeLayoutClientProps {
    initialFolders: Folder[]
    initialConversations: Conversation[]
    initialWebhookUrl: string
    user: any
}

export default function ConciergeLayoutClient({
    initialFolders,
    initialConversations,
    initialWebhookUrl,
    user
}: ConciergeLayoutClientProps) {
    const [folders, setFolders] = useState<Folder[]>(initialFolders)
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl)
    const supabase = createClient()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setFolders((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)
                const newItems = arrayMove(items, oldIndex, newIndex)

                // Update positions in DB
                // This should be debounced or optimized in a real app
                newItems.forEach(async (folder, index) => {
                    await supabase.from('concierge_folders').update({ position: index }).eq('id', folder.id)
                })

                return newItems
            })
        }
    }

    const createFolder = async () => {
        const name = prompt('Nome da nova pasta:')
        if (!name) return

        const { data, error } = await supabase
            .from('concierge_folders')
            .insert({ name, position: folders.length })
            .select()
            .single()

        if (error) {
            toast.error('Erro ao criar pasta')
            return
        }

        setFolders([...folders, data])
        toast.success('Pasta criada com sucesso')
    }

    const createConversation = async () => {
        const title = prompt('Título da nova conversa:')
        if (!title) return

        const { data, error } = await supabase
            .from('concierge_conversations')
            .insert({ title })
            .select()
            .single()

        if (error) {
            toast.error('Erro ao criar conversa')
            return
        }

        setConversations([data, ...conversations])
        setSelectedConversationId(data.id)
        toast.success('Conversa criada')
    }

    return (
        <div className="flex h-full bg-slate-50 text-slate-900 overflow-hidden">
            {/* Sidebar / Folder List */}
            <div className="w-80 flex flex-col border-r border-slate-200 bg-white">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-semibold text-lg text-slate-800">Conversas</h2>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={createFolder} title="Nova Pasta" className="hover:text-gold-500 hover:bg-gold-50">
                            <FolderPlus className="h-5 w-5 text-gold-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={createConversation} title="Nova Conversa" className="hover:text-gold-500 hover:bg-gold-50">
                            <Plus className="h-5 w-5 text-gold-500" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={folders} strategy={verticalListSortingStrategy}>
                            <FolderList
                                folders={folders}
                                conversations={conversations}
                                selectedConversationId={selectedConversationId}
                                onSelectConversation={setSelectedConversationId}
                                onMoveConversation={async (convId, folderId) => {
                                    const { error } = await supabase.from('concierge_conversations').update({ folder_id: folderId }).eq('id', convId)
                                    if (!error) {
                                        setConversations(conversations.map(c => c.id === convId ? { ...c, folder_id: folderId } : c))
                                    }
                                }}
                                onDeleteFolder={async (id) => {
                                    if (!confirm('Tem certeza? Conversas nesta pasta ficarão sem pasta.')) return
                                    const { error } = await supabase.from('concierge_folders').delete().eq('id', id)
                                    if (!error) setFolders(folders.filter(f => f.id !== id))
                                }}
                                onRenameFolder={async (id, newName) => {
                                    const { error } = await supabase.from('concierge_folders').update({ name: newName }).eq('id', id)
                                    if (!error) setFolders(folders.map(f => f.id === id ? { ...f, name: newName } : f))
                                }}
                                onDeleteConversation={async (id) => {
                                    if (!confirm('Tem certeza?')) return
                                    const { error } = await supabase.from('concierge_conversations').delete().eq('id', id)
                                    if (!error) {
                                        setConversations(conversations.filter(c => c.id !== id))
                                        if (selectedConversationId === id) setSelectedConversationId(null)
                                    }
                                }}
                                onRenameConversation={async (id, newName) => {
                                    const { error } = await supabase.from('concierge_conversations').update({ title: newName }).eq('id', id)
                                    if (!error) setConversations(conversations.map(c => c.id === id ? { ...c, title: newName } : c))
                                }}
                            />
                        </SortableContext>
                    </DndContext>
                </div>

                <div className="p-4 border-t border-slate-200">
                    <Button variant="outline" className="w-full gap-2 border-slate-200 hover:bg-gold-50 hover:text-gold-600 hover:border-gold-300 text-slate-600" onClick={() => setIsSettingsOpen(true)}>
                        <Settings className="h-4 w-4" />
                        Configurações
                    </Button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {selectedConversationId ? (
                    <ChatArea
                        conversationId={selectedConversationId}
                        webhookUrl={webhookUrl}
                        conversationTitle={conversations.find(c => c.id === selectedConversationId)?.title || 'Conversa'}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        Selecione uma conversa para começar
                    </div>
                )}
            </div>

            <WebhookSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentUrl={webhookUrl}
                onSave={(url) => setWebhookUrl(url)}
            />
        </div>
    )
}
