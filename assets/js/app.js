import * as E from "./engine.js";
import * as G from "./gamedata.js";
import * as C from "./creature.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ============================================================
// Data & helpers
// ============================================================
const CATALOG = await fetch("assets/data/catalog.json").then(r => r.json());
const IDS = CATALOG.map(c => c.id);
const BY_ID = Object.fromEntries(CATALOG.map(c => [c.id, c]));
const NAMES = Object.fromEntries(CATALOG.map(c => [c.id, c.name]));
const BIOME_OF = {};
G.BIOMES.forEach(b => b.rewards.forEach(id => { BIOME_OF[id] = b; }));
const STARTER_SET = new Set(G.STARTERS);

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const icon = id => `assets/icons/${encodeURIComponent(id)}.webp`;
const name = id => NAMES[id] || id;
const img = (id, alt = "") => `<img src="${icon(id)}" alt="${esc(alt)}" loading="lazy" width="96" height="96">`;
const releaseAt = id => (G.RELEASES[id] ? new Date(G.RELEASES[id]) : null);
const isOut = id => { const d = releaseAt(id); return !d || d <= new Date(); };
const fmtDate = d => d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
function countdown(d) {
  let s = Math.max(0, Math.floor((d - Date.now()) / 1000));
  const dd = Math.floor(s / 86400); s %= 86400;
  const hh = Math.floor(s / 3600); s %= 3600;
  const mm = Math.floor(s / 60);
  return dd ? `${dd}d ${hh}h` : hh ? `${hh}h ${mm}m` : `${mm}m`;
}
function source(id) {
  if (STARTER_SET.has(id)) return { short: "Starter", long: "Free from the start" };
  if (BIOME_OF[id]) { const b = BIOME_OF[id]; return { short: `Wild T${b.tier}`, long: `The Wild · Tier ${b.tier} ${b.name} (${b.difficulty})`, biome: b }; }
  if (BY_ID[id].element) return { short: "Special", long: "Special animal · featured in shop packs" };
  return { short: "Shop", long: "Shop packs" };
}
const SHINY_KEYS = [null, ...G.SHINY_ORDER];
const shinyName = s => (s ? G.SHINIES[s].name : "Normal");
const ALGO_LABEL = { "light-dark": "Light / Dark", "vivid-light-dark": "Vivid Light / Dark", "closest-pairing": "Closest Pair", "vivid-closest-pairing": "Vivid Closest Pair", "dominant-traits": "Dominant", "vivid-dominant-traits": "Vivid Dominant" };

// ---------- persistent state ----------
const STORE_KEY = "iaw.v2";
const store = (() => {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch { s = {}; }
  return Object.assign({ pen: [], owned: null, charm: 0, algo: "light-dark" }, s);
})();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* private mode */ }
  $("#pen-count").textContent = store.pen.length;
}
const owns = id => !store.owned || store.owned.includes(id);

// ---------- toast / modal ----------
let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
function openModal(title, html, onMount) {
  $("#modal-title").textContent = title;
  $("#modal-body").innerHTML = html;
  $("#modal").hidden = false;
  onMount && onMount($("#modal-body"));
  setTimeout(() => ($("#modal-body input, #modal-body button") || $("#modal [data-close]")).focus(), 30);
}
function closeModal() { $("#modal").hidden = true; $("#modal-body").innerHTML = ""; }
$("#modal").addEventListener("click", e => { if (e.target.id === "modal" || e.target.closest("[data-close]")) closeModal(); });
function copy(text, msg = "Copied!") {
  (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast(msg)).catch(() => {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast(msg); } catch { toast("Copy failed"); } ta.remove();
  });
}

// ---------- fusion helpers ----------
const singleCache = new Map();
function single(a, b, shiny = null) {
  const k = `${a}|${b}|${shiny}`;
  if (!singleCache.has(k)) singleCache.set(k, E.single(a, b, shiny));
  return singleCache.get(k);
}
const allPairs = (() => {
  let cache = null;
  return () => cache || (cache = IDS.flatMap((a, i) => IDS.slice(i + 1).map(b => [a, b])));
})();
const withCharm = income => income * E.charmMultiplier(store.charm);

// ---------- shared UI pieces ----------
function starRow(parts) {
  // parts: [[count, cls]...]
  let i = 0, html = "";
  for (const [n, cls] of parts) for (let k = 0; k < n; k++) html += `<i class="${cls || ""}" style="animation-delay:${(i++) * 28}ms"></i>`;
  return `<div class="star-row" aria-hidden="true">${html}</div>`;
}
function shinySeg(current, attr = "data-shiny") {
  return `<div class="seg" role="group" aria-label="Mutation">${SHINY_KEYS.map(s =>
    `<button type="button" class="${s ? "m-" + s : ""}" ${attr}="${s || ""}" aria-pressed="${(current || null) === s}">${shinyName(s)}${s ? ` <small>+${G.SHINIES[s].bonus}★</small>` : ""}</button>`).join("")}</div>`;
}
function charmSelect() {
  return `<select class="input" data-charm aria-label="Charm" style="max-width:240px">
    <option value="0">No charm (×1)</option>
    ${G.CHARMS.map(c => `<option value="${c.tier}" ${store.charm === c.tier ? "selected" : ""}>${c.name} Charm (×${c.multiplier})</option>`).join("")}
  </select>`;
}
function mutLabel(s) { return s ? ` <span class="mut mut-${s}">(${shinyName(s)})</span>` : ""; }
function pairPortrait(a, b, thumbKey) {
  if (thumbKey) return `<div class="portrait sm" data-thumb="${esc(thumbKey)}"><div class="pair">${img(a)}${img(b)}</div></div>`;
  return `<div class="portrait sm"><div class="pair">${img(a)}${img(b)}</div></div>`;
}
function hybridCard(r, opts = {}) {
  const color = opts.color || "";
  const known = r.kind === "single" ? E.hybridName(r.dad, r.mom) : null;
  const recipe = r.kind === "double"
    ? `${name(r.parents[0])} + ${name(r.parents[1])} ⨯ ${name(r.parents[2])} + ${name(r.parents[3])}`
    : `${name(r.dad)} + ${name(r.mom)}`;
  const title = known || recipe;
  if (known && !opts.sub) opts = { ...opts, sub: recipe };
  const key = r.kind === "double" ? `d|${r.hybrids[0].dad}|${r.hybrids[0].mom}|${r.hybrids[1].dad}|${r.hybrids[1].mom}|${r.shiny}` : `s|${r.dad}|${r.mom}|${r.shiny}`;
  const portrait = r.kind === "double" ? pairPortrait(r.hybrids[0].dad, r.hybrids[1].dad, key) : pairPortrait(r.dad, r.mom, key);
  return `<button type="button" class="card ${color} hy" ${opts.attrs || ""}>
    ${opts.rank ? `<span class="rank">${opts.rank}</span>` : ""}
    ${portrait}
    <span class="hy-main">
      <span class="hy-name outline">${esc(opts.title || title)}${mutLabel(r.shiny)}</span>
      ${opts.sub ? `<span class="hy-sub">${esc(opts.sub)}</span>` : ""}
      <span class="hy-stats"><span class="star-n">${r.stars}</span><span class="cash">${E.money(r.income)}</span>${opts.extra || ""}</span>
    </span>
  </button>`;
}

// ---------- lazy 3D thumbnails ----------
const thumbQueue = [];
let thumbBusy = false;
const thumbObserver = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) { thumbObserver.unobserve(e.target); thumbQueue.push(e.target); }
  pumpThumbs();
}, { rootMargin: "200px" });
function buildFromKey(key) {
  const p = key.split("|"), shiny = p[p.length - 1] === "null" ? null : p[p.length - 1];
  let body;
  if (p[0] === "s") body = C.fusionBody(p[1], p[2], store.algo);
  else body = C.doubleBody({ dad: p[1], mom: p[2] }, { dad: p[3], mom: p[4] }, store.algo);
  return body && shiny ? C.applyShiny(body, shiny, G.SHINIES[shiny].colors) : body;
}
async function pumpThumbs() {
  if (thumbBusy) return;
  thumbBusy = true;
  await C.loadShapes();
  while (thumbQueue.length) {
    const el = thumbQueue.shift();
    if (!el.isConnected) continue;
    const key = el.dataset.thumb;
    let url = null;
    try { url = C.thumbnail(key, () => buildFromKey(key)); } catch (err) { console.warn("thumb failed", key, err); }
    if (url) el.innerHTML = `<img src="${url}" alt="">`;
    await new Promise(r => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 60 }) : setTimeout(r, 8)));
  }
  thumbBusy = false;
}
function observeThumbs(root = document) { $$("[data-thumb]", root).forEach(el => thumbObserver.observe(el)); }

