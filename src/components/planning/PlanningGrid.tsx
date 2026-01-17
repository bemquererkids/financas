'use client';

import { MonthData } from '@/lib/planning-engine';
import { addPlanningItem, replicateMonthToFuture } from '@/app/actions/planning-actions';
import { Button } from '@/components/ui/button';
import { Copy, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface PlanningGridProps {
    initialData: MonthData[];
}

export function PlanningGrid({ initialData }: PlanningGridProps) {
    const { toast } = useToast();
    const [isReplicating, setIsReplicating] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    // Edit Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        amount: '',
        description: '',
        category: 'OUTROS',
        type: 'EXPENSE'
    });
    const [targetMonth, setTargetMonth] = useState<string>('');

    const handleReplicate = async (month: string) => {
        if (!confirm(`Deseja replicar as contas de ${month} para o resto do ano?`)) return;

        setIsReplicating(true);
        try {
            await replicateMonthToFuture(month);
            toast({
                title: "Sucesso",
                description: "Dados replicados com sucesso!",
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Falha ao replicar dados.",
                variant: "destructive"
            });
        } finally {
            setIsReplicating(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.amount || !newItem.description || !targetMonth) return;

        await addPlanningItem(
            targetMonth,
            parseFloat(newItem.amount),
            newItem.description,
            newItem.type as 'INCOME' | 'EXPENSE',
            newItem.category
        );

        setIsAddOpen(false);
        setNewItem({ amount: '', description: '', category: 'OUTROS', type: 'EXPENSE' });
        toast({ title: "Item Adicionado" });
    };

    const openAddModal = (month: string, type: string, defaultCategory: string) => {
        setTargetMonth(month);
        setNewItem(prev => ({ ...prev, type, category: defaultCategory }));
        setIsAddOpen(true);
    };

    const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const getMonthName = (dateStr: string) => {
        const [y, m] = dateStr.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1, 1);
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-6 overflow-hidden">
            {/* Main Scrolling Container */}
            <div className="overflow-x-auto pb-6 hide-scrollbar">
                <div className="flex gap-4 min-w-max">
                    {initialData.map((data) => (
                        <div key={data.month} className="w-[320px] shrink-0 space-y-4">
                            {/* Month Header */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <span className="font-bold text-lg text-white capitalize">{getMonthName(data.month)}</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleReplicate(data.month)}
                                    className="h-8 w-8 text-slate-400 hover:text-white"
                                    title="Replicar para meses futuros"
                                    disabled={isReplicating}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* 1. Renda Bruta */}
                            <div className="rounded-xl glass-card p-4 space-y-3 border-emerald-500/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-emerald-400">Renda Bruta</span>
                                    <span className="font-mono text-emerald-400">{formatMoney(data.income.total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {data.income.items.map(i => (
                                        <div key={i.id} className="flex justify-between text-xs text-slate-400">
                                            <span>{i.description}</span>
                                            <span>{formatMoney(Number(i.amount))}</span>
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-6 mt-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                        onClick={() => openAddModal(data.month, 'INCOME', 'SALARIO')}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Adicionar
                                    </Button>
                                </div>
                            </div>

                            {/* 2. Descontos em Folha */}
                            <div className="rounded-xl glass-card p-4 space-y-3 border-amber-500/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-amber-400">Descontos Folha</span>
                                    <span className="font-mono text-amber-400 line-through opacity-70">{formatMoney(data.payrollDeductions.total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {data.payrollDeductions.items.map(i => (
                                        <div key={i.id} className="flex justify-between text-xs text-slate-400">
                                            <span>{i.description}</span>
                                            <span>-{formatMoney(Number(i.amount))}</span>
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-6 mt-2 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                        onClick={() => openAddModal(data.month, 'EXPENSE', 'PAYROLL_DEDUCTION')}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Adicionar Deducao
                                    </Button>
                                </div>
                            </div>

                            {/* 3. Result: Renda Líquida */}
                            <div className="rounded-xl bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 p-4 border border-emerald-500/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-white">Renda Líquida Real</span>
                                    <span className="font-mono font-bold text-white">{formatMoney(data.netIncome)}</span>
                                </div>
                            </div>

                            {/* 4. Contas Fixas */}
                            <div className="rounded-xl glass-card p-4 space-y-3">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-sm font-medium text-slate-200">Fixas</span>
                                    <span className="font-mono text-slate-200">{formatMoney(data.fixedExpenses.total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {data.fixedExpenses.items.map(i => (
                                        <div key={i.id} className="flex justify-between text-xs text-slate-400">
                                            <span>{i.description}</span>
                                            <span>{formatMoney(Number(i.amount))}</span>
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-6 text-slate-500 hover:text-white"
                                        onClick={() => openAddModal(data.month, 'EXPENSE', 'Moradia')}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Adicionar Fixa
                                    </Button>
                                </div>
                            </div>

                            {/* 5. Cartão de Crédito */}
                            <div className="rounded-xl glass-card p-4 space-y-3 border-purple-500/20">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-sm font-medium text-purple-400">Cartão Crédito</span>
                                    <span className="font-mono text-purple-400">{formatMoney(data.creditCard.total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {data.creditCard.items.map(i => (
                                        <div key={i.id} className="flex justify-between text-xs text-slate-400">
                                            <span>{i.description}</span>
                                            <span>{formatMoney(Number(i.amount))}</span>
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-6 text-purple-500 hover:text-purple-300"
                                        onClick={() => openAddModal(data.month, 'EXPENSE', 'CREDIT_CARD_BILL')}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Fatura
                                    </Button>
                                </div>
                            </div>

                            {/* 6. Lazer / Pessoal */}
                            <div className="rounded-xl glass-card p-4 space-y-3">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-sm font-medium text-blue-300">Lazer & Pessoal</span>
                                    <span className="font-mono text-blue-300">{formatMoney(data.leisureExpenses.total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {data.leisureExpenses.items.map(i => (
                                        <div key={i.id} className="flex justify-between text-xs text-slate-400">
                                            <span>{i.description}</span>
                                            <span>{formatMoney(Number(i.amount))}</span>
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-6 text-blue-500 hover:text-blue-300"
                                        onClick={() => openAddModal(data.month, 'EXPENSE', 'Lazer')}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Adic. Lazer
                                    </Button>
                                </div>
                            </div>

                            {/* Total Result */}
                            <div className={`rounded-xl p-4 border ${data.balance >= 0 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-white">Sobra / Falta</span>
                                    <span className={`font-mono font-bold ${data.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatMoney(data.balance)}
                                    </span>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {/* Add Item Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="glass-card text-white border-white/10">
                    <DialogHeader>
                        <DialogTitle>Adicionar Item ao Planejamento</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Descrição</Label>
                            <Input
                                className="glass-input"
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Valor</Label>
                            <Input
                                type="number"
                                className="glass-input"
                                value={newItem.amount}
                                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Categoria</Label>
                            <Select
                                value={newItem.category}
                                onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                            >
                                <SelectTrigger className="glass-input text-white">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white max-h-[300px]">
                                    <SelectItem value="SALARIO" className="text-emerald-400 font-bold">Renda: Salário</SelectItem>
                                    <SelectItem value="RENDA_EXTRA" className="text-emerald-400 font-bold">Renda: Extra</SelectItem>

                                    <div className="px-2 py-1 text-xs text-slate-500 font-bold uppercase mt-2">Deduções</div>
                                    <SelectItem value="PAYROLL_DEDUCTION">Empréstimo Consignado</SelectItem>
                                    <SelectItem value="Previdencia">Previdência Privada</SelectItem>
                                    <SelectItem value="Adiantamento">Adiantamento Salarial</SelectItem>

                                    <div className="px-2 py-1 text-xs text-slate-500 font-bold uppercase mt-2">Essenciais / Casa</div>
                                    <SelectItem value="Moradia">Moradia / Aluguel</SelectItem>
                                    <SelectItem value="Condominio">Condomínio</SelectItem>
                                    <SelectItem value="Luz">Luz</SelectItem>
                                    <SelectItem value="Agua">Água</SelectItem>
                                    <SelectItem value="Gas">Gás</SelectItem>
                                    <SelectItem value="Internet">Internet</SelectItem>
                                    <SelectItem value="Telefone Fixo">Telefone Fixo</SelectItem>
                                    <SelectItem value="Celular">Celular</SelectItem>
                                    <SelectItem value="Diarista">Diarista</SelectItem>
                                    <SelectItem value="IPTU">IPTU</SelectItem>

                                    <div className="px-2 py-1 text-xs text-slate-500 font-bold uppercase mt-2">Alimentação & Transporte</div>
                                    <SelectItem value="Mercado">Mercado (Mês)</SelectItem>
                                    <SelectItem value="Gasolina">Gasolina / Uber</SelectItem>

                                    <div className="px-2 py-1 text-xs text-slate-500 font-bold uppercase mt-2">Saúde & Bem-estar</div>
                                    <SelectItem value="Convenio">Convênio Médico</SelectItem>
                                    <SelectItem value="Terapia">Terapia</SelectItem>
                                    <SelectItem value="Academia">Academia</SelectItem>
                                    <SelectItem value="Personal">Personal Trainer</SelectItem>
                                    <SelectItem value="Estetica">Estética Geral</SelectItem>
                                    <SelectItem value="Cabelo">Cabelo</SelectItem>
                                    <SelectItem value="Unha">Unha e Depilação</SelectItem>

                                    <div className="px-2 py-1 text-xs text-slate-500 font-bold uppercase mt-2">Pets</div>
                                    <SelectItem value="Comida Pet">Comida Pet</SelectItem>
                                    <SelectItem value="Banho Pet">Banho Pet</SelectItem>

                                    <div className="px-2 py-1 text-xs text-slate-500 font-bold uppercase mt-2">Carro</div>
                                    <SelectItem value="Parcela Carro">Parcela do Carro</SelectItem>
                                    <SelectItem value="Seguro Carro">Seguro do Carro</SelectItem>

                                    <div className="px-2 py-1 text-xs text-slate-500 font-bold uppercase mt-2">Outros</div>
                                    <SelectItem value="CREDIT_CARD_BILL">Fatura Cartão</SelectItem>
                                    <SelectItem value="Educacao">Educação</SelectItem>
                                    <SelectItem value="Dizimo">Dízimo</SelectItem>
                                    <SelectItem value="Netflix">Netflix</SelectItem>
                                    <SelectItem value="Spotify">Spotify</SelectItem>
                                    <SelectItem value="OUTROS">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddItem} className="w-full bg-emerald-500 hover:bg-emerald-600">
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
