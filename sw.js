// Lapse — minimal service worker for offline app-shell caching.
// This only caches the static shell (HTML/CSS/JS). It does NOT cache
// chat messages — those always need a live connection to Supabase.

const CACHE_NAME = 'lapse-shell-v1';
const SHELL_FILES = [
  './lapse-app.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first for everything (chat needs to be live); fall back to
  // cache only when the network is unavailable, so the shell still loads.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
