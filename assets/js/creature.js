// 3D creatures — a port of the game's CreatureMath (rig), FusionGenerator (merge), Palette and ShinyAppearance.
// Every body part is a coloured box; fusions are built by merging the two parents' limb trees.
import * as THREE from "three";

let SHAPES = null, RULES = null;
export async function loadShapes() {
  if (SHAPES) return SHAPES;
  const [s, r] = await Promise.all([fetch("assets/data/shapes.json").then(x => x.json()), fetch("assets/data/rules.json").then(x => x.json())]);
  SHAPES = s; RULES = r;
  return SHAPES;
}
export const shapesLoaded = () => !!SHAPES;
export const hasBody = id => SHAPES && SHAPES[id] && !SHAPES[id].special;

// ---------------- math helpers (CreatureMath) ----------------
const clone = o => JSON.parse(JSON.stringify(o));
const V = a => new THREE.Vector3(a[0], a[1], a[2]);
const A = v => [v.x, v.y, v.z];
const R = rot => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2], "XYZ"));
const euler = m => { const e = new THREE.Euler().setFromRotationMatrix(m, "XYZ"); return [e.x, e.y, e.z]; };
const IDENT = () => new THREE.Matrix4();
const mul = (a, b) => a.clone().multiply(b);
const inv = m => m.clone().invert();
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const col = (m, i) => { const e = m.elements; return new THREE.Vector3(e[i * 4], e[i * 4 + 1], e[i * 4 + 2]); };
function lerpRot(a, b, t) {
  const qa = new THREE.Quaternion().setFromRotationMatrix(a), qb = new THREE.Quaternion().setFromRotationMatrix(b);
  return new THREE.Matrix4().makeRotationFromQuaternion(qa.slerp(qb, t));
}
const rotEq = (a, b) => a.elements.every((v, i) => Math.abs(v - b.elements[i]) < 1e-12);

function face(v) {
  v = v || [0, 0, 1];
  let i = Math.abs(v[0]) < Math.abs(v[1]) ? 1 : 0;
  i = Math.abs(v[i]) < Math.abs(v[2]) ? 2 : i;
  const f = [0, 0, 0]; f[i] = v[i] < 0 ? -1 : 1;
  return f;
}
const faceAxis = v => face(v).findIndex(x => x !== 0);
function anchor(pa, fv) {
  const f = face(fv || pa), out = [];
  for (let i = 0; i < 3; i++) out[i] = f[i] !== 0 ? f[i] : clamp((pa || f)[i], -1, 1);
  return out;
}
const token = v => { const f = face(v), i = faceAxis(v); return "xyz"[i] + (f[i] > 0 ? "+" : "-"); };
function between(a, b) {
  a = a.clone().normalize(); b = b.clone().normalize();
  const d = clamp(a.dot(b), -1, 1);
  if (d > 0.99999999) return IDENT();
  let ax = new THREE.Vector3().crossVectors(a, b);
  if (ax.length() < 1e-7) {
    ax = new THREE.Vector3().crossVectors(a, new THREE.Vector3(1, 0, 0));
    if (ax.length() < 1e-7) ax = new THREE.Vector3().crossVectors(a, new THREE.Vector3(0, 1, 0));
  }
  return new THREE.Matrix4().makeRotationAxis(ax.normalize(), Math.acos(d));
}
const faceRotation = v => between(new THREE.Vector3(0, 0, 1), V(face(v)));
function index(animal) {
  const byKey = {}, kids = {};
  for (const l of animal.limbs) byKey[l.key || l.type] = l;
  for (const l of animal.limbs) if (l.parent) (kids[l.parent] ||= []).push(l);
  return [byKey, kids];
}

function expand(animal, traits = {}) {
  const [byKey, kids] = index(animal);
  const out = [];
  const fixed = traits.fixedColors || {}, forced = traits.forcedPalettes || {};
  const visit = (l, parentKey, mirrors, reflected) => {
    const src = l.key || l.type;
    const n = clone(l);
    n.source = src; n.role = l.type;
    n.key = src + (mirrors.length ? "::mirror:" + mirrors.join("|") : "");
    n.parent = parentKey; n.reflected = reflected;
    n.color = fixed[src] || animal.palette[forced[src] || l.palette] || "#b8845a";
    n.parentAnchor = l.parent ? anchor(l.parentAnchor, l.extrusionFace || l.parentFace) : null;
    if (l.autoOrient && l.parent) n.rotation = euler(faceRotation(l.extrusionFace || l.parentFace || l.parentAnchor));
    out.push(n);
    for (const c of kids[src] || []) {
      visit(c, n.key, mirrors, false);
      if (c.symmetrical) visit(c, n.key, [...mirrors, c.key || c.type], true);
    }
  };
  if (byKey.torso) visit(byKey.torso, null, [], false);
  return out;
}

const MIRROR = new THREE.Matrix4().makeScale(-1, 1, 1);
const reflect = m => MIRROR.clone().multiply(m).multiply(MIRROR);

