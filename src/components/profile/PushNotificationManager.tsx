'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, CheckCircle2, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { savePushSubscription, sendTestNotification } from '@/app/actions/notification-actions';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushNotificationManager({ userId }: { userId: string }) {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);

            // Auto-Sync: Se já tem permissão, garante que está salvo no banco
            // Isso corrige casos onde o banco foi resetado ou a tabela criada depois
            if (Notification.permission === 'granted') {
                navigator.serviceWorker.ready.then(async (registration) => {
                    const sub = await registration.pushManager.getSubscription();
                    if (sub) {
                        savePushSubscription(sub.toJSON());
                    }
                });
            }
        }
    }, []);

    const subscribeToPush = async () => {
        if (!isSupported) return;

        setIsSubscribing(true);
        try {
            // 1. Pedir permissão ao navegador
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== 'granted') {
                toast.error("Permissão negada. Ative nas configurações do navegador.");
                return;
            }

            // 2. Obter Service Worker
            const registration = await navigator.serviceWorker.ready;

            // 3. Criar Inscrição Push
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                toast.error("Configuração VAPID ausente.");
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });

            // 4. Salvar no Backend
            const result = await savePushSubscription(subscription.toJSON());

            if (result.success) {
                toast.success("Notificações ativadas com sucesso!");
            } else {
                toast.error("Erro ao salvar inscrição.");
            }

        } catch (error) {
            console.error(error);
            toast.error("Erro ao ativar notificações.");
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleTestNotification = async () => {
        setIsTesting(true);
        try {
            const result = await sendTestNotification(userId);
            if (result.success) {
                toast.success("Enviado! Verifique suas notificações.");
            } else {
                toast.error(`Erro: ${result.message || result.error || "Falha desconhecida"}`);
            }
        } catch (error: any) {
            toast.error(`Falha técnica: ${error.message}`);
        } finally {
            setIsTesting(false);
        }
    };

    if (!isSupported) {
        return <div className="text-sm text-slate-500">Notificações não suportadas neste navegador.</div>;
    }

    if (permission === 'denied') {
        return (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
                <BellOff className="h-5 w-5" />
                <span className="text-sm">Notificações bloqueadas no navegador.</span>
            </div>
        );
    }

    if (permission === 'granted') {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                        <h4 className="text-sm font-medium text-emerald-400">Notificações Ativas</h4>
                        <p className="text-xs text-slate-400">Você receberá alertas de contas a vencer.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestNotification}
                    disabled={isTesting}
                    className="w-full"
                >
                    {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Enviar Teste Agora
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-900 transition-colors">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Não perca vencimentos</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                        Ative lembretes automáticos para contas que vencem em breve.
                    </p>
                </div>
                <Button
                    onClick={subscribeToPush}
                    disabled={isSubscribing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
                >
                    {isSubscribing ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Ativando...</>
                    ) : (
                        "Ativar Notificações"
                    )}
                </Button>
            </div>
        </div>
    );
}
