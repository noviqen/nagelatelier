// Nagelatelier — extra nail art: patronen (strepen, ruit, regenboog, swirl, golf-/V-French, luipaard, zebra, zee)
// en motieven (hibiscus, 3D-bloem, schelp, zeester, bolletje, dieren, fruit, wolkje). Alles zelf getekend.

EFFECTEN.push(
  { id: "strepen", naam: "Streepjes", c2: "Streep" },
  { id: "ruit", naam: "Ruitjes", c2: "Ruit" },
  { id: "regenboog", naam: "Regenboog", c2: null },
  { id: "swirl", naam: "Swirl", c2: "Lijnen" },
  { id: "golffrench", naam: "Golf-French", c2: "Golf" },
  { id: "vfrench", naam: "V-French", c2: "Tip" },
  { id: "luipaard", naam: "Luipaard", c2: "Vlekken" },
  { id: "zebra", naam: "Zebra", c2: "Strepen" },
  { id: "zee", naam: "Zeegolven", c2: "Zee" },
);
EFFECTEN.forEach((e) => (EFFECT[e.id] = e));

const NIEUW_DECO = [
  { id: "hibiscus", naam: "Hibiscus", kleur: "#3FA7D6", maat: 46 },
  { id: "bloem3d", naam: "3D-bloem", kleur: "#3A6EA5", maat: 50 },
  { id: "schelp", naam: "Schelpje", kleur: "goud", maat: 26 },
  { id: "zeester", naam: "Zeester", kleur: "goud", maat: 28 },
  { id: "bolletje", naam: "Bolletje", kleur: "goud", maat: 10 },
  { id: "beer", naam: "Beertje", kleur: "#B07A63", maat: 44 },
  { id: "kat", naam: "Katje", kleur: "#F4A261", maat: 44 },
  { id: "panda", naam: "Panda", kleur: "#FFFFFF", maat: 44 },
  { id: "leeuw", naam: "Leeuwtje", kleur: "#E9A23B", maat: 46 },
  { id: "kikker", naam: "Kikker", kleur: "#7BC47F", maat: 44 },
  { id: "konijn", naam: "Konijntje", kleur: "#FFFFFF", maat: 46 },
  { id: "bij", naam: "Bijtje", kleur: "#F6C945", maat: 40 },
  { id: "lieveheer", naam: "Lieveheersbeestje", kleur: "#E63946", maat: 40 },
  { id: "kers", naam: "Kersjes", kleur: "#C8102E", maat: 42 },
  { id: "aardbei", naam: "Aardbei", kleur: "#E63946", maat: 40 },
  { id: "wolkje", naam: "Wolkje", kleur: "#FFFFFF", maat: 40 },
];
NIEUW_DECO.forEach((v) => { VERSIERINGEN.push(v); VERSIERING[v.id] = v; });
DECO_KLEUREN.push(["#3FA7D6", "Lagune"], ["#3A6EA5", "Denim"], ["#B07A63", "Kaneel"], ["#F4A261", "Abrikoos"], ["#7BC47F", "Kikkergroen"]);

const ZWART = "#1E1A1C";
const REGENBOOG = { pastel: ["#F28DAA", "#F7B58A", "#F6D365", "#A8DDB5", "#8EC5EC", "#B9A2E0"], fel: ["#E63946", "#F4A261", "#F6D365", "#52B788", "#3A86FF", "#8E5BBF"] };

