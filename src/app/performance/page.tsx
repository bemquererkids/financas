'use client';

import { useState, useEffect } from 'react';
import { getPerformanceMetrics } from '@/app/actions/performance-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Scale, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function PerformancePage() {
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        getPerformanceMetrics().then(setMetrics);
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    if (!metrics) return <div className="p-8 text-slate-400">Calculando indicadores...</div>;

    // Data for Assets Pie Chart
    const assetsData = [
        { name: 'Caixa / Conta Corrente', value: metrics.cashBalance },
        { name: 'Investimentos', value: metrics.investmentBalance },
    ].filter(d => d.value > 0);

    const COLORS = ['#10b981', '#3b82f6'];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-1">Desempenho</h2>
                    <p className="text-slate-400">KPIs Globais e Saúde Financeira.</p>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card border-white/5 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Patrimônio Líquido</CardTitle>
                        <Scale className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{formatCurrency(metrics.netWorth)}</div>
                        <p className="text-xs text-slate-400">Ativos - Passivos</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-white/5 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Score de Saúde</CardTitle>
                        <Activity className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{metrics.healthScore} / 100</div>
                        <Progress value={metrics.healthScore} className="h-2 mt-2 bg-white/10" indicatorClassName={metrics.healthScore > 70 ? "bg-emerald-500" : "bg-yellow-500"} />
                    </CardContent>
                </Card>
                <Card className="glass-card border-white/5 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Ativos Totais</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{formatCurrency(metrics.totalAssets)}</div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-white/5 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Passivos (Dívidas)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{formatCurrency(metrics.totalLiabilities)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                <Card className="col-span-4 glass-card border-white/5 bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-slate-200">Composição de Ativos</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {assetsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={assetsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {assetsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">
                                Sem ativos registrados.
                            </div>
                        )}
                        <div className="flex justify-center gap-4 text-sm mt-4">
                            {assetsData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 text-slate-300">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 glass-card border-white/5 bg-emerald-950/20 border-emerald-500/10">
                    <CardHeader>
                        <CardTitle className="text-emerald-400">Diagnóstico IA (Simulado)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-300">
                            Com base nos seus dados atuais:
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex gap-2">
                                <span className={metrics.savingsRate > 20 ? "text-emerald-400" : "text-yellow-400"}>
                                    • Taxa de Poupança: {metrics.savingsRate}%
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className={metrics.totalLiabilities === 0 ? "text-emerald-400" : "text-rose-400"}>
                                    • Endividamento: {metrics.totalLiabilities === 0 ? "Zero" : "Existente"}
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className={metrics.netWorth > 0 ? "text-emerald-400" : "text-rose-400"}>
                                    • Patrimônio: {metrics.netWorth > 0 ? "Positivo" : "Negativo"}
                                </span>
                            </li>
                        </ul>
                        <div className="p-4 bg-white/5 rounded-lg mt-4">
                            <p className="text-xs text-slate-400 italic">
                                "Continue mantendo seus custos fixos abaixo de 55% para acelerar sua liberdade financeira."
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