// ---------- 3D stage ----------
let viewer = null;
function destroyViewer() { if (viewer) { viewer.destroy(); viewer = null; } }
function stageHTML(id = "stage") {
  return `<div class="stage" id="${id}"><div class="stage-3d"></div><div class="stage-overlay"></div><span class="stage-hint">Drag to spin · scroll to zoom</span></div>`;
}
/** Show a creature, or a fallback for special-body animals. */
async function showOnStage(stageEl, spec) {
  const overlay = $(".stage-overlay", stageEl), holder = $(".stage-3d", stageEl);
  overlay.innerHTML = "";
  overlay.style.pointerEvents = "none";
  if (!spec) {
    if (viewer) viewer.show(null);
    overlay.innerHTML = `<span class="stage-q">?</span>`;
    return;
  }
  await C.loadShapes();
  if (!viewer || viewer.el !== holder) { destroyViewer(); viewer = new C.Viewer(holder, { OrbitControls }); }
  let body = null, note = "", specials = [];
  if (spec.type === "animal") {
    if (C.hasBody(spec.id)) body = C.baseAnimal(spec.id); else specials = [spec.id];
  } else if (spec.type === "single") {
    const [a, b] = [spec.dad, spec.mom];
    body = C.fusionBody(a, b, store.algo);
    if (!body) {
      const normal = [a, b].filter(C.hasBody);
      specials = [a, b].filter(x => !C.hasBody(x));
      if (normal.length === 1) { body = C.baseAnimal(normal[0]); note = `${name(specials[0])} adds its special effects to ${name(normal[0])}'s body in-game. Effects aren't shown here yet.`; }
    }
  } else if (spec.type === "double") {
    body = C.doubleBody(spec.h1, spec.h2, store.algo);
    if (!body) { specials = [spec.h1.dad, spec.h1.mom, spec.h2.dad, spec.h2.mom].filter(x => !C.hasBody(x)); note = "This double fusion uses a special animal, whose 3D body isn't rebuilt here yet."; }
  }
  if (body && spec.shiny) body = C.applyShiny(body, spec.shiny, G.SHINIES[spec.shiny].colors);
  if (body) {
    viewer.show(body, { glow: specials.length ? "#7fd8ff" : null });
    if (specials.length) overlay.innerHTML += `<div class="stage-parents">${specials.map(s => `<span class="chip"><img src="${icon(s)}" alt="">+ ${esc(name(s))}</span>`).join("")}</div>`;
  } else {
    viewer.show(null);
    const list = [...new Set(specials)];
    overlay.innerHTML = `<div class="stage-special"><div class="special-pair">${list.map((s, i) => (i ? `<span class="plus">+</span>` : "") + `<img src="${icon(s)}" alt="${esc(name(s))}">`).join("")}</div></div>`;
    if (spec.type === "animal") note = `${name(spec.id)} has a special animated body in-game, so this is its official icon.`;
  }
  if (note) overlay.innerHTML += `<div class="stage-note">${esc(note)}</div>`;
  if (spec.flash) { stageEl.classList.remove("fuse-flash"); void stageEl.offsetWidth; stageEl.classList.add("fuse-flash"); }
}

// ---------- animal picker grid ----------
function tileGrid(opts) {
  const { selected, mom, filter = "all", query = "" } = opts;
  const q = query.trim().toLowerCase();
  const list = CATALOG.filter(c => {
    if (q && !c.name.toLowerCase().includes(q) && !c.id.includes(q)) return false;
    if (filter === "starters") return STARTER_SET.has(c.id);
    if (filter === "special") return !!G.SPECIAL_BONUS[c.id];
    if (filter === "owned") return owns(c.id);
    if (filter === "wild") return !!BIOME_OF[c.id];
    if (filter === "soon") return !isOut(c.id);
    return true;
  });
  if (!list.length) return `<p class="empty">No animals match “${esc(query)}”.</p>`;
  return `<div class="tile-grid">${list.map(c => {
    const soon = !isOut(c.id), bonus = G.SPECIAL_BONUS[c.id];
    return `<div class="tile-wrap"><button type="button" class="tile ${mom ? "mom" : ""} ${soon ? "locked" : ""}" data-pick="${c.id}" aria-pressed="${selected === c.id}" title="${esc(c.name)}">
      ${img(c.id, c.name)}${bonus ? `<span class="bonus">+${bonus}★</span>` : ""}${soon ? `<span class="tag">${countdown(releaseAt(c.id))}</span>` : ""}
    </button><span class="tile-label">${esc(c.name)}</span></div>`;
  }).join("")}</div>`;
}
function pickerFilters(current) {
  const f = [["all", "All"], ["starters", "Starters"], ["wild", "Wild"], ["special", "+★ Specials"], ["owned", "Owned"], ["soon", "Coming soon"]];
  return `<div class="seg" role="group" aria-label="Filter">${f.map(([k, l]) => `<button type="button" data-filter="${k}" aria-pressed="${current === k}">${l}</button>`).join("")}</div>`;
}
function pickAnimalModal(title, mom, onPick) {
  let filter = "all", query = "";
  const draw = body => {
    $(".picker-grid", body).innerHTML = tileGrid({ mom, filter, query });
  };
  openModal(title, `<div class="stack"><input class="input" type="search" placeholder="Search animals…" data-q>${pickerFilters(filter)}<div class="picker-grid"></div></div>`, body => {
    draw(body);
    $("[data-q]", body).addEventListener("input", e => { query = e.target.value; draw(body); });
    body.addEventListener("click", e => {
      const f = e.target.closest("[data-filter]");
      if (f) { filter = f.dataset.filter; $$("[data-filter]", body).forEach(b => b.setAttribute("aria-pressed", b === f)); draw(body); return; }
      const t = e.target.closest("[data-pick]");
      if (t) { closeModal(); onPick(t.dataset.pick); }
    });
  });
}

// ============================================================
// Pages
// ============================================================
const fuse = { dad: null, mom: null, shiny: null, step: "dad", filter: "all", query: "" };
const dbl = { h: [{ dad: null, mom: null, shiny: null }, { dad: null, mom: null, shiny: null }], fused: false };

