/*
 * Simple service worker for TravelBot. It implements a basic
 * cache‑first strategy for the application shell (index.html,
 * JavaScript and CSS bundles) to enable offline access to the
 * interface. Dynamic API responses such as generated routes or
 * recommendations are not cached here; those are stored in
 * localStorage/IndexedDB by the application itself. If you wish
 * to enhance offline capabilities further, consider caching API
 * responses or images based on your requirements.
 */

const CACHE_NAME = 'travelbot-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
  // Note: Vite will handle versioning of JS/CSS assets; they
  // will be cached automatically when first requested.
];

self.addEventListener('install', (event: any) => {
  // Precache known static assets during the install phase.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event: any) => {
  // Clean up old caches if the cache name has changed.
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event: any) => {
  const { request } = event;
  // We only want to cache GET requests and ignore others.
  if (request.method !== 'GET') return;
  // Try cache first for same‑origin navigations and static assets.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      // Otherwise, perform network fetch and cache the response if it is
      // a same‑origin request to static assets (not API calls). We
      // deliberately avoid caching API responses to prevent stale data.
      return fetch(request).then((response) => {
        const url = new URL(request.url);
        if (url.origin === self.origin && !url.pathname.startsWith('/api')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});