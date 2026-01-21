'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('Unauthorized - Please sign in');
    }
    return session.user.id;
}

export async function createTransaction(formData: FormData) {
    const userId = await getUserId();
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    // O select de Tipo agora retorna Renda 1, Renda 2, etc. Precisamos mapear para INCOME/EXPENSE
    const rawType = formData.get('type') as string;

    const isIncome = rawType.includes('Renda') || rawType === 'Outras Receitas';
    const type = isIncome ? 'INCOME' : 'EXPENSE';

    const dateStr = formData.get('date') as string;

    if (!amount || !description || !category || !dateStr) {
        return { error: 'Preencha todos os campos obrigatórios.' };
    }

    try {
        await prisma.transaction.create({
            data: {
                amount,
                description,
                category,
                type,
                date: new Date(dateStr),
                isRecurring: false,
                userId
            },
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        return { error: 'Erro no servidor ao salvar transação.' };
    }
}
