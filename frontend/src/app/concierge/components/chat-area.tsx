import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
}

export function ChatArea({ conversationId, conversationTitle, webhookUrl }: ChatAreaProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        // Fetch messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('concierge_messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })

            if (data) setMessages(data)
        }

        fetchMessages()

        // Realtime subscription
        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'concierge_messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
                setMessages((prev) => [...prev, payload.new as Message])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId, supabase])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const sendMessage = async () => {
        if (!newMessage.trim()) return
        if (!webhookUrl) {
            toast.error('Configure a URL do Webhook primeiro!')
            return
        }

        const userMessage = newMessage
        setNewMessage('')
        setIsLoading(true)

        try {
            // 1. Save user message
            const { error: saveError } = await supabase.from('concierge_messages').insert({
                conversation_id: conversationId,
                content: userMessage,
                sender: 'user'
            })

            if (saveError) throw saveError

            // 2. Call Webhook
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    message: userMessage,
                    timestamp: new Date().toISOString()
                })
            })

            if (!response.ok) {
                throw new Error('Webhook failed')
            }

            const data = await response.json()

            // 3. Save bot response
            if (data.reply) {
                await supabase.from('concierge_messages').insert({
                    conversation_id: conversationId,
                    content: data.reply,
                    sender: 'bot'
                })
            }

        } catch (error) {
            console.error(error)
            toast.error('Erro ao enviar mensagem')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <h2 className="font-semibold text-lg text-slate-800">{conversationTitle}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
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
                    <div className="flex w-full justify-start">
                        <div className="bg-white border border-slate-200 rounded-lg p-3 rounded-bl-none shadow-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-gold-500" />
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
