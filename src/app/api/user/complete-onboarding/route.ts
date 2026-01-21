import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        const {
            financialSituation,
            monthlyIncome,
            hasDebts,
            savingsPercentage,
            mainGoal,
            userProfile
        } = await req.json();

        // Determinar se possui cartão de crédito e investimentos baseado no perfil
        const hasCreditCard = financialSituation !== 'endividado';
        const hasInvestments = financialSituation === 'poupando' && savingsPercentage >= 10;

        // Atualizar perfil do usuário
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                onboardingCompleted: true,
                financialSituation,
                monthlyIncome,
                hasCreditCard,
                hasInvestments,
                mainGoal,
                userProfile,
            },
        });

        return NextResponse.json({
            success: true,
            userProfile
        });
    } catch (error) {
        console.error('Onboarding completion error:', error);
        return NextResponse.json(
            { error: 'Erro ao salvar perfil' },
            { status: 500 }
        );
    }
}
