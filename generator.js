// Nagelatelier — designgenerator: sfeer + kleurwens + niveau → een kloppend design.
// Stijlen gebaseerd op populaire trends (French twist, aura, glazed, cat-eye, babyboomer, schildpad, ...),
// zelf samengesteld; niets is een kopie van een bestaand ontwerp.

const SFEREN = [
  ["verras", "Verras me"], ["trendy", "Trendy"], ["klassiek", "Klassiek"], ["romantisch", "Romantisch"],
  ["feest", "Feest"], ["herfst", "Herfst"], ["halloween", "Halloween"], ["winter", "Winter & kerst"],
  ["zomer", "Zomer"], ["bruiloft", "Bruiloft"],
];
const KLEURWENS = [
  ["vrij", "Alle kleuren", "conic-gradient(#f28daa,#f6d365,#b7e4c7,#7fb3e6,#b392d9,#f28daa)"],
  ["nude", "Nude", "#E7C2B0"], ["roze", "Roze", "#F28DAA"], ["rood", "Rood", "#C8102E"],
  ["donker", "Donker", "#4E0A16"], ["pastel", "Pastel", "linear-gradient(135deg,#FAD4DC,#BDE0FE,#B7E4C7)"],
  ["blauw", "Blauw", "#3A6EA5"], ["groen", "Groen", "#6E7B4F"], ["zwartwit", "Zwart-wit", "linear-gradient(135deg,#141214 50%,#fff 50%)"],
];
const NIVEAUS = [[1, "Makkelijk"], [2, "Gemiddeld"], [3, "Uitdagend"]];

const FAMILIE = {
  nude: { hoofd: ["#F6E3DC", "#EFD3C6", "#F2C9C4", "#E7C2B0", "#D9A88F"], accent: ["#FFFFFF", "#B07A63", "#F4EEE9"], deco: ["goud", "#FFFFFF", "rose"] },
  roze: { hoofd: ["#FAD4DC", "#F7B7C8", "#F28DAA", "#E85A8A", "#B5838D"], accent: ["#FFFFFF", "#D63A75", "#F6E3DC"], deco: ["#FFFFFF", "goud", "#D63A75"] },
  rood: { hoofd: ["#C8102E", "#A3001E", "#E63946", "#E8603C"], accent: ["#F2D7CF", "#FFFFFF", "#141214"], deco: ["goud", "#FFFFFF", "zilver"] },
  donker: { hoofd: ["#7A0019", "#4E0A16", "#1D2B4F", "#2E1638", "#1B3A2C", "#141214"], accent: ["#F4EEE9", "#E7C2B0", "#5B2A86"], deco: ["goud", "zilver", "rose"] },
  pastel: { hoofd: ["#FAD4DC", "#BDE0FE", "#CDB4DB", "#FFF1A8", "#B7E4C7", "#ECE4F7"], accent: ["#FFFFFF", "#F4EEE9"], deco: ["#FFFFFF", "goud", "#E85A8A"] },
  blauw: { hoofd: ["#DCEBF7", "#BDE0FE", "#7FB3E6", "#3A6EA5", "#1D2B4F"], accent: ["#FFFFFF", "#F4EEE9", "#D9D4CF"], deco: ["zilver", "#FFFFFF", "goud"] },
  groen: { hoofd: ["#D8F3DC", "#B7E4C7", "#9DB8A0", "#6E7B4F", "#2D6A4F"], accent: ["#F4EEE9", "#FFFFFF", "#E7C2B0"], deco: ["goud", "#FFFFFF", "rose"] },
  zwartwit: { hoofd: ["#141214", "#FFFFFF", "#F4EEE9"], accent: ["#141214", "#FFFFFF"], deco: ["zilver", "goud", "#FFFFFF"] },
};
const SFEER_KLEUR = {
  verras: null, trendy: ["nude", "roze", "pastel", "blauw", "donker"], klassiek: ["nude", "rood", "roze"],
  romantisch: ["roze", "nude", "rood"], feest: ["donker", "rood", "zwartwit", "roze"], herfst: ["donker", "groen", "nude"],
  halloween: ["zwartwit", "donker"], winter: ["blauw", "rood", "donker", "zwartwit"], zomer: ["pastel", "roze", "groen", "blauw"],
  bruiloft: ["nude", "pastel"],
};
const HERFST = ["#7A0019", "#B5652B", "#6E7B4F", "#E9C46A", "#4E0A16"];

const kies = (a) => a[Math.floor(Math.random() * a.length)];
const kans = (p) => Math.random() < p;
const nagel = (c, fx = "effen", c2 = "#FFFFFF", deco = [], fin = "glans") => ({ c, c2, fx, fin, deco });
const dc = (t, x, y, s, c, r = 0) => ({ t, x: Math.round(x), y: Math.round(y), s: Math.round(s ?? VERSIERING[t].maat), r, c: c ?? VERSIERING[t].kleur });
const licht = (c) => lum(METAAL[c] || c) > 0.6;

