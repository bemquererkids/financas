'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function InvestmentChart({ data, color = '#10b981' }: { data: any[], color?: string }) {
    if (!data || data.length === 0) return null;

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `R$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `R$${(val / 1000).toFixed(0)}k`;
        return val.toString();
    };

    const formatCurrencyFull = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    }

    return (
        <div className="h-full w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 40,
                        left: 10,
                        bottom: 30,
                    }}
                >
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="year"
                        stroke="#94a3b8"
                        tickFormatter={(val) => `${val} Anos`}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 12 }}
                        width={80}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                        itemStyle={{ color: color }}
                        formatter={(value: number) => [formatCurrencyFull(value), "Saldo Patrimonial"]}
                        labelFormatter={(label) => `${label} Anos de Acumulação`}
                    />
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
