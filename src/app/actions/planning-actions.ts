'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type EnvelopeResult = {
    name: string;
    percentage: number;
    idealAmount: number;
    realAmount: number;
    gap: number;
    status: 'OVERSPECT' | 'UNDERSPECT' | 'ON_TRACK';
};

export async function getPlanningData() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // 1. Get Income
    const transactions = await prisma.transaction.findMany({
        where: {
            date: { gte: firstDay, lte: lastDay }
        }
    });

    const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // 2. Define Envelopes Logic (Mapping Categories)
    const envelopeDefs = [
        {
            name: 'Contas Fixas / Essenciais',
            percent: 0.55,
            categories: ['Moradia', 'Condominio', 'Luz', 'Agua', 'Gas', 'Internet', 'Mercado', 'GasolinaUber', 'IPTU', 'Saude', 'Seguros', 'Celular']
        },
        {
            name: 'Educação / Evolução',
            percent: 0.10,
            categories: ['Educacao', 'Livros', 'Cursos']
        },
        {
            name: 'Reserva de Emergência',
            percent: 0.10,
            categories: ['Reserva'] // Specific category required
        },
        {
            name: 'Aposentadoria / Futuro',
            percent: 0.10,
            categories: ['Previdencia', 'Investimento']
        },
        {
            name: 'Lazer e Estilo de Vida',
            percent: 0.15,
            categories: ['Lazer', 'Estetica', 'Academia', 'Streaming', 'Pet', 'Diarista', 'Dizimo']
        }
    ];

    // 3. Calculate Results
    const results: EnvelopeResult[] = envelopeDefs.map(env => {
        const ideal = totalIncome * env.percent;

        const real = transactions
            .filter(t => t.type === 'EXPENSE' && env.categories.includes(t.category))
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const gap = ideal - real; // Positive means we spent LESS than budget (Good for expenses), Negative means Overspending.

        // Status Logic
        let status: EnvelopeResult['status'] = 'ON_TRACK';
        if (real > ideal) status = 'OVERSPECT'; // Gastou demais
        if (real < ideal * 0.9) status = 'UNDERSPECT'; // Gastou de menos (Sobra)

        return {
            name: env.name,
            percentage: env.percent * 100,
            idealAmount: ideal,
            realAmount: real,
            gap,
            status
        };
    });

    return {
        period: `${today.toLocaleString('pt-BR', { month: 'long' })}`,
        totalIncome,
        envelopes: results
    };
}
