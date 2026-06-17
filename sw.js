/* SmartFin AI — Service Worker
   Offline-first strategy with cache versioning */

const CACHE_VERSION = 'smartfin-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/smartfin.css',
  '/js/app.js',
  '/js/lessons.js',
  '/js/gamification.js',
  '/js/ai.js',
  '/data/curriculum.json',
  '/data/specialized.json',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.hostname === 'api.openai.com') return; // Never cache AI calls

  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const clone = response.clone();
        const cacheName = STATIC_ASSETS.includes(url.pathname) ? STATIC_CACHE : DYNAMIC_CACHE;
        caches.open(cacheName).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => {
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
