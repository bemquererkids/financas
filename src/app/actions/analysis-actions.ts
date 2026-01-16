'use server';

import { PrismaClient } from '@prisma/client';
import { getMonth, getYear } from 'date-fns';

const prisma = new PrismaClient();

export type MonthResult = {
    month: string;
    totalIncome: number;
    totalExpense: number;
    categories: Record<string, number>;
};

export async function getMonthlyAnalysis() {
    const transactions = await prisma.transaction.findMany({
        orderBy: { date: 'asc' }
    });

    // Agrupamento manual simples (Poderia ser SQL GroupBy)
    const groupedByMonth: Record<string, MonthResult> = {};

    // Meses Fixos (Janeiro a Dezembro do ano atual e próximo se tiver dados)
    // Para demo, vamos pegar os meses que têm dados

    transactions.forEach(t => {
        const monthKey = `${new Date(t.date).toLocaleString('pt-BR', { month: 'long' })}/${new Date(t.date).getFullYear()}`;

        if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = {
                month: monthKey,
                totalIncome: 0,
                totalExpense: 0,
                categories: {}
            };
        }

        const value = Number(t.amount);

        if (t.type === 'INCOME') {
            groupedByMonth[monthKey].totalIncome += value;
        } else {
            groupedByMonth[monthKey].totalExpense += value;

            // Soma por categoria
            if (!groupedByMonth[monthKey].categories[t.category]) {
                groupedByMonth[monthKey].categories[t.category] = 0;
            }
            groupedByMonth[monthKey].categories[t.category] += value;
        }
    });

    return Object.values(groupedByMonth);
}
