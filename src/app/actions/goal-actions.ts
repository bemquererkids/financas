'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getGoals() {
    return await prisma.goal.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function createGoal(formData: FormData) {
    const description = formData.get('description') as string;
    const targetAmount = parseFloat(formData.get('targetAmount') as string);

    if (!description) return { error: 'Descrição obrigatória' };

    await prisma.goal.create({
        data: {
            description,
            targetAmount: isNaN(targetAmount) ? null : targetAmount,
            status: 'PENDING'
        }
    });

    revalidatePath('/goals');
    return { success: true };
}

export async function toggleGoalStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    await prisma.goal.update({
        where: { id },
        data: { status: newStatus }
    });
    revalidatePath('/goals');
}

export async function deleteGoal(id: string) {
    await prisma.goal.delete({ where: { id } });
    revalidatePath('/goals');
}