const TECH_EXTRA = {
  strepen: ({ n, c, c2, L, full, top, H }) => {
    const v = n.v || 0, w = [7, 3.2, 9][v], gap = [13, 9, 16][v];
    let g = "";
    for (let k = -14; k <= 14; k++) g += `<rect x="${f1(k * (w + gap) - w / 2)}" y="${f1(top - 80)}" width="${w}" height="${f1(H + 160)}" fill="${k % 2 && n.c3 ? n.c3 : c2}"/>`;
    const rot = [`rotate(35 0 ${f1(-L / 2)})`, "", `rotate(90 0 ${f1(-L / 2)})`][v];
    return full(c) + `<g transform="${rot}">${g}</g>`;
  },
  ruit: ({ n, c, c2, L, full }) => {
    const z = 16, rot = n.v ? `rotate(45 0 ${f1(-L / 2)})` : "";
    let g = "";
    for (let i = -6; i <= 6; i++) for (let j = -14; j <= 4; j++) if ((i + j) % 2 === 0) g += `<rect x="${i * z - z / 2}" y="${j * z}" width="${z}" height="${z}" fill="${c2}"/>`;
    return full(c) + `<g transform="${rot}">${g}</g>`;
  },
  regenboog: ({ n, c, L, full }) => {
    const kl = REGENBOOG[n.v ? "fel" : "pastel"], cy = -L * 0.16;
    let g = "";
    kl.forEach((k, i) => { const r = 44 - i * 7; g += `<path d="M${-r},${f1(cy)} A${r},${r} 0 0 1 ${r},${f1(cy)}" stroke="${k}" stroke-width="7.2" fill="none"/>`; });
    return full(c) + g;
  },
  swirl: ({ n, c, c2, L, R, full }) => {
    const c3 = n.c3 || light(c2, 0.45);
    let g = "";
    const lijn = (kl, w, off) => {
      const y0 = 10 + off, y3 = -L - 10 + off * 0.4;
      const p = `M${f1(-60 + R() * 20)},${f1(y0)} C${f1(40 + R() * 20)},${f1(-L * 0.25 + off)} ${f1(-55 - R() * 10)},${f1(-L * 0.6 + off)} ${f1(30 + R() * 25)},${f1(y3)}`;
      g += `<path d="${p}" stroke="${kl}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
    };
    lijn(c2, 9, 0); lijn(c3, 5, 22); lijn("#FFFFFF", 2.6, -18);
    return full(c) + g;
  },
  golffrench: ({ n, c, c2, L, full, top }) => {
    const d = Math.max(30, (L - BED) * 0.85 + 18), c3 = n.c3 || light(c2, 0.5);
    const y = (x, off) => -L + d + off + Math.abs(x) * 0.32 + Math.sin(x / 8) * 4.5;
    let rand = "", lijn = "";
    for (let x = 60; x >= -60; x -= 3) rand += ` L${x},${f1(y(x, 0))}`;
    for (let x = -60; x <= 60; x += 3) lijn += `${x === -60 ? "M" : " L"}${x},${f1(y(x, 11))}`;
    return full(c) + `<path d="M-60,${f1(top)} L60,${f1(top)}${rand} Z" fill="${c2}"/><path d="${lijn}" stroke="${c3}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  },
  vfrench: ({ c, c2, L, full, top }) => {
    const d = Math.max(30, (L - BED) * 0.85 + 18);
    return full(c) + `<path d="M-60,${f1(top)} H60 V${f1(-L + d * 0.55)} L0,${f1(-L + d * 1.45)} L-60,${f1(-L + d * 0.55)} Z" fill="${c2}"/>`;
  },
  luipaard: ({ c, c2, L, R, full }) => {
    let g = "";
    const n = Math.round(L / 9);
    for (let i = 0; i < n; i++) {
      const x = -46 + R() * 92, y = 8 - R() * (L + 4), rx = 6 + R() * 5, ry = 4.5 + R() * 3.5, r = R() * 180;
      g += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(r)})"><ellipse rx="${f1(rx)}" ry="${f1(ry)}" fill="${c2}"/>` +
        `<ellipse rx="${f1(rx + 2.4)}" ry="${f1(ry + 2.4)}" fill="none" stroke="${ZWART}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="${f1(8 + R() * 8)} ${f1(4 + R() * 5)} ${f1(5 + R() * 6)} ${f1(6 + R() * 6)}"/></g>`;
      if (R() < 0.6) g += `<circle cx="${f1(x + 12 * (R() - 0.5) * 2)}" cy="${f1(y + 12 * (R() - 0.5) * 2)}" r="${f1(1.4 + R() * 1.4)}" fill="${ZWART}"/>`;
    }
    return full(c) + g;
  },
  zebra: ({ c, c2, L, R, full }) => {
    let g = "";
    for (const side of [-1, 1]) for (let y = -L + 6 + (side > 0 ? 8 : 0); y < 14; y += 15 + R() * 5) {
      const len = 28 + R() * 46, th = 3 + R() * 3.5, wob = (R() - 0.5) * 10;
      g += `<path d="M${side * 62},${f1(y - th)} Q${f1(side * (62 - len * 0.55))},${f1(y - th - 4 + wob)} ${f1(side * (62 - len))},${f1(y + wob * 0.6)} Q${f1(side * (62 - len * 0.5))},${f1(y + th + 3 + wob)} ${side * 62},${f1(y + th)} Z" fill="${c2}"/>`;
    }
    return full(c) + g;
  },
  zee: ({ n, c, c2, L, id, defs, R, full }) => {
    const c3 = n.c3 || dark(c2, 0.35), grens = -L * 0.5;
    defs.push(`<linearGradient id="${id}z" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(grens + 18)}" x2="0" y2="${f1(-L)}"><stop offset="0" stop-color="${c2}" stop-opacity="0"/><stop offset=".35" stop-color="${c2}" stop-opacity=".9"/><stop offset="1" stop-color="${light(c2, 0.3)}"/></linearGradient>`);
    let g = "";
    for (let k = 0; k < 7; k++) {
      const y = -L + 8 + k * ((L * 0.5) / 7) + R() * 3;
      let p = ""; for (let x = -60; x <= 60; x += 5) p += `${x === -60 ? "M" : "L"}${x},${f1(y + Math.sin(x / (7 + k) + k) * 2.6)}`;
      g += `<path d="${p}" stroke="${k % 3 === 2 ? "#FFFFFF" : c3}" stroke-width="${k % 3 === 2 ? 1.6 : 1.1 + R()}" fill="none" opacity="${0.55 + R() * 0.4}"/>`;
    }
    return full(c) + full(`url(#${id}z)`) + g;
  },
};

