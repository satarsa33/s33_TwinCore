/* S33 - Twin Core – service worker
   Strategia: i file dell'app sono salvati alla prima visita; poi si risponde dalla cache
   e, se c'è rete, la cache si aggiorna in silenzio (la versione nuova compare all'apertura successiva).
   Per forzare un rinnovo completo, cambia il numero di VERSIONE qui sotto. */
const VERSIONE = "1.0.1";
const CACHE = "twin-core-" + VERSIONE;
const FILE = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png",
  "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png", "./icons/favicon-32.png"
];

self.addEventListener("install", e => {
  /* un file mancante non deve far fallire l'installazione: si salva ciò che c'è, ognuno per conto suo */
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(FILE.map(f => c.add(f)))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(n => n.startsWith("twin-core-") && n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const hit = await c.match(r, { ignoreSearch: true });
      const rete = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => null);
      if (hit) { e.waitUntil(rete); return hit; }
      return (await rete) || (r.mode === "navigate" ? c.match("./index.html") : Response.error());
    })
  );
});
