'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getUserId() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.error('getUserId: Session not found or no user ID', session);
            return null;
        }
        return session.user.id;
    } catch (e) {
        console.error('getUserId: Error fetching session', e);
        return null;
    }
}

export async function createTransaction(formData: FormData) {
    const userId = await getUserId();
    if (!userId) {
        return { error: 'Usuário não autenticado. Por favor, faça login novamente.' };
    }

    let amountRaw = formData.get('amount') as string;

    // Suporte a vírgula (R$ 1.000,00 ou 10,50)
    if (amountRaw.includes(',')) {
        amountRaw = amountRaw.replace(/\./g, '').replace(',', '.');
    }

    const amount = parseFloat(amountRaw);
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const rawType = formData.get('type') as string;
    const dateStr = formData.get('date') as string;

    console.log('[CreateTransaction] Iniciando:', { userId, amount, description, category, rawType, dateStr });

    if (!amount || isNaN(amount) || !description || !category || !dateStr) {
        console.error('[CreateTransaction] Dados inválidos:', { amount, description, category, dateStr });
        return { error: 'Preencha todos os campos obrigatórios corretamente.' };
    }

    // Mapeamento correto de tipos
    // Se vier "Receita", "Renda", "INCOME" -> INCOME
    // Caso contrário -> EXPENSE
    const isIncome =
        rawType === 'INCOME' ||
        rawType.toLowerCase().includes('renda') ||
        rawType.toLowerCase().includes('receita');

    const type = isIncome ? 'INCOME' : 'EXPENSE';

    try {
        const transaction = await prisma.transaction.create({
            data: {
                amount: type === 'EXPENSE' ? Math.abs(amount) : Math.abs(amount), // Amount é sempre positivo no banco, o tipo define se é entrada ou saída
                description,
                category,
                type, // "INCOME" ou "EXPENSE"
                date: new Date(dateStr),
                isRecurring: false,
                user: {
                    connect: { id: userId }
                }
            },
        });

        console.log('[CreateTransaction] Sucesso:', transaction.id);

        revalidatePath('/');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('[CreateTransaction] Erro crítico no Prisma:', error);
        return { error: 'Erro no servidor ao salvar transação. Tente novamente mais tarde.' };
    }
}
