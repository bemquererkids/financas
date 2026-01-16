'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getDebts() {
    return await prisma.debt.findMany({
        orderBy: { totalValue: 'desc' }
    });
}

export async function createDebt(formData: FormData) {
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
            status: 'ACTIVE'
        }
    });

    revalidatePath('/debts');
    return { success: true };
}

export async function payoffDebt(id: string) {
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
    await prisma.debt.delete({ where: { id } });
    revalidatePath('/debts');
}
