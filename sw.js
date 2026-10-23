// Gegenereerd door tools/maak_sw.py — niet met de hand aanpassen.
const CACHE = "nagelatelier-879f29bb7b";
const BESTANDEN = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'style.css?v=2', 'data.js?v=2', 'render.js?v=2', 'app.js?v=3', 'hand3d.js?v=2', '3d/hand.json?v=2', '3d/hand.bin?v=2', 'vendor/three.module.js', 'vendor/three.core.js', 'vendor/addons/controls/OrbitControls.js', 'vendor/addons/environments/RoomEnvironment.js'];
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
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
