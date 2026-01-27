'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBudgetsStatus } from './budget-actions';

interface NotificationItem {
    id: string;
    type: 'BILL' | 'BUDGET_RISK' | 'INFO';
    title: string;
    message: string;
    date: Date;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export async function getUnreadNotifications(): Promise<NotificationItem[]> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    const userId = session.user.id;
    const notifications: NotificationItem[] = [];

    // 1. Check Bills Due Soon (Next 5 Days)
    const today = new Date();
    const next5Days = new Date();
    next5Days.setDate(today.getDate() + 5);

    const upcomingBills = await prisma.payable.findMany({
        where: {
            paymentWindow: { userId },
            isPaid: false,
            dueDate: {
                gte: today,
                lte: next5Days
            }
        },
        take: 5
    });

    upcomingBills.forEach(bill => {
        const daysLeft = Math.ceil((bill.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        notifications.push({
            id: `bill-${bill.id}`,
            type: 'BILL',
            title: `Conta vencendo: ${bill.name}`,
            message: daysLeft === 0 ? 'Vence HOJE!' : `Vence em ${daysLeft} dias. Valor: R$ ${Number(bill.amount).toFixed(2)}`,
            date: bill.dueDate,
            severity: daysLeft <= 1 ? 'HIGH' : 'MEDIUM'
        });
    });

    // 2. Check Budget Overflows
    const budgets = await getBudgetsStatus();
    budgets.forEach(b => {
        if (b.percentage >= 100) {
            notifications.push({
                id: `budget-${b.id}`,
                type: 'BUDGET_RISK',
                title: `Orçamento Estourado: ${b.category}`,
                message: `Você usou ${b.percentage.toFixed(0)}% do limite definido de R$ ${b.limit}.`,
                date: new Date(),
                severity: 'HIGH'
            });
        } else if (b.percentage >= 90) {
            notifications.push({
                id: `budget-${b.id}`,
                type: 'BUDGET_RISK',
                title: `Atenção ao Orçamento: ${b.category}`,
                message: `Você usou ${b.percentage.toFixed(0)}% do limite.`,
                date: new Date(),
                severity: 'MEDIUM'
            });
        }
    });

    // Sort: High severity first, then date
    return notifications.sort((a, b) => {
        if (a.severity === 'HIGH' && b.severity !== 'HIGH') return -1;
        if (a.severity !== 'HIGH' && b.severity === 'HIGH') return 1;
        return b.date.getTime() - a.date.getTime();
    });
}

// ------------------------------------------------------------------
// PUSH NOTIFICATION HELPERS
// ------------------------------------------------------------------

export async function savePushSubscription(subscription: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const userId = session.user.id;

        // Ensure we handle endpoint uniqueness
        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                userId,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            create: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Save subscription error:", error);
        return { success: false, error: error.message };
    }
}

export async function sendTestNotification(userId: string) {
    // This requires web-push setup which might be missing configurations
    // For now, we stub it to prevent build errors, or implement basic logic if keys exist.

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const webPush = require('web-push');

    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        // Return success mock to not break UI if keys missing (dev mode)
        // Usually local dev doesn't have VAPID keys set up unless user did it.
        // We'll return false but a friendly message.
        return { success: false, message: "Chaves VAPID não configuradas (.env)" };
    }

    try {
        webPush.setVapidDetails(
            'mailto:admin@example.com',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );

        const subs = await prisma.pushSubscription.findMany({ where: { userId } });

        await Promise.all(subs.map(sub => {
            return webPush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                },
                JSON.stringify({
                    title: "Teste de Notificação",
                    body: "Se você recebeu isso, o sistema de alertas está funcionando!",
                    icon: "/icon.png"
                })
            ).catch((err: any) => {
                if (err.statusCode === 410) {
                    // Cleanup expired
                    prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(console.error);
                }
            });
        }));

        return { success: true };
    } catch (error: any) {
        console.error("Test notification error:", error);
        return { success: false, error: error.message };
    }
}

export async function checkDueBills() {
    await getUnreadNotifications();
    return { success: true, message: "Verificação concluída" };
}
