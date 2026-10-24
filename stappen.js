// Nagelatelier — stappenplan: zet elk design om in spullen + stappen in de juiste volgorde.
// Werkwijzen samengevat uit vakbronnen (zie BRONNEN). Uithardtijden verschillen per merk en lamp:
// de app noemt 60 sec LED als richtlijn en zegt er steeds bij dat het product leidend is.

const BRONNEN = {
  gellak: ["Pink Gellac – gellak aanbrengen", "https://pinkgellac.com/nl/pages/how-to-apply-gel-nail-polish"],
  french: ["OPI – GelColor French manicure", "https://www.opi.com/professionals/gelcolor-french-manicure-application"],
  french2: ["Scratch Magazine – klassieke French met gel", "https://www.scratchmagazine.co.uk/nail_art/classic-french-manicure-using-gel"],
  ombre: ["Indigo Nails – baby boomer nails", "https://indigo-nails.com/eu-en/blog/post/baby-boomer-nails"],
  aura: ["Olive & June – gel aura mani", "https://oliveandjune.com/blogs/olive-university-gel/gel-polish-nail-art-gel-aura-mani"],
  aura2: ["Beauty Bay – aura nails", "https://www.beautybay.com/edited/how-to-do-aura-nails/"],
  chroom: ["Bluesky – chroompoeder gebruiken", "https://blueskycosmetics.co.uk/blogs/blog/how-to-use-chrome-powder"],
  cateye: ["Pink Gellac – cat eye gellak", "https://pinkgellac.com/blogs/news/how-to-use-cat-eye-gel-polish"],
  marmer: ["Scratch Magazine – marmer met blooming gel", "https://www.scratchmagazine.co.uk/nail_art/how-to-create-a-marble-nail-design-using-blooming-gel"],
  schildpad: ["Scratch Magazine – schildpad in 6 stappen", "https://www.scratchmagazine.co.uk/nail_art/how-to-create-tortoiseshell-nail-art-in-6-steps"],
  milky: ["N&D Nail Supply – jelly nails met gellak", "https://ndnailsupply.com/blogs/articles/how-to-do-jelly-nails-gel-polish"],
  stippen: ["Pink Gellac – nail art voor beginners", "https://www.pinkgellac.com/blogs/news/beginner-nail-art"],
  bloem: ["Scratch Magazine – bloemetjes in 3 stappen", "https://www.scratchmagazine.co.uk/nail_art/simple-speedy-steps-floral-nail-art"],
  sneeuw: ["OPI – sneeuwvlok-lijnwerk", "https://www.opi.com/professionals/snowflake-linework-nail-art/frosted-in-fir"],
  web: ["Good Morning America – spinnenweb nail art", "https://goodmorningamerica.com/style/story/spider-web-nail-art-halloween-73620327"],
  sticker: ["Pink Gellac – nail art stickers aanbrengen", "https://pinkgellac.com/blogs/news/how-to-apply-nail-art-stickers"],
  tape: ["Lulus – gouden lijntjes met striping tape", "https://www.lulus.com/blog/beauty/clear-nails-designs/"],
  steen: ["NSI – steentjes vastzetten", "https://www.nsinails.com.au/blogs/news/how-to-attach-rhinestones-to-nails"],
};

const LAMP = "tijd volgens je product";
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// kleurnamen: palet + vaste extra tinten; anders de dichtstbijzijnde benoemde kleur ("tint van …")
const EXTRA_NAAM = { "#F2D7CF": "Zacht nude", "#F2CFC8": "Babyroze", "#F3E6DE": "Parelnude", "#FAF7F4": "Marmerwit", "#F6D5D5": "Lichtroze",
  "#F7E1DC": "Roze nude", "#B8732E": "Amber", "#3A1C0D": "Donkerbruin", "#E9E4FF": "Zilverlila", "#D9DDE2": "Zilvergrijs", "#8A8380": "Grijs",
  "#3FA7D6": "Turquoiseblauw", "#7BC47F": "Kikkergroen", "#F6C945": "Bijengeel", "#B10F2E": "Kersenrood", "#5C0F1F": "Wijnrood",
  "#F7B58A": "Perzik", "#A8DDB5": "Pastelgroen", "#8EC5EC": "Pastelblauw", "#B9A2E0": "Pastellila", "#52B788": "Groen", "#3A86FF": "Kobaltblauw", "#1D1B3A": "Nachtblauw" };
