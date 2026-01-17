// Simplified version of use-toast for immediate usage
import { useState } from "react"

export const useToast = () => {
    const [toasts, setToasts] = useState<any[]>([])

    const toast = ({ title, description, variant }: { title: string, description?: string, variant?: "default" | "destructive" }) => {
        console.log(`Toast: ${title} - ${description} (${variant})`)
        // In a real app we would manage state here to show a toaster
        // For now, we just log it to avoid crashing
        // If we want real toasts, we need the Toaster component in layout
        alert(`${title}\n${description || ''}`)
    }

    return { toast }
}
