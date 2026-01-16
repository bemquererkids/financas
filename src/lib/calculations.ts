export const FinancialCalculations = {
    /**
     * Calcula o saldo total e status financeiro
     */
    calculateBalance: (income: number, expenses: number) => {
        const balance = income - expenses;
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

        return {
            balance,
            savingsRate: savingsRate.toFixed(2),
            isPositive: balance >= 0
        };
    },

    /**
     * Aplica a regra 50/30/20 (Necessidades, Desejos, Investimentos)
     * Baseado nas planilhas de planejamento
     */
    rule503020: (income: number) => {
        return {
            needs: income * 0.50,      // Custos Fixos/Essenciais
            wants: income * 0.30,      // Variáveis/Lazer
            investments: income * 0.20 // Aportes/Dívidas
        };
    },

    /**
     * Projeção de Investimentos (Juros Compostos)
     * Usado na aba "Investimentos"
     * @param initialValue Valor Inicial
     * @param monthlyContribution Aporte Mensal
     * @param annualRate Taxa de Juros Anual (%)
     * @param years Anos para projeção
     */
    projectInvestment: (
        initialValue: number,
        monthlyContribution: number,
        annualRate: number,
        years: number
    ) => {
        const monthlyRate = annualRate / 12 / 100;
        const months = years * 12;
        let currentBalance = initialValue;
        const progression = [];

        for (let i = 1; i <= months; i++) {
            currentBalance = currentBalance * (1 + monthlyRate) + monthlyContribution;

            // Salva pontos de dados anuais para gráfico
            if (i % 12 === 0) {
                progression.push({
                    year: i / 12,
                    amount: Math.round(currentBalance * 100) / 100,
                    invested: initialValue + (monthlyContribution * i)
                });
            }
        }

        return {
            finalAmount: Math.round(currentBalance * 100) / 100,
            totalInvested: initialValue + (monthlyContribution * months),
            totalInterest: Math.round((currentBalance - (initialValue + (monthlyContribution * months))) * 100) / 100,
            progression
        };
    },

    /**
     * Estimatíva de Quitação de Dívida
     */
    calculateDebtPayoff: (totalDebt: number, monthlyPayment: number, monthlyInterestRate: number) => {
        if (monthlyPayment <= totalDebt * (monthlyInterestRate / 100)) return Infinity; // Dívida impagável com esse valor

        let balance = totalDebt;
        let months = 0;
        let totalPaid = 0;

        while (balance > 0) {
            const interest = balance * (monthlyInterestRate / 100);
            let principal = monthlyPayment - interest;

            if (balance < principal) {
                principal = balance;
                totalPaid += (balance + interest);
                balance = 0;
            } else {
                balance -= principal;
                totalPaid += monthlyPayment;
            }
            months++;
            if (months > 1200) break; // Trava de segurança
        }

        return {
            months,
            totalPaid: Math.round(totalPaid * 100) / 100,
            totalInterest: Math.round((totalPaid - totalDebt) * 100) / 100
        };
    }
};
