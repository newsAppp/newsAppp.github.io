// Service Worker for Push Notifications
// This runs in the background and handles push events

const CACHE_NAME = 'newsflash-notifications-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    return self.clients.claim();
});

// Push event - receive and display notifications
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received:', event);

    let notificationData = {
        title: 'NewsFlash',
        body: 'You have a new notification',
        icon: '/logo192.png',
        badge: '/logo192.png',
        url: '/'
    };

    // Parse push data if available
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                title: data.title || notificationData.title,
                body: data.body || notificationData.body,
                icon: data.icon || notificationData.icon,
                badge: data.badge || notificationData.badge,
                url: data.url || notificationData.url,
                image: data.image, // Large image for rich notifications
                tag: data.tag || 'newsflash-notification',
                requireInteraction: data.requireInteraction || false,
                actions: data.actions || []
            };
        } catch (error) {
            console.error('[Service Worker] Error parsing push data:', error);
        }
    }

    const options = {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        image: notificationData.image,
        tag: notificationData.tag,
        requireInteraction: notificationData.requireInteraction,
        data: {
            url: notificationData.url,
            dateOfArrival: Date.now()
        },
        actions: notificationData.actions,
        vibrate: [200, 100, 200] // Vibration pattern for mobile
    };

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
    );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event);

    event.notification.close();

    // Handle action button clicks
    if (event.action) {
        console.log('[Service Worker] Action clicked:', event.action);
        // Handle specific actions if needed
        if (event.action === 'open') {
            event.waitUntil(
                clients.openWindow(event.notification.data.url)
            );
        }
        return;
    }

    // Default click - open the URL
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there's already a window open
                for (let client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
    console.log('[Service Worker] Notification closed:', event);
    // Optional: track notification dismissals
});

// Message event - communicate with the main app
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
