'use client';

import { ArrowDownCircle, ArrowUpCircle, AlertTriangle, CheckCircle2, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { InlineTransactionForm } from "@/components/transactions/InlineTransactionForm";
import { Logo } from "@/components/ui/Logo";

interface WalletHeroProps {
    summary: {
        balance: number; // Saldo real em conta
        commitments: number; // Contas a pagar pendentes
        fundsAvailable: number; // Livre para gastar
        period: string;
    }
}

type StatusType = 'confortable' | 'tight' | 'critical';

export function WalletHero({ summary }: WalletHeroProps) {
    const [hideValues, setHideValues] = useState(false);
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

    // Estado Emocional
    let status: StatusType = 'confortable';
    if (summary.fundsAvailable < 0) status = 'critical';
    else if (summary.fundsAvailable < 1000) status = 'tight';

    const statusConfig = {
        confortable: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2, text: 'Você está no controle' },
        tight: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: AlertTriangle, text: 'Atenção ao fluxo' },
        critical: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: AlertTriangle, text: 'No limite' }
    }[status];

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const togglePrivacy = () => setHideValues(!hideValues);

    const openTransaction = (type: 'INCOME' | 'EXPENSE') => {
        setTransactionType(type);
        setIsTransactionOpen(true);
    };

    return (
        <>
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
                {/* Background Glows */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-10 ${status === 'confortable' ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-slate-800/30 blur-3xl"></div>

                <div className="relative z-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-center">

                    {/* 1. O Número Principal (Livre para Gastar) */}
                    <div className="space-y-2">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                <Logo size={18} showText={false} monochrome={true} className="text-indigo-400" />
                                <span>Dinheiro livre hoje</span>
                                <button onClick={togglePrivacy} className="hover:text-white transition-colors ml-1 text-slate-500">
                                    {hideValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium tracking-wide">Saldo total - Contas a pagar = <span className="text-emerald-400">Livre</span></p>
                        </div>

                        <div className="flex items-baseline gap-1 pt-2 pb-4">
                            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${hideValues ? 'blur-md select-none' : ''} ${summary.fundsAvailable < 0 ? 'text-red-400' : 'text-white'}`}>
                                {hideValues ? 'R$ 8.888,88' : formatCurrency(summary.fundsAvailable)}
                            </h1>
                        </div>

                        {/* Estado Emocional - Spacing Fixed */}
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border shadow-lg shadow-black/20`}>
                            <statusConfig.icon className="w-4 h-4" />
                            {statusConfig.text}
                        </div>
                    </div>

                    {/* 2. O Contexto (Compromissos e Saldo Real) */}
                    <div className="space-y-6 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-10">
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500/50" />
                                    Contas para pagar
                                </span>
                                <span className={`font-mono font-medium text-lg ${hideValues ? 'blur-sm' : ''} text-slate-200`}>
                                    {hideValues ? '----' : formatCurrency(summary.commitments)}
                                </span>
                            </div>
                            <Progress value={summary.balance > 0 ? (summary.commitments / summary.balance) * 100 : 0} className="h-2 bg-slate-900" indicatorClassName="bg-amber-500" />
                            <p className="text-[10px] text-slate-500 text-right font-medium">até o fim do mês</p>
                        </div>

                        <div className="space-y-1 pt-4 border-t border-slate-800/50">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Total atual nas contas</span>
                                <span className={`font-mono text-slate-400 text-sm ${hideValues ? 'blur-sm' : ''}`}>
                                    {hideValues ? '----' : formatCurrency(summary.balance)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Ações Primárias */}
                    <div className="flex gap-4 md:justify-end mt-2 md:mt-0">
                        <Button
                            onClick={() => openTransaction('INCOME')}
                            className="flex-1 md:flex-none h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 group transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowUpCircle className="mr-2 w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                            Recebi
                        </Button>
                        <Button
                            onClick={() => openTransaction('EXPENSE')}
                            variant="outline"
                            className="flex-1 md:flex-none h-14 border-slate-700/50 bg-slate-800/30 hover:bg-slate-800 text-slate-200 font-medium rounded-2xl hover:text-white group transition-all hover:border-red-500/30 hover:scale-105 active:scale-95"
                        >
                            <ArrowDownCircle className="mr-2 w-5 h-5 text-red-400 group-hover:translate-y-0.5 transition-transform" />
                            Gastei
                        </Button>
                    </div>
                </div>
            </div>

            {/* Transaction Modal (Reusing styles from FAB) */}
            {isTransactionOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsTransactionOpen(false)} />
                    <div className="relative w-full sm:max-w-md m-0 sm:m-4 bg-zinc-950 rounded-t-3xl sm:rounded-3xl border border-white/10 p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                {transactionType === 'INCOME' ? 'Nova Entrada' : 'Nova Saída'}
                            </h3>
                            <button onClick={() => setIsTransactionOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <InlineTransactionForm
                            defaultType={transactionType}
                            onSuccess={() => {
                                setIsTransactionOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
