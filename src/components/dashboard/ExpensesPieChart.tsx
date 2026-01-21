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

    const formatCategoryLabel = (cat: string) => {
        const dict: Record<string, string> = {
            'CREDIT_CARD_BILL': 'Fatura Cartão',
            'INCOME': 'Receita',
            'EXPENSE': 'Despesa',
            'SALARY': 'Salário',
            'INVESTMENT': 'Investimento',
            // Adicione outros conforme necessário
        };
        if (dict[cat]) return dict[cat];
        // Title Case fallback
        if (cat === cat.toUpperCase() || cat === cat.toLowerCase()) {
            return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase().replace(/_/g, ' ');
        }
        return cat;
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            const percentage = ((item.amount / total) * 100).toFixed(1);
            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-medium">{formatCategoryLabel(item.category)}</p>
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
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
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
                        formatter={(value) => <span className="text-slate-300 text-xs">{formatCategoryLabel(value)}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
