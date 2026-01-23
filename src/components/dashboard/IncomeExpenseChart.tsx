'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface MonthlyData {
    month: string;
    income: number;
    expense: number;
}

interface IncomeExpenseChartProps {
    data: MonthlyData[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-medium mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className={`font-mono text-sm ${entry.dataKey === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {entry.dataKey === 'income' ? 'Receita: ' : 'Despesa: '}
                            {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[250px] text-slate-500">
                Sem dados para exibir
            </div>
        );
    }

    return (
        <div className="w-full h-[300px] md:h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="month"
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Legend
                        wrapperStyle={{ paddingTop: 10 }}
                        iconType="circle"
                        formatter={(value) => (
                            <span className="text-slate-300 text-xs">
                                {value === 'income' ? 'Receita' : 'Despesa'}
                            </span>
                        )}
                    />
                    <Bar
                        dataKey="income"
                        fill="#10b981"
                        radius={[10, 10, 10, 10]}
                        maxBarSize={20}
                        background={false}
                    />
                    <Bar
                        dataKey="expense"
                        fill="#ef4444"
                        radius={[10, 10, 10, 10]}
                        maxBarSize={20}
                        background={false}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