/** Lay out every limb as a box: returns [{matrix (centre+rotation), size, color, limb}] */
export function rig(animal, traits = RULES && RULES.traits) {
  const nodes = {}, order = [];
  for (const l of expand(animal, traits || {})) {
    const parent = l.parent ? nodes[l.parent] : null;
    const size = V(l.scale);
    const parity = (parent ? parent.parity : 1) * (l.reflected ? -1 : 1);
    const offset = parent
      ? new THREE.Vector3(l.parentAnchor[0] * parent.size.x * parity / 2, l.parentAnchor[1] * parent.size.y / 2,
        l.parentAnchor[2] * parent.size.z / 2 + (parent.parent ? parent.size.z / 2 : 0))
      : new THREE.Vector3();
    let rest = R(l.rotation || [0, 0, 0]);
    if (parity !== 1) rest = reflect(rest);
    const frame = (parent ? parent.frame.clone() : IDENT()).multiply(new THREE.Matrix4().makeTranslation(offset.x, offset.y, offset.z)).multiply(rest);
    const mesh = frame.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, parent ? size.z / 2 : 0));
    const node = { limb: l, size, parity, frame, mesh, parent };
    nodes[l.key] = node; order.push(node);
  }
  return order;
}
function bounds(animal) {
  const min = new THREE.Vector3(Infinity, Infinity, Infinity), max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  for (const n of rig(animal, RULES.traits)) {
    const e = n.mesh.elements, h = n.size.clone().multiplyScalar(0.5), p = new THREE.Vector3(e[12], e[13], e[14]);
    const ext = new THREE.Vector3(
      Math.abs(e[0]) * h.x + Math.abs(e[4]) * h.y + Math.abs(e[8]) * h.z,
      Math.abs(e[1]) * h.x + Math.abs(e[5]) * h.y + Math.abs(e[9]) * h.z,
      Math.abs(e[2]) * h.x + Math.abs(e[6]) * h.y + Math.abs(e[10]) * h.z);
    min.min(p.clone().sub(ext)); max.max(p.clone().add(ext));
  }
  return [min, max];
}

