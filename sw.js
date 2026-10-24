// Gegenereerd door tools/maak_sw.py — niet met de hand aanpassen.
const CACHE = "nagelatelier-226014b9dd";
const BESTANDEN = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'style.css?v=7', 'data.js?v=2', 'render.js?v=3', 'kunst.js?v=4', 'stappen.js?v=8', 'generator.js?v=9', 'app.js?v=11', 'handfoto.js?v=2', 'foto/nagels.json?v=2'];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BESTANDEN)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith("nagelatelier-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("index.html")));
    return;
  }
  // foto's: na de eerste keer uit de cache
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => {
    if (res.ok && req.url.includes("/foto/")) { const k = res.clone(); caches.open(CACHE).then((c) => c.put(req, k)); }
    return res;
  })));
});
