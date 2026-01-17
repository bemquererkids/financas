'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DayTransactions {
    date: string;
    label: string;
    transactions: {
        id: string;
        description: string;
        category: string;
        amount: number;
        type: string;
        status: string;
    }[];
}

export interface CashFlowData {
    month: string;
    year: number;
    monthIndex: number;
    totalIncome: number;
    totalExpense: number;
    days: DayTransactions[];
}

export async function getCashFlow(year: number, month: number): Promise<CashFlowData> {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const transactions = await prisma.transaction.findMany({
        where: {
            date: { gte: firstDay, lte: lastDay }
        },
        orderBy: { date: 'desc' }
    });

    // Group by day
    const dayMap = new Map<string, DayTransactions>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    transactions.forEach(t => {
        const dateKey = t.date.toISOString().split('T')[0];
        const txDate = new Date(t.date);
        txDate.setHours(0, 0, 0, 0);

        // Determine label
        let label: string;
        const diffDays = Math.floor((today.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            label = 'Hoje';
        } else if (diffDays === 1) {
            label = 'Ontem';
        } else {
            label = txDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
        }

        if (!dayMap.has(dateKey)) {
            dayMap.set(dateKey, {
                date: dateKey,
                label,
                transactions: []
            });
        }

        dayMap.get(dateKey)!.transactions.push({
            id: t.id,
            description: t.description,
            category: t.category,
            amount: Number(t.amount),
            type: t.type,
            status: 'pago'
        });
    });

    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0);

    const monthName = firstDay.toLocaleDateString('pt-BR', { month: 'long' });

    return {
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        year,
        monthIndex: month,
        totalIncome,
        totalExpense,
        days: Array.from(dayMap.values()).sort((a, b) => b.date.localeCompare(a.date))
    };
}