// ---------- motieven (kader -50..50) ----------
const oog = (x, y, r = 4.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${ZWART}"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff"/>`;
const wangen = (x, y) => `<ellipse cx="${-x}" cy="${y}" rx="6" ry="3.6" fill="#F28DAA" opacity=".55"/><ellipse cx="${x}" cy="${y}" rx="6" ry="3.6" fill="#F28DAA" opacity=".55"/>`;
const lijnZw = `stroke="${ZWART}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"`;

const DECO_EXTRA = {
  hibiscus: ({ hx, id, defs }) => {
    defs.push(`<radialGradient id="${id}h" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="50"><stop offset="0" stop-color="${dark(hx, 0.25)}"/><stop offset=".3" stop-color="${hx}"/><stop offset=".62" stop-color="${light(hx, 0.75)}"/><stop offset=".8" stop-color="#FFFFFF"/></radialGradient>`);
    let s = "";
    for (let k = 0; k < 5; k++) s += `<path transform="rotate(${k * 72 + 8})" d="M0,0 C-20,-8 -30,-30 -18,-44 C-10,-52 -2,-46 0,-40 C2,-46 10,-52 18,-44 C30,-30 20,-8 0,0 Z" fill="url(#${id}h)" stroke="${light(hx, 0.4)}" stroke-width="1"/>`;
    for (let k = 0; k < 5; k++) s += `<path transform="rotate(${k * 72 + 8})" d="M0,-6 L0,-30 M-6,-10 L-10,-26 M6,-10 L10,-26" stroke="#fff" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>`;
    return s + `<path d="M0,0 C8,-6 16,-16 22,-30" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="22" cy="-30" r="3.2" fill="#F6D365"/><circle cx="18" cy="-34" r="2" fill="#F6D365"/><circle cx="25" cy="-25" r="2" fill="#F6D365"/>`;
  },
  bloem3d: ({ hx, id, defs }) => {
    defs.push(`<linearGradient id="${id}p" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${dark(hx, 0.35)}"/><stop offset=".55" stop-color="${hx}"/><stop offset="1" stop-color="${light(hx, 0.55)}"/></linearGradient>`);
    let s = "";
    for (let k = 0; k < 5; k++) s += `<g transform="rotate(${k * 72})"><path d="M0,-2 C-15,-14 -17,-36 0,-52 C17,-36 15,-14 0,-2 Z" fill="url(#${id}p)" stroke="${dark(hx, 0.2)}" stroke-width=".8"/>` +
      `<path d="M0,-8 C-2,-22 -1,-34 0,-44 M-5,-14 C-8,-24 -8,-30 -6,-36 M5,-14 C8,-24 8,-30 6,-36" stroke="#fff" stroke-width="1.5" fill="none" opacity=".8" stroke-linecap="round"/>` +
      `<path d="M-6,-20 C-8,-30 -5,-40 -1,-46" stroke="#fff" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/></g>`;
    return s + `<circle r="7.5" fill="url(#m-goud)"/><circle cx="-2.5" cy="-2.5" r="2.4" fill="#fff" opacity=".7"/>`;
  },
  schelp: ({ F, hx }) => {
    let ribs = "";
    for (let k = -4; k <= 4; k++) { const a = (k * 13) * Math.PI / 180; ribs += `M0,36 L${f1(Math.sin(a) * 44)},${f1(36 - Math.cos(a) * 66)} `; }
    return `<path d="M-14,36 L-22,44 L22,44 L14,36 Z" fill="${F}"/><path d="M0,40 L-40,-6 C-38,-34 -16,-38 0,-36 C16,-38 38,-34 40,-6 Z" fill="${F}"/>` +
      `<path d="${ribs}" stroke="${dark(hx, 0.28)}" stroke-width="2.2" fill="none" opacity=".7"/><path d="M-36,-8 C-30,-30 -12,-34 0,-33" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6"/>`;
  },
  zeester: ({ F, hx }) => {
    let p = "", dots = "";
    for (let k = 0; k < 10; k++) { const a = (-90 + k * 36) * Math.PI / 180, r = k % 2 ? 19 : 48; p += (k ? "L" : "M") + f1(Math.cos(a) * r) + "," + f1(Math.sin(a) * r); }
    for (let k = 0; k < 5; k++) for (let j = 1; j <= 3; j++) { const a = (-90 + k * 72) * Math.PI / 180, r = j * 11; dots += `<circle cx="${f1(Math.cos(a) * r)}" cy="${f1(Math.sin(a) * r)}" r="${f1(3.2 - j * 0.5)}" fill="${light(hx, 0.45)}"/>`; }
    return `<path d="${p}Z" fill="${F}" stroke="${F}" stroke-width="9" stroke-linejoin="round"/>${dots}<circle r="4" fill="${light(hx, 0.5)}"/>`;
  },
  bolletje: ({ F }) => `<circle r="44" fill="${F}"/><ellipse cx="-14" cy="-16" rx="13" ry="9" transform="rotate(-35 -14 -16)" fill="#fff" opacity=".75"/>`,
  beer: ({ hx }) => `<circle cx="-30" cy="-28" r="14" fill="${hx}"/><circle cx="30" cy="-28" r="14" fill="${hx}"/><circle cx="-30" cy="-28" r="7" fill="${light(hx, 0.4)}"/><circle cx="30" cy="-28" r="7" fill="${light(hx, 0.4)}"/>` +
    `<circle cy="4" r="38" fill="${hx}"/><ellipse cy="17" rx="16" ry="12" fill="${light(hx, 0.6)}"/><ellipse cy="11" rx="6" ry="4.5" fill="${ZWART}"/>` +
    `<path d="M0,15 L0,21 M-6,24 C-3,27 3,27 6,24" ${lijnZw}/>${oog(-14, -4)}${oog(14, -4)}${wangen(25, 14)}`,
  kat: ({ hx }) => `<path d="M-36,-6 L-30,-46 L-8,-28 Z M36,-6 L30,-46 L8,-28 Z" fill="${hx}"/><path d="M-30,-14 L-27,-37 L-15,-27 Z M30,-14 L27,-37 L15,-27 Z" fill="#F7B7C8"/>` +
    `<ellipse cy="6" rx="40" ry="33" fill="${hx}"/><path d="M-4,12 L4,12 L0,16 Z" fill="#E85A8A"/><path d="M0,16 C-2,21 -7,22 -9,19 M0,16 C2,21 7,22 9,19" ${lijnZw}/>` +
    `<path d="M-14,14 L-36,10 M-14,18 L-35,20 M14,14 L36,10 M14,18 L35,20" stroke="${ZWART}" stroke-width="1.4" opacity=".7"/>${oog(-15, 0, 4.6)}${oog(15, 0, 4.6)}${wangen(26, 16)}`,
  panda: () => `<circle cx="-30" cy="-28" r="13" fill="${ZWART}"/><circle cx="30" cy="-28" r="13" fill="${ZWART}"/><circle cy="4" r="38" fill="#FFFFFF" stroke="${ZWART}" stroke-width="2"/>` +
    `<ellipse cx="-15" cy="0" rx="9" ry="12" transform="rotate(25 -15 0)" fill="${ZWART}"/><ellipse cx="15" cy="0" rx="9" ry="12" transform="rotate(-25 15 0)" fill="${ZWART}"/>` +
    `<circle cx="-14" cy="-1" r="3.4" fill="#fff"/><circle cx="14" cy="-1" r="3.4" fill="#fff"/><ellipse cy="14" rx="5.5" ry="4" fill="${ZWART}"/><path d="M0,18 L0,22 M-5,24 C-2,27 2,27 5,24" ${lijnZw}/>${wangen(25, 16)}`,
  leeuw: ({ hx }) => {
    let mane = "";
    for (let k = 0; k < 14; k++) { const a = k * (Math.PI * 2 / 14); mane += `<circle cx="${f1(Math.cos(a) * 34)}" cy="${f1(Math.sin(a) * 34 + 2)}" r="14" fill="${dark(hx, 0.25)}"/>`; }
    return mane + `<circle cy="2" r="31" fill="${light(hx, 0.25)}"/><circle cx="-20" cy="-22" r="7" fill="${light(hx, 0.25)}"/><circle cx="20" cy="-22" r="7" fill="${light(hx, 0.25)}"/>` +
      `<ellipse cy="14" rx="13" ry="10" fill="${light(hx, 0.6)}"/><path d="M-5,8 L5,8 L0,13 Z" fill="${ZWART}"/><path d="M0,13 L0,17 M-6,19 C-3,22 3,22 6,19" ${lijnZw}/>${oog(-11, -3)}${oog(11, -3)}`;
  },
  kikker: ({ hx }) => `<circle cx="-20" cy="-18" r="15" fill="${hx}"/><circle cx="20" cy="-18" r="15" fill="${hx}"/><ellipse cy="10" rx="42" ry="30" fill="${hx}"/>` +
    `<circle cx="-20" cy="-19" r="9.5" fill="#fff"/><circle cx="20" cy="-19" r="9.5" fill="#fff"/>${oog(-19, -18, 5)}${oog(21, -18, 5)}` +
    `<path d="M-20,14 C-10,24 10,24 20,14" ${lijnZw}/><circle cx="-5" cy="4" r="1.6" fill="${dark(hx, 0.5)}"/><circle cx="5" cy="4" r="1.6" fill="${dark(hx, 0.5)}"/>${wangen(28, 14)}`,
  konijn: ({ hx }) => `<ellipse cx="-15" cy="-36" rx="10" ry="26" transform="rotate(-10 -15 -36)" fill="${hx}" stroke="${ZWART}" stroke-width="1.8"/><ellipse cx="15" cy="-36" rx="10" ry="26" transform="rotate(10 15 -36)" fill="${hx}" stroke="${ZWART}" stroke-width="1.8"/>` +
    `<ellipse cx="-15" cy="-34" rx="5" ry="17" transform="rotate(-10 -15 -34)" fill="#F7B7C8"/><ellipse cx="15" cy="-34" rx="5" ry="17" transform="rotate(10 15 -34)" fill="#F7B7C8"/>` +
    `<circle cy="12" r="31" fill="${hx}" stroke="${ZWART}" stroke-width="1.8"/><path d="M-4,17 L4,17 L0,21 Z" fill="#E85A8A"/><path d="M0,21 C-2,26 -7,27 -9,24 M0,21 C2,26 7,27 9,24" ${lijnZw}/>${oog(-12, 8)}${oog(12, 8)}${wangen(21, 20)}`,
  bij: ({ hx }) => `<ellipse cx="-12" cy="-22" rx="14" ry="10" transform="rotate(-30 -12 -22)" fill="#EAF4FF" stroke="#9AB" stroke-width="1.2" opacity=".9"/><ellipse cx="8" cy="-24" rx="14" ry="10" transform="rotate(25 8 -24)" fill="#EAF4FF" stroke="#9AB" stroke-width="1.2" opacity=".9"/>` +
    `<ellipse cx="0" cy="6" rx="30" ry="22" fill="${hx}"/><path d="M-12,-14 C-16,-6 -16,18 -12,26 L-4,27 C-8,18 -8,-6 -4,-15 Z M6,-15 C10,-6 10,18 6,27 L14,25 C18,16 18,-4 14,-12 Z" fill="${ZWART}"/>` +
    `<path d="M30,6 L40,8 L30,12 Z" fill="${ZWART}"/><circle cx="-24" cy="2" r="8" fill="${ZWART}"/><circle cx="-26" cy="0" r="2.4" fill="#fff"/><path d="M-28,-6 C-32,-14 -36,-16 -40,-16 M-24,-8 C-26,-16 -28,-20 -32,-22" ${lijnZw}/>`,
  lieveheer: ({ hx }) => `<path d="M-14,-28 C-12,-40 12,-40 14,-28" fill="${ZWART}"/><circle cy="-30" r="14" fill="${ZWART}"/><circle cx="-6" cy="-33" r="4" fill="#fff"/><circle cx="6" cy="-33" r="4" fill="#fff"/><circle cx="-5" cy="-33" r="1.8" fill="${ZWART}"/><circle cx="7" cy="-33" r="1.8" fill="${ZWART}"/>` +
    `<circle cy="6" r="34" fill="${hx}"/><path d="M0,-28 L0,40" stroke="${ZWART}" stroke-width="3"/><circle cx="-16" cy="-6" r="6" fill="${ZWART}"/><circle cx="16" cy="-6" r="6" fill="${ZWART}"/><circle cx="-20" cy="16" r="5" fill="${ZWART}"/><circle cx="20" cy="16" r="5" fill="${ZWART}"/><circle cx="-8" cy="30" r="4" fill="${ZWART}"/><circle cx="8" cy="30" r="4" fill="${ZWART}"/>` +
    `<ellipse cx="-18" cy="-10" rx="7" ry="4" transform="rotate(-35 -18 -10)" fill="#fff" opacity=".4"/><path d="M-6,-42 C-10,-50 -14,-52 -18,-50 M6,-42 C10,-50 14,-52 18,-50" ${lijnZw}/>`,
  kers: ({ hx }) => `<path d="M-14,20 C-10,-6 0,-26 8,-38 M16,16 C14,-6 10,-24 8,-38" stroke="#5B7D3A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M8,-38 C18,-48 34,-44 38,-34 C26,-30 14,-32 8,-38 Z" fill="#6FA34A"/>` +
    `<circle cx="-14" cy="26" r="17" fill="${hx}"/><circle cx="17" cy="22" r="17" fill="${dark(hx, 0.08)}"/><ellipse cx="-20" cy="20" rx="4.5" ry="3" fill="#fff" opacity=".8"/><ellipse cx="11" cy="16" rx="4.5" ry="3" fill="#fff" opacity=".8"/>`,
  aardbei: ({ hx }) => {
    let pit = "";
    [[-14, -6], [0, -10], [14, -6], [-20, 6], [-6, 4], [8, 4], [20, 6], [-12, 18], [2, 18], [14, 16], [-4, 30], [8, 28]].forEach(([x, y]) => (pit += `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="2.8" fill="#F6E27A"/>`));
    return `<path d="M0,44 C-22,34 -36,10 -34,-8 C-32,-22 -18,-26 0,-24 C18,-26 32,-22 34,-8 C36,10 22,34 0,44 Z" fill="${hx}"/>${pit}` +
      `<path d="M0,-22 L-20,-30 L-8,-26 L-14,-40 L-2,-28 L0,-44 L4,-28 L14,-40 L8,-26 L20,-30 Z" fill="#5FA34A"/><ellipse cx="-18" cy="-4" rx="5" ry="8" transform="rotate(20 -18 -4)" fill="#fff" opacity=".3"/>`;
  },
  wolkje: ({ hx }) => `<path d="M-38,18 C-50,18 -50,0 -36,-2 C-36,-18 -16,-24 -8,-12 C-2,-30 26,-28 26,-8 C42,-10 46,16 32,18 Z" fill="${hx}" stroke="${dark(hx, 0.12)}" stroke-width="1.6"/>` +
    `<path d="M-30,6 C-20,10 10,10 26,6" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`,
};
