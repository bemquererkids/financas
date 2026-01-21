"use client"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-[#111827] group-[.toaster]:text-zinc-50 group-[.toaster]:border-white/10 group-[.toaster]:shadow-xl",
                    description: "group-[.toast]:text-zinc-400",
                    actionButton:
                        "group-[.toast]:bg-emerald-600 group-[.toast]:text-zinc-50 font-medium",
                    cancelButton:
                        "group-[.toast]:bg-slate-800 group-[.toast]:text-zinc-400 font-medium",
                    error: "group-[.toast]:text-rose-400",
                    success: "group-[.toast]:text-emerald-400",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
