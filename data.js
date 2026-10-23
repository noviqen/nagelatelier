// Nagelatelier — alle keuzes: kleuren, vormen, effecten, versieringen en ideeën.
// Alles is zelf getekend/samengesteld; trends dienen alleen als inspiratie.

const KLEUREN = [
  { groep: "Nude", kleuren: [
    ["#F6E3DC", "Kokos"], ["#EFD3C6", "Vanille"], ["#F2C9C4", "Poederroze"],
    ["#E7C2B0", "Zand"], ["#D9A88F", "Karamel"], ["#B07A63", "Kaneel"] ] },
  { groep: "Roze", kleuren: [
    ["#FAD4DC", "Suikerspin"], ["#F7B7C8", "Ballet"], ["#F28DAA", "Flamingo"],
    ["#E85A8A", "Framboos"], ["#D63A75", "Fuchsia"], ["#B5838D", "Oudroze"] ] },
  { groep: "Rood", kleuren: [
    ["#E8603C", "Koraal"], ["#E63946", "Kers"], ["#C8102E", "Klassiek rood"],
    ["#A3001E", "Robijn"], ["#7A0019", "Bordeaux"], ["#4E0A16", "Wijn"] ] },
  { groep: "Oranje & geel", kleuren: [
    ["#FFF1A8", "Boter"], ["#F6D365", "Zon"], ["#E9C46A", "Mosterd"],
    ["#F4A261", "Abrikoos"], ["#E76F2E", "Pompoen"], ["#B5652B", "Terracotta"] ] },
  { groep: "Groen", kleuren: [
    ["#D8F3DC", "Munt"], ["#B7E4C7", "Mint"], ["#9DB8A0", "Salie"],
    ["#6E7B4F", "Olijf"], ["#2D6A4F", "Smaragd"], ["#1B3A2C", "Woud"] ] },
  { groep: "Blauw", kleuren: [
    ["#DCEBF7", "IJs"], ["#BDE0FE", "Babyblauw"], ["#7FB3E6", "Hemel"],
    ["#3FB8AF", "Lagune"], ["#3A6EA5", "Denim"], ["#1D2B4F", "Marine"] ] },
  { groep: "Paars", kleuren: [
    ["#ECE4F7", "Sering"], ["#CDB4DB", "Lavendel"], ["#B392D9", "Lila"],
    ["#8E5BBF", "Violet"], ["#5B2A86", "Pruim"], ["#2E1638", "Aubergine"] ] },
  { groep: "Neutraal", kleuren: [
    ["#FFFFFF", "Wit"], ["#F4EEE9", "Melkwit"], ["#D9D4CF", "Steen"],
    ["#9A938C", "Taupe"], ["#4A4543", "Antraciet"], ["#141214", "Zwart"] ] },
];

const KLEURNAAM = {};
KLEUREN.forEach((g) => g.kleuren.forEach(([hex, naam]) => (KLEURNAAM[hex.toUpperCase()] = naam)));

const VORMEN = [
  ["round", "Rond"], ["oval", "Ovaal"], ["almond", "Amandel"],
  ["squoval", "Squoval"], ["coffin", "Coffin"], ["stiletto", "Stiletto"],
];
const LENGTES = [["kort", "Kort"], ["middel", "Middel"], ["lang", "Lang"]];

const HUID = ["#F5D9C6", "#EBC2A4", "#D9A47E", "#BC8259", "#8F5C3C", "#5F3B27"];

// Effect/techniek. c2 = naam van de tweede kleur (null = maar één kleur)
const EFFECTEN = [
  { id: "effen", naam: "Effen", c2: null },
  { id: "french", naam: "French", c2: "Tip" },
  { id: "ombre", naam: "Ombré", c2: "Boven" },
  { id: "aura", naam: "Aura", c2: "Gloed" },
  { id: "chroom", naam: "Chroom", c2: null },
  { id: "cateye", naam: "Cat-eye", c2: "Glans" },
  { id: "glitter", naam: "Glitter", c2: "Glitter" },
  { id: "marmer", naam: "Marmer", c2: "Aders" },
  { id: "schildpad", naam: "Schildpad", c2: "Vlekken" },
  { id: "milky", naam: "Milky", c2: null },
];
const EFFECT = Object.fromEntries(EFFECTEN.map((e) => [e.id, e]));

