'use client';

import { ModuleHeader } from '@/components/dashboard/ModuleHeader';
import { FutureProjectionChart } from '@/components/planning/FutureProjectionChart';
import { SimulationControls } from '@/components/planning/SimulationControls';
import { useState } from 'react';
import { ChatWidget } from '@/components/ai/ChatWidget';

export default function PlanningPage() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <ModuleHeader
                title="Planejamento Futuro"
                subtitle="Projete seus meses e simule cenários para alcançar sua liberdade financeira."
                onChatToggle={() => setIsChatOpen(!isChatOpen)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Projeção (Ocupa 2 colunas no desktop) */}
                <div className="lg:col-span-2 space-y-6">
                    <FutureProjectionChart />

                    {/* Insights Rápidos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl">
                            <p className="text-slate-400 text-xs mb-1">Patrimônio em 12 meses</p>
                            <p className="text-2xl font-bold text-white">R$ 20.000</p>
                            <span className="text-xs text-emerald-500 font-medium">+ R$ 15.000 vs hoje</span>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl">
                            <p className="text-slate-400 text-xs mb-1">Ponto de Equilíbrio</p>
                            <p className="text-2xl font-bold text-white">4 Meses</p>
                            <span className="text-xs text-slate-500">Reserva de emergência completa</span>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl">
                            <p className="text-slate-400 text-xs mb-1">Capacidade de Aporte</p>
                            <p className="text-2xl font-bold text-emerald-400">R$ 1.250</p>
                            <span className="text-xs text-slate-500">Média mensal projetada</span>
                        </div>
                    </div>
                </div>

                {/* Controles de Simulação (Ocupa 1 coluna) */}
                <div className="lg:col-span-1">
                    <SimulationControls />
                </div>
            </div>

            <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
}
