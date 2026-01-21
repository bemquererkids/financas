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
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";

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
            <ModuleHeader
                title="Visão Geral"
                subtitle="Acompanhe sua saúde financeira"
            >
                <FinancialAlerts
                    balance={summary.balance}
                    savingsRate={summary.savingsRate}
                    expensesVsIncome={expensesVsIncome}
                />
            </ModuleHeader>

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
                    amount={`${typeof summary.savingsRate === 'number' ? summary.savingsRate.toFixed(1) : '0.0'}%`}
                    icon={PiggyBank}
                    subtext="Meta: 20%"
                    variant={(summary.savingsRate ?? 0) >= 20 ? "success" : "warning"}
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
            <div className="grid lg:grid-cols-3 gap-4">
                {/* Left Column - Transações e Análise */}
                <div className="lg:col-span-2 space-y-4">
                    <TransactionList transactions={recentTransactions} />
                </div>

                {/* Right Column - Cash Flow */}
                <div className="lg:col-span-1">
                    <CashFlowView initialData={cashFlowData} />
                </div>
            </div>

            {/* Gráficos - Linha completa abaixo */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Análise Visual</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-4">Despesas por Categoria</h4>
                        <ExpensesPieChart data={expensesByCategory} />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-4">Receita vs Despesa (Últimos 6 Meses)</h4>
                        <IncomeExpenseChart data={monthlyTrend} />
                    </div>
                </div>
            </div>

            <FloatingTransactionButton />
        </div>
    );
}
