'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('Unauthorized - Please sign in');
    }
    return session.user.id;
}

export async function getDebts() {
    const userId = await getUserId();
    return await prisma.debt.findMany({
        where: { userId },
        orderBy: { totalValue: 'desc' }
    });
}

export async function createDebt(formData: FormData) {
    const userId = await getUserId();
    const name = formData.get('name') as string;
    const totalValue = parseFloat(formData.get('totalValue') as string);
    const monthlyPayment = parseFloat(formData.get('monthlyPayment') as string);
    const interestRate = parseFloat(formData.get('interestRate') as string) || 0;

    if (!name || isNaN(totalValue)) {
        return { error: 'Dados inválidos' };
    }

    await prisma.debt.create({
        data: {
            name,
            totalValue,
            remainingValue: totalValue, // Inicialmente igual ao total
            monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
            interestRate,
            status: 'ACTIVE',
            userId
        }
    });

    revalidatePath('/debts');
    return { success: true };
}

export async function payoffDebt(id: string) {
    const userId = await getUserId();
    // Verifica se a dívida pertence ao usuário antes de atualizar
    const debt = await prisma.debt.findUnique({ where: { id } });
    if (debt?.userId !== userId) throw new Error('Unauthorized');

    await prisma.debt.update({
        where: { id },
        data: {
            status: 'PAID',
            remainingValue: 0
        }
    });
    revalidatePath('/debts');
}

export async function deleteDebt(id: string) {
    const userId = await getUserId();
    // Verifica se a dívida pertence ao usuário antes de deletar
    const debt = await prisma.debt.findUnique({ where: { id } });
    if (debt?.userId !== userId) throw new Error('Unauthorized');

    await prisma.debt.delete({ where: { id } });
    revalidatePath('/debts');
}
