'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
}

export async function upsertBudget(category: string, amount: number) {
    const userId = await getUserId();

    // Normalize category (keep consistent casing)
    // We treat user-facing "Alimentação" map to internal "Alimentação" 
    // Ideally we should use ENUMs but string is flexible for now.

    await prisma.budget.upsert({
        where: {
            userId_category: {
                userId,
                category
            }
        },
        update: {
            amount
        },
        create: {
            userId,
            category,
            amount
        }
    });

    revalidatePath('/');
    return { success: true };
}

export async function getBudgetsStatus(month?: number, year?: number) {
    const userId = await getUserId();

    const today = new Date();
    const targetMonth = month ?? today.getMonth();
    const targetYear = year ?? today.getFullYear();

    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);

    // 1. Get Defined Budgets
    const budgets = await prisma.budget.findMany({
        where: { userId }
    });

    if (budgets.length === 0) return [];

    // 2. Calculate Spending per Category (Transactions + Payables)
    // Transactions
    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            date: { gte: firstDay, lte: lastDay },
            type: 'EXPENSE'
        }
    });

    // Payables (Projected for this month)
    const payables = await prisma.payable.findMany({
        where: {
            paymentWindow: {
                userId,
                month: `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`
            },
            isPaid: false
        }
    });

    const spendingMap = new Map<string, number>();

    // Sum Transactions
    transactions.forEach(t => {
        const current = spendingMap.get(t.category) || 0;
        spendingMap.set(t.category, current + Number(t.amount));
    });

    // Sum Payables (Assume 'Contas Fixas' or specific category if we had it, fallback to 'Outros' or match name?)
    // For now, let's assume Payables generally map to 'Contas Fixas' unless we add category to Payable.
    // Or we try to match by name? Let's simplify: Payables = 'Contas Fixas'.
    const currentFixed = spendingMap.get('Contas Fixas') || 0;
    const projectedTotal = payables.reduce((acc, p) => acc + Number(p.amount), 0);
    spendingMap.set('Contas Fixas', currentFixed + projectedTotal);


    // 3. Build Result
    const status = budgets.map(b => {
        const spent = spendingMap.get(b.category) || 0;
        const limit = Number(b.amount);
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;

        return {
            id: b.id,
            category: b.category,
            limit,
            spent,
            percentage,
            remaining: limit - spent
        };
    });

    // Sort by percentage usage (most critical first)
    return status.sort((a, b) => b.percentage - a.percentage);
}
