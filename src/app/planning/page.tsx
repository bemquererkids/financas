'use client';

import { useEffect, useState } from 'react';
import { getPlanningData, EnvelopeResult } from '../actions/planning-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PlanningPage() {
    const [data, setData] = useState<{ period: string, totalIncome: number, envelopes: EnvelopeResult[] } | null>(null);

    useEffect(() => {
        getPlanningData().then(setData);
    }, []);

    if (!data) return <div className="p-8 text-slate-400">Carregando análise...</div>;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-1">Planejamento</h2>
                    <p className="text-slate-400">Análise de Envelopes (Ideal vs Real) para {data.period}.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.envelopes.map((env, idx) => (
                    <EnvelopeCard key={idx} env={env} formatCurrency={formatCurrency} />
                ))}
            </div>
        </div>
    );
}

function EnvelopeCard({ env, formatCurrency }: { env: EnvelopeResult, formatCurrency: (val: number) => string }) {
    const progress = Math.min((env.realAmount / env.idealAmount) * 100, 100) || 0;

    let color = "bg-emerald-500";
    let textColor = "text-emerald-400";
    let icon = <CheckCircle className="h-5 w-5 text-emerald-500" />;

    if (env.status === 'OVERSPECT') {
        color = "bg-rose-500";
        textColor = "text-rose-400";
        icon = <AlertTriangle className="h-5 w-5 text-rose-500" />;
    } else if (env.status === 'UNDERSPECT') {
        color = "bg-blue-500";
        textColor = "text-blue-400";
    }

    return (
        <Card className="glass-card border-white/5 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                    {env.name} ({env.percentage}%)
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatCurrency(env.realAmount)}
                </div>
                <p className="text-xs text-slate-400 mb-4">
                    de {formatCurrency(env.idealAmount)} (Ideal)
                </p>

                <Progress value={progress} className="h-2 bg-white/10" indicatorClassName={color} />

                <div className="mt-4 text-xs font-mono flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className={textColor}>
                        {env.gap > 0 ? `+${formatCurrency(env.gap)} Disponível` : `${formatCurrency(env.gap)} Estourado`}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
