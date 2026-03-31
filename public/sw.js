const CACHE_NAME = 'ns-app-cache-v2';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Offline Support - PWABuilder requires fetch caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request).catch(() => caches.match('/'));
      })
  );
});

// Background Sync - PWABuilder requires sync listener
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(Promise.resolve());
  }
});

// Periodic Background Sync - PWABuilder requires periodicsync listener
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(Promise.resolve());
  }
});

// Push Notifications - PWABuilder requires push and notificationclick listeners
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Nilesh Seeds', body: 'New notification!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
