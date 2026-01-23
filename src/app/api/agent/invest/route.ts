import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface InvestmentProfile {
    monthlyIncome: number;
    monthlyExpenses: number;
    availableToInvest: number;
    currentInvestments: number;
    riskProfile: 'conservador' | 'moderado' | 'arrojado';
    goals: string[];
}

interface InvestmentRecommendation {
    allocation: {
        category: string;
        percentage: number;
        amount: number;
        description: string;
        examples: string[];
    }[];
    reasoning: string;
    nextSteps: string[];
    warnings: string[];
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const userId = session.user.id;
        const { amount, timeHorizon, riskTolerance } = await req.json();

        // Buscar dados do usuário
        const [user, transactions, investments] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.transaction.findMany({
                where: { userId, date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 3)) } }
            }),
            prisma.investment.findMany({ where: { userId } })
        ]);

        // Calcular perfil financeiro
        const monthlyExpenses = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0) / 3;

        const monthlyIncome = user?.monthlyIncome || 0;
        const currentInvestments = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);
        const availableToInvest = amount || (monthlyIncome - monthlyExpenses) * 0.2; // 20% da sobra

        // Determinar perfil de risco
        const riskProfile = determineRiskProfile(riskTolerance, timeHorizon, monthlyIncome);

        // Gerar recomendações personalizadas
        const recommendations = generateRecommendations({
            monthlyIncome,
            monthlyExpenses,
            availableToInvest,
            currentInvestments,
            riskProfile,
            goals: user?.mainGoal ? [user.mainGoal] : []
        }, timeHorizon);

        return Response.json({
            success: true,
            profile: {
                monthlyIncome,
                monthlyExpenses,
                availableToInvest: Math.round(availableToInvest),
                currentInvestments: Math.round(currentInvestments),
                riskProfile
            },
            recommendations
        });

    } catch (error) {
        console.error('Investment Advisor Error:', error);
        return Response.json({ error: 'Erro ao gerar recomendações' }, { status: 500 });
    }
}

function determineRiskProfile(
    userTolerance: string | undefined,
    timeHorizon: string | undefined,
    income: number
): 'conservador' | 'moderado' | 'arrojado' {
    // Se usuário especificou, usar preferência
    if (userTolerance === 'baixo') return 'conservador';
    if (userTolerance === 'alto') return 'arrojado';

    // Senão, inferir baseado em tempo e renda
    const isLongTerm = timeHorizon === 'longo' || timeHorizon === '5+ anos';
    const hasGoodIncome = income > 5000;

    if (isLongTerm && hasGoodIncome) return 'arrojado';
    if (isLongTerm || hasGoodIncome) return 'moderado';
    return 'conservador';
}