// ---------------- Palette ----------------
const PALETTE_KEYS = ["color1", "color2", "color3", "color4", "eyecolor"];
export const PALETTE_ALGORITHMS = ["light-dark", "vivid-light-dark", "closest-pairing", "vivid-closest-pairing", "dominant-traits", "vivid-dominant-traits"];
const rgb = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const hex = (r, g, b) => "#" + [r, g, b].map(x => Math.floor(clamp(x, 0, 1) * 255 + 0.5).toString(16).padStart(2, "0")).join("");
function mix(a, b, t) {
  const out = [];
  for (let i = 1; i < 7; i += 2) { const x = parseInt(a.substr(i, 2), 16), y = parseInt(b.substr(i, 2), 16); out.push(Math.floor(x + (y - x) * t + 0.5)); }
  return "#" + out.map(v => v.toString(16).padStart(2, "0")).join("");
}
const dist = (a, b) => { const x = rgb(a), y = rgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
function hsl(h) {
  const [r, g, b] = rgb(h), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  if (d === 0) return [0, 0, l];
  const hh = ((mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) / 6 + 1) % 1;
  return [hh, d / (1 - Math.abs(l * 2 - 1)), l];
}
const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = h => { const [r, g, b] = rgb(h); return lin(r) * 0.2126 + lin(g) * 0.7152 + lin(b) * 0.0722; };
function vivid(h) {
  const [hh, s, l] = hsl(h);
  const s2 = s < 0.02 ? 0 : Math.max(s, Math.min(0.92, s * 1.2 + 0.06));
  const l2 = l + (1 - l) * 0.12, c = (1 - Math.abs(2 * l2 - 1)) * s2, hp = hh * 6, x = c * (1 - Math.abs(hp % 2 - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0]; else if (hp < 2) [r, g, b] = [x, c, 0]; else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c]; else if (hp < 5) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  const m = l2 - c / 2;
  return hex(r + m, g + m, b + m);
}
export function paletteMerge(p, q, algo = "light-dark") {
  const isVivid = algo.startsWith("vivid-"), base = isVivid ? algo.slice(6) : algo;
  let out = {};
  if (base === "light-dark") {
    let eye = p.eyecolor, bestSat = -1;
    const seen = {}, list = [];
    PALETTE_KEYS.forEach((k, i) => {
      for (const src of [p, q]) {
        if (i < 4 && !seen[src[k]]) { seen[src[k]] = true; list.push({ value: src[k], order: list.length + 1 }); }
        const s = hsl(src[k])[1];
        if (bestSat < s) { eye = src[k]; bestSat = s; }
      }
    });
    list.sort((a, b) => { const la = luminance(a.value), lb = luminance(b.value); return la === lb ? a.order - b.order : la - lb; });
    const pick = f => list[Math.floor((list.length - 1) * f + 0.5)].value;
    out = { color1: pick(0), color2: pick(1), color3: pick(0.25), color4: pick(0.75), eyecolor: eye };
  } else if (base === "closest-pairing") {
    const left = ["color1", "color2", "color3", "color4"];
    PALETTE_KEYS.forEach((k, i) => {
      let other = k;
      if (i < 4) {
        let best = Infinity, bi = 0;
        left.forEach((o, j) => { const d = dist(p[k], q[o]); if (d < best) { best = d; bi = j; } });
        other = left.splice(bi, 1)[0];
      }
      out[k] = mix(p[k], q[other], 0.5);
    });
  } else {
    for (const k of PALETTE_KEYS) {
      const score = h => hsl(h)[1] * 0.65 + Math.abs(luminance(h) - 0.5) * 0.7;
      const pFirst = score(q[k]) <= score(p[k]);
      out[k] = mix(pFirst ? p[k] : q[k], pFirst ? q[k] : p[k], 0.22);
    }
  }
  if (isVivid) for (const k of PALETTE_KEYS) out[k] = vivid(out[k]);
  return out;
}

// ---------------- FusionGenerator ----------------
const vecmix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function world(animal) {
  const [byKey] = index(animal), memo = {};
  const get = l => {
    if (memo[l.key]) return memo[l.key];
    return (memo[l.key] = mul(l.parent ? get(byKey[l.parent]) : IDENT(), R(l.rotation)));
  };
  for (const l of animal.limbs) get(l);
  return memo;
}
function canonical(src) {
  const a = clone(src);
  const [byKey] = index(a), done = new Map();
  const resolve = l => {
    if (done.has(l)) return done.get(l);
    let key = l.key, parent = l.parent ? resolve(byKey[l.parent]) : l.parent;
    l.parent = parent;
    if (l.kind === "extrusion") key = parent + "/@extrusion:" + token(l.extrusionFace);
    l.key = key; done.set(l, key);
    return key;
  };
  for (const l of a.limbs) resolve(l);
  return a;
}
function flatten(a) {
  const [byKey] = index(a);
  for (const l of a.limbs) {
    if (l.kind === "extrusion" || !l.parent) continue;
    while (byKey[l.parent] && byKey[l.parent].kind === "extrusion") {
      const ex = byKey[l.parent], up = byKey[ex.parent];
      const v = new THREE.Vector3(l.parentAnchor[0] * ex.scale[0], l.parentAnchor[1] * ex.scale[1], 0).applyMatrix4(R(ex.rotation));
      const p = A(v);
      for (let i = 0; i < 3; i++) p[i] = ex.parentAnchor[i] + p[i] / up.scale[i];
      l.parentAnchor = anchor(p, ex.extrusionFace);
      l.parentFace = face(ex.extrusionFace);
      l.rotation = euler(mul(R(ex.rotation), R(l.rotation)));
      l.parent = ex.parent;
    }
  }
  return a;
}
const PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
function axes(rot) {
  const m = R(rot), cols = [A(col(m, 0)), A(col(m, 1)), A(col(m, 2))];
  let best = PERMS[0], score = -1;
  for (const p of PERMS) {
    const s = Math.abs(cols[0][p[0]]) + Math.abs(cols[1][p[1]]) + Math.abs(cols[2][p[2]]);
    if (score < s) { best = p; score = s; }
  }
  return best;
}
const permute = (v, p) => [v[p[0]], v[p[1]], v[p[2]]];
function ratios(l, map) {
  if (!(l.parent && map[l.parent])) return null;
  const ps = permute(map[l.parent].scale, axes(l.rotation));
  return [0, 1, 2].map(i => l.scale[i] / Math.max(0.05, ps[i]));
}
const geo = s => Math.cbrt(Math.max(0.05, s[0]) * Math.max(0.05, s[1]) * Math.max(0.05, s[2]));
const sig = s => { const g = geo(s); return [0, 1, 2].map(i => Math.log(Math.max(0.05, s[i]) / g)); };
function alignment(a, b) {
  const na = Math.hypot(...a), nb = Math.hypot(...b);
  if (na < 1e-8 || nb < 1e-8) return 0;
  return Math.max(0, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (na * nb)) * Math.min(na, nb) / Math.max(na, nb);
}
function evidence(l, map, kids) {
  const s = sig(l.scale), n = Math.hypot(...s);
  let e = l.parent ? alignment(s, permute(sig(map[l.parent].scale), axes(l.rotation))) : 0;
  for (const c of kids[l.key] || []) {
    const p = axes(c.rotation), cs = sig(c.scale), v = [];
    v[p[0]] = cs[0]; v[p[1]] = cs[1]; v[p[2]] = cs[2];
    e = Math.max(e, alignment(s, v));
  }
  return e * n / (n + 0.35);
}
function memory(scale, a, b, st) {
  const ea = evidence(a, st.maps[0], st.children[0]), eb = evidence(b, st.maps[1], st.children[1]), e = ea + eb;
  if (e < 1e-8) return scale;
  const m = vecmix(sig(scale), vecmix(sig(a.scale), sig(b.scale), eb / e), 0.72 * e / (e + 0.45)), g = geo(scale);
  return m.map(x => g * Math.exp(x));
}
function shaped(scale, like) {
  const s = sig(like), g = geo(scale), out = s.map(x => g * Math.exp(x));
  let lo = 0, hi = Infinity;
  for (let i = 0; i < 3; i++) { lo = Math.max(lo, 0.05 / out[i]); hi = Math.min(hi, 50 / out[i]); }
  const k = Math.min(Math.max(1, lo), hi);
  return out.map(x => x * k);
}
function faceScale(key, st) {
  const s = st.output[key].scale, f = st.stretch[key];
  return f ? [s[0] / f[0], s[1] / f[1], s[2] / f[2]] : s;
}
function stretched(scale, parentKey, rot, st) {
  const f = st.stretch[parentKey];
  if (!f) return scale;
  const p = axes(rot);
  return [scale[0] * f[p[0]], scale[1] * f[p[1]], scale[2] * f[p[2]]];
}
function remember(key, before, after, st) {
  const r = [], changed = [0, 1, 2].some(i => { r[i] = clamp(after[i], 0.05, 50) / before[i]; return Math.abs(r[i] - 1) > 1e-12; });
  for (let i = 0; i < 3; i++) r[i] = clamp(after[i], 0.05, 50) / before[i];
  if (changed) st.stretch[key] = r;
}
function dominantSide(list, names) {
  if (!list) return null;
  const i = list.indexOf(names[0] + ".json"), j = list.indexOf(names[1] + ".json");
  return i >= 0 && (j < 0 || i < j) ? 1 : j >= 0 ? 2 : null;
}
function pickDominant(flagA, flagB, list, names) {
  if (!!flagA === !!flagB) return flagA ? dominantSide(list, names) : null;
  return flagA ? 1 : 2;
}
function fusionPalette(a, b, names, algo) {
  const side = pickDominant(a.dominantColorScheme, b.dominantColorScheme, RULES.color, names);
  if (!side) return paletteMerge(a.palette, b.palette, algo);
  const dom = side === 1 ? a.palette : b.palette, sub = side === 1 ? b.palette : a.palette;
  const left = ["color1", "color2", "color3", "color4"], out = {};
  for (const k of PALETTE_KEYS) {
    let other = k;
    if (k !== "eyecolor") {
      let best = Infinity, bi = 0;
      left.forEach((o, j) => { const d = dist(dom[k], sub[o]); if (d < best) { best = d; bi = j; } });
      other = left.splice(bi, 1)[0];
    }
    const t = 0.07 + 0.21 * (1 - clamp(dist(dom[k], sub[other]) / Math.sqrt(3), 0, 1));
    out[k] = mix(dom[k], sub[other], t);
  }
  return out;
}
function limbColor(a, b, st) {
  if (!b) {
    const pm = a.parent && st.maps[st.side - 1][a.parent], po = a.parent && st.output[a.parent];
    return pm && po && pm.palette === a.palette ? po.palette : a.palette;
  }
  let pa = a.palette, pb = b.palette;
  if (!pa || !pb || pa === pb) return pb || pa;
  if (!a.parent) return pb;
  const ma = st.maps[0][a.parent], mb = st.maps[1][b.parent], out = st.output[a.parent];
  const da = ma ? pa !== ma.palette : ma, db = mb ? pb !== mb.palette : mb;
  if (!!da !== !!db) return da ? pa || pb : pb;
  if (!(da || db)) return (out && out.palette) || pb;
  if (!(out && out.palette)) return pb;
  if (dist(st.palette[pb], st.palette[out.palette]) < dist(st.palette[pa], st.palette[out.palette])) return pa || pb;
  return pb;
}
function mergeRotation(ra, rb, mixed, parentWorld, wa, wb) {
  if (!(wa && wb)) return mixed;
  const q = m => { const x = new THREE.Quaternion().setFromRotationMatrix(m).normalize(); return [x.x, x.y, x.z, x.w]; };
  const qa = q(ra), qb = q(rb);
  const d = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];
  if (Math.abs(d) > 0.08715574274765814) return mixed;
  const za = col(wa, 2), zb = col(wb, 2), zs = za.clone().add(zb);
  if (zs.dot(zs) < 1e-6) return mixed;
  const zm = col(mul(parentWorld, mixed), 2);
  if (zm.dot(za) >= -1e-6 || zm.dot(zb) >= -1e-6) return mixed;
  let sign = d >= 0 ? -1 : 1;
  if (Math.abs(d) < 1e-6) {
    const qm = q(mixed); let x = 0, y = 0;
    for (let i = 0; i < 4; i++) { x += qa[i] * qm[i]; y += qb[i] * qm[i]; }
    sign = x * y >= 0 ? -1 : 1;
  }
  const s = [0, 1, 2, 3].map(i => qa[i] + sign * qb[i]), n = Math.hypot(...s);
  const cand = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion(s[0] / n, s[1] / n, s[2] / n, s[3] / n));
  const zc = col(mul(parentWorld, cand), 2);
  if (zc.dot(za) <= 1e-6 || zc.dot(zb) <= 1e-6) return mixed;
  const u = zs.normalize();
  return zc.dot(u) > zm.dot(u) + 1e-6 ? cand : mixed;
}
function sharedLimb(a, b, st) {
  const out = clone(a), parent = a.parent;
  const pa = a.parentAnchor ? vecmix(a.parentAnchor, b.parentAnchor, 0.5) : null;
  out.parent = parent;
  out.parentFace = !pa ? undefined : (a.kind === "extrusion" ? face(a.extrusionFace) : face(a.parentFace || pa));
  out.parentAnchor = pa ? anchor(pa, out.parentFace) : undefined;
  out.rotation = euler(lerpRot(R(a.rotation), R(b.rotation), 0.5));
  out.symmetrical = a.symmetrical || b.symmetrical;
  const ra = ratios(a, st.maps[0]), rb = ratios(b, st.maps[1]);
  let sizeSide = pickDominant(a.dominantSize, b.dominantSize, RULES.size[a.key], st.names);
  if (!sizeSide) sizeSide = a.kind === "extrusion" || !parent ? null : st.sizeSource[parent] || null;
  const faceRel = a.kind === "extrusion" ? !sizeSide : false;
  let scale = [];
  if (ra && rb && st.output[parent]) {
    const ps = permute(faceRel ? faceScale(parent, st) : st.output[parent].scale, axes(out.rotation));
    for (let i = 0; i < 3; i++) {
      const hi = Math.max(ra[i], rb[i]), lo = Math.min(ra[i], rb[i]);
      let k = hi > 1.1 ? lo + (hi - lo) * 0.82 : hi / Math.max(0.05, lo) > 1.6 ? lo + (hi - lo) * 0.7 : false;
      if (k === false) k = ra[i] + (rb[i] - ra[i]) * 0.5;
      scale[i] = ps[i] * k;
    }
  } else for (let i = 0; i < 3; i++) scale[i] = Math.sqrt((a.scale[i] ** 2 + b.scale[i] ** 2) / 2);
  scale = memory(scale, a, b, st);
  for (let i = 0; i < 3; i++) scale[i] = clamp(Math.min(scale[i], Math.max(a.scale[i], b.scale[i]) * 1.05), 0.05, 50);
  const before = scale.slice();
  if (sizeSide) {
    st.sizeSource[a.key] = sizeSide;
    const src = sizeSide === 1 ? a : b;
    let k = geo(src.scale) / geo(scale);
    if (parent && st.output[parent]) {
      const r = ratios(src, st.maps[sizeSide - 1]);
      const ps = permute(st.output[parent].scale, axes(out.rotation));
      const now = [0, 1, 2].map(i => scale[i] / Math.max(0.05, ps[i]));
      if (r) k = Math.cbrt((r[0] * r[1] * r[2]) / (now[0] * now[1] * now[2]));
    }
    let lo = 0, hi = Infinity;
    for (let i = 0; i < 3; i++) { lo = Math.max(lo, 0.05 / scale[i]); hi = Math.min(hi, 50 / scale[i]); }
    k = clamp(k, lo, hi);
    scale = scale.map(x => x * k);
  } else if (faceRel) scale = stretched(scale, parent, out.rotation, st);
  // proportions
  let propSide;
  const pa1 = a.dominantProportions === true, pb1 = b.dominantProportions === true;
  if (pa1 === pb1) {
    propSide = pa1 ? dominantSide(RULES.proportions && RULES.proportions[a.key], st.names) : null;
    if (!propSide) propSide = a.kind === "extrusion" || !parent ? null : st.proportionsSource[parent] || null;
  } else propSide = pa1 ? 1 : 2;
  if (propSide) { st.proportionsSource[a.key] = propSide; scale = shaped(scale, (propSide === 1 ? a : b).scale); }
  if (faceRel) scale = scale.map(x => clamp(x, 0.05, 50));
  remember(a.key, before, scale, st);
  out.scale = scale;
  out.dominantSize = a.dominantSize || b.dominantSize;
  out.dominantProportions = pa1 || pb1;
  // rotation
  let rotSide = pickDominant(a.dominantRotation, b.dominantRotation, RULES.rotation[a.key], st.names);
  const rotSrc = rotSide ? (rotSide === 1 ? a : b) : null;
  out.dominantRotation = a.dominantRotation || b.dominantRotation;
  out.useWorldRotationOnMerge = a.kind === "extrusion" || a.useWorldRotationOnMerge || b.useWorldRotationOnMerge || false;
  const parentWorld = parent && st.outputWorld[parent] ? st.outputWorld[parent] : IDENT();
  if (RULES.traits.faceRelativeRotation.includes(a.key)) {
    const x = rotSrc || a, y = rotSrc || b;
    const rel = s => mul(inv(faceRotation(s.parentFace || s.parentAnchor)), R(s.rotation));
    out.rotation = euler(mul(faceRotation(out.parentFace), lerpRot(rel(x), rel(y), 0.5)));
  } else if (out.useWorldRotationOnMerge) {
    // One side can lack this limb (an extrusion synthesised from the other parent); fall back to the side that has it.
    const wa = st.world[0][a.key] || st.world[1][a.key], wb = st.world[1][a.key] || wa;
    const w = rotSrc && st.world[rotSide - 1][a.key] ? st.world[rotSide - 1][a.key]
      : wa ? mergeRotation(wa, wb, lerpRot(wa, wb, 0.5), IDENT(), wa, wb) : mul(parentWorld, R(out.rotation));
    out.rotation = euler(mul(inv(parentWorld), w));
  } else if (rotSrc) {
    out.rotation = clone(rotSrc.rotation);
  } else if (a.kind !== "extrusion") {
    const cur = R(out.rotation);
    const r = mergeRotation(R(a.rotation), R(b.rotation), cur, parentWorld, st.world[0][a.key], st.world[1][a.key]);
    if (!rotEq(r, cur)) out.rotation = euler(r);
  }
  out.palette = limbColor(a, b, st);
  return out;
}
function reattach(animal) {
  const [byKey, kids] = index(animal), w = world(animal);
  for (const l of animal.limbs) {
    if (l.kind === "extrusion" || !l.parent) continue;
    let parent = l.parent, pa = clone(l.parentAnchor), pf = l.parentFace;
    for (let n = 0; n < 20; n++) {
      let ex = null;
      for (const c of kids[parent] || []) if (c.kind === "extrusion" && token(c.extrusionFace) === token(pf)) ex = c;
      if (!ex) break;
      const d = V(pa).sub(V(ex.parentAnchor)).multiply(V(byKey[parent].scale));
      const local = d.applyMatrix4(inv(R(ex.rotation)));
      parent = ex.key;
      pa = [clamp(local.x / ex.scale[0], -1, 1), clamp(local.y / ex.scale[1], -1, 1), 1];
      pf = [0, 0, 1];
    }
    if (parent === l.parent) break; // mirrors the game's own early exit
    l.parent = parent; l.parentAnchor = pa; l.parentFace = pf;
    l.rotation = euler(mul(inv(w[parent]), w[l.key]));
  }
}

