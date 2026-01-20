'use client';

import { useState, useEffect } from 'react';
import { getPaymentWindows, addPayable, togglePayableStatus } from '@/app/actions/payment-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle, Circle, Calendar } from 'lucide-react';
import { ModuleHeader } from '@/components/dashboard/ModuleHeader';

export default function PaymentsPage() {
    const [data, setData] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await getPaymentWindows();
        setData(res);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-6">
            <ModuleHeader
                title="Pagamentos"
                subtitle="Controle de contas por Janelas (7, 15, 30)"
            >
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`${isAdding ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}
                >
                    {isAdding ? 'Cancelar' : <><Plus className="mr-2 h-4 w-4" /> Nova Conta</>}
                </Button>
            </ModuleHeader>

            {isAdding && (
                <div className="mb-8 p-6 rounded-3xl glass-card border border-emerald-500/20 bg-emerald-950/20 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-white mb-4">Adicionar Conta a Pagar</h3>
                    <form action={async (formData) => {
                        await addPayable(formData);
                        setIsAdding(false);
                        loadData();
                    }} className="grid gap-4 md:grid-cols-5 items-end">
                        <div className="md:col-span-2">
                            <Input name="name" placeholder="Nome da Conta (ex: Luz)" required className="glass-input text-white" />
                        </div>
                        <div>
                            <Input name="amount" type="number" step="0.01" placeholder="Valor (R$)" required className="glass-input text-white" />
                        </div>
                        <div>
                            <Input name="dueDate" type="date" required className="glass-input text-white" />
                        </div>
                        <div>
                            <Select name="windowDay" required defaultValue="7">
                                <SelectTrigger className="glass-input text-white">
                                    <SelectValue placeholder="Janela" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Dia 07</SelectItem>
                                    <SelectItem value="15">Dia 15</SelectItem>
                                    <SelectItem value="30">Dia 30</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="glass-button w-full">Salvar</Button>
                    </form>
                </div>
            )}

            {!data ? (
                <div className="text-slate-400">Carregando janelas...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-3">
                    {[7, 15, 30].map(day => {
                        const window = data.windows[day];
                        return (
                            <Card key={day} className="glass-card border-white/5 bg-white/5 flex flex-col h-full">
                                <CardHeader className="pb-3 border-b border-white/5 bg-black/20">
                                    <CardTitle className="flex justify-between items-center text-white">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-emerald-400" />
                                            Janela Dia {day}
                                        </div>
                                        <span className="text-lg font-mono text-emerald-300">
                                            {formatCurrency(window.total)}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 pt-4 space-y-3">
                                    {window.items.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">Nenhuma conta agendada.</p>
                                    ) : (
                                        window.items.map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-lg transition">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={async () => {
                                                        await togglePayableStatus(item.id, item.isPaid);
                                                        loadData();
                                                    }}>
                                                        {item.isPaid ? (
                                                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                        ) : (
                                                            <Circle className="h-5 w-5 text-slate-500 hover:text-emerald-400" />
                                                        )}
                                                    </button>
                                                    <div>
                                                        <p className={`text-sm font-medium ${item.isPaid ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Vence: {new Date(item.dueDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-mono ${item.isPaid ? 'text-slate-600' : 'text-white'}`}>
                                                    {formatCurrency(item.amount)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
