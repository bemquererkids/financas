'use client';

import { useState } from 'react';
import { createTransaction } from '@/app/actions/transaction-actions';
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

interface InlineTransactionFormProps {
    onSuccess?: () => void;
}

export function InlineTransactionForm({ onSuccess }: InlineTransactionFormProps) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const result = await createTransaction(formData);

        setLoading(false);
        if (result?.success) {
            onSuccess?.();
        } else {
            alert('Erro ao salvar');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type & Category Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Tipo</Label>
                    <Select name="type" required defaultValue="EXPENSE">
                        <SelectTrigger className="h-10 bg-white/5 border-white/10">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Receita</SelectItem>
                            <SelectItem value="EXPENSE">Despesa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Categoria</Label>
                    <Select name="category" required defaultValue="Outros">
                        <SelectTrigger className="h-10 bg-white/5 border-white/10">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Moradia">Moradia</SelectItem>
                            <SelectItem value="Mercado">Mercado</SelectItem>
                            <SelectItem value="Transporte">Transporte</SelectItem>
                            <SelectItem value="Lazer">Lazer</SelectItem>
                            <SelectItem value="Saúde">Saúde</SelectItem>
                            <SelectItem value="Investimento">Investimento</SelectItem>
                            <SelectItem value="Salário">Salário</SelectItem>
                            <SelectItem value="Extras">Renda Extra</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Descrição</Label>
                <Input
                    name="description"
                    placeholder="Ex: Aluguel, Uber..."
                    className="h-10 bg-white/5 border-white/10"
                    required
                />
            </div>

            {/* Amount & Date Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Valor</Label>
                    <Input
                        name="amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="h-10 bg-white/5 border-white/10"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Data</Label>
                    <Input
                        name="date"
                        type="date"
                        className="h-10 bg-white/5 border-white/10"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
                {loading ? 'Salvando...' : 'Salvar Transação'}
            </Button>
        </form>
    );
}
