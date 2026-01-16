'use client';

import { useState, useEffect } from 'react';
import { getDebts, createDebt, payoffDebt, deleteDebt } from '@/app/actions/debt-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Trash2, CheckCircle, CreditCard, Plus } from 'lucide-react';

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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-1">Passivos & Dívidas</h2>
                    <p className="text-slate-400">Gerenciamento de obrigações financeiras.</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} className="bg-rose-600 hover:bg-rose-700 text-white">
                    {isAdding ? 'Cancelar' : <><Plus className="mr-2 h-4 w-4" /> Nova Dívida</>}
                </Button>
            </div>

            {isAdding && (
                <div className="mb-8 p-6 rounded-3xl glass-card border border-rose-500/20 bg-rose-950/20">
                    <h3 className="text-lg font-bold text-white mb-4">Registrar Nova Dívida</h3>
                    <form action={async (formData) => {
                        await createDebt(formData);
                        setIsAdding(false);
                        loadDebts();
                    }} className="grid gap-4 md:grid-cols-4 items-end">
                        <div className="md:col-span-1">
                            <Input name="name" placeholder="Descrição (ex: Empréstimo Santander)" required className="glass-input text-white" />
                        </div>
                        <div>
                            <Input name="totalValue" type="number" step="0.01" placeholder="Valor Total (R$)" required className="glass-input text-white" />
                        </div>
                        <div>
                            <Input name="monthlyPayment" type="number" step="0.01" placeholder="Parcela Mensal (R$)" className="glass-input text-white" />
                        </div>
                        <div>
                            <Input name="interestRate" type="number" step="0.01" placeholder="Juros % a.m." className="glass-input text-white" />
                        </div>
                        <Button type="submit" className="glass-button w-full md:col-span-4">Salvar Dívida</Button>
                    </form>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {debts.map(debt => {
                    const paidPercentage = ((debt.totalValue - debt.remainingValue) / debt.totalValue) * 100;
                    const isPaid = debt.status === 'PAID' || paidPercentage >= 100;

                    return (
                        <Card key={debt.id} className={`glass-card border-white/5 ${isPaid ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-white/5'}`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-200">{debt.name}</CardTitle>
                                <CreditCard className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white mb-1">{formatCurrency(debt.remainingValue)}</div>
                                <p className="text-xs text-slate-400 mb-4">Restante de {formatCurrency(debt.totalValue)}</p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-300">
                                        <span>Progresso</span>
                                        <span>{isPaid ? '100% Pago' : `${paidPercentage.toFixed(1)}% Pago`}</span>
                                    </div>
                                    <Progress value={paidPercentage} className="h-2 bg-white/10" indicatorClassName={isPaid ? "bg-emerald-500" : "bg-rose-500"} />
                                </div>

                                <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="text-xs">
                                        <span className="block text-slate-500">Parcela</span>
                                        <span className="text-slate-300">{formatCurrency(debt.monthlyPayment)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isPaid && (
                                            <Button size="sm" variant="outline" className="h-8 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" onClick={async () => {
                                                if (confirm('Marcar como quitado?')) { await payoffDebt(debt.id); loadDebts(); }
                                            }}>
                                                <CheckCircle className="h-3 w-3 mr-1" /> Quitar
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" className="h-8 text-rose-400 hover:bg-rose-500/10" onClick={async () => {
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
        </div>
    );
}
