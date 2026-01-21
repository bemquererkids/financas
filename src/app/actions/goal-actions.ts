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

export async function getGoals() {
    const userId = await getUserId();
    return await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
}

export async function createGoal(formData: FormData) {
    const userId = await getUserId();
    const description = formData.get('description') as string;
    const targetAmount = parseFloat(formData.get('targetAmount') as string);

    if (!description) return { error: 'Descrição obrigatória' };

    await prisma.goal.create({
        data: {
            description,
            targetAmount: isNaN(targetAmount) ? null : targetAmount,
            status: 'PENDING',
            userId
        }
    });

    revalidatePath('/goals');
    return { success: true };
}

export async function toggleGoalStatus(id: string, currentStatus: string) {
    const userId = await getUserId();
    const goal = await prisma.goal.findUnique({ where: { id } });
    if (goal?.userId !== userId) throw new Error('Unauthorized');

    const newStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    await prisma.goal.update({
        where: { id },
        data: { status: newStatus }
    });
    revalidatePath('/goals');
}

export async function deleteGoal(id: string) {
    const userId = await getUserId();
    const goal = await prisma.goal.findUnique({ where: { id } });
    if (goal?.userId !== userId) throw new Error('Unauthorized');

    await prisma.goal.delete({ where: { id } });
    revalidatePath('/goals');
}
