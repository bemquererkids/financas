'use client';

import { useState, useEffect } from 'react';
import { InvestmentChart } from '@/components/investments/InvestmentChart';
import { calculateProjectionData, createProjection, getProjections } from '@/app/actions/investment-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Save, Clock, DollarSign, Percent } from 'lucide-react';
import { ModuleHeader } from '@/components/dashboard/ModuleHeader';

export default function InvestmentsPage() {
    const [inputs, setInputs] = useState({
        initialBalance: 0,
        monthlyContribution: 1000,
        annualReturnRate: 10, // 10% a.a.
        years: 10
    });

    const [chartData, setChartData] = useState<any[]>([]);
    const [finalAmount, setFinalAmount] = useState(0);
    const [savedProjections, setSavedProjections] = useState<any[]>([]);

    useEffect(() => {
        const loadProjections = async () => {
            const data = await getProjections();
            setSavedProjections(data);
        };
        loadProjections();
    }, []);

    // Recalculate whenever inputs change
    useEffect(() => {
        const runProjection = async () => {
            const result = await calculateProjectionData({
                initial: inputs.initialBalance,
                monthly: inputs.monthlyContribution,
                rate: inputs.annualReturnRate,
                years: inputs.years
            });
            setChartData(result.timeline);
            setFinalAmount(result.finalBalance);
        };
        runProjection();
    }, [inputs]);

    const handleLoadProjection = (proj: any) => {
        setInputs({
            initialBalance: proj.initialBalance,
            monthlyContribution: proj.monthlyContribution,
            annualReturnRate: proj.annualReturnRate,
            years: proj.years
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({
            ...inputs,
            [e.target.name]: parseFloat(e.target.value) || 0
        });
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('name', `Cenário ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString().slice(0, 5)}`);
        formData.append('initialBalance', inputs.initialBalance.toString());
        formData.append('monthlyContribution', inputs.monthlyContribution.toString());
        formData.append('annualReturnRate', inputs.annualReturnRate.toString());
        formData.append('years', inputs.years.toString());

        await createProjection(formData);

        // Atualiza lista
        const data = await getProjections();
        setSavedProjections(data);

        alert('Cenário salvo com sucesso!');
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-6 lg:h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <ModuleHeader
                title="Meu Futuro"
                subtitle="Projeção de crescimento patrimonial"
            />

            <div className="grid gap-4 md:grid-cols-12 flex-1 min-h-0">
                {/* Lateral Esquerda - Controles Compactados e Cenários */}
                <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col gap-4 h-full">
                    {/* Card Unificado: Parâmetros + Resultado */}
                    <Card className="glass-card border-white/10 bg-white/5 shrink-0">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-white flex items-center gap-2 text-sm uppercase tracking-wider text-emerald-400">
                                <TrendingUp className="h-4 w-4" /> Simulador
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-4 pb-4">
                            {/* Inputs em Grid 2x2 para economizar altura */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> Inicial
                                    </label>
                                    <Input
                                        type="number"
                                        name="initialBalance"
                                        value={inputs.initialBalance}
                                        onChange={handleChange}
                                        className="h-8 text-xs glass-input text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> Mensal
                                    </label>
                                    <Input
                                        type="number"
                                        name="monthlyContribution"
                                        value={inputs.monthlyContribution}
                                        onChange={handleChange}
                                        className="h-8 text-xs glass-input text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                        <Percent className="h-3 w-3" /> Taxa a.a.
                                    </label>
                                    <Input
                                        type="number"
                                        name="annualReturnRate"
                                        value={inputs.annualReturnRate}
                                        onChange={handleChange}
                                        className="h-8 text-xs glass-input text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Anos
                                    </label>
                                    <Input
                                        type="number"
                                        name="years"
                                        value={inputs.years}
                                        onChange={handleChange}
                                        className="h-8 text-xs glass-input text-white"
                                    />
                                </div>
                            </div>

                            {/* Resultado Integrado */}
                            <div className="mt-4 pt-3 border-t border-white/10 text-center bg-white/5 rounded-lg py-2 space-y-2">
                                <div>
                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Patrimônio Total</p>
                                    <div className="text-xl font-bold text-emerald-400">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(finalAmount)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Renda Mensal (Passiva)</p>
                                    <div className="text-lg font-bold text-emerald-300">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(finalAmount * (Math.pow(1 + inputs.annualReturnRate / 100, 1 / 12) - 1))}
                                    </div>
                                    <p className="text-[9px] text-slate-600">Considerando rendimento perpétuo</p>
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button onClick={handleSave} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs mb-2">
                                    <Save className="h-3 w-3 mr-2" /> Salvar Cenário
                                </Button>
                                <p className="text-[9px] text-slate-600 text-center opacity-70">
                                    Projeção • não é garantia de retorno
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lista de Cenários - Expansível com Scroll Interno Estilizado */}
                    <Card className="glass-card border-white/10 bg-white/5 flex-1 min-h-0 flex flex-col overflow-hidden">
                        <CardHeader className="py-3 px-4 border-b border-white/5 shrink-0 bg-white/5">
                            <CardTitle className="text-slate-300 text-sm">Cenários Salvos</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-emerald-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {savedProjections.length === 0 && (
                                <p className="text-xs text-slate-500 p-4 text-center">Nenhum cenário salvo.</p>
                            )}
                            <div className="divide-y divide-white/5">
                                {savedProjections.map((proj) => (
                                    <div
                                        key={proj.id}
                                        onClick={() => handleLoadProjection(proj)}
                                        className="p-3 hover:bg-emerald-500/10 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-white group-hover:text-emerald-300 truncate max-w-[150px]">{proj.name}</span>
                                            <span className="text-[10px] text-slate-500">{new Date(proj.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            R$ {proj.initialBalance} + R$ {proj.monthlyContribution}/mês ({proj.years} anos)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Área Principal - Gráfico */}
                <div className="col-span-12 md:col-span-8 lg:col-span-9 h-full">
                    <div className="rounded-3xl glass-card p-6 h-full flex flex-col bg-[#0f172a]/50 border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Evolução Patrimonial</h3>
                            <div className="text-xs text-slate-400 bg-white/5 px-3 py-1 rounded-full">
                                Projeção Linear
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 w-full">
                            <InvestmentChart data={chartData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
