// Nagelatelier — tekenwerk: nagels, effecten, versieringen, hand en tips (alles SVG).

// ---------- kleur ----------
function hexRgb(h) {
  h = String(h).replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbHex(r, g, b) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}
function mix(a, b, t) {
  const A = hexRgb(a), B = hexRgb(b);
  return rgbHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}
const light = (c, t) => mix(c, "#ffffff", t);
const dark = (c, t) => mix(c, "#000000", t);
function lum(c) {
  const [r, g, b] = hexRgb(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const f1 = (v) => (Math.round(v * 10) / 10).toString();

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- nagelvorm ----------
// Lokaal stelsel: breedte 100 (x -50..50), nagelriem op y=0, punt op y=-L.
const BED = 112;
const EXT = { kort: 20, middel: 64, lang: 114 };
function nailLen(shape, length) {
  let e = EXT[length] ?? 64;
  if (shape === "stiletto" || shape === "almond") e += length === "kort" ? 16 : 10;
  return BED + e;
}
function nailPath(shape, L) {
  const b = "M50,0 C50,10 28,14 0,14 C-28,14 -50,10 -50,0 ";
  const y = (v) => f1(-v);
  switch (shape) {
    case "squoval":
      return b + `L-50,${y(L - 22)} C-50,${y(L - 6)} -42,${y(L)} -27,${y(L)} L27,${y(L)} C42,${y(L)} 50,${y(L - 6)} 50,${y(L - 22)} Z`;
    case "round":
      return b + `L-50,${y(L - 46)} C-50,${y(L - 12)} -27,${y(L)} 0,${y(L)} C27,${y(L)} 50,${y(L - 12)} 50,${y(L - 46)} Z`;
    case "oval":
      return b + `L-49.5,${y(L * 0.5)} C-49,${y(L - 8)} -24,${y(L)} 0,${y(L)} C24,${y(L)} 49,${y(L - 8)} 49.5,${y(L * 0.5)} Z`;
    case "almond":
      return b + `L-49,${y(L * 0.42)} C-47,${y(L * 0.8)} -15,${y(L - 1)} 0,${y(L)} C15,${y(L - 1)} 47,${y(L * 0.8)} 49,${y(L * 0.42)} Z`;
    case "coffin":
      return b + `L-49.5,${y(L * 0.36)} L-31,${y(L - 5)} Q-30,${y(L)} -25,${y(L)} L25,${y(L)} Q30,${y(L)} 31,${y(L - 5)} L49.5,${y(L * 0.36)} Z`;
    case "stiletto":
      return b + `L-49.5,${y(L * 0.3)} C-46,${y(L * 0.68)} -9,${y(L * 0.93)} 0,${y(L)} C9,${y(L * 0.93)} 46,${y(L * 0.68)} 49.5,${y(L * 0.3)} Z`;
  }
  return nailPath("oval", L);
}

// ---------- gedeelde defs (één keer in het document, en in elke export) ----------
function globalDefs() {
  const metal = (id, st) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${st.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  return `
  ${metal("m-goud", [[0, "#FFF3C2"], [0.28, "#E8C45E"], [0.52, "#B58628"], [0.74, "#F3D886"], [1, "#A3771F"]])}
  ${metal("m-rose", [[0, "#FFE6DA"], [0.28, "#E8B09A"], [0.52, "#B77561"], [0.74, "#F3C9B6"], [1, "#A6624E"]])}
  ${metal("m-zilver", [[0, "#FFFFFF"], [0.28, "#D9DDE2"], [0.52, "#99A0A9"], [0.74, "#F1F3F5"], [1, "#8A919A"]])}
  <linearGradient id="hl" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff" stop-opacity=".62"/>
    <stop offset=".6" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="depth" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".07"/></linearGradient>
  <filter id="ds" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="3" stdDeviation="2.6" flood-color="#2b1a1a" flood-opacity=".32"/></filter>
  <filter id="nsh" x="-30%" y="-20%" width="160%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="bl1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <filter id="bl3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="bl6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>`;
}

// ---------- effecten ----------
function techSVG(n, L, id, seed, defs) {
  const c = n.c, c2 = n.c2 || "#FFFFFF";
  const top = -L - 12, H = L + 34;
  const full = (fill, extra = "") => `<rect x="-60" y="${f1(top)}" width="120" height="${f1(H)}" fill="${fill}" ${extra}/>`;
  const R = rng(seed);
  let s = "";
  switch (n.fx) {
    case "french": {
      const d = Math.max(30, (L - BED) * 0.85 + 18);
      const yS = -L + d * 1.6, yC = 2 * (-L + d) - yS;
      s = full(c) + `<path d="M-60,${f1(top)} H60 V${f1(yS)} Q0,${f1(yC)} -60,${f1(yS)} Z" fill="${c2}"/>`;
      break;
    }
    case "ombre":
      defs.push(`<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="10" x2="0" y2="${f1(-L)}">
        <stop offset="0" stop-color="${c}"/><stop offset=".18" stop-color="${c}"/><stop offset=".55" stop-color="${mix(c, c2, 0.55)}"/><stop offset=".92" stop-color="${c2}"/></linearGradient>`);
      s = full(`url(#${id}g)`);
      break;
    case "aura":
      defs.push(`<radialGradient id="${id}g" gradientUnits="userSpaceOnUse" cx="0" cy="${f1(-L * 0.44)}" r="${f1(Math.max(46, L * 0.4))}">
        <stop offset="0" stop-color="${c2}"/><stop offset=".35" stop-color="${c2}" stop-opacity=".85"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient>`);
      s = full(c) + full(`url(#${id}g)`);
      break;
    case "chroom": {
      const st = [[0, light(c, 0.75)], [0.16, light(c, 0.2)], [0.34, dark(c, 0.28)], [0.5, light(c, 0.85)], [0.62, light(c, 0.15)], [0.8, dark(c, 0.2)], [1, light(c, 0.5)]];
      defs.push(`<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="-50" y1="${f1(-L)}" x2="50" y2="10">${st.map(([o, k]) => `<stop offset="${o}" stop-color="${k}"/>`).join("")}</linearGradient>`);
      s = full(`url(#${id}g)`) +
        `<path d="M-27,${f1(-L * 0.86)} C-33,${f1(-L * 0.6)} -33,${f1(-L * 0.36)} -26,${f1(-L * 0.14)}" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".85" filter="url(#bl1)"/>`;
      break;
    }
    case "cateye": {
      defs.push(`<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="-50" y1="${f1(-L * 0.25)}" x2="50" y2="${f1(-L * 0.75)}">
        <stop offset=".3" stop-color="${c2}" stop-opacity="0"/><stop offset=".5" stop-color="${c2}" stop-opacity=".9"/><stop offset=".7" stop-color="${c2}" stop-opacity="0"/></linearGradient>`);
      s = full(dark(c, 0.15)) + full(`url(#${id}g)`, `transform="rotate(-24 0 ${f1(-L / 2)})"`);
      let dots = "";
      for (let i = 0; i < 110; i++) {
        const t = R(), u = (R() - 0.5) * (R() * 34);
        const x = -50 + t * 100, y = -L * 0.12 - t * L * 0.76 + u;
        dots += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.5 + R() * 1.1)}" fill="${light(c2, 0.5)}" opacity="${f1(0.4 + R() * 0.6)}"/>`;
      }
      s += `<g transform="rotate(-24 0 ${f1(-L / 2)}) translate(0 0)">${dots}</g>`;
      break;
    }
    case "glitter": {
      s = full(c);
      const kl = [c2, light(c2, 0.45), dark(c2, 0.18), "#FFFFFF"];
      const cnt = Math.round(L * 1.1);
      for (let i = 0; i < cnt; i++) {
        const x = -52 + R() * 104, y = 12 - R() * (L + 14), r = 1 + R() * 2.6;
        s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${kl[i % 4]}" opacity="${f1(0.7 + R() * 0.3)}"/>`;
      }
      for (let i = 0; i < 4; i++) {
        const x = -34 + R() * 68, y = -10 - R() * (L - 20), k = 0.07 + R() * 0.06;
        s += `<path transform="translate(${f1(x)} ${f1(y)}) scale(${f1(k * 100) / 100})" d="${TWINKEL}" fill="#fff"/>`;
      }
      break;
    }
    case "marmer": {
      s = full(c);
      let v = "";
      for (let i = 0; i < 6; i++) {
        const y0 = 20 - (i + R()) * (L + 30) / 6, y1 = y0 - 30 - R() * 70;
        const p = `M-62,${f1(y0)} C${f1(-30 + R() * 30)},${f1(y0 - 10 - R() * 50)} ${f1(R() * 30)},${f1(y1 + 30 + R() * 30)} 62,${f1(y1)}`;
        const w = [4.2, 1.6, 2.8, 1.1, 2.2, 1.2][i], o = [0.9, 0.8, 0.65, 0.9, 0.6, 0.75][i];
        if (i === 0) v += `<path d="${p}" stroke="${c2}" stroke-width="10" fill="none" opacity=".22" filter="url(#bl3)"/>`;
        v += `<path d="${p}" stroke="${c2}" stroke-width="${w}" fill="none" opacity="${o}" stroke-linecap="round"/>`;
      }
      s += v;
      break;
    }
    case "schildpad": {
      defs.push(`<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="10" x2="0" y2="${f1(-L)}">
        <stop offset="0" stop-color="${light(c, 0.15)}"/><stop offset="1" stop-color="${dark(c, 0.1)}"/></linearGradient>`);
      s = full(`url(#${id}g)`);
      let b = "", m = "";
      for (let i = 0; i < 8; i++) {
        const x = -48 + R() * 96, y = 4 - R() * (L + 4), rx = 12 + R() * 16, ry = 9 + R() * 12, r = R() * 180;
        b += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" transform="rotate(${f1(r)} ${f1(x)} ${f1(y)})" fill="${c2}" opacity="${f1(0.7 + R() * 0.3)}"/>`;
        const x2 = -48 + R() * 96, y2 = 4 - R() * (L + 4);
        m += `<ellipse cx="${f1(x2)}" cy="${f1(y2)}" rx="${f1(12 + R() * 14)}" ry="${f1(9 + R() * 10)}" fill="${mix(c, c2, 0.45)}" opacity=".75"/>`;
      }
      s += `<g filter="url(#bl6)">${m}</g><g filter="url(#bl6)">${b}</g><g filter="url(#bl3)" opacity=".5">${b}</g>`;
      break;
    }
    case "milky":
      defs.push(`<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="12" x2="0" y2="${f1(-L)}">
        <stop offset="0" stop-color="${mix(c, "#F0BDB6", 0.5)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${light(c, 0.4)}"/></linearGradient>`);
      s = full(`url(#${id}g)`);
      break;
    default:
      if (typeof TECH_EXTRA !== "undefined" && TECH_EXTRA[n.fx]) return TECH_EXTRA[n.fx]({ n, c, c2, L, id, R, defs, full, top, H });
      s = full(c);
  }
  return s;
}

function finishSVG(n, L, P) {
  if (n.fin === "mat")
    return `<rect x="-60" y="${f1(-L - 12)}" width="120" height="${f1(L + 34)}" fill="#fff" opacity=".07"/>` +
      `<path d="${P}" fill="none" stroke="#000" stroke-opacity=".07" stroke-width="6"/>`;
  return `<rect x="-60" y="${f1(-L - 12)}" width="120" height="${f1(L + 34)}" fill="url(#depth)"/>` +
    `<rect x="-37" y="${f1(-L + 14)}" width="12" height="${f1(L * 0.74)}" rx="6" fill="url(#hl)"/>` +
    `<ellipse cx="24" cy="${f1(-L * 0.22)}" rx="3.2" ry="9" fill="#fff" opacity=".18"/>` +
    `<path d="${P}" fill="none" stroke="#000" stroke-opacity=".13" stroke-width="7"/>`;
}

// ---------- versieringen (kader -50..50) ----------
const TWINKEL = "M0,-48 C4,-14 14,-4 48,0 C14,4 4,14 0,48 C-4,14 -14,4 -48,0 C-14,-4 -4,-14 0,-48 Z";
const HART = "M0,40 C-28,20 -48,4 -48,-15 C-48,-33 -35,-44 -21,-44 C-10,-44 -3,-38 0,-30 C3,-38 10,-44 21,-44 C35,-44 48,-33 48,-15 C48,4 28,20 0,40 Z";
function sterPad() {
  let p = "";
  for (let k = 0; k < 10; k++) {
    const a = (-90 + k * 36) * Math.PI / 180, r = k % 2 ? 20 : 48;
    p += (k ? "L" : "M") + f1(Math.cos(a) * r) + "," + f1(Math.sin(a) * r + 3);
  }
  return p + "Z";
}
const STER = sterPad();

function decoFill(c) {
  return c === "goud" || c === "rose" || c === "zilver" ? `url(#m-${c})` : c;
}
const METAAL = { goud: "#D9B04C", rose: "#D69C86", zilver: "#C3C8CE" };
const baseHex = (c) => METAAL[c] || c;

function decoBody(d, id, defs) {
  const F = decoFill(d.c), hx = baseHex(d.c);
  const donker = lum(hx) < 0.18;
  switch (d.t) {
    case "hart": return `<path d="${HART}" fill="${F}"/><ellipse cx="-22" cy="-24" rx="9" ry="6" transform="rotate(-35 -22 -24)" fill="#fff" opacity=".35"/>`;
    case "ster": return `<path d="${STER}" fill="${F}" stroke="${F}" stroke-width="5" stroke-linejoin="round"/>`;
    case "twinkel": return `<path d="${TWINKEL}" fill="${F}"/>`;
    case "bloem": {
      let s = "";
      for (let k = 0; k < 5; k++) s += `<ellipse cx="0" cy="-23" rx="16" ry="23" transform="rotate(${k * 72})" fill="${F}"/>`;
      for (let k = 0; k < 5; k++) s += `<path d="M0,-8 L0,-34" transform="rotate(${k * 72})" stroke="${dark(hx, 0.12)}" stroke-width="1.6" opacity=".35"/>`;
      return s + `<circle r="11" fill="${lum(hx) > 0.6 ? "#F2C14E" : "#FFF4D6"}"/><circle cx="-3" cy="-3" r="4" fill="#fff" opacity=".45"/>`;
    }
    case "madelief": {
      let s = "";
      for (let k = 0; k < 12; k++) s += `<ellipse cx="0" cy="-27" rx="6.5" ry="20" transform="rotate(${k * 30})" fill="${F}"/>`;
      return s + `<circle r="13" fill="#F2B705"/><circle r="13" fill="none" stroke="#D99A00" stroke-width="2"/><circle cx="-4" cy="-4" r="4" fill="#fff" opacity=".4"/>`;
    }
    case "blad": return `<path d="M0,48 C-34,18 -30,-24 0,-48 C30,-24 34,18 0,48 Z" fill="${F}"/>` +
      `<path d="M0,44 L0,-38 M0,10 L-14,-2 M0,10 L14,-2 M0,-10 L-11,-21 M0,-10 L11,-21 M0,28 L-12,18 M0,28 L12,18" stroke="${dark(hx, 0.3)}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".55"/>`;
    case "maan": return `<path d="M14,-44 A46,46 0 1,0 14,44 A52,52 0 0,1 14,-44 Z" fill="${F}"/>`;
    case "steentje": {
      const wit = lum(hx) > 0.85;
      const [a, b, e] = wit ? ["#FFFFFF", "#E3EAF4", "#8E9BB0"] : [light(hx, 0.55), hx, dark(hx, 0.38)];
      defs.push(`<radialGradient id="${id}g" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${e}"/></radialGradient>`);
      let s = `<circle r="46" fill="url(#${id}g)"/>`;
      let oct = "", lines = "";
      for (let k = 0; k < 8; k++) {
        const an = (k * 45 + 22.5) * Math.PI / 180, an2 = k * 45 * Math.PI / 180;
        oct += (k ? "L" : "M") + f1(Math.cos(an) * 22) + "," + f1(Math.sin(an) * 22);
        lines += `M${f1(Math.cos(an) * 22)},${f1(Math.sin(an) * 22)} L${f1(Math.cos(an2) * 46)},${f1(Math.sin(an2) * 46)} L${f1(Math.cos(an + 0.785) * 22)},${f1(Math.sin(an + 0.785) * 22)} `;
      }
      s += `<path d="${lines}" stroke="#fff" stroke-width="1.6" fill="none" opacity=".55"/>`;
      s += `<path d="${oct}Z" fill="${wit ? "#F6F9FF" : light(hx, 0.35)}" opacity=".75" stroke="#fff" stroke-width="1.4"/>`;
      return s + `<ellipse cx="-14" cy="-17" rx="9" ry="5" transform="rotate(-30 -14 -17)" fill="#fff" opacity=".95"/><circle cx="16" cy="15" r="3" fill="#fff" opacity=".8"/>`;
    }
    case "parel": {
      defs.push(`<radialGradient id="${id}g" cx=".36" cy=".32" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".4" stop-color="${hx}"/><stop offset=".85" stop-color="${dark(hx, 0.14)}"/><stop offset="1" stop-color="${dark(hx, 0.26)}"/></radialGradient>`);
      return `<circle r="46" fill="url(#${id}g)"/><ellipse cx="10" cy="18" rx="22" ry="12" fill="#F7C9D6" opacity=".22"/><ellipse cx="-15" cy="-17" rx="10" ry="7" transform="rotate(-35 -15 -17)" fill="#fff" opacity=".85"/>`;
    }
    case "strik": {
      const sh = donker ? light(hx, 0.25) : dark(hx, 0.18);
      return `<path d="M-3,6 L-20,44 L-10,40 L-4,48 L4,8 Z M3,6 L20,44 L10,40 L4,48 L-4,8 Z" fill="${F}"/>` +
        `<path d="M0,0 C-12,-28 -48,-36 -48,-10 C-48,12 -20,14 0,0 Z M0,0 C12,-28 48,-36 48,-10 C48,12 20,14 0,0 Z" fill="${F}"/>` +
        `<path d="M-6,-2 C-18,-14 -32,-18 -38,-12 M6,-2 C18,-14 32,-18 38,-12" stroke="${sh}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
        `<ellipse rx="9" ry="11" fill="${F}" stroke="${sh}" stroke-width="2"/>`;
    }
    case "vlinder": {
      const in1 = light(hx, 0.45);
      return `<path d="M0,-4 C-10,-42 -52,-48 -47,-14 C-44,6 -18,6 0,-4 Z M0,-4 C10,-42 52,-48 47,-14 C44,6 18,6 0,-4 Z" fill="${F}"/>` +
        `<path d="M0,2 C-16,8 -42,22 -31,40 C-22,50 -6,30 0,2 Z M0,2 C16,8 42,22 31,40 C22,50 6,30 0,2 Z" fill="${F}" opacity=".9"/>` +
        `<ellipse cx="-24" cy="-18" rx="9" ry="7" fill="${in1}" opacity=".7"/><ellipse cx="24" cy="-18" rx="9" ry="7" fill="${in1}" opacity=".7"/>` +
        `<ellipse cx="0" cy="4" rx="3.6" ry="22" fill="#2A1E24"/><path d="M-1,-16 C-4,-28 -10,-36 -14,-40 M1,-16 C4,-28 10,-36 14,-40" stroke="#2A1E24" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    }
    case "sneeuw": {
      let s = "";
      for (let k = 0; k < 6; k++) s += `<path transform="rotate(${k * 60})" d="M0,0 L0,-46 M0,-30 L-12,-40 M0,-30 L12,-40 M0,-15 L-9,-23 M0,-15 L9,-23"/>`;
      return `<g stroke="${F}" stroke-width="5.5" stroke-linecap="round" fill="none">${s}</g><circle r="6" fill="${F}"/>`;
    }
    case "stip": return `<circle r="46" fill="${F}"/><ellipse cx="-15" cy="-17" rx="11" ry="7" transform="rotate(-35 -15 -17)" fill="#fff" opacity="${donker ? 0.35 : 0.5}"/>`;
    case "lijn": return `<rect x="-62" y="-3.5" width="124" height="7" rx="3.5" fill="${F}"/>`;
    case "smiley": {
      const oog = donker ? "#FFFFFF" : "#1E1A1C";
      return `<circle r="46" fill="${F}"/><ellipse cx="-15" cy="-12" rx="5.5" ry="9" fill="${oog}"/><ellipse cx="15" cy="-12" rx="5.5" ry="9" fill="${oog}"/>` +
        `<path d="M-25,9 C-15,32 15,32 25,9" stroke="${oog}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    }
    case "web": {
      const sp = 8, P = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
      let s = "";
      for (let k = 0; k < sp; k++) { const [x, y] = P(k * Math.PI * 2 / sp, 50); s += `M0,0 L${f1(x)},${f1(y)} `; }
      for (const r of [13, 25, 37, 49]) for (let k = 0; k < sp; k++) {
        const a1 = k * Math.PI * 2 / sp, a2 = (k + 1) * Math.PI * 2 / sp, am = (a1 + a2) / 2;
        const [x1, y1] = P(a1, r), [x2, y2] = P(a2, r), [cx, cy] = P(am, r * 0.8);
        s += `M${f1(x1)},${f1(y1)} Q${f1(cx)},${f1(cy)} ${f1(x2)},${f1(y2)} `;
      }
      return `<path d="${s}" stroke="${F}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    }
  }
  if (typeof DECO_EXTRA !== "undefined" && DECO_EXTRA[d.t]) return DECO_EXTRA[d.t]({ d, F, hx, donker, id, defs });
  return "";
}

function decoSVG(d, id, defs, attr = "") {
  const k = (d.s || 30) / 100;
  return `<g transform="translate(${f1(d.x)} ${f1(d.y)}) rotate(${f1(d.r || 0)}) scale(${k})" ${attr}><g filter="url(#ds)">${decoBody(d, id, defs)}</g></g>`;
}

// ---------- één nagel ----------
// opts: shadow, fold (huidplooi bij nagelriem), decoAttr(j)
function nailSVG(n, shape, length, id, seed, opts = {}) {
  if (!n) return "";
  const L = nailLen(shape, length), P = nailPath(shape, L), defs = [];
  defs.push(`<clipPath id="${id}c"><path d="${P}"/></clipPath>`);
  let s = "";
  if (opts.shadow) s += `<path d="${P}" fill="#5a3434" opacity=".2" transform="translate(0 9)" filter="url(#nsh)"/>`;
  if (opts.fold) s += `<path d="M-50,-2 C-50,12 -28,19 0,19 C28,19 50,12 50,-2" fill="none" stroke="${opts.fold}" stroke-width="9" stroke-linecap="round" opacity=".55"/>`;
  const deco = (n.deco || []).map((d, j) => decoSVG(d, id + "d" + j, defs, opts.decoAttr ? opts.decoAttr(j) : "")).join("");
  s += `<g clip-path="url(#${id}c)">${techSVG(n, L, id, seed, defs)}${deco}<g pointer-events="none">${finishSVG(n, L, P)}</g></g>`;
  s += `<path d="${P}" fill="none" stroke="#3b2328" stroke-opacity=".16" stroke-width="1.4"/>`;
  if (opts.sel) s += `<path d="${P}" fill="none" stroke="#fff" stroke-width="7" vector-effect="non-scaling-stroke" opacity=".95"/><path d="${P}" fill="none" stroke="#B4636F" stroke-width="2.6" vector-effect="non-scaling-stroke"/>`;
  if (opts.extra) s += opts.extra;
  return `<defs>${defs.join("")}</defs>${s}`;
}
const nailSeed = (i) => i * 7919 + 101;

// ---------- hand (rechterhand, rugzijde, vingers omhoog; viewBox 0 0 420 600) ----------
const HAND = {
  vingers: [ // duim, wijs, midden, ring, pink
    { bx: 146, by: 440, a: -34, len: 140, w: 54 },
    { bx: 160, by: 300, a: -8, len: 182, w: 47 },
    { bx: 210, by: 292, a: -1, len: 200, w: 49 },
    { bx: 258, by: 300, a: 6, len: 184, w: 46 },
    { bx: 302, by: 324, a: 14, len: 142, w: 40 },
  ],
  palm: "M128,338 C124,302 150,284 184,283 C216,279 252,281 284,287 C312,293 328,312 324,342 L320,432 C318,482 306,522 304,1100 L166,1100 C166,560 154,522 134,490 C112,456 120,410 128,338 Z",
};
const VINGERNAAM = ["Duim", "Wijsvinger", "Middelvinger", "Ringvinger", "Pink"];

function skinDefs(id, skin) {
  return `<linearGradient id="${id}sk" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${dark(skin, 0.11)}"/><stop offset=".2" stop-color="${skin}"/><stop offset=".55" stop-color="${light(skin, 0.08)}"/>
    <stop offset=".84" stop-color="${skin}"/><stop offset="1" stop-color="${dark(skin, 0.1)}"/></linearGradient>
  <linearGradient id="${id}pm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${dark(skin, 0.08)}"/><stop offset=".14" stop-color="${skin}"/><stop offset=".5" stop-color="${light(skin, 0.06)}"/><stop offset=".86" stop-color="${skin}"/><stop offset="1" stop-color="${dark(skin, 0.09)}"/></linearGradient>`;
}

function fingerPath(len, w) {
  const r = w / 2;
  return `M${f1(-r)},40 L${f1(-r)},${f1(-(len - r))} A${f1(r)},${f1(r)} 0 0 1 ${f1(r)},${f1(-(len - r))} L${f1(r)},40 Z`;
}

// state: {shape,length,skin,nails}; hand 'R'|'L'; nailWrap(i, inner) mag extra attributen toevoegen
function handSVG(state, hand, id, nailWrap, nopt) {
  const skin = HUID[state.skin] || HUID[1];
  const fold = dark(skin, 0.22);
  let fingers = "", nails = "", creases = "";
  HAND.vingers.forEach((v, fi) => {
    fingers += `<g transform="translate(${v.bx} ${v.by}) rotate(${v.a})"><path d="${fingerPath(v.len, v.w)}" fill="url(#${id}sk)"/></g>`;
    creases += `<g transform="translate(${v.bx} ${v.by}) rotate(${v.a})" stroke="${fold}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".35">
      <path d="M${f1(-v.w * 0.2)},${f1(-v.len * 0.45)} q${f1(v.w * 0.2)},-4 ${f1(v.w * 0.4)},0"/><path d="M${f1(-v.w * 0.12)},${f1(-v.len * 0.45 - 5)} q${f1(v.w * 0.12)},-3 ${f1(v.w * 0.24)},0"/></g>`;
    const k = (v.w * 0.74) / 100;
    const dist = v.len - BED * k - v.w * 0.05;
    const i = (hand === "R" ? 0 : 5) + fi;
    const inner = nailSVG(state.nails[i], state.shape, state.length, `${id}n${i}`, nailSeed(i), { fold, ...(nopt ? nopt(i) : {}) });
    const g = `<g data-local="1" transform="rotate(${v.a}) translate(0 ${f1(-dist)}) scale(${f1(k * 1000) / 1000})">${inner}</g>`;
    nails += `<g transform="translate(${v.bx} ${v.by})">${nailWrap ? nailWrap(i, g) : g}</g>`;
  });
  const body = `${fingers}<path d="${HAND.palm}" fill="url(#${id}pm)"/>${creases}` +
    `<path d="M190,330 q14,-6 28,0 M238,334 q12,-5 24,0 M148,338 q11,-5 22,0" stroke="${fold}" stroke-width="1.4" fill="none" opacity=".18" stroke-linecap="round"/>` +
    nails;
  const inhoud = `<defs>${skinDefs(id, skin)}</defs>` + (hand === "L" ? `<g transform="translate(420 0) scale(-1 1)">${body}</g>` : body);
  return inhoud;
}

// ---------- tips (10 losse nagels; viewBox 0 0 400 452) ----------
const TIPMAAT = [1.2, 1.0, 1.06, 0.98, 0.82];
const TIP_X = [48, 124, 200, 276, 352];
function tipsSVG(state, id, nailWrap, labels = true, nopt) {
  let s = "";
  const rij = (hand, base) => {
    for (let slot = 0; slot < 5; slot++) {
      const fi = hand === "L" ? 4 - slot : slot, i = (hand === "R" ? 0 : 5) + fi;
      const k = 0.5 * TIPMAAT[fi];
      const inner = nailSVG(state.nails[i], state.shape, state.length, `${id}n${i}`, nailSeed(i), { shadow: true, ...(nopt ? nopt(i) : {}) });
      const g = `<g data-local="1" transform="translate(${TIP_X[slot]} ${base}) scale(${hand === "L" ? -k : k} ${k})">${inner}</g>`;
      s += nailWrap ? nailWrap(i, g) : g;
    }
  };
  rij("L", 196); rij("R", 412);
  if (labels) s += `<text x="200" y="232" class="tiplabel" text-anchor="middle">LINKS</text><text x="200" y="448" class="tiplabel" text-anchor="middle">RECHTS</text>`;
  return s;
}

// Kleine voorbeeld-svg (één nagel) voor knoppen
let _uid = 0;
function miniNail(n, shape, length, w = 40, extra = "") {
  const id = "m" + (++_uid), L = nailLen(shape, length);
  return `<svg viewBox="-62 ${f1(-L - 10)} 124 ${f1(L + 34)}" width="${w}" ${extra} aria-hidden="true">${nailSVG(n, shape, length, id, 7, { shadow: true })}</svg>`;
}
function miniSet(state, w = 150) {
  const id = "s" + (++_uid);
  let s = "";
  const xs = [14, 50, 86, 122, 156];
  for (let fi = 0; fi < 5; fi++) {
    const k = 0.25 * TIPMAAT[fi];
    s += `<g transform="translate(${xs[fi]} 96) scale(${k})">${nailSVG(state.nails[fi], state.shape, state.length, `${id}n${fi}`, nailSeed(fi), { shadow: true })}</g>`;
  }
  return `<svg viewBox="-6 22 176 88" width="${w}" aria-hidden="true">${s}</svg>`;
}
function miniDeco(t, w = 40) {
  const v = VERSIERING[t], id = "q" + (++_uid), defs = [];
  const body = decoBody({ t, c: v.kleur, x: 0, y: 0, s: 100 }, id, defs);
  const bg = t === "bloem" || t === "madelief" || t === "sneeuw" || t === "stip" || t === "steentje" || t === "parel"
    ? `<circle r="56" fill="#E9DCD6"/>` : "";
  return `<svg viewBox="-60 -60 120 120" width="${w}" aria-hidden="true"><defs>${defs.join("")}</defs>${bg}<g filter="url(#ds)">${body}</g></svg>`;
}
