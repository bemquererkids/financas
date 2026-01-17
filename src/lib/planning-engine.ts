import { prisma } from './prisma';
import { Transaction } from '@prisma/client';

export type MonthData = {
    month: string; // YYYY-MM
    income: {
        total: number;
        items: Transaction[];
    };
    payrollDeductions: {
        total: number;
        items: Transaction[];
    };
    netIncome: number;
    fixedExpenses: {
        total: number;
        items: Transaction[];
    };
    variableExpenses: {
        total: number;
        items: Transaction[];
    };
    leisureExpenses: {
        total: number;
        items: Transaction[];
    };
    creditCard: {
        total: number;
        items: Transaction[];
    };
    totalExpenses: number;
    balance: number;
};

export class PlanningEngine {

    /**
     * Get planning grid for the next N months
     */
    public static async getPlanningGrid(startMonth: Date, monthsCount: number = 12): Promise<MonthData[]> {
        const grid: MonthData[] = [];

        for (let i = 0; i < monthsCount; i++) {
            const currentMonthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
            const nextMonthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i + 1, 1);

            const monthKey = currentMonthDate.toISOString().slice(0, 7); // YYYY-MM

            // Fetch transactions for this specific month range
            const transactions = await prisma.transaction.findMany({
                where: {
                    date: {
                        gte: currentMonthDate,
                        lt: nextMonthDate,
                    }
                }
            });

            // Group by Categories
            const incomeItems = transactions.filter(t => t.type === 'INCOME');
            const expenseItems = transactions.filter(t => t.type === 'EXPENSE');

            // Specific Categories Logic
            const payrollItems = expenseItems.filter(t => t.category === 'PAYROLL_DEDUCTION');
            const creditCardItems = expenseItems.filter(t => t.category === 'CREDIT_CARD_BILL');

            // Fixed Expenses (Generic list for now, can be specific later)
            // Assumindo que essas são Fixas ou Essenciais Recorrentes
            const fixedCats = [
                'Moradia', 'Condominio', 'Aluguel',
                'Telefone Fixo', 'Internet', 'Celular',
                'Luz', 'Agua', 'Gas',
                'Convenio', 'Plano de Saude',
                'IPTU', 'Educacao', 'Escola',
                'Dizimo', 'Seguro Carro', 'Parcela Carro', 'Terapia',
                'Diarista', 'Academia', 'Personal'
            ];

            // Lazer e Estilo de Vida
            const leisureCats = [
                'Lazer', 'Estetica', 'Cabelo', 'Unha', 'Depilacao',
                'Viagem', 'Restaurante', 'Streaming', 'Netflix', 'Spotify',
                'Comida Pet', 'Banho Pet'
            ];

            // Variáveis Essenciais (Mercado, Transporte)
            // O que não for Fixed nem Leisure nem Payroll nem CC, cai aqui (Ex: Mercado, Gasolina)

            const otherExpenses = expenseItems.filter(t =>
                t.category !== 'PAYROLL_DEDUCTION' &&
                t.category !== 'CREDIT_CARD_BILL'
            );

            const fixedItems = otherExpenses.filter(t => fixedCats.includes(t.category));
            const leisureItems = otherExpenses.filter(t => leisureCats.includes(t.category));
            const variableItems = otherExpenses.filter(t => !fixedCats.includes(t.category) && !leisureCats.includes(t.category));

            // Sum Totals
            const sum = (items: Transaction[]) => items.reduce((acc, t) => acc + Number(t.amount), 0);

            const totalIncome = sum(incomeItems);
            const totalPayroll = sum(payrollItems);
            const netIncome = totalIncome - totalPayroll;

            const totalFixed = sum(fixedItems);
            const totalVariable = sum(variableItems);
            const totalLeisure = sum(leisureItems);
            const totalCC = sum(creditCardItems);

            const totalExpenses = totalFixed + totalVariable + totalLeisure + totalCC; // Payroll is deduction, not expense in this view (or it is expense but deducted from Gross)

            // Standard approach: Balance = Net Income - All Other Expenses
            const balance = netIncome - totalExpenses;

            grid.push({
                month: monthKey,
                income: { total: totalIncome, items: incomeItems },
                payrollDeductions: { total: totalPayroll, items: payrollItems },
                netIncome,
                fixedExpenses: { total: totalFixed, items: fixedItems },
                variableExpenses: { total: totalVariable, items: variableItems },
                leisureExpenses: { total: totalLeisure, items: leisureItems },
                creditCard: { total: totalCC, items: creditCardItems },
                totalExpenses,
                balance
            });
        }

        return grid;
    }
}
