const STATIC_CACHE = 'worksphere-static-v3';
const API_CACHE = 'worksphere-api-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't intercept non-GET requests or cross-origin POSTs
  if (request.method !== 'GET') return;

  // Supabase or external APIs: Network First with timeout
  if (url.origin.includes('supabase.co')) {
    event.respondWith(networkFirst(request, API_CACHE, 8000));
    return;
  }

  // Same origin assets: Cache First with Network Fallback
  if (url.origin === location.origin) {
    if (request.destination === 'document') {
      event.respondWith(networkFirst(request, STATIC_CACHE, 3000));
      return;
    }

    if (
      request.destination === 'image' ||
      request.destination === 'font' ||
      url.pathname.startsWith('/icons/')
    ) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
      return;
    }

    event.respondWith(networkFirst(request, STATIC_CACHE, 4000));
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName, timeout = 4000) {
  const cache = await caches.open(cacheName);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);

    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fallback to offline document if navigating
    if (request.destination === 'document') {
      const fallback = await cache.match('/index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}
