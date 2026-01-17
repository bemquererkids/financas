'use client';

import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { deleteTransaction } from "@/app/actions/transaction-crud";
import { useState } from "react";

interface Transaction {
    id: string;
    date: string; // ISO
    description: string;
    category: string;
    amount: number;
    type: string;
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
        setIsDeleting(id);
        await deleteTransaction(id);
        setIsDeleting(null);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    return (
        <div className="rounded-2xl glass-card overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5">
                <h3 className="text-sm font-medium text-white">Histórico de Transações</h3>
                <p className="text-xs text-slate-400">Últimos lançamentos registrados.</p>
            </div>

            {/* Mobile Layout - Cards */}
            <div className="md:hidden divide-y divide-white/5">
                {transactions.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{t.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-400">{formatDate(t.date)}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-slate-400">
                                        {t.category}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`font-mono font-medium ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {t.type === 'EXPENSE' ? '−' : '+'} {formatCurrency(Number(t.amount))}
                                </p>
                                <div className="flex justify-end gap-1 mt-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
                                        onClick={() => alert("Edição em breve")}
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                        onClick={() => handleDelete(t.id)}
                                        disabled={isDeleting === t.id}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {transactions.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <p>Nenhuma transação encontrada.</p>
                    </div>
                )}
            </div>

            {/* Desktop Layout - Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr className="border-b border-white/5">
                            <th className="text-left p-4 text-sm font-medium text-slate-200">Data</th>
                            <th className="text-left p-4 text-sm font-medium text-slate-200">Descrição</th>
                            <th className="text-left p-4 text-sm font-medium text-slate-200">Categoria</th>
                            <th className="text-right p-4 text-sm font-medium text-slate-200">Valor</th>
                            <th className="text-right p-4 text-sm font-medium text-slate-200">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-slate-400 whitespace-nowrap">
                                    {formatDate(t.date)}
                                </td>
                                <td className="p-4 font-medium text-white">
                                    {t.description}
                                </td>
                                <td className="p-4 text-slate-400">
                                    <span className="px-2 py-1 rounded-full bg-white/5 text-xs">
                                        {t.category}
                                    </span>
                                </td>
                                <td className={`p-4 text-right font-mono ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                    {t.type === 'EXPENSE' ? '−' : '+'} {formatCurrency(Number(t.amount))}
                                </td>
                                <td className="p-4 text-right whitespace-nowrap">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                        onClick={() => alert("Funcionalidade de Edição Em Breve (UI)")}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                        onClick={() => handleDelete(t.id)}
                                        disabled={isDeleting === t.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-slate-500">
                                    Nenhuma transação encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
