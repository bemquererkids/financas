'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function PWAUpdateManager() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const handleSW = async () => {
                const registration = await navigator.serviceWorker.register('/custom-sw.js');

                // Se já estiver esperando (waiting), avisa o usuário
                if (registration.waiting) {
                    showUpdateToast(registration.waiting);
                }

                // Monitora novas atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateToast(newWorker);
                            }
                        });
                    }
                });
            };

            handleSW().catch(console.error);

            // Recarrega a página quando o novo SW assumir o controle
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });
        }
    }, []);

    const showUpdateToast = (worker: ServiceWorker) => {
        toast.info("Nova versão disponível!", {
            description: "O app foi atualizado com novas funcionalidades. Clique para aplicar.",
            duration: Infinity, // Fica visível até clicar
            action: {
                label: "Atualizar",
                onClick: () => {
                    worker.postMessage({ type: 'SKIP_WAITING' });
                }
            }
        });
    };

    return null; // Componente sem UI visual direta (usa Toast)
}