function renderFuse(root) {
  root.innerHTML = `
  <div class="page-head"><div><h1 class="outline">Fusion Lab</h1>
    <p>Pick a dad and a mom to see the hybrid in 3D, with the exact stars and income the game gives it.</p></div></div>
  <div class="grid-2">
    <div class="stack">
      ${stageHTML()}
      <div id="fuse-result"></div>
    </div>
    <div class="panel picker">
      <div class="picker-steps">
        <button type="button" class="card step" data-step="dad" aria-pressed="${fuse.step === "dad"}"></button>
        <button type="button" class="card purple step" data-step="mom" aria-pressed="${fuse.step === "mom"}"></button>
      </div>
      <div id="fuse-recent"></div>
      <h2 class="bar-title ${fuse.step === "mom" ? "purple" : "blue"} outline" id="pick-title">${fuse.step === "mom" ? "Pick a mom" : "Pick a dad"}</h2>
      <div class="row"><input class="input" type="search" placeholder="Search animals… (press /)" data-search value="${esc(fuse.query)}" style="flex:1;min-width:160px"></div>
      ${pickerFilters(fuse.filter)}
      <div class="picker-grid" id="fuse-grid"></div>
    </div>
  </div>`;
  const drawSteps = () => {
    for (const s of ["dad", "mom"]) {
      const id = fuse[s], el = $(`[data-step="${s}"]`, root);
      el.setAttribute("aria-pressed", fuse.step === s);
      el.innerHTML = `<span class="portrait">${id ? img(id) : ""}</span><span class="outline">${id ? esc(name(id)) : s === "dad" ? "Dad" : "Mom"}<small>${s === "dad" ? "Dad" : "Mom"}${id && G.SPECIAL_BONUS[id] ? ` · +${G.SPECIAL_BONUS[id]}★` : ""}</small></span>`;
    }
    const t = $("#pick-title", root);
    t.textContent = fuse.step === "mom" ? "Pick a mom" : "Pick a dad";
    t.className = `bar-title ${fuse.step === "mom" ? "purple" : "blue"} outline`;
  };
  const drawGrid = () => { $("#fuse-grid", root).innerHTML = tileGrid({ selected: fuse[fuse.step], mom: fuse.step === "mom", filter: fuse.filter, query: fuse.query }); };
  const drawResult = flash => {
    const out = $("#fuse-result", root);
    if (fuse.dad && fuse.mom) showOnStage($("#stage", root), { type: "single", dad: fuse.dad, mom: fuse.mom, shiny: fuse.shiny, flash });
    else if (fuse.dad || fuse.mom) showOnStage($("#stage", root), { type: "animal", id: fuse.dad || fuse.mom });
    else showOnStage($("#stage", root), null);
    if (!(fuse.dad && fuse.mom)) { out.innerHTML = `<div class="panel empty"><div class="big">🧬</div><p>${fuse.dad ? "Now pick a mom." : "Start by picking a dad."}</p></div>`; return; }
    if (fuse.dad === fuse.mom) { out.innerHTML = `<div class="panel empty"><div class="big">🙅</div><p>The game needs two different animals.</p></div>`; return; }
    out.innerHTML = fuseResultHTML(single(fuse.dad, fuse.mom, fuse.shiny));
  };
  const drawRecent = () => {
    const list = (store.recent || []).filter(k => k.split("|").every(id => BY_ID[id]));
    $("#fuse-recent", root).innerHTML = list.length ? `<div class="recent"><span class="small muted">Recent:</span>${list.map(k => {
      const [a, b] = k.split("|");
      return `<button type="button" class="chip recent-chip" data-recent="${esc(k)}" title="${esc(name(a))} + ${esc(name(b))}"><img src="${icon(a)}" alt="">+<img src="${icon(b)}" alt=""></button>`;
    }).join("")}</div>` : "";
  };
  const remember = () => {
    if (!(fuse.dad && fuse.mom) || fuse.dad === fuse.mom) return;
    const k = `${fuse.dad}|${fuse.mom}`;
    store.recent = [k, ...(store.recent || []).filter(x => x !== k)].slice(0, 8); save(); drawRecent();
  };
  drawSteps(); drawGrid(); drawResult(); drawRecent();

  root.addEventListener("click", e => {
    const rc = e.target.closest("[data-recent]");
    if (rc) { [fuse.dad, fuse.mom] = rc.dataset.recent.split("|"); fuse.step = "mom"; drawSteps(); drawGrid(); drawResult(true); remember(); return; }
    const hunt = e.target.closest("[data-hunt]");
    if (hunt) {
      const k = `${fuse.dad}|${fuse.mom}`; store.hunt = store.hunt || {};
      store.hunt[k] = hunt.dataset.hunt === "reset" ? 0 : (store.hunt[k] || 0) + 1;
      if (hunt.dataset.hunt === "reset") toast("Congrats on the mutation! 🎉");
      save(); drawResult(); return;
    }
    const st = e.target.closest("[data-step]");
    if (st) { fuse.step = st.dataset.step; drawSteps(); drawGrid(); return; }
    const f = e.target.closest("[data-filter]");
    if (f) { fuse.filter = f.dataset.filter; $$("[data-filter]", root).forEach(b => b.setAttribute("aria-pressed", b === f)); drawGrid(); return; }
    const p = e.target.closest("[data-pick]");
    if (p) {
      fuse[fuse.step] = p.dataset.pick;
      if (fuse.step === "dad" && !fuse.mom) fuse.step = "mom";
      drawSteps(); drawGrid(); drawResult(!!(fuse.dad && fuse.mom)); remember();
      return;
    }
    const sh = e.target.closest("[data-shiny]");
    if (sh) { fuse.shiny = sh.dataset.shiny || null; drawResult(); return; }
    const al = e.target.closest("[data-algo]");
    if (al) { store.algo = al.dataset.algo; save(); drawResult(); return; }
    const act = e.target.closest("[data-act]");
    if (!act) return;
    const r = single(fuse.dad, fuse.mom, fuse.shiny);
    if (act.dataset.act === "save") addToPen({ kind: "single", dad: fuse.dad, mom: fuse.mom, shiny: fuse.shiny });
    if (act.dataset.act === "swap") { [fuse.dad, fuse.mom] = [fuse.mom, fuse.dad]; drawSteps(); drawGrid(); drawResult(); }
    if (act.dataset.act === "to-double") { const slot = +act.dataset.slot; dbl.h[slot] = { dad: fuse.dad, mom: fuse.mom, shiny: fuse.shiny }; dbl.fused = false; location.hash = "#/double"; }
    if (act.dataset.act === "partners") location.hash = `#/partners/${fuse.dad}`;
    if (act.dataset.act === "chat") copy(`${name(fuse.dad)} + ${name(fuse.mom)}${fuse.shiny ? ` (${shinyName(fuse.shiny)})` : ""} = ${r.stars}★ ${E.money(r.income)}`, "Copied for Roblox chat");
  });
  root.addEventListener("input", e => { if (e.target.matches("[data-search]")) { fuse.query = e.target.value; drawGrid(); } });
  root.addEventListener("change", e => { if (e.target.matches("[data-charm]")) { store.charm = +e.target.value; save(); drawResult(); } });
}

function huntHTML(r) {
  const tries = (store.hunt || {})[`${r.dad}|${r.mom}`] || 0;
  const p = E.mutationChance(r.stars - r.mutation);
  const byNow = 1 - (1 - p) ** tries;
  return `<div class="hunt">
    <div><b class="outline" style="font-size:18px">🎯 Mutation hunt</b>
      <div class="small">Tap <b>+1 fuse</b> each time you fuse this pair in-game. Any mutation is about <b>1 in ${Math.round(1 / p).toLocaleString()}</b> per fuse.</div></div>
    <div class="hunt-count"><b>${tries}</b><span>fuses</span></div>
    <div class="hunt-count"><b>${Math.round(byNow * 100)}%</b><span>would have one by now</span></div>
    <div class="row"><button class="btn btn-gold btn-sm" data-hunt="add">+1 fuse</button><button class="btn btn-white btn-sm" data-hunt="reset">Got one! Reset</button></div>
  </div>`;
}

function fuseResultHTML(r) {
  const capNote = r.cap ? `<p class="note">⚠️ ${[r.dad, r.mom].filter(x => G.STARTER_SPECIALS.includes(x)).map(name).join(" & ")} ${r.dad && G.STARTER_SPECIALS.includes(r.dad) && G.STARTER_SPECIALS.includes(r.mom) ? "are" : "is a"} starter special: this fusion's roll is squeezed so it can't go above <b>${r.cap}★</b> before bonuses.</p>` : "";
  const odds = G.SHINY_ORDER.map(s => `<span>${shinyName(s)}: <b>1 in ${Math.round(E.shinyOdds(s, r.stars - r.mutation)).toLocaleString()}</b></span>`).join(" · ");
  return `<div class="panel result">
    <h2 class="result-name outline">${esc(E.hybridName(r.dad, r.mom) || `${name(r.dad)} + ${name(r.mom)}`)}${mutLabel(r.shiny)}</h2>
    ${E.hybridName(r.dad, r.mom) ? `<div class="result-recipe"><img src="${icon(r.dad)}" alt="">${esc(name(r.dad))} <span>+</span> <img src="${icon(r.mom)}" alt="">${esc(name(r.mom))}</div>` : ""}
    <div class="row" style="justify-content:center;margin-top:10px">${shinySeg(r.shiny)}</div>
    <div class="stars-label">${r.stars} STARS</div>
    ${starRow([[r.base, ""], [r.special, "bonus"], [r.mutation, "mutation"]])}
    <div class="legend"><span><i style="background:var(--star)"></i>Roll ${r.base}</span>${r.special ? `<span><i style="background:#ff9a3d"></i>Special +${r.special}</span>` : ""}${r.mutation ? `<span><i style="background:#7fd8ff"></i>${shinyName(r.shiny)} +${r.mutation}</span>` : ""}</div>
    <div class="income-big">${E.money(r.income)}</div>
    <div class="row" style="justify-content:center;margin-top:8px">${charmSelect()}${store.charm ? `<b class="muted">→ ${E.money(withCharm(r.income))} with charm</b>` : ""}</div>
    ${capNote}
    <div class="breakdown">
      <div class="stat"><b>${E.money(r.income * 3600, false)}</b><span>per hour (no charm)</span></div>
      <div class="stat"><b>${E.money(withCharm(r.income) * 86400, false)}</b><span>per day ${store.charm ? "with charm" : ""}</span></div>
      <div class="stat"><b>${Math.round((r.income - G.INCOME_RANGES[r.stars][0]) / Math.max(1, G.INCOME_RANGES[r.stars][1] - G.INCOME_RANGES[r.stars][0]) * 100)}%</b><span>of the ${r.stars}★ income range</span></div>
    </div>
    <p class="small muted" style="margin:12px 0 0">Mutation chance at ${r.stars - r.mutation}★: ${odds}</p>
    ${huntHTML(r)}
    <div class="row" style="justify-content:center;margin-top:14px">
      <button class="btn btn-green btn-sm" data-act="save">🏡 Save to My Pen</button>
      <button class="btn btn-sm" data-act="to-double" data-slot="0">⚡ Double Fuse (slot 1)</button>
      <button class="btn btn-sm btn-purple" data-act="to-double" data-slot="1">⚡ Slot 2</button>
      <button class="btn btn-white btn-sm" data-act="swap">⇄ Swap</button>
      <button class="btn btn-white btn-sm" data-act="partners">💞 ${esc(name(r.dad))}'s best partners</button>
      <button class="btn btn-white btn-sm" data-act="chat">💬 Copy for chat</button>
    </div>
    ${C.hasBody(r.dad) && C.hasBody(r.mom) ? `<details style="margin-top:12px;text-align:left"><summary class="muted small" style="cursor:pointer">Colour style (the game picks one at random when you fuse)</summary>
      <div class="seg" style="margin-top:8px">${C.PALETTE_ALGORITHMS.map(a => `<button type="button" data-algo="${a}" aria-pressed="${store.algo === a}">${ALGO_LABEL[a]}</button>`).join("")}</div></details>` : ""}
  </div>`;
}

