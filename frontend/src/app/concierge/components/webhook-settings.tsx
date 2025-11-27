import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface WebhookSettingsProps {
    isOpen: boolean
    onClose: () => void
    currentUrl: string
    onSave: (url: string) => void
}

export function WebhookSettings({ isOpen, onClose, currentUrl, onSave }: WebhookSettingsProps) {
    const [url, setUrl] = useState(currentUrl)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('concierge_settings')
                .upsert({ key: 'webhook_url', value: url }, { onConflict: 'key' })

            if (error) throw error

            onSave(url)
            toast.success('Configurações salvas')
            onClose()
        } catch (error) {
            console.error(error)
            toast.error('Erro ao salvar configurações')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white border-slate-200 text-slate-900">
                <DialogHeader>
                    <DialogTitle>Configurações do Webhook</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Configure a URL do webhook para onde as mensagens serão enviadas.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right text-slate-700">
                            URL
                        </Label>
                        <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="col-span-3 bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-gold-500"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={isLoading} className="bg-gold-500 hover:bg-gold-600 text-white">
                        {isLoading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
