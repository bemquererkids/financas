'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
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

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const analyzeProfile = async () => {
        setIsAnalyzing(true);

        // Simular análise da IA (você pode integrar com OpenAI depois)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Pegar primeiro nome do usuário
        const firstName = session?.user?.name?.split(' ')[0] || 'usuário';

        let profile = '';
        let message = '';
        let recommendations: string[] = [];

        // Lógica de identificação de perfil
        if (financialSituation === 'endividado' || hasDebts) {
            profile = 'Perfil Recuperação';
            message = `${firstName}, identificamos que você está em um momento de reorganização financeira. Não se preocupe, estamos aqui para te ajudar a sair dessa situação de forma estratégica e sustentável.`;
            recommendations = [
                'Priorize o pagamento das dívidas com maiores juros',
                'Crie um orçamento realista para controlar gastos',
                'Negocie suas dívidas para reduzir juros',
                'Evite novas dívidas enquanto não quitar as atuais'
            ];
        } else if (financialSituation === 'equilibrado' && (savingsPercentage === null || savingsPercentage < 10)) {
            profile = 'Perfil Construtor';
            message = `${firstName}, você está no caminho certo! Suas contas estão em dia, agora é hora de construir uma base financeira sólida e começar a poupar de forma consistente.`;
            recommendations = [
                'Estabeleça uma meta de poupar 10-20% da renda mensal',
                'Crie uma reserva de emergência (3-6 meses de despesas)',
                'Automatize suas economias com transferências mensais',
                'Comece a estudar sobre investimentos básicos'
            ];
        } else if (financialSituation === 'poupando' || (savingsPercentage && savingsPercentage >= 10)) {
            profile = 'Perfil Investidor';
            message = `Parabéns, ${firstName}! Você já possui disciplina financeira e consegue poupar regularmente. Agora é o momento de fazer seu dinheiro trabalhar para você através de investimentos inteligentes.`;
            recommendations = [
                'Diversifique seus investimentos (renda fixa e variável)',
                'Mantenha sua reserva de emergência sempre atualizada',
                'Estude sobre diferentes classes de ativos',
                'Defina objetivos de longo prazo (aposentadoria, patrimônio)'
            ];
        } else {
            profile = 'Perfil Iniciante';
            message = `Bem-vindo, ${firstName}! Você está dando o primeiro passo para transformar sua relação com o dinheiro. Vamos juntos nessa jornada de organização financeira.`;
            recommendations = [
                'Comece registrando todas as suas despesas',
                'Identifique gastos desnecessários que podem ser cortados',
                'Estabeleça metas financeiras claras e alcançáveis',
                'Aprenda sobre educação financeira básica'
            ];
        }

        setProfileAnalysis({ userProfile: profile, welcomeMessage: message, recommendations });
        setIsAnalyzing(false);
        setStep(6); // Ir para tela de resultado
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
                toast.success('Perfil salvo com sucesso!');
                router.push('/');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Erro ao salvar perfil');
            }
        } catch (error) {
            console.error('Onboarding error:', error);
            toast.error('Erro ao completar cadastro');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return monthlyIncome !== '' && parseFloat(monthlyIncome) > 0;
            case 2: return financialSituation !== '';
            case 3: return hasDebts !== null;
            case 4: return savingsPercentage !== null;
            case 5: return mainGoal !== '';
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                {step <= 5 && (
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-400">Etapa {step} de {totalSteps}</span>
                            <span className="text-sm text-emerald-400">{Math.round((step / totalSteps) * 100)}%</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                style={{ width: `${(step / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 md:p-12 shadow-2xl">

                    {/* Step 1: Renda Mensal */}
                    {step === 1 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Qual sua renda mensal líquida?</h2>
                                <p className="text-slate-400">Informe o valor que você recebe após descontos</p>
                            </div>

                            <div>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 text-xl font-medium">R$</span>
                                    <input
                                        type="number"
                                        value={monthlyIncome}
                                        onChange={(e) => setMonthlyIncome(e.target.value)}
                                        placeholder="0,00"
                                        className="w-full pl-16 pr-6 py-5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Situação Financeira */}
                    {step === 2 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Como você descreveria sua situação financeira atual?</h2>
                                <p className="text-slate-400">Seja sincero, isso nos ajuda a personalizar sua experiência</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { value: 'endividado', label: 'Tenho dívidas que preciso quitar', color: 'red' },
                                    { value: 'equilibrado', label: 'Consigo pagar as contas, mas não sobra muito', color: 'yellow' },
                                    { value: 'poupando', label: 'Consigo guardar dinheiro mensalmente', color: 'emerald' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFinancialSituation(option.value as FinancialSituation)}
                                        className={`w-full p-5 rounded-xl border-2 transition-all text-left ${financialSituation === option.value
                                            ? `border-${option.color}-500 bg-${option.color}-500/10`
                                            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <p className="text-white font-medium">{option.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Dívidas */}
                    {step === 3 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Você possui dívidas atualmente?</h2>
                                <p className="text-slate-400">Considere cartão de crédito, empréstimos, financiamentos</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setHasDebts(true)}
                                    className={`p-8 rounded-xl border-2 transition-all ${hasDebts === true
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <p className="text-white font-bold text-lg">Sim</p>
                                </button>

                                <button
                                    onClick={() => setHasDebts(false)}
                                    className={`p-8 rounded-xl border-2 transition-all ${hasDebts === false
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <p className="text-white font-bold text-lg">Não</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Capacidade de Poupança */}
                    {step === 4 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Quanto você consegue poupar por mês?</h2>
                                <p className="text-slate-400">Em percentual da sua renda</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { value: 0, label: 'Não consigo poupar no momento' },
                                    { value: 5, label: 'Até 5% da minha renda' },
                                    { value: 10, label: 'Entre 10% e 20%' },
                                    { value: 20, label: 'Mais de 20%' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSavingsPercentage(option.value)}
                                        className={`w-full p-5 rounded-xl border-2 transition-all text-left ${savingsPercentage === option.value
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <p className="text-white font-medium">{option.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Objetivo Principal */}
                    {step === 5 && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Qual seu principal objetivo financeiro?</h2>
                                <p className="text-slate-400">Vamos focar no que é mais importante para você</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { value: 'quitar_dividas', label: 'Quitar minhas dívidas' },
                                    { value: 'controlar_gastos', label: 'Controlar melhor meus gastos' },
                                    { value: 'poupar', label: 'Criar uma reserva de emergência' },
                                    { value: 'investir', label: 'Começar a investir meu dinheiro' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setMainGoal(option.value as MainGoal)}
                                        className={`w-full p-5 rounded-xl border-2 transition-all text-left ${mainGoal === option.value
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <p className="text-white font-medium">{option.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 6: Análise do Perfil */}
                    {step === 6 && !isAnalyzing && profileAnalysis && (
                        <div className="space-y-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">{profileAnalysis.userProfile}</h2>
                                <p className="text-slate-300 text-lg leading-relaxed">{profileAnalysis.welcomeMessage}</p>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-emerald-400" />
                                    Recomendações Personalizadas
                                </h3>
                                <ul className="space-y-3">
                                    {profileAnalysis.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-3 text-slate-300">
                                            <span className="text-emerald-400 mt-1">•</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="text-center">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg"
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            Começar a usar o MyWallet
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Analyzing State */}
                    {isAnalyzing && (
                        <div className="text-center py-12">
                            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Analisando seu perfil...</h3>
                            <p className="text-slate-400">Nossa IA está identificando as melhores estratégias para você</p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    {step <= 5 && !isAnalyzing && (
                        <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
                            <Button
                                onClick={handleBack}
                                variant="ghost"
                                disabled={step === 1}
                                className="text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>

                            {step < totalSteps ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continuar
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={analyzeProfile}
                                    disabled={!canProceed()}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Analisar Perfil
                                    <Sparkles className="h-4 w-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
