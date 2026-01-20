'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('Unauthorized - Please sign in');
    }
    return session.user.id;
}

export async function deleteTransaction(id: string) {
    try {
        const userId = await getUserId();

        // Verify ownership
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!transaction || transaction.userId !== userId) {
            return { error: 'Unauthorized' };
        }

        await prisma.transaction.delete({
            where: { id }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete transaction' };
    }
}

export async function updateTransaction(id: string, formData: FormData) {
    try {
        const userId = await getUserId();

        // Verify ownership
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!transaction || transaction.userId !== userId) {
            return { error: 'Unauthorized' };
        }

        const amount = parseFloat(formData.get('amount') as string);
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const rawType = formData.get('type') as string;
        const dateStr = formData.get('date') as string;

        const isIncome = rawType.includes('Renda') || rawType === 'Outras Receitas' || rawType === 'INCOME';
        const type = isIncome ? 'INCOME' : 'EXPENSE';

        await prisma.transaction.update({
            where: { id },
            data: {
                amount,
                description,
                category,
                type,
                date: new Date(dateStr)
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update transaction' };
    }
}
