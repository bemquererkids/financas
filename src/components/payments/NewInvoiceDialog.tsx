'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { extractInvoiceData, createInvoicePayable } from '@/app/actions/invoice-actions';
import { toast } from 'sonner';

export function NewInvoiceDialog({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'CHOICE' | 'LOADING' | 'CONFIRM'>('CHOICE');
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        dueDate: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenChange = (val: boolean) => {
        setOpen(val);
        if (!val) {
            // Reset state after close animation (timeout)
            setTimeout(() => {
                setStep('CHOICE');
                setFormData({ name: '', amount: '', dueDate: '' });
            }, 300);
        }
        onOpenChange?.(val);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStep('LOADING');
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const result = await extractInvoiceData(uploadData);

            if (result.success && result.data) {
                setFormData({
                    name: result.data.bankName || 'Cartão de Crédito',
                    amount: result.data.amount?.toString() || '',
                    dueDate: result.data.dueDate || new Date().toISOString().split('T')[0]
                });
                toast.success('Dados extraídos! Confira abaixo.');
            } else {
                toast.error('Não conseguimos ler este PDF. Preencha manualmente — é rápido.');
            }
        } catch (error) {
            toast.error('Erro na leitura do PDF.');
        } finally {
            setStep('CONFIRM');
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.amount || !formData.dueDate) {
            toast.error('Preencha todos os campos obrigatórios.');
            return;
        }

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('amount', formData.amount);
        submitData.append('dueDate', formData.dueDate);
        // Calcula janela automatico pelo backend (addPayable)

        try {
            await createInvoicePayable(submitData);
            toast.success('Fatura adicionada. Seu dinheiro livre foi atualizado.');
            handleOpenChange(false);
            // Poderíamos disparar um reload na pagina pai se necessario
            window.location.reload();
        } catch (error) {
            toast.error('Erro ao salvar fatura.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Adicionar Fatura
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-emerald-400" />
                        Adicionar fatura do cartão
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Cadastre o valor total para ver o impacto no seu dinheiro livre.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    {step === 'CHOICE' && (
                        <div className="grid gap-4">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-between p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-slate-200">Enviar PDF da fatura</p>
                                        <p className="text-xs text-slate-500">Extração automática de valor e data</p>
                                    </div>
                                </div>
                            </button>
                            <input
                                type="file"
                                accept=".pdf"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-950 px-2 text-slate-500">Ou</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('CONFIRM')}
                                className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-all"
                            >
                                <div className="p-2 rounded-full bg-slate-800 text-slate-400">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-slate-200">Inserir manualmente</p>
                                    <p className="text-xs text-slate-500">Preencha os campos você mesmo</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {step === 'LOADING' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                                <Loader2 className="h-10 w-10 text-emerald-400 animate-spin relative z-10" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">Lendo sua fatura...</h3>
                                <p className="text-sm text-slate-400">Isso leva apenas alguns segundos.</p>
                            </div>
                        </div>
                    )}

                    {step === 'CONFIRM' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 items-start">
                                <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-200">
                                    Confirme os dados abaixo. Você pode editar qualquer campo antes de salvar.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-400">Cartão / Banco</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Nubank, Itaú"
                                        className="bg-slate-900 border-slate-700 text-white focus:border-emerald-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-400">Valor Total (R$)</Label>
                                        <Input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0,00"
                                            className="bg-slate-900 border-slate-700 text-white focus:border-emerald-500 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-400">Vencimento</Label>
                                        <Input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="bg-slate-900 border-slate-700 text-white focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep('CHOICE')}
                                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                >
                                    Voltar
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Salvar Fatura
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
