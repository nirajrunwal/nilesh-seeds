// Service Worker for PWA Offline Support & Push Notifications
const CACHE_NAME = 'nilesh-seeds-v1';
const urlsToCache = [
    '/',
    '/admin',
    '/farmer',
    '/manifest.json',
    '/globe.svg'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch from cache first, then network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                return fetch(event.request).then(
                    (response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Push Notification Support
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'New notification',
        icon: '/globe.svg',
        badge: '/globe.svg',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Nilesh Seeds', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Background Sync for offline messages
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

async function syncMessages() {
    // Get pending messages from IndexedDB
    const pendingMessages = await getPendingMessages();

    // Send each message
    for (const message of pendingMessages) {
        try {
            await fetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify(message),
                headers: { 'Content-Type': 'application/json' }
            });

            // Remove from pending queue
            await removePendingMessage(message.id);
        } catch (error) {
            console.log('Sync failed for message:', message.id);
        }
    }
}

// Helper functions for IndexedDB (placeholder)
async function getPendingMessages() {
    // Would retrieve from IndexedDB
    return [];
}

async function removePendingMessage(id) {
    // Would remove from IndexedDB
}
