'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

interface CurrencyData {
    code: string;
    codein: string;
    name: string;
    high: string;
    low: string;
    varBid: string;
    pctChange: string;
    bid: string;
    ask: string;
    timestamp: string;
    create_date: string;
}

export function CurrencyTicker({ collapsed }: { collapsed?: boolean }) {
    const [data, setData] = useState<{ USDBRL?: CurrencyData, EURBRL?: CurrencyData } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchRates = async () => {
        try {
            // Chama nossa API interna para evitar CORS e usar cache do servidor
            const res = await fetch('/api/currency');
            if (!res.ok) throw new Error('API Error');
            const json = await res.json();
            setData(json);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setError(true);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, 30000); // Atualiza a cada 30s (Mais rápido)
        return () => clearInterval(interval);
    }, []);

    if (error) return null; // Silencioso em caso de erro

    if (loading) {
        return (
            <div className="flex items-center justify-center p-2 opacity-50 animate-pulse">
                <RefreshCw className="h-3 w-3 text-slate-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-2 transition-all duration-300", collapsed ? "items-center" : "")}>
            <CurrencyItem
                flag="🇺🇸"
                symbol="USD"
                price={data?.USDBRL?.bid}
                change={data?.USDBRL?.pctChange}
                updatedAt={data?.USDBRL?.create_date}
                collapsed={collapsed}
            />
            <CurrencyItem
                flag="🇪🇺"
                symbol="EUR"
                price={data?.EURBRL?.bid}
                change={data?.EURBRL?.pctChange}
                updatedAt={data?.EURBRL?.create_date}
                collapsed={collapsed}
            />
        </div>
    );
}

function CurrencyItem({ flag, symbol, price, change, updatedAt, collapsed }: { flag: string, symbol: string, price?: string, change?: string, updatedAt?: string, collapsed?: boolean }) {
    const priceNum = Number(price);
    const changeNum = Number(change);
    const isPositive = changeNum >= 0;

    if (!price) return null;

    // Formata hora
    const timeStr = updatedAt ? updatedAt.split(' ')[1] : '';

    if (collapsed) {
        return (
            <div className="flex flex-col items-center gap-0.5 group cursor-help" title={`${symbol}: R$ ${priceNum.toFixed(2)} (${isPositive ? '+' : ''}${changeNum}%)\nAtualizado: ${timeStr}`}>
                <span className="text-lg opacity-80 group-hover:opacity-100 transition-opacity">{flag}</span>
                <span className="text-[9px] font-mono text-slate-400 group-hover:text-emerald-400">
                    {priceNum.toFixed(2)}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-lg border border-white/5 hover:bg-slate-900/60 transition-colors cursor-help" title={`Atualizado às ${timeStr}`}>
            <div className="flex items-center gap-2">
                <span className="text-lg">{flag}</span>
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">{symbol}</span>
                    <span className="text-xs font-mono text-slate-200">R$ {priceNum.toFixed(3)}</span>
                </div>
            </div>

            <div className={cn("flex items-center text-[10px] font-medium gap-0.5", isPositive ? "text-emerald-400" : "text-rose-400")}>
                {isPositive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                {Math.abs(changeNum).toFixed(2)}%
            </div>
        </div>
    );
}
