'use client';

import { AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';

interface FinancialAlertsProps {
    balance: number;
    savingsRate: number;
    expensesVsIncome: number;
}

export function FinancialAlerts({ balance, savingsRate, expensesVsIncome }: FinancialAlertsProps) {
    const alerts = [];

    if (balance < 0) {
        alerts.push({
            type: 'danger',
            icon: AlertTriangle,
            text: 'Saldo Negativo',
        });
    }

    if ((savingsRate ?? 0) < 10 && (savingsRate ?? 0) >= 0) {
        alerts.push({
            type: 'warning',
            icon: TrendingDown,
            text: `Poupança ${typeof savingsRate === 'number' ? savingsRate.toFixed(1) : '0.0'}%`,
        });
    }

    if (expensesVsIncome > 80) {
        alerts.push({
            type: 'warning',
            icon: AlertTriangle,
            text: `${expensesVsIncome.toFixed(0)}% comprometido`,
        });
    }

    if (alerts.length === 0 && balance > 0) {
        alerts.push({
            type: 'success',
            icon: CheckCircle,
            text: 'Finanças OK',
        });
    }

    if (alerts.length === 0) return null;

    const getStyles = (type: string) => {
        switch (type) {
            case 'danger': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'success': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {alerts.map((alert, i) => {
                const Icon = alert.icon;
                return (
                    <div key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStyles(alert.type)}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {alert.text}
                    </div>
                );
            })}
        </div>
    );
}
