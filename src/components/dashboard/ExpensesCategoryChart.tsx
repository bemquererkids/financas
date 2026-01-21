'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExpenseData {
    category: string;
    amount: number;
}

interface ExpensesCategoryChartProps {
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

export function ExpensesCategoryChart({ data }: ExpensesCategoryChartProps) {
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
            const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0.0';

            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-md">
                    <p className="text-white font-medium mb-1">{formatCategoryLabel(item.category)}</p>
                    <div className="flex items-center gap-2">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: payload[0].color || payload[0].fill }}
                        />
                        <p className="text-emerald-400 font-mono font-bold text-lg">{formatCurrency(item.amount)}</p>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{percentage}% do total</p>
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[250px] text-slate-500">
                Sem dados para exibir para gráfico
            </div>
        );
    }

    // Ordenar dados por valor para ficar mais bonito (decrescente)
    const sortedData = [...data].sort((a, b) => b.amount - a.amount);

    return (
        <div className="w-full h-[300px] md:h-full min-h-[300px] p-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={sortedData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="category"
                        type="category"
                        width={100}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(value) => formatCategoryLabel(value).slice(0, 15)}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar
                        dataKey="amount"
                        radius={[0, 4, 4, 0]}
                        barSize={32}
                        animationDuration={1500}
                    >
                        {sortedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
