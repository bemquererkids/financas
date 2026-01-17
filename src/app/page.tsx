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
            {/* Header com Quick Actions e Alertas */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Visão Geral</h2>
                    <p className="text-sm text-slate-400">Acompanhe sua saúde financeira em tempo real.</p>
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
                    variant="success"
                    subtext="Entradas este mês"
                />
                <SummaryCard
                    title="Despesas"
                    amount={formatCurrency(summary.expenses)}
                    icon={TrendingDown}
                    variant="danger"
                    subtext="Saídas este mês"
                />
                <SummaryCard
                    title="Saldo"
                    amount={formatCurrency(summary.balance)}
                    icon={Wallet}
                    variant={summary.balance >= 0 ? "success" : "danger"}
                    subtext="Balanço mensal"
                />
                <SummaryCard
                    title="Poupança"
                    amount={`${summary.savingsRate}%`}
                    icon={PiggyBank}
                    variant={summary.savingsRate >= 20 ? "success" : "warning"}
                    subtext="Meta: 20%"
                />
            </div>

            {/* Gráficos e Regra 50/30/20 */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Gráfico de Barras */}
                <div className="rounded-2xl glass-card p-4">
                    <h3 className="text-sm font-medium text-white mb-1">Receitas vs Despesas</h3>
                    <p className="text-xs text-slate-400 mb-3">Últimos 6 meses</p>
                    <div className="h-[200px]">
                        <IncomeExpenseChart data={monthlyTrend} />
                    </div>
                </div>

                {/* Gráfico de Pizza */}
                <div className="rounded-2xl glass-card p-4">
                    <h3 className="text-sm font-medium text-white mb-1">Gastos por Categoria</h3>
                    <p className="text-xs text-slate-400 mb-3">Distribuição deste mês</p>
                    <div className="h-[200px]">
                        <ExpensesPieChart data={expensesByCategory} />
                    </div>
                </div>

                {/* Regra 50/30/20 - Compacto */}
                <div className="rounded-2xl glass-card p-4">
                    <h3 className="text-sm font-medium text-white mb-1">Regra 50/30/20</h3>
                    <p className="text-xs text-slate-400 mb-3">Distribuição do orçamento</p>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300">Necessidades (50%)</span>
                                <span className="text-emerald-400 font-mono">{formatCurrency(summary.rule503020.needs.actual)}</span>
                            </div>
                            <Progress value={50} className="h-1.5 bg-white/10" indicatorClassName="bg-emerald-500" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300">Desejos/Lazer (30%)</span>
                                <span className="text-purple-400 font-mono">{formatCurrency(summary.rule503020.wants.actual)}</span>
                            </div>
                            <Progress value={30} className="h-1.5 bg-white/10" indicatorClassName="bg-purple-500" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300">Poupança (20%)</span>
                                <span className="text-blue-400 font-mono">{formatCurrency(summary.rule503020.savings.actual)}</span>
                            </div>
                            <Progress value={20} className="h-1.5 bg-white/10" indicatorClassName="bg-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Histórico e Fluxo de Caixa */}
            <div className="grid gap-4 lg:grid-cols-2">
                <TransactionList transactions={recentTransactions} />
                <CashFlowView initialData={cashFlowData} />
            </div>

            {/* FAB - Nova Transação */}
            <FloatingTransactionButton />
        </div>
    );
}
