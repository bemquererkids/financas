import { Transaction, BudgetEnvelope, InvestmentProjection } from '@prisma/client';

export type LedgerResult = {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
    categoryTotals: Record<string, number>;
};

export type Rule503020Result = {
    needs: { target: number; actual: number; gap: number };
    wants: { target: number; actual: number; gap: number };
    savings: { target: number; actual: number; gap: number };
};

export class FinancialEngine {
    private transactions: Transaction[];

    constructor(transactions: Transaction[]) {
        this.transactions = transactions;
    }

    /**
     * Calculates the Monthly Ledger (Módulo A)
     */
    public calculateLedger(): LedgerResult {
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals: Record<string, number> = {};

        for (const t of this.transactions) {
            const amount = Number(t.amount);

            if (t.type === 'INCOME') {
                totalIncome += amount;
            } else {
                totalExpense += amount;

                // Sum by category
                if (!categoryTotals[t.category]) {
                    categoryTotals[t.category] = 0;
                }
                categoryTotals[t.category] += amount;
            }
        }

        const balance = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            totalIncome,
            totalExpense,
            balance,
            savingsRate: Number(savingsRate.toFixed(2)),
            categoryTotals
        };
    }

    /**
     * Calculates 50/30/20 Rule compliance (Módulo C)
     * Needs: Fixed Costs + Essentials
     * Wants: Leisure + Lifestyle
     * Savings: Investments + Debts
     */
    public calculateRule503020(ledger: LedgerResult): Rule503020Result {
        const income = ledger.totalIncome;

        // Categorization Logic (Can be improved with DB tagging later)
        // Mapping string categories to 50/30/20 buckets
        const needsCategories = ['Moradia', 'Condominio', 'Luz', 'Agua', 'Gas', 'Internet', 'Mercado', 'GasolinaUber', 'IPTU', 'Educacao', 'Saude', 'Seguros'];
        const wantsCategories = ['Celular', 'Estetica', 'Academia', 'Streaming', 'Pet', 'Diarista', 'Lazer', 'Outros'];
        const savingsCategories = ['Dizimo', 'Investimento', 'Previdencia']; // Debts also usually go here or Needs depending on philosophy

        let actualNeeds = 0;
        let actualWants = 0;
        let actualSavings = 0;

        for (const [cat, value] of Object.entries(ledger.categoryTotals)) {
            if (needsCategories.includes(cat)) {
                actualNeeds += value;
            } else if (wantsCategories.includes(cat)) {
                actualWants += value;
            } else {
                actualSavings += value; // Default/Savings
            }
        }

        // Add remaining balance to savings (if positive) or reduce (if negative) - Wait, usually we count what was *allocated*. 
        // But for "Result", let's strictly count expenses vs targets.

        return {
            needs: {
                target: income * 0.50,
                actual: actualNeeds,
                gap: (income * 0.50) - actualNeeds
            },
            wants: {
                target: income * 0.30,
                actual: actualWants,
                gap: (income * 0.30) - actualWants
            },
            savings: {
                target: income * 0.20,
                actual: actualSavings, // Note: This doesn't include the "Leftover cash" sitting in bank, just explicit savings/investments expenses.
                gap: (income * 0.20) - actualSavings
            }
        };
    }

    /**
     * Projects Wealth over time (Módulo D)
     */
    public static projectInvestment(
        initial: number,
        monthly: number,
        rateAnnual: number,
        years: number
    ) {
        const months = years * 12;
        const rateMonthly = Math.pow(1 + rateAnnual / 100, 1 / 12) - 1;

        let balance = initial;
        const timeline = [];

        for (let i = 1; i <= months; i++) {
            balance = (balance + monthly) * (1 + rateMonthly);
            if (i % 12 === 0) {
                timeline.push({ year: i / 12, balance: Math.round(balance) });
            }
        }

        return { finalBalance: Math.round(balance), timeline };
    }
}
