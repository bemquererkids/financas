import { getFinancialSummary, getRecentTransactions, getExpensesByCategory, getMonthlyTrend } from "@/app/actions/financial-actions";
import { getCashFlow } from "@/app/actions/cashflow-actions";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import { FloatingTransactionButton } from "@/components/transactions/FloatingTransactionButton";
import { CashFlowView } from "@/components/dashboard/CashFlowView";
import { TransactionList } from "@/components/transactions/TransactionList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ExpensesPieChart } from "@/components/dashboard/ExpensesPieChart";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { FinancialAlerts } from "@/components/dashboard/FinancialAlerts";
import { UserGreeting } from "@/components/profile/UserGreeting";
import { NotificationBell } from "@/components/dashboard/NotificationBell";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const summary = await getFinancialSummary();
    const recentTransactions = await getRecentTransactions();
    const expensesByCategory = await getExpensesByCategory();
    const monthlyTrend = await getMonthlyTrend();

    // Cash Flow - current month
    const now = new Date();
    const cashFlowData = await getCashFlow(now.getFullYear(), now.getMonth());

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const expensesVsIncome = summary.income > 0 ? (summary.expenses / summary.income) * 100 : 0;

    return (
        <div className="flex-1 p-4 md:p-6 space-y-4">
            {/* Header com Avatar, Título e Alertas */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <UserGreeting />
                    </div>
                    <div className="hidden lg:block border-l border-white/10 pl-4 mr-2">
                        <h2 className="text-xl font-bold text-white">Visão Geral</h2>
                        <p className="text-xs text-slate-400">Acompanhe sua saúde financeira</p>
                    </div>
                    <NotificationBell />
                </div>
                <FinancialAlerts
                    balance={summary.balance}
                    savingsRate={summary.savingsRate}
                    expensesVsIncome={expensesVsIncome}
                />
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Summary Cards - Grid 4 colunas */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Receita Total"
                    amount={formatCurrency(summary.income)}
                    icon={TrendingUp}
                    subtext="+12% vs mês anterior"
                    variant="success"
                />
                <SummaryCard
                    title="Despesas"
                    amount={formatCurrency(summary.expenses)}
                    icon={TrendingDown}
                    subtext="-2% vs mês anterior"
                    variant="danger"
                />
                <SummaryCard
                    title="Saldo Atual"
                    amount={formatCurrency(summary.balance)}
                    icon={Wallet}
                    subtext="Disponível"
                    variant={summary.balance >= 0 ? "success" : "danger"}
                />
                <SummaryCard
                    title="Economia"
                    amount={`${summary.savingsRate.toFixed(1)}%`}
                    icon={PiggyBank}
                    subtext="Meta: 20%"
                    variant={summary.savingsRate >= 20 ? "success" : "warning"}
                />
            </div>

            {/* Regra 50/30/20 */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-3 rounded-xl glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Análise 50/30/20</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Necessidades (50%)</span>
                                <span className="text-white font-medium">
                                    {formatCurrency(summary.rule503020.needs.actual)} ({summary.income > 0 ? ((summary.rule503020.needs.actual / summary.income) * 100).toFixed(0) : 0}%)
                                </span>
                            </div>
                            <Progress value={summary.income > 0 ? (summary.rule503020.needs.actual / summary.income) * 100 : 0} className="bg-slate-800" indicatorClassName="bg-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Desejos (30%)</span>
                                <span className="text-white font-medium">
                                    {formatCurrency(summary.rule503020.wants.actual)} ({summary.income > 0 ? ((summary.rule503020.wants.actual / summary.income) * 100).toFixed(0) : 0}%)
                                </span>
                            </div>
                            <Progress value={summary.income > 0 ? (summary.rule503020.wants.actual / summary.income) * 100 : 0} className="bg-slate-800" indicatorClassName="bg-purple-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Investimentos/Dívidas (20%)</span>
                                <span className="text-white font-medium">
                                    {formatCurrency(summary.rule503020.savings.actual)} ({summary.income > 0 ? ((summary.rule503020.savings.actual / summary.income) * 100).toFixed(0) : 0}%)
                                </span>
                            </div>
                            <Progress value={summary.income > 0 ? (summary.rule503020.savings.actual / summary.income) * 100 : 0} className="bg-slate-800" indicatorClassName="bg-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Transaction History (Maior destaque - 60% width) */}
                <div className="lg:col-span-3">
                    <TransactionList transactions={recentTransactions} />
                </div>

                {/* Cash Flow e Gráficos (Lateral - 40% width) */}
                <div className="lg:col-span-2 space-y-6">
                    <CashFlowView initialData={cashFlowData} />
                    <ExpensesPieChart data={expensesByCategory} />
                    <IncomeExpenseChart data={monthlyTrend} />
                </div>
            </div>

            <FloatingTransactionButton />
        </div>
    );
}
