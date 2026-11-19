// Beholding Jesus - Worship Team Service Worker
// Handles background Web Push notifications & offline notification clicks

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Worship Team Notification',
        body: event.data.text()
      };
    }
  }

  const title = data.title || 'Worship Team Update';
  const targetUrl = data.url && data.url.startsWith('/') && !data.url.startsWith('//')
    ? data.url
    : '/';

  const options = {
    body: data.body || 'You have a new update in the Worship Team app.',
    icon: '/pwa-192x192.png',
    badge: '/images/logo_emblem.png',
    tag: data.notification_id || data.tag || 'worship-push-' + Date.now(),
    data: {
      url: targetUrl,
      notification_id: data.notification_id || null,
      timestamp: Date.now()
    },
    vibrate: [100, 50, 100],
    requireInteraction: false
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rawUrl = event.notification.data && event.notification.data.url;
  const targetUrl = rawUrl && rawUrl.startsWith('/') && !rawUrl.startsWith('//') ? rawUrl : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if available
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
