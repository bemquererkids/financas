'use client';

import { useState, useEffect, useRef } from 'react';
import { getPaymentWindows, addPayable, togglePayableStatus, importPayables } from '@/app/actions/payment-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle, Circle, Calendar, Save, Upload, FileSpreadsheet, X } from 'lucide-react';
import { ModuleHeader } from '@/components/dashboard/ModuleHeader';

export default function PaymentsPage() {
    const [data, setData] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            // Simple CSV Parse: Nome,Valor,Data(YYYY-MM-DD),Dia
            const lines = text.split('\n');
            const dataToImport = [];

            for (let line of lines) {
                line = line.trim();
                if (!line) continue;

                // Ignorar header se parecer header
                if (line.toLowerCase().startsWith('nome')) continue;

                const parts = line.split(',');
                if (parts.length >= 4) {
                    const name = parts[0].trim();
                    const amount = parseFloat(parts[1].trim());
                    const dueDate = parts[2].trim();
                    const windowDay = parseInt(parts[3].trim());

                    if (name && !isNaN(amount) && dueDate && !isNaN(windowDay)) {
                        dataToImport.push({ name, amount, dueDate, windowDay });
                    }
                }
            }

            if (dataToImport.length > 0) {
                const res = await importPayables(dataToImport);
                if (res?.success) {
                    alert(`${res.count} contas importadas com sucesso!`);
                    loadData();
                } else {
                    alert('Erro na importação: ' + (res?.error || 'Desconhecido'));
                }
            } else {
                alert('Nenhum dado válido encontrado. Formato esperado: Nome, Valor, Data(YYYY-MM-DD), Dia');
            }

            // Clear input
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-6">
            <ModuleHeader
                title="Pagamentos"
                subtitle="Controle de contas por Janelas (7, 15, 30)"
            >
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept=".csv,.txt"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button
                        variant="outline"
                        onClick={handleImportClick}
                        className="border-dashed border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400"
                        title="Importar CSV (Nome, Valor, Data, Dia)"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Importar
                    </Button>
                    <Button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`${isAdding ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}
                    >
                        {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        <span className="ml-2 hidden sm:inline">{isAdding ? 'Cancelar' : 'Nova Conta'}</span>
                    </Button>
                </div>
            </ModuleHeader>

            {isAdding && (
                <div className="mb-6 p-4 rounded-2xl glass-card border border-emerald-500/20 bg-emerald-950/20 animate-in fade-in slide-in-from-top-4">
                    <form action={async (formData) => {
                        await addPayable(formData);
                        setIsAdding(false);
                        loadData();
                    }} className="flex flex-col md:flex-row items-end gap-3">
                        <div className="flex-1 w-full min-w-[200px]">
                            <label className="text-xs text-emerald-400/70 ml-1 mb-1 block">Nome da Conta</label>
                            <Input name="name" placeholder="Ex: Luz, Internet" required className="glass-input text-white h-10" />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="text-xs text-emerald-400/70 ml-1 mb-1 block">Valor</label>
                            <Input name="amount" type="text" inputMode="decimal" placeholder="R$" required className="glass-input text-white h-10" />
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="text-xs text-emerald-400/70 ml-1 mb-1 block">Vencimento</label>
                            <Input name="dueDate" type="date" required className="glass-input text-white h-10" />
                        </div>
                        <div className="w-full md:w-28">
                            <label className="text-xs text-emerald-400/70 ml-1 mb-1 block">Janela</label>
                            <Select name="windowDay" required defaultValue="7">
                                <SelectTrigger className="glass-input text-white h-10">
                                    <SelectValue placeholder="Dia" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Dia 07</SelectItem>
                                    <SelectItem value="15">Dia 15</SelectItem>
                                    <SelectItem value="30">Dia 30</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" size="icon" className="glass-button bg-emerald-600 hover:bg-emerald-500 h-10 w-10 shrink-0" title="Salvar">
                            <Save className="h-5 w-5" />
                        </Button>
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
