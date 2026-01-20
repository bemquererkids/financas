'use client';

import { MonthData } from '@/lib/planning-engine';
import { addPlanningItem, replicateMonthToFuture, updatePlanningItem, deletePlanningItem, consolidateMonth } from '@/app/actions/planning-actions';
import { Button } from '@/components/ui/button';
import { Copy, Plus, X, Check, CheckCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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

// Componente para item editável inline
function EditableItem({
    item,
    onUpdate,
    onDelete,
    formatMoney,
    showNegative = false
}: {
    item: { id: string; description: string; amount: number | any };
    onUpdate: (id: string, amount: number) => void;
    onDelete: (id: string) => void;
    formatMoney: (val: number) => string;
    showNegative?: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = () => {
        setEditValue(String(Number(item.amount)));
        setIsEditing(true);
    };

    const handleSave = () => {
        const newAmount = parseFloat(editValue);
        if (!isNaN(newAmount) && newAmount > 0) {
            onUpdate(item.id, newAmount);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') setIsEditing(false);
    };

    return (
        <div className="group flex items-center justify-between text-sm text-slate-400 py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 rounded px-1 -mx-1 transition-all">
            <span className="truncate flex-1 mr-2">{item.description}</span>
            <div className="flex items-center gap-1">
                {isEditing ? (
                    <>
                        <Input
                            ref={inputRef}
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            className="w-24 h-6 text-xs glass-input text-right"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleSave}
                            className="h-6 w-6 text-emerald-400 hover:text-emerald-300"
                        >
                            <Check className="h-3 w-3" />
                        </Button>
                    </>
                ) : (
                    <>
                        <span
                            onClick={handleStartEdit}
                            className="cursor-pointer hover:text-white transition-colors font-mono"
                        >
                            {showNegative ? '-' : ''}{formatMoney(Number(item.amount))}
                        </span>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(item.id)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export function PlanningGrid({ initialData }: PlanningGridProps) {
    const { toast } = useToast();
    const [isReplicating, setIsReplicating] = useState(false);
    const [isConsolidating, setIsConsolidating] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const handleConsolidate = async (month: string) => {
        if (!confirm(`Consolidar o mês ${getMonthName(month)}? Isso marcará os itens planejados como realizados.`)) return;

        setIsConsolidating(true);
        try {
            const result = await consolidateMonth(month);
            toast({
                title: "Mês Consolidado",
                description: `${result.consolidated} itens consolidados com sucesso!`,
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Falha ao consolidar mês.",
                variant: "destructive"
            });
        } finally {
            setIsConsolidating(false);
        }
    };

    const handleUpdateItem = async (id: string, amount: number) => {
        try {
            await updatePlanningItem(id, amount);
            toast({ title: "Valor Atualizado" });
        } catch (error) {
            toast({ title: "Erro ao atualizar", variant: "destructive" });
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Excluir este item?')) return;
        try {
            await deletePlanningItem(id);
            toast({ title: "Item Excluído" });
        } catch (error) {
            toast({ title: "Erro ao excluir", variant: "destructive" });
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

    // Handle scroll for dot indicators
    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const cardWidth = scrollRef.current.offsetWidth * 0.85;
            const newIndex = Math.round(scrollLeft / cardWidth);
            setCurrentIndex(Math.min(newIndex, initialData.length - 1));
        }
    };

    const scrollToMonth = (index: number) => {
        if (scrollRef.current) {
            const cardWidth = scrollRef.current.offsetWidth * 0.85 + 16;
            scrollRef.current.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-6 overflow-hidden">
            {/* Dot Navigation - Mobile */}
            <div className="flex justify-center gap-1.5 md:hidden">
                {initialData.slice(0, 6).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => scrollToMonth(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx
                            ? 'bg-emerald-400 w-6'
                            : 'bg-white/20 hover:bg-white/40'
                            }`}
                    />
                ))}
                {initialData.length > 6 && (
                    <span className="text-xs text-slate-500">+{initialData.length - 6}</span>
                )}
            </div>

            {/* Main Scrolling Container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                <div className="flex gap-4 min-w-max px-4">
                    {initialData.map((data, idx) => (
                        <div
                            key={data.month}
                            className="w-[85vw] md:w-[350px] shrink-0 space-y-4 snap-center animate-fade-in"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            {/* Month Header */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <span className="font-bold text-lg text-white capitalize">{getMonthName(data.month)}</span>
                                <div className="flex gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleConsolidate(data.month)}
                                        className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                        title="Consolidar mês"
                                        disabled={isConsolidating}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                    </Button>
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
                            </div>

                            {/* 1. Renda Bruta */}
                            <div className="rounded-xl glass-card p-4 space-y-3 border-emerald-500/20 transition-transform hover:scale-[1.01] active:scale-[0.99]">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-emerald-400">Renda Bruta</span>
                                    <span className="font-mono text-emerald-400">{formatMoney(data.income.total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {data.income.items.map(i => (
                                        <EditableItem
                                            key={i.id}
                                            item={i}
                                            onUpdate={handleUpdateItem}
                                            onDelete={handleDeleteItem}
                                            formatMoney={formatMoney}
                                        />
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-sm h-10 mt-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                        onClick={() => openAddModal(data.month, 'INCOME', 'SALARIO')}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Adicionar
                                    </Button>
                                </div>
                            </div>

                            {/* 2. Descontos em Folha */}
                            <div className="rounded-xl glass-card p-4 space-y-3 border-amber-500/20 transition-transform hover:scale-[1.01] active:scale-[0.99]">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-amber-400">Descontos Folha</span>
                                    <span className="font-mono text-amber-400 line-through opacity-70">{formatMoney(data.payrollDeductions.total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {data.payrollDeductions.items.map(i => (
                                        <EditableItem
                                            key={i.id}
                                            item={i}
                                            onUpdate={handleUpdateItem}
                                            onDelete={handleDeleteItem}
                                            formatMoney={formatMoney}
                                            showNegative
                                        />
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-6 mt-2 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                        onClick={() => openAddModal(data.month, 'EXPENSE', 'PAYROLL_DEDUCTION')}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Adicionar Dedução
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
                            <div className="rounded-xl glass-card p-4 space-y-3 transition-transform hover:scale-[1.01] active:scale-[0.99]">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-sm font-medium text-slate-200">Fixas</span>
                                    <span className="font-mono text-slate-200">{formatMoney(data.fixedExpenses.total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {data.fixedExpenses.items.map(i => (
                                        <EditableItem
                                            key={i.id}
                                            item={i}
                                            onUpdate={handleUpdateItem}
                                            onDelete={handleDeleteItem}
                                            formatMoney={formatMoney}
                                        />
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-6 text-slate-500 hover:text-white"
                                        onClick={() => openAddModal(data.month, 'EXPENSE', 'Moradia')}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Adicionar Fixa
                                    </Button>
                                </div>
                            </div>

                            {/* 5. Cartão de Crédito */}
                            <div className="rounded-xl glass-card p-4 space-y-3 border-purple-500/20 transition-transform hover:scale-[1.01] active:scale-[0.99]">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-sm font-medium text-purple-400">Cartão Crédito</span>
                                    <span className="font-mono text-purple-400">{formatMoney(data.creditCard.total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {data.creditCard.items.map(i => (
                                        <EditableItem
                                            key={i.id}
                                            item={i}
                                            onUpdate={handleUpdateItem}
                                            onDelete={handleDeleteItem}
                                            formatMoney={formatMoney}
                                        />
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-6 text-purple-500 hover:text-purple-300"
                                        onClick={() => openAddModal(data.month, 'EXPENSE', 'CREDIT_CARD_BILL')}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Fatura
                                    </Button>
                                </div>
                            </div>

                            {/* 6. Lazer / Pessoal */}
                            <div className="rounded-xl glass-card p-4 space-y-3 transition-transform hover:scale-[1.01] active:scale-[0.99]">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-sm font-medium text-blue-300">Lazer & Pessoal</span>
                                    <span className="font-mono text-blue-300">{formatMoney(data.leisureExpenses.total)}</span>
                                </div>
                                <div className="space-y-1">
                                    {data.leisureExpenses.items.map(i => (
                                        <EditableItem
                                            key={i.id}
                                            item={i}
                                            onUpdate={handleUpdateItem}
                                            onDelete={handleDeleteItem}
                                            formatMoney={formatMoney}
                                        />
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-6 text-blue-500 hover:text-blue-300"
                                        onClick={() => openAddModal(data.month, 'EXPENSE', 'Lazer')}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Adic. Lazer
                                    </Button>
                                </div>
                            </div>

                            {/* Total Result */}
                            <div className={`rounded-xl p-4 border transition-transform hover:scale-[1.01] active:scale-[0.99] ${data.balance >= 0 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
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
