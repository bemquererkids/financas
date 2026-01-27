'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, PiggyBank, Target, Wallet } from 'lucide-react';
import { toast } from 'sonner';

type FinancialSituation = 'endividado' | 'equilibrado' | 'poupando';
type MainGoal = 'quitar_dividas' | 'poupar' | 'investir' | 'controlar_gastos';

interface ProfileAnalysis {
    userProfile: string;
    welcomeMessage: string;
    recommendations: string[];
}

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);

    // Form state
    const [financialSituation, setFinancialSituation] = useState<FinancialSituation | ''>('');
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [hasDebts, setHasDebts] = useState<boolean | null>(null);
    const [savingsPercentage, setSavingsPercentage] = useState<number | null>(null);
    const [mainGoal, setMainGoal] = useState<MainGoal | ''>('');

    const totalSteps = 5;

    // Avançar automaticamente para passos de seleção
    const handleSelectionNext = (delay = 300) => {
        if (step < totalSteps) {
            setTimeout(() => setStep(step + 1), delay);
        } else {
            setTimeout(() => analyzeProfile(), delay);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
        else analyzeProfile();
    };

    const analyzeProfile = async () => {
        setIsAnalyzing(true);
        // Simular análise
        await new Promise(resolve => setTimeout(resolve, 2000));

        const firstName = session?.user?.name?.split(' ')[0] || 'usuário';
        let profile = '';
        let message = '';
        let recommendations: string[] = [];

        if (financialSituation === 'endividado' || hasDebts) {
            profile = 'Perfil Recuperação';
            message = `${firstName}, vamos reorganizar suas finanças juntos. O foco agora é clareza e eliminação de dívidas.`;
            recommendations = ['Priorize dívidas com juros altos', 'Controle rigoroso de gastos', 'Evite novas dívidas'];
        } else if (financialSituation === 'equilibrado' && (savingsPercentage === null || savingsPercentage < 10)) {
            profile = 'Perfil Construtor';
            message = `${firstName}, sua base está pronta. Agora é hora de construir patrimônio e aumentar sua poupança.`;
            recommendations = ['Poupe 10% da renda', 'Crie reserva de emergência', 'Comece a investir'];
        } else if (financialSituation === 'poupando' || (savingsPercentage && savingsPercentage >= 10)) {
            profile = 'Perfil Investidor';
            message = `${firstName}, excelente disciplina! Vamos multiplicar seu patrimônio com investimentos estratégicos.`;
            recommendations = ['Diversifique investimentos', 'Aumente aportes mensais', 'Estude renda variável'];
        } else {
            profile = 'Perfil Iniciante';
            message = `Bem-vindo, ${firstName}! O primeiro passo é ter controle total. Vamos começar do jeito certo.`;
            recommendations = ['Registre tudo', 'Corte gastos supérfluos', 'Defina metas claras'];
        }

        setProfileAnalysis({ userProfile: profile, welcomeMessage: message, recommendations });
        setIsAnalyzing(false);
        setStep(6);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/user/complete-onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    financialSituation,
                    monthlyIncome: parseFloat(monthlyIncome),
                    hasDebts,
                    savingsPercentage,
                    mainGoal,
                    userProfile: profileAnalysis?.userProfile,
                }),
            });

            if (response.ok) {
                toast.success('Perfil configurado com sucesso! 🚀');
                router.push('/');
            } else {
                toast.error('Erro ao salvar perfil.');
            }
        } catch {
            toast.error('Erro de conexão.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Minimalist Progress */}
                {step <= 5 && (
                    <div className="flex gap-2 mb-8 justify-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div
                                key={s}
                                className={`h-1 w-8 rounded-full transition-all duration-300 ${s <= step ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-zinc-800'}`}
                            />
                        ))}
                    </div>
                )}

                {/* Content Card */}
                <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500">

                    {/* Step 1: Income */}
                    {step === 1 && (
                        <div className="text-center space-y-6">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Qual sua renda mensal?</h2>
                            <div className="relative inline-block w-full">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 text-2xl font-light">R$</span>
                                <input
                                    type="number"
                                    value={monthlyIncome}
                                    onChange={(e) => setMonthlyIncome(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full pl-16 pr-4 py-6 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white text-4xl font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-center placeholder:text-zinc-700"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && parseFloat(monthlyIncome) > 0 && handleNext()}
                                />
                            </div>
                            <Button
                                onClick={handleNext}
                                disabled={!monthlyIncome || parseFloat(monthlyIncome) <= 0}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium"
                            >
                                Continuar
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Situation - Grid Design */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white text-center tracking-tight">Sua situação atual</h2>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { value: 'endividado', label: 'Tenho dívidas a quitar', icon: AlertTriangle, color: 'text-red-400', border: 'hover:border-red-500/50', bg: 'hover:bg-red-500/10' },
                                    { value: 'equilibrado', label: 'Contas em dia, zero sobra', icon: Wallet, color: 'text-yellow-400', border: 'hover:border-yellow-500/50', bg: 'hover:bg-yellow-500/10' },
                                    { value: 'poupando', label: 'Consigo poupar mensalmente', icon: PiggyBank, color: 'text-emerald-400', border: 'hover:border-emerald-500/50', bg: 'hover:bg-emerald-500/10' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setFinancialSituation(option.value as FinancialSituation);
                                            handleSelectionNext();
                                        }}
                                        className={`group relative p-4 flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-950/30 transition-all duration-200 ${option.border} ${option.bg} ${financialSituation === option.value ? 'border-emerald-500 bg-emerald-500/10' : ''}`}
                                    >
                                        <div className={`p-3 rounded-full bg-zinc-900 ${option.color} group-hover:scale-110 transition-transform`}>
                                            <option.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-zinc-200 font-medium text-lg">{option.label}</span>
                                        {financialSituation === option.value && <div className="absolute right-4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Debts - Simple Choice */}
                    {step === 3 && (
                        <div className="space-y-8 text-center">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Possui dívidas ativas?</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: true, label: 'Sim', icon: AlertTriangle },
                                    { value: false, label: 'Não', icon: CheckCircle2 }
                                ].map((option) => (
                                    <button
                                        key={option.label} // unique key
                                        onClick={() => {
                                            setHasDebts(option.value);
                                            handleSelectionNext();
                                        }}
                                        className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-zinc-800 bg-zinc-950/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all ${hasDebts === option.value ? 'border-emerald-500 bg-emerald-500/10' : ''}`}
                                    >
                                        <option.icon className={`w-8 h-8 ${option.value ? 'text-orange-400' : 'text-emerald-400'}`} />
                                        <span className="text-white text-xl font-bold">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Savings - Compact Grid */}
                    {step === 4 && (
                        <div className="space-y-6 text-center">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Capacidade de Poupança</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 0, label: '0%' },
                                    { value: 5, label: 'Até 5%' },
                                    { value: 10, label: '10-20%' },
                                    { value: 20, label: '+20%' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSavingsPercentage(option.value);
                                            handleSelectionNext();
                                        }}
                                        className={`p-6 rounded-xl border border-zinc-800 bg-zinc-950/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all ${savingsPercentage === option.value ? 'border-emerald-500 bg-emerald-500/10' : ''}`}
                                    >
                                        <p className="text-2xl font-bold text-white mb-1">{option.label}</p>
                                        <span className="text-xs text-zinc-500 uppercase tracking-wider">da renda</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Goal - List Selection */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white text-center tracking-tight">Objetivo Principal</h2>
                            <div className="space-y-3">
                                {[
                                    { value: 'quitar_dividas', label: 'Quitar Dívidas', icon: AlertTriangle },
                                    { value: 'controlar_gastos', label: 'Controlar Gastos', icon: TrendingUp },
                                    { value: 'poupar', label: 'Guardar Dinheiro', icon: Wallet },
                                    { value: 'investir', label: 'Começar a Investir', icon: Sparkles }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setMainGoal(option.value as MainGoal);
                                            handleSelectionNext();
                                        }}
                                        className={`w-full p-4 flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-950/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left ${mainGoal === option.value ? 'border-emerald-500 bg-emerald-500/10' : ''}`}
                                    >
                                        <div className="p-2 rounded-lg bg-zinc-900 text-emerald-400">
                                            <option.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-white font-medium text-lg">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 6: Result */}
                    {step === 6 && !isAnalyzing && profileAnalysis && (
                        <div className="text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-6">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">{profileAnalysis.userProfile}</h2>
                            <p className="text-zinc-400 mb-8 max-w-sm mx-auto leading-relaxed">
                                {profileAnalysis.welcomeMessage}
                            </p>

                            <div className="bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800 mb-8 text-left">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">Plano Inicial</h3>
                                <ul className="space-y-3">
                                    {profileAnalysis.recommendations.map((rec, i) => (
                                        <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-lg font-bold shadow-lg shadow-indigo-500/20"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Acessar Dashboard"}
                            </Button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isAnalyzing && (
                        <div className="py-20 text-center">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 animate-pulse" />
                                <Loader2 className="h-12 w-12 text-emerald-400 animate-spin relative z-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mt-6 mb-2">Analisando Perfil...</h3>
                            <p className="text-zinc-500 text-sm">Personalizando sua experiência</p>
                        </div>
                    )}

                    {/* Back Button (Only if not first step and not finished) */}
                    {step > 1 && step <= 5 && !isAnalyzing && (
                        <button
                            onClick={handleBack}
                            className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
