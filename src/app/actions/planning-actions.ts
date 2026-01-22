'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getFinancialProjection() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: 'Usuário não autenticado' };
    }

    const userId = session.user.id;

    try {
        // 1. Buscar dados do usuário (Renda e Perfil)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { monthlyIncome: true }
        });

        const income = user?.monthlyIncome || 0;

        // 2. Calcular Saldo Atual Real (Receitas - Despesas)
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            select: { type: true, amount: true, date: true }
        });

        let currentBalance = 0;
        let totalExpensesLast3Months = 0;
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        transactions.forEach(t => {
            const amount = Number(t.amount);
            if (t.type === 'INCOME') {
                currentBalance += amount;
            } else {
                currentBalance -= amount;

                // Calcular despesas recentes para média
                if (new Date(t.date) >= threeMonthsAgo) {
                    totalExpensesLast3Months += amount;
                }
            }
        });

        // 3. Estimar Despesa Mensal Média
        // Se tiver histórico, usa média dos últimos 3 meses. Se não, usa 80% da renda como estimativa conservadora (segurança)
        let averageMonthlyExpense = totalExpensesLast3Months / 3;
        if (averageMonthlyExpense === 0 && income > 0) {
            averageMonthlyExpense = income * 0.8;
        }

        // 4. Gerar Projeção para 12 Meses
        const projection = [];
        let accumulatedBalance = currentBalance;
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        for (let i = 0; i < 12; i++) {
            const futureDate = new Date();
            futureDate.setMonth(now.getMonth() + i);

            // Fluxo de caixa mensal previsto (Renda - Despesa Média)
            const expectedCashflow = income - averageMonthlyExpense;

            accumulatedBalance += expectedCashflow;

            projection.push({
                month: monthNames[futureDate.getMonth()],
                year: futureDate.getFullYear(),
                saldo: Math.round(accumulatedBalance),
                receita: income,
                despesa: Math.round(averageMonthlyExpense)
            });
        }

        return {
            currentBalance,
            averageMonthlyExpense,
            monthlyIncome: income,
            projection
        };

    } catch (error) {
        console.error('Erro ao calcular projeção:', error);
        return { error: 'Falha ao processar dados financeiros' };
    }
}
