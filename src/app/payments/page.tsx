"use client";

import { useState, useEffect } from 'react';
import { getPaymentWindows } from '@/app/actions/payment-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle, Calendar, Save, Upload, X, Wallet, Activity, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
        <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 md:gap-6 md:h-[calc(100vh-2rem)] md:overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.05),transparent)]">
            {/* Header Section */}
            <div className="flex-shrink-0">
                <ModuleHeader
                    title="Gestão de Compromissos"
                    subtitle="Visualize e controle suas janelas de pagamento."
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-zinc-900/50 rounded-xl border border-white/5 p-1 h-9">
                            <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)} className="h-7 w-7 text-zinc-400 hover:text-white rounded-lg">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs font-bold text-white px-2 min-w-[80px] text-center capitalize">
                                {selectedDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '')}
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)} className="h-7 w-7 text-zinc-400 hover:text-white rounded-lg">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setChatOpen(true)}
                            className="hidden sm:flex border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 rounded-xl h-9"
                        >
                            <Upload className="h-3.5 w-3.5 mr-2" />
                            Importar AI
                        </Button>

                        <Dialog open={isAdding} onOpenChange={setIsAdding}>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="rounded-xl h-9 bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                                >
                                    <Plus className="h-4 w-4 mr-1.5" />
                                    <span className="hidden sm:inline">Nova Conta</span>
                                    <span className="sm:hidden">Nova</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-white">
                                <DialogHeader>
                                    <DialogTitle>Adicionar Novo Compromisso</DialogTitle>
                                </DialogHeader>
                                <form action={async (formData) => {
                                    const { addPayable } = await import('@/app/actions/payment-actions');
                                    await addPayable(formData);
                                    setIsAdding(false);
                                    loadData(selectedDate);
                                    toast.success("Conta adicionada com sucesso!");
                                }} className="space-y-4 mt-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nome da Conta</label>
                                        <Input name="name" placeholder="Ex: Aluguel" required className="bg-white/5 border-white/5 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Valor (R$)</label>
                                        <Input name="amount" type="number" step="0.01" placeholder="0.00" required className="bg-white/5 border-white/5 text-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Vencimento</label>
                                            <Input name="dueDate" type="date" required className="bg-white/5 border-white/5 text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Janela</label>
                                            <Select name="windowDay" required defaultValue="7">
                                                <SelectTrigger className="bg-white/5 border-white/5 text-white">
                                                    <SelectValue placeholder="Dia" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-800 border-white/10 text-white">
                                                    <SelectItem value="7">Dia 07</SelectItem>
                                                    <SelectItem value="15">Dia 15</SelectItem>
                                                    <SelectItem value="30">Dia 30</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                                        Salvar Conta
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </ModuleHeader>

                {/* Compact Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    <Card className="bg-zinc-900/40 border-white/5 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Previsto</p>
                            <p className="text-lg font-black text-white">{formatCurrency(totalBills)}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-zinc-800/50 flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-zinc-400" />
                        </div>
                    </Card>
                    <Card className="bg-zinc-900/40 border-white/5 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider">Pago</p>
                            <p className="text-lg font-black text-emerald-400">{formatCurrency(paidBills)}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-emerald-500" />
                        </div>
                    </Card>
                    <Card className="col-span-2 bg-zinc-900/40 border-white/5 p-4 rounded-2xl flex flex-col justify-center gap-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-medium text-emerald-400">{progress.toFixed(0)}% Pago</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Restante: {formatCurrency(pendingBills)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Main Content - 3 Column Grid for One Screen Experience */}
            <div className="flex-1 min-h-0"> {/* min-h-0 is crucial for nested flex scrolling */}
                {!data ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-4">Sincronizando...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                        {[7, 15, 30].map(day => {
                            const window = data.windows[day];
                            const windowPaid = window.items.filter((i: any) => i.isPaid).length;
                            const windowTotal = window.items.length;
                            const windowProgress = windowTotal > 0 ? (windowPaid / windowTotal) * 100 : 0;

                            return (
                                <Card key={day} className="bg-zinc-900/30 border-white/5 backdrop-blur-md rounded-3xl flex flex-col h-full overflow-hidden transition-all hover:bg-zinc-900/40 group border-t-4 border-t-emerald-500/20 hover:border-t-emerald-500/50">
                                    <div className="p-5 border-b border-white/5 shrink-0">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                                    Dia {day}
                                                    {windowTotal > 0 && windowTotal === windowPaid && (
                                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                    )}
                                                </h3>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{windowTotal} Contas</p>
                                            </div>
                                            <p className="text-xl font-black text-emerald-400/90 font-mono">
                                                {formatCurrency(window.total)}
                                            </p>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500/50 transition-all duration-1000"
                                                style={{ width: `${windowProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <CardContent className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2">
                                        {window.items.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                                                <Calendar className="h-8 w-8 text-zinc-400 mb-2" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Janela Livre</p>
                                            </div>
                                        ) : (
                                            window.items.map((item: any) => (
                                                <div key={item.id} className="flex items-center justify-between group/item p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <button
                                                            onClick={async () => {
                                                                const { togglePayableStatus } = await import('@/app/actions/payment-actions');
                                                                await togglePayableStatus(item.id, item.isPaid);
                                                                loadData(selectedDate);
                                                            }}
                                                            className="shrink-0 transition-transform active:scale-95"
                                                        >
                                                            {item.isPaid ? (
                                                                <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                                    <CheckCircle className="h-3.5 w-3.5 text-zinc-950" />
                                                                </div>
                                                            ) : (
                                                                <div className="h-5 w-5 rounded-full border-2 border-zinc-700 hover:border-emerald-500 transition-colors" />
                                                            )}
                                                        </button>
                                                        <div className="min-w-0">
                                                            <p className={cn(
                                                                "text-sm font-bold leading-none mb-1 transition-all text-zinc-200 truncate",
                                                                item.isPaid && "text-zinc-600 line-through"
                                                            )}>
                                                                {item.name}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 text-zinc-600">
                                                                <span className="text-[10px] font-medium">
                                                                    {new Date(item.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={cn(
                                                        "text-sm font-black font-mono transition-all shrink-0 ml-2",
                                                        item.isPaid ? "text-zinc-700" : "text-emerald-400 group-hover/item:scale-105"
                                                    )}>
                                                        {formatCurrency(item.amount)}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>

                                    {/* Footer Gradient for visual anchoring */}
                                    <div className="h-4 bg-gradient-to-t from-zinc-900/50 to-transparent shrink-0" />
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Agente Widget */}
            <ChatWidget isOpen={chatOpen} onOpenChange={setChatOpen} />
        </div>
    );
}
