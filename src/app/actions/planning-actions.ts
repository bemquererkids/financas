'use server';

import { PlanningEngine, MonthData } from "@/lib/planning-engine";
import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPlanningData(): Promise<MonthData[]> {
    const today = new Date();
    // Start from current month
    const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get next 12 months
    return await PlanningEngine.getPlanningGrid(startMonth, 12);
}

export async function addPlanningItem(
    month: string, // YYYY-MM
    amount: number,
    description: string,
    type: 'INCOME' | 'EXPENSE',
    category: string
) {
    // Construct a date: 1st day of the target month
    const [year, m] = month.split('-');
    const date = new Date(parseInt(year), parseInt(m) - 1, 15); // Middle of month to be safe from timezone shifts

    await prisma.transaction.create({
        data: {
            amount,
            description,
            type,
            category,
            date,
            isRecurring: false // Manual planning entry
        }
    });

    revalidatePath('/planning');
    revalidatePath('/'); // Update dashboard too
}

export async function replicateMonthToFuture(
    sourceMonth: string, // YYYY-MM
    targetMonthsCount: number = 11
) {
    // 1. Fetch all transactions from source month
    const [year, m] = sourceMonth.split('-');
    const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(m), 1);

    const transactions = await prisma.transaction.findMany({
        where: {
            date: {
                gte: startDate,
                lt: endDate
            }
        }
    });

    // 2. Clone for future months
    for (let i = 1; i <= targetMonthsCount; i++) {
        const nextMonthDate = new Date(parseInt(year), parseInt(m) - 1 + i, 15);

        // Simple Bulk Insert
        const copies = transactions.map(t => ({
            amount: t.amount,
            description: t.description,
            category: t.category,
            type: t.type,
            date: nextMonthDate,
            isRecurring: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        if (copies.length > 0) {
            await prisma.transaction.createMany({
                data: copies
            });
        }
    }

    revalidatePath('/planning');
}

export async function updatePlanningItem(id: string, amount: number) {
    await prisma.transaction.update({
        where: { id },
        data: { amount, updatedAt: new Date() }
    });

    revalidatePath('/planning');
    revalidatePath('/');
}

export async function deletePlanningItem(id: string) {
    await prisma.transaction.delete({
        where: { id }
    });

    revalidatePath('/planning');
    revalidatePath('/');
}

export async function consolidateMonth(month: string) {
    // Mark all transactions in this month as "consolidated" by updating description
    const [year, m] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(m), 1);

    // Get all recurring (planned) transactions for this month
    const transactions = await prisma.transaction.findMany({
        where: {
            date: { gte: startDate, lt: endDate },
            isRecurring: true
        }
    });

    // Mark them as non-recurring (consolidated/real)
    for (const t of transactions) {
        await prisma.transaction.update({
            where: { id: t.id },
            data: { isRecurring: false }
        });
    }

    revalidatePath('/planning');
    revalidatePath('/');
    
    return { consolidated: transactions.length };
}
