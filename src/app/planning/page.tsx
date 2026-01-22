'use client';

import { ModuleHeader } from '@/components/dashboard/ModuleHeader';
import { FutureProjectionChart } from '@/components/planning/FutureProjectionChart';
import { SimulationControls } from '@/components/planning/SimulationControls';
import { useState, useEffect } from 'react';
import { ChatWidget } from '@/components/ai/ChatWidget';
import { getFinancialProjection } from '@/app/actions/planning-actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectionPoint {
    month: string;
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

    useEffect(() => {
        async function fetchProjection() {
            try {
                const data = await getFinancialProjection();

                if (data && 'projection' in data && Array.isArray(data.projection)) {
                    setProjectionData(data.projection as ProjectionPoint[]);

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
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <ModuleHeader
                title="Planejamento Futuro"
                subtitle="Projete seus meses e simule cenários para alcançar sua liberdade financeira."
                onChatToggle={handleChatToggle}
            />

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

                        {/* Insights Rápidos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl">
                                <p className="text-slate-400 text-xs mb-1">Patrimônio em 12 meses</p>
                                <p className="text-2xl font-bold text-white">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.patrimonioFinal)}
                                </p>
                                <span className={`text-xs font-medium ${insights.crescimento >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {insights.crescimento >= 0 ? '+' : ''}
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.crescimento)} vs hoje
                                </span>
                            </div>
                            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl">
                                <p className="text-slate-400 text-xs mb-1">Fluxo de Caixa Mensal</p>
                                <p className={`text-2xl font-bold ${insights.pontoEquilibrio === 'Positivo' ? 'text-white' : 'text-red-400'}`}>
                                    {insights.pontoEquilibrio}
                                </p>
                                <span className="text-xs text-slate-500">Saúde financeira projetada</span>
                            </div>
                            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl">
                                <p className="text-slate-400 text-xs mb-1">Potencial de Aporte</p>
                                <p className={`text-2xl font-bold ${insights.aporteMensal > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.aporteMensal)}
                                </p>
                                <span className="text-xs text-slate-500">Média mensal (Renda - Despesa)</span>
                            </div>
                        </div>
                    </div>

                    {/* Controles de Simulação (Ocupa 1 coluna) */}
                    <div className="lg:col-span-1">
                        <SimulationControls />
                    </div>
                </div>
            )}

            <ChatWidget isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
        </div>
    );
}
