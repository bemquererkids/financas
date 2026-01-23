import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const userId = session.user.id;

        // Buscar transações dos últimos 3 meses
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: threeMonthsAgo },
                type: 'EXPENSE'
            },
            orderBy: { date: 'desc' }
        });

        if (transactions.length === 0) {
            return Response.json({
                success: true,
                prediction: {
                    nextMonthTotal: 0,
                    message: 'Ainda não há dados suficientes para previsões. Continue registrando suas despesas!'
                }
            });
        }

        // Agrupar por mês
        const monthlyTotals: { [key: string]: number } = {};
        const categoryTotals: { [key: string]: number[] } = {};

        transactions.forEach(t => {
            const monthKey = t.date.toISOString().slice(0, 7); // YYYY-MM
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(t.amount);

            if (!categoryTotals[t.category]) {
                categoryTotals[t.category] = [];
            }
            categoryTotals[t.category].push(Number(t.amount));
        });

        // Calcular média mensal
        const months = Object.keys(monthlyTotals);
        const avgMonthlyExpense = months.reduce((sum, month) => sum + monthlyTotals[month], 0) / months.length;

        // Identificar categorias com maior gasto
        const topCategories = Object.entries(categoryTotals)
            .map(([category, amounts]) => ({
                category,
                total: amounts.reduce((a, b) => a + b, 0),
                avg: amounts.reduce((a, b) => a + b, 0) / amounts.length,
                count: amounts.length
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);

        // Detectar tendências
        const lastMonth = monthlyTotals[months[months.length - 1]] || 0;
        const previousMonth = monthlyTotals[months[months.length - 2]] || 0;
        const trend = lastMonth > previousMonth ? 'crescente' : 'decrescente';
        const trendPercentage = previousMonth > 0
            ? ((lastMonth - previousMonth) / previousMonth * 100).toFixed(1)
            : 0;

        return Response.json({
            success: true,
            prediction: {
                nextMonthTotal: Math.round(avgMonthlyExpense),
                avgMonthlyExpense: Math.round(avgMonthlyExpense),
                trend,
                trendPercentage,
                topCategories: topCategories.map(c => ({
                    category: c.category,
                    avgSpending: Math.round(c.avg),
                    totalTransactions: c.count
                })),
                insights: [
                    `Sua média mensal de gastos é R$ ${avgMonthlyExpense.toFixed(2)}`,
                    `Tendência ${trend} de ${trendPercentage}% em relação ao mês anterior`,
                    `Categoria com maior gasto: ${topCategories[0]?.category || 'N/A'} (R$ ${topCategories[0]?.total.toFixed(2) || 0})`
                ]
            }
        });

    } catch (error) {
        console.error('Prediction Error:', error);
        return Response.json({ error: 'Erro ao gerar previsão' }, { status: 500 });
    }
}
