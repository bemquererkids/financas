"use client";

import { useState, useEffect, useRef } from 'react';
import { getPaymentWindows, togglePayableStatus } from '@/app/actions/payment-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle, Circle, Calendar, Save, Upload, X, Wallet, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModuleHeader } from '@/components/dashboard/ModuleHeader';
import { ChatWidget } from '@/components/ai/ChatWidget';
import { cn } from '@/lib/utils';

export default function PaymentsPage() {
    const [data, setData] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadData(selectedDate);
    }, [selectedDate]);

    const loadData = async (date: Date) => {
        const monthStr = date.toISOString().slice(0, 7);
        const res = await getPaymentWindows(monthStr);
        setData(res);
    };

    const handleMonthChange = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const totalBills = data ? Object.values(data.windows || {}).reduce((acc: number, w: any) => acc + w.total, 0) : 0;
    const paidBills = data ? Object.values(data.windows || {}).reduce((acc: number, w: any) =>
        acc + w.items.filter((i: any) => i.isPaid).reduce((sum: number, i: any) => sum + i.amount, 0), 0) : 0;
    const pendingBills = totalBills - paidBills;
    const progress = totalBills > 0 ? (paidBills / totalBills) * 100 : 0;

    return (
        <div className="flex-1 space-y-8 p-6 md:p-8 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.05),transparent)] min-h-screen">
            <ModuleHeader
                title="Gestão de Compromissos"
                subtitle="Visualize e controle suas janelas de pagamento de forma inteligente"
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-zinc-900/50 rounded-2xl border border-white/5 p-1">
                        <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)} className="h-9 w-9 text-zinc-400 hover:text-white rounded-xl">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-bold text-white px-2 min-w-[100px] text-center capitalize">
                            {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)} className="h-9 w-9 text-zinc-400 hover:text-white rounded-xl">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setChatOpen(true)}
                        className="border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 rounded-2xl h-11 px-6 transition-all"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Importar / Scan AI</span>
                    </Button>

                    <Button
                        onClick={() => setIsAdding(!isAdding)}
                        className={cn(
                            "rounded-2xl h-11 px-6 shadow-lg transition-all font-bold",
                            isAdding ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20"
                        )}
                    >
                        {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        <span className="ml-2 hidden sm:inline">{isAdding ? 'Cancelar' : 'Nova Conta'}</span>
                    </Button>
                </div>
            </ModuleHeader>

            {/* Resumo de Saúde Financeira */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl p-6 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                            <Wallet className="w-5 h-5 text-zinc-400" />
                        </div>
                        <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Previsto</p>
                        <h3 className="text-2xl font-black text-white tracking-tighter">{formatCurrency(totalBills)}</h3>
                    </div>
                </Card>

                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl p-6 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                            <Activity className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total Pago</p>
                        <h3 className="text-2xl font-black text-emerald-400 tracking-tighter">{formatCurrency(paidBills)}</h3>
                    </div>
                </Card>

                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl p-6 rounded-[2rem] col-span-1 md:col-span-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status do Mês</p>
                            <h3 className="text-lg font-bold text-white tracking-tight">
                                {progress === 100 ? 'Mês Quitado! 🎉' : `${progress.toFixed(0)}% das contas pagas`}
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest">Restante</p>
                            <p className="text-xl font-black text-white tracking-tighter">{formatCurrency(pendingBills)}</p>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </Card>
            </div>

            {isAdding && (
                <div className="p-8 rounded-[2.5rem] bg-zinc-900/60 border border-emerald-500/20 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 shadow-2xl">
                    <form action={async (formData) => {
                        const { addPayable } = await import('@/app/actions/payment-actions');
                        await addPayable(formData);
                        setIsAdding(false);
                        loadData(selectedDate);
                    }} className="flex flex-col md:flex-row items-end gap-6">
                        <div className="flex-1 w-full min-w-[200px] space-y-2">
                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Nome da Conta</label>
                            <Input name="name" placeholder="Ex: Aluguel, Internet" required className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:ring-emerald-500/20" />
                        </div>
                        <div className="w-full md:w-40 space-y-2">
                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Valor</label>
                            <Input name="amount" type="text" inputMode="decimal" placeholder="R$ 0,00" required className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:ring-emerald-500/20 font-mono" />
                        </div>
                        <div className="w-full md:w-auto space-y-2">
                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Vencimento</label>
                            <Input name="dueDate" type="date" required className="bg-white/5 border-white/5 text-zinc-400 h-12 rounded-2xl focus:ring-emerald-500/20" />
                        </div>
                        <div className="w-full md:w-32 space-y-2">
                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Janela</label>
                            <Select name="windowDay" required defaultValue="7">
                                <SelectTrigger className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:ring-emerald-500/20">
                                    <SelectValue placeholder="Dia" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                                    <SelectItem value="7">Dia 07</SelectItem>
                                    <SelectItem value="15">Dia 15</SelectItem>
                                    <SelectItem value="30">Dia 30</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-500 h-14 w-14 rounded-2xl transition-all shadow-lg shadow-emerald-600/20" title="Salvar">
                            <Save className="h-6 w-6" />
                        </Button>
                    </form>
                </div>
            )}

            {!data ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-4">Sincronizando Compromissos...</p>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-3">
                    {[7, 15, 30].map(day => {
                        const window = data.windows[day];
                        const windowPaid = window.items.filter((i: any) => i.isPaid).length;
                        const windowTotal = window.items.length;
                        const windowProgress = windowTotal > 0 ? (windowPaid / windowTotal) * 100 : 0;

                        return (
                            <Card key={day} className="bg-zinc-900/30 border-white/5 backdrop-blur-xl rounded-[2.5rem] flex flex-col h-full overflow-hidden transition-all hover:bg-zinc-900/40 group">
                                <CardHeader className="p-8 border-b border-white/5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl font-black text-white tracking-tight">Janela Dia {day}</CardTitle>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{windowTotal} {windowTotal === 1 ? 'Contas' : 'Contas'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-emerald-400 tracking-tighter">
                                                {formatCurrency(window.total)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500/40 transition-all duration-1000"
                                            style={{ width: `${windowProgress}%` }}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-8 space-y-4 custom-scrollbar overflow-y-auto max-h-[400px]">
                                    {window.items.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 grayscale opacity-20">
                                            <Calendar className="h-10 w-10 text-zinc-400 mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Janela Livre</p>
                                        </div>
                                    ) : (
                                        window.items.map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between group/item p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={async () => {
                                                            const { togglePayableStatus } = await import('@/app/actions/payment-actions');
                                                            await togglePayableStatus(item.id, item.isPaid);
                                                            loadData(selectedDate);
                                                        }}
                                                        className="transition-transform active:scale-90"
                                                    >
                                                        {item.isPaid ? (
                                                            <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                                                <CheckCircle className="h-4 w-4 text-zinc-950" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-6 w-6 rounded-full border-2 border-zinc-700 hover:border-emerald-500 transition-colors" />
                                                        )}
                                                    </button>
                                                    <div>
                                                        <p className={cn(
                                                            "text-[13px] font-bold leading-none mb-1.5 transition-all text-zinc-100 uppercase",
                                                            item.isPaid && "text-zinc-600 line-through"
                                                        )}>
                                                            {item.name}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 text-zinc-500">
                                                            <Calendar className="h-3 w-3" />
                                                            <span className="text-[10px] font-bold tracking-tighter">
                                                                {new Date(item.dueDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "text-[13px] font-black font-mono transition-all",
                                                    item.isPaid ? "text-zinc-600" : "text-emerald-400 group-hover/item:scale-110"
                                                )}>
                                                    {formatCurrency(item.amount)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                                <div className="p-8 pt-0 mt-auto">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Nota Inteligente</p>
                                        <p className="text-[10px] text-zinc-400 leading-tight">
                                            Estes valores são deduzidos do seu <span className="text-emerald-500 font-bold">Dinheiro Livre</span> no Dashboard principal.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Agente Widget - Integrado para unificação */}
            <ChatWidget isOpen={chatOpen} onOpenChange={setChatOpen} />
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return <Activity className={cn("animate-spin", className)} />;
}
