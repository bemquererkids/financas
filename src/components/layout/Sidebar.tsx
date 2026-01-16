'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    CalendarDays,
    PiggyBank,
    TrendingUp,
    CreditCard,
    Target,
    History
} from 'lucide-react';

const routes = [
    {
        label: 'Visão Geral (Módulo A)',
        icon: LayoutDashboard,
        href: '/',
        color: 'text-sky-500',
    },
    {
        label: 'Pagamentos (Módulo B)',
        icon: CalendarDays,
        href: '/payments',
        color: 'text-violet-500',
    },
    {
        label: 'Planejamento (Módulo C)',
        icon: Target,
        href: '/planning',
        color: 'text-pink-700',
    },
    {
        label: 'Investimentos (Módulo D)',
        icon: TrendingUp,
        href: '/investments',
        color: 'text-emerald-500',
    },
    {
        label: 'Desempenho (Módulo E)',
        icon: History,
        href: '/performance',
        color: 'text-orange-700',
    },
    {
        label: 'Dívidas (Módulo F)',
        icon: CreditCard,
        href: '/debts',
        color: 'text-red-500',
    },
    {
        label: 'Objetivos (Módulo G)',
        icon: PiggyBank,
        href: '/goals',
        color: 'text-yellow-500',
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white border-r border-white/10">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        RNV Control
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-900/50 to-emerald-950/20 border border-emerald-500/20">
                    <p className="text-xs text-emerald-200 mb-2">Status do Sistema</p>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400">Online v1.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
