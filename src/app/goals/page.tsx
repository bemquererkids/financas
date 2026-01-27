'use client';

import { useState, useEffect } from 'react';
import { getGoals, createGoal, toggleGoalStatus, deleteGoal } from '@/app/actions/goal-actions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Trash2, Plus, Target, Sparkles, Loader2, Calendar, PiggyBank, TrendingUp, Trophy } from 'lucide-react';
import { ModuleHeader } from '@/components/dashboard/ModuleHeader';
import { ChatWidget } from '@/components/ai/ChatWidget';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function GoalsPage() {
    const [goals, setGoals] = useState<any[] | null>(null);
    const [newItem, setNewItem] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [monthlySavings, setMonthlySavings] = useState(500);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => { loadGoals(); }, []);

    const loadGoals = async () => {
        const data = await getGoals();
        setGoals(data);
    };

    const handleAdd = async () => {
        if (!newItem) return;
        const formData = new FormData();
        formData.append('description', newItem);
        if (newAmount) formData.append('targetAmount', newAmount);

        await createGoal(formData);
        setNewItem('');
        setNewAmount('');
        setIsAdding(false);
        loadGoals();
        toast.success("Objetivo criado com sucesso!");
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="flex-1 p-4 md:p-6 space-y-8 overflow-hidden flex flex-col md:h-[calc(100vh-2rem)]">
            {/* Header Area */}
            <div className="flex-shrink-0 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <ModuleHeader
                    title="Cofre dos Sonhos"
                    subtitle="Defina suas metas e acompanhe o progresso."
                    className="mb-0"
                />

                <div className="flex flex-col sm:flex-row items-center gap-4 self-start md:self-auto w-full md:w-auto">
                    {/* Simulator Widget */}
                    <div className="h-12 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center px-4 gap-3 w-full sm:w-auto justify-between sm:justify-start ring-1 ring-inset ring-white/5 hover:ring-indigo-500/30 transition-all">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <PiggyBank className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Guardando</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-zinc-400 font-mono">R$</span>
                            <Input
                                type="number"
                                className="w-16 h-8 p-0 bg-transparent border-none text-white font-mono text-base font-medium focus-visible:ring-0 text-right"
                                value={monthlySavings}
                                onChange={(e) => setMonthlySavings(Number(e.target.value))}
                            />
                            <span className="text-xs text-zinc-500 font-medium">/mês</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Dialog open={isAdding} onOpenChange={setIsAdding}>
                            <DialogTrigger asChild>
                                <Button className="h-12 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 px-6 font-medium transition-all hover:scale-105 active:scale-95">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Novo Objetivo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white shadow-2xl overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                                <DialogHeader className="pt-4">
                                    <DialogTitle className="text-xl">O que você quer conquistar?</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                            <Target className="h-3 w-3" /> Descrição
                                        </label>
                                        <Input
                                            placeholder="Ex: Viagem para Europa, Carro Novo..."
                                            value={newItem}
                                            onChange={(e) => setNewItem(e.target.value)}
                                            className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                            <TrendingUp className="h-3 w-3" /> Valor Necessário (R$)
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={newAmount}
                                            onChange={(e) => setNewAmount(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                            className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-indigo-500 font-mono"
                                        />
                                    </div>
                                    <Button onClick={handleAdd} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 rounded-xl mt-2 transition-transform active:scale-95">
                                        Adicionar ao Cofre
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-6 custom-scrollbar">
                {!goals ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                    </div>
                ) : goals.length === 0 ? (
                    <EmptyState
                        useLogo={true}
                        title="O cofre está vazio"
                        description="Adicione seus sonhos aqui para calcularmos quanto tempo falta para realizá-los."
                        ctaLabel="Adicionar Primeiro Sonho"
                        onCtaClick={() => setIsAdding(true)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.map((goal, index) => {
                            const target = Number(goal.targetAmount || 0);
                            const monthsToReach = target > 0 && monthlySavings > 0 ? Math.ceil(target / monthlySavings) : 0;
                            const yearsToReach = (monthsToReach / 12).toFixed(1);
                            const isCompleted = goal.status === 'COMPLETED';

                            return (
                                <div
                                    key={goal.id}
                                    className={cn(
                                        "group relative flex flex-col h-[320px] rounded-3xl overflow-hidden transition-all duration-500",
                                        "bg-zinc-950 border border-white/5 shadow-2xl",
                                        isCompleted ? "opacity-50 grayscale-[0.5]" : "hover:translate-y-[-4px] hover:shadow-indigo-500/10"
                                    )}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Accent Line - Left */}
                                    <div className={cn(
                                        "absolute left-0 top-0 bottom-0 w-1.5 z-20 transition-all duration-500",
                                        isCompleted ? "bg-emerald-500" : "bg-gradient-to-b from-indigo-500 to-purple-600 group-hover:w-2"
                                    )} />

                                    {/* Content Container */}
                                    <div className="flex-1 p-6 md:p-8 flex flex-col relative z-10">

                                        {/* Status / Category Badge */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                                isCompleted
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                            )}>
                                                {isCompleted ? "Conquistado" : "Em Progresso"}
                                            </div>

                                            <button
                                                onClick={async (e) => { e.stopPropagation(); await toggleGoalStatus(goal.id, goal.status); loadGoals(); }}
                                                className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 border",
                                                    isCompleted
                                                        ? "bg-emerald-500 text-white border-emerald-500 rotate-0"
                                                        : "border-zinc-700 text-zinc-700 hover:border-emerald-500 hover:text-emerald-500 -rotate-90 hover:rotate-0"
                                                )}
                                                title={isCompleted ? "Reabrir" : "Concluir"}
                                            >
                                                {isCompleted ? <Trophy className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                            </button>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 flex flex-col gap-2">
                                            <h3 className={cn(
                                                "text-2xl font-bold tracking-tight leading-tight",
                                                isCompleted ? "text-zinc-500 line-through" : "text-white"
                                            )}>
                                                {goal.description}
                                            </h3>

                                            {target > 0 && (
                                                <div className="mt-auto">
                                                    <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-1">Meta</p>
                                                    <p className="text-3xl font-mono font-light text-zinc-200 tracking-tighter">
                                                        {formatCurrency(target)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer / Calculation */}
                                        <div className="mt-6 pt-6 border-t border-white/5">
                                            {isCompleted ? (
                                                <div className="flex items-center gap-2 text-emerald-500/80">
                                                    <Sparkles className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Objetivo Alcançado!</span>
                                                </div>
                                            ) : target > 0 ? (
                                                monthlySavings > 0 ? (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-indigo-500" />
                                                            <div>
                                                                <p className="text-sm text-white font-medium">
                                                                    ~{monthsToReach} meses
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {Number(yearsToReach) > 0 && (
                                                            <span className="text-xs text-zinc-500 bg-black/40 px-2 py-1 rounded-md">
                                                                {yearsToReach} anos
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-zinc-500 italic">Defina sua poupança para ver o prazo</p>
                                                )
                                            ) : (
                                                <p className="text-xs text-zinc-500">Valor não definido</p>
                                            )}
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 bg-zinc-800 text-rose-400 hover:bg-rose-500 hover:text-white rounded-full transition-colors shadow-lg"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Tem certeza que deseja excluir este objetivo?')) { await deleteGoal(goal.id); loadGoals(); }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Background Decor */}
                                    <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ChatWidget
                isOpen={chatOpen}
                onOpenChange={setChatOpen}
                initialInput={chatInput}
                showUploads={false}
                inputPlaceholder="Digite sua dúvida sobre objetivos..."
                welcomeMessage="Olá! Sou seu estrategista financeiro. Quer ajuda para definir metas realistas, calcular prazos ou criar um plano para atingir seus sonhos mais rápido?"
                context="goals"
            />
        </div>
    );
}
