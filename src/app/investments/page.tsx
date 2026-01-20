'use client';

import { useState, useEffect } from 'react';
import { InvestmentChart } from '@/components/investments/InvestmentChart';
import { calculateProjectionData, createProjection, getProjections } from '@/app/actions/investment-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Save } from 'lucide-react';
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
        formData.append('name', `Cenário ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ModuleHeader
                title="Investimentos"
                subtitle="Projeção de crescimento patrimonial e renda passiva"
            />

            <div className="grid gap-6 md:grid-cols-12">
                {/* Controles */}
                <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-6">
                    <Card className="glass-card border-white/10 bg-white/5">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-400" /> Parâmetros
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400">Saldo Inicial (R$)</label>
                                <Input
                                    type="number"
                                    name="initialBalance"
                                    value={inputs.initialBalance}
                                    onChange={handleChange}
                                    className="glass-input text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400">Aporte Mensal (R$)</label>
                                <Input
                                    type="number"
                                    name="monthlyContribution"
                                    value={inputs.monthlyContribution}
                                    onChange={handleChange}
                                    className="glass-input text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400">Rentabilidade Anual (%)</label>
                                <Input
                                    type="number"
                                    name="annualReturnRate"
                                    value={inputs.annualReturnRate}
                                    onChange={handleChange}
                                    className="glass-input text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400">Prazo (Anos)</label>
                                <Input
                                    type="number"
                                    name="years"
                                    value={inputs.years}
                                    onChange={handleChange}
                                    className="glass-input text-white"
                                />
                            </div>

                            <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
                                <Save className="h-4 w-4 mr-2" /> Salvar Cenário
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10 bg-emerald-950/30">
                        <CardHeader>
                            <CardTitle className="text-emerald-400 text-lg">Resultado em {inputs.years} anos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white mb-2">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalAmount)}
                            </div>
                            <p className="text-xs text-emerald-200/60">
                                *Valores projetados brutos.
                            </p>
                        </CardContent>
                    </Card>

                    {/* LISTA DE CENÁRIOS SALVOS */}
                    <Card className="glass-card border-white/10 bg-white/5">
                        <CardHeader>
                            <CardTitle className="text-white text-base">Cenários Salvos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-60 overflow-y-auto">
                            {savedProjections.length === 0 && (
                                <p className="text-xs text-slate-500">Nenhum cenário salvo ainda.</p>
                            )}
                            {savedProjections.map((proj) => (
                                <div
                                    key={proj.id}
                                    onClick={() => handleLoadProjection(proj)}
                                    className="p-3 rounded bg-white/5 hover:bg-emerald-500/20 cursor-pointer transition-colors border border-white/5"
                                >
                                    <div className="text-sm font-medium text-white mb-1">{proj.name}</div>
                                    <div className="text-xs text-slate-400 flex justify-between">
                                        <span>R$ {proj.initialBalance} + R$ {proj.monthlyContribution}/mês</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 text-right">
                                        {new Date(proj.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Gráfico */}
                <div className="col-span-12 md:col-span-8 lg:col-span-9">
                    <div className="rounded-3xl glass-card p-8 h-[600px] flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-6">Evolução do Patrimônio</h3>
                        <div className="flex-1 min-h-0">
                            <InvestmentChart data={chartData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