// Versieringen; kleur = standaardkleur (of metaal: goud / rose / zilver)
const VERSIERINGEN = [
  { id: "hart", naam: "Hartje", kleur: "#C8102E", maat: 30 },
  { id: "ster", naam: "Ster", kleur: "goud", maat: 30 },
  { id: "twinkel", naam: "Twinkel", kleur: "goud", maat: 30 },
  { id: "bloem", naam: "Bloem", kleur: "#FFFFFF", maat: 38 },
  { id: "madelief", naam: "Madelief", kleur: "#FFFFFF", maat: 40 },
  { id: "blad", naam: "Blaadje", kleur: "goud", maat: 34 },
  { id: "maan", naam: "Maan", kleur: "goud", maat: 30 },
  { id: "steentje", naam: "Steentje", kleur: "#FFFFFF", maat: 20 },
  { id: "parel", naam: "Parel", kleur: "#F4EEE6", maat: 18 },
  { id: "strik", naam: "Strikje", kleur: "#141214", maat: 40 },
  { id: "vlinder", naam: "Vlinder", kleur: "#B392D9", maat: 40 },
  { id: "sneeuw", naam: "Sneeuwvlok", kleur: "#FFFFFF", maat: 40 },
  { id: "stip", naam: "Stip", kleur: "#FFFFFF", maat: 14 },
  { id: "lijn", naam: "Lijntje", kleur: "goud", maat: 100 },
  { id: "smiley", naam: "Smiley", kleur: "#F6D365", maat: 38 },
  { id: "web", naam: "Web", kleur: "#141214", maat: 70 },
];
const VERSIERING = Object.fromEntries(VERSIERINGEN.map((v) => [v.id, v]));

const DECO_KLEUREN = [
  ["goud", "Goud"], ["rose", "Rosé"], ["zilver", "Zilver"],
  ["#FFFFFF", "Wit"], ["#141214", "Zwart"], ["#F7B7C8", "Ballet"], ["#E85A8A", "Framboos"],
  ["#C8102E", "Rood"], ["#B392D9", "Lila"], ["#BDE0FE", "Babyblauw"], ["#B7E4C7", "Mint"],
  ["#F6D365", "Zon"], ["#E76F2E", "Pompoen"], ["#6E7B4F", "Olijf"],
];

// ---------- Ideeën (zelf samengesteld, geïnspireerd op populaire stijlen) ----------
// Elk idee: vorm, lengte en 5 nagels (duim → pink); linkerhand = gespiegeld.
const NG = (c, fx = "effen", c2 = "#FFFFFF", deco = [], fin = "glans") => ({ c, c2, fx, fin, deco });
const DC = (t, x, y, s, r = 0, c) => ({ t, x, y, s: s ?? VERSIERING[t].maat, r, c: c ?? VERSIERING[t].kleur });

