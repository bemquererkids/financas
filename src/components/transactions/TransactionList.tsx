'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, MoreHorizontal } from "lucide-react";
import { deleteTransaction } from "@/app/actions/transaction-crud";
import { useState } from "react";
// import { EditTransactionDialog } from "./EditTransactionDialog"; // To create

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

    return (
        <div className="rounded-3xl glass-card overflow-hidden mt-8">
            <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white">Histórico de Transações</h3>
                    <p className="text-sm text-slate-400">Últimos lançamentos registrados.</p>
                </div>
            </div>
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="text-slate-200">Data</TableHead>
                        <TableHead className="text-slate-200">Descrição</TableHead>
                        <TableHead className="text-slate-200">Categoria</TableHead>
                        <TableHead className="text-right text-slate-200">Valor</TableHead>
                        <TableHead className="text-right text-slate-200">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((t) => (
                        <TableRow key={t.id} className="hover:bg-white/5 border-white/5">
                            <TableCell className="text-slate-400">
                                {new Date(t.date).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="font-medium text-white">{t.description}</TableCell>
                            <TableCell className="text-slate-400">
                                <span className="px-2 py-1 rounded-full bg-white/5 text-xs">
                                    {t.category}
                                </span>
                            </TableCell>
                            <TableCell className={`text-right font-mono ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                {t.type === 'EXPENSE' ? '-' : '+'} {formatCurrency(Number(t.amount))}
                            </TableCell>
                            <TableCell className="text-right">
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
                            </TableCell>
                        </TableRow>
                    ))}
                    {transactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                Nenhuma transação encontrada.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