function generateRecommendations(
    profile: InvestmentProfile,
    timeHorizon: string | undefined
): InvestmentRecommendation {
    const { availableToInvest, riskProfile } = profile;

    // Estratégias por perfil de risco
    const strategies = {
        conservador: {
            allocation: [
                {
                    category: 'Reserva de Emergência',
                    percentage: 40,
                    amount: availableToInvest * 0.4,
                    description: 'Liquidez imediata para imprevistos (3-6 meses de despesas)',
                    examples: ['Tesouro Selic', 'CDB com liquidez diária', 'Nubank Caixinhas']
                },
                {
                    category: 'Renda Fixa',
                    percentage: 50,
                    amount: availableToInvest * 0.5,
                    description: 'Segurança e previsibilidade',
                    examples: ['CDB', 'LCI/LCA', 'Tesouro Direto (IPCA+)', 'Debêntures']
                },
                {
                    category: 'Fundos Conservadores',
                    percentage: 10,
                    amount: availableToInvest * 0.1,
                    description: 'Diversificação com baixo risco',
                    examples: ['Fundos DI', 'Fundos Multimercado Conservadores']
                }
            ],
            reasoning: 'Perfil conservador prioriza segurança e liquidez. Foco em renda fixa e reserva de emergência.',
            nextSteps: [
                '1. Abra conta em corretora (XP, Rico, Clear)',
                '2. Monte reserva de emergência primeiro',
                '3. Diversifique em CDBs de bancos diferentes',
                '4. Considere Tesouro IPCA+ para longo prazo'
            ],
            warnings: [
                '⚠️ Não invista em renda variável sem reserva de emergência',
                '⚠️ Cuidado com promessas de "rentabilidade garantida" acima de 100% do CDI'
            ]
        },
        moderado: {
            allocation: [
                {
                    category: 'Reserva de Emergência',
                    percentage: 25,
                    amount: availableToInvest * 0.25,
                    description: 'Base de segurança',
                    examples: ['Tesouro Selic', 'CDB liquidez diária']
                },
                {
                    category: 'Renda Fixa',
                    percentage: 40,
                    amount: availableToInvest * 0.4,
                    description: 'Estabilidade',
                    examples: ['CDB', 'LCI/LCA', 'Tesouro IPCA+']
                },
                {
                    category: 'Renda Variável',
                    percentage: 25,
                    amount: availableToInvest * 0.25,
                    description: 'Crescimento de longo prazo',
                    examples: ['ETFs (BOVA11, IVVB11)', 'Fundos de Índice', 'Ações blue chips']
                },
                {
                    category: 'Fundos Imobiliários',
                    percentage: 10,
                    amount: availableToInvest * 0.1,
                    description: 'Renda passiva',
                    examples: ['FIIs de papel', 'FIIs de tijolo']
                }
            ],
            reasoning: 'Perfil moderado equilibra segurança e crescimento. Diversificação entre renda fixa e variável.',
            nextSteps: [
                '1. Garanta reserva de emergência',
                '2. Comece com ETFs para renda variável',
                '3. Estude sobre ações antes de investir diretamente',
                '4. Aportes mensais em FIIs para renda passiva'
            ],
            warnings: [
                '⚠️ Renda variável tem volatilidade - pense em 5+ anos',
                '⚠️ Não coloque tudo em uma única ação ou FII'
            ]
        },
        arrojado: {
            allocation: [
                {
                    category: 'Reserva de Emergência',
                    percentage: 15,
                    amount: availableToInvest * 0.15,
                    description: 'Segurança mínima',
                    examples: ['Tesouro Selic']
                },
                {
                    category: 'Renda Fixa',
                    percentage: 25,
                    amount: availableToInvest * 0.25,
                    description: 'Estabilização da carteira',
                    examples: ['Tesouro IPCA+', 'Debêntures incentivadas']
                },
                {
                    category: 'Renda Variável',
                    percentage: 45,
                    amount: availableToInvest * 0.45,
                    description: 'Crescimento agressivo',
                    examples: ['Ações growth', 'ETFs internacionais', 'Small caps']
                },
                {
                    category: 'Alternativos',
                    percentage: 15,
                    amount: availableToInvest * 0.15,
                    description: 'Diversificação e oportunidades',
                    examples: ['FIIs', 'Criptomoedas (BTC/ETH)', 'Fundos Multimercado']
                }
            ],
            reasoning: 'Perfil arrojado busca máximo crescimento. Aceita volatilidade para retornos superiores no longo prazo.',
            nextSteps: [
                '1. Estude análise fundamentalista',
                '2. Diversifique em 10-15 ações diferentes',
                '3. Considere ETFs internacionais (S&P 500)',
                '4. Aportes mensais constantes (dollar-cost averaging)'
            ],
            warnings: [
                '⚠️ Nunca invista dinheiro que pode precisar em menos de 5 anos',
                '⚠️ Criptomoedas são extremamente voláteis - máximo 5-10% da carteira',
                '⚠️ Evite day trade sem experiência'
            ]
        }
    };

    return strategies[riskProfile];
}
