// Nagelatelier — 3D-hand: zelf geboetseerd model (3d/hand.bin), nagels live opgebouwd uit het design.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const H3 = { ok: false };
window.Hand3D = H3;

let renderer, scene, camera, controls, wrap, handGroup, skinMat, info;
let needs = true;
const nails = []; // per vinger (0-4): {mesh, gems:Group, key, texKey, geomKey}
let curHand = "R", curD = null, curSel = "all";

// ---------- opstarten ----------
async function init() {
  wrap = document.getElementById("stage3d");
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  wrap.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.55;

  camera = new THREE.PerspectiveCamera(28, 1, 0.01, 5);
  camera.position.set(0.025, 0.13, 0.43);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(-0.008, 0.075, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.enablePan = false;
  controls.minDistance = 0.11;
  controls.maxDistance = 0.62;
  controls.rotateSpeed = 0.75;
  controls.addEventListener("change", () => (needs = true));

  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(0.25, 0.32, 0.45);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -0.16, right: 0.16, top: 0.22, bottom: -0.12, near: 0.05, far: 1.2 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.0012;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd6cc, 1.1);
  rim.position.set(-0.4, 0.3, -0.35);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6cfc8, 0.6));

  // model
  const [meta, buf] = await Promise.all([
    fetch("3d/hand.json?v=2").then((r) => r.json()),
    fetch("3d/hand.bin?v=2").then((r) => r.arrayBuffer()),
  ]);
  info = meta;
  const nv = meta.nv, nt = meta.nt;
  const q = new Uint16Array(buf, 0, nv * 3);
  const nrm8 = new Int8Array(buf, nv * 6, nv * 3);
  const ao = new Uint8Array(buf, nv * 9, nv);
  let off = nv * 10; off += off % 2;
  const idx = new Uint16Array(buf, off, nt * 3);
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
  for (let i = 0; i < nv; i++) {
    for (let k = 0; k < 3; k++) {
      pos[i * 3 + k] = meta.lo[k] + (q[i * 3 + k] / 65535) * meta.ext[k];
      nor[i * 3 + k] = nrm8[i * 3 + k] / 127;
    }
    // AO met warme ondertoon in plooien (nep-subsurface)
    const a = Math.pow(ao[i] / 255, 0.9);
    col[i * 3] = 0.8 + 0.2 * a; col[i * 3 + 1] = 0.66 + 0.34 * a; col[i * 3 + 2] = 0.64 + 0.36 * a;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));

  skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xebc2a4, roughness: 0.5, vertexColors: true,
    sheen: 0.3, sheenColor: new THREE.Color(0xffc8bc), sheenRoughness: 0.5,
    specularIntensity: 0.45, transparent: true,
  });
  // onderarm laten vervagen
  skinMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying float vY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvY = position.y;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vY;")
      .replace("#include <dithering_fragment>", "#include <dithering_fragment>\ngl_FragColor.a *= smoothstep(-0.115, -0.045, vY);");
  };
  const skin = new THREE.Mesh(g, skinMat);
  skin.castShadow = true; skin.receiveShadow = true;
  handGroup = new THREE.Group();
  handGroup.add(skin);
  scene.add(handGroup);

  for (let f = 0; f < 5; f++) {
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.035, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.finger = f;
    const fr = meta.nails[f];
    const frame = new THREE.Group();
    const l = new THREE.Vector3(...fr.l), a = new THREE.Vector3(...fr.a), d = new THREE.Vector3(...fr.d);
    // nagel-lokaal: x → l, y → -a (punt is negatief), z → d; schaal s meter per eenheid
    const m = new THREE.Matrix4().makeBasis(l.clone().multiplyScalar(fr.s), a.clone().multiplyScalar(-fr.s), d.clone().multiplyScalar(fr.s));
    m.setPosition(new THREE.Vector3(...fr.o));
    frame.matrixAutoUpdate = false;
    frame.matrix.copy(m);
    frame.add(mesh);
    const gems = new THREE.Group();
    frame.add(gems);
    handGroup.add(frame);
    nails.push({ mesh, gems, frame, fr, geomKey: "", texKey: "", gemKey: "" });
  }

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();
  bindPointer();
  H3.ok = true;
  H3.view = (pos, tgt) => { camera.position.set(...pos); controls.target.set(...tgt); controls.update(); needs = true; };
  loop();
  if (window.__hand3dReady) window.__hand3dReady();
}

