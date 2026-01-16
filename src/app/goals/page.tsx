'use client';

import { useState, useEffect } from 'react';
import { getGoals, createGoal, toggleGoalStatus, deleteGoal } from '@/app/actions/goal-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Trash2, Plus, Target } from 'lucide-react';

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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-1">Objetivos & Metas</h2>
                    <p className="text-slate-400">Roadmap financeiro e pontos de ação.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="flex gap-4 mb-8">
                    <Input
                        placeholder="Novo objetivo (ex: Viajar para Europa)"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        className="glass-input text-white flex-1"
                    />
                    <Input
                        placeholder="Valor Alvo (Opcional)"
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="glass-input text-white w-[180px]"
                    />
                    <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid gap-4">
                    {goals.length === 0 && <p className="text-center text-slate-500 py-10">Nenhum objetivo definido.</p>}

                    {goals.map(goal => (
                        <div key={goal.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${goal.status === 'COMPLETED' ? 'bg-emerald-950/20 border-emerald-500/20 opacity-60' : 'glass-card border-white/10 bg-white/5'}`}>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={async () => { await toggleGoalStatus(goal.id, goal.status); loadGoals(); }}
                                    className={`h-6 w-6 rounded-full border flex items-center justify-center transition ${goal.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-500 text-transparent hover:border-emerald-400'}`}
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                                <div>
                                    <p className={`font-medium ${goal.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-white'}`}>
                                        {goal.description}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Criado em {new Date(goal.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {goal.targetAmount && (
                                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/10">
                                        <Target className="h-3 w-3" />
                                        {formatCurrency(Number(goal.targetAmount))}
                                    </div>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-500/10" onClick={async () => {
                                    if (confirm('Excluir objetivo?')) { await deleteGoal(goal.id); loadGoals(); }
                                }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