// versiering(en) op één nagel, netjes geplaatst
function decoOp(t, L, c, stijl = "midden") {
  const m = -L * 0.44;
  switch (stijl) {
    case "drie": return [dc(t, 0, m - 18, null, c), dc(t, -9, m + 6, (VERSIERING[t].maat) * 0.7, c), dc(t, 10, m + 24, (VERSIERING[t].maat) * 0.55, c)];
    case "rij": return [dc(t, 0, -26, VERSIERING[t].maat * 0.6, c), dc(t, 0, -44, VERSIERING[t].maat * 0.6, c), dc(t, 0, -62, VERSIERING[t].maat * 0.6, c)];
    case "riem": return [dc(t, 0, -22, VERSIERING[t].maat * 0.75, c)];
    case "groot": return [dc(t, 0, m, VERSIERING[t].maat * 1.25, c, kies([-12, 0, 10]))];
    default: return [dc(t, 0, m, null, c, t === "blad" || t === "maan" ? kies([-15, 0, 18]) : 0)];
  }
}

// ---------- stijlen ----------
// elke stijl: niveau, sferen, maak(p) → {naam, nagels(5)}
const STIJLEN = [
  { id: "accent", niveau: 1, sferen: ["verras", "klassiek", "feest", "herfst", "winter", "romantisch", "trendy"],
    maak: ({ h, a, dk, L, sfeer, niv }) => {
      const soort = kies(niv >= 2 ? ["glitter", "chroom", "deco", "french"] : ["glitter", "chroom", "deco"]);
      const ring = soort === "glitter" ? nagel(h, "glitter", licht(h) ? "#D9DDE2" : "#E9C46A")
        : soort === "chroom" ? nagel(licht(h) ? "#F4EEE9" : h, "chroom")
        : soort === "french" ? nagel("#F2D7CF", "french", h)
        : nagel(a, "effen", "#fff", decoOp(decoVoor(sfeer, niv), L, dk, kies(["midden", "drie", "groot"])));
      return { naam: `${cap(kn(h))} met ${({ glitter: "glitter-accent", chroom: "chroom-accent", deco: "versierde accentnagel", french: "French-accent" })[soort]}`,
        nagels: [nagel(h), nagel(h), nagel(h), ring, nagel(h)] };
    } },
  { id: "french", niveau: 2, sferen: ["klassiek", "bruiloft", "trendy", "romantisch", "verras", "zomer"],
    maak: ({ h, a, dk, L, sfeer, niv }) => {
      const tip = kies([h, h, "#FFFFFF"]);
      const basis = kies(["#F2D7CF", "#F6E3DC", "#EFD3C6"]);
      const n = () => nagel(basis, "french", tip === basis ? "#FFFFFF" : tip);
      const ring = kans(0.5) ? nagel(basis, "effen", "#fff", decoOp(decoVoor(sfeer, niv), L, dk, "midden")) : n();
      return { naam: tip === "#FFFFFF" ? "Klassieke French" : `French met ${kn(tip)} tip`, nagels: [n(), n(), n(), ring, n()] };
    } },
  { id: "ombre", niveau: 2, sferen: ["klassiek", "bruiloft", "romantisch", "verras", "trendy"],
    maak: ({ h }) => {
      const boven = licht(h) ? "#FFFFFF" : h, basis = licht(h) ? h : "#F2CFC8";
      return { naam: boven === "#FFFFFF" ? "Babyboomer ombré" : `Ombré naar ${kn(boven)}`, nagels: Array(5).fill(0).map(() => nagel(basis, "ombre", boven)) };
    } },
  { id: "aura", niveau: 2, sferen: ["trendy", "zomer", "romantisch", "verras"],
    maak: ({ h }) => {
      const gloed = licht(h) ? kies(["#E85A8A", "#B392D9", "#7FB3E6", "#F28DAA"]) : h;
      const basis = kies(["#F6E3DC", "#F4EEE9"]);
      return { naam: `Aura in ${kn(gloed)}`, nagels: Array(5).fill(0).map(() => nagel(basis, "aura", gloed)) };
    } },
  { id: "skittle", niveau: 1, sferen: ["zomer", "trendy", "verras", "herfst"],
    maak: ({ fam, sfeer }) => {
      const pal = sfeer === "herfst" ? HERFST : [...FAMILIE[fam].hoofd];
      pal.sort(() => Math.random() - 0.5);
      return { naam: sfeer === "herfst" ? "Herfstpalet" : "Kleurenmix", nagels: [0, 1, 2, 3, 4].map((i) => nagel(pal[i % pal.length])) };
    } },
  { id: "cateye", niveau: 2, sferen: ["feest", "winter", "trendy", "verras", "halloween"],
    maak: ({ h }) => {
      const basis = lum(h) < 0.1 ? h : dark(h, 0.55);
      const glans = kies(["#E9E4FF", "#D9DDE2", "#F6D365"]);
      return { naam: "Cat-eye glans", nagels: Array(5).fill(0).map(() => nagel(basis, "cateye", glans)) };
    } },
  { id: "chroom", niveau: 1, sferen: ["trendy", "bruiloft", "feest", "winter", "verras"],
    maak: ({ h }) => {
      const basis = kies(["#F4EEE9", "#F3E6DE", licht(h) ? h : "#F4EEE9"]);
      return { naam: basis === h ? `Chroom ${kn(h)}` : "Glazed chroom", nagels: Array(5).fill(0).map(() => nagel(basis, "chroom")) };
    } },
  { id: "marmer", niveau: 3, sferen: ["trendy", "klassiek", "feest", "verras", "bruiloft"],
    maak: ({ h, dk, L }) => {
      const ader = licht(h) ? "#8A8380" : h, vol = licht(h) ? "#141214" : h;
      return { naam: `Marmer met ${kn(vol)}`, nagels: [nagel("#FAF7F4", "marmer", ader), nagel(vol),
        nagel("#FAF7F4", "marmer", ader, kans(0.6) ? [dc("lijn", 0, -L * 0.5, 110, "goud", -28)] : []), nagel("#FAF7F4", "marmer", ader), nagel(vol)] };
    } },
  { id: "schildpad", niveau: 3, sferen: ["herfst", "trendy", "verras"],
    maak: () => {
      const naast = kies(["#E7C2B0", "#F2D7CF", "#4E0A16"]);
      return { naam: "Schildpad", nagels: [nagel(naast), nagel("#B8732E", "schildpad", "#3A1C0D"), nagel(naast), nagel("#B8732E", "schildpad", "#3A1C0D"), nagel(naast)] };
    } },
  { id: "minimal", niveau: 1, sferen: ["romantisch", "klassiek", "zomer", "verras", "trendy", "bruiloft"],
    maak: ({ L, dk, sfeer, niv }) => {
      const t = decoVoor(sfeer, niv, ["stip", "hart", "twinkel", "ster", "steentje", "bloem"]);
      const basis = kies(["#F6E3DC", "#F2C9C4", "#F4EEE9"]);
      const fx = basis === "#F4EEE9" ? "milky" : "effen";
      const c = licht(dk) && lum(basis) > 0.7 && !METAAL[dk] ? "#C8102E" : dk;
      return { naam: `Minimal met ${VERSIERING[t].naam.toLowerCase()}s`, nagels: [0, 1, 2, 3, 4].map((i) => nagel(basis, fx, "#fff", i % 2 === 1 || i === 3 ? decoOp(t, L, c, kies(["midden", "riem"])) : [])) };
    } },
  { id: "milky", niveau: 1, sferen: ["bruiloft", "klassiek", "romantisch", "winter"],
    maak: ({ L }) => {
      const t = kies(["parel", "steentje"]);
      return { naam: t === "parel" ? "Milky met pareltjes" : "Milky met steentjes", nagels: [nagel("#F4EEE9", "milky"), nagel("#F4EEE9", "milky"), nagel("#F4EEE9", "milky"),
        nagel("#F4EEE9", "milky", "#fff", decoOp(t, L, VERSIERING[t].kleur, "rij")), nagel("#F4EEE9", "milky")] };
    } },
  { id: "seizoen", niveau: 2, sferen: ["halloween", "winter", "herfst", "zomer", "romantisch"],
    maak: ({ h, a, dk, L, sfeer, niv }) => {
      const t = decoVoor(sfeer, niv);
      const basis = sfeer === "halloween" ? kies(["#141214", "#E76F2E"]) : h;
      const tweede = sfeer === "halloween" ? (basis === "#141214" ? "#E76F2E" : "#141214") : a;
      const dkl = sfeer === "halloween" ? (t === "web" ? (basis === "#141214" ? "#141214" : "#FFFFFF") : "goud") : dk;
      const accent = nagel(tweede, "effen", "#fff", t === "web" ? [dc("web", -20, -L * 0.75, 90, dkl)] : decoOp(t, L, tweede === "#FFFFFF" && dkl === "#FFFFFF" ? "#C8102E" : dkl, "groot"));
      const m = nagel(tweede, "effen", "#fff", decoOp(kies(["stip", "ster", "twinkel"]), L, dkl, "drie"));
      return { naam: ({ halloween: "Spooky", winter: "Winterse vlokjes", herfst: "Herfstblaadjes", zomer: "Zomerse vrolijkheid", romantisch: "Lieve hartjes" })[sfeer] || "Seizoensdesign",
        nagels: [nagel(basis), nagel(basis), niv >= 2 ? m : nagel(basis), accent, nagel(basis)] };
    } },
];

