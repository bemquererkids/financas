'use client';

import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const data = [
    { month: 'Jan', saldo: 5000 },
    { month: 'Fev', saldo: 6200 },
    { month: 'Mar', saldo: 5800 },
    { month: 'Abr', saldo: 7500 },
    { month: 'Mai', saldo: 8900 },
    { month: 'Jun', saldo: 10500 },
    { month: 'Jul', saldo: 12100 },
    { month: 'Ago', saldo: 11000 },
    { month: 'Set', saldo: 13500 },
    { month: 'Out', saldo: 15200 },
    { month: 'Nov', saldo: 17800 },
    { month: 'Dez', saldo: 20000 },
];

export function FutureProjectionChart() {
    return (
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg text-white font-bold">Projeção Patrimonial</CardTitle>
                    <p className="text-xs text-slate-400">Previsão de crescimento para os próximos 12 meses</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-500">+25%</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(value) => `R$${value / 1000}k`}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl">
                                                <p className="text-slate-400 text-xs mb-1">{payload[0].payload.month}</p>
                                                <p className="text-emerald-400 font-bold text-lg">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(payload[0].value))}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="saldo"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSaldo)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
