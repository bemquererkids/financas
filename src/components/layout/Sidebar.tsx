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
    PanelLeftOpen,
    BookOpen,
    Receipt,
    Map,
    BarChart2,
    Compass
} from 'lucide-react';
import { CurrencyTicker } from '@/components/layout/CurrencyTicker';

const routes = [
    {
        label: 'Visão Geral',
        icon: LayoutDashboard,
        href: '/',
        color: 'text-sky-500',
    },
    {
        label: 'Pagamentos',
        icon: Receipt,
        href: '/payments',
        color: 'text-violet-500',
    },
    {
        label: 'Planejamento',
        icon: Map,
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
        icon: BarChart2,
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
        icon: Target,
        href: '/goals',
        color: 'text-yellow-500',
    },
    {
        label: 'Como Começar',
        icon: Compass,
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



            <div className="px-3 py-2 mt-auto">
                <div className={cn("rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/50 to-slate-800/20", !collapsed && "p-3")}>
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
        </div>
    );
}