/** FusionGenerator.merge(a, b, names, {paletteAlgorithm}) */
export function merge(srcA, srcB, names, algo = "light-dark") {
  const a0 = canonical(srcA), b0 = canonical(srcB);
  const [aMin, aMax] = bounds(a0), [bMin, bMax] = bounds(b0);
  const va = Math.max(1e-9, (aMax.x - aMin.x) * (aMax.y - aMin.y) * (aMax.z - aMin.z));
  const vb = Math.max(1e-9, (bMax.x - bMin.x) * (bMax.y - bMin.y) * (bMax.z - bMin.z));
  const target = Math.sqrt(va * vb);
  [[a0, va], [b0, vb]].forEach(([an, v]) => { const k = Math.cbrt(target / v); for (const l of an.limbs) l.scale = l.scale.map(x => x * k); });
  const a = flatten(a0), b = flatten(b0);
  const [mapA, kidsA] = index(a), [mapB, kidsB] = index(b);
  const st = {
    maps: [mapA, mapB], children: [kidsA, kidsB], world: [world(a), world(b)],
    output: {}, outputWorld: {}, sizeSource: {}, proportionsSource: {}, stretch: {}, names,
    palette: fusionPalette(a, b, names, algo)
  };
  const seen = new Set(), todo = [];
  for (const an of [a, b]) for (const l of an.limbs) if (!seen.has(l.key)) { seen.add(l.key); todo.push(l.key); }
  const limbs = [];
  while (todo.length) {
    let i = 0, progressed = false;
    while (i < todo.length) {
      const key = todo[i];
      let la = mapA[key], lb = mapB[key];
      const any = la || lb;
      if ((la && la.parent && !st.output[la.parent]) || (lb && lb.parent && !st.output[lb.parent])) { i++; continue; }
      st.side = la ? 1 : 2;
      let first;
      if ((la && lb) || any.kind !== "extrusion") first = la;
      else {
        const host = st.maps[2 - st.side][any.parent];
        if (host) {
          const rot = euler(faceRotation(any.extrusionFace)), p = axes(rot);
          first = clone(any);
          first.rotation = rot;
          first.scale = [host.scale[p[0]], host.scale[p[1]], 0.05];
          first.parentAnchor = clone(any.extrusionFace); first.parentFace = clone(any.extrusionFace);
          first.palette = host.palette; first.dominantSize = first.dominantRotation = first.dominantProportions = false;
          if (la) { lb = first; first = la; }
        } else first = la;
      }
      let out;
      if (first && lb) out = sharedLimb(first, lb, st);
      else {
        out = clone(any);
        const r = ratios(any, st.maps[st.side - 1]);
        const dom = any.dominantSize || st.sizeSource[any.parent] === st.side;
        const faceRel = any.kind === "extrusion" ? !dom : false;
        const capped = clone(any.scale);
        if (r && st.output[any.parent]) {
          const ps = permute(faceRel ? faceScale(any.parent, st) : st.output[any.parent].scale, axes(any.rotation));
          for (let k = 0; k < 3; k++) {
            capped[k] = Math.min(ps[k] * r[k], any.scale[k] * 1.05);
            out.scale[k] = clamp(dom ? ps[k] * r[k] : capped[k], 0.05, 50);
          }
        }
        if (faceRel) out.scale = stretched(capped, any.parent, any.rotation, st).map(x => clamp(x, 0.05, 50));
        if (dom) st.sizeSource[key] = st.side;
        if (any.dominantProportions === true || (any.kind !== "extrusion" && st.proportionsSource[any.parent] === st.side)) {
          st.proportionsSource[key] = st.side;
          out.scale = shaped(out.scale, any.scale);
        }
        remember(key, capped, out.scale, st);
        if (any.useWorldRotationOnMerge && any.kind !== "extrusion")
          out.rotation = euler(mul(inv(any.parent && st.outputWorld[any.parent] ? st.outputWorld[any.parent] : IDENT()), st.world[st.side - 1][key]));
        const pm = any.parent && st.maps[st.side - 1][any.parent], po = any.parent && st.output[any.parent];
        out.palette = pm && po && pm.palette === any.palette ? po.palette : any.palette;
      }
      delete out.autoOrient;
      st.output[key] = out;
      st.outputWorld[key] = mul(out.parent && st.outputWorld[out.parent] ? st.outputWorld[out.parent] : IDENT(), R(out.rotation));
      limbs.push(out);
      todo.splice(i, 1);
      progressed = true;
    }
    if (!progressed) throw new Error("Fusion hierarchy contains a cycle");
  }
  const result = { palette: st.palette, limbs, dominantColorScheme: false };
  reattach(result);
  for (const l of limbs) { l.dominantRotation = false; l.dominantSize = false; l.dominantProportions = false; }
  return result;
}