Object.entries(EXTRA_NAAM).forEach(([h, n]) => { if (!KLEURNAAM[h]) KLEURNAAM[h] = n; });
function kn(c) {
  let H = String(c).toUpperCase();
  if (/^#[0-9A-F]{3}$/.test(H)) H = "#" + H.slice(1).split("").map((x) => x + x).join("");
  if (KLEURNAAM[H]) return KLEURNAAM[H].toLowerCase();
  if (!/^#[0-9A-F]{6}$/.test(H)) return "eigen kleur";
  const [r, g, b] = hexRgb(H);
  let best = null, bd = 1e9;
  for (const k of Object.keys(KLEURNAAM)) { const [r2, g2, b2] = hexRgb(k); const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2; if (d < bd) { bd = d; best = k; } }
  return "tint " + KLEURNAAM[best].toLowerCase();
}
const DECO_KN = { goud: "goud", rose: "rosé", zilver: "zilver" };
const dkn = (c) => DECO_KN[c] || kn(c);

// ---------- technieken (kleurlaag) ----------
// Elke techniek: spullen + stappen (f = functie van nagel n en tekst t "op ...")
const TECHNIEK = {
  effen: {
    spullen: (n) => [`Gellak ${kn(n.c)}`],
    stappen: (n, op) => [
      { t: `Kleur: ${kn(n.c)}`, x: `Breng ${op} een dunne laag gellak in ${kn(n.c)} aan. Blijf ± 1 mm van de nagelriem en strijk ook even over het randje van de nagel ("cappen"). Voorkom huidcontact: niet-uitgeharde gel op de huid kan een acrylatenallergie veroorzaken. Komt er toch gel op de huid, haal het direct helemaal weg (niet uitsmeren) en hard pas uit als de huid schoon is.`, lamp: true },
      { t: "Tweede laag", x: `Nog een dunne laag ${kn(n.c)}, weer met gecapte rand. Lichte of doorschijnende kleuren hebben soms een derde laag nodig.`, lamp: true },
    ],
    bron: ["gellak"], niveau: 1, min: 8,
  },
  french: {
    spullen: (n) => [`Gellak ${kn(n.c)} (basis)`, `Gellak ${kn(n.c2)} (tip)`, "Fijn liner-penseel", "Schuin penseeltje + cleaner of isopropylalcohol"],
    stappen: (n, op) => [
      { t: `Basis: ${kn(n.c)}`, x: `Breng ${op} een dunne laag ${kn(n.c)} aan en hard uit; zo nodig een tweede dunne laag, weer apart uitharden.`, lamp: true },
      { t: "Smile line zetten", x: `Zet met het liner-penseel in ${kn(n.c2)} eerst een puntje midden op de vrije rand, dan aan beide kanten een punt ongeveer halverwege. Verbind ze tot een gelijkmatige boog en vul de tip op.` },
      { t: "Lijn strak maken", x: "Maak de boog strak met een schoon, schuin penseeltje met een klein beetje cleaner of alcohol. Pas als de lijn mooi is uitharden.", lamp: true },
      { t: "Tip dekkend", x: `Nog een dunne laag ${kn(n.c2)} op de tip als hij nog doorschijnt.`, lamp: true },
    ],
    bron: ["french", "french2"], niveau: 2, min: 18,
  },
  ombre: {
    spullen: (n) => [`Gellak ${kn(n.c)}`, `Gellak ${kn(n.c2)}`, "Ombre-sponsje (of make-upsponsje)"],
    stappen: (n, op) => [
      { t: `Basis: ${kn(n.c)}`, x: `Twee dunne lagen ${kn(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Verloop deppen", x: `Doe een klein beetje ${kn(n.c2)} op de tip en dep met een schoon, fijnporig sponsje (per klant een nieuw) zijwaarts en omhoog tot de kleuren in elkaar overlopen. Hoe hoger je dept, hoe meer ${kn(n.c2)}. Weinig product, let op luchtbelletjes en huidcontact.`, lamp: true },
      { t: "Opbouwen", x: "Herhaal het deppen 2 à 3 keer, steeds dun en steeds uitharden, tot het verloop mooi dekt. Te veel lagen maakt de nagel dik.", lamp: true },
    ],
    bron: ["ombre"], niveau: 2, min: 20,
  },
  aura: {
    spullen: (n) => [`Gellak ${kn(n.c)} (ondergrond)`, `Gellak ${kn(n.c2)} (gloed)`, "Klein sponsje"],
    stappen: (n, op) => [
      { t: `Ondergrond: ${kn(n.c)}`, x: `Een dunne laag ${kn(n.c)} ${op} en uitharden; zo nodig een tweede dunne laag, apart uitharden.`, lamp: true },
      { t: "Gloed deppen", x: `Dep met een schoon, fijnporig sponsje (per klant een nieuw) een klein beetje ${kn(n.c2)} in het midden van de nagel. Zachtjes stempelen en de randen vaag laten.`, lamp: true },
      { t: "Midden voller maken", x: `Voor meer kleur: telkens één heel dun sponslaagje in het midden, de overgang verzachten zolang hij nat is en dan uitharden. Herhaal zo nodig; stapel geen natte laagjes op.`, lamp: true },
    ],
    bron: ["aura", "aura2"], niveau: 2, min: 18,
  },
  chroom: {
    spullen: (n) => [`Gellak ${kn(n.c)}`, "Top coat voor chroom (no-wipe, passend bij je poeder)", `Chroompoeder (${lum(n.c) > 0.6 ? "parelwit / glazed" : "passend bij " + kn(n.c)})`, "Applicator of zacht oogschaduwkwastje", "Stofkwast"],
    stappen: (n, op) => [
      { t: `Kleur: ${kn(n.c)}`, x: `Twee dunne lagen ${kn(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Chroom-ondergrond", x: "Een laag van de (no-wipe) top coat die bij jouw chroompoeder hoort; uitharden volgens het chroomprotocol. Niet afvegen.", lamp: true },
      { t: "Chroom inwrijven", x: "Wrijf het chroompoeder met de applicator over de hele nagel tot hij overal spiegelt, op het moment dat jouw poeder voorschrijft (meestal op de net uitgeharde, warme laag)." },
      { t: "Losse poeder weg", x: "Veeg alle losse poeder weg met een zachte kwast. Maak de vrije rand en zijkanten poedervrij (licht vijlen als je systeem dat voorschrijft), anders sluit de top coat niet goed af. De afsluitende top coat volgt verderop: rand goed cappen." },
    ],
    bron: ["chroom"], niveau: 1, min: 14,
  },
  cateye: {
    spullen: (n) => [`Gellak ${kn(n.c)} (donkere ondergrond)`, `Cat-eye gel (${kn(n.c2)} schittering)`, "Cat-eye magneet"],
    stappen: (n, op) => [
      { t: "Donkere ondergrond", x: `Een laag ${kn(n.c)} ${op} maakt het effect dieper.`, lamp: true },
      { t: "Cat-eye gel (per nagel)", x: "Werk één nagel tegelijk. Breng een dunne laag cat-eye gel aan en hard nog níet uit. Een dikke laag is lastiger te sturen." },
      { t: "Magneet", x: "Houd de magneet op de afstand die je gel voorschrijft boven de natte nagel (niet aanraken), meestal 5 tot 15 seconden stil. Schuin houden geeft een diagonale lichtlijn.", },
      { t: "Meteen uitharden", x: "Hard deze nagel direct uit, vóór je aan de volgende begint: anders vervaagt het effect.", lamp: true },
      { t: "Meer diepte (optioneel)", x: "Tweede dunne laag, weer magneet erboven, weer meteen uitharden.", lamp: true },
    ],
    bron: ["cateye"], niveau: 2, min: 16,
  },
  glitter: {
    spullen: (n) => [`Gellak ${kn(n.c)}`, `Glittergel (${n.c2 ? kn(n.c2) : "goud"})`],
    stappen: (n, op) => [
      { t: `Kleur: ${kn(n.c)}`, x: `Twee dunne lagen ${kn(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Glitter", x: "Een dunne laag glittergel en uitharden. Voor meer glitter een tweede dunne laag, apart uitharden.", lamp: true },
      { t: "Glad maken", x: "Ziet het glitteroppervlak er ruw uit? Raak de plaklaag niet aan met je vingers; geef straks een extra laag top coat (als je systeem dat toestaat) en hard elke toplaag apart uit." },
    ],
    bron: ["gellak"], niveau: 1, min: 12,
  },
  marmer: {
    spullen: (n) => [`Gellak ${kn(n.c)} (ondergrond)`, "Blooming gel", `Gellak ${kn(n.c2)} (aders)`, "Fijn detailpenseel"],
    stappen: (n, op) => [
      { t: `Ondergrond: ${kn(n.c)}`, x: `Een dunne laag ${kn(n.c)} ${op} en uitharden; zo nodig een tweede dunne laag, apart uitharden.`, lamp: true },
      { t: "Blooming gel", x: "Een dunne laag blooming gel en níet uitharden: de kleur loopt alleen uit zolang hij nat is." },
      { t: "Aders zetten", x: `Zet met het detailpenseel dunne lijntjes en vlekjes ${kn(n.c2)} in de natte blooming gel en trek ze voorzichtig uit tot aders. Weinig druk, anders mengt het te veel.` },
      { t: "Uitharden", x: "Tevreden over het marmer? Dan pas uitharden. Een dunnere laag blooming gel geeft strakkere aders.", lamp: true },
    ],
    bron: ["marmer"], niveau: 3, min: 20,
  },
  schildpad: {
    spullen: (n) => [`Doorschijnende amber/karamel jelly gel`, `Bruine gellak (vlekken)`, `Bijna zwarte gellak (${kn(n.c2)})`, "Fijn penseeltje of dotting tool"],
    stappen: (n, op) => [
      { t: "Amber ondergrond", x: `Een dunne laag doorschijnende amber ${op}, uitharden; zo nodig een tweede dunne laag. Je mag de nagel er nog doorheen zien.`, lamp: true },
      { t: "Bruine vlekken", x: "Dep onregelmatige bruine vlekken in verschillende maten, sommige wat dichter bij elkaar. Onregelmatig is juist echt.", lamp: true },
      { t: "Laagje eroverheen", x: "Nog een dunne laag amber over alles: zo vervagen de randen en lijken de vlekken ‘onder glas’ te liggen.", lamp: true },
      { t: "Donkere accenten", x: `Kleine stipjes ${kn(n.c2)} tussen de bruine vlekken voor contrast.`, lamp: true },
    ],
    bron: ["schildpad"], niveau: 3, min: 22,
  },
  milky: {
    spullen: () => ["Melkwitte jelly / sheer gellak"],
    stappen: (n, op) => [
      { t: "Milky laagjes", x: `Twee tot drie dunne lagen melkwitte jelly ${op}, elke laag apart uitharden. De eerste laag mag strepig zijn; de tweede trekt het gelijk. Niet meer dan drie lagen.`, lamp: true },
    ],
    bron: ["milky"], niveau: 1, min: 10,
  },
};

// ---------- versieringen ----------
// fase "voor" = vóór de top coat (geschilderd/sticker), "na" = na de top coat (steentjes/parels)
const VERSIER = {
  stip: { fase: "voor", spullen: (c) => ["Dotting tool", `Gellak ${dkn(c)}`], stappen: (c, op, n) => [{ t: "Stipjes", x: `Doop de dotting tool in ${dkn(c)} met weinig product en zet ${n > 1 ? n + " stipjes" : "het stipje"} ${op} door de nagel licht aan te tippen. Houd de stipjes plat en dun; meer dekking bouw je op met een tweede dun, apart uitgehard laagje.`, lamp: true }], bron: ["stippen"], niveau: 1 },
  hart: { fase: "voor", spullen: (c) => ["Dotting tool", "Fijn liner-penseel", `Gellak ${dkn(c)}`], stappen: (c, op) => [{ t: "Hartjes", x: `${op[0].toUpperCase() + op.slice(1)}: zet twee stipjes ${dkn(c)} vlak naast elkaar en trek met het liner-penseel de onderkant naar een puntje. Vul op als het nodig is.`, lamp: true }], bron: ["stippen"], niveau: 2 },
  bloem: { fase: "voor", spullen: (c) => ["Dotting tool", "Fijn liner-penseel", `Gellak ${dkn(c)}`, "Gellak geel of wit (hartje)"], stappen: (c, op) => [{ t: "Bloemetjes", x: `${op[0].toUpperCase() + op.slice(1)}: zet vijf kleine stipjes ${dkn(c)} in een rondje en trek ze met het liner-penseel naar het midden tot blaadjes. Uitharden, daarna een stipje in een andere kleur in het hart.`, lamp: true }], bron: ["bloem", "stippen"], niveau: 2 },
  madelief: { fase: "voor", spullen: () => ["Fijn liner-penseel", "Gellak wit", "Gellak geel"], stappen: (c, op) => [{ t: "Madeliefjes", x: `${op[0].toUpperCase() + op.slice(1)}: trek met het liner-penseel smalle witte blaadjes vanuit één middelpunt, rondom. Uitharden, daarna een geel stipje in het midden.`, lamp: true }], bron: ["bloem"], niveau: 3 },
  smiley: { fase: "voor", spullen: (c) => ["Grote dotting tool", "Fijn liner-penseel", `Gellak ${dkn(c)}`, "Gellak zwart"], stappen: (c, op) => [
    { t: "Smileys: rondje", x: `${op[0].toUpperCase() + op.slice(1)}: zet met de grote dotting tool een rond vlak in ${dkn(c)}.`, lamp: true },
    { t: "Smileys: gezichtje", x: "Ogen en mondje met het fijne liner-penseel in zwart.", lamp: true }], bron: ["stippen"], niveau: 3 },
  sneeuw: { fase: "voor", spullen: (c) => ["Dotting tool", "Fijn liner-penseel", `Gellak ${dkn(c)}`], stappen: (c, op) => [{ t: "Sneeuwvlokken", x: `${op[0].toUpperCase() + op.slice(1)}: zet een stipje als midden, trek met het liner-penseel 6 à 8 lijntjes naar buiten en zet een klein stipje aan elk uiteinde. Pas uitharden als de vlok af is.`, lamp: true }], bron: ["sneeuw"], niveau: 3 },
  web: { fase: "voor", spullen: (c) => ["Fijn liner-penseel (of spider gel)", `Gellak ${dkn(c)}`], stappen: (c, op) => [{ t: "Spinnenweb", x: `${op[0].toUpperCase() + op.slice(1)}: trek vanuit een hoek een paar rechte spaken in ${dkn(c)} en zet er golvende boogjes tussen. Uitharden als het web af is.`, lamp: true }], bron: ["web"], niveau: 3 },
  lijn: { fase: "voor", spullen: (c) => [`Striping tape (${dkn(c)})`, "Schaartje"], stappen: (c, op) => [{ t: "Lijntjes", x: `${op[0].toUpperCase() + op.slice(1)}: leg een stukje striping tape in ${dkn(c)} op de uitgeharde, schoongeveegde nagel, knip het aan elke kant ± 1 mm korter dan de nagel en druk goed aan. De top coat sluit het straks af.` }], bron: ["tape"], niveau: 1 },
  // als sticker (of schilderen voor gevorderden)
  ...Object.fromEntries(["ster", "twinkel", "maan", "blad", "vlinder", "strik"].map((t) => [t, {
    fase: "voor", sticker: true,
    spullen: (c) => [`Nail-art stickers: ${VERSIERING[t].naam.toLowerCase()} (${dkn(c)})`, "Pincet of cuticle-stokje"],
    stappen: (c, op) => [{ t: `${VERSIERING[t].naam}s plakken`, x: `${op[0].toUpperCase() + op.slice(1)}: kies een sticker iets kleiner dan de nagel, leg hem met een pincet neer (± 1 mm van de nagelriem) en druk vanuit het midden naar buiten aan. De top coat sluit hem af.` }],
    bron: ["sticker"], niveau: 1,
  }])),
  steentje: { fase: "na", spullen: () => ["Strass-steentjes", "Nagellijm voor nail art (of gem gel als de fabrikant die voor deze steentjes voorschrijft)", "Wax pen of pincet"], stappen: (c, op) => [{ t: "Steentjes", x: `${op[0].toUpperCase() + op.slice(1)}: bereid het plekje voor volgens je bevestigingsproduct (zo nodig licht opmatten en stofvrij maken). Steentjes met een dichte (folie)achterkant laten geen licht door: zet die vast met nagellijm voor nail art (hoeft niet onder de lamp), tenzij de fabrikant een gem-gelprotocol voor deze steentjes voorschrijft. Klein druppeltje op de nágel, niet op het steentje, en plaatsen met de wax pen. Daarna top coat alleen rondom, niet over de facetten; uitharden en een eventuele plaklaag eraf (of no-wipe gebruiken).`, lamp: true }], bron: ["steen"], niveau: 1 },
  parel: { fase: "na", spullen: () => ["Pareltjes (plat aan de achterkant)", "Nagellijm voor nail art (of gem gel als de fabrikant die voorschrijft)", "Wax pen of pincet"], stappen: (c, op) => [{ t: "Pareltjes", x: `${op[0].toUpperCase() + op.slice(1)}: parels zijn niet doorzichtig: zet ze vast met nagellijm voor nail art (hoeft niet onder de lamp), of met een gelprotocol dat de fabrikant hiervoor voorschrijft. Klein druppeltje op de voorbereide plek en de parel plaatsen met de wax pen. Top coat alleen rondom, niet over de parel; uitharden en een eventuele plaklaag eraf.`, lamp: true }], bron: ["steen"], niveau: 1 },
};

// ---------- welke nagels ----------
const VINGER_MV = ["duimen", "wijsvingers", "middelvingers", "ringvingers", "pinken"];
function welkeNagels(lijst) {
  const set = new Set(lijst);
  if (set.size === 10) return "op alle nagels";
  const beide = [], los = [];
  for (let f = 0; f < 5; f++) {
    const r = set.has(f), l = set.has(5 + f);
    if (r && l) beide.push(VINGER_MV[f]);
    else if (r) los.push(VINGERNAAM[f].toLowerCase() + " rechts");
    else if (l) los.push(VINGERNAAM[f].toLowerCase() + " links");
  }
  const zin = (a) => (a.length > 1 ? a.slice(0, -1).join(", ") + " en " + a.at(-1) : a[0]);
  if (!los.length) return beide.length === 1 ? "op beide " + beide[0] : "op de " + zin(beide);
  return "op de " + zin([...beide, ...los]);
}

// ---------- stappenplan opbouwen ----------
function maakStappenplan(D) {
  const stappen = [], spullen = new Set(), bronnen = new Set(["gellak"]);
  let minuten = 0;
  const add = (s, extra = {}) => stappen.push({ ...s, ...extra });
  const vorm = (VORMEN.find((v) => v[0] === D.shape) || [, ""])[1].toLowerCase();
  // voorbereiding
  ["LED/UV-lamp die past bij je gel", "Nagelvijl en buffer", "Cuticle pusher (of houtje)", "Prep/ontvetter, cleaner en pluisvrije doekjes", "Base coat", D.nails.some((n) => n.fin !== "mat") ? "Top coat (glans)" : null, D.nails.some((n) => n.fin === "mat") ? "Matte top coat" : null, "Nagelriemolie"].filter(Boolean).forEach((x) => spullen.add(x));
  add({ t: "Hygiëne en check", x: "Was of desinfecteer je eigen handen en die van de klant, en gebruik schone, gedesinfecteerde instrumenten (vijlen volgens wat ze aankunnen, wegwerp eenmalig). Kijk naar huid en nagels: niet behandelen bij wondjes, een ontstoken nagelriem of een vermoede infectie. Bekende of vermoede allergie voor gel/acrylaat? Dan geen gel." });
  add({ t: "Voorbereiden", x: `Duw de nagelriem voorzichtig terug en haal alleen dode huid van de nagelplaat; knip of beschadig geen levend weefsel. Vijl de nagels in ${vorm} vorm${D.length === "lang" ? ". Is de eigen nagel te kort voor deze lengte: verleng na de voorbereiding volgens een geschikt verlengingssysteem (inclusief de nodige versteviging) en ga daarna verder met de kleur" : ""} en mat de nagelplaat licht op als je systeem dat voorschrijft, met weinig druk.` });
  add({ t: "Ontvetten", x: "Verwijder het vijlstof en ontvet de nagels met het prep-product van je systeem (dehydrator/primer alleen als je systeem dat vraagt). Laat drogen en raak de nagelplaat daarna niet meer aan." });
  add({ t: "Base coat", x: "Een dunne laag base coat, ± 1 mm van de nagelriem, rand cappen.", lamp: true });
  minuten += 15;

  // kleurlaag: groepeer nagels met hetzelfde recept
  const groepen = new Map();
  D.nails.forEach((n, i) => {
    const key = [n.fx, n.c, n.fx === "effen" || n.fx === "milky" ? "" : n.c2].join("|");
    if (!groepen.has(key)) groepen.set(key, { n, nagels: [] });
    groepen.get(key).nagels.push(i);
  });
  const meerdere = groepen.size > 1;
  for (const { n, nagels } of groepen.values()) {
    const T = TECHNIEK[n.fx] || TECHNIEK.effen;
    const op = welkeNagels(nagels);
    T.spullen(n).forEach((x) => spullen.add(x));
    T.bron.forEach((b) => bronnen.add(b));
    const groep = meerdere ? cap1(op.replace(/^op (de |beide )?/, (m) => (m.includes("beide") ? "beide " : ""))) : null;
    T.stappen(n, op).forEach((s) => add(s, { groep }));
    minuten += T.min * (meerdere ? 0.6 : 1);
  }

  // versieringen per soort
  const decoGroep = (fase) => {
    const m = new Map();
    D.nails.forEach((n, i) => (n.deco || []).forEach((d) => {
      const V = VERSIER[d.t];
      if (!V || V.fase !== fase) return;
      const key = d.t + "|" + d.c;
      if (!m.has(key)) m.set(key, { d, V, nagels: new Set(), aantal: 0 });
      const g = m.get(key); g.nagels.add(i); g.aantal++;
    }));
    return [...m.values()];
  };
  const voor = decoGroep("voor");
  const plakNodig = voor.filter((g) => g.V.sticker || g.d.t === "lijn");
  if (plakNodig.length) { const nag = new Set(); plakNodig.forEach((g) => g.nagels.forEach((i) => nag.add(i)));
    add({ t: "Plaklaag eraf (voor stickers/tape)", x: `Veeg ${welkeNagels([...nag])} de plaklaag af met cleaner en laat drogen, zodat stickers en tape goed hechten.` }); }
  for (const g of voor) {
    const op = welkeNagels([...g.nagels]);
    g.V.spullen(g.d.c).forEach((x) => spullen.add(x));
    g.V.bron.forEach((b) => bronnen.add(b));
    g.V.stappen(g.d.c, op, Math.round(g.aantal / g.nagels.size)).forEach((s) => add(s));
    minuten += 3 * g.aantal + 3;
  }

  // top coat
  const mat = D.nails.filter((n) => n.fin === "mat").map((_, i) => i);
  const matIdx = D.nails.map((n, i) => (n.fin === "mat" ? i : -1)).filter((i) => i >= 0);
  const glansIdx = D.nails.map((n, i) => (n.fin !== "mat" ? i : -1)).filter((i) => i >= 0);
  if (glansIdx.length) add({ t: "Top coat", x: `Een dunne laag top coat ${welkeNagels(glansIdx)}, over de hele nagel, en cap het randje goed.${D.nails.some((n) => n.fx === "glitter") ? " Op glitternagels eventueel een tweede laag voor een glad oppervlak." : ""}`, lamp: true });
  if (matIdx.length) add({ t: "Matte top coat", x: `Een dunne laag matte top coat ${welkeNagels(matIdx)}, rand cappen.`, lamp: true });
  add({ t: "Afvegen", x: "Laat de nagels zo nodig even afkoelen (zie je product) en veeg bij een top coat met plaklaag die laag eraf met cleaner op een schoon pluisvrij doekje, zonder resten over de huid te vegen. Bij no-wipe top coat sla je dit over." });
  minuten += 8;

  const na = decoGroep("na");
  for (const g of na) {
    const op = welkeNagels([...g.nagels]);
    g.V.spullen(g.d.c).forEach((x) => spullen.add(x));
    g.V.bron.forEach((b) => bronnen.add(b));
    g.V.stappen(g.d.c, op).forEach((s) => add(s));
    minuten += 2 * g.aantal + 3;
  }
  add({ t: "Afmaken", x: "Een druppeltje nagelriemolie op elke nagelriem en even inmasseren." });

  // niveau
  let niveau = 1;
  D.nails.forEach((n) => { niveau = Math.max(niveau, (TECHNIEK[n.fx] || TECHNIEK.effen).niveau); (n.deco || []).forEach((d) => (niveau = Math.max(niveau, (VERSIER[d.t] || {}).niveau || 1))); });
  return {
    stappen, spullen: [...spullen], bronnen: [...bronnen].map((b) => BRONNEN[b]).filter(Boolean),
    minuten: Math.round(minuten / 5) * 5, niveau, niveauNaam: ["", "Makkelijk", "Gemiddeld", "Uitdagend"][niveau],
  };
}

// ---------- uitbreiding: patronen en motieven ----------
Object.assign(BRONNEN, {
  ruit: ["Scratch Magazine – ruitjes (checkerboard)", "https://scratchmagazine.co.uk/nail_art/valentines-checkerboard-nails"],
  strepen: ["Nail Knowledge – striping", "https://nailknowledge.org/nail-knowledge-base/striping"],
  regenboog: ["OPI – Tip-le Threat (regenboogboogjes)", "https://www.opi.com/nail-art/tip-le-threat"],
  regenboog2: ["Irish Beauty – Pride rainbow nails stap voor stap", "https://irishbeauty.ie/Nail-Art-Step-by-Step-Pride-Rainbow-Nails.html"],
  swirl: ["Kiara Sky – abstract swirl nails", "https://kiarasky.com/blogs/learn/abstract-swirl-nails-in-4-easy-steps"],
  golf: ["OPI – Waves for Days", "https://www.opi.com/en-GB/nail-art/waves-for-days"],
  luipaard: ["Scratch Magazine – luipaardprint in 4 stappen", "https://www.scratchmagazine.co.uk/nail_art/leopard-print-simple-nail-art-tutorial/"],
  zebra: ["Essie – Into the Wild (zebra)", "https://essie.co.uk/nail-art/into-the-wild"],
  hibiscus: ["Scratch Magazine – hibiscus schilderen", "https://scratchmagazine.co.uk/nail_art/how-to-paint-a-hibiscus-flower-on-nails"],
  bloem3d: ["NAILPRO – 3D gel bloemen", "https://www.nailpro.com/3-d-gel-rose-nails/"],
  bloem3d2: ["Madam Glam – 3D sculpting gel", "https://pro.madamglam.com/products/3d-sculpting-gel-pink"],
  charms: ["Gelous – charms aanbrengen", "https://au.gelous.co/products/silver-and-gold-charms-nail-art-set"],
  panda: ["Cut Out + Keep – panda nail art", "https://www.cutoutandkeep.net/projects/panda-nail-art"],
  lieveheer: ["Cut Out + Keep – lieveheersbeestje", "https://cutoutandkeep.net/projects/ladybird-nail-art-tutorial.amp"],
});
const kc = (c) => kn(c);
Object.assign(TECHNIEK, {
  strepen: {
    spullen: (n) => [`Gellak ${kc(n.c)}`, `Gellak ${kc(n.c2)}`, (n.v === 1 ? "Striping-penseel (lang en dun)" : "Striping tape"), "Pincet"],
    stappen: (n, op) => [
      { t: `Kleur: ${kc(n.c)}`, x: `Twee dunne lagen ${kc(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      n.v === 1
        ? { t: "Streepjes trekken", x: `Trek met het striping-penseel in ${kc(n.c2)} dunne rechte lijnen van nagelriem naar tip. Begin in het midden en werk naar de zijkanten, steeds even ver uit elkaar.`, lamp: true }
        : { t: "Streepjes met tape", x: `Veeg de plaklaag van deze nagels af en laat ze drogen, zodat de tape goed plakt. Plak strookjes striping tape ${n.v === 2 ? "dwars" : "schuin"} over de nagel waar de basiskleur moet blijven, lak de vakjes ertussen dun met ${kc(n.c2)}, trek de tape voorzichtig weg zolang de gel nog nat is en hard dan uit.`, lamp: true },
    ],
    bron: ["strepen", "tape"], niveau: 2, min: 18,
  },
  ruit: {
    spullen: (n) => [`Gellak ${kc(n.c)}`, `Gellak ${kc(n.c2)}`, "Fijn liner-penseel", "Cleaner of isopropylalcohol"],
    stappen: (n, op) => [
      { t: `Kleur: ${kc(n.c)}`, x: `Twee dunne lagen ${kc(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Raster zetten", x: `Trek met het liner-penseel in ${kc(n.c2)} een paar evenwijdige ${n.v ? "schuine" : "rechte"} lijnen en hard uit. Trek dan een tweede reeks evenwijdige lijnen die de eerste kruist, zodat vakjes ontstaan, en hard opnieuw uit.`, lamp: true },
      { t: "Vakjes vullen", x: `Vul om en om de vakjes met ${kc(n.c2)} en hard uit; zo nodig een tweede dunne laag voor dekking.`, lamp: true },
    ],
    bron: ["ruit"], niveau: 3, min: 25,
  },
  regenboog: {
    spullen: (n) => [`Gellak ${kc(n.c)}`, `Gellak in ${n.v ? "felle" : "pastel"} regenboogkleuren (6)`, "Fijn liner-penseel"],
    stappen: (n, op) => [
      { t: `Kleur: ${kc(n.c)}`, x: `Twee dunne lagen ${kc(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Boogjes", x: "Begin met de buitenste boog in rood (of roze) met het liner-penseel: in het midden iets dikker, naar de zijkanten dunner. Kort uitharden (flash cure) en dan de volgende kleur er strak tegenaan, tot alle zes de bogen staan.", lamp: true },
    ],
    bron: ["regenboog", "regenboog2"], niveau: 3, min: 25,
  },
  swirl: {
    spullen: (n) => [`Gellak ${kc(n.c)}`, `Gellak ${kc(n.c2)}`, "Gellak in een tweede lijnkleur", "Gellak wit", "Fijn liner-penseel"],
    stappen: (n, op) => [
      { t: `Kleur: ${kc(n.c)}`, x: `Twee dunne lagen ${kc(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Eerste swirl", x: `Trek met het liner-penseel in ${kc(n.c2)} een vloeiende golvende lijn van de nagelriem naar de tip; varieer de dikte.`, lamp: true },
      { t: "Tweede en derde lijn", x: "Een tweede lijn in de andere kleur er los naast (laat wat ruimte) en tot slot een dun wit lijntje als accent.", lamp: true },
    ],
    bron: ["swirl"], niveau: 2, min: 20,
  },
  golffrench: {
    spullen: (n) => [`Gellak ${kc(n.c)} (basis)`, `Gellak ${kc(n.c2)} (golf)`, "Fijn liner-penseel"],
    stappen: (n, op) => [
      { t: `Basis: ${kc(n.c)}`, x: `Een dunne laag ${kc(n.c)} ${op} en uitharden; zo nodig een tweede dunne laag, apart uitharden.`, lamp: true },
      { t: "Golvende tip", x: `Trek met het liner-penseel een dunne golvende lijn ${kc(n.c2)} over de tip en vul de tip daarboven op.`, lamp: true },
      { t: "Tweede golfje", x: "Een dun golvend lijntje er net onder, in een lichtere tint.", lamp: true },
    ],
    bron: ["golf"], niveau: 2, min: 20,
  },
  vfrench: {
    spullen: (n) => [`Gellak ${kc(n.c)} (basis)`, `Gellak ${kc(n.c2)} (tip)`, "Fijn liner-penseel", "Schuin penseeltje + cleaner"],
    stappen: (n, op) => [
      { t: `Basis: ${kc(n.c)}`, x: `Een dunne laag ${kc(n.c)} ${op} en uitharden; zo nodig een tweede dunne laag, apart uitharden.`, lamp: true },
      { t: "V zetten", x: `Zet met het liner-penseel in ${kc(n.c2)} een puntje midden op de nagel (de punt van de V) en trek vanaf beide zijkanten van de tip een rechte lijn naar dat punt. Vul de tip op.` },
      { t: "Strak maken", x: "Lijnen strak maken met een schoon schuin penseeltje met wat cleaner, dan uitharden. Nog een laag als het doorschijnt.", lamp: true },
    ],
    bron: ["french", "french2"], niveau: 2, min: 18,
  },
  luipaard: {
    spullen: (n) => [`Gellak ${kc(n.c)}`, `Gellak ${kc(n.c2)} (vlekken)`, "Gellak zwart", "Dotting tool", "Fijn liner-penseel"],
    stappen: (n, op) => [
      { t: `Kleur: ${kc(n.c)}`, x: `Twee dunne lagen ${kc(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Vlekken", x: `Zet met de dotting tool met weinig product onregelmatige, platte ovaaltjes in ${kc(n.c2)}, in verschillende maten en met ruimte ertussen.`, lamp: true },
      { t: "Randjes", x: "Trek met het liner-penseel in zwart een gebroken randje om de vlekken (niet helemaal dicht) en zet kleine zwarte stipjes in de gaten.", lamp: true },
    ],
    bron: ["luipaard"], niveau: 2, min: 22,
  },
  zebra: {
    spullen: (n) => [`Gellak ${kc(n.c)}`, `Gellak ${kc(n.c2)}`, "Fijn liner-penseel"],
    stappen: (n, op) => [
      { t: `Kleur: ${kc(n.c)}`, x: `Twee dunne lagen ${kc(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Zebrastrepen", x: `Trek met het liner-penseel in ${kc(n.c2)} strepen vanaf de zijkant naar binnen: begin dun en laat ze breder worden, en weer smal uitlopen. Varieer lengte en dikte, om en om van links en rechts.`, lamp: true },
    ],
    bron: ["zebra"], niveau: 2, min: 18,
  },
  zee: {
    spullen: (n) => [`Gellak ${kc(n.c)} (doorschijnend roze/nude)`, `Gellak ${kc(n.c2)} (lichtblauw)`, "Gellak donkerblauw + wit", "Sponsje", "Fijn liner-penseel"],
    stappen: (n, op) => [
      { t: `Basis: ${kc(n.c)}`, x: `Een dunne laag ${kc(n.c)} ${op} en uitharden; zo nodig een tweede dunne laag, apart uitharden.`, lamp: true },
      { t: "Zee deppen", x: `Dep met een schoon, fijnporig sponsje (per klant een nieuw) weinig ${kc(n.c2)} op de tip en laat het naar het midden toe vervagen (zoals bij ombré).`, lamp: true },
      { t: "Golfjes", x: "Trek met het liner-penseel dunne golvende lijntjes over het blauwe deel, afwisselend donkerblauw en een enkel wit lijntje.", lamp: true },
    ],
    bron: ["ombre", "golf"], niveau: 3, min: 25,
  },
});

const charm = (naam) => ({ fase: "na", spullen: () => [`Gouden ${naam}-bedeltjes (charms)`, "Nagellijm voor nail art (of een charm-gel die de fabrikant voor metalen bedeltjes voorschrijft)", "Pincet of wax pen"],
  stappen: (c, op) => [{ t: `${naam[0].toUpperCase() + naam.slice(1)}-bedeltjes`, x: `${op[0].toUpperCase() + op.slice(1)}: onder metaal hardt gewone gel niet goed uit, dus zet bedeltjes vast met nagellijm voor nail art (hoeft niet onder de lamp) of met een charm-gel die de fabrikant daarvoor voorschrijft. Klein beetje op de nagel, bedeltje erop met het pincet. Daarna top coat alleen rondom, uitharden en een eventuele plaklaag eraf.`, lamp: true }], bron: ["charms", "steen"], niveau: 1 });
const dier = (naam, vorm, details) => ({ fase: "voor", spullen: (c) => ["Dotting tools (groot en klein)", "Fijn liner-penseel", `Gellak ${dkn(c)}`, "Gellak zwart en wit"],
  stappen: (c, op) => [
    { t: `${naam}: basisvorm`, x: `${op[0].toUpperCase() + op.slice(1)}: zet met de grote dotting tool ${vorm} in ${dkn(c)} (eventueel twee laagjes).`, lamp: true },
    { t: `${naam}: details`, x: `Pas als de basisvorm is uitgehard: ${details[0].toLowerCase() + details.slice(1)} Tot slot een wit glimpuntje in de oogjes.`, lamp: true }], bron: ["panda", "stippen"], niveau: 3 });
Object.assign(VERSIER, {
  hibiscus: { fase: "voor", spullen: (c) => ["Dotting tool", "Detailpenseel", "Gellak wit", `Gellak ${dkn(c)}`, "Gellak geel"], stappen: (c, op) => [
    { t: "Hibiscus: blaadjes", x: `${op[0].toUpperCase() + op.slice(1)}: zet per blaadje drie witte stipjes in een omgekeerde V en trek ze met het detailpenseel naar het midden van de bloem. Vijf blaadjes rondom.`, lamp: true },
    { t: "Hibiscus: kleur en hart", x: `Tik met een beetje ${dkn(c)} in het hart van de bloem en trek dat dun de blaadjes in; uitharden. Daarna een wit meeldraadje met gele stipjes en weer uitharden.`, lamp: true }], bron: ["hibiscus"], niveau: 3 },
  bloem3d: { fase: "na", spullen: (c) => ["3D-gel (gekleurd, of helder + gellak " + dkn(c) + ")", "Siliconen tool of palet", "Pincet", "Goudkleurig bolletje + nagellijm voor nail art"], stappen: (c, op) => [
    { t: "3D-bloem: blaadjes modelleren", x: `${op[0].toUpperCase() + op.slice(1)}: bereid de plek voor volgens je 3D-gelsysteem en modelleer met de 3D-gel direct op de nagel dunne, spitse blaadjes in een stervorm, binnen de maximale laagdikte van je gel. Gebruik bij voorkeur gekleurde 3D-gel. Hard volledig uit volgens het product; een te dikke laag maak je niet goed met langer belichten.`, lamp: true },
    { t: "3D-bloem: kleur", x: "Heldere 3D-gel gebruikt? Kleur de uitgeharde blaadjes met dunne laagjes gellak (donker aan de voet, licht naar de punt), elk laagje apart uitharden. Losse, vooraf gemaakte blaadjes hechten niet door alleen opnieuw te belichten: gebruik daarvoor een bevestigingsproduct dat de fabrikant voorschrijft.", lamp: true },
    { t: "3D-bloem: hartje en afwerking", x: "Zet het gouden bolletje in het midden vast met nagellijm voor nail art (onder metaal hardt gel niet goed uit). Werk de bloem af volgens de 3D-gelinstructies (zo nodig top coat erop, uitharden, plaklaag eraf).", lamp: true }], bron: ["bloem3d", "bloem3d2"], niveau: 3 },
  schelp: charm("schelp"), zeester: charm("zeester"), bolletje: charm("gouden bolletje"),
  beer: dier("Beertje", "een rondje met twee kleine oortjes", "Snuitje in een lichtere tint, dan met het liner-penseel in zwart oogjes, neusje en mondje."),
  kat: dier("Katje", "een ovaal met twee puntoortjes", "Roze binnenkant van de oortjes en neusje, dan in zwart oogjes, mondje en snorharen."),
  panda: dier("Panda", "een wit rondje", "Met de kleine dotting tool zwarte oortjes en schuine vlekken rond de ogen, dan een zwart neusje en mondje."),
  leeuw: dier("Leeuwtje", "een krans van stipjes (de manen) en een lichter rondje in het midden", "Snuitje lichter, dan in zwart oogjes, neusje en mondje."),
  kikker: dier("Kikker", "een breed ovaal met twee bolletjes erbovenop", "Witte oogbollen met zwarte pupil en een zwarte glimlach."),
  konijn: dier("Konijntje", "een wit rondje met twee lange oren", "Roze binnenkant van de oren en neusje, dan in zwart oogjes, mondje en een dun randje als het wit wegvalt."),
  bij: dier("Bijtje", "een geel ovaal", "Zwarte streepjes en kopje, doorschijnend witte vleugeltjes en twee voelsprietjes."),
  lieveheer: { ...dier("Lieveheersbeestje", "een rood rondje", "Zwarte middenstreep, zwart kopje en zwarte stippen, witte oogjes met zwarte pupil."), bron: ["lieveheer", "stippen"] },
  kers: { fase: "voor", spullen: (c) => ["Dotting tool", "Fijn liner-penseel", `Gellak ${dkn(c)}`, "Gellak groen en wit"], stappen: (c, op) => [
    { t: "Kersjes: vruchtjes", x: `${op[0].toUpperCase() + op.slice(1)}: zet met de dotting tool twee ronde kersjes ${dkn(c)}, weinig product en plat.`, lamp: true },
    { t: "Kersjes: steeltjes en glans", x: "Trek met het liner-penseel groene steeltjes naar één punt met een blaadje en zet in elke kers een wit glimpuntje.", lamp: true }], bron: ["stippen"], niveau: 2 },
  aardbei: { fase: "voor", spullen: (c) => ["Dotting tool", "Fijn liner-penseel", `Gellak ${dkn(c)}`, "Gellak groen en geel"], stappen: (c, op) => [
    { t: "Aardbeitjes: vorm", x: `${op[0].toUpperCase() + op.slice(1)}: schilder een druppelvorm in ${dkn(c)}, dun en plat.`, lamp: true },
    { t: "Aardbeitjes: kroontje en pitjes", x: "Groen kroontje met het liner-penseel en kleine gele pitjes met de punt van de dotting tool.", lamp: true }], bron: ["stippen"], niveau: 2 },
  wolkje: { fase: "voor", spullen: (c) => ["Dotting tools", `Gellak ${dkn(c)}`], stappen: (c, op) => [{ t: "Wolkjes", x: `${op[0].toUpperCase() + op.slice(1)}: zet drie à vier stipjes ${dkn(c)} in verschillende maten tegen elkaar aan tot een wolkje, met een platte onderkant.`, lamp: true }], bron: ["stippen"], niveau: 1 },
});

// ---------- uitbreiding 2: goud, jelly-vlekken, micro-French, swoosh, 3D-ribbels, starburst ----------
Object.assign(BRONNEN, {
  goudliner: ["Kiara Sky – Gold Exhibit gel-art liner (gebruik)", "https://www.beyondpolish.com/products/kiara-sky-gel-art-gold-exhibit"],
  goudabstract: ["NAILPRO – Gilded Abstract Nails", "https://www.medestheticsmag.com/home/article/22578583/nailpro-gilded-holiday-nail-art-tutorial"],
  microfrench: ["StyleRave – micro French manicure", "https://stylerave.com/how-to-do-micro-french-manicure/"],
  microfrench2: ["Pink Gellac – French op korte nagels", "https://pinkgellac.com/blogs/tips-tricks/how-to-do-a-french-manicure-on-short-nails"],
  embossing: ["Madam Glam – 3D embossing gel", "https://madamglam.com/products/white-3d-embossing-gel"],
  embossing2: ["The Gel Bottle – 3D Studio Gel (handleiding)", "https://assets.thegelbottle.com/m/799b9f87341e7914/original/TGB_Application-Guide_3D-Studio-Gel.pdf"],
  blooming: ["Gelish – Blooming 201", "https://gelish.com/nail-style-blog/blooming-201"],
  giraffe: ["Home of Nail Art – animal print", "https://www.homeofnailart.com/blogs/nail-art-tutorials/animal-print-nail-art-tutorial"],
  sunburst: ["Lulus – nude nails met gouden starburst", "https://www.lulus.com/blog/?p=241791"],
});
EXTRA_NAAM["#8FAFD8"] = "Duifblauw"; EXTRA_NAAM["#A9C3E6"] = "Lichtblauw"; EXTRA_NAAM["#9CB9E0"] = "Poederblauw"; EXTRA_NAAM["#7A1F46"] = "Pruimrood";
EXTRA_NAAM["#8E2E58"] = "Framboospaars"; EXTRA_NAAM["#EECBB0"] = "Perzik nude"; EXTRA_NAAM["#9C8473"] = "Mokka";
Object.entries(EXTRA_NAAM).forEach(([h, n]) => { if (!KLEURNAAM[h]) KLEURNAAM[h] = n; });

Object.assign(TECHNIEK, {
  goudvlak: {
    spullen: (n) => [`Gellak ${kc(n.c)}`, `Gellak ${kc(n.c2)} (vlakken)`, "Gouden glitter gel-liner (of gouden art-gel met fijn liner-penseel)", "Detailpenseel"],
    stappen: (n, op) => [
      { t: `Kleur: ${kc(n.c)}`, x: `Twee dunne lagen ${kc(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Vlakken", x: `Schilder met het detailpenseel één of twee organische vlakken in ${kc(n.c2)} (geen perfecte rondjes; mag tot de rand lopen), dun en egaal.`, lamp: true },
      { t: "Gouden contour", x: "Trek met weinig gouden glittergel een smalle, gelijkmatige contour langs de uitgeharde vlakken en hard uit. Te weinig glitter? Breng dan een tweede dunne lijn over de uitgeharde contour aan en hard opnieuw uit (niet nat op nat stapelen).", lamp: true },
    ],
    bron: ["goudliner", "goudabstract"], niveau: 3, min: 25,
  },
  vlekken: {
    spullen: (n) => [`Gellak ${kc(n.c)} (melkwit/ondergrond)`, "Blooming gel", `Doorschijnende jelly-gellak ${kc(n.c2)}`, "Dotting tool"],
    stappen: (n, op) => [
      { t: `Ondergrond: ${kc(n.c)}`, x: `Twee dunne lagen ${kc(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Jelly-vlekken (per nagel)", x: `Werk één nagel tegelijk af: breng een dunne laag blooming gel aan en hard nog niet uit. Zet met de dotting tool en weinig jelly-gellak onregelmatige vlekken ${kc(n.c2)} in een losjes giraffe-patroon, met ruimte ertussen. Laat kort uitvloeien en hard uit zodra de smalle, lichte tussenruimtes goed zijn. Dan de volgende nagel.`, lamp: true },
    ],
    bron: ["giraffe", "blooming"], niveau: 3, min: 22,
  },
  microfrench: {
    spullen: (n) => [`Gellak ${kc(n.c)} (basis)`, `Gellak ${kc(n.c2)} (tip)`, "Lang, dun liner-penseel", "Schuin penseeltje + cleaner"],
    stappen: (n, op) => [
      { t: `Basis: ${kc(n.c)}`, x: `Een dunne laag ${kc(n.c)} ${op} en uitharden; zo nodig een tweede dunne laag, apart uitharden.`, lamp: true },
      { t: "Micro-tip", x: `Trek met het lange, dunne liner-penseel en weinig ${kc(n.c2)} een haarfijne boog langs de vrije rand, als richtmaat ± 0,5–1 mm breed. Corrigeer de binnenrand met een schoon detailpenseel, eventueel heel licht bevochtigd met cleaner zonder de kleur te laten uitlopen; laat de cleaner verdampen en hard uit.`, lamp: true },
    ],
    bron: ["microfrench", "microfrench2", "french"], niveau: 2, min: 14,
  },
  swoosh: {
    spullen: (n) => [`Gellak ${kc(n.c)}`, "Gouden glitter gel-liner (of gouden art-gel met fijn liner-penseel)"],
    stappen: (n, op) => [
      { t: `Kleur: ${kc(n.c)}`, x: `Twee dunne lagen ${kc(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Gouden swooshes", x: "Trek met de gouden glitter-liner vanaf één zijkant drie golvende lijnen naast elkaar, ongeveer even ver uit elkaar en naar het midden toe dunner uitlopend.", lamp: true },
    ],
    bron: ["goudliner", "golf"], niveau: 2, min: 14,
  },
  ribbel: {
    spullen: (n) => [`Gellak ${kc(n.c)}`, "Vormvaste 3D-gel die volgens de fabrikant geschikt is voor penseelribbels", "Fijn penseel", "Gouden glitter gel-liner"],
    stappen: (n, op) => [
      { t: `Kleur: ${kc(n.c)}`, x: `Twee dunne lagen ${kc(n.c)} ${op}, elke laag apart uitharden.`, lamp: true },
      { t: "Volgorde checken", x: "Kijk vóór de ribbels wat jouw 3D-gel voorschrijft: sommige gaan óp de afgewerkte top coat (dan eerst goudvlekjes en top coat, uitharden, plaklaag eraf), andere krijgen zelf nog een top coat erover." },
      { t: "Goudvlekjes", x: "Zet met de gouden glitter-liner een paar kleine vlekjes verspreid over de nagel.", lamp: true },
      { t: "3D-ribbels", x: "Trek met het fijne penseel afzonderlijke, licht gebogen dwarse ribbels die elkaar niet raken, binnen de voorgeschreven laagdikte. Hard elke groep uit voordat je verder gaat. Geef je nog top coat, voorkom dan dat die tussen de ribbels ophoopt.", lamp: true },
    ],
    bron: ["embossing", "embossing2", "goudliner"], niveau: 3, min: 22,
  },
});
VERSIER.burst = { fase: "voor", spullen: () => ["Gouden glitter gel-liner (of gouden art-gel met striping-penseel)"], stappen: (c, op) => [
  { t: "Starburst", x: `${op[0].toUpperCase() + op.slice(1)}: zet met de gouden glitter-liner een stipje als midden en trek vandaar vier lange, dunne stralen (kruis) en daartussen vier kortere. Laat ze naar de punt smal uitlopen.`, lamp: true }], bron: ["sunburst", "goudliner"], niveau: 2 };
