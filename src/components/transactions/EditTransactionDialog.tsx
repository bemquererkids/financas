'use client';

import { useState, useEffect } from 'react';
import { updateTransaction } from '@/app/actions/transaction-crud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    type: string;
    date: string;
}

interface EditTransactionDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({ transaction, open, onOpenChange }: EditTransactionDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!transaction) return;

        setLoading(true);
        try {
            const formData = new FormData(event.currentTarget);
            const result = await updateTransaction(transaction.id, formData);

            if (result && 'success' in result) {
                onOpenChange(false);
                router.refresh(); // Atualiza a lista
            } else {
                alert('Erro ao atualizar. Tente novamente.');
            }
        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    }

    if (!transaction) return null;

    // Formata data ISO (2023-01-01T00:00...) para YYYY-MM-DD para o input
    const dateValue = transaction.date.split('T')[0];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900/95 backdrop-blur-xl border-white/10 text-white shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Editar Transação
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Faça ajustes nos detalhes da sua transação.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-slate-300">Tipo</Label>
                            <Select name="type" defaultValue={transaction.type} required>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-purple-500/50">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="INCOME">Receita</SelectItem>
                                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-slate-300">Categoria</Label>
                            <Select name="category" defaultValue={transaction.category} required>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-purple-500/50">
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white max-h-60">
                                    <SelectItem value="Moradia">Moradia</SelectItem>
                                    <SelectItem value="Mercado">Mercado</SelectItem>
                                    <SelectItem value="Transporte">Transporte</SelectItem>
                                    <SelectItem value="Lazer">Lazer</SelectItem>
                                    <SelectItem value="Saúde">Saúde</SelectItem>
                                    <SelectItem value="Educação">Educação</SelectItem>
                                    <SelectItem value="Compras">Compras</SelectItem>
                                    <SelectItem value="Investimento">Investimento</SelectItem>
                                    <SelectItem value="Salário">Salário</SelectItem>
                                    <SelectItem value="Extras">Renda Extra</SelectItem>
                                    <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-300">Descrição</Label>
                        <Input
                            id="description"
                            name="description"
                            defaultValue={transaction.description}
                            placeholder="Ex: Aluguel"
                            className="bg-white/5 border-white/10 text-white focus:ring-purple-500/50 placeholder:text-slate-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-slate-300">Valor (R$)</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                defaultValue={transaction.amount}
                                className="bg-white/5 border-white/10 text-white focus:ring-purple-500/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-slate-300">Data</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                defaultValue={dateValue}
                                className="bg-white/5 border-white/10 text-white focus:ring-purple-500/50 [color-scheme:dark]"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-slate-300 hover:text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
