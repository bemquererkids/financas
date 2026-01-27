'use client';

import { useState, useEffect } from 'react';
import { InvestmentChart } from '@/components/investments/InvestmentChart';
import { EmptyState } from '@/components/ui/empty-state';
import { calculateProjectionData, createProjection, getProjections, deleteProjection } from '@/app/actions/investment-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Save, Clock, DollarSign, Percent, ArrowUpRight, Target, Sparkles, AlertTriangle, ShieldCheck, Rocket, ChevronRight, Trash2 } from 'lucide-react';
import { ModuleHeader } from '@/components/dashboard/ModuleHeader';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Helper to determine scenario profile based on rate
const getScenarioProfile = (rate: number) => {
    // 0 - 6%: Baixo Retorno (Cautela/Pessimista) -> Rose/Red
    if (rate <= 6) return {
        color: '#f43f5e', // Rose 500
        name: 'Conservador / Baixo',
        icon: ShieldCheck,
        gradient: 'from-rose-900/40 via-rose-900/10 to-slate-900/50',
        text: 'text-rose-400',
        bg: 'bg-rose-500',
        border: 'border-rose-500/20',
        shadow: 'shadow-rose-500/10',
        tag: 'Cautela'
    };
    // 6 - 12%: Retorno Médio (Equilibrado) -> Indigo (Theme Default)
    if (rate <= 12) return {
        color: '#6366f1', // Indigo 500
        name: 'Equilibrado',
        icon: TrendingUp,
        gradient: 'from-indigo-900/40 via-indigo-900/10 to-slate-900/50',
        text: 'text-indigo-400',
        bg: 'bg-indigo-500',
        border: 'border-indigo-500/20',
        shadow: 'shadow-indigo-500/10',
        tag: 'Padrão'
    };
    // 12 - 20%: Alto Retorno (Otimista) -> Emerald (Green)
    if (rate <= 20) return {
        color: '#10b981', // Emerald 500
        name: 'Otimista',
        icon: Rocket,
        gradient: 'from-emerald-900/40 via-emerald-900/10 to-slate-900/50',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500',
        border: 'border-emerald-500/20',
        shadow: 'shadow-emerald-500/10',
        tag: 'Positivo'
    };
    // > 20%: Irreal -> Amber
    return {
        color: '#f59e0b', // Amber 500
        name: 'Arriscado / Irreal',
        icon: AlertTriangle,
        gradient: 'from-amber-900/40 via-amber-900/10 to-slate-900/50',
        text: 'text-amber-400',
        bg: 'bg-amber-500',
        border: 'border-amber-500/20',
        shadow: 'shadow-amber-500/10',
        tag: 'Risco Alto'
    };
};

