'use server';

import { PrismaClient } from '@prisma/client';
import { FinancialEngine } from '@/lib/engine';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Singleton prisma client to avoid too many connections in dev
const prisma = new PrismaClient();

async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('Unauthorized - Please sign in');
    }
    return session.user.id;
}

export async function getFinancialSummary(month?: number, year?: number) {
    const userId = await getUserId();

    const today = new Date();
    const targetMonth = month ?? today.getMonth();
    const targetYear = year ?? today.getFullYear();

    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            date: {
                gte: firstDay,
                lte: lastDay,
            }
        }
    });

    const engine = new FinancialEngine(transactions);
    const ledger = engine.calculateLedger();
    const rule503020 = engine.calculateRule503020(ledger);

    // Calcular compromissos futuros do mês (Contas a Pagar não pagas)
    const pendingPayables = await prisma.payable.findMany({
        where: {
            paymentWindow: {
                userId
            },
            dueDate: {
                gte: today, // Vencem de hoje em diante (no mês atual ou futuro próximo)
                lte: lastDay // Até o fim do mês visualizado
            },
            isPaid: false
        }
    });

    const commitments = pendingPayables.reduce((acc, p) => acc + Number(p.amount), 0);
    const fundsAvailable = ledger.balance - commitments;

    // Formatar o período para exibição
    const displayDate = new Date(targetYear, targetMonth, 1);

    return {
        period: `${displayDate.toLocaleString('pt-BR', { month: 'long' })} / ${targetYear}`,
        income: ledger.totalIncome,
        expenses: ledger.totalExpense,
        balance: ledger.balance,
        commitments,
        fundsAvailable,
        savingsRate: ledger.savingsRate,
        rule503020
    };
}

export async function getRecentTransactions(month?: number, year?: number) {
    const userId = await getUserId();

    let dateFilter = {};
    if (month !== undefined && year !== undefined) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        dateFilter = {
            date: {
                gte: firstDay,
                lte: lastDay,
            }
        };
    } else {
        // Se não filtrar por data, pega as do mês atual por padrão na visualização de lista da dashboard?
        // O comportamento original era "últimas 25 globais".
        // Mas se o usuário quer "ver o mês", ele quer ver TODAS do mês.
        // Vamos manter o comportamento: Se passar data, filtra data. Se não passar, pega as top 25 globais (comportamento de 'Recentes').
        // EDIT: Na Dashboard, se não tem filtro, é o mês atual. 
        // Então vamos padronizar: Dashboard sempre chama com mês atual se não tiver query params.

        // Mantendo compatibilidade com chat (sem args):
        // Se sem args -> take 25 global.
    }

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            ...dateFilter
        },
        take: (month !== undefined && year !== undefined) ? undefined : 25, // Se tem filtro de mês, traz todas do mês. Se não, traz 25.
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

export async function getExpensesByCategory(month?: number, year?: number) {
    const userId = await getUserId();

    const today = new Date();
    const targetMonth = month ?? today.getMonth();
    const targetYear = year ?? today.getFullYear();

    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
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
    const userId = await getUserId();

    const today = new Date();
    const months: { month: string; income: number; expense: number }[] = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
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
    const userId = await getUserId();

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // 1. Últimas 5 Transações
    const recentTx = await prisma.transaction.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    // 2. Contas a Pagar Próximas (vencimento hoje ou futuro próximo)
    const upcomingPayables = await prisma.payable.findMany({
        where: {
            paymentWindow: {
                userId
            },
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
