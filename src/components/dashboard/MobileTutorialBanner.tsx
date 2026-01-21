'use client';

import Link from 'next/link';
import { Compass, ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MobileTutorialBanner() {
    const [visible, setVisible] = useState(true);

    // Persistir o fechamento? Por enquanto deixa volátil (sempre aparece no refresh) para garantir que vejam.
    // Ou usar sessionStorage.
    useEffect(() => {
        const closed = sessionStorage.getItem('tutorial_banner_closed');
        if (closed) setVisible(false);
    }, []);

    const handleClose = () => {
        setVisible(false);
        sessionStorage.setItem('tutorial_banner_closed', 'true');
    };

    if (!visible) return null;

    return (
        <div className="md:hidden mb-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 shadow-lg shadow-emerald-500/20 animate-in slide-in-from-top-2 duration-500">
            <div className="absolute top-2 right-2 z-10">
                <button
                    onClick={handleClose}
                    className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="p-4 flex items-center gap-4 relative z-0">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
                    <Compass className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-0.5">Comece por aqui! 🚀</h3>
                    <p className="text-xs text-emerald-100 mb-2 max-w-[200px]">Descubra como organizar suas finanças passo a passo.</p>
                    <Link
                        href="/tutorial"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                        Ver Tutorial Rápido <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>

            {/* Elemento Decorativo de Fundo */}
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 h-32 w-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl pointer-events-none" />
        </div>
    );
}