export default function InvestmentsPage() {
    const [inputs, setInputs] = useState({
        initialBalance: 0,
        monthlyContribution: 1000,
        annualReturnRate: 10,
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
        toast.info(`Cenário "${proj.name}" carregado!`);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await deleteProjection(id);
            const data = await getProjections();
            setSavedProjections(data);
            toast.success('Cenário excluído com sucesso!');
        } catch (error) {
            toast.error('Erro ao excluir cenário.');
        }
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

        const data = await getProjections();
        setSavedProjections(data);

        toast.success('Cenário salvo com sucesso!');
    };

    // Derived metrics
    const monthlyPassiveIncome = finalAmount * (Math.pow(1 + inputs.annualReturnRate / 100, 1 / 12) - 1);
    const totalInvested = inputs.initialBalance + (inputs.monthlyContribution * 12 * inputs.years);
    const totalEarnings = finalAmount - totalInvested;

    // Dynamic Profile
    const profile = getScenarioProfile(inputs.annualReturnRate);

    return (
        <div className="flex flex-col h-screen md:h-[calc(100vh-2rem)] p-2 md:p-4 gap-3 overflow-hidden bg-[#0A0F1C]/50">
            <div className="shrink-0">
                <ModuleHeader
                    title="Meu Futuro"
                    subtitle="Planejamento e projeção"
                    className="mb-1"
                />
            </div>

            {/* COMPACT STATS HEADER */}
            <div className="shrink-0 grid grid-cols-1 md:grid-cols-12 gap-3 max-h-[140px]">
                <Card className={cn(
                    "md:col-span-8 relative overflow-hidden border-0 shadow-lg bg-gradient-to-r",
                    profile.gradient
                )}>
                    {/* Background Glow */}
                    <div className={cn("absolute right-0 top-0 bottom-0 w-1/3 opacity-20 blur-3xl", profile.bg)} />

                    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 h-full">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg border bg-black/20 backdrop-blur-md shadow-lg", profile.border)}>
                                <profile.icon className={cn("h-5 w-5", profile.text)} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Patrimônio Projetado</p>
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter drop-shadow-lg">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(finalAmount)}
                                </h2>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-white/10 hidden md:block" />

                        <div className="flex gap-6">
                            <div>
                                <p className={cn("text-[9px] uppercase tracking-widest font-bold mb-0.5 text-right", profile.text)}>Renda Passiva</p>
                                <div className="text-lg font-bold text-white text-right">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(monthlyPassiveIncome)}
                                    <span className="text-[10px] text-slate-500 font-normal ml-1">/mês</span>
                                </div>
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5 text-slate-500">Lucro Total</p>
                                <div className="text-lg font-bold text-emerald-400">
                                    +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalEarnings)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cenário Info Compact */}
                <Card className="md:col-span-4 bg-white/5 border-white/10 backdrop-blur-xl flex flex-col justify-center">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-1">Cenário</p>
                            <div className="flex items-center gap-2">
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border bg-black/30", profile.text, profile.border)}>
                                    {profile.tag}
                                </span>
                                <span className="text-white font-medium text-xs">{profile.name}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-1">Retorno</p>
                            <span className={cn("text-xl font-black", profile.text)}>{inputs.annualReturnRate}%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* MAIN LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
                {/* LEFT SIDEBAR - CONTROLS & HISTORY */}
                <div className="md:col-span-3 flex flex-col gap-3 h-full min-h-0">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl shrink-0">
                        <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/5 shrink-0">
                            <CardTitle className="text-xs font-medium text-white flex items-center gap-2">
                                <Target className="h-3 w-3 text-slate-400" /> Parâmetros
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                                    Aporte Mensal
                                    <span className={cn("font-bold text-xs", profile.text)}>R$ {inputs.monthlyContribution}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    name="monthlyContribution"
                                    value={inputs.monthlyContribution}
                                    onChange={(e) => handleChange(e as any)}
                                    className={cn(
                                        "w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-transparent",
                                        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:shadow-lg",
                                        profile.text === 'text-indigo-400' ? "[&::-webkit-slider-runnable-track]:bg-indigo-500/50" :
                                            profile.text === 'text-emerald-400' ? "[&::-webkit-slider-runnable-track]:bg-emerald-500/50" :
                                                profile.text === 'text-rose-400' ? "[&::-webkit-slider-runnable-track]:bg-rose-500/50" :
                                                    "[&::-webkit-slider-runnable-track]:bg-amber-500/50"
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Inicial</label>
                                <div className="relative group focus-within:ring-1 ring-white/20 rounded-lg transition-all">
                                    <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 group-focus-within:text-white transition-colors" />
                                    <Input
                                        type="number"
                                        name="initialBalance"
                                        value={inputs.initialBalance}
                                        onChange={handleChange}
                                        className="pl-8 pr-6 h-8 text-xs bg-black/20 border-white/5 text-white focus:border-transparent rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center gap-0.5">
                                        <button
                                            onClick={() => setInputs(prev => ({ ...prev, initialBalance: prev.initialBalance + 100 }))}
                                            className="text-violet-500 hover:text-violet-400 transition-colors p-0.5"
                                        >
                                            <ChevronRight className="h-2.5 w-2.5 -rotate-90" />
                                        </button>
                                        <button
                                            onClick={() => setInputs(prev => ({ ...prev, initialBalance: Math.max(0, prev.initialBalance - 100) }))}
                                            className="text-violet-500 hover:text-violet-400 transition-colors p-0.5"
                                        >
                                            <ChevronRight className="h-2.5 w-2.5 rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Anos</label>
                                    <div className="relative group focus-within:ring-1 ring-white/20 rounded-lg transition-all">
                                        <Clock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 group-focus-within:text-white transition-colors" />
                                        <Input
                                            type="number"
                                            name="years"
                                            value={inputs.years}
                                            onChange={handleChange}
                                            className="pl-8 pr-6 h-8 text-xs bg-black/20 border-white/5 text-white focus:border-transparent rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center gap-0.5">
                                            <button
                                                onClick={() => setInputs(prev => ({ ...prev, years: prev.years + 1 }))}
                                                className="text-violet-500 hover:text-violet-400 transition-colors p-0.5"
                                            >
                                                <ChevronRight className="h-2.5 w-2.5 -rotate-90" />
                                            </button>
                                            <button
                                                onClick={() => setInputs(prev => ({ ...prev, years: Math.max(1, prev.years - 1) }))}
                                                className="text-violet-500 hover:text-violet-400 transition-colors p-0.5"
                                            >
                                                <ChevronRight className="h-2.5 w-2.5 rotate-90" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Retorno (%)</label>
                                    <div className="relative group focus-within:ring-1 ring-white/20 rounded-lg transition-all">
                                        <Percent className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 group-focus-within:text-white transition-colors" />
                                        <Input
                                            type="number"
                                            name="annualReturnRate"
                                            value={inputs.annualReturnRate}
                                            onChange={handleChange}
                                            className="pl-8 pr-6 h-8 text-xs bg-black/20 border-white/5 text-white focus:border-transparent rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center gap-0.5">
                                            <button
                                                onClick={() => setInputs(prev => ({ ...prev, annualReturnRate: prev.annualReturnRate + 0.5 }))}
                                                className="text-violet-500 hover:text-violet-400 transition-colors p-0.5"
                                            >
                                                <ChevronRight className="h-2.5 w-2.5 -rotate-90" />
                                            </button>
                                            <button
                                                onClick={() => setInputs(prev => ({ ...prev, annualReturnRate: Math.max(0, prev.annualReturnRate - 0.5) }))}
                                                className="text-violet-500 hover:text-violet-400 transition-colors p-0.5"
                                            >
                                                <ChevronRight className="h-2.5 w-2.5 rotate-90" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleSave}
                                className={cn(
                                    "w-full font-bold h-8 rounded-lg shadow-lg border-t border-white/10 mt-1 text-[10px] uppercase tracking-wide",
                                    profile.bg,
                                    `hover:${profile.bg}/90`
                                )}
                            >
                                <Save className="h-3 w-3 mr-2" /> Salvar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* HISTORY LIST FILLING REMAINING SPACE */}
                    <Card className="bg-black/20 border-white/5 flex flex-col flex-1 min-h-[100px] overflow-hidden">
                        <CardHeader className="py-2 px-4 border-b border-white/5 bg-white/5 shrink-0">
                            <CardTitle className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Histórico</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                            <div className="divide-y divide-white/5">
                                {savedProjections.map((proj) => (
                                    <button
                                        key={proj.id}
                                        onClick={() => handleLoadProjection(proj)}
                                        className="w-full text-left p-3 hover:bg-white/5 transition-all group flex items-center justify-between"
                                    >
                                        <div className="flex-1 min-w-0 mr-3">
                                            <p className="font-medium text-slate-300 text-xs truncate">{proj.name}</p>
                                            <p className="text-[10px] text-slate-500">{proj.years}a • {proj.annualReturnRate}%</p>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div
                                                onClick={(e) => handleDelete(e, proj.id)}
                                                className="p-1.5 hover:bg-rose-500/20 rounded-md text-slate-500 hover:text-rose-400 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </div>
                                            <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-white" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* GRAPH AREA - FILLING REMAINING SPACE */}
                <Card className="md:col-span-9 bg-white/5 border-white/10 h-full flex flex-col overflow-hidden relative">
                    <div className={cn("absolute -top-32 -right-32 blur-[100px] rounded-full w-[500px] h-[500px] pointer-events-none opacity-10 transition-colors duration-1000", profile.bg)} />

                    <CardHeader className="flex flex-row items-center justify-between py-3 px-5 relative z-10 shrink-0 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-white font-medium text-sm">Evolução Patrimonial</CardTitle>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 border-l border-white/10 pl-4 h-4">
                                <span>Aportes vs Juros</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Legend items could go here */}
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-black/20 px-2 py-1 rounded-full">
                                <div className={cn("w-2 h-2 rounded-full", profile.bg)} />
                                Saldo Total
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 w-full p-0 relative z-10 min-h-0 bg-gradient-to-b from-transparent to-black/20">
                        {/* Chart Wrapper */}
                        <div className="h-full w-full p-4 pb-2">
                            <InvestmentChart data={chartData} color={profile.color} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
