'use client';

import { useState } from 'react';
import { ExpensesPieChart } from './ExpensesPieChart';
import { IncomeExpenseChart } from './IncomeExpenseChart';
import { cn } from '@/lib/utils';
import { PieChart, BarChart3 } from 'lucide-react';

interface UnifiedChartCardProps {
    expensesByCategory: any;
    monthlyTrend: any;
}

export function UnifiedChartCard({ expensesByCategory, monthlyTrend }: UnifiedChartCardProps) {
    const [activeTab, setActiveTab] = useState<'categories' | 'trend'>('categories');

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 flex flex-col h-full transition-all duration-300">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    {activeTab === 'categories' ? 'Despesas por Categoria' : 'Receita vs Despesa'}
                </h4>

                <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={cn(
                            "p-1.5 rounded-md transition-all duration-200",
                            activeTab === 'categories'
                                ? "bg-emerald-500/20 text-emerald-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                        title="Categorias"
                    >
                        <PieChart className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab('trend')}
                        className={cn(
                            "p-1.5 rounded-md transition-all duration-200",
                            activeTab === 'trend'
                                ? "bg-blue-500/20 text-blue-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                        title="Tendência"
                    >
                        <BarChart3 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative w-full">
                {/* Usando absolute positioning para transições suaves se quiséssemos, mas por enquanto renderização condicional simples é mais segura para resize */}
                {activeTab === 'categories' ? (
                    <div className="h-full w-full animate-in fade-in zoom-in-95 duration-300">
                        <ExpensesPieChart data={expensesByCategory} />
                    </div>
                ) : (
                    <div className="h-full w-full animate-in fade-in zoom-in-95 duration-300">
                        <IncomeExpenseChart data={monthlyTrend} />
                    </div>
                )}
            </div>
        </div>
    );
}
