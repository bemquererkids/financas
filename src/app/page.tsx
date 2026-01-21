import { getFinancialSummary, getRecentTransactions, getExpensesByCategory, getMonthlyTrend } from "@/app/actions/financial-actions";
import { getCashFlow } from "@/app/actions/cashflow-actions";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import { FloatingTransactionButton } from "@/components/transactions/FloatingTransactionButton";
import { CashFlowView } from "@/components/dashboard/CashFlowView";
import { TransactionList } from "@/components/transactions/TransactionList";
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

    const now = new Date();
    const cashFlowData = await getCashFlow(now.getFullYear(), now.getMonth());

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const expensesVsIncome = summary.income > 0 ? (summary.expenses / summary.income) * 100 : 0;

    return (
        <div className="flex-1 h-screen overflow-hidden flex flex-col p-4 md:p-6 gap-3">
            {/* Header */}
            <div className="flex-shrink-0">
                <ModuleHeader
                    title="Visão Geral"
                    subtitle="Acompanhe sua saúde financeira"
                >
                    <FinancialAlerts
                        balance={summary.balance}
                        savingsRate={summary.savingsRate ?? 0}
                        expensesVsIncome={expensesVsIncome}
                    />
                </ModuleHeader>
            </div>

            {/* Summary Cards Row */}
            <div className="flex-shrink-0 grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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

                {/* Card 5: Análise 50/30/20 (Integrado) */}
                <div className="glass-card border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:bg-white/5 transition-colors duration-300">
                    <h3 className="text-xs font-medium text-slate-200 uppercase tracking-wider mb-2">Regra 50/30/20</h3>
                    <div className="space-y-2 flex-1 flex flex-col justify-center">
                        <div className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400">Nec. (50%)</span>
                                <span className="text-white font-mono">
                                    {summary.income > 0 ? ((summary.rule503020.needs.actual / summary.income) * 100).toFixed(0) : 0}%
                                </span>
                            </div>
                            <Progress value={summary.income > 0 ? (summary.rule503020.needs.actual / summary.income) * 100 : 0} className="bg-slate-800 h-1" indicatorClassName="bg-blue-500" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400">Des. (30%)</span>
                                <span className="text-white font-mono">
                                    {summary.income > 0 ? ((summary.rule503020.wants.actual / summary.income) * 100).toFixed(0) : 0}%
                                </span>
                            </div>
                            <Progress value={summary.income > 0 ? (summary.rule503020.wants.actual / summary.income) * 100 : 0} className="bg-slate-800 h-1" indicatorClassName="bg-purple-500" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400">Inv. (20%)</span>
                                <span className="text-white font-mono">
                                    {summary.income > 0 ? ((summary.rule503020.savings.actual / summary.income) * 100).toFixed(0) : 0}%
                                </span>
                            </div>
                            <Progress value={summary.income > 0 ? (summary.rule503020.savings.actual / summary.income) * 100 : 0} className="bg-slate-800 h-1" indicatorClassName="bg-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Flex Column */}
            <div className="flex-1 min-h-0 flex flex-col gap-3">
                {/* 1. Topo: Lista de Transações (Flexível - ganha o espaço que sobrar) */}
                <div className="flex-1 min-h-0 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden">
                    <TransactionList transactions={recentTransactions} />
                </div>

                {/* 2. Base: Gráficos + Fluxo de Caixa (Altura Fixa Otimizada) */}
                <div className="h-[340px] grid lg:grid-cols-3 gap-3 flex-shrink-0">
                    {/* Gráficos (2/3) */}
                    <div className="lg:col-span-2 grid md:grid-cols-2 gap-3 h-full">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 flex flex-col h-full">
                            <h4 className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide flex-shrink-0">Despesas por Categoria</h4>
                            <div className="flex-1 min-h-0">
                                <ExpensesPieChart data={expensesByCategory} />
                            </div>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 flex flex-col h-full">
                            <h4 className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide flex-shrink-0">Receita vs Despesa</h4>
                            <div className="flex-1 min-h-0">
                                <IncomeExpenseChart data={monthlyTrend} />
                            </div>
                        </div>
                    </div>

                    {/* Fluxo de Caixa (1/3) */}
                    <div className="lg:col-span-1 h-full">
                        <CashFlowView initialData={cashFlowData} />
                    </div>
                </div>
            </div>

            <FloatingTransactionButton />
        </div>
    );
}
