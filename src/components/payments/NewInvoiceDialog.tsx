'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { extractFinancialData, createInvoicePayable } from '@/app/actions/invoice-actions';
import { createTransaction } from '@/app/actions/transaction-actions';
import { toast } from 'sonner';

export function NewInvoiceDialog({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'CHOICE' | 'LOADING' | 'CONFIRM'>('CHOICE');
    const [formData, setFormData] = useState({
        type: 'PAYABLE',
        description: '',
        amount: '',
        date: '',
        category: 'Outros'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenChange = (val: boolean) => {
        setOpen(val);
        if (!val) {
            setTimeout(() => {
                setStep('CHOICE');
                setFormData({ type: 'PAYABLE', description: '', amount: '', date: '', category: 'Outros' });
            }, 300);
        }
        onOpenChange?.(val);
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        // Import dinâmico REAL para evitar quebra de build no SSR
        // @ts-ignore
        const pdfjsLib = await import('pdfjs-dist/build/pdf');

        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 2);

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // @ts-ignore
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }
        return fullText;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStep('LOADING');

        try {
            const text = await extractTextFromPDF(file);
            console.log('Texto extraído (Client):', text.length, 'chars');

            if (!text || text.length < 10) {
                throw new Error('PDF vazio ou ilegível (imagem?)');
            }

            const result = await extractFinancialData(text);

            if (result.success && result.data) {
                setFormData({
                    type: result.data.type || 'PAYABLE',
                    description: result.data.description || 'Documento',
                    amount: result.data.amount?.toString() || '',
                    date: result.data.date || new Date().toISOString().split('T')[0],
                    category: result.data.category || 'Outros'
                });
                toast.success('Documento analisado com sucesso!');
            } else {
                toast.error(result.error || 'Não conseguimos ler automaticamente.');
            }
        } catch (error: any) {
            console.error('Erro Client-Side:', error);
            toast.error(`Erro: ${error.message || 'Falha ao ler o arquivo'}. Tente uma foto ou preencha manual.`);
        } finally {
            setStep('CONFIRM');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!formData.description || !formData.amount || !formData.date) {
            toast.error('Preencha os campos obrigatórios.');
            return;
        }

        const submitData = new FormData();
        const commonMsgs = { success: '', error: '' };

        if (formData.type === 'PAYABLE') {
            submitData.append('name', formData.description);
            submitData.append('amount', formData.amount);
            submitData.append('dueDate', formData.date);
            try {
                await createInvoicePayable(submitData);
                commonMsgs.success = 'Conta agendada com sucesso.';
            } catch (e) { commonMsgs.error = 'Erro ao salvar conta.'; }
        } else {
            submitData.append('description', formData.description);
            submitData.append('amount', formData.amount);
            submitData.append('date', formData.date);
            submitData.append('type', 'EXPENSE');
            submitData.append('category', formData.category);
            try {
                const res = await createTransaction(submitData);
                if (res?.success) commonMsgs.success = 'Gasto registrado com sucesso.';
                else commonMsgs.error = 'Erro ao registrar gasto.';
            } catch (e) { commonMsgs.error = 'Erro ao registrar gasto.'; }
        }

        if (commonMsgs.error) {
            toast.error(commonMsgs.error);
        } else {
            toast.success(commonMsgs.success);
            handleOpenChange(false);
            window.location.reload();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                    <Upload className="mr-2 h-4 w-4" />
                    Adicionar Documento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-400" />
                        Smart Document
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Envie faturas, recibos ou boletos. A IA organiza para você.
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
                                        <p className="font-medium text-slate-200">Selecionar PDF</p>
                                        <p className="text-xs text-slate-500">Processamento seguro no navegador</p>
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
                                <h3 className="text-lg font-medium text-white">Lendo arquivo...</h3>
                                <p className="text-sm text-slate-400">Extraindo dados no seu dispositivo...</p>
                            </div>
                        </div>
                    )}

                    {step === 'CONFIRM' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="p-1 bg-slate-900 rounded-lg flex border border-slate-800">
                                <button
                                    onClick={() => setFormData({ ...formData, type: 'PAYABLE' })}
                                    className={`flex-1 text-xs py-2 rounded-md transition-all font-medium ${formData.type === 'PAYABLE'
                                            ? 'bg-emerald-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Conta a Pagar (Futuro)
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, type: 'TRANSACTION' })}
                                    className={`flex-1 text-xs py-2 rounded-md transition-all font-medium ${formData.type === 'TRANSACTION'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Gasto Já Feito (Passado)
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-400">Descrição</Label>
                                    <Input
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-slate-900 border-slate-700 text-white focus:border-emerald-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-400">Valor (R$)</Label>
                                        <Input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="bg-slate-900 border-slate-700 text-white focus:border-emerald-500 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-400">
                                            {formData.type === 'PAYABLE' ? 'Vencimento' : 'Data da Compra'}
                                        </Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="bg-slate-900 border-slate-700 text-white focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                {formData.type === 'TRANSACTION' && (
                                    <div className="space-y-1 animate-in fade-in zoom-in-95">
                                        <Label className="text-xs text-slate-400">Categoria</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                                        >
                                            <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Moradia">Moradia</SelectItem>
                                                <SelectItem value="Mercado">Mercado</SelectItem>
                                                <SelectItem value="Transporte">Transporte</SelectItem>
                                                <SelectItem value="Lazer">Lazer</SelectItem>
                                                <SelectItem value="Saúde">Saúde</SelectItem>
                                                <SelectItem value="Outros">Outros</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
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
                                    className={`flex-1 text-white ${formData.type === 'PAYABLE'
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    {formData.type === 'PAYABLE' ? 'Agendar Conta' : 'Registrar Gasto'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
