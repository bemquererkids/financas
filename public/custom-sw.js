
const CACHE_NAME = 'mywallet-cache-v1';

self.addEventListener('install', (event) => {
    // O novo SW instala, mas fica em "waiting" até o usuário confirmar a atualização
    // self.skipWaiting(); // Removido para permitir o prompt de atualização
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('activate', (event) => {
    // Reivindica controle dos clientes (abas) abertas
    event.waitUntil(clients.claim());
});

// LISTENER DE PUSH - O CORAÇÃO DA NOTIFICAÇÃO 🔔
self.addEventListener('push', function (event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body,
                icon: data.icon || '/icon-192x192.png',
                badge: '/icon-192x192.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: '1'
                }
            };
            event.waitUntil(
                self.registration.showNotification(data.title, options)
            );
        } catch (e) {
            console.error('Falha no push:', e);
        }
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
