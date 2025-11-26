'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploadProps {
    uid: string
    url: string | null
    size?: number
    onUpload: (url: string) => void
}

export default function AvatarUpload({ uid, url, size = 150, onUpload }: AvatarUploadProps) {
    const supabase = createClient()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (url) downloadImage(url)
    }, [url])

    async function downloadImage(path: string) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path)
            if (error) {
                throw error
            }
            const url = URL.createObjectURL(data)
            setAvatarUrl(url)
        } catch (error) {
            console.log('Error downloading image: ', error)
        }
    }

    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você deve selecionar uma imagem para fazer upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${uid}-${Math.random()}.${fileExt}`

            // Preview imediato
            const previewUrl = URL.createObjectURL(file)
            setAvatarUrl(previewUrl)

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            onUpload(filePath)
        } catch (error: any) {
            toast.error(error.message || "Erro no upload")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <Avatar style={{ height: size, width: size }} className="border-4 border-white shadow-lg">
                    {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />
                    ) : (
                        <AvatarFallback className="bg-gray-100 text-gray-400">
                            <Camera size={size / 3} />
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="absolute bottom-0 right-0">
                    <label htmlFor="single" className="cursor-pointer">
                        <div className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-colors">
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        </div>
                        <input
                            style={{
                                visibility: 'hidden',
                                position: 'absolute',
                            }}
                            type="file"
                            id="single"
                            accept="image/*"
                            onChange={uploadAvatar}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>
        </div>
    )
}
