'use client';

import Link from 'next/link';
import { Compass, ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MobileTutorialBanner() {
    const [visible, setVisible] = useState(true);

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
        <div className="md:hidden mb-4 relative rounded-xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 p-3 shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Compass className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Por onde começar?</h3>
                    <p className="text-[11px] text-slate-400 leading-tight">Veja o guia rápido do sistema</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    href="/tutorial"
                    className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm shadow-emerald-900/50"
                >
                    Ver Guia
                </Link>
                <button
                    onClick={handleClose}
                    className="h-7 w-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
