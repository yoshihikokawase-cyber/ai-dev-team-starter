// QuickHabit Service Worker — Push notification handler
// Updated: force browser to pick up latest SW

self.addEventListener('install', () => {
  console.log('[SW] install: new SW installing');
  self.skipWaiting(); // 古いSWを即座に置き換える
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate: new SW activated');
  event.waitUntil(self.clients.claim()); // 既存タブをすぐにこのSWが制御
});

self.addEventListener('push', (event) => {
  console.log('[SW] push event received');

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
    console.log('[SW] push payload:', JSON.stringify(data));
  } catch (e) {
    console.error('[SW] payload parse error:', e);
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'TapHabit';
  const options = {
    body: data.body || '今日の習慣を記録しましょう',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: { url: data.url || '/' },
  };

  console.log('[SW] calling showNotification. title:', title, 'body:', options.body);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => { console.log('[SW] showNotification resolved'); })
      .catch((err) => { console.error('[SW] showNotification failed:', err); })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] notificationclick received');
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
