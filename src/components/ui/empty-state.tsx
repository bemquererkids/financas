import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

interface EmptyStateProps {
    icon?: LucideIcon;
    useLogo?: boolean;
    title: string;
    description: string;
    ctaLabel?: string;
    onCtaClick?: () => void;
    ctaLink?: string;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    useLogo,
    title,
    description,
    ctaLabel,
    onCtaClick,
    ctaLink,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center p-8 h-full min-h-[300px] animate-in fade-in zoom-in-95 duration-500",
            className
        )}>
            <div className="bg-slate-800/50 p-4 rounded-full mb-6 relative group">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all duration-500" />
                {useLogo ? (
                    <Logo size={32} showText={false} monochrome={true} className="text-slate-400 group-hover:text-indigo-400 transition-colors duration-500 relative z-10" />
                ) : (
                    Icon && <Icon className="h-8 w-8 text-slate-400 group-hover:text-indigo-400 transition-colors duration-500 relative z-10" />
                )}
            </div>

            <h3 className="text-xl font-semibold text-white mb-2 max-w-sm">
                {title}
            </h3>

            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                {description}
            </p>

            {ctaLabel && (
                ctaLink ? (
                    <Link href={ctaLink}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 transition-all">
                            {ctaLabel}
                        </Button>
                    </Link>
                ) : (
                    <Button
                        onClick={onCtaClick}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 transition-all"
                    >
                        {ctaLabel}
                    </Button>
                )
            )}
        </div>
    );
}
