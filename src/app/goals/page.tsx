'use client';

import { useState, useEffect } from 'react';
import { getGoals, createGoal, toggleGoalStatus, deleteGoal } from '@/app/actions/goal-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Trash2, Plus, Target } from 'lucide-react';
import { ModuleHeader } from '@/components/dashboard/ModuleHeader';

export default function GoalsPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [newItem, setNewItem] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [monthlySavings, setMonthlySavings] = useState(500); // Simulador de capacidade

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
        loadGoals();
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-hidden flex flex-col">
            <ModuleHeader
                title="Meus Objetivos"
                subtitle="Onde quero chegar e viabilidade"
            />

            <div className="max-w-5xl mx-auto w-full space-y-4 flex-1 flex flex-col min-h-0">

                {/* Simulador de Viabilidade (Novo) */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium text-sm">Ritmo de Conquista</h4>
                            <p className="text-slate-400 text-xs">Quanto você guarda por mês para seus sonhos?</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">R$</span>
                        <Input
                            type="number"
                            className="w-24 h-9 glass-input text-white text-right font-mono"
                            value={monthlySavings}
                            onChange={(e) => setMonthlySavings(Number(e.target.value))}
                        />
                        <span className="text-xs text-slate-500">/mês</span>
                    </div>
                </div>

                {/* Add Goal Form */}
                <div className="flex gap-2 p-3 rounded-xl glass-card border border-white/10 bg-white/5">
                    <Input
                        placeholder="Novo objetivo (ex: Viajar para Europa)"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="glass-input text-white flex-1 h-9 text-sm"
                    />
                    <Input
                        placeholder="Valor Alvo"
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="glass-input text-white w-28 h-9 text-sm"
                    />
                    <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Goals List */}
                <div className="space-y-2 overflow-y-auto pr-2 flex-1">
                    {goals.length === 0 && (
                        <div className="flex items-center justify-center h-48 text-slate-500">
                            <div className="text-center">
                                <Target className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>Nenhum objetivo definido</p>
                            </div>
                        </div>
                    )}

                    {goals.map(goal => {
                        const target = Number(goal.targetAmount || 0);
                        const monthsToReach = target > 0 && monthlySavings > 0 ? Math.ceil(target / monthlySavings) : 0;
                        const yearsToReach = (monthsToReach / 12).toFixed(1);

                        return (
                            <div
                                key={goal.id}
                                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${goal.status === 'COMPLETED'
                                    ? 'bg-emerald-950/20 border-emerald-500/20 opacity-70'
                                    : 'glass-card border-white/10 bg-white/5 hover:border-emerald-500/30 group'
                                    }`}
                            >
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <button
                                        onClick={async () => { await toggleGoalStatus(goal.id, goal.status); loadGoals(); }}
                                        className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 transition ${goal.status === 'COMPLETED'
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-slate-500 text-transparent hover:border-emerald-400 font-bold'
                                            }`}
                                    >
                                        <Check className="h-3 w-3" />
                                    </button>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <p className={`text-sm font-medium truncate ${goal.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-white'}`}>
                                            {goal.description}
                                        </p>

                                        {/* Viabilidade Display */}
                                        {target > 0 && goal.status !== 'COMPLETED' && (
                                            <div className="flex items-center gap-2 text-xs flex-wrap">
                                                <span className="text-emerald-400 font-mono bg-emerald-950/30 px-1.5 rounded">{formatCurrency(target)}</span>
                                                {monthlySavings > 0 && (
                                                    <span className="text-slate-400 flex items-center gap-1">
                                                        <span>•</span>
                                                        <span>~{monthsToReach} meses</span>
                                                        <span className="opacity-50">({yearsToReach} anos)</span>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {goal.status === 'COMPLETED' && <p className="text-xs text-emerald-400">Conquistado! 🎉</p>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:self-center pl-9 sm:pl-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={async () => {
                                            if (confirm('Excluir objetivo?')) { await deleteGoal(goal.id); loadGoals(); }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
