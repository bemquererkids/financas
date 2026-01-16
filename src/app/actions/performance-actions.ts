'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPerformanceMetrics() {
    // 1. Calculate Net Worth (Patrimônio Líquido)
    // Assets = Cash Balance + Investments (Projections initial balance for now)
    // Liabilities = Total Debts

    const transactions = await prisma.transaction.findMany();
    const debts = await prisma.debt.findMany();
    const projections = await prisma.investmentProjection.findMany();

    // Current Cash Balance (Sum of all time income - expenses)
    const cashBalance = transactions.reduce((acc, t) => {
        return acc + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount));
    }, 0);

    // Investment Balance (Sum of 'Initial Balance' of active projections + manual entries if we had them)
    // For now, let's take the sum of initial balances from scenarios as "Invested Principal"
    const investmentBalance = projections.reduce((acc, p) => acc + Number(p.initialBalance), 0);

    const totalAssets = cashBalance + investmentBalance;

    // Liabilities
    const totalLiabilities = debts.reduce((acc, d) => acc + Number(d.remainingValue), 0);

    const netWorth = totalAssets - totalLiabilities;

    // 2. Financial Health Score (0-100)
    // Simplified logic: 
    // + Savings Rate > 20% (+30 pts)
    // + No Bad Debt (+30 pts)
    // + Positive Net Worth (+40 pts)

    let healthScore = 0;
    if (netWorth > 0) healthScore += 40;
    if (totalLiabilities < (totalAssets * 0.3)) healthScore += 30; // Debt is less than 30% of assets

    // Calculate average savings rate
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    if (savingsRate > 20) healthScore += 30;
    else if (savingsRate > 10) healthScore += 15;

    return {
        netWorth,
        totalAssets,
        totalLiabilities,
        cashBalance,
        investmentBalance,
        healthScore,
        savingsRate: savingsRate.toFixed(1)
    };
}
