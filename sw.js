/* Eenvoudige offline-cache voor Run Coach. Verhoog CACHE bij elke update. */
const CACHE = "runcoach-dave-v4-kim-polish-x-shift-c2-c3-logo3-p2-u2-m2-bugfix-schuifmelding-opslag-aftel-koppen-rec-smal-datum-5230-wk";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=7-c2-c3-p2-u2-m2-bugfix-schuifmelding-opslag-aftel-koppen-rec-smal-datum-5230-wk",
  "./app.js?v=7-c2-c3-p2-u2-m2-bugfix-schuifmelding-opslag-aftel-koppen-rec-smal-datum-5230-wk",
  "./coach.jpg",
  "./coach-logo.png",
  "./bartlopen-runcoach.png",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isPagina = e.request.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html");
  const isCode = /\.(?:js|css|json|webmanifest)$/.test(url.pathname);

  /* Pagina en code: eerst het netwerk, zodat de telefoon nooit op een oude
     versie van de app blijft hangen. */
  if (isPagina || isCode) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
    )
  );
});
