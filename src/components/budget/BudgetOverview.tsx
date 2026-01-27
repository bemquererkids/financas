'use client';

import { useState, useEffect } from 'react';
import { getBudgetsStatus, upsertBudget } from '@/app/actions/budget-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BudgetStatus {
    id: string;
    category: string;
    limit: number;
    spent: number;
    percentage: number;
    remaining: number;
}

export function BudgetOverview() {
    const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const data = await getBudgetsStatus();
        setBudgets(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const getProgressColor = (pct: number) => {
        if (pct >= 100) return 'bg-red-600';
        if (pct >= 80) return 'bg-orange-500';
        return 'bg-emerald-500';
    };

    // Form logic
    const handleSaveBudget = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const category = formData.get('category') as string;
        const amountStr = formData.get('amount') as string;

        // Simple parse (R$ 1.000,00 -> 1000.00) logic repeated (shared lib would be better)
        const amount = Number(amountStr.replace(/\D/g, '')) / 100;

        await upsertBudget(category, amount);
        setIsDialogOpen(false);
        loadData();
    };

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">📊</span>
                    Orçamentos Mensais
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20">
                            <Plus className="h-4 w-4 mr-1" /> Definir
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-white">Definir Orçamento</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveBudget} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-slate-400">Categoria</Label>
                                <Select name="category" required>
                                    <SelectTrigger className="bg-slate-900 border-slate-700">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700">
                                        {['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Compras', 'Outros'].map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400">Limite Mensal</Label>
                                <Input
                                    name="amount"
                                    placeholder="R$ 0,00"
                                    className="bg-slate-900 border-slate-700"
                                    required
                                    onChange={(e) => {
                                        // Mask logic
                                        const val = e.target.value.replace(/\D/g, '');
                                        const float = Number(val) / 100;
                                        e.target.value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(float);
                                    }}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Salvar</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-6">
                {loading ? (
                    <div className="flex justify-center p-4"><span className="animate-spin">⏳</span></div>
                ) : budgets.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 text-sm">
                        Nenhum orçamento definido. <br /> Clique em "Definir" para controlar seus gastos.
                    </div>
                ) : (
                    budgets.map(b => (
                        <div key={b.id} className="space-y-2 group">
                            <div className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-200">{b.category}</span>
                                    {b.percentage >= 100 && (
                                        <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" />
                                    )}
                                </div>
                                <div className="text-slate-400">
                                    <span className={b.percentage >= 100 ? "text-red-400 font-bold" : "text-slate-200"}>
                                        {formatCurrency(b.spent)}
                                    </span>
                                    <span className="text-xs mx-1">de</span>
                                    {formatCurrency(b.limit)}
                                </div>
                            </div>
                            <div className="relative h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${getProgressColor(b.percentage)}`}
                                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>{b.percentage.toFixed(0)}% usado</span>
                                <span>Restante: {formatCurrency(b.remaining)}</span>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
