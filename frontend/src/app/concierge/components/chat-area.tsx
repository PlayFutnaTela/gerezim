import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TypingIndicator } from './typing-indicator'

interface Message {
    id: string
    content: string
    sender: 'user' | 'bot'
    created_at: string
}

interface ChatAreaProps {
    conversationId: string
    conversationTitle: string
    webhookUrl: string
    clientId: string | null
    profiles: any[]
    onClientChange: (clientId: string) => void
    onToggleSidebar?: () => void
}

export function ChatArea({ conversationId, conversationTitle, webhookUrl, clientId, profiles, onClientChange, onToggleSidebar }: ChatAreaProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // 1. Fetch initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('concierge_messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })

            if (data) setMessages(data)
        }

        fetchMessages()
    }, [conversationId, supabase])

    // 2. Realtime subscription (deduplicated)
    useEffect(() => {
        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'concierge_messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
                const newMessage = payload.new as Message
                setMessages((prev) => {
                    // Prevent duplicates (especially from optimistic updates)
                    if (prev.some(m => m.id === newMessage.id)) return prev
                    return [...prev, newMessage]
                })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId, supabase])

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isLoading])

    const sendMessage = async () => {
        if (!newMessage.trim()) return
        if (!webhookUrl) {
            toast.error('Configure a URL do Webhook primeiro!')
            return
        }

        const userMessageContent = newMessage
        setNewMessage('')
        setIsLoading(true)

        // Optimistic update for user message
        const tempUserMessage: Message = {
            id: crypto.randomUUID(),
            content: userMessageContent,
            sender: 'user',
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, tempUserMessage])

        try {
            // 1. Save user message to DB
            const { data: savedUserMsg, error: saveError } = await supabase
                .from('concierge_messages')
                .insert({
                    conversation_id: conversationId,
                    content: userMessageContent,
                    sender: 'user'
                })
                .select()
                .single()

            // Update temp message with real ID from DB
            setMessages(prev => prev.map(m => m.id === tempUserMessage.id ? savedUserMsg : m))

            // 2. Call Webhook (via Proxy)
            const response = await fetch('/api/concierge/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: webhookUrl,
                    message: userMessageContent,
                    conversation_id: conversationId,
                    client_id: clientId,
                    user_email: profiles.find(p => p.id === clientId)?.email || 'unknown'
                }),
            })

            if (!response.ok) {
                throw new Error('Webhook failed')
            }

            const text = await response.text()
            let reply = ''

            try {
                const data = JSON.parse(text)
                reply = data.reply || data.message || JSON.stringify(data)
            } catch (e) {
                reply = text
            }

            // 3. Save bot response to DB
            if (reply) {
                const { data: savedBotMsg, error: botError } = await supabase
                    .from('concierge_messages')
                    .insert({
                        conversation_id: conversationId,
                        content: reply,
                        sender: 'bot'
                    })
                    .select()
                    .single()

                if (botError) throw botError

                // Manually add bot message to state (Optimistic-ish)
                setMessages(prev => {
                    if (prev.some(m => m.id === savedBotMsg.id)) return prev
                    return [...prev, savedBotMsg]
                })
            }

        } catch (error) {
            console.error(error)
            toast.error('Erro ao enviar mensagem')
            // Rollback optimistic update if failed
            setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    {onToggleSidebar && (
                        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden text-slate-500 hover:text-slate-700">
                            <PanelLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <h2 className="font-semibold text-lg text-slate-800">{conversationTitle}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={clientId || "none"} onValueChange={(value) => onClientChange(value === "none" ? "" : value)}>
                        <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200 text-slate-900">
                            <SelectValue placeholder="Vincular Cliente" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="none" className="text-slate-500">Nenhum cliente</SelectItem>
                            {profiles.map((profile) => (
                                <SelectItem key={profile.id} value={profile.id} className="text-slate-900 focus:bg-gold-50 focus:text-gold-900">
                                    {profile.full_name || profile.email || 'Sem nome'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 min-h-0 scrollbar-thin scrollbar-thumb-gold-200 scrollbar-track-transparent hover:scrollbar-thumb-gold-300">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full",
                            msg.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[80%] rounded-lg p-3 text-sm shadow-sm",
                                msg.sender === 'user'
                                    ? "bg-gold-500 text-white rounded-br-none"
                                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                            )}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex w-full justify-start animate-in fade-in duration-300">
                        <div className="bg-white border border-slate-200 rounded-lg rounded-bl-none shadow-sm">
                            <TypingIndicator />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        sendMessage()
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-gold-500"
                    />
                    <Button type="submit" disabled={isLoading || !newMessage.trim()} className="bg-gold-500 hover:bg-gold-600 text-white">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
