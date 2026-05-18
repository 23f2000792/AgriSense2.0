const CACHE_NAME = 'agrisense-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data.json',
  '/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Try to fetch from network, fallback to cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
