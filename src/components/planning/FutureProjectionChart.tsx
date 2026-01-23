'use client';

import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface ProjectionPoint {
    month: string;
    saldo: number;
}

interface FutureProjectionChartProps {
    data: ProjectionPoint[];
}

export function FutureProjectionChart({ data }: FutureProjectionChartProps) {
    // Calculando crescimento percentual
    const startBalance = data[0]?.saldo || 0;
    const endBalance = data[data.length - 1]?.saldo || 0;
    const growth = startBalance === 0 ? 100 : ((endBalance - startBalance) / Math.abs(startBalance)) * 100;
    const isPositive = growth >= 0;

    return (
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-xl overflow-hidden w-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                <div>
                    <CardTitle className="text-lg text-white font-bold">Projeção Patrimonial</CardTitle>
                    <p className="text-xs text-slate-400">Previsão baseada no seu comportamento atual</p>
                </div>
                <div className="flex gap-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isPositive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        {isPositive ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                        <span className={`text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {growth > 999 ? '>999%' : `${growth.toFixed(1)}%`}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[350px]">
                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
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
                                width={60}
                            />
                            <Tooltip
                                wrapperStyle={{ zIndex: 100 }}
                                cursor={{ stroke: '#475569', strokeWidth: 1 }}
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
                                stroke={isPositive ? "#10b981" : "#ef4444"}
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
