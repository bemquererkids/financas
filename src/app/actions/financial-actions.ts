'use server';

import { PrismaClient } from '@prisma/client';
import { FinancialEngine } from '@/lib/engine';

// Singleton prisma client to avoid too many connections in dev
const prisma = new PrismaClient();

export async function getFinancialSummary() {
    // Busca transações do mês atual
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
        where: {
            date: {
                gte: firstDay,
                lte: lastDay,
            }
        }
    });

    const engine = new FinancialEngine(transactions);
    const ledger = engine.calculateLedger();
    const rule503020 = engine.calculateRule503020(ledger);

    return {
        period: `${today.toLocaleString('pt-BR', { month: 'long' })} / ${today.getFullYear()}`,
        income: ledger.totalIncome,
        expenses: ledger.totalExpense,
        balance: ledger.balance,
        savingsRate: ledger.savingsRate,
        rule503020
    };
}

export async function getRecentTransactions() {
    const transactions = await prisma.transaction.findMany({
        take: 10,
        orderBy: {
            date: 'desc'
        }
    });

    // Serialize dates strictly for client component
    return transactions.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        description: t.description,
        category: t.category,
        type: t.type,
        date: t.date.toISOString(),
    }));
}

export async function getExpensesByCategory() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
        where: {
            date: { gte: firstDay, lte: lastDay },
            type: 'EXPENSE'
        }
    });

    // Group by category
    const categoryMap = new Map<string, number>();
    transactions.forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + Number(t.amount));
    });

    // Convert to array and sort by amount
    return Array.from(categoryMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8); // Top 8 categories
}

export async function getMonthlyTrend() {
    const today = new Date();
    const months: { month: string; income: number; expense: number }[] = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

        const transactions = await prisma.transaction.findMany({
            where: {
                date: { gte: firstDay, lte: lastDay }
            }
        });

        const income = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((acc, t) => acc + Number(t.amount), 0);

        const expense = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((acc, t) => acc + Number(t.amount), 0);

        const monthName = targetDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');

        months.push({
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            income,
            expense
        });
    }

    return months;
}

// Função agregadora de notificações para o Sino
export async function getNotifications() {

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // 1. Últimas 5 Transações
    const recentTx = await prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' } // Pela data de criação (insert), não pela data da despesa
    });

    // 2. Contas a Pagar Próximas (vencimento hoje ou futuro próximo)
    // Note: Precisamos verificar se o model Payable existe e está acessível.
    // O schema.prisma mostrou que Payable existe.
    const upcomingPayables = await prisma.payable.findMany({
        where: {
            dueDate: {
                gte: today,
                lte: nextWeek
            },
            isPaid: false
        },
        orderBy: { dueDate: 'asc' },
        take: 3
    });

    const notifications = [
        ...recentTx.map(t => ({
            id: t.id,
            type: t.type === 'INCOME' ? 'income' : 'expense',
            title: t.description,
            subtitle: t.type === 'INCOME' ? `Receita de R$ ${Number(t.amount)}` : `Gasto de R$ ${Number(t.amount)}`,
            date: t.createdAt.toISOString(),
            icon: t.type === 'INCOME' ? 'arrow-up' : 'arrow-down'
        })),
        ...upcomingPayables.map(p => ({
            id: p.id,
            type: 'alert',
            title: `Vencimento: ${p.name}`,
            subtitle: `R$ ${Number(p.amount)} vence em breve`,
            date: p.dueDate.toISOString(),
            icon: 'alert'
        }))
    ];

    // Ordenar por data (mais recente primeiro)
    return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
