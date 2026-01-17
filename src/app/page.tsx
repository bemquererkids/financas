import { getFinancialSummary, getRecentTransactions } from "@/app/actions/financial-actions";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Progress } from "@/components/ui/progress";
import {
    DollarSign,
    TrendingDown,
    TrendingUp,
    Wallet,
    PiggyBank
} from "lucide-react";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { MonthlyOverview } from "@/components/dashboard/MonthlyOverview";
import { TransactionList } from "@/components/transactions/TransactionList";

import { QuickActions } from "@/components/dashboard/QuickActions";

export const dynamic = 'force-dynamic'; // Garante que os dados sejam sempre frescos

export default async function DashboardPage() {
    const summary = await getFinancialSummary();
    const recentTransactions = await getRecentTransactions();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-1">Visão Geral</h2>
                        <p className="text-slate-400">Acompanhe sua saúde financeira em tempo real.</p>
                    </div>
                </div>

                {/* Ações Rápidas (Topo) */}
                <QuickActions />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    title="Saldo Atual"
                    amount={formatCurrency(summary.balance)}
                    icon={Wallet}
                    variant={summary.balance >= 0 ? "success" : "danger"}
                    subtext="Balanço mensal"
                />
                <SummaryCard
                    title="Taxa de Poupança"
                    amount={`${summary.savingsRate}%`}
                    icon={PiggyBank}
                    variant="warning"
                    subtext="Meta: 20%"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-3xl glass-card p-8">
                    <div className="flex flex-col space-y-1.5 p-0 mb-6">
                        <h3 className="text-xl font-semibold leading-none tracking-tight text-white">Regra 50/30/20</h3>
                        <p className="text-sm text-slate-400">Distribuição recomendada do orçamento.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-200">Necessidades (50%)</span>
                                <span className="text-emerald-400 font-mono">{formatCurrency(summary.rule503020.needs.actual)}</span>
                            </div>
                            <Progress value={50} className="h-2 bg-white/10" indicatorClassName="bg-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-200">Desejos/Lazer (30%)</span>
                                <span className="text-purple-400 font-mono">{formatCurrency(summary.rule503020.wants.actual)}</span>
                            </div>
                            <Progress value={30} className="h-2 bg-white/10" indicatorClassName="bg-purple-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-200">Investimentos/Poupança (20%)</span>
                                <span className="text-blue-400 font-mono">{formatCurrency(summary.rule503020.savings.actual)}</span>
                            </div>
                            <Progress value={20} className="h-2 bg-white/10" indicatorClassName="bg-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="col-span-3 rounded-3xl glass-card p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col space-y-1.5 p-0 mb-6">
                            <h3 className="text-xl font-semibold leading-none tracking-tight text-white">Ações Rápidas</h3>
                            <p className="text-sm text-slate-400">Lance novos gastos ou receitas.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <TransactionForm />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="p-2 bg-white/5 rounded-full">
                                <Wallet className="h-4 w-4 text-slate-300" />
                            </div>
                            <p>Mantenha seus registros atualizados para uma análise precisa.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-1 xl:grid-cols-2">
                <div className="xl:col-span-2">
                    <TransactionList transactions={recentTransactions} />
                </div>
            </div>

            <div className="mt-8">
                <MonthlyOverview />
            </div>
        </div>
    );
}
