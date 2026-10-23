// Nagelatelier — fotohand: vooraf in Blender/Cycles gerenderde hand + live opgebouwde nagels.
// Per aanzicht en vorm/lengte bevat foto/nagels/<aanzicht>_<vorm>_<lengte>.png drie tegels:
//   1: u (16 bit) + v hoog   2: v laag, dekking, vinger   3: licht, glans, matte glans
(() => {
  const HF = (window.HandFoto = { ok: false, visible: false });
  const W = 1080, H = 1350;
  const AANZICHTEN = [["boven", "Bovenaf"], ["schuin", "Schuin"], ["toppen", "Toppen"]];
  HF.AANZICHTEN = AANZICHTEN;
  let meta = null, wrap, cv, ctx, werk, wctx, token = 0, laatste = null;

  // ---------- laden ----------
  const cache = new Map();
  function img(url) {
    if (!cache.has(url)) cache.set(url, new Promise((res, rej) => { const i = new Image(); i.decoding = "async"; i.onload = () => res(i); i.onerror = rej; i.src = url; }));
    return cache.get(url);
  }
  const pxCache = new Map();
  function pixels(url) {
    if (!pxCache.has(url)) pxCache.set(url, img(url).then((i) => {
      const c = document.createElement("canvas"); c.width = i.naturalWidth; c.height = i.naturalHeight;
      const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(i, 0, 0);
      return x.getImageData(0, 0, c.width, c.height);
    }));
    return pxCache.get(url);
  }
  // nagelontwerp als textuur (zelfde tekenwerk als de 2D-weergave)
  const texCache = new Map();
  function textuur(n, shape, length, seed) {
    const L = nailLen(shape, length), yTop = -L - 12, HH = L + 34, defs = [];
    const tech = techSVG(n, L, "tx", seed, defs);
    const deco = (n.deco || []).map((d, j) => decoSVG(d, "txd" + j, defs)).join("");
    const tw = 256, th = Math.round((256 * HH) / 100);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="-50 ${yTop} 100 ${HH}"><defs>${globalDefs()}${defs.join("")}</defs>${tech}${deco}</svg>`;
    if (texCache.has(svg)) return texCache.get(svg);
    const p = new Promise((res) => {
      const i = new Image();
      i.onload = () => {
        const c = document.createElement("canvas"); c.width = tw; c.height = th;
        const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(i, 0, 0, tw, th);
        res({ d: x.getImageData(0, 0, tw, th).data, w: tw, h: th });
      };
      i.onerror = () => res(null);
      i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
    texCache.set(svg, p);
    if (texCache.size > 120) texCache.delete(texCache.keys().next().value);
    return p;
  }

  // kleurruimte
  const S2L = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const c = i / 255; S2L[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  const L2S = new Uint8ClampedArray(4097);
  for (let i = 0; i <= 4096; i++) { const c = i / 4096; L2S[i] = Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)); }
  const toS = (x) => L2S[x >= 1 ? 4096 : x <= 0 ? 0 : (x * 4096) | 0];
  const DEC = (mx) => { const t = new Float32Array(256); for (let i = 0; i < 256; i++) t[i] = (i / 255) ** 2 * mx; return t; };
  const D_SHADE = DEC(1.6), D_SPEC = DEC(6.0), D_SPECM = DEC(3.0);

  // ---------- samenstellen ----------
  async function stel(D, hand, sel, view) {
    const my = ++token;
    const key = `${view}_${D.shape}_${D.length}`, it = meta[key];
    if (!it) return;
    const off = hand === "L" ? 5 : 0;
    const [base, tile, ...tex] = await Promise.all([
      img(`foto/base_${view}_${D.skin}.webp?v=2`),
      pixels(`foto/nagels/${key}.png?v=2`),
      ...[0, 1, 2, 3, 4].map((f) => textuur(D.nails[off + f], D.shape, D.length, nailSeed(off + f))),
    ]);
    if (my !== token) return;
    const w = it.w, h = it.h, X0 = Math.round(it.kader[0] * W), Y0 = Math.round((1 - it.kader[3]) * H);
    wctx.clearRect(0, 0, W, H);
    wctx.drawImage(base, 0, 0, W, H);
    const reg = wctx.getImageData(X0, Y0, w, h), o = reg.data, t = tile.data, tw3 = tile.width;
    const nails = [0, 1, 2, 3, 4].map((f) => D.nails[off + f]);
    const modus = nails.map((n) => (n.fx === "chroom" ? 2 : n.fin === "mat" ? 1 : 0));
    const extra = nails.map((n) => (n.fx === "glitter" || n.fx === "cateye" ? 1.25 : 1));
    const selF = sel === "all" ? -1 : sel - off;
    const selMask = selF >= 0 && selF < 5 ? new Uint8Array(w * h) : null;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p1 = (y * tw3 + x) * 4, p2 = p1 + w * 4, p3 = p2 + w * 4;
        const cov = t[p2 + 1];
        if (cov < 3) continue;
        const f = ((t[p2 + 2] - 20) / 40) | 0;
        const tx = tex[f];
        if (!tx) continue;
        const u = ((t[p1] << 8) | t[p1 + 1]) / 65535, v = ((t[p1 + 2] << 8) | t[p2]) / 65535;
        // bilineair bemonsteren
        const fx = u * (tx.w - 1), fy = v * (tx.h - 1), ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy;
        const q00 = (iy * tx.w + ix) * 4, q10 = q00 + 4, q01 = q00 + tx.w * 4, q11 = q01 + 4, td = tx.d;
        const shade = D_SHADE[t[p3]], spec = D_SPEC[t[p3 + 1]], specm = D_SPECM[t[p3 + 2]];
        const md = modus[f];
        const oi = (y * w + x) * 4, a = cov / 255, ab = o[oi + 3] / 255;
        for (let k = 0; k < 3; k++) {
          const s = (S2L[td[q00 + k]] * (1 - ax) + S2L[td[q10 + k]] * ax) * (1 - ay) + (S2L[td[q01 + k]] * (1 - ax) + S2L[td[q11 + k]] * ax) * ay;
          let lin;
          if (md === 0) lin = s * shade + spec * 0.85 * extra[f];
          else if (md === 1) lin = s * shade * 0.97 + specm * 0.32;
          else lin = s * (0.78 * shade + 0.9 * spec + 0.35 * specm) + spec * 0.35;
          // soft schouder tegen harde witte vlekken
          if (lin > 0.8) lin = 0.8 + (1 - Math.exp(-(lin - 0.8) * 2.2)) * 0.2 / 1;
          const nc = toS(lin);
          const aOut = a + ab * (1 - a);
          o[oi + k] = aOut > 0 ? (nc * a + o[oi + k] * ab * (1 - a)) / aOut : 0;
        }
        o[oi + 3] = Math.round((a + ab * (1 - a)) * 255);
        if (selMask && f === selF && cov > 110) selMask[y * w + x] = 1;
      }
    }
    if (selMask) rand(o, selMask, w, h);
    wctx.putImageData(reg, X0, Y0);
    // tonen (linkerhand = gespiegeld)
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (hand === "L") { ctx.translate(W, 0); ctx.scale(-1, 1); }
    ctx.drawImage(werk, 0, 0);
    ctx.restore();
    laatste = { it, tile, w, h, X0, Y0, hand, off, D };
  }
  // dunne accentrand rond de gekozen nagel
  function rand(o, m, w, h) {
    const r = 4, tmp = new Uint8Array(w * h), dil = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) { let run = -1e9; for (let x = 0; x < w; x++) { if (m[y * w + x]) run = x; tmp[y * w + x] = x - run <= r ? 1 : 0; } run = 1e9; for (let x = w - 1; x >= 0; x--) { if (m[y * w + x]) run = x; if (run - x <= r) tmp[y * w + x] = 1; } }
    for (let x = 0; x < w; x++) { let run = -1e9; for (let y = 0; y < h; y++) { if (tmp[y * w + x]) run = y; dil[y * w + x] = y - run <= r ? 1 : 0; } run = 1e9; for (let y = h - 1; y >= 0; y--) { if (tmp[y * w + x]) run = y; if (run - y <= r) dil[y * w + x] = 1; } }
    for (let i = 0; i < w * h; i++) if (dil[i] && !m[i]) {
      const oi = i * 4, a = 0.9, ab = o[oi + 3] / 255, aOut = a + ab * (1 - a);
      o[oi] = (180 * a + o[oi] * ab * (1 - a)) / aOut; o[oi + 1] = (99 * a + o[oi + 1] * ab * (1 - a)) / aOut; o[oi + 2] = (111 * a + o[oi + 2] * ab * (1 - a)) / aOut;
      o[oi + 3] = aOut * 255;
    }
  }

  // ---------- aanwijzen ----------
  HF.pick = (cx, cy) => {
    if (!laatste) return null;
    const r = cv.getBoundingClientRect();
    let px = ((cx - r.left) / r.width) * W, py = ((cy - r.top) / r.height) * H;
    if (laatste.hand === "L") px = W - px;
    const { tile, w, h, X0, Y0, off, D } = laatste, t = tile.data, tw3 = tile.width;
    const lx = Math.round(px - X0), ly = Math.round(py - Y0);
    const R = Math.round(26 * (W / r.width) / 2.6);
    let best = null;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = lx + dx, y = ly + dy;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const p1 = (y * tw3 + x) * 4, p2 = p1 + w * 4;
      if (t[p2 + 1] < 120) continue;
      const d2 = dx * dx + dy * dy;
      if (!best || d2 < best.d2) best = { d2, p1, p2 };
    }
    if (!best) return { i: null };
    const f = ((t[best.p2 + 2] - 20) / 40) | 0;
    const u = ((t[best.p1] << 8) | t[best.p1 + 1]) / 65535, v = ((t[best.p1 + 2] << 8) | t[best.p2]) / 65535;
    const L = nailLen(D.shape, D.length);
    return { i: off + f, x: Math.max(-38, Math.min(38, u * 100 - 50)), y: Math.max(-L + 14, Math.min(-14, -L - 12 + v * (L + 34))) };
  };

  // ---------- openbaar ----------
  HF.update = (D, hand, sel, view) => { if (HF.ok) stel(D, hand, sel, view || "boven"); };
  HF.show = (on) => { HF.visible = on; if (wrap) wrap.style.display = on ? "flex" : "none"; if (on) maat(); };
  HF.snapshot = () => cv.toDataURL("image/png");
  function maat() {
    const r = wrap.getBoundingClientRect();
    if (!r.width) return;
    const s = Math.min(r.width / W, r.height / H);
    cv.style.width = W * s + "px"; cv.style.height = H * s + "px";
  }
  async function init() {
    wrap = document.getElementById("stagefoto");
    cv = document.createElement("canvas"); cv.width = W; cv.height = H; ctx = cv.getContext("2d");
    werk = document.createElement("canvas"); werk.width = W; werk.height = H; wctx = werk.getContext("2d", { willReadFrequently: true });
    wrap.appendChild(cv);
    new ResizeObserver(maat).observe(wrap);
    // tikken
    let down = null;
    cv.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: Date.now() }; });
    cv.addEventListener("pointerup", (e) => {
      if (!down) return;
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 10 && Date.now() - down.t < 500) {
        const h = HF.pick(e.clientX, e.clientY);
        if (window.fotoTap) window.fotoTap(h && h.i != null ? h.i : null);
      }
      down = null;
    });
    try {
      meta = await fetch("foto/nagels.json?v=2").then((r) => r.json());
      HF.ok = true;
      if (window.__fotoReady) window.__fotoReady();
    } catch (e) { /* valt terug op 2D-hand */ }
  }
  init();
})();
