const CACHE = 'pixelpet-v2';

const BASE = '/pixel-pet';

const APP_ASSETS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/css/styles.css`,
  `${BASE}/manifest.json`,
  `${BASE}/js/main.js`,
  `${BASE}/js/sprites.js`,
  `${BASE}/js/state.js`,
  `${BASE}/js/render.js`,
  `${BASE}/js/animate.js`,
  `${BASE}/js/timer.js`,
  `${BASE}/js/achievements.js`,
  `${BASE}/icons/icon.svg`,
  `${BASE}/icons/icon-192.png`,
  `${BASE}/icons/icon-512.png`,
];

// Install: pre-cache all app assets (skip any that 404)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      for (const url of APP_ASSETS) {
        try { await cache.add(url); } catch (_) { /* asset missing — skip */ }
      }
      return self.skipWaiting();
    })
  );
});

// Activate: delete stale caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
//   Google Fonts  → network-first, cache fallback
//   Everything else → cache-first, network fallback + update cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fromNetwork = fetch(e.request).then(r => {
        if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      });
      return cached || fromNetwork;
    })
  );
});
