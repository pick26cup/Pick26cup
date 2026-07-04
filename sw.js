// v6 — network-only, no caching, instant activation on all clients
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Always fetch from network — never serve from cache
self.addEventListener('fetch', e => {
  // Only intercept GET requests to our own origin
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).catch(() => {
      // Offline fallback: return a simple offline notice
      return new Response('<h2 style="font-family:sans-serif;color:#D4AF37;padding:2rem">Sin conexión — conecta internet y presiona 🔄</h2>',
        { headers: { 'Content-Type': 'text/html' } });
    })
  );
});
