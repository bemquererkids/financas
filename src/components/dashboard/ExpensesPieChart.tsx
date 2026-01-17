'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ExpenseData {
    category: string;
    amount: number;
}

interface ExpensesPieChartProps {
    data: ExpenseData[];
}

const COLORS = [
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#ef4444', // red
    '#3b82f6', // blue
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
];

export function ExpensesPieChart({ data }: ExpensesPieChartProps) {
    const total = data.reduce((acc, item) => acc + item.amount, 0);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            const percentage = ((item.amount / total) * 100).toFixed(1);
            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-medium">{item.category}</p>
                    <p className="text-emerald-400 font-mono">{formatCurrency(item.amount)}</p>
                    <p className="text-slate-400 text-sm">{percentage}% do total</p>
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
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="category"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="transparent"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
