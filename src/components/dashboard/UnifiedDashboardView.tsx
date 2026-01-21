'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { History as HistoryIcon, PieChart, LineChart, Activity, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { TransactionList } from "@/components/transactions/TransactionList";
import { ExpensesCategoryChart } from "@/components/dashboard/ExpensesCategoryChart";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CashFlowView } from "@/components/dashboard/CashFlowView";
import { CashFlowData } from "@/app/actions/cashflow-actions";

interface UnifiedDashboardViewProps {
    transactions: any[];
    expensesByCategory: any[];
    monthlyTrend: any[];
    cashFlowData: CashFlowData;
    currentMonth: number;
    currentYear: number;
}

export function UnifiedDashboardView({ transactions, expensesByCategory, monthlyTrend, cashFlowData, currentMonth, currentYear }: UnifiedDashboardViewProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'cashflow' | 'transactions' | 'categories' | 'trend'>('transactions');

    const handleMonthChange = (increment: number) => {
        const newDate = new Date(currentYear, currentMonth + increment, 1);
        router.push(`/?month=${newDate.getMonth()}&year=${newDate.getFullYear()}`);
    };

    const periodLabel = new Date(currentYear, currentMonth, 1)
        .toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const capitalizedPeriod = periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1);

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex flex-col h-full transition-all duration-300 relative overflow-hidden">
            {/* Header com Abas */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3 flex-shrink-0">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">Visão Geral</h3>

                        <div className="flex items-center gap-0.5 bg-slate-950/30 rounded-lg p-0.5 border border-white/5">
                            <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <div className="flex items-center gap-1.5 px-2 min-w-[110px] justify-center">
                                <Calendar className="h-3 w-3 text-emerald-500/70" />
                                <span className="text-xs font-semibold text-zinc-200">{capitalizedPeriod}</span>
                            </div>
                            <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 hidden sm:block">
                        {activeTab === 'cashflow' && 'Previsão de entradas e saídas do mês'}
                        {activeTab === 'transactions' && 'Movimentações do período selecionado'}
                        {activeTab === 'categories' && 'Analise suas despesas por grupo'}
                        {activeTab === 'trend' && 'Evolução mensal de receita vs despesa'}
                    </p>
                </div>

                <div className="flex bg-slate-950/50 rounded-xl p-1 gap-1 border border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
                            activeTab === 'transactions'
                                ? "bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/20"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        <HistoryIcon className="h-3.5 w-3.5" />
                        <span className="inline">Transações</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
                            activeTab === 'categories'
                                ? "bg-blue-500/20 text-blue-400 shadow-sm border border-blue-500/20"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        <PieChart className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Categorias</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('trend')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
                            activeTab === 'trend'
                                ? "bg-amber-500/20 text-amber-400 shadow-sm border border-amber-500/20"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        <LineChart className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Tendência</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('cashflow')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
                            activeTab === 'cashflow'
                                ? "bg-violet-500/20 text-violet-400 shadow-sm border border-violet-500/20"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        <Activity className="h-3.5 w-3.5" />{/* Fallback seguro para Waves */}
                        <span className="inline">Fluxo</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 relative w-full overflow-hidden flex flex-col">
                {activeTab === 'cashflow' && (
                    <div className="h-full animate-in fade-in slide-in-from-right-2 duration-300">
                        <CashFlowView initialData={cashFlowData} />
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <TransactionList transactions={transactions} isEmbedded={true} />
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="h-full w-full animate-in fade-in zoom-in-95 duration-300">
                        <ExpensesCategoryChart data={expensesByCategory} />
                    </div>
                )}

                {activeTab === 'trend' && (
                    <div className="h-full w-full animate-in fade-in zoom-in-95 duration-300">
                        <IncomeExpenseChart data={monthlyTrend} />
                    </div>
                )}
            </div>
        </div>
    );
}
