'use client';

import { useState, useEffect } from 'react';
import { getPerformanceMetrics } from '@/app/actions/performance-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Scale, Activity, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ModuleHeader } from '@/components/dashboard/ModuleHeader';

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
            <div className="flex-1 p-6 space-y-6">
                <ModuleHeader
                    title="Desempenho"
                    subtitle="KPIs Globais e Saúde Financeira"
                />
                <div className="flex items-center justify-center h-96">
                    <div className="text-slate-400 animate-pulse">Calculando indicadores...</div>
                </div>
            </div>
        );
    }

    // Data for Assets Pie Chart
    const assetsData = [
        { name: 'Caixa / Conta Corrente', value: metrics.cashBalance },
        { name: 'Investimentos', value: metrics.investmentBalance },
    ].filter(d => d.value > 0);

    const COLORS = ['#10b981', '#3b82f6'];

    return (
        <div className="flex-1 p-4 md:p-6 space-y-6">
            <ModuleHeader
                title="Desempenho"
                subtitle="KPIs Globais e Saúde Financeira"
            />

            {/* Top KPI Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card border-white/10 bg-white/5 hover:border-emerald-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium text-slate-300">Patrimônio Líquido</CardTitle>
                        <Scale className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-white">{formatCurrency(metrics.netWorth)}</div>
                        <p className="text-xs text-slate-500 mt-1">Ativos - Passivos</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-white/10 bg-white/5 hover:border-blue-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium text-slate-300">Score de Saúde</CardTitle>
                        <Activity className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-white">{metrics.healthScore} / 100</div>
                        <Progress
                            value={metrics.healthScore}
                            className="h-2 mt-2 bg-white/10"
                            indicatorClassName={metrics.healthScore > 70 ? "bg-emerald-500" : metrics.healthScore > 40 ? "bg-yellow-500" : "bg-red-500"}
                        />
                    </CardContent>
                </Card>

                <Card className="glass-card border-white/10 bg-white/5 hover:border-emerald-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium text-slate-300">Ativos Totais</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-emerald-400">{formatCurrency(metrics.totalAssets)}</div>
                        <p className="text-xs text-slate-500 mt-1">Caixa + Investimentos</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-white/10 bg-white/5 hover:border-rose-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium text-slate-300">Passivos (Dívidas)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-rose-400">{formatCurrency(metrics.totalLiabilities)}</div>
                        <p className="text-xs text-slate-500 mt-1">{metrics.totalLiabilities === 0 ? 'Sem dívidas' : 'Reduzir gradualmente'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Insights Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Asset Composition Chart */}
                <Card className="lg:col-span-2 glass-card border-white/10 bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Composição de Ativos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assetsData.length > 0 ? (
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={assetsData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {assetsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-6 text-sm mt-4">
                                    {assetsData.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2 text-slate-300">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                            <span className="text-xs">{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-slate-500">
                                <div className="text-center">
                                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>Sem ativos registrados</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-emerald-900/10">
                    <CardHeader>
                        <CardTitle className="text-emerald-400 flex items-center gap-2 text-base">
                            <Sparkles className="h-4 w-4" />
                            Diagnóstico IA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-300">
                            Análise baseada nos seus dados:
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2 p-2 rounded bg-white/5">
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${metrics.savingsRate > 20 ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-white">Taxa de Poupança</p>
                                    <p className="text-xs text-slate-400">{metrics.savingsRate.toFixed(1)}% {metrics.savingsRate > 20 ? '(Excelente!)' : '(Melhorar)'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 p-2 rounded bg-white/5">
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${metrics.totalLiabilities === 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-white">Endividamento</p>
                                    <p className="text-xs text-slate-400">{metrics.totalLiabilities === 0 ? 'Zero (Ótimo!)' : formatCurrency(metrics.totalLiabilities)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 p-2 rounded bg-white/5">
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${metrics.netWorth > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-white">Patrimônio</p>
                                    <p className="text-xs text-slate-400">{metrics.netWorth > 0 ? 'Positivo ✓' : 'Negativo (Atenção!)'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mt-4">
                            <p className="text-xs text-emerald-200 italic leading-relaxed">
                                💡 "Continue mantendo seus custos fixos abaixo de 55% para acelerar sua liberdade financeira."
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
