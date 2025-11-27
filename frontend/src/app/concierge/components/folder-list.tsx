import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronRight, ChevronDown, Folder, MessageSquare, MoreVertical, Edit2, Trash2, GripVertical } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Folder {
    id: string
    name: string
    position: number
}

interface Conversation {
    id: string
    title: string
    folder_id: string | null
}

interface FolderListProps {
    folders: Folder[]
    conversations: Conversation[]
    selectedConversationId: string | null
    onSelectConversation: (id: string) => void
    onMoveConversation: (convId: string, folderId: string) => void
    onDeleteFolder: (id: string) => void
    onRenameFolder: (id: string, newName: string) => void
    onDeleteConversation: (id: string) => void
    onRenameConversation: (id: string, newName: string) => void
}

export function FolderList({
    folders,
    conversations,
    selectedConversationId,
    onSelectConversation,
    onMoveConversation,
    onDeleteFolder,
    onRenameFolder,
    onDeleteConversation,
    onRenameConversation
}: FolderListProps) {
    const unassignedConversations = conversations.filter(c => !c.folder_id)

    return (
        <div className="space-y-2">
            {/* Unassigned Conversations */}
            {unassignedConversations.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Sem Pasta</h3>
                    <div className="space-y-1">
                        {unassignedConversations.map(conv => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={selectedConversationId === conv.id}
                                onSelect={() => onSelectConversation(conv.id)}
                                onDelete={() => onDeleteConversation(conv.id)}
                                onRename={(name: string) => onRenameConversation(conv.id, name)}
                                folders={folders}
                                onMove={(folderId: string) => onMoveConversation(conv.id, folderId)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Folders */}
            {folders.map((folder) => (
                <SortableFolder
                    key={folder.id}
                    folder={folder}
                    conversations={conversations.filter(c => c.folder_id === folder.id)}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={onSelectConversation}
                    onDeleteFolder={onDeleteFolder}
                    onRenameFolder={onRenameFolder}
                    onDeleteConversation={onDeleteConversation}
                    onRenameConversation={onRenameConversation}
                    folders={folders}
                    onMoveConversation={onMoveConversation}
                />
            ))}
        </div>
    )
}

function SortableFolder({
    folder,
    conversations,
    selectedConversationId,
    onSelectConversation,
    onDeleteFolder,
    onRenameFolder,
    onDeleteConversation,
    onRenameConversation,
    folders,
    onMoveConversation
}: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: folder.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    }

    const [isOpen, setIsOpen] = useState(true)

    return (
        <div ref={setNodeRef} style={style} className="mb-2">
            <div className="group flex items-center gap-2 px-2 py-1 rounded hover:bg-gold-50 text-slate-600 hover:text-slate-900 transition-colors">
                <div {...attributes} {...listeners} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-slate-400" />
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-gold-100 rounded text-gold-500">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <Folder className="h-4 w-4 text-gold-500" />
                <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-gold-100 hover:text-gold-600">
                            <MoreVertical className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-700">
                        <DropdownMenuItem onClick={() => {
                            const newName = prompt('Novo nome:', folder.name)
                            if (newName) onRenameFolder(folder.id, newName)
                        }} className="hover:bg-gold-50 hover:text-gold-700 focus:bg-gold-50 focus:text-gold-700 cursor-pointer">
                            <Edit2 className="mr-2 h-4 w-4" /> Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer" onClick={() => onDeleteFolder(folder.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {isOpen && (
                <div className="ml-8 mt-1 space-y-1 border-l border-slate-200 pl-2">
                    {conversations.map((conv: any) => (
                        <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isSelected={selectedConversationId === conv.id}
                            onSelect={() => onSelectConversation(conv.id)}
                            onDelete={() => onDeleteConversation(conv.id)}
                            onRename={(name: string) => onRenameConversation(conv.id, name)}
                            folders={folders}
                            onMove={(folderId: string) => onMoveConversation(conv.id, folderId)}
                        />
                    ))}
                    {conversations.length === 0 && (
                        <div className="text-xs text-slate-400 py-1 italic">Vazio</div>
                    )}
                </div>
            )}
        </div>
    )
}

function ConversationItem({ conversation, isSelected, onSelect, onDelete, onRename, folders, onMove }: any) {
    return (
        <div
            className={cn(
                "group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors",
                isSelected ? "bg-gold-50/50 text-gold-600 font-medium" : "text-slate-600 hover:bg-gold-50 hover:text-slate-900"
            )}
            onClick={onSelect}
        >
            <MessageSquare className={cn("h-3 w-3", isSelected ? "text-gold-500" : "text-slate-400 group-hover:text-gold-500")} />
            <span className="flex-1 truncate">{conversation.title}</span>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 -mr-1 hover:bg-gold-100 hover:text-gold-600">
                        <MoreVertical className="h-3 w-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-700">
                    <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        const newName = prompt('Novo nome:', conversation.title)
                        if (newName) onRename(newName)
                    }} className="hover:bg-gold-50 hover:text-gold-700 focus:bg-gold-50 focus:text-gold-700 cursor-pointer">
                        <Edit2 className="mr-2 h-4 w-4" /> Renomear
                    </DropdownMenuItem>

                    {/* Move to folder submenu */}
                    {folders.length > 0 && (
                        <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">Mover para...</div>
                            {folders.map((f: any) => (
                                <DropdownMenuItem key={f.id} onClick={(e) => {
                                    e.stopPropagation()
                                    onMove(f.id)
                                }} disabled={conversation.folder_id === f.id} className="hover:bg-gold-50 hover:text-gold-700 focus:bg-gold-50 focus:text-gold-700 cursor-pointer">
                                    <Folder className="mr-2 h-4 w-4" /> {f.name}
                                </DropdownMenuItem>
                            ))}
                            {conversation.folder_id && (
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    onMove(null)
                                }} className="hover:bg-gold-50 hover:text-gold-700 focus:bg-gold-50 focus:text-gold-700 cursor-pointer">
                                    <Folder className="mr-2 h-4 w-4" /> (Sem pasta)
                                </DropdownMenuItem>
                            )}
                        </>
                    )}

                    <DropdownMenuItem className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer" onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                    }}>
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
