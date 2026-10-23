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

const LAMP = "60 sec LED";
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const kn = (c) => (KLEURNAAM[String(c).toUpperCase()] || "eigen kleur").toLowerCase();
const DECO_KN = { goud: "goud", rose: "rosé", zilver: "zilver" };
const dkn = (c) => DECO_KN[c] || kn(c);

// ---------- technieken (kleurlaag) ----------
// Elke techniek: spullen + stappen (f = functie van nagel n en tekst t "op ...")
const TECHNIEK = {
  effen: {
    spullen: (n) => [`Gellak ${kn(n.c)}`],
    stappen: (n, op) => [
      { t: `Kleur: ${kn(n.c)}`, x: `Breng ${op} een dunne laag gellak in ${kn(n.c)} aan. Blijf ± 1 mm van de nagelriem en strijk ook even over het randje van de nagel ("cappen"). Gemorst op de huid? Weghalen met een houtje vóór het uitharden.`, lamp: true },
      { t: "Tweede laag", x: `Nog een dunne laag ${kn(n.c)}, weer met gecapte rand. Lichte of doorschijnende kleuren hebben soms een derde laag nodig.`, lamp: true },
    ],
    bron: ["gellak"], niveau: 1, min: 8,
  },
  french: {
    spullen: (n) => [`Gellak ${kn(n.c)} (basis)`, `Gellak ${kn(n.c2)} (tip)`, "Fijn liner-penseel", "Schuin penseeltje + cleaner of isopropylalcohol"],
    stappen: (n, op) => [
      { t: `Basis: ${kn(n.c)}`, x: `Breng ${op} één of twee dunne lagen ${kn(n.c)} aan (elke laag uitharden). Haal de plaklaag eraf zodat de tip straks niet uitloopt.`, lamp: true },
      { t: "Smile line zetten", x: `Zet met het liner-penseel in ${kn(n.c2)} eerst een puntje midden op de vrije rand, dan aan beide kanten een punt ongeveer halverwege. Verbind ze tot een gelijkmatige boog en vul de tip op.` },
      { t: "Lijn strak maken", x: "Maak de boog strak met een schoon, schuin penseeltje met een klein beetje cleaner of alcohol. Pas daarna uitharden.", lamp: true },
      { t: "Tip dekkend", x: `Nog een dunne laag ${kn(n.c2)} op de tip als hij nog doorschijnt.`, lamp: true },
    ],
    bron: ["french", "french2"], niveau: 2, min: 18,
  },
  ombre: {
    spullen: (n) => [`Gellak ${kn(n.c)}`, `Gellak ${kn(n.c2)}`, "Ombre-sponsje (of make-upsponsje)"],
    stappen: (n, op) => [
      { t: `Basis: ${kn(n.c)}`, x: `Twee dunne lagen ${kn(n.c)} ${op}, elke laag uitharden.`, lamp: true },
      { t: "Verloop deppen", x: `Doe een klein beetje ${kn(n.c2)} op de tip en dep met het sponsje zijwaarts en omhoog tot de kleuren in elkaar overlopen. Hoe hoger je dept, hoe meer ${kn(n.c2)}.`, lamp: true },
      { t: "Opbouwen", x: "Herhaal het deppen 2 à 3 keer, steeds dun en steeds uitharden, tot het verloop mooi dekt. Te veel lagen maakt de nagel dik.", lamp: true },
    ],
    bron: ["ombre"], niveau: 2, min: 20,
  },
  aura: {
    spullen: (n) => [`Gellak ${kn(n.c)} (ondergrond)`, `Gellak ${kn(n.c2)} (gloed)`, "Klein sponsje"],
    stappen: (n, op) => [
      { t: `Ondergrond: ${kn(n.c)}`, x: `Een of twee dunne lagen ${kn(n.c)} ${op}.`, lamp: true },
      { t: "Gloed deppen", x: `Dep met een klein sponsje ${kn(n.c2)} in het midden van de nagel. Zachtjes stempelen en de randen vaag laten.`, lamp: true },
      { t: "Midden voller maken", x: `Herhaal in het midden tot dat dekkend is; blijf van de randen af zodat ze zacht verlopen. Eventueel de overgang verzachten met een schoon sponsje.`, lamp: true },
    ],
    bron: ["aura", "aura2"], niveau: 2, min: 18,
  },
  chroom: {
    spullen: (n) => [`Gellak ${kn(n.c)}`, "No-wipe top coat", `Chroompoeder (${lum(n.c) > 0.6 ? "parelwit / glazed" : "passend bij " + kn(n.c)})`, "Applicator of zacht oogschaduwkwastje", "Stofkwast"],
    stappen: (n, op) => [
      { t: `Kleur: ${kn(n.c)}`, x: `Twee dunne lagen ${kn(n.c)} ${op}, elke laag uitharden.`, lamp: true },
      { t: "No-wipe top coat", x: "Een laag no-wipe top coat; uitharden. Niet afvegen.", lamp: true },
      { t: "Chroom inwrijven", x: "Wrijf het chroompoeder met de applicator over de hele nagel tot hij overal spiegelt. Sommige poeders willen een nog plakkerige laag: kijk wat er op jouw poeder staat." },
      { t: "Losse poeder weg", x: "Veeg het overtollige poeder weg met een zachte kwast en poets ook het randje schoon, anders hecht de top coat niet. De afsluitende top coat volgt verderop." },
    ],
    bron: ["chroom"], niveau: 1, min: 14,
  },
  cateye: {
    spullen: (n) => [`Gellak ${kn(n.c)} (donkere ondergrond)`, `Cat-eye gel (${kn(n.c2) === "eigen kleur" ? "zilver/lila" : kn(n.c2)} schittering)`, "Cat-eye magneet"],
    stappen: (n, op) => [
      { t: "Donkere ondergrond", x: `Een laag ${kn(n.c)} ${op} maakt het effect dieper.`, lamp: true },
      { t: "Cat-eye gel", x: "Breng een dunne laag cat-eye gel aan en hard nog níet uit. Een dikke laag is lastiger te sturen." },
      { t: "Magneet", x: "Houd de magneet vlak boven de natte nagel (niet aanraken), 5 tot 15 seconden stil. Schuin houden geeft een diagonale lichtlijn.", },
      { t: "Meteen uitharden", x: "Direct onder de lamp: wacht je, dan zakken de deeltjes terug.", lamp: true },
      { t: "Meer diepte (optioneel)", x: "Tweede dunne laag, weer magneet erboven, weer meteen uitharden.", lamp: true },
    ],
    bron: ["cateye"], niveau: 2, min: 16,
  },
  glitter: {
    spullen: (n) => [`Gellak ${kn(n.c)}`, `Glittergel (${n.c2 && kn(n.c2) !== "eigen kleur" ? kn(n.c2) : "goud"})`],
    stappen: (n, op) => [
      { t: `Kleur: ${kn(n.c)}`, x: `Twee dunne lagen ${kn(n.c)} ${op}, elke laag uitharden.`, lamp: true },
      { t: "Glitter", x: "Een dunne laag glittergel; uitharden. Voor meer glitter nog een laag.", lamp: true },
      { t: "Glad maken", x: "Voelt de glitter ruw? Dan straks een extra laag top coat erover." },
    ],
    bron: ["gellak"], niveau: 1, min: 12,
  },
  marmer: {
    spullen: (n) => [`Gellak ${kn(n.c)} (ondergrond)`, "Blooming gel", `Gellak ${kn(n.c2)} (aders)`, "Fijn detailpenseel"],
    stappen: (n, op) => [
      { t: `Ondergrond: ${kn(n.c)}`, x: `Een of twee lagen ${kn(n.c)} ${op}, elke laag uitharden.`, lamp: true },
      { t: "Blooming gel", x: "Een dunne laag blooming gel en níet uitharden: de kleur loopt alleen uit zolang hij nat is." },
      { t: "Aders zetten", x: `Zet met het detailpenseel dunne lijntjes en vlekjes ${kn(n.c2)} in de natte blooming gel en trek ze voorzichtig uit tot aders. Weinig druk, anders mengt het te veel.` },
      { t: "Uitharden", x: "Tevreden over het marmer? Dan pas uitharden. Een dunnere laag blooming gel geeft strakkere aders.", lamp: true },
    ],
    bron: ["marmer"], niveau: 3, min: 20,
  },
  schildpad: {
    spullen: (n) => [`Doorschijnende amber/karamel jelly gel`, `Bruine gellak (vlekken)`, `Bijna zwarte gellak (${kn(n.c2)})`, "Fijn penseeltje of dotting tool"],
    stappen: (n, op) => [
      { t: "Amber ondergrond", x: `Een à twee dunne lagen doorschijnende amber ${op}; je mag de nagel er nog doorheen zien.`, lamp: true },
      { t: "Bruine vlekken", x: "Dep onregelmatige bruine vlekken in verschillende maten, sommige wat dichter bij elkaar. Onregelmatig is juist echt.", lamp: true },
      { t: "Laagje eroverheen", x: "Nog een dunne laag amber over alles: zo vervagen de randen en lijken de vlekken ‘onder glas’ te liggen.", lamp: true },
      { t: "Donkere accenten", x: `Kleine stipjes ${kn(n.c2)} tussen de bruine vlekken voor contrast.`, lamp: true },
    ],
    bron: ["schildpad"], niveau: 3, min: 22,
  },
  milky: {
    spullen: () => ["Melkwitte jelly / sheer gellak"],
    stappen: (n, op) => [
      { t: "Milky laagjes", x: `Twee tot drie dunne lagen melkwitte jelly ${op}, elke laag uitharden. De eerste laag mag strepig zijn; de tweede trekt het gelijk. Niet meer dan drie lagen.`, lamp: true },
    ],
    bron: ["milky"], niveau: 1, min: 10,
  },
};

