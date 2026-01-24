'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Wallet,
    CalendarClock,
    Compass,
    Sprout,
    LineChart,
    Link as LinkIcon,
    Target,
    Sparkles,
    PiggyBank,
    ChevronLeft,
    ChevronRight,
    Settings
} from 'lucide-react';
import { CurrencyTicker } from '@/components/layout/CurrencyTicker';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { InstallPWA } from '@/components/layout/InstallPWA';

const routes = [
    {
        label: 'Minha Carteira',
        icon: Wallet,
        href: '/',
        color: 'text-sky-500',
    },
    {
        label: 'Contas a Pagar',
        icon: CalendarClock,
        href: '/payments',
        color: 'text-violet-500',
    },
    {
        label: 'Para Onde Vai',
        icon: Compass,
        href: '/planning',
        color: 'text-pink-700',
    },
    {
        label: 'Meu Futuro',
        icon: Sprout,
        href: '/investments',
        color: 'text-emerald-500',
    },
    {
        label: 'Minha Evolução',
        icon: LineChart,
        href: '/performance',
        color: 'text-orange-700',
    },
    {
        label: 'Minhas Dívidas',
        icon: LinkIcon,
        href: '/debts',
        color: 'text-red-500',
    },
    {
        label: 'Meus Objetivos',
        icon: Target,
        href: '/goals',
        color: 'text-yellow-500',
    },
    {
        label: 'Primeiros Passos',
        icon: Sparkles,
        href: '/tutorial',
        color: 'text-white',
    },
];

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn(
            "relative space-y-4 py-4 flex flex-col h-full bg-[#0A0F1C] text-white border-r border-white/10 transition-all duration-300 ease-in-out overflow-visible",
            collapsed ? "w-[72px]" : "w-72"
        )}>
            {/* Toggle Button "Notch" Style */}
            {onToggle && (
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-9 z-50 h-6 w-6 rounded-full bg-[#0A0F1C] border border-white/10 flex items-center justify-center cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-500 text-slate-500 transition-all duration-300 shadow-sm"
                    title={collapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>
            )}

            <div className="px-3 py-2 flex-1">
                <div className="flex items-center justify-between mb-10 pl-1">
                    <Link href="/" className={cn("flex items-center gap-3 transition-opacity", collapsed ? "justify-center w-full" : "")}>
                        <div className="h-9 w-9 min-w-[36px] rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <PiggyBank className="h-5 w-5 text-slate-900" />
                        </div>
                        {!collapsed && (
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent truncate tracking-tight">
                                MyWallet
                            </h1>
                        )}
                    </Link>
                </div>

                <div className="space-y-1.5">
                    <TooltipProvider delayDuration={0}>
                        {routes.map((route) => {
                            const isActive = pathname === route.href;

                            const LinkComponent = (
                                <Link
                                    href={route.href}
                                    className={cn(
                                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                                        isActive
                                            ? "text-white bg-emerald-500/10 border border-emerald-500/20 shadow-sm shadow-emerald-900/10"
                                            : "text-slate-400 hover:text-white hover:bg-white/5",
                                        collapsed ? "justify-center px-2" : ""
                                    )}
                                >
                                    <div className="flex items-center flex-1">
                                        <route.icon className={cn(
                                            "h-5 w-5 transition-colors",
                                            isActive ? route.color : "text-slate-500 group-hover:text-white",
                                            collapsed ? "mr-0" : "mr-3"
                                        )} />
                                        {!collapsed && <span className="truncate">{route.label}</span>}
                                    </div>
                                    {isActive && !collapsed && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                    )}
                                </Link>
                            );

                            return collapsed ? (
                                <Tooltip key={route.href}>
                                    <TooltipTrigger asChild>
                                        {LinkComponent}
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-slate-200 font-medium ml-2">
                                        {route.label}
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <div key={route.href}>{LinkComponent}</div>
                            );
                        })}
                    </TooltipProvider>
                </div>
            </div>

            <div className="px-3 py-2 mt-auto">
                <div className={cn("rounded-xl border border-white/5 bg-slate-900/50", !collapsed && "p-3")}>
                    {!collapsed && <p className="text-[10px] text-slate-500 mb-2 font-medium tracking-wider uppercase ml-1">Mercado Hoje</p>}
                    <CurrencyTicker collapsed={collapsed} />

                    {!collapsed && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600">
                            <span>Status: Online</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    )}
                </div>
            </div>

            {/* Instalação do App */}
            {!collapsed && (
                <div className="px-3 pb-2">
                    <InstallPWA />
                </div>
            )}
        </div>
    );
}
