'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getPaymentWindows(monthStr?: string) {
    // monthStr format: "YYYY-MM"
    const targetMonth = monthStr || new Date().toISOString().slice(0, 7);

    // Ensure windows exist for this month
    // If not, we could conceptually create them or just return empty structure to be filled
    // For simplicity, we query what exists and fill gaps in memory or create on fly

    // Let's get all payables for this month
    const payables = await prisma.payable.findMany({
        where: {
            paymentWindow: {
                month: targetMonth
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
                dueDate: p.dueDate,
                isPaid: p.isPaid
            });
            result.windows[day].total += Number(p.amount);
        }
    });

    return result;
}

export async function addPayable(formData: FormData) {
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
        // Find or Create Payment Window
        let window = await prisma.paymentWindow.findFirst({
            where: {
                month: monthStr,
                windowDay: windowDay
            }
        });

        if (!window) {
            window = await prisma.paymentWindow.create({
                data: {
                    month: monthStr,
                    windowDay: windowDay,
                    receivedAmount: 0 // Default
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