// ---------- versieringen ----------
// fase "voor" = vóór de top coat (geschilderd/sticker), "na" = na de top coat (steentjes/parels)
const VERSIER = {
  stip: { fase: "voor", spullen: (c) => ["Dotting tool", `Gellak ${dkn(c)}`], stappen: (c, op, n) => [{ t: "Stipjes", x: `Doop de dotting tool in ${dkn(c)} en zet ${n > 1 ? n + " stipjes" : "het stipje"} ${op} zonder te drukken (drukken maakt ze plat en groot).`, lamp: true }], bron: ["stippen"], niveau: 1 },
  hart: { fase: "voor", spullen: (c) => ["Dotting tool", "Fijn liner-penseel", `Gellak ${dkn(c)}`], stappen: (c, op) => [{ t: "Hartjes", x: `${op[0].toUpperCase() + op.slice(1)}: zet twee stipjes ${dkn(c)} vlak naast elkaar en trek met het liner-penseel de onderkant naar een puntje. Vul op als het nodig is.`, lamp: true }], bron: ["stippen"], niveau: 2 },
  bloem: { fase: "voor", spullen: (c) => ["Dotting tool", "Fijn liner-penseel", `Gellak ${dkn(c)}`, "Gellak geel of wit (hartje)"], stappen: (c, op) => [{ t: "Bloemetjes", x: `${op[0].toUpperCase() + op.slice(1)}: zet vijf stipjes ${dkn(c)} in een rondje, trek ze met het liner-penseel naar het midden tot blaadjes en zet er een stipje in een andere kleur in.`, lamp: true }], bron: ["bloem", "stippen"], niveau: 2 },
  madelief: { fase: "voor", spullen: () => ["Fijn liner-penseel", "Gellak wit", "Gellak geel"], stappen: (c, op) => [{ t: "Madeliefjes", x: `${op[0].toUpperCase() + op.slice(1)}: trek met het liner-penseel smalle witte blaadjes vanuit één middelpunt, rondom. Uitharden, dan een geel stipje in het midden.`, lamp: true }], bron: ["bloem"], niveau: 3 },
  smiley: { fase: "voor", spullen: (c) => ["Grote dotting tool", "Fijn liner-penseel", `Gellak ${dkn(c)}`, "Gellak zwart"], stappen: (c, op) => [
    { t: "Smileys: rondje", x: `${op[0].toUpperCase() + op.slice(1)}: zet met de grote dotting tool een rond vlak in ${dkn(c)}.`, lamp: true },
    { t: "Smileys: gezichtje", x: "Ogen en mondje met het fijne liner-penseel in zwart.", lamp: true }], bron: ["stippen"], niveau: 3 },
  sneeuw: { fase: "voor", spullen: (c) => ["Dotting tool", "Fijn liner-penseel", `Gellak ${dkn(c)}`], stappen: (c, op) => [{ t: "Sneeuwvlokken", x: `${op[0].toUpperCase() + op.slice(1)}: zet een stipje als midden, trek met het liner-penseel 6 à 8 lijntjes naar buiten en zet een klein stipje aan elk uiteinde. Pas uitharden als de vlok af is.`, lamp: true }], bron: ["sneeuw"], niveau: 3 },
  web: { fase: "voor", spullen: (c) => ["Fijn liner-penseel (of spider gel)", `Gellak ${dkn(c)}`], stappen: (c, op) => [{ t: "Spinnenweb", x: `${op[0].toUpperCase() + op.slice(1)}: trek vanuit een hoek een paar rechte spaken in ${dkn(c)} en zet er golvende boogjes tussen. Uitharden als het web af is.`, lamp: true }], bron: ["web"], niveau: 3 },
  lijn: { fase: "voor", spullen: (c) => [`Striping tape (${dkn(c)})`, "Schaartje"], stappen: (c, op) => [{ t: "Lijntjes", x: `${op[0].toUpperCase() + op.slice(1)}: leg een stukje striping tape in ${dkn(c)} op de uitgeharde nagel (plaklaag eraf), knip het aan elke kant ± 1 mm korter dan de nagel en druk goed aan. De top coat sluit het straks af.` }], bron: ["tape"], niveau: 1 },
  // als sticker (of schilderen voor gevorderden)
  ...Object.fromEntries(["ster", "twinkel", "maan", "blad", "vlinder", "strik"].map((t) => [t, {
    fase: "voor", sticker: true,
    spullen: (c) => [`Nail-art stickers: ${VERSIERING[t].naam.toLowerCase()} (${dkn(c)})`, "Pincet of cuticle-stokje"],
    stappen: (c, op) => [{ t: `${VERSIERING[t].naam}s plakken`, x: `${op[0].toUpperCase() + op.slice(1)}: veeg eerst de plaklaag weg. Kies een sticker iets kleiner dan de nagel, leg hem met een pincet neer (± 1 mm van de nagelriem) en druk vanuit het midden naar buiten aan. De top coat sluit hem af.` }],
    bron: ["sticker"], niveau: 1,
  }])),
  steentje: { fase: "na", spullen: () => ["Strass-steentjes", "Gem gel of nail-art lijm", "Wax pen of pincet"], stappen: (c, op) => [{ t: "Steentjes", x: `${op[0].toUpperCase() + op.slice(1)}: mat het plekje licht op, zet een klein druppeltje gem gel op de nágel (niet op het steentje) en plaats het steentje met de wax pen. Uitharden (gem gel vaak 60–120 sec), daarna alleen rondom het steentje top coat, niet erover: dan blijft het schitteren.`, lamp: true }], bron: ["steen"], niveau: 1 },
  parel: { fase: "na", spullen: () => ["Pareltjes (plat aan de achterkant)", "Gem gel of nail-art lijm", "Wax pen of pincet"], stappen: (c, op) => [{ t: "Pareltjes", x: `${op[0].toUpperCase() + op.slice(1)}: druppeltje gem gel op de nagel, parel plaatsen met de wax pen, uitharden en alleen rondom afsluiten met top coat.`, lamp: true }], bron: ["steen"], niveau: 1 },
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
  ["UV/LED-lamp", "Nagelvijl en buffer", "Cuticle pusher (of houtje)", "Cleaner + pluisvrije doekjes", "Base coat", D.nails.some((n) => n.fin !== "mat") ? "Top coat (glans)" : null, D.nails.some((n) => n.fin === "mat") ? "Matte top coat" : null, "Nagelriemolie"].filter(Boolean).forEach((x) => spullen.add(x));
  add({ t: "Voorbereiden", x: `Duw de nagelriemen terug, vijl de nagels in ${vorm} vorm${D.length === "lang" ? " (zijn de eigen nagels te kort: verleng eerst met tips of bouwgel volgens je eigen systeem)" : ""} en buff de glans er licht af.` });
  add({ t: "Schoonmaken", x: "Veeg elke nagel af met cleaner op een pluisvrij doekje, zodat er geen stof of vet meer op zit." });
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
  if (voor.length) add({ t: "Plaklaag eraf", x: "Veeg de plaklaag van de kleurlaag af met cleaner, zodat stickers en verf goed hechten en niets uitloopt." });
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
  if (glansIdx.length) add({ t: "Top coat", x: `Een dunne laag top coat ${welkeNagels(glansIdx)}, over de hele nagel en ook over het randje.${D.nails.some((n) => n.fx === "glitter") ? " Op glitternagels eventueel een tweede laag voor een glad oppervlak." : ""}`, lamp: true });
  if (matIdx.length) add({ t: "Matte top coat", x: `Een dunne laag matte top coat ${welkeNagels(matIdx)}, rand cappen.`, lamp: true });
  add({ t: "Afvegen", x: "Laat de nagels ± 2 minuten afkoelen en veeg de plaklaag eraf met cleaner. Gebruik je no-wipe top coat, dan sla je dit over." });
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
