'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { InlineTransactionForm } from '@/components/transactions/InlineTransactionForm';
import { toast } from 'sonner';

export function FloatingTransactionButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const hidden = localStorage.getItem('hideTransactionFab');
        if (hidden) setIsVisible(false);
    }, []);

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
        localStorage.setItem('hideTransactionFab', 'true');
        toast("Atalho ocultado", {
            description: "O botão de nova transação foi removido.",
            action: {
                label: "Desfazer",
                onClick: () => {
                    setIsVisible(true);
                    localStorage.removeItem('hideTransactionFab');
                }
            },
            duration: 5000,
        });
    };

    if (!isVisible) return null;

    return (
        <>
            <div className="fixed bottom-6 right-6 md:right-28 z-40 group">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center hover:scale-110 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300 relative"
                    aria-label="Nova Transação"
                >
                    <Plus className="h-6 w-6 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                </button>

                {/* Close Button - Always visible on mobile, on Hover for desktop - Cleaner Style */}
                <button
                    onClick={handleClose}
                    className="absolute -top-1 -right-1 z-50 h-5 w-5 rounded-full bg-slate-900 border border-white/10 text-slate-400 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
                    title="Ocultar atalho"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full sm:max-w-md m-0 sm:m-4 bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-white/10 p-6 animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Nova Transação</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Form */}
                        <InlineTransactionForm onSuccess={() => setIsOpen(false)} />
                    </div>
                </div>
            )}
        </>
    );
}
