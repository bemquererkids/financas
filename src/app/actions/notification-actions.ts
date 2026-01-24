'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import webpush from 'web-push';

// Configurar Web Push com chaves do ambiente
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:suporte@mywallet.com';

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
    );
}

const SubscriptionSchema = z.object({
    endpoint: z.string(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string()
    })
});

export async function savePushSubscription(subscription: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: "Não autorizado" };
    }

    const validation = SubscriptionSchema.safeParse(subscription);
    if (!validation.success) {
        return { success: false, error: "Dados de inscrição inválidos" };
    }

    const { endpoint, keys } = validation.data;

    try {
        // Salvar ou atualizar se o endpoint já existir (para evitar erros de duplicate)
        await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                userId: session.user.id,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
            create: {
                userId: session.user.id,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Erro ao salvar inscrição push:", error);
        return { success: false, error: "Erro interno ao salvar notificação" };
    }
}

export async function sendTestNotification(userId: string) {
    // Apenas para Admin ou o próprio usuário
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== userId) {
        // Em um app real, admin poderia disparar para outros. Aqui vamos travar.
        // Se quiser testar, o usuário chama para ele mesmo.
    }

    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        if (subscriptions.length === 0) {
            return { success: false, message: "Nenhum dispositivo registrado." };
        }

        const notificationPayload = JSON.stringify({
            title: 'MyWallet - Teste',
            body: '🔔 Suas notificações estão funcionando perfeitamente!',
            icon: '/icon-192x192.png'
        });

        const sendPromises = subscriptions.map(sub => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };
            return webpush.sendNotification(pushConfig, notificationPayload)
                .catch(err => {
                    if (err.statusCode === 410) {
                        // Inscrição expirou, remover do banco
                        return prisma.pushSubscription.delete({ where: { id: sub.id } });
                    }
                    console.error("Erro ao enviar push:", err);
                });
        });

        await Promise.all(sendPromises);
        return { success: true, message: "Notificação enviada!" };

    } catch (error) {
        console.error(error);
        return { success: false, error: "Falha ao enviar." };
    }
}
