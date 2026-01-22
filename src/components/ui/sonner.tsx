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
                        "group toast group-[.toaster]:bg-slate-950/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl",
                    description: "group-[.toast]:text-slate-400 group-[.toast]:text-xs",
                    actionButton:
                        "group-[.toast]:bg-emerald-600 group-[.toast]:text-white font-medium hover:group-[.toast]:bg-emerald-500 transition-colors",
                    cancelButton:
                        "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-400 font-medium hover:group-[.toast]:bg-slate-700 hover:group-[.toast]:text-white transition-colors",
                    error: "group-[.toast]:text-red-400",
                    success: "group-[.toast]:text-emerald-400",
                    warning: "group-[.toast]:text-amber-400",
                    info: "group-[.toast]:text-blue-400",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