// ---------------- Double fusion ----------------
function renderDouble(root) {
  root.innerHTML = `
  <div class="page-head"><div><h1 class="outline">Double Fusion</h1>
    <p>Combine two of your hybrids to make a stronger one. Pick each hybrid's dad and mom; the order matters for income, just like in-game.</p></div></div>
  <div class="grid-3">
    <div class="card hybrid-slot" id="slot-0"></div>
    <div class="stack center">
      ${stageHTML()}
      <div class="row" style="justify-content:center"><button class="btn btn-green btn-big" id="fuse-btn">DOUBLE FUSE</button></div>
      <div id="dbl-result"></div>
    </div>
    <div class="card green hybrid-slot" id="slot-1"></div>
  </div>
  <div class="panel" style="margin-top:18px"><h2>From My Pen</h2><p class="muted small" style="margin-top:-6px">Tap a saved hybrid to drop it into a free slot.</p><div class="hy-list" id="dbl-pen"></div></div>`;

  const drawSlot = i => {
    const h = dbl.h[i], el = $(`#slot-${i}`, root);
    const r = h.dad && h.mom && h.dad !== h.mom ? single(h.dad, h.mom, h.shiny) : null;
    el.innerHTML = `<h3 class="outline">Hybrid ${i + 1}</h3>
      <div class="parent-pick">
        <button type="button" class="parent-btn" data-slot="${i}" data-role="dad"><span class="portrait">${h.dad ? img(h.dad) : ""}</span><span class="outline">${h.dad ? esc(name(h.dad)) : "Pick dad"}</span></button>
        <span class="plus-sign outline">+</span>
        <button type="button" class="parent-btn" data-slot="${i}" data-role="mom"><span class="portrait">${h.mom ? img(h.mom) : ""}</span><span class="outline">${h.mom ? esc(name(h.mom)) : "Pick mom"}</span></button>
      </div>
      <div class="slot-stats">${r ? `<span class="star-n">${r.stars}</span><span class="cash">${E.money(r.income)}</span>` : `<span class="small">${h.dad && h.dad === h.mom ? "Pick two different animals" : "Pick both parents"}</span>`}</div>
      <div style="margin-top:10px;display:flex;justify-content:center">${shinySeg(h.shiny, `data-slot-shiny="${i}" data-shiny`)}</div>`;
  };
  const ready = () => dbl.h.every(h => h.dad && h.mom && h.dad !== h.mom);
  const drawResult = flash => {
    const out = $("#dbl-result", root);
    $("#fuse-btn", root).disabled = !ready();
    if (!ready()) { showOnStage($("#stage", root), null); out.innerHTML = ""; return; }
    if (!dbl.fused) { showOnStage($("#stage", root), null); out.innerHTML = `<p class="muted small" style="text-align:center">Both hybrids ready. Press <b>DOUBLE FUSE</b>!</p>`; return; }
    const r = E.double(dbl.h[0], dbl.h[1]);
    showOnStage($("#stage", root), { type: "double", h1: r.hybrids[0], h2: r.hybrids[1], shiny: r.shiny, flash });
    out.innerHTML = `<div class="panel result">
      <h2 class="result-name outline">Double Hybrid${mutLabel(r.shiny)}</h2>
      <div class="result-recipe">${r.parents.map((p, i) => `${i ? "<span>+</span>" : ""}<img src="${icon(p)}" alt="">${esc(name(p))}`).join(" ")}</div>
      <div class="stars-label">${r.stars} STARS</div>
      ${starRow([[Math.max(...r.parentStars), ""], [r.bonus, "dbl"], [r.special, "bonus"]])}
      <div class="legend"><span><i style="background:var(--star)"></i>Best hybrid ${Math.max(...r.parentStars)}</span><span><i style="background:#b98bff"></i>Double bonus +${r.bonus}</span>${r.special ? `<span><i style="background:#ff9a3d"></i>Special +${r.special}</span>` : ""}</div>
      <div class="income-big">${E.money(r.income)}</div>
      <div class="row" style="justify-content:center;margin-top:8px">${charmSelect()}${store.charm ? `<b class="muted">→ ${E.money(withCharm(r.income))} with charm</b>` : ""}</div>
      <div class="breakdown">
        <div class="stat"><b>${r.parentStars[0]}★ / ${r.parentStars[1]}★</b><span>hybrid stars (roll + mutation, no special)</span></div>
        <div class="stat"><b>${r.roll} → +${r.bonus}</b><span>bonus roll (1–5), capped at ${r.steps} by the weaker hybrid</span></div>
        <div class="stat"><b>+${r.special}</b><span>special bonus (counted once)</span></div>
        <div class="stat"><b>${shinyName(r.shiny)}</b><span>inherits the best mutation</span></div>
      </div>
      <p class="small muted" style="margin:10px 0 0">The cap rises when the weaker hybrid reaches 3, 9, 15, 21 and 29 stars. Treadmill level doesn't affect income (singles or doubles); the new hybrid just keeps the higher level, which matters for The Wild.</p>
      <div class="row" style="justify-content:center;margin-top:14px"><button class="btn btn-green btn-sm" data-act="save-double">🏡 Save to My Pen</button>
      <button class="btn btn-white btn-sm" data-act="chat-double">💬 Copy for chat</button></div>
    </div>`;
  };
  const drawPen = () => {
    const singles = store.pen.filter(p => p.kind === "single");
    $("#dbl-pen", root).innerHTML = singles.length ? singles.map(p => hybridCard(single(p.dad, p.mom, p.shiny), { attrs: `data-load="${p.id}"` })).join("")
      : `<p class="muted">No saved single hybrids yet. Save some from the Fusion Lab or Best Partners.</p>`;
    observeThumbs(root);
  };
  drawSlot(0); drawSlot(1); drawResult(); drawPen();

  root.addEventListener("click", e => {
    const pb = e.target.closest(".parent-btn");
    if (pb) {
      const i = +pb.dataset.slot, role = pb.dataset.role;
      pickAnimalModal(`Pick a ${role} for Hybrid ${i + 1}`, role === "mom", id => { dbl.h[i][role] = id; dbl.fused = false; drawSlot(i); drawResult(); });
      return;
    }
    const sh = e.target.closest("[data-slot-shiny]");
    if (sh) { const i = +sh.dataset.slotShiny; dbl.h[i].shiny = sh.dataset.shiny || null; drawSlot(i); drawResult(); return; }
    if (e.target.closest("#fuse-btn")) { dbl.fused = true; drawResult(true); return; }
    const ld = e.target.closest("[data-load]");
    if (ld) {
      const p = store.pen.find(x => String(x.id) === ld.dataset.load);
      const i = !(dbl.h[0].dad && dbl.h[0].mom) ? 0 : !(dbl.h[1].dad && dbl.h[1].mom) ? 1 : 1;
      dbl.h[i] = { dad: p.dad, mom: p.mom, shiny: p.shiny }; dbl.fused = false; drawSlot(i); drawResult();
      toast(`Loaded into Hybrid ${i + 1}`);
      return;
    }
    const act = e.target.closest("[data-act]");
    if (act && act.dataset.act === "save-double") addToPen({ kind: "double", hybrids: dbl.h.map(h => ({ ...h })) });
    if (act && act.dataset.act === "chat-double") {
      const r = E.double(dbl.h[0], dbl.h[1]);
      copy(`(${name(r.parents[0])}+${name(r.parents[1])}) x (${name(r.parents[2])}+${name(r.parents[3])})${r.shiny ? ` ${shinyName(r.shiny)}` : ""} = ${r.stars}★ ${E.money(r.income)}`, "Copied for Roblox chat");
    }
  });
  root.addEventListener("change", e => { if (e.target.matches("[data-charm]")) { store.charm = +e.target.value; save(); drawResult(); } });
}