const IDEEEN = [
  { naam: "Klassiek French", thema: "Klassiek", vorm: "almond", lengte: "middel",
    nagels: Array(5).fill(0).map(() => NG("#F2D7CF", "french", "#FFFFFF")) },
  { naam: "Rode klassieker", thema: "Klassiek", vorm: "oval", lengte: "middel",
    nagels: Array(5).fill(0).map(() => NG("#B10F2E")) },
  { naam: "Glazed", thema: "Trends", vorm: "almond", lengte: "middel",
    nagels: Array(5).fill(0).map(() => NG("#F3E6DE", "chroom")) },
  { naam: "Aura roze", thema: "Trends", vorm: "almond", lengte: "lang",
    nagels: Array(5).fill(0).map(() => NG("#F6E3DC", "aura", "#FF6FA5")) },
  { naam: "Milky twinkel", thema: "Trends", vorm: "oval", lengte: "middel",
    nagels: [NG("#F4EEE9", "milky"), NG("#F4EEE9", "milky"), NG("#F4EEE9", "milky"),
      NG("#F4EEE9", "milky", "#FFFFFF", [DC("twinkel", 8, -80, 30, 0), DC("twinkel", -16, -52, 16, 0)]), NG("#F4EEE9", "milky")] },
  { naam: "Cat-eye nacht", thema: "Trends", vorm: "almond", lengte: "lang",
    nagels: Array(5).fill(0).map(() => NG("#1D1B3A", "cateye", "#E9E4FF")) },
  { naam: "Bordeaux & goud", thema: "Herfst", vorm: "squoval", lengte: "middel",
    nagels: [NG("#5C0F1F"), NG("#5C0F1F"), NG("#5C0F1F", "effen", "#fff", [DC("blad", 10, -66, 40, 24, "goud"), DC("blad", -14, -40, 28, -30, "goud")]),
      NG("#5C0F1F", "glitter", "#E9C46A"), NG("#5C0F1F")] },
  { naam: "Herfstpalet", thema: "Herfst", vorm: "oval", lengte: "middel",
    nagels: [NG("#B5652B"), NG("#6E7B4F"), NG("#E7C2B0", "effen", "#fff", [DC("blad", 0, -60, 46, 18, "#B5652B")]), NG("#7A0019"), NG("#E9C46A")] },
  { naam: "Schildpad", thema: "Herfst", vorm: "almond", lengte: "middel",
    nagels: [NG("#E7C2B0"), NG("#B8732E", "schildpad", "#3A1C0D"), NG("#E7C2B0"), NG("#B8732E", "schildpad", "#3A1C0D"), NG("#E7C2B0")] },
  { naam: "Spooky", thema: "Halloween", vorm: "stiletto", lengte: "lang",
    nagels: [NG("#141214"), NG("#E76F2E"), NG("#141214", "effen", "#fff", [DC("maan", -6, -90, 34, 0, "goud"), DC("ster", 16, -56, 14, 12, "goud")]),
      NG("#E76F2E", "effen", "#fff", [DC("web", -20, -120, 90, 0, "#141214")]), NG("#141214")] },
  { naam: "Kerstglitter", thema: "Kerst & winter", vorm: "oval", lengte: "middel",
    nagels: [NG("#A3001E"), NG("#A3001E"), NG("#A3001E", "effen", "#fff", [DC("sneeuw", 0, -64, 50, 0, "#FFFFFF")]),
      NG("#A3001E", "glitter", "#E9C46A"), NG("#A3001E")] },
  { naam: "Winterwit", thema: "Kerst & winter", vorm: "almond", lengte: "middel",
    nagels: [NG("#DCEBF7", "chroom"), NG("#F4EEE9", "milky"), NG("#DCEBF7", "chroom"),
      NG("#F4EEE9", "milky", "#fff", [DC("sneeuw", 4, -70, 46, 10, "zilver"), DC("steentje", -16, -36, 14)]), NG("#DCEBF7", "chroom")] },
  { naam: "Valentijn", thema: "Valentijn", vorm: "almond", lengte: "middel",
    nagels: [NG("#F6D5D5", "effen", "#fff", [DC("hart", 0, -60, 26)]), NG("#F6D5D5", "effen", "#fff", [DC("hart", 6, -70, 18)]),
      NG("#F6D5D5", "effen", "#fff", [DC("hart", -8, -56, 22)]), NG("#C8102E"), NG("#F6D5D5", "effen", "#fff", [DC("hart", 0, -64, 18)])] },
  { naam: "Roze French hartjes", thema: "Valentijn", vorm: "coffin", lengte: "middel",
    nagels: Array(5).fill(0).map((_, i) => NG("#F7E1DC", "french", "#E85A8A", i === 3 ? [DC("hart", 0, -46, 20, 0, "#E85A8A")] : [])) },
  { naam: "Bruidsparels", thema: "Bruiloft", vorm: "almond", lengte: "middel",
    nagels: [NG("#F4EEE9", "milky"), NG("#F4EEE9", "milky", "#fff", [DC("parel", 0, -24, 14)]),
      NG("#F4EEE9", "milky"), NG("#F4EEE9", "milky", "#fff", [DC("parel", 0, -24, 15), DC("parel", -13, -38, 11), DC("parel", 13, -38, 11), DC("steentje", 0, -52, 12)]),
      NG("#F4EEE9", "milky")] },
  { naam: "Madelief", thema: "Bruiloft", vorm: "oval", lengte: "kort",
    nagels: [NG("#F2D7CF", "french"), NG("#F2D7CF", "french"), NG("#F2D7CF", "effen", "#fff", [DC("madelief", 0, -50, 46)]),
      NG("#F2D7CF", "french"), NG("#F2D7CF", "effen", "#fff", [DC("madelief", 6, -46, 32)])] },
  { naam: "Pastel mix", thema: "Zomer", vorm: "squoval", lengte: "kort",
    nagels: [NG("#FAD4DC"), NG("#BDE0FE"), NG("#CDB4DB"), NG("#FFF1A8"), NG("#B7E4C7")] },
  { naam: "Smileys", thema: "Zomer", vorm: "round", lengte: "kort",
    nagels: [NG("#BDE0FE"), NG("#FAD4DC", "effen", "#fff", [DC("smiley", 0, -54, 40)]), NG("#B7E4C7"),
      NG("#FFF1A8", "effen", "#fff", [DC("smiley", 0, -54, 38, 0, "#E85A8A")]), NG("#CDB4DB")] },
  { naam: "Ombré babyboomer", thema: "Klassiek", vorm: "almond", lengte: "lang",
    nagels: Array(5).fill(0).map(() => NG("#F2CFC8", "ombre", "#FFFFFF")) },
  { naam: "Marmer & goud", thema: "Trends", vorm: "coffin", lengte: "lang",
    nagels: [NG("#FAF7F4", "marmer", "#8A8380"), NG("#141214"), NG("#FAF7F4", "marmer", "#8A8380", [DC("lijn", 0, -70, 110, -28, "goud")]),
      NG("#FAF7F4", "marmer", "#8A8380"), NG("#141214")] },
  { naam: "Vlinders", thema: "Zomer", vorm: "almond", lengte: "middel",
    nagels: [NG("#F4EEE9", "french", "#B392D9"), NG("#F4EEE9", "french", "#B392D9"),
      NG("#F4EEE9", "french", "#B392D9", [DC("vlinder", -4, -48, 38, -12)]), NG("#F4EEE9", "french", "#B392D9"),
      NG("#F4EEE9", "french", "#B392D9", [DC("vlinder", 4, -46, 30, 14)])] },
  { naam: "Zilver chroom", thema: "Trends", vorm: "stiletto", lengte: "lang",
    nagels: Array(5).fill(0).map(() => NG("#C9CDD3", "chroom")) },
];
const THEMAS = ["Alles", "Trends", "Klassiek", "Herfst", "Halloween", "Kerst & winter", "Valentijn", "Bruiloft", "Zomer"];
