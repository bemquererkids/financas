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

export async function getPaymentWindows(monthStr?: string) {
    const userId = await getUserId();
    // monthStr format: "YYYY-MM"
    const targetMonth = monthStr || new Date().toISOString().slice(0, 7);

    // Let's get all payables for this month
    const payables = await prisma.payable.findMany({
        where: {
            paymentWindow: {
                month: targetMonth,
                userId // Filter payment windows by user
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
                userId
            }
        });

        if (!window) {
            window = await prisma.paymentWindow.create({
                data: {
                    month: monthStr,
                    windowDay: windowDay,
                    receivedAmount: 0, // Default
                    userId
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
    await prisma.payable.update({
        where: { id },
        data: { isPaid: !currentStatus }
    });
    revalidatePath('/payments');
}