// ---------------- Best partners ----------------
const partners = { pet: null, shiny: null, ownedOnly: false, sort: "stars", limit: 30 };
function renderPartners(root, arg) {
  if (arg && BY_ID[arg]) partners.pet = arg;
  root.innerHTML = `
  <div class="page-head"><div><h1 class="outline">Best Partners</h1>
    <p>Pick the animal you have and see every partner ranked by stars and income.</p></div></div>
  <div class="panel" style="margin-bottom:16px">
    <div class="row">
      <button type="button" class="card step" data-act="pick" aria-pressed="true" style="min-width:min(230px,100%)"></button>
      <div class="stack" style="flex:1;min-width:260px;gap:10px">
        ${shinySeg(partners.shiny)}
        <div class="row">
          <label class="row small"><input type="checkbox" data-owned ${partners.ownedOnly ? "checked" : ""}> Only partners I own</label>
          <div class="seg" role="group" aria-label="Sort"><button type="button" data-sort="stars" aria-pressed="${partners.sort === "stars"}">By stars</button><button type="button" data-sort="income" aria-pressed="${partners.sort === "income"}">By $/s</button></div>
          <span class="spacer"></span>
          <button class="btn btn-white btn-sm" data-act="chat">💬 Copy top 3 for chat</button>
        </div>
      </div>
    </div>
  </div>
  <div id="partner-list"></div>`;
  const draw = () => {
    const pick = $("[data-act=pick]", root);
    pick.innerHTML = partners.pet ? `<span class="portrait">${img(partners.pet)}</span><span class="outline">${esc(name(partners.pet))}<small>Tap to change</small></span>`
      : `<span class="portrait"></span><span class="outline">Pick your animal<small>Tap to choose</small></span>`;
    const out = $("#partner-list", root);
    if (!partners.pet) { out.innerHTML = `<div class="panel empty"><div class="big">💞</div><p>Choose an animal to rank its partners.</p></div>`; return; }
    const list = rankPartners();
    const top = list.slice(0, 3), rest = list.slice(3, partners.limit);
    out.innerHTML = `
      <h2 class="bar-title gold outline">🏆 Top 3 for ${esc(name(partners.pet))}</h2>
      <div class="hy-list" style="margin-bottom:18px">${top.map((r, i) => hybridCard(r, { rank: i + 1, color: ["gold", "green", ""][i], attrs: `data-open-fuse="${r.dad}|${r.mom}"`, sub: `${source(r.mom === partners.pet ? r.dad : r.mom).long}` })).join("")}</div>
      <div class="hy-list">${rest.map((r, i) => hybridCard(r, { rank: i + 4, attrs: `data-open-fuse="${r.dad}|${r.mom}"` })).join("")}</div>
      ${list.length > partners.limit ? `<div class="row" style="justify-content:center;margin-top:16px"><button class="btn" data-act="more">Show all ${list.length}</button></div>` : ""}
      ${!list.length ? `<div class="panel empty"><p>No partners match. Try turning off “Only partners I own”.</p></div>` : ""}`;
    observeThumbs(out);
  };
  function rankPartners() {
    const pet = partners.pet;
    const rows = IDS.filter(id => id !== pet && (!partners.ownedOnly || owns(id))).map(id => single(pet, id, partners.shiny));
    rows.sort((a, b) => partners.sort === "income" ? b.income - a.income : b.stars - a.stars || b.income - a.income);
    return rows;
  }
  draw();
  root.addEventListener("click", e => {
    const act = e.target.closest("[data-act]");
    if (act?.dataset.act === "pick") return pickAnimalModal("Pick your animal", false, id => { partners.pet = id; partners.limit = 30; history.replaceState(null, "", `#/partners/${id}`); draw(); });
    if (act?.dataset.act === "more") { partners.limit = 999; draw(); return; }
    if (act?.dataset.act === "chat" && partners.pet) {
      const t = rankPartners().slice(0, 3).map((r, i) => `${i + 1}) ${name(r.dad === partners.pet ? r.mom : r.dad)} ${r.stars}★ ${E.money(r.income)}`).join("  ");
      return copy(`${name(partners.pet)} best: ${t}`, "Copied for Roblox chat");
    }
    const sh = e.target.closest("[data-shiny]");
    if (sh) { partners.shiny = sh.dataset.shiny || null; $$("[data-shiny]", root).forEach(b => b.setAttribute("aria-pressed", b === sh)); draw(); return; }
    const so = e.target.closest("[data-sort]");
    if (so) { partners.sort = so.dataset.sort; $$("[data-sort]", root).forEach(b => b.setAttribute("aria-pressed", b === so)); draw(); return; }
    const of = e.target.closest("[data-open-fuse]");
    if (of) { const [a, b] = of.dataset.openFuse.split("|"); Object.assign(fuse, { dad: a, mom: b, shiny: partners.shiny, step: "mom" }); location.hash = "#/fuse"; }
  });
  root.addEventListener("change", e => { if (e.target.matches("[data-owned]")) { partners.ownedOnly = e.target.checked; draw(); } });
}

// ---------------- Top hybrids ----------------
const top = { mode: "single", shiny: null, ownedOnly: false, limit: 50 };
function renderTop(root) {
  root.innerHTML = `
  <div class="page-head"><div><h1 class="outline">Top Hybrids</h1>
    <p>The highest-star fusions in the game. Every one of the ${allPairs().length.toLocaleString()} gen-1 pairs is checked.</p></div></div>
  <div class="panel row" style="margin-bottom:16px">
    <div class="seg" role="group" aria-label="Type"><button type="button" data-mode="single" aria-pressed="${top.mode === "single"}">Single fusions</button><button type="button" data-mode="double" aria-pressed="${top.mode === "double"}">Double fusions</button></div>
    ${shinySeg(top.shiny)}
    <label class="row small"><input type="checkbox" data-owned ${top.ownedOnly ? "checked" : ""}> Only animals I own</label>
  </div>
  <div id="top-list"></div>`;
  const draw = () => {
    const ok = id => !top.ownedOnly || owns(id);
    let rows;
    if (top.mode === "single") {
      rows = allPairs().filter(([a, b]) => ok(a) && ok(b)).map(([a, b]) => single(a, b, top.shiny));
      rows.sort((a, b) => b.stars - a.stars || b.income - a.income);
    } else {
      const base = allPairs().filter(([a, b]) => ok(a) && ok(b)).map(([a, b]) => single(a, b, top.shiny))
        .sort((a, b) => (b.base + b.mutation) - (a.base + a.mutation) || b.special - a.special).slice(0, 140);
      rows = [];
      for (let i = 0; i < base.length; i++) for (let j = i; j < base.length; j++) {
        const A = base[i], B = base[j];
        rows.push(E.double({ dad: A.dad, mom: A.mom, shiny: top.shiny }, { dad: B.dad, mom: B.mom, shiny: top.shiny }));
      }
      rows.sort((a, b) => b.stars - a.stars || b.income - a.income);
    }
    const shown = rows.slice(0, top.limit);
    $("#top-list", root).innerHTML = `<div class="hy-list">${shown.map((r, i) => hybridCard(r, {
      rank: i + 1, color: i === 0 ? "gold" : i < 3 ? "green" : "",
      attrs: r.kind === "double" ? `data-open-double="${r.hybrids.map(h => h.dad + "|" + h.mom).join("|")}"` : `data-open-fuse="${r.dad}|${r.mom}"`
    })).join("")}</div>
    ${rows.length > top.limit ? `<div class="row" style="justify-content:center;margin-top:16px"><button class="btn" data-act="more">Show more</button></div>` : ""}`;
    observeThumbs(root);
  };
  draw();
  root.addEventListener("click", e => {
    const m = e.target.closest("[data-mode]");
    if (m) { top.mode = m.dataset.mode; top.limit = 50; $$("[data-mode]", root).forEach(b => b.setAttribute("aria-pressed", b === m)); draw(); return; }
    const sh = e.target.closest("[data-shiny]");
    if (sh) { top.shiny = sh.dataset.shiny || null; $$("[data-shiny]", root).forEach(b => b.setAttribute("aria-pressed", b === sh)); draw(); return; }
    if (e.target.closest("[data-act=more]")) { top.limit += 100; draw(); return; }
    const of = e.target.closest("[data-open-fuse]");
    if (of) { const [a, b] = of.dataset.openFuse.split("|"); Object.assign(fuse, { dad: a, mom: b, shiny: top.shiny, step: "mom" }); location.hash = "#/fuse"; return; }
    const od = e.target.closest("[data-open-double]");
    if (od) { const p = od.dataset.openDouble.split("|"); dbl.h = [{ dad: p[0], mom: p[1], shiny: top.shiny }, { dad: p[2], mom: p[3], shiny: top.shiny }]; dbl.fused = true; location.hash = "#/double"; }
  });
  root.addEventListener("change", e => { if (e.target.matches("[data-owned]")) { top.ownedOnly = e.target.checked; draw(); } });
}

