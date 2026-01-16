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
