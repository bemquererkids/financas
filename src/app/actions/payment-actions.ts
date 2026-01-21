'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getUserId() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.error('getUserId: Session not found or no user ID in Payment Actions');
            return null;
        }
        return session.user.id;
    } catch (e) {
        console.error('getUserId Error:', e);
        return null;
    }
}

export async function getPaymentWindows(monthStr?: string) {
    const userId = await getUserId();
    if (!userId) return null;

    // monthStr format: "YYYY-MM"
    const targetMonth = monthStr || new Date().toISOString().slice(0, 7);

    // Let's get all payables for this month
    const payables: any[] = await prisma.payable.findMany({
        where: {
            paymentWindow: {
                month: targetMonth,
                user: {
                    id: userId
                }
            }
        },
        include: {
            paymentWindow: true
        }
    });

    // Group by window day (7, 15, 30)
    const result = {
        month: targetMonth,
        windows: {
            7: { day: 7, total: 0, items: [] as any[] },
            15: { day: 15, total: 0, items: [] as any[] },
            30: { day: 30, total: 0, items: [] as any[] }
        }
    };

    payables.forEach(p => {
        const day = p.paymentWindow.windowDay as 7 | 15 | 30;
        if (result.windows[day]) {
            result.windows[day].items.push({
                id: p.id,
                name: p.name,
                amount: Number(p.amount),
                dueDate: p.dueDate.toISOString(), // Fix Date serialization
                isPaid: p.isPaid
            });
            result.windows[day].total += Number(p.amount);
        }
    });

    return result;
}

export async function addPayable(formData: FormData) {
    const userId = await getUserId();
    if (!userId) return { error: 'Usuário não autenticado' };

    const name = formData.get('name') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dueDateStr = formData.get('dueDate') as string;
    const windowDay = parseInt(formData.get('windowDay') as string); // 7, 15, or 30

    if (!name || isNaN(amount) || !dueDateStr || !windowDay) {
        return { error: 'Dados inválidos' };
    }

    const date = new Date(dueDateStr);
    const monthStr = date.toISOString().slice(0, 7); // YYYY-MM

    try {
        // Find or Create Payment Window for THIS user
        let window = await prisma.paymentWindow.findFirst({
            where: {
                month: monthStr,
                windowDay: windowDay,
                user: { id: userId }
            }
        });

        if (!window) {
            window = await prisma.paymentWindow.create({
                data: {
                    month: monthStr,
                    windowDay: windowDay,
                    receivedAmount: 0, // Default
                    user: {
                        connect: { id: userId }
                    }
                }
            });
        }

        await prisma.payable.create({
            data: {
                name,
                amount,
                dueDate: date,
                paymentWindowId: window.id
            }
        });

        revalidatePath('/payments');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: 'Erro ao salvar conta' };
    }
}

export async function togglePayableStatus(id: string, currentStatus: boolean) {
    const userId = await getUserId();
    if (!userId) return;

    // Se estamos marcando como PAGO (!currentStatus === true)
    const isPaying = !currentStatus;

    try {
        const payable = await prisma.payable.update({
            where: { id },
            data: { isPaid: isPaying }
        });

        if (isPaying) {
            // Criar Transação de Despesa Automaticamente
            console.log('[AutoTransaction] Criando despesa para pagamento:', payable.name);
            await prisma.transaction.create({
                data: {
                    amount: Number(payable.amount),
                    description: `Pagamento: ${payable.name}`,
                    category: 'Contas Fixas', // Categoria padrão para pagamentos automáticos
                    type: 'EXPENSE',
                    date: new Date(), // Data do pagamento efetivo (hoje)
                    isRecurring: false,
                    user: {
                        connect: { id: userId }
                    }
                }
            });
        }

        revalidatePath('/payments');
        revalidatePath('/'); // Atualiza dashboard também
    } catch (error) {
        console.error('Erro ao atualizar status do pagamento:', error);
    }
}

export async function importPayables(csvData: { name: string, amount: number, dueDate: string, windowDay: number }[]) {
    const userId = await getUserId();
    if (!userId) return { error: 'Não autorizado' };

    let count = 0;

    try {
        for (const item of csvData) {
            const date = new Date(item.dueDate);
            if (isNaN(date.getTime())) continue; // Pula datas inválidas

            const monthStr = date.toISOString().slice(0, 7);

            // Find or Create Payment Window
            let window = await prisma.paymentWindow.findFirst({
                where: {
                    month: monthStr,
                    windowDay: item.windowDay,
                    user: { id: userId }
                }
            });

            if (!window) {
                window = await prisma.paymentWindow.create({
                    data: {
                        month: monthStr,
                        windowDay: item.windowDay,
                        receivedAmount: 0,
                        user: { connect: { id: userId } }
                    }
                });
            }

            await prisma.payable.create({
                data: {
                    name: item.name,
                    amount: item.amount,
                    dueDate: date,
                    paymentWindowId: window.id
                }
            });
            count++;
        }

        revalidatePath('/payments');
        return { success: true, count };
    } catch (e) {
        console.error("Erro na importação:", e);
        return { error: 'Erro ao processar importação.' };
    }
}
