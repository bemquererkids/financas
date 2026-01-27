
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSHint, setShowIOSHint] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detectar se já está instalado (Standalone mode)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);
        if (isStandaloneMode) return;

        // Detectar iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Detectar suporte a instalação (Android/Desktop)
        const handler = (e: any) => {
            e.preventDefault();
            setPromptInstall(e);
            setSupportsPWA(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Se for iOS e não instalado, mostrar botão também (manual)
        if (isIosDevice) {
            setSupportsPWA(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (isIOS) {
            // No iOS não há prompt nativo via JS, abrimos nosso tutorial
            setShowIOSHint(true);
            return;
        }

        if (!promptInstall) {
            return;
        }

        // Prompt nativo Android/Desktop
        promptInstall.prompt();
        promptInstall.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                toast.success('Instalando aplicativo...');
                setSupportsPWA(false); // Esconde botão
            }
            setPromptInstall(null);
        });
    };

    if (isStandalone || !supportsPWA) return null;

    return (
        <>
            {/* Botão de Instalação (Pode ser posicionado na Sidebar ou Header) */}
            <div className="px-3 py-2">
                <Button
                    onClick={handleInstallClick}
                    variant="outline"
                    className="w-full justify-start gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 hover:text-indigo-300"
                    size="sm"
                >
                    <Download className="h-4 w-4" />
                    <span className="truncate">Instalar App</span>
                </Button>
            </div>

            {/* Tutorial iOS */}
            <Dialog open={showIOSHint} onOpenChange={setShowIOSHint}>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-400">
                            <Download className="h-5 w-5" /> Instalar no iPhone
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            A Apple requer passos manuais para instalação. É rapidinho:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                            <div className="bg-zinc-800 p-2 rounded-md">
                                <Share className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-white">1. Toque em Compartilhar</h4>
                                <p className="text-xs text-slate-400">Botão no centro inferior do Safari.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                            <div className="bg-zinc-800 p-2 rounded-md">
                                <PlusSquare className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-white">2. Adicionar à Tela de Início</h4>
                                <p className="text-xs text-slate-400">Role para baixo nas opções e selecione.</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
