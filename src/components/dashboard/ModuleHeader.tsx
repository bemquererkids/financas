import { UserGreeting } from "@/components/profile/UserGreeting";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { cn } from "@/lib/utils";

interface ModuleHeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
}

export function ModuleHeader({ title, subtitle, children, className }: ModuleHeaderProps) {
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

                <div className="ml-2 hidden md:block">
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
