import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
    title: string;
    amount: string | number;
    icon: LucideIcon;
    subtext?: string;
    variant?: "default" | "success" | "danger" | "warning";
}

export function SummaryCard({ title, amount, icon: Icon, subtext, variant = "default" }: SummaryCardProps) {
    const colorMap = {
        default: "text-slate-400",
        success: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]",
        danger: "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]",
        warning: "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    };

    const borderMap = {
        default: "border-white/5",
        success: "border-emerald-500/20",
        danger: "border-rose-500/20",
        warning: "border-amber-500/20",
    }

    return (
        <Card className={cn(
            "glass-card transition-all hover:scale-[1.02] hover:bg-white/5 duration-300",
            borderMap[variant]
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200 uppercase tracking-wider">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-full bg-white/5", colorMap[variant])}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight truncate" title={String(amount)}>{amount}</div>
                {subtext && (
                    <p className="text-xs text-slate-400 mt-1 font-light truncate">
                        {subtext}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
