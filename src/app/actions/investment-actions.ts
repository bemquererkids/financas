'use server';

import { prisma } from '@/lib/prisma';
import { FinancialEngine } from '@/lib/engine';
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

export async function getProjections() {
    const userId = await getUserId();

    const projections = await prisma.investmentProjection.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });

    return projections.map(p => ({
        ...p,
        initialBalance: Number(p.initialBalance),
        monthlyContribution: Number(p.monthlyContribution),
        annualReturnRate: Number(p.annualReturnRate),
        adminFeeRate: Number(p.adminFeeRate),
        createdAt: p.createdAt.toISOString()
    }));
}

export async function createProjection(formData: FormData) {
    const userId = await getUserId();

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
            userId,
            name,
            initialBalance,
            monthlyContribution,
            annualReturnRate,
            adminFeeRate: 0,
            years
        }
    });

    revalidatePath('/investments');
    return { success: true };
}

export async function calculateProjectionData(data: { initial: number, monthly: number, rate: number, years: number }) {
    // This is a pure calculation function, no user data involved
    return FinancialEngine.projectInvestment(data.initial, data.monthly, data.rate, data.years);
}
