'use client';

import { useState } from 'react';
import { cn } from "@/lib/utils";
import { List, PieChart, BarChart3, ArrowRightLeft } from "lucide-react";
import { TransactionList } from "@/components/transactions/TransactionList";
import { ExpensesPieChart } from "@/components/dashboard/ExpensesPieChart";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CashFlowView } from "@/components/dashboard/CashFlowView";
import { CashFlowData } from "@/app/actions/cashflow-actions";

interface UnifiedDashboardViewProps {
    transactions: any[];
    expensesByCategory: any[];
    monthlyTrend: any[];
    cashFlowData: CashFlowData;
}

export function UnifiedDashboardView({ transactions, expensesByCategory, monthlyTrend, cashFlowData }: UnifiedDashboardViewProps) {
    const [activeTab, setActiveTab] = useState<'cashflow' | 'transactions' | 'categories' | 'trend'>('transactions');

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex flex-col h-full transition-all duration-300 relative overflow-hidden">
            {/* Header com Abas */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3 flex-shrink-0">
                <div className="hidden sm:block">
                    <h3 className="text-lg font-bold text-white tracking-tight">Visão Geral</h3>
                    <p className="text-xs text-slate-400">
                        {activeTab === 'cashflow' && 'Previsão de entradas e saídas do mês'}
                        {activeTab === 'transactions' && 'Últimas movimentações'}
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
                        <List className="h-3.5 w-3.5" />
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
                        <BarChart3 className="h-3.5 w-3.5" />
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
                        <ArrowRightLeft className="h-3.5 w-3.5" />
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
                        <ExpensesPieChart data={expensesByCategory} />
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
