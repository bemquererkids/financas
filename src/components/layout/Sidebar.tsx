'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    CalendarDays,
    PiggyBank,
    TrendingUp,
    CreditCard,
    Target,
    History,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';

const routes = [
    {
        label: 'Visão Geral',
        icon: LayoutDashboard,
        href: '/',
        color: 'text-sky-500',
    },
    {
        label: 'Pagamentos',
        icon: CalendarDays,
        href: '/payments',
        color: 'text-violet-500',
    },
    {
        label: 'Planejamento',
        icon: Target,
        href: '/planning',
        color: 'text-pink-700',
    },
    {
        label: 'Investimentos',
        icon: TrendingUp,
        href: '/investments',
        color: 'text-emerald-500',
    },
    {
        label: 'Desempenho',
        icon: History,
        href: '/performance',
        color: 'text-orange-700',
    },
    {
        label: 'Dívidas',
        icon: CreditCard,
        href: '/debts',
        color: 'text-red-500',
    },
    {
        label: 'Objetivos',
        icon: PiggyBank,
        href: '/goals',
        color: 'text-yellow-500',
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
            "space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white border-r border-white/10 transition-all duration-300",
            collapsed ? "w-[80px]" : "w-72" // Largura controlada pelo pai, mas bom ter aqui também
        )}>
            <div className="px-3 py-2 flex-1 relative">
                <div className="flex items-center justify-between mb-10 pl-2">
                    <Link href="/" className={cn("flex items-center gap-3 transition-opacity", collapsed ? "justify-center w-full" : "")}>
                        <div className="h-10 w-10 min-w-[40px] rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <PiggyBank className="h-6 w-6 text-slate-900" />
                        </div>
                        {!collapsed && (
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent truncate">
                                MyWallet
                            </h1>
                        )}
                    </Link>
                </div>

                {onToggle && (
                    <div className="absolute top-2 right-2 hidden md:block">
                        {!collapsed && (
                            <Button onClick={onToggle} variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white">
                                <PanelLeftClose className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Botão de abrir centralizado quando fechado */}
                {collapsed && onToggle && (
                    <div className="flex justify-center mb-6">
                        <Button onClick={onToggle} variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white">
                            <PanelLeftOpen className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                                collapsed ? "justify-center" : ""
                            )}
                            title={collapsed ? route.label : undefined}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5", route.color, collapsed ? "mr-0" : "mr-3")} />
                                {!collapsed && route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="px-3 py-2">
                {!collapsed ? (
                    <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-900/50 to-emerald-950/20 border border-emerald-500/20">
                        <p className="text-xs text-emerald-200 mb-2">Status do Sistema</p>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-400">Online v1.0</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Online v1.0" />
                    </div>
                )}
            </div>
        </div>
    );
}
