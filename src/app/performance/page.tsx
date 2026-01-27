'use client';

import { useState, useEffect } from 'react';
import { getPerformanceMetrics } from '@/app/actions/performance-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Scale, Activity, Sparkles, Wallet, PieChart as PieChartIcon, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ModuleHeader } from '@/components/dashboard/ModuleHeader';
import { cn } from '@/lib/utils';

export default function PerformancePage() {
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        getPerformanceMetrics().then(setMetrics);
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    if (!metrics) {
        return (
            <div className="flex-1 p-4 md:p-6 space-y-6 flex flex-col h-full justify-center items-center">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Activity className="h-12 w-12 text-indigo-500" />
                    <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Analisando Finanças...</p>
                </div>
            </div>
        );
    }

    // Data for Assets Pie Chart
    const assetsData = [
        { name: 'Caixa', value: metrics.cashBalance },
        { name: 'Investimentos', value: metrics.investmentBalance },
    ].filter(d => d.value > 0);

    const COLORS = ['#10b981', '#6366f1']; // Emerald, Indigo

    return (
        <div className="flex-1 p-4 md:p-6 space-y-6 overflow-hidden flex flex-col md:h-[calc(100vh-2rem)] bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent)]">
            <ModuleHeader
                title="Minha Evolução"
                subtitle="Cockpit de saúde financeira."
                className="flex-shrink-0 mb-0"
            />

            {/* KPI Grid - Compact & Fixed Height */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 flex-shrink-0">
                <Card className="bg-zinc-950/50 border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 relative z-10">
                        <CardTitle className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Patrimônio Líquido</CardTitle>
                        <Scale className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold text-white">{formatCurrency(metrics.netWorth)}</div>
                        <p className="text-[10px] text-slate-500 mt-1">Livre de Dívidas</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950/50 border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 relative z-10">
                        <CardTitle className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Saúde Financeira</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="flex items-end gap-2">
                            <div className="text-2xl font-bold text-white">{metrics.healthScore}</div>
                            <span className="text-xs text-slate-500 mb-1">/ 100</span>
                        </div>
                        <Progress
                            value={metrics.healthScore}
                            className="h-1.5 mt-2 bg-white/10"
                            indicatorClassName={metrics.healthScore > 70 ? "bg-emerald-500" : metrics.healthScore > 40 ? "bg-yellow-500" : "bg-red-500"}
                        />
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950/50 border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 relative z-10">
                        <CardTitle className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Ativos Totais</CardTitle>
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold text-indigo-200">{formatCurrency(metrics.totalAssets)}</div>
                        <p className="text-[10px] text-slate-500 mt-1">Conta + Investimentos</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950/50 border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 relative z-10">
                        <CardTitle className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Passivos</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold text-rose-300">{formatCurrency(metrics.totalLiabilities)}</div>
                        <p className="text-[10px] text-slate-500 mt-1">{metrics.totalLiabilities === 0 ? 'Sem dívidas ativas' : 'A pagar'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Split View: Charts & Insights */}
            <div className="flex-1 grid gap-6 lg:grid-cols-3 min-h-0">

                {/* Visual Chart Section */}
                <Card className="lg:col-span-2 bg-zinc-950/30 border-white/5 flex flex-col min-h-0 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4 text-emerald-500" />
                            Distribuição de Riqueza
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center items-center min-h-0 relative z-10">
                        {assetsData.length > 0 ? (
                            <div className="w-full h-full max-h-[300px] flex items-center justify-center relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={assetsData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {assetsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-zinc-950 stroke-2" />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Center Legend Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total</p>
                                    <p className="text-xl font-bold text-white tracking-tight">{formatCurrency(metrics.totalAssets)}</p>
                                </div>
                            </div>
                        ) : (
                            <EmptyState
                                icon={Wallet}
                                title="Dados Insuficientes"
                                description="Adicione saldos ou investimentos para ver seu gráfico."
                                className="opacity-50 scale-90"
                            />
                        )}

                        {/* Custom Legend */}
                        <div className="flex gap-6 mt-4">
                            {assetsData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: COLORS[index], backgroundColor: 'currentColor' }} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{entry.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Insights Panel */}
                <Card className="bg-zinc-950/50 border-white/5 flex flex-col min-h-0 backdrop-blur-sm">
                    <CardHeader className="pb-2 border-b border-white/5">
                        <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Diagnóstico Inteligente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        <div className="p-4 space-y-4">
                            {/* Savings Rate Config */}
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className={`p-2 rounded-lg ${metrics.savingsRate > 20 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    <Zap className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">Potencial de Poupança</p>
                                    <p className="text-2xl font-bold text-white my-0.5">{typeof metrics.savingsRate === 'number' ? metrics.savingsRate.toFixed(1) : '0.0'}%</p>
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                        {(metrics.savingsRate ?? 0) > 20
                                            ? 'Excelente! Você está poupando acima da média.'
                                            : 'Tente reduzir custos fixos para aumentar este número.'}
                                    </p>
                                </div>
                            </div>

                            {/* Debt Free Indicator */}
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className={`p-2 rounded-lg ${metrics.totalLiabilities === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    <Scale className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">Balanço</p>
                                    <p className="text-sm text-slate-300 mt-1 font-medium">
                                        {metrics.totalLiabilities === 0
                                            ? 'Você não possui dívidas. Parabéns!'
                                            : `Comprometimento de ${((metrics.totalLiabilities / (metrics.totalAssets || 1)) * 100).toFixed(1)}% do patrimônio.`}
                                    </p>
                                </div>
                            </div>

                            {/* Tip Card */}
                            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-4 rounded-xl">
                                <p className="text-xs text-indigo-200 italic leading-relaxed">
                                    "A verdadeira riqueza não é apenas o que você ganha, mas o que você retém. Seu progresso de {metrics.healthScore}% indica que você está no caminho certo."
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
