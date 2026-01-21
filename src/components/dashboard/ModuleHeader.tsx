import { UserGreeting } from "@/components/profile/UserGreeting";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ModuleHeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
    onChatToggle?: () => void;
}

export function ModuleHeader({ title, subtitle, children, className, onChatToggle }: ModuleHeaderProps) {
    return (
        <div className={cn("flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6", className)}>
            <div className="flex items-center gap-4">
                <div className="hidden md:block">
                    <UserGreeting />
                </div>

                <div className="hidden md:block h-10 w-px bg-white/10" />

                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">{title}</h1>
                    {subtitle && <p className="text-xs text-slate-400 hidden md:block">{subtitle}</p>}
                </div>

                <div className="ml-2 hidden md:flex items-center gap-2">
                    {onChatToggle && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                            onClick={onChatToggle}
                        >
                            <Sparkles className="h-5 w-5" />
                        </Button>
                    )}
                    <NotificationBell />
                </div>
            </div>

            {children && (
                <div className="flex-1 flex justify-start xl:justify-end w-full xl:w-auto">
                    {children}
                </div>
            )}
        </div>
    );
}
