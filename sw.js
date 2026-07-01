// v4 — clear all caches, network-only (no offline fallback)
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Pass everything through the network — no caching
self.addEventListener('fetch', e => {});
