'use server';

import { PrismaClient } from '@prisma/client';
import { FinancialEngine } from '@/lib/engine';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getProjections() {
    return await prisma.investmentProjection.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function createProjection(formData: FormData) {
    const name = formData.get('name') as string;
    const initialBalance = parseFloat(formData.get('initialBalance') as string);
    const monthlyContribution = parseFloat(formData.get('monthlyContribution') as string);
    const annualReturnRate = parseFloat(formData.get('annualReturnRate') as string);
    const years = parseInt(formData.get('years') as string);

    if (!name || isNaN(initialBalance) || isNaN(monthlyContribution) || isNaN(annualReturnRate) || isNaN(years)) {
        return { error: 'Dados inválidos' };
    }

    await prisma.investmentProjection.create({
        data: {
            name,
            initialBalance,
            monthlyContribution,
            annualReturnRate, // Taxa Bruta
            adminFeeRate: 0, // Simplificação inicial
            years
        }
    });

    revalidatePath('/investments');
    return { success: true };
}

export async function calculateProjectionData(data: { initial: number, monthly: number, rate: number, years: number }) {
    // Wrapper para o Engine estático para uso client-side (via server action se preferir não expor lógica)
    return FinancialEngine.projectInvestment(data.initial, data.monthly, data.rate, data.years);
}
