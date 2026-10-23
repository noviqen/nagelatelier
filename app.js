// Nagelatelier — app: scherm, keuzes, slepen, ongedaan maken, galerij en delen.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clone = (o) => JSON.parse(JSON.stringify(o));
const OPSLAG = "nagelatelier.huidig", GALERIJ = "nagelatelier.galerij";

$("#globaldefs").innerHTML = globalDefs();

// ---------- staat ----------
const leeg = () => ({ shape: "almond", length: "middel", skin: 1, naam: "",
  nails: Array(10).fill(0).map(() => ({ c: "#F2C9C4", c2: "#FFFFFF", fx: "effen", fin: "glans", deco: [] })) });

let D = leeg();
const S = { sfeer: "verras", kw: "vrij", niv: 2, aanzicht: "toppen", view: "hand", hand: "R", sel: "all", focus: null, tab: "gen", slot: 1, deco: null, thema: "Alles" };
let undo = [], redo = [];

try {
  const opg = JSON.parse(localStorage.getItem(OPSLAG) || "null");
  if (opg && opg.D && Array.isArray(opg.D.nails) && opg.D.nails.length === 10) {
    D = opg.D;
    Object.assign(S, { view: opg.view || "hand", hand: opg.hand || "R", tab: ["gen", "stappen", "vorm", "kleur", "effect", "deco"].includes(opg.tab) ? opg.tab : "gen", aanzicht: opg.aanzicht || "toppen", sfeer: opg.sfeer || "verras", kw: opg.kw || "vrij", niv: opg.niv || 2 });
  }
} catch (e) { /* begin leeg */ }

let saveT;
function bewaar() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    try { localStorage.setItem(OPSLAG, JSON.stringify({ D, view: S.view, hand: S.hand, tab: S.tab, aanzicht: S.aanzicht, sfeer: S.sfeer, kw: S.kw, niv: S.niv })); } catch (e) {}
  }, 250);
}
function commit() {
  undo.push(JSON.stringify(D));
  if (undo.length > 80) undo.shift();
  redo = [];
}
function stap(van, naar) {
  if (!van.length) return;
  naar.push(JSON.stringify(D));
  D = JSON.parse(van.pop());
  S.deco = null;
  alles();
}

const doelen = () => (S.focus != null ? [S.focus] : S.sel === "all" ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [S.sel]);
const eerste = () => D.nails[doelen()[0]];
const nagelNaam = (i) => VINGERNAAM[i % 5] + (i < 5 ? " rechts" : " links");
const kleurNaam = (hex) => { const n = kn(hex); return n.charAt(0).toUpperCase() + n.slice(1); };

// ---------- toast ----------
let toastT;
function toast(t, ms = 2200) {
  const el = $("#toast");
  el.textContent = t;
  el.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove("on"), ms);
}

// snack met actie (bijv. ongedaan maken)
let snackT;
function snack(t, label, fn, ms = 4500) {
  const el = $("#snack");
  $("span", el).textContent = t;
  const b = $("button", el);
  b.textContent = label || "";
  b.style.display = label ? "" : "none";
  b.onclick = () => { el.classList.remove("on"); fn && fn(); };
  el.classList.add("on");
  clearTimeout(snackT);
  snackT = setTimeout(() => el.classList.remove("on"), ms);
}
const herstel = () => { stap(undo, redo); };

// ---------- podium ----------
let vb = { x: 0, y: 0, w: 1, h: 1 };
function setVB(x, y, w, h) {
  vb = { x, y, w, h };
  $("#stage").setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
}

// viewBox passend bij de vorm van het podium (geen lege randen onder de pols)
function pas(cx, cy, onder, minW, minH) {
  const r = $("#stage").getBoundingClientRect();
  const asp = r.width / Math.max(1, r.height) || 0.75;
  const w = Math.max(minW, minH * asp), h = Math.max(minH, w / asp);
  setVB(cx - w / 2, onder != null ? onder - h : cy - h / 2, w, h);
}

let rafT = 0;
function teken() {
  if (rafT) return;
  rafT = requestAnimationFrame(() => { rafT = 0; tekenNu(); });
}

