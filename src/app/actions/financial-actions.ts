'use server';

import { prisma } from '@/lib/prisma';
import { FinancialEngine } from '@/lib/engine';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // MERGE: Financial Engine now considers BOTH Transactions AND Projected Payables for accurate forecasting
    // 1. Calculate confirmed values from Transactions
    const engine = new FinancialEngine(transactions);
    const ledger = engine.calculateLedger();

    // 2. Fetch Payables (Unpaid) for the target month
    const projectedPayables = await prisma.payable.findMany({
        where: {
            paymentWindow: {
                userId,
                // Filter by the target month based on paymentWindow month string
                month: `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`
            },
            isPaid: false
        }
    });

    const projectedExpenses = projectedPayables.reduce((acc, p) => acc + Number(p.amount), 0);

    // 3. Merge limits and projections
    // If we are looking at a future month (or current), 'expenses' should include projections
    // Income is strictly what is received (Transactions), but for 'Balance', we define:
    // Balance = (Income - Expenses). If Expense is projected, Balance decreases.
    const totalExpenses = ledger.totalExpense + projectedExpenses;
    const finalBalance = ledger.totalIncome - totalExpenses;
    const fundsAvailable = finalBalance; // Simplified view: What's left after ALL bills

    // Formatar o período para exibição
    const displayDate = new Date(targetYear, targetMonth, 1);

    return {
        period: `${displayDate.toLocaleString('pt-BR', { month: 'long' })} / ${targetYear}`,
        income: ledger.totalIncome,
        expenses: totalExpenses, // Now includes projected
        balance: finalBalance,   // Now reflects projected
        commitments: projectedExpenses, // Specifically shows what is pending
        fundsAvailable,
        savingsRate: ledger.savingsRate, // Savings rate might be skewed by projected expenses, but acceptable for estimation
        rule503020: engine.calculateRule503020({ ...ledger, totalExpense: totalExpenses, balance: finalBalance })
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

    // 1. Fetch Real Transactions
    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            ...dateFilter
        },
        orderBy: { date: 'desc' }
    });

    // 2. Fetch Projected Payables (if specific month is requested)
    let projectedNodes: any[] = [];
    if (month !== undefined && year !== undefined) {
        const payables = await prisma.payable.findMany({
            where: {
                paymentWindow: {
                    userId,
                    month: `${year}-${String(month + 1).padStart(2, '0')}`
                },
                isPaid: false
            }
        });

        projectedNodes = payables.map(p => ({
            id: p.id,
            amount: Number(p.amount),
            description: p.name,
            category: 'Agendado', // Special category for easy UI distinction
            type: 'EXPENSE',
            date: p.dueDate.toISOString(),
            status: 'scheduled'
        }));
    }

    // 3. Merge and Sort
    const allItems = [
        ...transactions.map(t => ({
            id: t.id,
            amount: Number(t.amount),
            description: t.description,
            category: t.category,
            type: t.type,
            date: t.date.toISOString(),
            status: 'completed'
        })),
        ...projectedNodes
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit if needed (only if NO filter was applied, to mimic 'Recent' behavior, otherwise show all)
    // Actually, if date-filtered, we show ALL (scrollbar handles it). If global, take 25.
    const finalLimit = (month !== undefined && year !== undefined) ? undefined : 25;

    return finalLimit ? allItems.slice(0, finalLimit) : allItems;
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

    // Add Projected Payables
    const payables = await prisma.payable.findMany({
        where: {
            paymentWindow: {
                userId,
                month: `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`
            },
            isPaid: false
        }
    });

    if (payables.length > 0) {
        const currentFixed = categoryMap.get('Contas Fixas') || 0;
        const projectedTotal = payables.reduce((acc, p) => acc + Number(p.amount), 0);
        categoryMap.set('Contas Fixas', currentFixed + projectedTotal);
    }

    // Convert to array and sort by amount
    return Array.from(categoryMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8); // Top 8 categories
}

export async function getMonthlyTrend(month?: number, year?: number) {
    const userId = await getUserId();

    const baseDate = (month !== undefined && year !== undefined)
        ? new Date(year, month, 1)
        : new Date();

    const months: { month: string; income: number; expense: number }[] = [];

    // Get last 6 months ending in the target month
    for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
        const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

        // Transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: firstDay, lte: lastDay }
            }
        });

        const income = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((acc, t) => acc + Number(t.amount), 0);

        let expense = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((acc, t) => acc + Number(t.amount), 0);

        // Fetch projected expenses (Payables) for this month
        // We do this for all months in the trend to be consistent (historical unpaid bills might be relevant or not, usually only future)
        // But simplifying: fetch unpaid payables for the month string
        const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        const payables = await prisma.payable.findMany({
            where: {
                paymentWindow: {
                    userId,
                    month: monthStr
                },
                isPaid: false
            }
        });

        expense += payables.reduce((acc, p) => acc + Number(p.amount), 0);


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

export async function getFullFinancialContext() {
    const userId = await getUserId();
    const summary = await getFinancialSummary();
    const goals = await prisma.goal.findMany({ where: { userId, status: { not: 'COMPLETED' } } });
    const debts = await prisma.debt.findMany({ where: { userId, status: { not: 'PAID' } } });
    const lastTransactions = await prisma.transaction.findMany({
        where: { userId },
        take: 10,
        orderBy: { date: 'desc' }
    });
    const upcomingBills = await prisma.payable.findMany({
        where: {
            paymentWindow: { userId },
            isPaid: false,
            dueDate: { gte: new Date() }
        },
        take: 5,
        orderBy: { dueDate: 'asc' }
    });

    return {
        summary,
        goals,
        debts,
        lastTransactions,
        upcomingBills
    };
}