// ---------------- Animals index & detail ----------------
const animals = { filter: "all", query: "" };
function renderAnimals(root) {
  root.innerHTML = `
  <div class="page-head"><div><h1 class="outline">Animals</h1>
    <p>All ${CATALOG.length} animals in the game. Open one to spin it in 3D and see its best partners.</p></div></div>
  <div class="filters"><input class="input" type="search" placeholder="Search… (press /)" data-search value="${esc(animals.query)}">${pickerFilters(animals.filter)}</div>
  <div class="animal-grid" id="animal-grid"></div>`;
  const draw = () => {
    const q = animals.query.trim().toLowerCase();
    const list = CATALOG.filter(c => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      const f = animals.filter;
      return f === "all" || (f === "starters" && STARTER_SET.has(c.id)) || (f === "wild" && BIOME_OF[c.id]) ||
        (f === "special" && G.SPECIAL_BONUS[c.id]) || (f === "owned" && owns(c.id)) || (f === "soon" && !isOut(c.id));
    });
    $("#animal-grid", root).innerHTML = list.map(c => {
      const src = source(c.id), bonus = G.SPECIAL_BONUS[c.id], soon = !isOut(c.id);
      const color = bonus ? "gold" : STARTER_SET.has(c.id) ? "green" : BIOME_OF[c.id] ? "" : "purple";
      return `<a class="card ${color} animal-card" href="#/animal/${encodeURIComponent(c.id)}">
        <span class="portrait">${img(c.id, c.name)}</span>
        <span class="tile-name outline">${esc(c.name)}</span>
        <span class="badges">${bonus ? `<span class="badge star">+${bonus}★</span>` : ""}<span class="badge">${src.short}</span>${G.STARTER_SPECIALS.includes(c.id) ? `<span class="badge">Capped</span>` : ""}${soon ? `<span class="badge soon">In ${countdown(releaseAt(c.id))}</span>` : ""}</span>
      </a>`;
    }).join("") || `<p class="empty">Nothing matches.</p>`;
  };
  draw();
  root.addEventListener("input", e => { if (e.target.matches("[data-search]")) { animals.query = e.target.value; draw(); } });
  root.addEventListener("click", e => {
    const f = e.target.closest("[data-filter]");
    if (f) { animals.filter = f.dataset.filter; $$("[data-filter]", root).forEach(b => b.setAttribute("aria-pressed", b === f)); draw(); }
  });
}

