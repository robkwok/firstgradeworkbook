/* Cappy's Workbook service worker
   - Precaches the whole app (~170KB) so repeat visits load instantly and offline.
   - Fetch strategy: stale-while-revalidate — serve from cache, refresh in the
     background, so new deploys appear on the next visit with no version bump.
   - Bump CACHE only when the asset LIST changes (added/removed files). */

const CACHE = "cappy-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/data.js",
  "./js/capy.js",
  "./js/app.js",
  "./js/sync.js",
  "./js/writing.js",
  "./js/reading.js",
  "./js/math.js",
  "./fonts/fredoka-latin-var.woff2",
  "./fonts/andika-latin-400.woff2",
  "./fonts/andika-latin-700.woff2",
  "./fonts/patrick-hand-latin-400.woff2",
  "./icon.svg",
  "./apple-touch-icon.png",
  "./manifest.webmanifest"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      const refresh = fetch(e.request)
        .then(res => {
          if (res && res.ok) cache.put(e.request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || refresh;
    })
  );
});
