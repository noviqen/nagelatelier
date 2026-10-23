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

function genereer({ sfeer = "verras", kleur = "vrij", niveau = 2 } = {}) {
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
  const vijf = res.nagels;
  return { shape, length, naam: res.naam, nails: vijf.concat(JSON.parse(JSON.stringify(vijf))), stijl: stijl.id };
}
