'use client';

import { useSearchParams } from 'next/navigation';
import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OAuthErrorAlert() {
    const searchParams = useSearchParams();
    const urlError = searchParams.get('error');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (urlError) {
            setVisible(true);
        }
    }, [urlError]);

    if (!visible) return null;

    const getErrorMessage = () => {
        switch (urlError) {
            case 'Callback':
                return {
                    title: 'Erro no Google OAuth',
                    message: 'O Google OAuth não está configurado corretamente. Por favor, use email e senha para entrar.',
                };
            case 'OAuthCallback':
                return {
                    title: 'Erro na Autenticação',
                    message: 'Não foi possível completar a autenticação com Google. Tente novamente ou use email/senha.',
                };
            case 'Configuration':
                return {
                    title: 'Configuração Pendente',
                    message: 'O login com Google ainda não está disponível. Use email e senha.',
                };
            default:
                return {
                    title: 'Erro na Autenticação',
                    message: 'Ocorreu um erro. Por favor, tente novamente.',
                };
        }
    };

    const { title, message } = getErrorMessage();

    return (
        <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-200 mb-1">{title}</h4>
                <p className="text-xs text-amber-300/80">{message}</p>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="text-amber-400 hover:text-amber-300 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
