'use client';

import { useState, useTransition } from 'react';
import { ChevronLeft, ChevronRight, Home, ShoppingCart, Zap, GraduationCap, Heart, Car, Utensils, DollarSign } from 'lucide-react';
import { getCashFlow, CashFlowData } from '@/app/actions/cashflow-actions';

interface CashFlowViewProps {
    initialData: CashFlowData;
}

// Map categories to icons
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'Moradia': Home,
    'Aluguel': Home,
    'Mercado': ShoppingCart,
    'Luz': Zap,
    'Energia': Zap,
    'Educação': GraduationCap,
    'Faculdade': GraduationCap,
    'Creche': GraduationCap,
    'Saúde': Heart,
    'Transporte': Car,
    'Alimentação': Utensils,
    'Salário': DollarSign,
};

const categoryColors: Record<string, string> = {
    'Moradia': 'bg-blue-500',
    'Aluguel': 'bg-blue-500',
    'Mercado': 'bg-orange-500',
    'Luz': 'bg-yellow-500',
    'Energia': 'bg-yellow-500',
    'Educação': 'bg-purple-500',
    'Faculdade': 'bg-purple-500',
    'Creche': 'bg-green-500',
    'Saúde': 'bg-pink-500',
    'Transporte': 'bg-slate-500',
    'Alimentação': 'bg-amber-500',
    'Salário': 'bg-emerald-500',
};

export function CashFlowView({ initialData }: CashFlowViewProps) {
    const [data, setData] = useState<CashFlowData>(initialData);
    const [isPending, startTransition] = useTransition();

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const navigateMonth = (direction: -1 | 1) => {
        startTransition(async () => {
            let newMonth = data.monthIndex + direction;
            let newYear = data.year;

            if (newMonth < 0) {
                newMonth = 11;
                newYear--;
            } else if (newMonth > 11) {
                newMonth = 0;
                newYear++;
            }

            const newData = await getCashFlow(newYear, newMonth);
            setData(newData);
        });
    };

    const getPrevMonth = () => {
        const d = new Date(data.year, data.monthIndex - 1, 1);
        return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    };

    const getNextMonth = () => {
        const d = new Date(data.year, data.monthIndex + 1, 1);
        return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    };

    const getIcon = (category: string) => {
        const Icon = categoryIcons[category] || ShoppingCart;
        return Icon;
    };

    const getColor = (category: string) => {
        return categoryColors[category] || 'bg-slate-500';
    };

    return (
        <div className="rounded-2xl glass-card overflow-hidden">
            {/* Header com navegação */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-bold text-white text-center">Fluxo de Caixa</h3>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                <button
                    onClick={() => navigateMonth(-1)}
                    disabled={isPending}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-xs capitalize">{getPrevMonth()}</span>
                </button>

                <div className="flex items-center gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium transition-opacity ${isPending ? 'opacity-50' : ''} bg-white/10 text-white`}>
                        {data.month}
                    </span>
                    <span className="text-xs text-slate-500">{data.year}</span>
                </div>

                <button
                    onClick={() => navigateMonth(1)}
                    disabled={isPending}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                    <span className="text-xs capitalize">{getNextMonth()}</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 border-b border-white/5 bg-white/2">
                <div className="text-center">
                    <p className="text-xs text-slate-400">Entradas</p>
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(data.totalIncome)}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-400">Saídas</p>
                    <p className="text-lg font-bold text-red-400">{formatCurrency(data.totalExpense)}</p>
                </div>
            </div>

            {/* Transactions by Day */}
            <div className={`divide-y divide-white/5 max-h-[400px] overflow-y-auto transition-opacity ${isPending ? 'opacity-50' : ''}`}>
                {data.days.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        Nenhuma transação neste mês
                    </div>
                ) : (
                    data.days.map(day => (
                        <div key={day.date}>
                            {/* Day Header */}
                            <div className="px-4 py-2 bg-white/5">
                                <span className="text-xs font-medium text-slate-400">{day.label}</span>
                            </div>

                            {/* Day Transactions */}
                            {day.transactions.map(tx => {
                                const Icon = getIcon(tx.category);
                                const bgColor = getColor(tx.category);
                                const isIncome = tx.type === 'INCOME';

                                return (
                                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                                            <p className="text-xs text-slate-500">{tx.category}</p>
                                        </div>

                                        {/* Amount */}
                                        <div className="text-right">
                                            <p className={`text-sm font-mono font-medium ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {isIncome ? '' : '- '}{formatCurrency(tx.amount)}
                                            </p>
                                            <p className="text-[10px] text-slate-500">{tx.status}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
