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
