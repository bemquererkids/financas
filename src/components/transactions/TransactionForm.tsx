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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';

export function TransactionForm() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const result = await createTransaction(formData);

        setLoading(false);
        if (result?.success) {
            setOpen(false);
            // Opcional: Toast de sucesso aqui
        } else {
            alert('Erro ao salvar');
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Transação
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Transação</DialogTitle>
                    <DialogDescription>
                        Lance uma nova receita ou despesa no seu controle.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Tipo</Label>
                        <div className="col-span-3">
                            <Select name="type" required defaultValue="EXPENSE">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">Receita (Entrada)</SelectItem>
                                    <SelectItem value="EXPENSE">Despesa (Saída)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Categoria</Label>
                        <div className="col-span-3">
                            <Select name="category" required defaultValue="Outros">
                                <SelectTrigger>
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Categorias da Planilha original */}
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

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Descrição</Label>
                        <Input id="description" name="description" placeholder="Ex: Aluguel, Uber..." className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Valor</Label>
                        <Input id="amount" name="amount" type="number" step="0.01" placeholder="0,00" className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Data</Label>
                        <Input id="date" name="date" type="date" className="col-span-3" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Transação'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
