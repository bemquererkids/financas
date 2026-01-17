'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, CalendarDays, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function QuickActions() {
    const router = useRouter();

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x hide-scrollbar">
            {/* Nova Receita */}
            <Button
                variant="outline"
                className="flex-shrink-0 h-auto flex flex-col items-center gap-2 p-4 rounded-2xl glass-card border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all active:scale-95 snap-start min-w-[100px]"
                onClick={() => document.getElementById('add-income-trigger')?.click()} // Hack to trigger existing modal if possible, or we route to form
            >
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <PlusCircle className="h-6 w-6 text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-slate-200">Receita</span>
            </Button>

            {/* Nova Despesa */}
            <Button
                variant="outline"
                className="flex-shrink-0 h-auto flex flex-col items-center gap-2 p-4 rounded-2xl glass-card border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all active:scale-95 snap-start min-w-[100px]"
                onClick={() => document.getElementById('add-transaction-trigger')?.click()}
            >
                <div className="h-10 w-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                    <MinusCircle className="h-6 w-6 text-rose-400" />
                </div>
                <span className="text-xs font-medium text-slate-200">Despesa</span>
            </Button>

            {/* Desconto em Folha (Novo) */}
            <Button
                variant="outline"
                className="flex-shrink-0 h-auto flex flex-col items-center gap-2 p-4 rounded-2xl glass-card border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all active:scale-95 snap-start min-w-[100px]"
                onClick={() => {
                    // We can reuse the consumption modal but pre-fill category or type
                    // For now, simpler to jus open the transaction form
                    document.getElementById('add-transaction-trigger')?.click()
                }}
            >
                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-amber-400" />
                </div>
                <span className="text-xs font-medium text-slate-200 text-center">Desc. Folha</span>
            </Button>

            {/* Planejar Futuro */}
            <Link href="/planning">
                <Button
                    variant="outline"
                    className="h-full flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl glass-card border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all active:scale-95 snap-start min-w-[100px]"
                >
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <CalendarDays className="h-6 w-6 text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-200">Planejar</span>
                </Button>
            </Link>
        </div>
    );
}
