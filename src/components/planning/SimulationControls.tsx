'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Wallet, TrendingDown, Target, Zap } from 'lucide-react';
import { useState } from 'react';

export function SimulationControls() {
    const [savingsRate, setSavingsRate] = useState(15);
    const [expenseReduction, setExpenseReduction] = useState(0);

    return (
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-xl h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Simular Cenários
                </CardTitle>
                <p className="text-xs text-slate-400">Ajuste as variáveis para ver o impacto no seu futuro</p>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* Poupança Mensal */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-slate-300 flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-emerald-400" />
                            Poupança Mensal (% da Renda)
                        </Label>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                            {savingsRate}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="50"
                        value={savingsRate}
                        onChange={(e) => setSavingsRate(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-xs text-slate-500">
                        Guardar {savingsRate}% da renda mensalmente aceleraria sua meta em 3 meses.
                    </p>
                </div>

                {/* Redução de Gastos */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-slate-300 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-rose-400" />
                            Redução de Gastos Supérfluos
                        </Label>
                        <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                            -{expenseReduction}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="30"
                        value={expenseReduction}
                        onChange={(e) => setExpenseReduction(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <p className="text-xs text-slate-500">
                        Cortar {expenseReduction || '0'}% de gastos não essenciais aumentaria seu patrimônio em R$ 2.400/ano.
                    </p>
                </div>

                {/* Meta */}
                <div className="pt-4 border-t border-slate-700/50">
                    <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <Target className="h-8 w-8 text-cyan-400 shrink-0" />
                        <div>
                            <h4 className="font-bold text-white text-sm">Objetivo: Viagem Europa</h4>
                            <p className="text-xs text-slate-400 mt-1">Com os ajustes atuais, você atingirá esta meta em <span className="text-emerald-400 font-bold">Novembro de 2026</span>.</p>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
