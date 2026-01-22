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
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-hidden">
            <ModuleHeader
                title="Meus Objetivos"
                subtitle="Onde quero chegar"
            />

            <div className="max-w-5xl mx-auto space-y-4">
                {/* Add Goal Form - Compact */}
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
                        className="glass-input text-white w-32 h-9 text-sm"
                    />
                    <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Goals List - With Scroll */}
                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] pr-2">
                    {goals.length === 0 && (
                        <div className="flex items-center justify-center h-64 text-slate-500">
                            <div className="text-center">
                                <Target className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>Nenhum objetivo definido</p>
                            </div>
                        </div>
                    )}

                    {goals.map(goal => (
                        <div
                            key={goal.id}
                            className={`p-3 rounded-lg border flex items-center justify-between transition-all ${goal.status === 'COMPLETED'
                                ? 'bg-emerald-950/20 border-emerald-500/20 opacity-70'
                                : 'glass-card border-white/10 bg-white/5 hover:border-emerald-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                    onClick={async () => { await toggleGoalStatus(goal.id, goal.status); loadGoals(); }}
                                    className={`h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 transition ${goal.status === 'COMPLETED'
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-slate-500 text-transparent hover:border-emerald-400'
                                        }`}
                                >
                                    <Check className="h-3 w-3" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${goal.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-white'
                                        }`}>
                                        {goal.description}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(goal.createdAt).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {goal.targetAmount && (
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs bg-emerald-950/40 px-2 py-1 rounded-full border border-emerald-500/10">
                                        <Target className="h-3 w-3" />
                                        {formatCurrency(Number(goal.targetAmount))}
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-rose-400 hover:bg-rose-500/10"
                                    onClick={async () => {
                                        if (confirm('Excluir objetivo?')) { await deleteGoal(goal.id); loadGoals(); }
                                    }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
