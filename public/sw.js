// TestMandi service worker.
//
// Caching strategy is deliberately conservative, because this is a
// marketplace with live prices, purchase status, and account data — caching
// the wrong thing could show a stale price or make a purchased test look
// locked. So:
//   - Static, content-hashed build assets (JS/CSS from Vite, fonts, icons):
//     cache-first. Safe to cache aggressively because Vite gives each build
//     a new filename when content changes — there's no "stale JS" risk.
//   - Everything under /api/: NEVER cached, always network. This is where
//     prices, purchases, and auth state live, and it must always be fresh.
//   - The HTML document itself: network-first, falling back to a cached
//     copy only if the network is genuinely unreachable (offline), so
//     online users always get the latest app shell.

const CACHE_NAME = "testmandi-static-v1";
const STATIC_EXTENSIONS = [".js", ".css", ".woff", ".woff2", ".ttf", ".png", ".jpg", ".jpeg", ".svg", ".webp"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Clean up any cache from a previous service worker version.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never intercept API calls — always go straight to the network.
  if (url.pathname.startsWith("/api/")) return;

  // Only handle same-origin GET requests beyond this point.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  const isStaticAsset = STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
    );
    return;
  }

  // The HTML document (and any other unclassified same-origin GET) —
  // network-first, cache as a fallback only for genuine offline access.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
