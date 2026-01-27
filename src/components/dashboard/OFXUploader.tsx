
'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { processOFXUpload } from '@/app/actions/import-actions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';

export function OFXUploader() {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [stats, setStats] = useState<{ imported: number; skipped: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validação de Extensão (Front-end 1st line of defense)
        if (!file.name.toLowerCase().endsWith('.ofx')) {
            toast.error("Formato inválido. Por favor envie um arquivo .ofx");
            return;
        }

        // Validação de Tamanho (Max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Arquivo muito grande. Limite de 5MB.");
            return;
        }

        setFileName(file.name);
        setIsUploading(true);
        setStats(null); // Reset stats

        try {
            const text = await file.text();

            // Server Action Call
            const result = await processOFXUpload(text);

            if (result.success) {
                toast.success(result.message);
                if (result.stats) {
                    setStats(result.stats);
                }
                // Atualiza a UI (Server Components) para mostrar os novos dados
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao processar arquivo");
                setFileName(null); // Reset on error
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado no upload.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/5 text-slate-400 hover:text-indigo-400">
                    <UploadCloud className="h-4 w-4" />
                    Importar OFX
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        Importação Bancária
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Envie o arquivo OFX do seu banco para importar transações automaticamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50 hover:bg-slate-900 transition-colors">
                    {isUploading ? (
                        <div className="text-center space-y-3">
                            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
                            <p className="text-sm text-slate-300 animate-pulse">Processando transações...</p>
                        </div>
                    ) : stats ? (
                        <div className="text-center space-y-4 w-full">
                            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium text-white">Sucesso!</h3>
                                <p className="text-sm text-slate-400">Arquivo processado.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                    <span className="block font-bold text-emerald-400 text-lg">{stats.imported}</span>
                                    <span className="text-slate-400">Importadas</span>
                                </div>
                                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                    <span className="block font-bold text-amber-400 text-lg">{stats.skipped}</span>
                                    <span className="text-slate-400">Duplicadas</span>
                                </div>
                            </div>
                            <Button
                                onClick={() => { setStats(null); setFileName(null); }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                            >
                                Importar Outro
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-2 w-full">
                            <input
                                type="file"
                                accept=".ofx"
                                onChange={handleFileChange}
                                className="hidden"
                                id="ofx-upload"
                                name="ofx-file"
                                ref={fileInputRef}
                            />
                            <label
                                htmlFor="ofx-upload"
                                className="cursor-pointer block p-4"
                            >
                                <UploadCloud className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                                <p className="text-sm font-medium text-white">Clique para selecionar</p>
                                <p className="text-xs text-slate-500">Suporta arquivos .OFX até 5MB</p>
                            </label>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
