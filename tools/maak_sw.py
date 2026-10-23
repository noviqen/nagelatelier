"""Schrijft sw.js (offline-cache). Draai na elke wijziging, na het ophogen van ?v= in index.html:  python3 tools/maak_sw.py"""
import hashlib, pathlib, re

hier = pathlib.Path(__file__).resolve().parent.parent
index = (hier / "index.html").read_text()
bestanden = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]
bestanden += re.findall(r'(?:href|src)="([^"#:]+\?v=\d+)"', index)
bestanden += ["foto/nagels.json?v=2"]
bestanden = list(dict.fromkeys(bestanden))
h = hashlib.sha1()
for b in bestanden:
    pad = hier / ("index.html" if b == "./" else b.split("?")[0])
    h.update(b.encode()); h.update(pad.read_bytes())
versie = h.hexdigest()[:10]
(hier / "sw.js").write_text(f"""// Gegenereerd door tools/maak_sw.py — niet met de hand aanpassen.
const CACHE = "nagelatelier-{versie}";
const BESTANDEN = {bestanden!r};
self.addEventListener("install", (e) => {{
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BESTANDEN)).then(() => self.skipWaiting()));
}});
self.addEventListener("activate", (e) => {{
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith("nagelatelier-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
}});
self.addEventListener("fetch", (e) => {{
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {{
    e.respondWith(fetch(req).catch(() => caches.match("index.html")));
    return;
  }}
  // foto's: na de eerste keer uit de cache
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => {{
    if (res.ok && req.url.includes("/foto/")) {{ const k = res.clone(); caches.open(CACHE).then((c) => c.put(req, k)); }}
    return res;
  }})));
}});
""")
print("sw.js", versie, len(bestanden), "bestanden")
