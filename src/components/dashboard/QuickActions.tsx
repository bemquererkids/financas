'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingDown, CalendarDays } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
    return (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Nova Receita */}
            <Button
                variant="outline"
                className="h-auto flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-card border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all active:scale-95"
                onClick={() => document.getElementById('add-income-trigger')?.click()}
            >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-slate-200">Nova Receita</span>
            </Button>

            {/* Desconto em Folha */}
            <Button
                variant="outline"
                className="h-auto flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-card border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all active:scale-95"
                onClick={() => document.getElementById('add-transaction-trigger')?.click()}
            >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
                </div>
                <span className="text-xs font-medium text-slate-200 text-center leading-tight">Descontos</span>
            </Button>

            {/* Planejar Futuro */}
            <Link href="/planning">
                <Button
                    variant="outline"
                    className="w-full h-full flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-card border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all active:scale-95"
                >
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-200">Planejar</span>
                </Button>
            </Link>
        </div>
    );
}