function tekenNu() {
  const st = $("#stage");
  $("#app").classList.toggle("focus", S.focus != null);
  const foto = S.focus == null && S.view === "hand" && window.HandFoto && HandFoto.ok;
  if (!foto) { st.style.display = ""; if (window.HandFoto && HandFoto.ok) HandFoto.show(false); }
  $("#app").classList.toggle("fotohand", !!foto);
  if (S.focus != null) {
    const i = S.focus, n = D.nails[i], L = nailLen(D.shape, D.length);
    const skin = HUID[D.skin] || HUID[1];
    const r = 70, t = -(BED + 2);
    const finger = `<path d="M${-r},190 L${-r},${t + r} A${r},${r} 0 0 1 ${r},${t + r} L${r},190 Z" fill="url(#fsk)"/>`;
    let extra = "";
    if (S.deco && S.deco.i === i && n.deco[S.deco.j]) extra = decoSel(n.deco[S.deco.j]);
    const inner = nailSVG(n, D.shape, D.length, "fo", nailSeed(i), {
      fold: dark(skin, 0.22), decoAttr: (j) => `data-deco="${j}"`, extra });
    const top = -L - 34, bot = 150, hgt = bot - top;
    const rect = st.getBoundingClientRect();
    const asp = rect.width / Math.max(1, rect.height);
    const w = Math.max(270, hgt * asp);
    setVB(-w / 2, top - 18, w, hgt + 18);
    st.innerHTML = `<defs>${skinDefs("f", skin)}</defs><g ${i >= 5 ? 'transform="scale(-1 1)"' : ""}>${finger}<g data-nail="${i}" data-local="1">${inner}</g></g>`;
    $("#focusTitle").innerHTML = `${VINGERNAAM[i % 5]}<small>${i < 5 ? "RECHTERHAND" : "LINKERHAND"} · ${(i % 5) + 1} van 5</small>`;
  } else if (foto) {
    st.innerHTML = "";
    st.style.display = "none";
    HandFoto.show(true);
    HandFoto.update(D, S.hand, S.sel, S.aanzicht);
    $$("#aanzichtSeg button").forEach((b) => b.classList.toggle("on", b.dataset.a === S.aanzicht));
  } else if (S.view === "hand") {
    pas(210, null, 562, 440, 604);
    const nopt = (i) => ({ sel: S.sel === i });
    st.innerHTML = handSVG(D, S.hand, "st", (i, g) => `<g data-nail="${i}">${g}</g>`, nopt);
  } else {
    pas(200, 236, null, 400, 476);
    const nopt = (i) => ({ sel: S.sel === i });
    st.innerHTML = tipsSVG(D, "st", (i, g) => `<g data-nail="${i}">${g}</g>`, true, nopt);
  }
  // balkjes
  $$("#viewSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === S.view));
  $("#handSw").style.visibility = S.view === "hand" ? "visible" : "hidden";
  $("#handSw").innerHTML = `<svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg>${S.hand === "R" ? "Rechterhand" : "Linkerhand"}`;
  const sp = $("#selPill");
  if (S.sel === "all") sp.innerHTML = `<span class="dot"></span><b>Alle nagels</b> · tik op een nagel`;
  else sp.innerHTML = `<span class="dot"></span><b>${nagelNaam(S.sel)}</b> · <i>alles kiezen</i>`;
  $("#btnUndo").disabled = !undo.length;
  $("#btnRedo").disabled = !redo.length;
  bewaar();
}

function pxPerUnit() {
  const r = $("#stage").getBoundingClientRect();
  return Math.min(r.width / vb.w, r.height / vb.h);
}

// selectiekader + greep rond de gekozen versiering (in nagel-coördinaten)
function decoSel(d) {
  const ppu = pxPerUnit();
  const rr = Math.max(d.s * 0.62, 32 / ppu);
  const a = ((d.r || 0) + 45) * Math.PI / 180;
  const hx = d.x + Math.cos(a) * rr, hy = d.y + Math.sin(a) * rr;
  const hr = 13 / ppu;
  return `<circle cx="${f1(d.x)}" cy="${f1(d.y)}" r="${f1(rr)}" fill="none" stroke="#fff" stroke-width="3.5" vector-effect="non-scaling-stroke" opacity=".9"/>` +
    `<circle cx="${f1(d.x)}" cy="${f1(d.y)}" r="${f1(rr)}" fill="none" stroke="#B4636F" stroke-width="1.6" stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>` +
    `<g data-handle="1"><circle cx="${f1(hx)}" cy="${f1(hy)}" r="${f1(hr * 1.5)}" fill="transparent"/>` +
    `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="${f1(hr)}" fill="#fff" stroke="#B4636F" stroke-width="2" vector-effect="non-scaling-stroke"/>` +
    `<path transform="translate(${f1(hx)} ${f1(hy)}) scale(${f1(hr / 10 * 100) / 100})" d="M-4.5,-1.5 A5,5 0 1 1 -1.5,4.5 M-5,-5 L-4.5,-1.5 L-1,-1.8" fill="none" stroke="#B4636F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></g>`;
}

// ---------- paneel ----------
function paneel() {
  const AANPAS = ["vorm", "kleur", "effect", "deco"];
  $$("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === S.tab || (b.dataset.tab === "aanpassen" && AANPAS.includes(S.tab))));
  const pb = $("#panelBody");
  let h = "";
  const n = eerste();
  if (S.tab === "vorm") {
    h = `<div class="pane"><div class="hs">${VORMEN.map(([id, naam]) => `<button class="shape ${D.shape === id ? "on" : ""}" data-shape="${id}">
        <div class="sv">${miniNail({ ...n, deco: [] }, id, "middel", 28)}</div>${naam}</button>`).join("")}</div>
      <div class="row"><span class="lbl">Lengte</span><div class="seg small light">${LENGTES.map(([id, naam]) => `<button data-len="${id}" class="${D.length === id ? "on" : ""}">${naam}</button>`).join("")}</div></div>
      <div class="row"><span class="lbl">Huid</span><div class="skins">${HUID.map((c, k) => `<button class="skin ${D.skin === k ? "on" : ""}" data-skin="${k}" style="background:${c}" aria-label="Huidskleur ${k + 1}"></button>`).join("")}</div></div></div>`;
  } else if (S.tab === "kleur") {
    const e = EFFECT[n.fx];
    if (!e.c2) S.slot = 1;
    const huidig = S.slot === 2 ? n.c2 : n.c;
    const head = e.c2
      ? `<div class="seg small light" id="slotSeg"><button data-slot="1" class="${S.slot === 1 ? "on" : ""}">Basis</button><button data-slot="2" class="${S.slot === 2 ? "on" : ""}">${e.c2}</button></div>`
      : `<div class="ptitle">Kleur</div>`;
    const eigen = JSON.parse(localStorage.getItem("nagelatelier.eigen") || "[]");
    const eigenGrp = `<div class="grp"><h4>Eigen</h4><div class="sw"><label class="swatch add" aria-label="Eigen kleur kiezen"><span>+</span><input type="color" id="kleurKies" value="${huidig}"></label>${eigen.slice(0, 5).map((c) => sw(c, huidig)).join("")}</div></div>`;
    h = `<div class="pane"><div class="phead">${head}<div class="ptitle"><span>${S.slot === 2 && e.c2 ? e.c2 : "Basis"} ·</span> ${kleurNaam(huidig)}</div></div>
      <div class="groups" id="groups">${KLEUREN.map((g) => `<div class="grp"><h4>${g.groep}</h4><div class="sw">${g.kleuren.map(([c]) => sw(c, huidig)).join("")}</div></div>`).join("")}${eigenGrp}</div></div>`;
  } else if (S.tab === "effect") {
    h = `<div class="pane"><div class="hs">${EFFECTEN.map((e) => `<button class="fx ${n.fx === e.id ? "on" : ""}" data-fx="${e.id}">
        <div class="sv">${miniNail(metEffect({ ...n, deco: [] }, e.id), D.shape, "middel", 34)}</div>${e.naam}</button>`).join("")}</div>
      <div class="row"><span class="lbl">Afwerking</span><div class="seg small light">${[["glans", "Glans"], ["mat", "Mat"]].map(([id, naam]) => `<button data-fin="${id}" class="${n.fin === id ? "on" : ""}">${naam}</button>`).join("")}</div><button class="wisknop" style="margin-left:auto" data-wis="effect"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>Wis effect</button></div></div>`;
  } else if (S.tab === "deco") {
    const sel = S.deco && D.nails[S.deco.i] && D.nails[S.deco.i].deco[S.deco.j];
    if (sel) {
      const ic = {
        kleiner: '<path d="M5 12h14"/>', groter: '<path d="M5 12h14M12 5v14"/>',
        links: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4v4h4"/>', rechts: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M20 4v4h-4"/>',
        alle: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
        weg: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
      };
      const tool = (id, naam, cls = "") => `<button class="dtool ${cls}" data-dt="${id}"><svg viewBox="0 0 24 24">${ic[id]}</svg>${naam}</button>`;
      h = `<div class="pane"><div class="phead"><div class="ptitle">${VERSIERING[sel.t].naam} <span>· sleep, of draai met de greep</span></div><button class="linkbtn" data-dt="klaar">Klaar</button></div>
        <div class="dcols">${DECO_KLEUREN.map(([c, naam]) => `<button class="dcol ${c.startsWith("#") ? "" : c} ${sel.c === c ? "on" : ""}" data-dc="${c}" aria-label="${naam}" ${c.startsWith("#") ? `style="background:${c}"` : ""}></button>`).join("")}</div>
        <div class="dtools">${tool("kleiner", "Kleiner")}${tool("groter", "Groter")}${tool("links", "Draai")}${tool("rechts", "Draai")}${tool("alle", "Alle 10")}${tool("weg", "Weg", "del")}</div></div>`;
    } else {
      h = `<div class="pane"><div class="phead"><div class="hint">Tik om toe te voegen, of sleep naar een nagel</div><button class="wisknop" data-wis="deco"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>Wis</button></div>
        <div class="tray" id="tray">${VERSIERINGEN.map((v) => `<button class="tile" data-add="${v.id}" aria-label="${v.naam}">${miniDeco(v.id, 40)}</button>`).join("")}</div></div>`;
    }
  } else if (S.tab === "gen") {
    h = `<div class="pane gen">
      <div class="chips">${SFEREN.map(([id, naam]) => `<button class="chip ${S.sfeer === id ? "on" : ""}" data-sfeer="${id}">${naam}</button>`).join("")}</div>
      <div class="chips">${KLEURWENS.map(([id, naam, bg]) => `<button class="chip kw ${S.kw === id ? "on" : ""}" data-kw="${id}"><i style="background:${bg}"></i>${naam}</button>`).join("")}</div>
      <div class="row genrow"><div class="seg small light niv">${NIVEAUS.map(([n, naam]) => `<button data-niv="${n}" class="${S.niv === n ? "on" : ""}">${naam}</button>`).join("")}</div></div>
      <div class="row"><button class="genbtn wide" data-gen="1"><svg viewBox="0 0 24 24"><path d="M12 3c.7 3.9 2.1 5.3 6 6-3.9.7-5.3 2.1-6 6-.7-3.9-2.1-5.3-6-6 3.9-.7 5.3-2.1 6-6Z"/></svg>Genereer design</button></div></div>`;
  } else if (S.tab === "stappen") {
    const p = maakStappenplan(D);
    h = `<div class="pane"><div class="plancard"><div class="pcset">${miniSet(D, 92)}</div><div class="pctext"><b>${D.naam || "Mijn design"}</b><small>${p.niveauNaam} · ± ${p.minuten} min · ${p.stappen.length} stappen</small></div></div>
      <ol class="planpeek">${p.stappen.slice(4, 7).map((st) => `<li>${st.t}</li>`).join("")}<li class="meer">… en nog ${Math.max(0, p.stappen.length - 3)} stappen</li></ol>
      <div class="row"><button class="genbtn wide" data-plan="1">Open stappenplan · ${p.spullen.length} spullen</button></div></div>`;
  } else if (S.tab === "idee") {
    const lijst = IDEEEN.map((d, k) => [d, k]).filter(([d]) => S.thema === "Alles" || d.thema === S.thema);
    h = `<div class="pane"><div class="chips">${THEMAS.map((t) => `<button class="chip ${S.thema === t ? "on" : ""}" data-thema="${t}">${t}</button>`).join("")}</div>
      <div class="hs" id="ideas">${lijst.map(([d, k]) => `<button class="idea" data-idee="${k}">${miniSet({ shape: d.vorm, length: d.lengte, nails: d.nagels }, 140)}<b>${d.naam}</b><small>${d.thema}</small></button>`).join("")}</div></div>`;
  }
  if (AANPAS.includes(S.tab)) {
    const sub = `<div class="row subrow"><div class="seg small light sub">${[["vorm", "Vorm"], ["kleur", "Kleur"], ["effect", "Effect"], ["deco", "Versiering"]].map(([id, naam]) => `<button data-sub="${id}" class="${S.tab === id ? "on" : ""}">${naam}</button>`).join("")}</div></div>`;
    h = h.replace('<div class="pane">', '<div class="pane">' + sub);
  }
  pb.innerHTML = h;
  // gekozen chips in beeld houden
  $$(".chips", pb).forEach((rij) => { const on = $(".chip.on", rij); if (on) rij.scrollLeft = Math.max(0, on.offsetLeft - rij.clientWidth / 2 + on.offsetWidth / 2); });
}
function sw(c, huidig) {
  return `<button class="swatch ${String(huidig).toUpperCase() === c.toUpperCase() ? "on" : ""}" data-c="${c}" style="background:${c}" aria-label="${kleurNaam(c)}"></button>`;
}

function alles() { if (["vorm", "kleur", "effect", "deco"].includes(S.tab)) S.laatsteAanpas = S.tab; tekenNu(); paneel(); }

// ---------- effect toepassen (met passende kleuren) ----------
const isLicht = (c) => lum(c) > 0.62;
function metEffect(n, fx) {
  const m = { ...n, fx };
  if (n.fx === fx) return m;
  const c = n.c;
  switch (fx) {
    case "french": m.c2 = isLicht(c) ? "#FFFFFF" : c; m.c = "#F2D7CF"; break;
    case "ombre": m.c2 = isLicht(c) ? "#FFFFFF" : c; m.c = "#F2CFC8"; break;
    case "aura": m.c2 = isLicht(c) ? "#FF6FA5" : c; m.c = "#F6E3DC"; break;
    case "cateye": m.c = lum(c) < 0.08 ? c : dark(c, 0.55); m.c2 = "#E9E4FF"; break;
    case "glitter": m.c2 = "#E9C46A"; break;
    case "marmer": m.c2 = isLicht(c) ? "#8A8380" : c; m.c = "#FAF7F4"; break;
    case "schildpad": m.c = "#B8732E"; m.c2 = "#3A1C0D"; break;
    case "milky": m.c = "#F4EEE9"; break;
    case "strepen": case "ruit": m.c2 = isLicht(c) ? "#E85A8A" : "#FFFFFF"; m.v = 0; break;
    case "regenboog": m.c = "#FFFFFF"; m.v = 0; break;
    case "swirl": m.c2 = isLicht(c) ? "#3A6EA5" : "#FFFFFF"; break;
    case "golffrench": m.c2 = isLicht(c) ? "#7FB3E6" : c; m.c = "#F2D7CF"; break;
    case "vfrench": m.c2 = isLicht(c) ? "#141214" : c; m.c = "#F2D7CF"; break;
    case "luipaard": m.c = isLicht(c) ? c : "#E7C2B0"; m.c2 = "#B5652B"; break;
    case "zebra": m.c = "#FFFFFF"; m.c2 = "#141214"; break;
    case "zee": m.c = "#F2D7CF"; m.c2 = "#BDE0FE"; m.c3 = "#3A6EA5"; break;
  }
  return m;
}

// ---------- klikken in het paneel ----------
$("#panelBody").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const ds = b.dataset;
  if (ds.shape) { commit(); D.shape = ds.shape; alles(); }
  else if (ds.len) { commit(); D.length = ds.len; alles(); }
  else if (ds.skin != null && ds.skin !== "") { D.skin = +ds.skin; alles(); }
  else if (ds.slot) { S.slot = +ds.slot; paneel(); }
  else if (ds.c) kiesKleur(ds.c);
  else if (ds.fx) {
    commit();
    doelen().forEach((i) => { D.nails[i] = metEffect(D.nails[i], ds.fx); });
    if (!EFFECT[ds.fx].c2) S.slot = 1;
    alles();
    toast(EFFECT[ds.fx].naam + (S.sel === "all" && S.focus == null ? " op alle nagels" : ""), 1400);
  }
  else if (ds.fin) { commit(); doelen().forEach((i) => (D.nails[i].fin = ds.fin)); alles(); }
  else if (ds.thema) { S.thema = ds.thema; paneel(); }
  else if (ds.sub) { S.tab = ds.sub; if (S.tab !== "deco") S.deco = null; alles(); }
  else if (ds.sfeer) { S.sfeer = ds.sfeer; paneel(); bewaar(); }
  else if (ds.kw) { S.kw = ds.kw; paneel(); bewaar(); }
  else if (ds.niv) { S.niv = +ds.niv; paneel(); bewaar(); }
  else if (ds.gen) doeGenereer();
  else if (ds.wis === "deco") wisVersieringen();
  else if (ds.wis === "effect") wisEffect();
  else if (ds.plan) toonPlan();
  else if (ds.idee) laadIdee(+ds.idee);
  else if (ds.add && !trayDrag.used) voegToe(ds.add);
  else if (ds.dc) decoActie("kleur", ds.dc);
  else if (ds.dt) decoActie(ds.dt);
});
$("#panelBody").addEventListener("input", (e) => {
  if (e.target.id === "kleurKies") kiesKleur(e.target.value.toUpperCase(), true);
});
$("#panelBody").addEventListener("change", (e) => {
  if (e.target.id !== "kleurKies") return;
  const c = e.target.value.toUpperCase();
  const eigen = JSON.parse(localStorage.getItem("nagelatelier.eigen") || "[]").filter((x) => x !== c);
  eigen.unshift(c);
  localStorage.setItem("nagelatelier.eigen", JSON.stringify(eigen.slice(0, 5)));
  paneel();
});

let laatsteKleurCommit = 0;
function kiesKleur(c, live = false) {
  if (!live || Date.now() - laatsteKleurCommit > 1500) commit();
  laatsteKleurCommit = Date.now();
  doelen().forEach((i) => { if (S.slot === 2) D.nails[i].c2 = c; else D.nails[i].c = c; });
  tekenNu();
  if (!live) paneel();
}

function laadIdee(k) {
  const d = IDEEEN[k];
  commit();
  const vijf = clone(d.nagels);
  D.shape = d.vorm; D.length = d.lengte; D.naam = d.naam;
  D.nails = vijf.concat(clone(vijf));
  S.deco = null;
  alles();
  toast(d.naam + " — pas alles naar wens aan", 1800);
}

// ---------- versieringen ----------
function nieuweDeco(t, x, y) {
  const v = VERSIERING[t];
  return { t, x: Math.round(x), y: Math.round(y), s: v.maat, r: 0, c: v.kleur };
}
function voegToe(t, plek) {
  commit();
  const L = nailLen(D.shape, D.length);
  if (plek) {
    const n = D.nails[plek.i];
    n.deco.push(nieuweDeco(t, plek.x, plek.y));
    if (S.focus == null && S.sel !== plek.i) S.sel = plek.i;
    S.focus = plek.i; S.deco = { i: plek.i, j: n.deco.length - 1 };
  } else if (S.focus != null || S.sel !== "all") {
    const i = S.focus ?? S.sel, n = D.nails[i];
    const y = t === "lijn" ? -L * 0.5 : -L * 0.42 - (n.deco.length % 3) * 10;
    n.deco.push(nieuweDeco(t, (n.deco.length % 3) * 9 - 9 * (n.deco.length % 3 ? 1 : 0), y));
    S.focus = i; S.deco = { i, j: n.deco.length - 1 };
  } else {
    D.nails.forEach((n) => n.deco.push(nieuweDeco(t, 0, t === "lijn" ? -L * 0.5 : -L * 0.42)));
    toast("Op alle nagels gezet · tik een nagel om te verschuiven", 2400);
  }
  alles();
}
function decoActie(a, kleur) {
  if (a === "klaar") { S.deco = null; alles(); return; }
  const { i, j } = S.deco || {};
  const n = D.nails[i], d = n && n.deco[j];
  if (!d) return;
  commit();
  if (a === "kleur") d.c = kleur;
  else if (a === "kleiner") d.s = Math.max(6, Math.round(d.s / 1.15));
  else if (a === "groter") d.s = Math.min(170, Math.round(d.s * 1.15));
  else if (a === "links") d.r = ((d.r || 0) - 15) % 360;
  else if (a === "rechts") d.r = ((d.r || 0) + 15) % 360;
  else if (a === "alle") {
    D.nails.forEach((m, k) => { if (k !== i) m.deco.push(clone(d)); });
    toast("Ook op de andere 9 nagels gezet", 1800);
  } else if (a === "weg") { n.deco.splice(j, 1); S.deco = null; }
  alles();
}

// ---------- aanwijzen op het podium ----------
const stage = $("#stage");
const ptrs = new Map();
let drag = null;

function lokaal(el, cx, cy) {
  const g = el.matches("[data-local]") ? el : el.querySelector("[data-local]");
  const m = g.getScreenCTM().inverse();
  const p = new DOMPoint(cx, cy).matrixTransform(m);
  return { x: p.x, y: p.y };
}
function nagelGroep(i) { return stage.querySelector(`[data-nail="${i}"]`); }

stage.addEventListener("pointerdown", (e) => {
  stage.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 2 && drag && (drag.kind === "deco" || drag.kind === "handle")) {
    const [a, b] = [...ptrs.values()];
    const d = D.nails[drag.i].deco[drag.j];
    drag = { kind: "pinch", i: drag.i, j: drag.j, d0: Math.hypot(b.x - a.x, b.y - a.y), a0: Math.atan2(b.y - a.y, b.x - a.x), s0: d.s, r0: d.r || 0 };
    return;
  }
  if (ptrs.size > 1) return;
  const t = e.target;
  const hd = t.closest("[data-handle]"), dc = t.closest("[data-deco]"), nl = t.closest("[data-nail]");
  if (S.focus != null && hd && S.deco) {
    const d = D.nails[S.deco.i].deco[S.deco.j];
    const p = lokaal(nagelGroep(S.deco.i), e.clientX, e.clientY);
    drag = { kind: "handle", i: S.deco.i, j: S.deco.j, v0: Math.hypot(p.x - d.x, p.y - d.y), a0: Math.atan2(p.y - d.y, p.x - d.x), s0: d.s, r0: d.r || 0, moved: false };
  } else if (S.focus != null && dc) {
    const i = S.focus, j = +dc.dataset.deco, d = D.nails[i].deco[j];
    const p = lokaal(nagelGroep(i), e.clientX, e.clientY);
    const wasSel = S.deco && S.deco.i === i && S.deco.j === j;
    S.deco = { i, j };
    drag = { kind: "deco", i, j, p0: p, x0: d.x, y0: d.y, moved: false };
    if (!wasSel) { if (S.tab !== "deco") S.tab = "deco"; alles(); }
  } else {
    drag = { kind: "tap", nail: nl ? +nl.dataset.nail : null, x: e.clientX, y: e.clientY, t: Date.now() };
  }
});

stage.addEventListener("pointermove", (e) => {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!drag) return;
  if (drag.kind === "pinch" && ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    const d = D.nails[drag.i].deco[drag.j];
    if (!drag.moved) { commit(); drag.moved = true; }
    d.s = Math.max(6, Math.min(170, drag.s0 * Math.hypot(b.x - a.x, b.y - a.y) / drag.d0));
    const da = (Math.atan2(b.y - a.y, b.x - a.x) - drag.a0) * 180 / Math.PI;
    d.r = drag.r0 + (drag.i >= 5 ? -da : da);
    teken();
  } else if (drag.kind === "deco") {
    const d = D.nails[drag.i].deco[drag.j];
    const p = lokaal(nagelGroep(drag.i), e.clientX, e.clientY);
    const dx = p.x - drag.p0.x, dy = p.y - drag.p0.y;
    if (!drag.moved && Math.hypot(dx, dy) * pxPerUnit() < 3) return;
    if (!drag.moved) { commit(); drag.moved = true; }
    const L = nailLen(D.shape, D.length);
    d.x = Math.max(-60, Math.min(60, drag.x0 + dx));
    d.y = Math.max(-L - 10, Math.min(16, drag.y0 + dy));
    teken();
  } else if (drag.kind === "handle") {
    const d = D.nails[drag.i].deco[drag.j];
    const p = lokaal(nagelGroep(drag.i), e.clientX, e.clientY);
    if (!drag.moved) { commit(); drag.moved = true; }
    const v = Math.hypot(p.x - d.x, p.y - d.y), a = Math.atan2(p.y - d.y, p.x - d.x);
    d.s = Math.max(6, Math.min(170, drag.s0 * v / Math.max(1, drag.v0)));
    d.r = drag.r0 + (a - drag.a0) * 180 / Math.PI;
    teken();
  }
});

function loslaten(e) {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.delete(e.pointerId);
  if (!drag) return;
  if (drag.kind === "pinch") { if (ptrs.size === 0) { drag = null; paneel(); } return; }
  if (drag.kind === "tap" && e.type === "pointerup" && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 10) tik(drag.nail);
  if ((drag.kind === "deco" || drag.kind === "handle") && drag.moved) { const d = D.nails[drag.i].deco[drag.j]; d.x = Math.round(d.x); d.y = Math.round(d.y); d.s = Math.round(d.s); d.r = Math.round(d.r); }
  drag = null;
  if (ptrs.size === 0) tekenNu();
}
stage.addEventListener("pointerup", loslaten);
stage.addEventListener("pointercancel", loslaten);

let tipGezien = false;
function tik(i) {
  if (S.focus != null) {
    if (S.deco) { S.deco = null; alles(); }
    return;
  }
  if (i == null) { if (S.sel !== "all") { S.sel = "all"; alles(); } return; }
  if (S.tab === "deco" || S.sel === i) { zoom(i); return; }
  S.sel = i;
  alles();
  if (!tipGezien) { tipGezien = true; toast("Tik nog een keer om in te zoomen", 2000); }
}
function zoom(i) {
  $("#toast").classList.remove("on");
  S.focus = i; S.sel = i; S.deco = null;
  if (S.view === "hand") S.hand = i < 5 ? "R" : "L";
  alles();
}
const VOLGORDE = [5 + 4, 5 + 3, 5 + 2, 5 + 1, 5, 0, 1, 2, 3, 4]; // links pink → rechts pink
function volgende(stapje) {
  const k = VOLGORDE.indexOf(S.focus);
  S.focus = VOLGORDE[(k + stapje + 10) % 10];
  S.sel = S.focus; S.deco = null;
  if (S.view === "hand") S.hand = S.focus < 5 ? "R" : "L";
  alles();
}
$("#prevNail").onclick = () => volgende(-1);
$("#nextNail").onclick = () => volgende(1);
$("#focusBack").onclick = () => { S.focus = null; S.deco = null; alles(); };
$("#selPill").onclick = () => { S.sel = "all"; alles(); };
$("#handSw").onclick = () => { S.hand = S.hand === "R" ? "L" : "R"; if (S.sel !== "all") S.sel = "all"; alles(); };
$$("#viewSeg button").forEach((b) => (b.onclick = () => { S.view = b.dataset.v; alles(); }));
$$("#tabs button").forEach((b) => (b.onclick = () => {
  S.tab = b.dataset.tab === "aanpassen" ? (["vorm", "kleur", "effect", "deco"].includes(S.laatsteAanpas) ? S.laatsteAanpas : "kleur") : b.dataset.tab;
  if (S.tab !== "deco") S.deco = null;
  alles();
}));
$("#btnUndo").onclick = () => stap(undo, redo);
$("#btnRedo").onclick = () => stap(redo, undo);
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? stap(redo, undo) : stap(undo, redo); }
  else if ((e.key === "Backspace" || e.key === "Delete") && S.deco) decoActie("weg");
  else if (e.key === "Escape") { if (S.deco) decoActie("klaar"); else if (S.focus != null) $("#focusBack").click(); }
});

// ---------- slepen vanuit de lade ----------
const trayDrag = { used: false };
const ghost = $("#ghost");
$("#panelBody").addEventListener("pointerdown", (e) => {
  const tile = e.target.closest("[data-add]");
  if (!tile) return;
  trayDrag.used = false;
  trayDrag.t = tile.dataset.add; trayDrag.x = e.clientX; trayDrag.y = e.clientY; trayDrag.on = false; trayDrag.id = e.pointerId; trayDrag.tile = tile;
});
window.addEventListener("pointermove", (e) => {
  if (!trayDrag.t || e.pointerId !== trayDrag.id) return;
  const dx = e.clientX - trayDrag.x, dy = e.clientY - trayDrag.y;
  if (!trayDrag.on) {
    if (dy < -12 && Math.abs(dy) > Math.abs(dx)) {
      trayDrag.on = true;
      try { trayDrag.tile.releasePointerCapture(e.pointerId); } catch (_) {}
      ghost.innerHTML = miniDeco(trayDrag.t, 64);
      ghost.classList.add("on");
    } else if (Math.abs(dx) > 12) { trayDrag.t = null; return; }
  }
  if (trayDrag.on) ghost.style.transform = `translate(${e.clientX}px, ${e.clientY - 44}px)`;
});
window.addEventListener("pointerup", (e) => {
  if (!trayDrag.t || e.pointerId !== trayDrag.id) return;
  if (trayDrag.on) {
    trayDrag.used = true;
    setTimeout(() => (trayDrag.used = false), 50);
    ghost.classList.remove("on");
    const x = e.clientX, y = e.clientY - 44;
    const el = document.elementFromPoint(x, y);
    const nl = el && el.closest && el.closest("#stage [data-nail]");
    const op3d = el && el.closest && el.closest("#stagefoto") && window.HandFoto && HandFoto.ok ? HandFoto.pick(x, y) : null;
    if (op3d && op3d.i != null) voegToe(trayDrag.t, { i: op3d.i, x: op3d.x, y: op3d.y });
    else if (nl) {
      const i = +nl.dataset.nail, p = lokaal(nl, x, y);
      voegToe(trayDrag.t, { i, x: p.x, y: p.y });
    } else toast("Laat los boven een nagel", 1500);
  }
  trayDrag.t = null;
});
window.addEventListener("pointercancel", () => { if (trayDrag.on) ghost.classList.remove("on"); trayDrag.t = null; });

// ---------- galerij ----------
const galerij = () => { try { return JSON.parse(localStorage.getItem(GALERIJ) || "[]"); } catch (e) { return []; } };
function openSheet(id) { $(id).classList.add("on"); $(id).setAttribute("aria-hidden", "false"); }
function sluitSheet(el) { el.classList.remove("on"); el.setAttribute("aria-hidden", "true"); }
$$(".sheet").forEach((sh) => {
  sh.addEventListener("click", (e) => { if (e.target === sh || e.target.closest("[data-close]")) sluitSheet(sh); });
});
const RECENT = "nagelatelier.recent";
const recent = () => { try { return JSON.parse(localStorage.getItem(RECENT) || "[]"); } catch (e) { return []; } };
let galLijst = "bewaard";
function lijstData() { return galLijst === "bewaard" ? galerij() : recent(); }
function lijstOpslaan(g) { localStorage.setItem(galLijst === "bewaard" ? GALERIJ : RECENT, JSON.stringify(g)); }
function toonGalerij() {
  const g = lijstData();
  $$("#galSeg button").forEach((b) => b.classList.toggle("on", b.dataset.lijst === galLijst));
  $("#galWisAlles").style.visibility = g.length ? "visible" : "hidden";
  $("#galGrid").innerHTML = g.length
    ? g.map((it, k) => `<div class="gcard" data-open="${k}">${miniSet(it.D, 150)}<b>${it.naam}</b><small>${new Date(it.t).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}${galLijst === "recent" ? " · " + new Date(it.t).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : ""}</small><button class="x" data-del="${k}" aria-label="Verwijderen"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg></button></div>`).join("")
    : `<div class="gempty">${galLijst === "bewaard" ? "Nog geen bewaarde designs.<br>Maak iets moois en tik op <b>Bewaar dit design</b>." : "Nog niets gegenereerd.<br>Elk design dat je genereert komt hier te staan."}</div>`;
  openSheet("#galSheet");
}
$$("#galSeg button").forEach((b) => (b.onclick = () => { galLijst = b.dataset.lijst; toonGalerij(); }));
$("#galWisAlles").onclick = () => {
  const oud = lijstData();
  if (!oud.length) return;
  lijstOpslaan([]); toonGalerij();
  snack(`${oud.length} designs gewist`, "Ongedaan maken", () => { lijstOpslaan(oud); toonGalerij(); });
};
$("#btnGal").onclick = () => { galLijst = "bewaard"; toonGalerij(); };
$("#btnSave").onclick = () => {
  const g = galerij();
  const naam = (prompt("Naam van dit design", D.naam || `Design ${g.length + 1}`) || "").trim();
  if (!naam) return;
  D.naam = naam;
  g.unshift({ naam, t: Date.now(), D: clone(D) });
  localStorage.setItem(GALERIJ, JSON.stringify(g.slice(0, 200)));
  galLijst = "bewaard"; toonGalerij();
  toast("Bewaard in Mijn designs", 1600);
};
$("#btnNew").onclick = () => {
  commit();
  const vorm = { shape: D.shape, length: D.length, skin: D.skin };
  D = Object.assign(leeg(), vorm);
  S.sel = "all"; S.focus = null; S.deco = null;
  sluitSheet($("#galSheet"));
  alles();
  toast("Nieuw design · ongedaan maken kan altijd", 1800);
};
$("#galGrid").addEventListener("click", (e) => {
  const del = e.target.closest("[data-del]");
  const g = lijstData();
  if (del) {
    const k = +del.dataset.del, weg = g.splice(k, 1)[0];
    lijstOpslaan(g); toonGalerij();
    snack(`"${weg.naam}" gewist`, "Ongedaan maken", () => { const h = lijstData(); h.splice(k, 0, weg); lijstOpslaan(h); toonGalerij(); });
    return;
  }
  const op = e.target.closest("[data-open]");
  if (!op) return;
  commit();
  D = clone(g[+op.dataset.open].D);
  S.sel = "all"; S.focus = null; S.deco = null;
  sluitSheet($("#galSheet"));
  alles();
});

// ---------- delen als afbeelding ----------
async function maakAfbeelding() {
  const W = 1080, H = 1350;
  const foto3d = window.HandFoto && HandFoto.ok && S.view === "hand" ? HandFoto.snapshot() : null;
  const hand = foto3d ? `<image href="${foto3d}" x="${(1080 - 688) / 2}" y="150" width="688" height="860"/>` : `<g transform="translate(${(W - 440 * 1.55) / 2 + 10 * 1.55} 40) scale(1.55)">${handSVG(D, S.hand, "ex")}</g>`;
  let tips = "";
  const xs = [], gap = 92, mid = W / 2;
  for (let s = 0; s < 5; s++) xs.push(mid - 70 - (4 - s) * gap);
  for (let s = 0; s < 5; s++) xs.push(mid + 70 + s * gap);
  for (let s = 0; s < 10; s++) {
    const links = s < 5, fi = links ? 4 - s : s - 5, i = (links ? 5 : 0) + fi, k = 0.6 * TIPMAAT[fi];
    tips += `<g transform="translate(${xs[s]} 1268) scale(${links ? -k : k} ${k})">${nailSVG(D.nails[i], D.shape, D.length, "ext" + i, nailSeed(i), { shadow: true })}</g>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${globalDefs()}
    <radialGradient id="exbg" cx=".5" cy=".38" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F8EFEC"/><stop offset="1" stop-color="#EFDFDA"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#exbg)"/>${hand}<rect x="60" y="1010" width="${W - 120}" height="300" rx="40" fill="#fff" opacity=".55"/>${tips}</svg>`;
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await img.decode();
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const cx = cv.getContext("2d");
  cx.drawImage(img, 0, 0);
  cx.fillStyle = "#2B2026";
  cx.font = "600 44px ui-serif, 'New York', Georgia, serif";
  cx.textAlign = "left";
  cx.fillText(D.naam || "Mijn nageldesign", 70, 100);
  cx.fillStyle = "#B4636F";
  cx.font = "italic 30px ui-serif, 'New York', Georgia, serif";
  const vorm = (VORMEN.find((v) => v[0] === D.shape) || [, ""])[1], len = (LENGTES.find((l) => l[0] === D.length) || [, ""])[1];
  cx.fillText(`${vorm} · ${len.toLowerCase()}`, 70, 146);
  return new Promise((res) => cv.toBlob(res, "image/png"));
}
let deelBlob = null;
$("#btnShare").onclick = async () => {
  openSheet("#shareSheet");
  $("#shareImg").removeAttribute("src");
  try {
    deelBlob = await maakAfbeelding();
    const url = URL.createObjectURL(deelBlob);
    $("#shareImg").src = url;
    $("#btnDownload").href = url;
  } catch (e) { toast("Afbeelding maken lukte niet", 2000); }
};
$("#btnDoShare").onclick = async () => {
  if (!deelBlob) return;
  const file = new File([deelBlob], "nageldesign.png", { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: D.naam || "Nageldesign" }); } catch (e) { /* geannuleerd */ }
  } else $("#btnDownload").click();
};

// ---------- 3D-hand ----------
window.fotoTap = (i) => tik(i);
window.__fotoReady = () => alles();
$$("#aanzichtSeg button").forEach((b) => (b.onclick = () => { S.aanzicht = b.dataset.a; alles(); }));

// ---------- wissen ----------
const kaleNagel = () => ({ c: "#F2D7CF", c2: "#FFFFFF", fx: "effen", fin: "glans", deco: [] });
$("#btnWis").onclick = () => {
  commit();
  const keep = { shape: D.shape, length: D.length, skin: D.skin };
  D = Object.assign(leeg(), keep, { nails: Array(10).fill(0).map(kaleNagel), naam: "" });
  S.sel = "all"; S.focus = null; S.deco = null;
  alles();
  snack("Design gewist", "Ongedaan maken", herstel);
};
$("#wisNagel").onclick = () => {
  if (S.focus == null) return;
  commit();
  D.nails[S.focus] = kaleNagel(); S.deco = null;
  alles();
  snack(`${nagelNaam(S.focus)} gewist`, "Ongedaan maken", herstel);
};
function wisVersieringen() {
  const doel = doelen().filter((i) => D.nails[i].deco.length);
  if (!doel.length) { toast("Geen versieringen om te wissen", 1500); return; }
  commit();
  let n = 0; doel.forEach((i) => { n += D.nails[i].deco.length; D.nails[i].deco = []; });
  S.deco = null; alles();
  snack(`${n} versiering${n === 1 ? "" : "en"} gewist`, "Ongedaan maken", herstel);
}
function wisEffect() {
  const doel = doelen().filter((i) => D.nails[i].fx !== "effen");
  if (!doel.length) { toast("Er staat geen effect op", 1500); return; }
  commit();
  doel.forEach((i) => { D.nails[i].fx = "effen"; });
  alles();
  snack("Effect gewist", "Ongedaan maken", herstel);
}

// ---------- generator + stappenplan ----------
function doeGenereer() {
  commit();
  const g = genereer({ sfeer: S.sfeer, kleur: S.kw, niveau: S.niv });
  D.shape = g.shape; D.length = g.length; D.naam = g.naam; D.nails = g.nails;
  try { const r = recent(); r.unshift({ naam: g.naam, t: Date.now(), D: clone(D) }); localStorage.setItem(RECENT, JSON.stringify(r.slice(0, 40))); } catch (e) {}
  S.sel = "all"; S.focus = null; S.deco = null; S.klaar = new Set();
  if (S.view === "hand") S.aanzicht = "toppen";
  alles();
  const p = maakStappenplan(D);
  toast(`${g.naam} · ${p.niveauNaam} · ± ${p.minuten} min`, 2600);
}
function toonPlan() {
  const p = maakStappenplan(D);
  S.klaar = S.klaar || new Set();
  let groep = null, nr = 0;
  const stappen = p.stappen.map((st, k) => {
    let kop = "";
    if (st.groep && st.groep !== groep) { groep = st.groep; kop = `<li class="pgroep">${st.groep}</li>`; }
    else if (!st.groep && groep) { groep = null; }
    nr++;
    return kop + `<li class="pstap ${S.klaar.has(k) ? "klaar" : ""}" data-stap="${k}"><span class="pnr">${nr}</span><div><b>${st.t}</b><p>${st.x}</p>${st.lamp ? `<span class="lamp">Uitharden*</span>` : ""}</div></li>`;
  }).join("");
  $("#planBody").innerHTML = `
    <div class="phero">${miniSet(D, 150)}<div><h3>${D.naam || "Mijn design"}</h3><div class="pmeta"><span>${p.niveauNaam}</span><span>± ${p.minuten} min</span><span>${(VORMEN.find((v) => v[0] === D.shape) || [, ""])[1]} · ${D.length}</span></div></div></div>
    <h4>Wat heb je nodig</h4>
    <ul class="pspul">${p.spullen.map((x) => `<li><label><input type="checkbox"><span>${x}</span></label></li>`).join("")}</ul>
    <h4>Stappen <small>tik een stap af als hij klaar is</small></h4>
    <ol class="pstappen">${stappen}</ol>
    <p class="pnoot">* Hard elke laag apart uit met een lamp die past bij je gel, met de tijd, laagdikte en handpositie die het product voorschrijft (veel LED-gellak 30–60 sec, UV meestal langer; let ook op dat de duimen goed onder het licht liggen). Een hard oppervlak betekent niet altijd dat de laag helemaal is uitgehard.</p>
    <h4>Bronnen</h4>
    <ul class="pbron">${p.bronnen.map(([naam, url]) => `<li><a href="${url}" target="_blank" rel="noopener">${naam}</a></li>`).join("")}</ul>`;
  openSheet("#planSheet");
}
$("#planBody").addEventListener("click", (e) => {
  const li = e.target.closest("[data-stap]");
  if (!li) return;
  const k = +li.dataset.stap;
  S.klaar = S.klaar || new Set();
  S.klaar.has(k) ? S.klaar.delete(k) : S.klaar.add(k);
  li.classList.toggle("klaar");
});

// ---------- start ----------
window.addEventListener("resize", () => teken());
alles();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