function resize() {
  const r = wrap.getBoundingClientRect();
  if (!r.width || !r.height) return;
  renderer.setSize(r.width, r.height, false);
  renderer.domElement.style.width = r.width + "px";
  renderer.domElement.style.height = r.height + "px";
  camera.aspect = r.width / r.height;
  // zorg dat de hand past in smalle/brede podia
  const asp = r.width / r.height;
  camera.fov = asp < 1 ? Math.min(44, 34 / Math.max(asp, 0.6) * 0.78) : 30;
  camera.updateProjectionMatrix();
  needs = true;
}

function loop() {
  requestAnimationFrame(loop);
  if (!H3.visible) return;
  if (controls.update()) needs = true;
  if (needs) { renderer.render(scene, camera); needs = false; }
}

// ---------- nagelgeometrie ----------
const _svgNS = "http://www.w3.org/2000/svg";
const _path = document.createElementNS(_svgNS, "path");
const _svg = document.createElementNS(_svgNS, "svg");
_svg.setAttribute("width", "0"); _svg.setAttribute("height", "0"); _svg.style.position = "absolute";
_svg.appendChild(_path); document.body.appendChild(_svg);

function outline(shape, L) {
  _path.setAttribute("d", nailPath(shape, L));
  const tot = _path.getTotalLength(), pts = [];
  for (let i = 0; i < 260; i++) { const p = _path.getPointAtLength((i / 260) * tot); pts.push([p.x, p.y]); }
  return pts;
}
function span(pts, y) {
  let xl = Infinity, xr = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    if ((y1 <= y && y2 >= y) || (y2 <= y && y1 >= y)) {
      const t = y2 === y1 ? 0 : (y - y1) / (y2 - y1), x = x1 + (x2 - x1) * t;
      xl = Math.min(xl, x); xr = Math.max(xr, x);
    }
  }
  return xl <= xr ? [xl, xr] : null;
}
// huidhoogte (in nagel-eenheden) uit het gemeten raster
function huid(fr, x, y) {
  const xs = fr.xs, ys = fr.ys, H = fr.h;
  const fx = Math.max(0, Math.min(xs.length - 1.001, (x - xs[0]) / (xs[1] - xs[0])));
  const fy = Math.max(0, Math.min(ys.length - 1.001, (y - ys[0]) / (ys[1] - ys[0])));
  const i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j;
  const v = (jj, ii) => H[jj][ii];
  const a = v(j, i), b = v(j, i + 1), c = v(j + 1, i), d = v(j + 1, i + 1);
  if ([a, b, c, d].some((q) => q == null)) return null;
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}
function bouwNagel(fr, shape, length) {
  const L = nailLen(shape, length), pts = outline(shape, L);
  const ymin = -L, ymax = 14, R = 56, C = 18;
  const yTop = -L - 12, HH = L + 34;
  // langsprofiel: lijn door de huid op de middellijn (y 10..-60), dan recht door
  let sx = 0, sy = 0, sxx = 0, sxy = 0, n = 0;
  for (let y = 10; y >= -60; y -= 10) { const h = huid(fr, 0, y); if (h == null) continue; sx += y; sy += h; sxx += y * y; sxy += y * h; n++; }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx), icpt = (sy - slope * sx) / n;
  const lift = 2.2;
  const zTop = (x, y) => {
    const yc = Math.max(y, -60);
    const hc = huid(fr, 0, yc) ?? 0, hx = huid(fr, x, yc);
    const trans = hx == null ? -((x / 50) ** 2) * 9 : hx - hc; // dwarsbolling volgt de vinger
    let z = icpt + slope * y + trans * 0.92 + lift;
    const hs = huid(fr, x, y);
    if (hs != null) z = Math.max(z, hs + 1.0);
    if (y > 2) z -= (y - 2) * 0.12; // nagelriem onder de huid
    return z;
  };
  const posA = [], uvA = [], idxA = [];
  const rows = [];
  for (let r = 0; r <= R; r++) {
    const y = ymin + 0.4 + ((ymax - 0.4 - ymin - 0.4) * r) / R;
    const sp = span(pts, y);
    if (!sp) continue;
    rows.push([y, sp]);
  }
  const top = [], bot = [];
  rows.forEach(([y, [xl, xr]]) => {
    const rt = [], rb = [];
    for (let c = 0; c <= C; c++) {
      const x = xl + ((xr - xl) * c) / C;
      const z = zTop(x, y);
      const uv = [(x + 50) / 100, 1 - (y - yTop) / HH];
      rt.push(posA.length / 3); posA.push(x, y, z); uvA.push(...uv);
      rb.push(posA.length / 3); posA.push(x, y, z - 3.2); uvA.push(...uv);
    }
    top.push(rt); bot.push(rb);
  });
  for (let r = 0; r < top.length - 1; r++) for (let c = 0; c < C; c++) {
    const a = top[r][c], b = top[r][c + 1], d = top[r + 1][c], e = top[r + 1][c + 1];
    idxA.push(a, b, d, b, e, d);
    const a2 = bot[r][c], b2 = bot[r][c + 1], d2 = bot[r + 1][c], e2 = bot[r + 1][c + 1];
    idxA.push(a2, d2, b2, b2, d2, e2);
  }
  // rand (dikte): rondom langs de buitenste rijen en kolommen
  const last = top.length - 1, ring = [];
  for (let c = 0; c <= C; c++) ring.push([top[0][c], bot[0][c]]);
  for (let r = 1; r <= last; r++) ring.push([top[r][C], bot[r][C]]);
  for (let c = C - 1; c >= 0; c--) ring.push([top[last][c], bot[last][c]]);
  for (let r = last - 1; r >= 1; r--) ring.push([top[r][0], bot[r][0]]);
  // eigen hoekpunten voor de rand, zodat de normalen van boven- en zijvlak niet mengen
  const kopie = (vi) => { const n = posA.length / 3; posA.push(posA[vi * 3], posA[vi * 3 + 1], posA[vi * 3 + 2]); uvA.push(uvA[vi * 2], uvA[vi * 2 + 1]); return n; };
  const rr = ring.map(([t, b]) => [kopie(t), kopie(b)]);
  for (let k = 0; k < rr.length; k++) {
    const [t1, b1] = rr[k], [t2, b2] = rr[(k + 1) % rr.length];
    idxA.push(t1, b1, t2, t2, b1, b2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(posA, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvA, 2));
  g.setIndex(idxA);
  g.computeVertexNormals();
  g.userData = { L, yTop, HH, zTop };
  return g;
}