// ---------------- ShinyAppearance ----------------
export function applyShiny(animal, shiny, colors) {
  if (!shiny) return animal;
  const src = animal, a = clone(animal), drop = new Set();
  const last = l => String(l.name || l.type || l.key).split("/").pop().toLowerCase();
  for (const l of a.limbs) if (last(l) === "pupil") drop.add(l.key || l.type);
  for (let changed = true; changed;) {
    changed = false;
    for (const l of a.limbs) { const k = l.key || l.type; if (drop.has(l.parent) && !drop.has(k)) { drop.add(k); changed = true; } }
  }
  const keep = [], byKey = {}, hasKids = {};
  for (const l of a.limbs) { const k = l.key || l.type; if (drop.has(k)) continue; keep.push(l); byKey[k] = l; if (l.parent) hasKids[l.parent] = true; }
  a.limbs = keep;
  const order = ["color1", "color2", "color3", "color4"].sort((x, y) => {
    const lum = k => { const [r, g, b] = rgb(src.palette[k] || "#888888"); return r * 0.2126 + g * 0.7152 + b * 0.0722; };
    const lx = lum(x), ly = lum(y); return lx === ly ? (x < y ? -1 : 1) : lx - ly;
  });
  const depth = l => { const seen = new Set(); let d = 0; while (l && l.parent && !seen.has(l.parent)) { seen.add(l.parent); d++; l = byKey[l.parent]; } return d; };
  const has = (s, list) => list.some(w => s.includes(w));
  for (const l of keep) {
    const n = last(l);
    if (n === "eye") { l.palette = "eyecolor"; continue; }
    const accent = has(n, ["horn", "spike", "crest", "feather", "fin", "claw", "tail_tip", "wing_tip"]);
    let idx;
    if (shiny === "chaos") idx = accent ? 3 : has(n, ["head", "snout", "foot", "paw", "hoof", "beak"]) ? 2 : has(n, ["leg", "arm", "tail", "wing"]) ? 1 : 0;
    else if (shiny === "iridescent") idx = Math.max(0, order.indexOf(l.palette));
    else { const d = depth(l); idx = accent ? 3 : !hasKids[l.key || l.type] && d > 1 ? 2 : d % 3; }
    l.palette = "color" + (idx + 1);
  }
  a.palette = { color1: colors[0], color2: colors[1], color3: colors[2], color4: colors[3], eyecolor: colors[4] };
  return a;
}

