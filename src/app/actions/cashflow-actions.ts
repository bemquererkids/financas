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
        const dateKey = t.date.toISOString().split('T')[0]; // "2026-01-15"

        // Determine label using date strings (avoids timezone issues)
        let label: string;
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0];

        if (dateKey === todayStr) {
            label = 'Hoje';
        } else if (dateKey === yesterdayStr) {
            label = 'Ontem';
        } else {
            // Format as "15 de janeiro" without timezone issues
            const [year, month, day] = dateKey.split('-');
            const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
            label = `${parseInt(day)} de ${monthNames[parseInt(month) - 1]}`;
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
