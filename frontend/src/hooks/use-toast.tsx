"use client"

import { toast as sonnerToast } from "sonner"

// Lightweight wrapper for existing project usage pattern `const { toast } = useToast()`
export function useToast() {
    return { toast: sonnerToast }
}

export default useToast
