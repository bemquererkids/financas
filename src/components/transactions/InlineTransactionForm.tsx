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
    defaultType?: 'INCOME' | 'EXPENSE';
}

export function InlineTransactionForm({ onSuccess, defaultType = 'EXPENSE' }: InlineTransactionFormProps) {
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');

    const formatCurrency = (value: string) => {
        // Remove tudo que não é dígito
        const numericValue = value.replace(/\D/g, '');

        // Converte para centavos (ex: "100" -> 1.00)
        // Se vazio, retorna 0
        if (!numericValue) return '';

        const floatValue = Number(numericValue) / 100;

        // Formata para BRL (R$ 0,00)
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(floatValue);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setAmount(formatCurrency(rawValue));
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        // Limpar o valor do amount (R$ 1.000,00 -> 1000.00) para o backend
        // Se o usuario digitou, limpa. Se não, usa 0.
        const rawAmt = amount ? amount.replace(/[R$\s.]/g, '').replace(',', '.') : '0';
        formData.set('amount', rawAmt);

        const result = await createTransaction(formData);

        setLoading(false);
        if (result?.success) {
            setAmount(''); // Reset
            // Reset form fields
            event.currentTarget.reset();
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
                    <Select name="type" required defaultValue={defaultType}>
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
                        name="amount_display"
                        value={amount}
                        onChange={handleAmountChange}
                        type="text"
                        inputMode="numeric"
                        placeholder="R$ 0,00"
                        className="h-10 bg-white/5 border-white/10 font-bold text-emerald-400"
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
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold"
            >
                {loading ? 'Salvando...' : 'Salvar Transação'}
            </Button>
        </form>
    );
}
