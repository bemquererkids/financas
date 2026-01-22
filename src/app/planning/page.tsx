'use client';

import { ModuleHeader } from '@/components/dashboard/ModuleHeader';
import { FutureProjectionChart } from '@/components/planning/FutureProjectionChart';
import { SimulationControls } from '@/components/planning/SimulationControls';
import { PlanningTable } from '@/components/planning/PlanningTable';
import { useState, useEffect } from 'react';
import { ChatWidget } from '@/components/ai/ChatWidget';
import { getFinancialProjection } from '@/app/actions/planning-actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectionPoint {
    month: string;
    year?: number;
    saldo: number;
    receita?: number;
    despesa?: number;
}

export default function PlanningPage() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [projectionData, setProjectionData] = useState<ProjectionPoint[]>([]);
    const [insights, setInsights] = useState({
        patrimonioFinal: 0,
        crescimento: 0,
        aporteMensal: 0,
        pontoEquilibrio: 'N/A'
    });

    const [lowIncomeWarning, setLowIncomeWarning] = useState<number | null>(null);

    useEffect(() => {
        async function fetchProjection() {
            try {
                const data = await getFinancialProjection();

                if (data && 'projection' in data && Array.isArray(data.projection)) {
                    setProjectionData(data.projection as ProjectionPoint[]);

                    // Verificar se a renda parece incorreta (ex: muito baixa, dados de teste)
                    const income = data.monthlyIncome || 0;
                    if (income > 0 && income < 100) {
                        setLowIncomeWarning(income);
                    }

                    // Calcular insights básicos
                    const start = data.projection[0]?.saldo || 0;
                    const end = data.projection[11]?.saldo || 0;
                    const diff = end - start;
                    const aporte = (data.monthlyIncome || 0) - (data.averageMonthlyExpense || 0);

                    setInsights({
                        patrimonioFinal: end,
                        crescimento: diff,
                        aporteMensal: aporte,
                        pontoEquilibrio: aporte > 0 ? 'Positivo' : 'Atenção'
                    });
                } else {
                    toast.error('Não foi possível carregar a projeção.');
                }
            } catch (error) {
                console.error(error);
                toast.error('Erro ao conectar com o serviço de planejamento.');
            } finally {
                setLoading(false);
            }
        }

        fetchProjection();
    }, []);

    const handleChatToggle = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <div className="flex-1 h-full flex flex-col p-4 md:p-6 gap-6 overflow-y-auto w-full pb-20">
            <ModuleHeader
                title="Para Onde Vai"
                subtitle="Projeção para os próximos 12 meses e simulação de cenários."
                onChatToggle={handleChatToggle}
            />

            {/* Alerta de Renda Baixa (Dados suspeitos) */}
            {!loading && lowIncomeWarning && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 items-start mb-2 animate-in slide-in-from-top-2">
                    <div className="bg-amber-500/20 p-2 rounded-lg text-amber-500">
                        <Loader2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Valores parecem incorretos?</h4>
                        <p className="text-slate-400 text-xs mt-1">
                            Sua renda mensal base está cadastrada como <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lowIncomeWarning)}</strong>.
                            <br />Isso gera projeções muito baixas. Se isso for um erro, atualize sua Renda Mensal no Perfil.
                        </p>
                    </div>
                </div>
            )}

            {!loading && projectionData.length > 0 && projectionData[0].saldo === 0 && projectionData[11].saldo === 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 items-start mb-4">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        <Loader2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Dados Insuficientes para Projeção</h4>
                        <p className="text-slate-400 text-xs mt-1">
                            Ainda não temos transações suficientes para projetar seu futuro.
                            Experimente registrar sua renda mensal e alguns gastos na tela principal.
                            <br />Enquanto isso, estamos assumindo uma projeção baseada apenas na renda informada no perfil.
                        </p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-500">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-emerald-500" />
                    <p>Calculando projeção financeira...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gráfico de Projeção (Ocupa 2 colunas no desktop) */}
                    <div className="lg:col-span-2 space-y-6">
                        <FutureProjectionChart data={projectionData} />

                        {/* Insights Rápidos com Explicações Claras */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs mb-1 font-medium flex items-center gap-1">
                                        Patrimônio Projetado
                                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">1 ano</span>
                                    </p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.patrimonioFinal)}
                                    </p>
                                </div>
                                <span className={`text-xs font-medium mt-3 ${insights.crescimento >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {insights.crescimento >= 0 ? '▲ Crescimento de ' : '▼ Queda de '}
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(insights.crescimento))}
                                    <span className="text-slate-500 font-normal"> acumulado</span>
                                </span>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs mb-1 font-medium">Saúde do Fluxo de Caixa</p>
                                    <p className={`text-2xl font-bold mt-1 ${insights.pontoEquilibrio === 'Positivo' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {insights.pontoEquilibrio}
                                    </p>
                                </div>
                                <span className="text-xs text-slate-500 mt-3">
                                    {insights.pontoEquilibrio === 'Positivo'
                                        ? 'Sua renda supera seus gastos médios.'
                                        : 'Atenção: Gastos próximos ou acima da renda.'}
                                </span>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs mb-1 font-medium">Potencial de Poupança Mensal</p>
                                    <p className={`text-2xl font-bold mt-1 ${insights.aporteMensal > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.aporteMensal)}
                                    </p>
                                </div>
                                <span className="text-xs text-slate-500 mt-3">
                                    Valor livre estimado p/ investir todo mês.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Controles de Simulação (Ocupa 1 coluna) */}
                    <div className="lg:col-span-1">
                        <SimulationControls />
                    </div>
                </div>
            )}

            {/* Tabela de Detalhamento Mensal */}
            {!loading && projectionData.length > 0 && (
                <PlanningTable data={projectionData} />
            )}

            <ChatWidget isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
        </div>
    );
}
