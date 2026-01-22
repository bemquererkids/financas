import { getFinancialSummary, getRecentTransactions, getExpensesByCategory, getMonthlyTrend } from "@/app/actions/financial-actions";
import { getCashFlow } from "@/app/actions/cashflow-actions";
import { WalletHero } from "@/components/dashboard/WalletHero";
import { FloatingTransactionButton } from "@/components/transactions/FloatingTransactionButton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UnifiedDashboardView } from "@/components/dashboard/UnifiedDashboardView";
import { MobileTutorialBanner } from "@/components/dashboard/MobileTutorialBanner";

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
    searchParams: {
        month?: string;
        year?: string;
    }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const today = new Date();
    const currentMonth = searchParams?.month ? parseInt(searchParams.month) : today.getMonth();
    const currentYear = searchParams?.year ? parseInt(searchParams.year) : today.getFullYear();

    const summary = await getFinancialSummary(currentMonth, currentYear);
    // Para ver as transações antigas, precisamos passar o filtro de data também para getRecentTransactions
    const recentTransactions = await getRecentTransactions(currentMonth, currentYear);
    const expensesByCategory = await getExpensesByCategory(currentMonth, currentYear);
    const monthlyTrend = await getMonthlyTrend(); // Trend ignora filtro, mostra últimos 6 meses

    // CashFlowView precisa saber onde estamos
    const cashFlowData = await getCashFlow(currentYear, currentMonth);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const expensesVsIncome = summary.income > 0 ? (summary.expenses / summary.income) * 100 : 0;

    return (
        <div className="flex-1 h-full md:h-screen flex flex-col p-4 md:p-6 gap-3 overflow-y-auto md:overflow-hidden">
            {/* Header - Desktop Only (Mobile usa o título do card) */}
            <div className="flex-shrink-0 hidden md:block">
                <DashboardHeader
                    title="Minha Carteira"
                    subtitle="Onde estou financeiramente agora?"
                />
            </div>

            <MobileTutorialBanner />

            {/* Wallet Hero - A Carteira Digital de Decisão */}
            <div className="flex-shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
                <WalletHero summary={summary} />
            </div>


            {/* Main Content - Visão Unificada */}
            <div className="flex-1 min-h-[550px] md:min-h-0 pb-2 overflow-hidden">
                <UnifiedDashboardView
                    transactions={recentTransactions}
                    expensesByCategory={expensesByCategory}
                    monthlyTrend={monthlyTrend}
                    cashFlowData={cashFlowData}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                />
            </div>

            <FloatingTransactionButton />
        </div>
    );
}