function renderAnimal(root, id) {
  if (!BY_ID[id]) { root.innerHTML = `<div class="panel empty"><div class="big">🔍</div><p>Unknown animal.</p><a class="btn" href="#/animals">All animals</a></div>`; return; }
  const c = BY_ID[id], src = source(id), bonus = G.SPECIAL_BONUS[id] || 0, rel = releaseAt(id);
  const rows = IDS.filter(x => x !== id).map(x => single(id, x));
  rows.sort((a, b) => b.stars - a.stars || b.income - a.income);
  const hist = {};
  rows.forEach(r => { hist[r.base] = (hist[r.base] || 0) + 1; });
  const maxH = Math.max(...Object.values(hist));
  const cap = G.STARTER_SPECIALS.includes(id) ? null : E.starterCap(id, "glitch");
  root.innerHTML = `
  <div class="page-head"><div><a href="#/animals" class="small">← All animals</a><h1 class="outline">${esc(c.name)}</h1>
    <p>${esc(src.long)}${rel ? ` · ${isOut(id) ? "released" : "arrives"} ${fmtDate(rel)}` : ""}</p></div>
    <div class="row"><button class="btn" data-act="fuse">🧬 Fuse with ${esc(c.name)}</button><a class="btn btn-gold" href="#/partners/${encodeURIComponent(id)}">💞 Best partners</a></div></div>
  <div class="detail">
    <div class="stack">${stageHTML()}</div>
    <div class="stack">
      <div class="facts">
        <div class="stat"><b>${bonus ? `+${bonus}★` : "None"}</b><span>special bonus stars on every fusion</span></div>
        <div class="stat"><b>${rows[0].stars}★</b><span>best single fusion (${esc(name(rows[0].dad === id ? rows[0].mom : rows[0].dad))})</span></div>
        <div class="stat"><b>${src.short}</b><span>${esc(src.long)}</span></div>
        <div class="stat"><b>${C.hasBody(id) ? (C.baseAnimal(id).limbs.length) : "Special"}</b><span>${C.hasBody(id) ? "body parts (before mirroring)" : "animated special body"}</span></div>
        ${G.STARTER_SPECIALS.includes(id) ? `<div class="stat"><b>Capped</b><span>starter special: partners' rolls are squeezed under their best starter result</span></div>` : cap ? `<div class="stat"><b>${cap}★</b><span>cap when fused with a starter special (Glitch, Ninja…)</span></div>` : ""}
      </div>
      <div class="panel"><h3>Star roll with every partner</h3>
        <div class="hist">${Array.from({ length: 18 }, (_, i) => i + 3).map(s => `<div style="height:${((hist[s] || 0) / maxH) * 100}%" title="${s}★: ${hist[s] || 0} partners"></div>`).join("")}</div>
        <div class="hist-x">${Array.from({ length: 18 }, (_, i) => `<span>${i + 3}</span>`).join("")}</div>
        <p class="small muted" style="margin:6px 0 0">Base stars before bonuses, across all ${rows.length} partners.</p>
      </div>
      ${src.biome ? `<div class="card" style="--c:${src.biome.color};--cd:rgba(0,0,0,.35);padding:12px"><b class="outline" style="font-size:18px">${src.biome.icon} ${esc(src.biome.name)}</b><div class="small">Tier ${src.biome.tier} · ${src.biome.difficulty} ${src.biome.emoji} · recommended Lv. ${E.shortNum(src.biome.recommended)} · shares the reward slot with ${src.biome.rewards.filter(x => x !== id).map(name).join(", ")}</div></div>` : ""}
    </div>
  </div>
  <h2 class="bar-title gold outline" style="margin-top:22px">Best partners</h2>
  <div class="hy-list">${rows.slice(0, 12).map((r, i) => hybridCard(r, { rank: i + 1, color: i === 0 ? "gold" : "", attrs: `data-open-fuse="${r.dad}|${r.mom}"` })).join("")}</div>`;
  showOnStage($("#stage", root), { type: "animal", id });
  observeThumbs(root);
  root.addEventListener("click", e => {
    if (e.target.closest("[data-act=fuse]")) { Object.assign(fuse, { dad: id, mom: null, step: "mom" }); location.hash = "#/fuse"; return; }
    const of = e.target.closest("[data-open-fuse]");
    if (of) { const [a, b] = of.dataset.openFuse.split("|"); Object.assign(fuse, { dad: a, mom: b, shiny: null, step: "mom" }); location.hash = "#/fuse"; }
  });
}

// ---------------- The Wild ----------------
function renderWild(root) {
  const cycle = Math.floor(Date.now() / 1000 / G.WILD_RESET_SECONDS);
  root.innerHTML = `
  <div class="page-head"><div><h1 class="outline">The Wild</h1>
    <p>14 biomes, each guarding new animals. Every 5 minutes the game picks one animal from each biome's list as that biome's reward (animals you don't own yet are picked first).</p></div>
    <div class="panel small" style="padding:10px 14px">Next reward reset in <b class="countdown" id="wild-reset">…</b></div></div>
  <div class="biomes">${G.BIOMES.map(b => `
    <div class="card biome" style="--bc:${b.color}">
      <div class="biome-top"><span class="biome-icon" aria-hidden="true">${b.icon}</span><h3 class="outline">${esc(b.name)}</h3><span class="tier">T${b.tier}</span></div>
      <div class="biome-body">
        <div class="row"><span><b>${b.emoji} ${b.difficulty}</b></span><span class="muted small">Recommended Lv. <b>${E.shortNum(b.recommended)}</b></span></div>
        <div class="row small muted" style="margin-top:4px"><span>Fusion token drop: <b>${Math.round(b.tokenChance * 1000) / 10}%</b></span></div>
        <div class="rewards">${b.rewards.map(id => `<a href="#/animal/${encodeURIComponent(id)}" title="${esc(name(id))}"><span class="portrait">${img(id)}</span>${esc(name(id))}${!isOut(id) ? `<br><span class="badge soon" style="color:var(--red-dark)">${countdown(releaseAt(id))}</span>` : ""}</a>`).join("")}</div>
      </div>
    </div>`).join("")}</div>`;
  const tick = () => {
    const el = $("#wild-reset", root); if (!el) return clearInterval(timer);
    const left = G.WILD_RESET_SECONDS - Math.floor(Date.now() / 1000) % G.WILD_RESET_SECONDS;
    el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  };
  const timer = setInterval(tick, 1000); tick();
  void cycle;
}

// ---------------- Guide ----------------
function renderGuide(root) {
  const totalW = G.WEIGHTS.reduce((a, b) => a + b, 0);
  let calcStars = 10, friends = 1;
  root.innerHTML = `
  <div class="page-head"><div><h1 class="outline">Guide</h1><p>How stars, income, mutations and charms work, taken straight from the game's code.</p></div></div>
  <div class="grid-2">
    <div class="stack">
      <div class="panel"><h2>⭐ Star rolls &amp; income</h2>
        <p class="small muted" style="margin-top:-4px">Every pair always rolls the same stars: the game hashes the two animal names. Then it adds the best special bonus and the mutation bonus. Income is a fixed number inside the star tier's range.</p>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Stars</th><th>Roll chance</th><th>Income range</th></tr></thead><tbody>
        ${Object.entries(G.INCOME_RANGES).map(([s, [lo, hi]]) => `<tr><td><span class="star-n" style="color:var(--ink);font-size:16px">${s}</span></td><td>${+s <= 20 ? (G.WEIGHTS[s - 3] / totalW * 100).toFixed(s >= 17 ? 3 : 2) + "%" : "<span class='muted'>bonus only</span>"}</td><td>${E.money(lo)} – ${E.money(hi)}</td></tr>`).join("")}
        </tbody></table></div>
      </div>
    </div>
    <div class="stack">
      <div class="panel"><h2>✨ Mutations</h2>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Mutation</th><th>Bonus</th><th>Odds at 3★</th><th>at 20★</th><th>Colours</th></tr></thead><tbody>
        ${G.SHINY_ORDER.map(s => `<tr><td class="mut mut-${s}" style="${s === "golden" ? "color:#b57600" : s === "diamond" ? "color:#1580c4" : s === "chaos" ? "color:#c4122f" : ""}">${shinyName(s)}</td><td>+${G.SHINIES[s].bonus}★</td><td>1 in ${Math.round(E.shinyOdds(s, 3))}</td><td>1 in ${Math.round(E.shinyOdds(s, 20)).toLocaleString()}</td><td><span class="swatch">${G.SHINIES[s].colors.map(c => `<i style="background:${c}"></i>`).join("")}</span></td></tr>`).join("")}
        </tbody></table></div>
        <p class="small muted">Your <b>${G.FIRST_GOLD_FUSION}rd fusion is always Golden</b>. Higher-star fusions are rarer to mutate. Fusing with friends nearby boosts the odds, up to ${G.FRIEND_MULTIPLIER}×.</p>
        <div class="row"><label class="small">Fusion stars <input class="input" type="number" min="3" max="20" value="${calcStars}" data-calc-stars style="width:90px"></label>
          <label class="small">Friend boost <select class="input" data-calc-friends style="width:110px">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">×${i + 1}</option>`).join("")}</select></label></div>
        <div id="odds-out" class="breakdown"></div>
      </div>
      <div class="panel"><h2>🔮 Charms</h2><p class="small muted" style="margin-top:-4px">A charm multiplies a hybrid's income. It isn't shown in the $/s on the hybrid card. Double fusions keep the better charm.</p>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Charm</th><th>Income</th><th>Cash</th><th>Robux</th></tr></thead><tbody>
        ${G.CHARMS.map(c => `<tr><td><span class="pill" style="background:${c.color};color:#1d2530">${c.name}</span></td><td><b>×${c.multiplier}</b></td><td>${E.money(c.cash, false)}</td><td>${c.robux ? c.robux + " R$" : "—"}</td></tr>`).join("")}
        </tbody></table></div>
      </div>
      <div class="panel"><h2>⚡ Double fusion rules</h2>
        <ol class="small" style="padding-left:18px;margin:0;line-height:1.6">
          <li>Each hybrid's stars = its roll + its mutation (special bonus is left out here).</li>
          <li>Start from the stronger hybrid's stars.</li>
          <li>Add a bonus roll of 1–5, capped by the weaker hybrid: +1 cap at 3★, then 9★, 15★, 21★ and 29★.</li>
          <li>Add the best special bonus among all four animals, once.</li>
          <li>The result inherits the best mutation and the higher level. Income uses all four parents in dad/mom order.</li>
        </ol></div>
      <div class="panel"><h2>🧩 Starter specials</h2><p class="small" style="margin:0">${G.STARTER_SPECIALS.map(name).join(", ")} are free starters, but their fusions are capped. Fused with each other they top out at 10★. With any other animal, the roll is squeezed under that animal's best result with the 26 classic starters.</p></div>
      <div class="panel" id="levels"><h2>🏃 Levels &amp; the Treadmill</h2>
        <p class="small" style="margin-top:-4px">A hybrid's <b>Lv.</b> is its training level, counted 1 to 1: <b>Lv. 2.22M</b> means 2,220,000 levels, up to a cap of 500M. Put a hybrid on the treadmill and it earns EXP; every <b>100 EXP = 1 level</b>.</p>
        <p class="small"><b>Level does not change $/s.</b> The game's income code only uses the two parents and the mutation, for singles and doubles alike. Level is your hybrid's <b>power in The Wild</b>, compared against each biome's recommended level. When you double fuse, the new hybrid keeps the higher of the two levels.</p>
        <p class="small muted">EXP per second = treadmill rate × (speed boost + charm multiplier − 1). Each speed boost tier doubles it (×2, ×4 … ×4096 at tier 12), and the hybrid's charm stacks on top.</p>
        <div class="row">
          <label class="small">Treadmill level <select class="input" data-tm="level" style="width:110px">${E.TREADMILL_RATES.map((r, i) => `<option value="${i + 1}">${i + 1} (${r}/s)</option>`).join("")}</select></label>
          <label class="small">Speed boost <select class="input" data-tm="tier" style="width:110px">${Array.from({ length: 13 }, (_, i) => `<option value="${i}">${i ? `Tier ${i} (×${2 ** i})` : "None"}</option>`).join("")}</select></label>
          <label class="small">Charm <select class="input" data-tm="charm" style="width:150px"><option value="0">None</option>${G.CHARMS.map(c => `<option value="${c.tier}">${c.name} (×${c.multiplier})</option>`).join("")}</select></label>
          <label class="small">Goal level <input class="input" type="number" min="1" value="100000" data-tm="goal" style="width:120px"></label>
        </div>
        <div id="tm-out" class="breakdown"></div>
        <div class="table-wrap" style="margin-top:12px"><table class="tbl"><thead><tr><th>Treadmill</th><th>EXP/s</th><th>Upgrade price</th></tr></thead><tbody>
          ${E.TREADMILL_RATES.map((r, i) => `<tr><td>Level ${i + 1}</td><td>${r}</td><td>${i ? E.money(E.TREADMILL_PRICES[i], false) : "Free"}</td></tr>`).join("")}</tbody></table></div>
      </div>
      <div class="panel"><h2>🏡 Pen upgrades</h2><div class="table-wrap"><table class="tbl"><thead><tr><th>Pen level</th><th>Slots</th><th>Price</th></tr></thead><tbody>
        ${Object.entries(G.PEN_PRICES).map(([lv, p]) => `<tr><td>${lv}</td><td>${4 + +lv - 1}</td><td>${E.money(p, false)}</td></tr>`).join("")}</tbody></table></div></div>
    </div>
  </div>`;
  const drawOdds = () => {
    $("#odds-out", root).innerHTML = G.SHINY_ORDER.map(s => `<div class="stat"><b>1 in ${Math.round(E.shinyOdds(s, calcStars, friends)).toLocaleString()}</b><span>${shinyName(s)}</span></div>`).join("");
  };
  drawOdds();
  const tm = { level: 1, tier: 0, charm: 0, goal: 100000 };
  const dur = s => !isFinite(s) ? "—" : s < 60 ? `${Math.ceil(s)}s` : s < 3600 ? `${Math.round(s / 60)}m` : s < 86400 ? `${(s / 3600).toFixed(1)}h` : `${(s / 86400).toFixed(1)} days`;
  const drawTm = () => {
    const lps = E.trainingLevelsPerSecond(tm.level, tm.tier, tm.charm);
    $("#tm-out", root).innerHTML = `
      <div class="stat"><b>${E.shortNum(lps * 100)}</b><span>EXP per second</span></div>
      <div class="stat"><b>${E.shortNum(lps * 3600)}</b><span>levels per hour</span></div>
      <div class="stat"><b>${dur(Math.max(0, tm.goal - 1) / lps)}</b><span>from Lv. 1 to Lv. ${E.shortNum(tm.goal)}</span></div>`;
  };
  drawTm();
  root.addEventListener("input", e => {
    const t = e.target.closest("[data-tm]");
    if (t) { tm[t.dataset.tm] = Math.max(t.dataset.tm === "goal" ? 1 : 0, Math.min(G.MAX_LEVEL, +t.value || 0)); drawTm(); }
  });
  root.addEventListener("input", e => {
    if (e.target.matches("[data-calc-stars]")) { calcStars = Math.max(3, Math.min(20, +e.target.value || 3)); drawOdds(); }
    if (e.target.matches("[data-calc-friends]")) { friends = +e.target.value; drawOdds(); }
  });
}

// ---------------- My Pen ----------------
function addToPen(entry) {
  entry.id = Date.now() + Math.floor(Math.random() * 1000);
  store.pen.unshift(entry); save();
  toast("Saved to My Pen 🏡");
}
function penResult(p) {
  return p.kind === "double" ? E.double(p.hybrids[0], p.hybrids[1]) : single(p.dad, p.mom, p.shiny);
}
function renderPen(root) {
  root.innerHTML = `
  <div class="page-head"><div><h1 class="outline">My Pen</h1><p>Your saved hybrids and the animals you own. Everything is stored in this browser only.</p></div>
    <div class="row"><button class="btn btn-white btn-sm" data-act="export">⬇ Export</button><button class="btn btn-white btn-sm" data-act="import">⬆ Import</button></div></div>
  <h2 class="bar-title outline">Saved hybrids</h2>
  <div id="pen-list"></div>
  <h2 class="bar-title blue outline" style="margin-top:24px">My animals</h2>
  <div class="panel"><div class="row" style="margin-bottom:12px"><span class="muted small" id="own-count"></span><span class="spacer"></span>
    <button class="btn btn-white btn-sm" data-act="own-all">Own all</button><button class="btn btn-white btn-sm" data-act="own-starters">Starters only</button><button class="btn btn-white btn-sm" data-act="own-none">Clear</button></div>
    <p class="small muted" style="margin-top:0">Tap an animal to mark it owned. Gold = owned. Used by the “only animals I own” filters.</p>
    <div class="tile-grid" id="own-grid"></div></div>`;
  const drawPen = () => {
    const total = store.pen.reduce((s, p) => s + penResult(p).income, 0);
    $("#pen-list", root).innerHTML = store.pen.length ? `<p class="muted">${store.pen.length} hybrids · ${E.money(total)} combined (before charms)</p><div class="hy-list">${store.pen.map(p => {
      const r = penResult(p);
      return `<div style="position:relative">${hybridCard(r, { color: p.kind === "double" ? "green" : "", attrs: `data-open="${p.id}"`, sub: p.kind === "double" ? "Double hybrid" : "Single hybrid" })}
        <button class="x-btn" data-remove="${p.id}" aria-label="Remove" style="position:absolute;top:-8px;right:-8px;width:32px;height:32px;font-size:15px">✕</button></div>`;
    }).join("")}</div>` : `<div class="panel empty"><div class="big">🏡</div><p>No saved hybrids yet. Use “Save to My Pen” in the Fusion Lab.</p><a class="btn" href="#/fuse">Go to Fusion Lab</a></div>`;
    observeThumbs(root);
  };
  const drawOwned = () => {
    $("#own-grid", root).innerHTML = CATALOG.map(c => `<div class="tile-wrap"><button type="button" class="tile" data-own="${c.id}" aria-pressed="${owns(c.id)}" title="${esc(c.name)}">${img(c.id, c.name)}</button><span class="tile-label">${esc(c.name)}</span></div>`).join("");
    $("#own-count", root).textContent = `${CATALOG.filter(c => owns(c.id)).length} / ${CATALOG.length} owned`;
  };
  drawPen(); drawOwned();
  root.addEventListener("click", e => {
    const rm = e.target.closest("[data-remove]");
    if (rm) { store.pen = store.pen.filter(p => String(p.id) !== rm.dataset.remove); save(); drawPen(); return; }
    const op = e.target.closest("[data-open]");
    if (op) {
      const p = store.pen.find(x => String(x.id) === op.dataset.open);
      if (p.kind === "double") { dbl.h = p.hybrids.map(h => ({ ...h })); dbl.fused = true; location.hash = "#/double"; }
      else { Object.assign(fuse, { dad: p.dad, mom: p.mom, shiny: p.shiny, step: "mom" }); location.hash = "#/fuse"; }
      return;
    }
    const ow = e.target.closest("[data-own]");
    if (ow) {
      const id = ow.dataset.own, set = new Set(store.owned || IDS);
      set.has(id) ? set.delete(id) : set.add(id);
      store.owned = set.size === IDS.length ? null : [...set]; save(); drawOwned(); return;
    }
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "own-all") { store.owned = null; save(); drawOwned(); }
    if (act === "own-starters") { store.owned = [...G.STARTERS]; save(); drawOwned(); }
    if (act === "own-none") { store.owned = []; save(); drawOwned(); }
    if (act === "export") copy(JSON.stringify({ pen: store.pen, owned: store.owned }), "Pen data copied to clipboard");
    if (act === "import") openModal("Import pen data", `<p class="small muted">Paste data you exported earlier.</p><textarea class="input" rows="6" data-import></textarea><div class="row" style="margin-top:10px"><button class="btn btn-green" data-do-import>Import</button></div>`, body => {
      $("[data-do-import]", body).addEventListener("click", () => {
        try {
          const d = JSON.parse($("[data-import]", body).value);
          if (Array.isArray(d.pen)) store.pen = d.pen.filter(p => p && (p.kind === "double" ? Array.isArray(p.hybrids) : BY_ID[p.dad] && BY_ID[p.mom]));
          if (d.owned === null || Array.isArray(d.owned)) store.owned = d.owned && d.owned.filter(id => BY_ID[id]);
          save(); closeModal(); render(); toast("Imported!");
        } catch { toast("That doesn't look like exported data"); }
      });
    });
  });
}

// ---------------- Feedback & help ----------------
function openFeedback() {
  openModal("Send feedback", `<form class="stack" data-feedback>
    <p class="small muted" style="margin:0">Goes straight to the wiki's Discord. Found a wrong number or a new animal? Tell us!</p>
    <label class="small">Roblox username (optional)<input class="input" name="username" maxlength="30" autocomplete="off"></label>
    <label class="small">Type<select class="input" name="category"><option value="feedback">💡 Suggestion</option><option value="bug">🐛 Bug / wrong number</option><option value="discovery">✨ Discovery</option><option value="trade">🤝 Trade / breeding</option><option value="general">💬 Question</option></select></label>
    <label class="small">Message<textarea class="input" name="message" rows="4" maxlength="500" required></textarea></label>
    <div class="row"><button class="btn btn-green" type="submit">Send</button></div>
  </form>`, body => {
    $("[data-feedback]", body).addEventListener("submit", async e => {
      e.preventDefault();
      const f = new FormData(e.target), btn = $("button[type=submit]", body);
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        const res = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(f)) });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || "Couldn't send");
        closeModal(); toast("Thanks! Feedback sent 💌");
      } catch (err) { btn.disabled = false; btn.textContent = "Send"; toast(err.message || "Couldn't send"); }
    });
  });
}
function openHelp() {
  openModal("Keyboard shortcuts", `<div class="table-wrap"><table class="tbl"><tbody>
    <tr><td><kbd>1</kbd> – <kbd>8</kbd></td><td>Switch section</td></tr>
    <tr><td><kbd>/</kbd></td><td>Search animals</td></tr>
    <tr><td><kbd>?</kbd></td><td>This help</td></tr>
    <tr><td><kbd>Esc</kbd></td><td>Close pop-ups</td></tr></tbody></table></div>`);
}
const DONATE_URL = "https://www.roblox.com/search/users?keyword=TatayDigs";
function openDonate() {
  openModal("Support the wiki 💛", `<div class="stack" style="text-align:center">
    <div style="font-size:54px">💛</div>
    <p style="margin:0">This wiki is free and kept up to date by <b>@TatayDigs</b> every time Impossible Animals updates.</p>
    <p class="muted small" style="margin:0">If it saved you some Robux or a lot of fusing, you can say thanks with a Robux donation to <b>@TatayDigs</b> on Roblox, e.g. through a donation game like PLS DONATE.</p>
    <div class="row" style="justify-content:center"><a class="btn btn-gold" href="${DONATE_URL}" target="_blank" rel="noopener">Find @TatayDigs on Roblox</a>
    <button class="btn btn-white" data-copy-name>Copy username</button></div>
  </div>`, body => $("[data-copy-name]", body).addEventListener("click", () => copy("TatayDigs", "Username copied")));
}
document.addEventListener("click", e => {
  const o = e.target.closest("[data-open]");
  if (o && o.dataset.open === "feedback") openFeedback();
  if (o && o.dataset.open === "help") openHelp();
  if (o && o.dataset.open === "donate") openDonate();
});

// ============================================================
// Router
// ============================================================
const PAGES = { fuse: renderFuse, double: renderDouble, partners: renderPartners, top: renderTop, animals: renderAnimals, animal: renderAnimal, wild: renderWild, guide: renderGuide, pen: renderPen };
const TAB_ORDER = ["fuse", "double", "partners", "top", "animals", "wild", "guide", "pen"];
const TITLES = { fuse: "Fusion Lab", double: "Double Fusion", partners: "Best Partners", top: "Top Hybrids", animals: "Animals", animal: "Animal", wild: "The Wild", guide: "Guide", pen: "My Pen" };
function render() {
  const [, page = "fuse", arg] = (location.hash.match(/^#\/([^/]+)(?:\/(.+))?/) || []);
  const key = PAGES[page] ? page : "fuse";
  destroyViewer();
  const old = $("#main"), fresh = old.cloneNode(false); // drop old listeners
  old.replaceWith(fresh);
  PAGES[key](fresh, arg && decodeURIComponent(arg));
  const tab = key === "animal" ? "animals" : key;
  $$("#tabs a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
  $("#tabs a.active")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  document.title = `${key === "animal" && BY_ID[arg] ? name(arg) : TITLES[key]} · Impossible Animals Wiki`;
  window.scrollTo({ top: 0, behavior: "instant" });
}
addEventListener("hashchange", render);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("#modal").hidden) return closeModal();
  if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "/") { const s = $("[data-search]") || $("[data-q]"); if (s) { e.preventDefault(); s.focus(); } }
  else if (e.key === "?") openHelp();
  else if (/^[1-8]$/.test(e.key)) location.hash = `#/${TAB_ORDER[+e.key - 1]}`;
});
save();
render();
C.loadShapes();
