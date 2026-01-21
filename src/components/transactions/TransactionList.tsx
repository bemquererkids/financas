'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, AlertTriangle } from "lucide-react";
import { deleteTransaction } from "@/app/actions/transaction-crud";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditTransactionDialog } from "./EditTransactionDialog";

interface Transaction {
    id: string;
    date: string; // ISO
    description: string;
    category: string;
    amount: number;
    type: string;
}

export function TransactionList({ transactions, isEmbedded = false }: { transactions: Transaction[], isEmbedded?: boolean }) {
    const router = useRouter();
    const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    // Sincroniza estado local se novas props chegarem do servidor
    useEffect(() => {
        setLocalTransactions(transactions);
    }, [transactions]);

    const handleDeleteClick = (id: string) => {
        setTransactionToDelete(id);
    };

    const handleEditClick = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;

        const id = transactionToDelete;
        setIsDeleting(id);

        // Optimistic Update: Remove visualmente antes de confirmar no banco
        const previousTransactions = [...localTransactions];
        setLocalTransactions(prev => prev.filter(t => t.id !== id));
        setTransactionToDelete(null); // Fecha modal imediatamente

        try {
            const result = await deleteTransaction(id);

            if (result && 'error' in result) {
                // Rollback em caso de erro
                setLocalTransactions(previousTransactions);
                alert("Erro ao excluir transação: " + result.error);
            } else {
                // Sucesso confirmado, atualiza dados do servidor
                router.refresh();
            }
        } catch (error) {
            console.error("Erro ao excluir:", error);
            setLocalTransactions(previousTransactions);
            alert("Ocorreu um erro inesperado. A transação foi restaurada.");
        } finally {
            setIsDeleting(null);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatDate = (dateStr: string) => {
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
    };

    const formatCategory = (cat: string) => {
        const dict: Record<string, string> = {
            'CREDIT_CARD_BILL': 'Fatura Cartão',
            'INCOME': 'Receita',
            'EXPENSE': 'Despesa',
            'SALARY': 'Salário',
            'INVESTMENT': 'Investimento',
            'FOOD': 'Alimentação',
            'TRANSPORT': 'Transporte',
            'HOUSING': 'Moradia',
            'HEALTH': 'Saúde',
            'EDUCATION': 'Educação',
            'LEISURE': 'Lazer',
            'OTHER': 'Outros'
        };
        // Se estiver no dicionário, retorna o valor.
        if (dict[cat]) return dict[cat];

        // Se não, tenta formatar Title Case se estiver tudo maiúsculo ou minúsculo
        if (cat === cat.toUpperCase() || cat === cat.toLowerCase()) {
            return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase().replace(/_/g, ' ');
        }

        return cat;
    };

    const Wrapper = isEmbedded ? 'div' : 'div';
    const wrapperClass = isEmbedded ? "h-full flex flex-col" : "rounded-2xl glass-card overflow-hidden h-full flex flex-col";

    return (
        <>
            <div className={wrapperClass}>
                {!isEmbedded && (
                    <div className="p-4 border-b border-white/5 bg-white/5 flex-shrink-0">
                        <h3 className="text-sm font-medium text-white">Histórico de Transações</h3>
                        <p className="text-xs text-slate-400">Últimos lançamentos registrados.</p>
                    </div>
                )}

                {/* Mobile Layout - Cards */}
                <div className="md:hidden divide-y divide-white/5 flex-1 overflow-y-auto custom-scrollbar">
                    {localTransactions.map((t) => (
                        <div key={t.id} className="p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{t.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-400">{formatDate(t.date)}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-slate-400">
                                            {formatCategory(t.category)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`font-mono font-medium ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {t.type === 'EXPENSE' && '− '}
                                        {formatCurrency(Number(t.amount))}
                                    </p>
                                    <div className="flex justify-end gap-1 mt-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
                                            onClick={() => handleEditClick(t)}
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                            onClick={() => handleDeleteClick(t.id)}
                                            disabled={isDeleting === t.id}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {localTransactions.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <p>Nenhuma transação encontrada.</p>
                        </div>
                    )}
                </div>

                {/* Desktop Layout - Table Compacta Sem Scroll */}
                <div className="hidden md:block overflow-auto custom-scrollbar flex-1 relative">
                    <table className="w-full table-auto text-left">
                        <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                            <tr className="border-b border-white/5">
                                <th className="py-2.5 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-[85px]">Data</th>
                                <th className="py-2.5 px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Descrição</th>
                                <th className="py-2.5 px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-[120px]">Categoria</th>
                                <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-[100px]">Valor</th>
                                <th className="text-right py-2.5 px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-[70px]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {localTransactions.map((t) => (
                                <tr key={t.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap text-xs">
                                        {formatDate(t.date)}
                                    </td>
                                    <td className="py-2 px-2 font-medium text-white text-xs truncate max-w-[140px]" title={t.description}>
                                        {t.description}
                                    </td>
                                    <td className="py-2 px-2">
                                        <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-medium text-slate-300 border border-white/5 inline-flex items-center gap-1.5 whitespace-nowrap truncate max-w-[110px]">
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                            {formatCategory(t.category)}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono text-xs whitespace-nowrap">
                                        <span className={t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}>
                                            {t.type === 'EXPENSE' && '− '}
                                            {formatCurrency(Number(t.amount))}
                                        </span>
                                    </td>
                                    <td className="py-2 px-2 text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-400 hover:text-white hover:bg-white/10"
                                                onClick={() => handleEditClick(t)}
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                                onClick={() => handleDeleteClick(t.id)}
                                                disabled={isDeleting === t.id}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {localTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                                        Nenhuma transação encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditTransactionDialog
                open={!!transactionToEdit}
                onOpenChange={(open) => !open && setTransactionToEdit(null)}
                transaction={transactionToEdit}
            />

            <Dialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
                <DialogContent className="sm:max-w-md border-white/10 bg-slate-900/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="text-amber-500 h-5 w-5" />
                            Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Tem certeza que deseja excluir esta transação? A ação não poderá ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setTransactionToDelete(null)}
                            className="text-slate-300 hover:text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={!!isDeleting}
                            className="bg-red-500 hover:bg-red-600 border-none relative"
                        >
                            {isDeleting ? (
                                <>
                                    <span className="opacity-0">Excluir</span>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    </div>
                                </>
                            ) : "Excluir"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