// ---------------- building creatures ----------------
export function baseAnimal(id) { return SHAPES[id]; }
/** Single fusion body, or null when a special-body animal is involved. */
export function fusionBody(dad, mom, algo) {
  if (!hasBody(dad) || !hasBody(mom)) return null;
  return merge(SHAPES[dad], SHAPES[mom], [dad, mom], algo);
}
export function doubleBody(h1, h2, algo) {
  const a = fusionBody(h1.dad, h1.mom, algo), b = fusionBody(h2.dad, h2.mom, algo);
  if (!a || !b) return null;
  return merge(a, b, ["double-parent-a", "double-parent-b"], algo);
}

// ---------------- Three.js rendering ----------------
const BOX = new THREE.BoxGeometry(1, 1, 1);
const matCache = new Map();
function material(color, glow) {
  const key = color + (glow || "");
  if (!matCache.has(key)) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.0 });
    if (glow) { m.emissive = new THREE.Color(glow); m.emissiveIntensity = 0.35; }
    matCache.set(key, m);
  }
  return matCache.get(key);
}
/** Build a Y-up THREE.Group, feet on y=0, centred on x/z. */
export function buildMesh(animal, opts = {}) {
  const inner = new THREE.Group();
  for (const n of rig(animal)) {
    if (n.limb.hidden) continue;
    const m = new THREE.Mesh(BOX, material(n.limb.color, opts.glow));
    m.matrixAutoUpdate = false;
    m.matrix.copy(n.mesh).multiply(new THREE.Matrix4().makeScale(n.size.x, n.size.y, n.size.z));
    m.castShadow = true;
    inner.add(m);
  }
  inner.rotation.x = -Math.PI / 2; // game rigs are Z-up
  const g = new THREE.Group(); g.add(inner);
  g.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(g);
  inner.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  g.userData.size = box.getSize(new THREE.Vector3());
  return g;
}