function decoVoor(sfeer, niv, uit) {
  const per = {
    halloween: ["web", "maan", "ster"], winter: ["sneeuw", "ster", "twinkel"], herfst: ["blad", "blad", "maan"],
    zomer: ["smiley", "bloem", "vlinder", "madelief"], romantisch: ["hart", "strik", "bloem"], bruiloft: ["parel", "madelief", "steentje", "strik"],
    feest: ["steentje", "twinkel", "ster"], trendy: ["twinkel", "strik", "hart", "smiley"], klassiek: ["steentje", "stip", "lijn"],
  };
  let lijst = uit || per[sfeer] || ["hart", "ster", "twinkel", "bloem", "steentje", "stip", "vlinder", "maan"];
  lijst = lijst.filter((t) => ((VERSIER[t] || {}).niveau || 1) <= niv);
  if (!lijst.length) lijst = ["steentje", "stip", "twinkel"].filter((t) => ((VERSIER[t] || {}).niveau || 1) <= niv);
  return kies(lijst);
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function genereer(opt = {}) {
  // probeer tot het stappenplan echt binnen het gekozen niveau valt
  let laatste;
  for (let k = 0; k < 40; k++) { laatste = genereer1(opt); if (maakStappenplan(laatste).niveau <= (opt.niveau || 2)) return laatste; }
  return laatste;
}
function genereer1({ sfeer = "verras", kleur = "vrij", niveau = 2 } = {}) {
  let fam = kleur;
  if (fam === "vrij") fam = kies(SFEER_KLEUR[sfeer] || Object.keys(FAMILIE));
  const F = FAMILIE[fam];
  // stijl kiezen: past bij sfeer en niveau; voorkeur voor het gekozen niveau
  let kandidaten = STIJLEN.filter((s) => s.niveau <= niveau && (sfeer === "verras" || s.sferen.includes(sfeer)));
  if (!kandidaten.length) kandidaten = STIJLEN.filter((s) => s.niveau <= niveau);
  const gewogen = kandidaten.flatMap((s) => Array(s.niveau === niveau ? 3 : 1).fill(s));
  const stijl = kies(gewogen);
  // vorm en lengte
  const vormen = { klassiek: ["oval", "squoval", "round"], bruiloft: ["almond", "oval"], feest: ["almond", "coffin", "stiletto"], halloween: ["stiletto", "coffin", "almond"], trendy: ["almond", "coffin", "squoval"] }[sfeer] || ["almond", "oval", "squoval", "round", "coffin"];
  const shape = kies(niveau === 1 ? vormen.filter((v) => v !== "stiletto").concat(["oval"]) : vormen);
  const lengtes = niveau === 1 ? ["kort", "middel"] : sfeer === "halloween" || sfeer === "feest" ? ["middel", "lang"] : ["kort", "middel", "middel", "lang"];
  const length = shape === "stiletto" ? "lang" : kies(lengtes);
  const L = nailLen(shape, length);
  let h = kies(F.hoofd), a = kies(F.accent.filter((x) => x !== h)) || "#FFFFFF", dk = kies(F.deco);
  if (sfeer === "herfst" && kleur === "vrij") { h = kies(HERFST); }
  const res = stijl.maak({ h, a, dk, L, fam, sfeer, niv: niveau });
  const vijf = verrijk(res.nagels, niveau, L, sfeer);
  return { shape, length, naam: res.naam, nails: vijf.concat(JSON.parse(JSON.stringify(vijf))), stijl: stijl.id };
}

// ---------- thema-sets: elke nagel anders, samen één verhaal ----------
SFEREN.splice(1, 0, ["speels", "Speels & dieren"], ["tropisch", "Tropisch & zee"], ["bloemen", "Bloemen"], ["grafisch", "Lijnen & grafisch"], ["print", "Dierenprint"]);
Object.assign(SFEER_KLEUR, { speels: ["pastel", "roze", "blauw", "groen"], tropisch: ["blauw", "roze", "groen"], bloemen: ["blauw", "roze", "nude", "pastel"], grafisch: ["zwartwit", "roze", "blauw", "rood", "donker"], print: ["nude", "zwartwit", "roze", "donker"] });

const NUDE = ["#F2D7CF", "#F6E3DC", "#EFD3C6"];
const mengen = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const metV = (n, v, c3) => Object.assign(n, { v, ...(c3 ? { c3 } : {}) });
const hoekPlek = (t, L, c, kant = kies([-1, 1])) => [dc(t, kant * 30, -L * 0.32, VERSIERING[t].maat * 1.05, c, kant * 20)];
const tipPlek = (t, L, c) => [dc(t, kies([-8, 0, 8]), -L * 0.7, VERSIERING[t].maat * 0.9, c, kies([-15, 0, 15]))];
// vijf nagels; duim (0) en middelvinger (2) vaak het 'rustpunt', ring (3) het pronkstuk
const set5 = (lijst) => { const l = mengen(lijst); return [l[0], l[1], l[2], l[3], l[4]]; };

STIJLEN.push(
  { id: "tropisch", niveau: 3, sferen: ["tropisch", "zomer", "verras", "bloemen"],
    maak: ({ fam, L }) => {
      const zee = fam === "roze" ? "#F7B7C8" : fam === "groen" ? "#B7E4C7" : "#BDE0FE";
      const bloem = fam === "roze" ? "#E85A8A" : fam === "groen" ? "#2D6A4F" : "#3FA7D6";
      const basis = kies(NUDE);
      const nagels = set5([
        metV(nagel(basis, "zee", zee), 0, dark(zee, 0.4)),
        nagel(basis, "golffrench", zee, [...decoOp("hibiscus", L, bloem, "midden")]),
        nagel(basis, "zee", zee, [dc("zeester", -10, -L * 0.62, 26, "goud", -12), dc("schelp", 12, -L * 0.52, 22, "goud", 10), dc("bolletje", 2, -L * 0.74, 8, "goud")]),
        nagel(basis, "effen", "#fff", [dc("bloem3d", 0, -L * 0.45, 62, bloem, kies([0, 15, 30])), dc("bolletje", 4, -L * 0.45, 6, "goud")]),
        nagel(basis, "french", zee, hoekPlek("hibiscus", L, bloem)),
      ]);
      return { naam: fam === "roze" ? "Tropische roze bloemen" : "Tropische zee", nagels };
    } },
  { id: "bloemen3d", niveau: 3, sferen: ["bloemen", "trendy", "bruiloft", "zomer", "verras"],
    maak: ({ fam, L }) => {
      const bc = fam === "roze" ? "#E85A8A" : fam === "pastel" ? kies(["#B392D9", "#F28DAA"]) : fam === "nude" ? "#B07A63" : "#3A6EA5";
      const basis = kies(["#E7C2B0", "#EFD3C6", "#F2D7CF"]), tip = "#FFFFFF";
      const plek = [
        () => [dc("bloem3d", 0, -L * 0.42, 66, bc, kies([0, 20])) ],
        () => [dc("bloem3d", kies([-1, 1]) * 26, -L * 0.62, 58, bc, 25)],
        () => [dc("bloem3d", kies([-1, 1]) * 30, -L * 0.36, 60, bc, -15)],
        () => [dc("bloem3d", 0, -L * 0.3, 54, bc, 10)],
        () => [dc("bloem3d", kies([-1, 1]) * 22, -L * 0.48, 64, bc, 35)],
      ];
      return { naam: `3D-bloemen in ${kn(bc)}`, nagels: set5(plek.map((p) => nagel(basis, "french", tip, p()))) };
    } },
  { id: "dierentuin", niveau: 3, sferen: ["speels", "verras", "zomer"],
    maak: ({ fam, L }) => {
      const pal = mengen([...(FAMILIE[fam] || FAMILIE.pastel).hoofd]).filter((c) => lum(c) > 0.35);
      const dieren = mengen(["beer", "kat", "panda", "leeuw", "kikker", "konijn"]).slice(0, 3);
      const bg = (i) => pal[i % pal.length] || "#FAD4DC";
      const n = [
        nagel(bg(0), "effen", "#fff", decoOp(dieren[0], L, VERSIERING[dieren[0]].kleur, "groot")),
        metV(nagel(bg(1), "strepen", "#FFFFFF"), 1),
        nagel(bg(2), "effen", "#fff", decoOp(dieren[1], L, VERSIERING[dieren[1]].kleur, "groot")),
        nagel(bg(3), "effen", "#fff", decoOp("stip", L, "#FFFFFF", "drie")),
        nagel(bg(4), "effen", "#fff", decoOp(dieren[2], L, VERSIERING[dieren[2]].kleur, "groot")),
      ];
      return { naam: "Dierentuintje", nagels: n };
    } },
  { id: "regenboogset", niveau: 3, sferen: ["speels", "zomer", "verras", "grafisch"],
    maak: ({ L }) => {
      const fel = kans(0.35) ? 1 : 0;
      const pal = REGENBOOG[fel ? "fel" : "pastel"];
      return { naam: fel ? "Felle regenboog" : "Pastel regenboog", nagels: set5([
        metV(nagel("#FFFFFF", "regenboog"), fel),
        nagel("#BDE0FE", "effen", "#fff", decoOp("wolkje", L, "#FFFFFF", "groot")),
        metV(nagel("#FFFFFF", "strepen", pal[0]), 2, pal[4]),
        nagel(pal[kies([2, 4, 5])]),
        nagel("#F4EEE9", "milky", "#fff", [dc("stip", -12, -L * 0.3, 12, pal[0]), dc("stip", 6, -L * 0.45, 12, pal[2]), dc("stip", -4, -L * 0.6, 12, pal[4])]),
      ]) };
    } },
  { id: "printmix", niveau: 2, sferen: ["print", "trendy", "feest", "verras", "herfst"],
    maak: ({ fam }) => {
      const zw = fam === "zwartwit";
      const roze = fam === "roze";
      const leo = roze ? ["#F7B7C8", "#E85A8A"] : ["#E7C2B0", "#B5652B"];
      return { naam: zw ? "Zebra & zwart-wit" : roze ? "Roze luipaard" : "Luipaard & nude", nagels: set5([
        nagel(leo[0], "luipaard", leo[1]),
        zw ? nagel("#FFFFFF", "zebra", "#141214") : nagel(leo[0], "luipaard", leo[1]),
        nagel(zw ? "#141214" : roze ? "#E85A8A" : "#B07A63"),
        nagel("#F2D7CF", "vfrench", zw ? "#141214" : leo[1]),
        zw ? nagel("#FFFFFF", "zebra", "#141214") : nagel("#141214", "effen", "#fff", decoOp("steentje", nailLen("almond", "middel"), "#FFFFFF", "riem")),
      ]) };
    } },
  { id: "grafisch", niveau: 2, sferen: ["grafisch", "trendy", "verras", "klassiek"],
    maak: ({ fam, h, a, niv }) => {
      const k1 = fam === "zwartwit" ? "#141214" : h, k2 = fam === "zwartwit" ? "#FFFFFF" : (lum(h) > 0.5 ? "#FFFFFF" : a);
      return { naam: "Lijnenspel", nagels: set5([
        metV(nagel(k2, "strepen", k1), kies([0, 1])),
        niv >= 3 ? metV(nagel(k2, "ruit", k1), kies([0, 1])) : nagel(k2, "vfrench", k1),
        metV(nagel(k2, "swirl", k1), 0, fam === "zwartwit" ? "#9A938C" : light(k1, 0.4)),
        nagel(k1),
        metV(nagel(k2, "golffrench", k1), 0, light(k1, 0.35)),
      ]) };
    } },
  { id: "fruit", niveau: 2, sferen: ["speels", "zomer", "verras", "romantisch"],
    maak: ({ L, niv }) => ({ naam: "Fruitpicknick", nagels: set5([
      nagel("#FFFFFF", "effen", "#fff", decoOp("kers", L, "#C8102E", "groot")),
      nagel("#FAD4DC", "effen", "#fff", decoOp("aardbei", L, "#E63946", "groot")),
      niv >= 3 ? metV(nagel("#FFFFFF", "ruit", "#E63946"), 0) : metV(nagel("#FFFFFF", "strepen", "#E63946"), 1),
      nagel("#C8102E"),
      nagel("#FAD4DC", "effen", "#fff", decoOp("stip", L, "#FFFFFF", "drie")),
    ]) }) },
  { id: "lentebeestjes", niveau: 3, sferen: ["speels", "zomer", "bloemen", "verras"],
    maak: ({ L }) => ({ naam: "Lentebeestjes", nagels: set5([
      nagel("#B7E4C7", "effen", "#fff", decoOp("lieveheer", L, "#E63946", "groot")),
      nagel("#FFF1A8", "effen", "#fff", decoOp("bij", L, "#F6C945", "groot")),
      nagel("#F4EEE9", "milky", "#fff", decoOp("madelief", L, "#FFFFFF", "groot")),
      nagel("#BDE0FE", "effen", "#fff", decoOp("bloem", L, "#FFFFFF", "drie")),
      nagel("#B7E4C7"),
    ]) }) },
  { id: "zeemans", niveau: 2, sferen: ["tropisch", "zomer", "klassiek", "verras"],
    maak: ({ L, niv }) => ({ naam: "Aan zee", nagels: set5([
      metV(nagel("#FFFFFF", "strepen", "#1D2B4F"), 2),
      nagel("#1D2B4F", "effen", "#fff", [dc("zeester", 0, -L * 0.45, 30, "goud", 10)]),
      niv >= 3 ? metV(nagel("#F2D7CF", "zee", "#BDE0FE"), 0, "#3A6EA5") : nagel("#BDE0FE"),
      nagel("#FFFFFF", "effen", "#fff", [dc("schelp", 0, -L * 0.42, 30, "goud")]),
      nagel("#1D2B4F"),
    ]) }) },
  { id: "charms", niveau: 1, sferen: ["feest", "trendy", "bruiloft", "tropisch", "verras"],
    maak: ({ h, L }) => {
      const basis = kies([h, "#F4EEE9", "#F2D7CF"]);
      return { naam: "Gouden bedeltjes", nagels: set5([
        nagel(basis), nagel(basis, "effen", "#fff", [dc(kies(["zeester", "schelp"]), 0, -L * 0.42, 28, "goud", 8)]),
        nagel(basis, "chroom"), nagel(basis, "effen", "#fff", [dc("bolletje", -8, -24, 8, "goud"), dc("bolletje", 0, -36, 9, "goud"), dc("bolletje", 8, -24, 8, "goud")]),
        nagel(basis),
      ]) };
    } },
);
// regenboog/strepen tonen in de keuzes voor bestaande sferen
["zomer", "trendy"].forEach(() => {});

// ---------- verrijken: meer lagen en details per nagel ----------
const SOORT = {
  bloem: ["hibiscus", "bloem", "madelief", "bloem3d"], dier: ["beer", "kat", "panda", "leeuw", "kikker", "konijn"],
  insect: ["bij", "lieveheer"], fruit: ["kers", "aardbei"], zee: ["zeester", "schelp"], hemel: ["maan", "ster", "twinkel", "sneeuw", "wolkje"],
};
const soortVan = (t) => Object.keys(SOORT).find((k) => SOORT[k].includes(t));
const binnen = (x, y, L) => [Math.max(-36, Math.min(36, x)), Math.max(-L + 14, Math.min(-12, y))];
function plaats(lijst, t, x, y, s, c, L, r = 0) { const [px, py] = binnen(x, y, L); lijst.push(dc(t, px, py, s, c, r)); }

const AANVUL = { ombre: ["french", "aura", "glitter"], aura: ["chroom", "french", "glitter"], chroom: ["swirl", "vfrench", "glitter"], cateye: ["glitter", "vfrench"],
  french: ["golffrench", "vfrench", "glitter"], milky: ["french", "chroom", "glitter"], glitter: ["french", "vfrench"], schildpad: ["french", "glitter"], marmer: ["golffrench", "vfrench"], effen: ["glitter", "french", "swirl", "vfrench"] };
function aanvul(n, fx) {
  const m = JSON.parse(JSON.stringify(n)); m.fx = fx;
  const donker = lum(n.c) < 0.35, kern = n.fx === "french" || n.fx === "ombre" ? n.c2 : n.c;
  if (["french", "vfrench", "golffrench"].includes(fx)) { m.c = donker ? "#F2D7CF" : n.c; m.c2 = kern; if (fx === "golffrench") m.c3 = "#E9C46A"; }
  else if (fx === "glitter") { m.c = n.fx === "ombre" || n.fx === "aura" ? n.c2 === "#FFFFFF" ? n.c : n.c2 : n.c; m.c2 = kies(["#E9C46A", "#D9DDE2"]); }
  else if (fx === "swirl") { m.c = n.c; m.c2 = kies(["#E9C46A", "#FFFFFF"]); m.c3 = "#D9DDE2"; }
  else if (fx === "aura") { m.c = "#F6E3DC"; m.c2 = donker ? n.c : n.c2 || "#E85A8A"; }
  else if (fx === "chroom") { m.c = "#F4EEE9"; }
  m.deco = [];
  return m;
}
function verrijk(nagels, niveau, L, sfeer) {
  // eentonige sets: één of twee nagels een aanvullende techniek
  if (niveau >= 2 && nagels.every((n) => n.fx === nagels[0].fx && n.c === nagels[0].c && !(n.deco || []).length) && AANVUL[nagels[0].fx]) {
    const opties = AANVUL[nagels[0].fx];
    nagels[3] = aanvul(nagels[3], kies(opties));
    if (niveau >= 3) nagels[1] = aanvul(nagels[1], kies(opties));
  }
  const kans1 = niveau >= 3 ? 0.9 : niveau === 2 ? 0.55 : 0.25;
  let gedaan = 0;
  nagels.forEach((n, i) => {
    if (!kans(kans1) && !(niveau >= 3 && gedaan < 2 && i >= 3)) return;
    const lichtBasis = lum(n.c) > 0.72;
    const stipKl = lichtBasis ? kies(["goud", "#E85A8A", "#3A6EA5"]) : "#FFFFFF";
    const d = n.deco || (n.deco = []);
    const voor = d.length;
    const hoofd = d.slice().sort((a, b) => b.s - a.s)[0];
    if (hoofd && VERSIERING[hoofd.t]) {
      const { x, y, s } = hoofd, so = soortVan(hoofd.t);
      if (so === "bloem") {
        const blad = kies(["#6E7B4F", "goud", "#2D6A4F"]);
        plaats(d, "blad", x - s * 0.55, y + s * 0.42, s * 0.42, blad, L, -40);
        if (niveau >= 3) plaats(d, "blad", x + s * 0.55, y + s * 0.38, s * 0.36, blad, L, 40);
        if (niveau >= 3 && hoofd.t !== "bloem3d") plaats(d, hoofd.t, x + s * 0.5, y + s * 0.62, s * 0.55, hoofd.c, L, 25);
        if (niveau >= 3 && hoofd.t === "bloem3d") plaats(d, "bloem3d", x - s * 0.45, y - s * 0.62, s * 0.5, hoofd.c, L, 30);
        [[0.1, -0.68], [0.42, -0.5], [-0.42, -0.55]].slice(0, niveau >= 3 ? 3 : 2).forEach(([dx, dy], k) => plaats(d, "stip", x + s * dx, y + s * dy, 6 + k * 1.5, stipKl, L));
      } else if (so === "dier") {
        const hk = kies(["#E85A8A", "#F28DAA", "#C8102E"]);
        plaats(d, "hart", x - s * 0.5, y - s * 0.55, s * 0.24, hk, L, -15);
        plaats(d, "hart", x + s * 0.48, y - s * 0.45, s * 0.18, hk, L, 15);
        if (niveau >= 3) { plaats(d, "strik", x + s * 0.32, y - s * 0.52, s * 0.34, kies(["#E85A8A", "#C8102E", "#FFFFFF", "#3A6EA5"]), L, 15); plaats(d, "twinkel", x + s * 0.48, y + s * 0.55, s * 0.24, "goud", L); plaats(d, "stip", x - s * 0.48, y + s * 0.58, 7, stipKl, L); }
      } else if (so === "insect") {
        plaats(d, kies(["madelief", "bloem"]), x + s * 0.35, y + s * 0.65, s * 0.42, "#FFFFFF", L);
        [[-0.5, -0.4], [-0.62, -0.1], [-0.55, 0.22]].forEach(([dx, dy]) => plaats(d, "stip", x + s * dx, y + s * dy, 3.4, lichtBasis ? "#141214" : "#FFFFFF", L));
      } else if (so === "fruit") {
        plaats(d, "hart", x + s * 0.45, y - s * 0.6, s * 0.2, "#E85A8A", L, 12);
        [[-0.5, -0.55], [0.5, 0.5], [-0.45, 0.55]].forEach(([dx, dy]) => plaats(d, "stip", x + s * dx, y + s * dy, 5, lichtBasis ? "#E63946" : "#FFFFFF", L));
      } else if (so === "zee") {
        plaats(d, "parel", x + s * 0.55, y + s * 0.4, 10, "#F4EEE6", L);
        plaats(d, "bolletje", x - s * 0.5, y - s * 0.45, 7, "goud", L);
        if (niveau >= 3) plaats(d, "bolletje", x - s * 0.15, y + s * 0.7, 5.5, "goud", L);
      } else if (so === "hemel") {
        plaats(d, "twinkel", x + s * 0.55, y - s * 0.4, s * 0.32, "goud", L);
        plaats(d, "stip", x - s * 0.5, y + s * 0.5, 4.5, "goud", L);
        if (niveau >= 3) plaats(d, "twinkel", x - s * 0.45, y - s * 0.6, s * 0.2, "goud", L);
      } else if (hoofd.t === "hart") {
        plaats(d, "hart", x + s * 0.6, y - s * 0.5, s * 0.5, hoofd.c, L, 15);
        if (niveau >= 3) plaats(d, "hart", x - s * 0.55, y + s * 0.55, s * 0.4, hoofd.c, L, -15);
      }
    } else {
      // kale nagel: kies een passend accent bij de techniek
      const fr = ["french", "golffrench", "vfrench"].includes(n.fx);
      const keuzes = n.fx === "regenboog" ? ["wolken"] : fr ? ["tiplijn", "riem", "steen"] : ["effen", "milky", "chroom", "aura", "ombre", "cateye", "glitter"].includes(n.fx) ? ["riem", "lijn", "sprinkel", "motief"] : ["riem", "steen", "bolletjes"];
      const keuze = kies(keuzes);
      const dTip = Math.max(30, (L - BED) * 0.85 + 18);
      if (keuze === "wolken") { plaats(d, "wolkje", -34, -L * 0.13, 26, "#FFFFFF", L); plaats(d, "wolkje", 34, -L * 0.13, 22, "#FFFFFF", L); if (niveau >= 3) plaats(d, "twinkel", 0, -L * 0.62, 18, "goud", L); }
      else if (keuze === "tiplijn") { d.push(dc("lijn", 0, -L + dTip + 2, 100, "goud", 0)); if (niveau >= 3) plaats(d, "steentje", 0, -L + dTip + 14, 9, "#FFFFFF", L); }
      else if (keuze === "riem") { const t = kies(["steentje", "parel"]); (niveau >= 3 ? [-18, -9, 0, 9, 18] : [-12, 0, 12]).forEach((x, k, arr) => plaats(d, t, x, -22 - Math.abs(x) * -0.12, k === Math.floor(arr.length / 2) ? 15 : 12, t === "parel" ? "#F4EEE6" : "#FFFFFF", L)); }
      else if (keuze === "lijn") { d.push(dc("lijn", 0, -L * 0.5, 110, kies(["goud", "zilver"]), kies([-30, 30, -60]))); if (niveau >= 3) plaats(d, "bolletje", 14, -L * 0.42, 6, "goud", L); }
      else if (keuze === "sprinkel") { for (let k = 0; k < (niveau >= 3 ? 5 : 3); k++) plaats(d, kies(["twinkel", "stip", "stip"]), -20 + Math.random() * 40, -L * (0.25 + Math.random() * 0.5), 5 + Math.random() * 9, lichtBasis ? "goud" : "#FFFFFF", L, Math.random() * 40); }
      else if (keuze === "motief") { const t = decoVoor(sfeer, niveau); d.push(...decoOp(t, L, lichtBasis ? (VERSIERING[t].kleur === "#FFFFFF" ? "goud" : VERSIERING[t].kleur) : "#FFFFFF", "midden")); }
      else if (keuze === "steen") { plaats(d, "steentje", 0, -27, 17, "#FFFFFF", L); if (niveau >= 3) { plaats(d, "steentje", -13, -21, 11, "#FFFFFF", L); plaats(d, "steentje", 13, -21, 11, "#FFFFFF", L); } }
      else plaats(d, "bolletje", 0, -24, 8, "goud", L);
    }
    // tweede laag bij uitdagend: rijtje steentjes/parels bij de nagelriem onder een hoog geplaatst motief
    if (niveau >= 3 && hoofd && hoofd.y < -L * 0.38 && !d.some((q) => q.y > -30) && kans(0.5)) {
      const t = kies(["steentje", "parel"]);
      [-12, 0, 12].forEach((x, k) => plaats(d, t, x, -22, k === 1 ? 14 : 11, t === "parel" ? "#F4EEE6" : "#FFFFFF", L));
    }
    if (d.length > voor) gedaan++;
    if (d.length > 11) d.length = 11;
  });
  return nagels;
}
