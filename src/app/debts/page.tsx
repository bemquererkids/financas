'use client';

import { useState, useEffect } from 'react';
import { getDebts, createDebt, payoffDebt, deleteDebt } from '@/app/actions/debt-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Trash2, CheckCircle, CreditCard, Plus } from 'lucide-react';
import { ModuleHeader } from '@/components/dashboard/ModuleHeader';

export default function DebtsPage() {
    const [debts, setDebts] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => { loadDebts(); }, []);

    const loadDebts = async () => {
        const data = await getDebts();
        setDebts(data);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-hidden">
            <ModuleHeader
                title="Passivos & Dívidas"
                subtitle="Gerenciamento de obrigações financeiras"
            >
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`${isAdding ? 'bg-slate-600 hover:bg-slate-700' : 'bg-rose-600 hover:bg-rose-700'} text-white`}
                >
                    {isAdding ? 'Cancelar' : <><Plus className="mr-2 h-4 w-4" /> Nova Dívida</>}
                </Button>
            </ModuleHeader>

            {isAdding && (
                <div className="p-4 rounded-xl glass-card border border-rose-500/20 bg-rose-950/20 animate-in fade-in">
                    <h3 className="text-base font-bold text-white mb-3">Registrar Nova Dívida</h3>
                    <form action={async (formData) => {
                        await createDebt(formData);
                        setIsAdding(false);
                        loadDebts();
                    }} className="grid gap-3 md:grid-cols-4 items-end">
                        <div className="md:col-span-1">
                            <Input name="name" placeholder="Descrição" required className="glass-input text-white h-9 text-sm" />
                        </div>
                        <div>
                            <Input name="totalValue" type="number" step="0.01" placeholder="Valor Total" required className="glass-input text-white h-9 text-sm" />
                        </div>
                        <div>
                            <Input name="monthlyPayment" type="number" step="0.01" placeholder="Parcela Mensal" className="glass-input text-white h-9 text-sm" />
                        </div>
                        <div>
                            <Input name="interestRate" type="number" step="0.01" placeholder="Juros % a.m." className="glass-input text-white h-9 text-sm" />
                        </div>
                        <Button type="submit" className="bg-rose-600 hover:bg-rose-700 w-full md:col-span-4 h-9 text-sm">Salvar Dívida</Button>
                    </form>
                </div>
            )}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                {debts.map(debt => {
                    const paidPercentage = ((debt.totalValue - debt.remainingValue) / debt.totalValue) * 100;
                    const isPaid = debt.status === 'PAID' || paidPercentage >= 100;

                    return (
                        <Card key={debt.id} className={`glass-card border-white/5 ${isPaid ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-white/5'}`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-slate-200 truncate">{debt.name}</CardTitle>
                                <CreditCard className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-xl font-bold text-white">{formatCurrency(debt.remainingValue)}</div>
                                    <p className="text-xs text-slate-500">de {formatCurrency(debt.totalValue)}</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Progresso</span>
                                        <span>{isPaid ? '100%' : `${paidPercentage.toFixed(0)}%`}</span>
                                    </div>
                                    <Progress value={paidPercentage} className="h-1.5 bg-white/10" indicatorClassName={isPaid ? "bg-emerald-500" : "bg-rose-500"} />
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div className="text-xs">
                                        <span className="block text-slate-500">Parcela</span>
                                        <span className="text-slate-300 font-medium">{formatCurrency(debt.monthlyPayment)}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {!isPaid && (
                                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" onClick={async () => {
                                                if (confirm('Marcar como quitado?')) { await payoffDebt(debt.id); loadDebts(); }
                                            }}>
                                                <CheckCircle className="h-3 w-3" />
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-rose-400 hover:bg-rose-500/10" onClick={async () => {
                                            if (confirm('Excluir registro?')) { await deleteDebt(debt.id); loadDebts(); }
                                        }}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {debts.length === 0 && !isAdding && (
                <EmptyState
                    icon={CheckCircle}
                    title="Zero dívidas! Que paz."
                    description="Parabéns! Você não tem pendências registradas. Se surgir algo, adicione aqui para criar um plano de quitação."
                    ctaLabel="Registrar Dívida"
                    onCtaClick={() => setIsAdding(true)}
                />
            )}
        </div>
    );
}