function lights(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c3cf, 1.35));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(30, 60, 25); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 200 });
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdbe8ff, 0.45); fill.position.set(-30, 20, -20); scene.add(fill);
}
function frame(camera, controls, size, fit = 1) {
  const r = Math.max(size.x, size.y, size.z) * 0.5 + 1;
  const d = (r / Math.sin((camera.fov * Math.PI) / 360)) * 1.05 * fit;
  const dir = new THREE.Vector3(0.95, 0.55, 1.15).normalize();
  const target = new THREE.Vector3(0, size.y * 0.45, 0);
  camera.position.copy(target.clone().add(dir.multiplyScalar(d)));
  camera.near = d / 100; camera.far = d * 30; camera.updateProjectionMatrix();
  if (controls) { controls.minDistance = d * 0.3; controls.maxDistance = d * 3; }
  if (controls) { controls.target.copy(target); controls.update(); } else camera.lookAt(target);
}

/** Interactive viewer bound to a container element. */
export class Viewer {
  constructor(el, { OrbitControls, background = null, autoRotate = true } = {}) {
    this.el = el;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    if (background) this.scene.background = new THREE.Color(background);
    lights(this.scene);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(400, 48), new THREE.ShadowMaterial({ opacity: 0.16 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; this.scene.add(ground);
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 5000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    Object.assign(this.controls, { enableDamping: true, autoRotate, autoRotateSpeed: 1.6, enablePan: false });
    this.controls.addEventListener("start", () => { this.controls.autoRotate = false; });
    this.group = null;
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(el);
    this.resize();
    this.running = true;
    const loop = () => { if (!this.running) return; requestAnimationFrame(loop); this.tick(); };
    loop();
  }
  resize() {
    const w = this.el.clientWidth || 300, h = this.el.clientHeight || 300;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }
  tick() {
    if (this.group) {
      this.t = (this.t || 0) + 0.016;
      this.group.position.y = Math.sin(this.t * 2.2) * 0.12 * (this.group.userData.size?.y || 1) * 0.02;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  show(animal, opts = {}) {
    if (this.group) this.scene.remove(this.group);
    this.group = animal ? buildMesh(animal, opts) : null;
    if (this.group) {
      this.scene.add(this.group);
      frame(this.camera, this.controls, this.group.userData.size, opts.fit || 1);
      this.controls.autoRotate = opts.autoRotate !== false;
    }
  }
  destroy() { this.running = false; this.ro.disconnect(); this.renderer.dispose(); this.el.innerHTML = ""; }
}

// Offscreen thumbnail renderer with a small cache
let thumbR = null, thumbScene = null, thumbCam = null;
const thumbCache = new Map();
export function thumbnail(key, build, px = 192) {
  if (thumbCache.has(key)) return thumbCache.get(key);
  if (!thumbR) {
    thumbR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    thumbR.setSize(px, px); thumbR.outputColorSpace = THREE.SRGBColorSpace;
    thumbScene = new THREE.Scene(); lights(thumbScene);
    thumbCam = new THREE.PerspectiveCamera(30, 1, 0.1, 5000);
  }
  const animal = build();
  if (!animal) { thumbCache.set(key, null); return null; }
  const g = buildMesh(animal);
  thumbScene.add(g);
  frame(thumbCam, null, g.userData.size, 0.92);
  thumbR.render(thumbScene, thumbCam);
  const url = thumbR.domElement.toDataURL("image/png");
  thumbScene.remove(g);
  thumbCache.set(key, url);
  return url;
}
