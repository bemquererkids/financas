'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { InlineTransactionForm } from '@/components/transactions/InlineTransactionForm';

export function FloatingTransactionButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all duration-300"
                aria-label="Nova Transação"
            >
                <Plus className="h-7 w-7 text-white" />
            </button>

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