// ---------- nageltextuur uit het 2D-design ----------
const GEM = new Set(["steentje", "parel"]);
function textuurSVG(n, shape, length, seed) {
  const L = nailLen(shape, length), yTop = -L - 12, HH = L + 34, defs = [];
  const flat = { ...n, deco: (n.deco || []).filter((d) => !GEM.has(d.t)) };
  const tech = techSVG(flat, L, "tx", seed, defs);
  const deco = flat.deco.map((d, j) => decoSVG(d, "txd" + j, defs)).join("");
  const W = 256, Hp = Math.round((256 * HH) / 100);
  return { W, Hp, svg: `<svg xmlns="${_svgNS}" width="${W}" height="${Hp}" viewBox="-50 ${yTop} 100 ${HH}"><defs>${globalDefs()}${defs.join("")}</defs>${tech}${deco}</svg>` };
}
function maakTextuur(nl, n, shape, length, seed) {
  const { W, Hp, svg } = textuurSVG(n, shape, length, seed);
  const key = svg;
  if (nl.texKey === key) return;
  nl.texKey = key;
  const img = new Image();
  img.onload = () => {
    if (nl.texKey !== key) return;
    const cv = document.createElement("canvas");
    cv.width = W * 2; cv.height = Hp * 2;
    const cx = cv.getContext("2d");
    cx.drawImage(img, 0, 0, cv.width, cv.height);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    const m = nl.mesh.material;
    if (m.map) m.map.dispose();
    m.map = t; m.needsUpdate = true;
    needs = true;
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

// ---------- echte steentjes en parels ----------
const gemGeo = (() => {
  const prof = [[0, -0.55], [0.5, -0.05], [0.5, 0.0], [0.33, 0.22], [0, 0.24]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(prof, 16); g.computeVertexNormals(); return g;
})();
const pearlGeo = new THREE.SphereGeometry(0.5, 32, 20);
function bouwJuweeltjes(nl, n, geo) {
  const key = JSON.stringify((n.deco || []).filter((d) => GEM.has(d.t))) + geo.uuid;
  if (nl.gemKey === key) return;
  nl.gemKey = key;
  nl.gems.clear();
  (n.deco || []).forEach((d) => {
    if (!GEM.has(d.t)) return;
    const z = geo.userData.zTop(d.x, d.y);
    const size = d.s;
    let mesh;
    const hx = d.c === "goud" ? "#E8C45E" : d.c === "rose" ? "#E8B09A" : d.c === "zilver" ? "#D9DDE2" : d.c;
    if (d.t === "parel") {
      mesh = new THREE.Mesh(pearlGeo, new THREE.MeshPhysicalMaterial({ color: hx, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1, iridescence: 0.7, iridescenceIOR: 1.6, sheen: 0.4, sheenColor: new THREE.Color("#ffd9e6") }));
      mesh.scale.set(size, size, size * 0.85);
      mesh.position.set(d.x, d.y, z + size * 0.32);
    } else {
      const wit = lum(hx) > 0.85;
      mesh = new THREE.Mesh(gemGeo, new THREE.MeshPhysicalMaterial({ color: wit ? "#F4F8FF" : hx, metalness: 0.15, roughness: 0.02, clearcoat: 1, iridescence: wit ? 0.6 : 0.2, flatShading: true, envMapIntensity: 2.4, specularIntensity: 1 }));
      mesh.rotation.x = Math.PI / 2;
      mesh.scale.set(size, size, size);
      mesh.position.set(d.x, d.y, z + size * 0.05);
    }
    mesh.castShadow = true;
    nl.gems.add(mesh);
  });
}

// ---------- bijwerken vanuit de app ----------
H3.update = (D, hand, sel) => {
  if (!H3.ok) return;
  curD = D; curHand = hand; curSel = sel;
  handGroup.scale.x = hand === "L" ? -1 : 1;
  skinMat.color.set(mix(HUID[D.skin] || HUID[1], "#ffffff", 0.12));
  for (let f = 0; f < 5; f++) {
    const i = (hand === "R" ? 0 : 5) + f, n = D.nails[i], nl = nails[f];
    const gk = D.shape + D.length;
    if (nl.geomKey !== gk) {
      nl.mesh.geometry.dispose();
      nl.mesh.geometry = bouwNagel(nl.fr, D.shape, D.length);
      nl.geomKey = gk; nl.gemKey = "";
    }
    maakTextuur(nl, n, D.shape, D.length, nailSeed(i));
    const m = nl.mesh.material;
    const chroom = n.fx === "chroom", mat = n.fin === "mat";
    m.metalness = chroom ? 0.85 : n.fx === "glitter" ? 0.25 : n.fx === "cateye" ? 0.35 : 0;
    m.roughness = mat ? 0.78 : chroom ? 0.16 : 0.3;
    m.clearcoat = mat ? 0 : 1;
    m.emissive.set(sel === i ? 0xb4636f : 0x000000);
    m.emissiveIntensity = sel === i ? 0.22 : 0;
    nl.mesh.userData.i = i;
    bouwJuweeltjes(nl, n, nl.mesh.geometry);
  }
  needs = true;
};
H3.show = (on) => {
  H3.visible = on;
  if (wrap) wrap.style.display = on ? "block" : "none";
  if (on) { resize(); needs = true; }
};
// foto van de huidige 3D-weergave (zelfde hoek als op het scherm)
H3.snapshot = (W, H) => {
  const r = wrap.getBoundingClientRect(), pr = renderer.getPixelRatio();
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  camera.aspect = W / H; camera.fov = 33; camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL("image/png");
  renderer.setPixelRatio(pr); resize();
  renderer.render(scene, camera);
  return url;
};
H3.reset = () => {
  camera.position.set(0.025, 0.13, 0.43);
  controls.target.set(-0.008, 0.075, 0);
  needs = true;
};

// ---------- tikken en neerzetten ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function raak(cx, cy) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects([handGroup], true);
  if (!hits.length) return null;
  const h = hits[0];
  let o = h.object;
  while (o && o.userData.i == null && o.parent) o = o.parent;
  if (o && o.userData.i != null && h.uv && o === h.object) {
    const g = o.geometry.userData;
    return { i: o.userData.i, x: h.uv.x * 100 - 50, y: g.yTop + (1 - h.uv.y) * g.HH };
  }
  // juweeltje → nagel van die vinger
  for (const nl of nails) if (nl.gems.children.includes(h.object)) return { i: nl.mesh.userData.i, x: h.object.position.x, y: h.object.position.y };
  // vinger geraakt vlak bij een nagel → die nagel (vergevingsgezind tikken en neerzetten)
  let best = null;
  for (const nl of nails) {
    const g = nl.mesh.geometry.userData;
    if (!g || !g.L) continue;
    const p = nl.frame.worldToLocal(h.point.clone());
    if (Math.abs(p.x) < 95 && p.y > -g.L - 50 && p.y < 150) {
      const dist = Math.hypot(p.x, Math.max(0, p.y - 10));
      if (!best || dist < best.dist) best = { dist, i: nl.mesh.userData.i, x: 0, y: -g.L * 0.42 };
    }
  }
  if (best) return { i: best.i, x: best.x, y: best.y };
  return { i: null };
}
H3.pick = raak;
function bindPointer() {
  const el = renderer.domElement;
  el.style.touchAction = "none";
  let down = null;
  el.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: Date.now(), n: (down?.n || 0) + 1 }; });
  el.addEventListener("pointerup", (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (moved < 8 && Date.now() - down.t < 450) {
      const hit = raak(e.clientX, e.clientY);
      if (window.hand3dTap) window.hand3dTap(hit && hit.i != null ? hit.i : null);
    }
    down = null;
  });
}

init();
