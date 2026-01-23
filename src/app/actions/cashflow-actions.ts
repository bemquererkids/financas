'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('Unauthorized - Please sign in');
    }
    return session.user.id;
}

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
    const userId = await getUserId();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
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

        let label: string;
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0];

        if (dateKey === todayStr) {
            label = 'Hoje';
        } else if (dateKey === yesterdayStr) {
            label = 'Ontem';
        } else {
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

    // MERGE: Include Payables as "Scheduled" transactions
    const payables = await prisma.payable.findMany({
        where: {
            paymentWindow: {
                userId,
                month: `${year}-${String(month + 1).padStart(2, '0')}`
            },
            isPaid: false
        }
    });

    payables.forEach(p => {
        // Use DueDate as the date key
        const dateKey = p.dueDate.toISOString().split('T')[0];

        // Ensure Day Map Entry exists (logic duplicated for safety)
        if (!dayMap.has(dateKey)) {
            let label: string;
            const today = new Date(); // Re-instantiate to avoid scope issues if copied directly
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];
            const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0];

            if (dateKey === todayStr) {
                label = 'Hoje';
            } else if (dateKey === yesterdayStr) {
                label = 'Ontem';
            } else {
                const [y, m, d] = dateKey.split('-');
                const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                label = `${parseInt(d)} de ${monthNames[parseInt(m) - 1]}`;
            }

            dayMap.set(dateKey, {
                date: dateKey,
                label,
                transactions: []
            });
        }

        dayMap.get(dateKey)!.transactions.push({
            id: p.id,
            description: p.name,
            category: 'Agendado',
            amount: Number(p.amount),
            type: 'EXPENSE',
            status: 'agendado' // Distinct status for UI
        });
    });

    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpenseReal = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpenseProjected = payables.reduce((acc, p) => acc + Number(p.amount), 0);

    const monthName = firstDay.toLocaleDateString('pt-BR', { month: 'long' });

    return {
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        year,
        monthIndex: month,
        totalIncome,
        totalExpense: totalExpenseReal + totalExpenseProjected,
        days: Array.from(dayMap.values()).sort((a, b) => b.date.localeCompare(a.date))
    };
}
