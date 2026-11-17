// Fusion maths: a port of the game's client modules. This file is the ONLY place the site
// computes stars, income, mutation odds, training speed and rankings. Every page imports it.
//
// Source of truth (decompiled game modules in ReplicatedStorage.ImpossibleAnimals):
//   FusionRating       -> baseStars, starterCap, specialBonus
//   ShinyRules         -> shinyBonus, shinyOdds, bestShiny
//   CreatureIncome     -> single (calculate), double (forEntry), formatMoney (Money.format)
//   DoubleFusionRules  -> double (stars / bonus / parents / make)
//   Generation.Palette -> orderHybrids (Palette.key ordering used by DoubleFusionRules.make)
//   TreadmillRules, TreadmillMultipliers, CharmRules -> trainingExpPerSecond
//   SellRules          -> sellValue
//   CreatureLevelFormat-> formatLevel
// See docs/MECHANICS.md for each formula's inputs, verification status and known limits.
// Do not add a mechanic here unless it is backed by game code or a reproducible in-game test.
import {
  WEIGHTS, SPECIAL_BONUS, STARTER_SPECIALS, CLASSIC_STARTERS, INCOME_RANGES, SHINIES, SHINY_ORDER,
  FRIEND_MULTIPLIER, CHARMS, TREADMILL_RATES, TREADMILL_PRICES, TREADMILL_MAX_SPEED_TIER, EXP_PER_LEVEL, MAX_LEVEL, SELL_MULTIPLIER
} from "./gamedata.js";

export { TREADMILL_RATES, TREADMILL_PRICES };

const SEED_PREFIX = "ImpossibleAnimals:stars:v1:seed:67673:";
const STARTER_SPECIAL_SET = new Set(STARTER_SPECIALS);
const CLASSIC_SET = new Set(CLASSIC_STARTERS);
const DOUBLE_STEPS = [3, 9, 15, 21, 29]; // DoubleFusionRules.computed thresholds

// 32-bit Jenkins one-at-a-time, as the Luau source does it with bit32 and % 2^32.
export function jenkins(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h + str.charCodeAt(i)) >>> 0;
    h = (h + ((h << 10) >>> 0)) >>> 0;
    h = (h ^ (h >>> 6)) >>> 0;
  }
  h = (h + ((h << 3) >>> 0)) >>> 0;
  h = (h ^ (h >>> 11)) >>> 0;
  return (h + ((h << 15) >>> 0)) >>> 0;
}

// DJB2 variant used by CreatureIncome.forEntry (mod 2^31 - 1, not 2^32).
export function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) % 2147483647;
  return h;
}

// Lua compares strings byte-wise; every animal id is ASCII, so JS < matches.
const sortPair = (a, b) => (b >= a ? [b, a] : [a, b]); // => [larger, smaller]

function roll(a, b) {
  const [hi, lo] = sortPair(a, b);
  return jenkins(`${SEED_PREFIX}${lo.length}:${lo}${hi.length}:${hi}`) / 4294967296;
}

function bucket(r) {
  let sum = 0;
  for (let i = 0; i < WEIGHTS.length; i++) {
    sum += WEIGHTS[i];
    if (r < sum) return i + 3;
  }
  return 20;
}

const capCache = new Map();
function capFor(id) {
  if (STARTER_SPECIAL_SET.has(id) || CLASSIC_SET.has(id)) return 10;
  if (capCache.has(id)) return capCache.get(id);
  let cap = 3;
  for (const s of CLASSIC_STARTERS) cap = Math.max(cap, bucket(roll(id, s) * 1e6));
  capCache.set(id, cap);
  return cap;
}

function assertPair(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || !a || !b) throw new Error("Expected permanent parent IDs");
}

/** Base star roll for a pair (before mutation / special bonus). FusionRating.calculate */
export function baseStars(a, b) {
  assertPair(a, b);
  const r = roll(a, b) * 1e6;
  const sa = STARTER_SPECIAL_SET.has(a), sb = STARTER_SPECIAL_SET.has(b);
  if (!sa && !sb) return bucket(r);
  const cap = sa && sb ? 10 : capFor(sa ? b : a);
  let sum = 0;
  for (let i = 0; i < cap - 2; i++) sum += WEIGHTS[i];
  return bucket(r * (sum / 1e6));
}

/** The star limit a starter-special fusion is squeezed into (null if the rule doesn't apply). */
export function starterCap(a, b) {
  const sa = STARTER_SPECIAL_SET.has(a), sb = STARTER_SPECIAL_SET.has(b);
  if (!sa && !sb) return null;
  return sa && sb ? 10 : capFor(sa ? b : a);
}

export const specialBonus = ids => ids.reduce((m, id) => Math.max(m, SPECIAL_BONUS[id] || 0), 0);
export const shinyBonus = s => (SHINIES[s] ? SHINIES[s].bonus : 0);
const normShiny = s => (SHINIES[s] ? s : null);

function incomeIn(stars, unit) {
  const range = INCOME_RANGES[stars];
  // CreatureIncome asserts here ("Add an explicit income range for this new star tier").
  if (!range) throw new Error(`No income range for ${stars} stars`);
  return range[0] + Math.floor(unit * (range[1] - range[0] + 1));
}

/**
 * Single (gen-1) hybrid. CreatureIncome.calculate(dad, mom, shiny).
 * Inputs are ONLY the two parent ids and the mutation. Charms and levels are not inputs.
 * dad/mom order does not matter for singles (both hashes sort the pair).
 */
const singleMemo = new Map();
export function single(dad, mom, shiny = null) {
  shiny = normShiny(shiny);
  const key = `${dad}|${mom}|${shiny}`;
  const hit = singleMemo.get(key);
  if (hit) return hit;
  const base = baseStars(dad, mom);
  const bonus = specialBonus([dad, mom]);
  const stars = base + shinyBonus(shiny) + bonus;
  const [hi, lo] = sortPair(dad, mom);
  const s = shiny || "none";
  const h = jenkins(`ImpossibleAnimals:income:v1:seed:67673:${lo.length}:${lo}${hi.length}:${hi}${s.length}:${s}`);
  const r = Object.freeze({ kind: "single", dad, mom, shiny, base, special: bonus, mutation: shinyBonus(shiny), stars, income: incomeIn(stars, h / 4294967296), cap: starterCap(dad, mom) });
  singleMemo.set(key, r);
  return r;
}

function doubleBonusRoll(h1, h2) {
  const key = (x, y) => { const [a, b] = y < x ? [y, x] : [x, y]; return `${a.length}:${a}${b.length}:${b}`; };
  let s1 = key(h1.dad, h1.mom), s2 = key(h2.dad, h2.mom);
  if (s2 >= s1) [s1, s2] = [s2, s1];
  const k = `ImpossibleAnimals:double-stars:v1:${s2.length}:${s2}${s1.length}:${s1}`;
  return Math.floor((jenkins(k) / 4294967296) * 5) + 1;
}

export function bestShiny(a, b) {
  let best = null, rank = 0;
  SHINY_ORDER.forEach((s, i) => { if ((a === s || b === s) && rank < i + 1) { best = s; rank = i + 1; } });
  return best;
}

/**
 * DoubleFusionRules.make sorts the two hybrids by Palette.key = "dad|mom|color1|...|eyecolor".
 * We don't know the palette, but it always follows a "|", so comparing "dad|mom|" gives the
 * same answer whenever the recipes differ (e.g. "x|car|" vs "x|carrot|"). When both hybrids
 * have the same dad and mom, the palette decides, and the order no longer changes any result.
 */
export function orderHybrids(a, b) {
  return `${b.dad}|${b.mom}|` < `${a.dad}|${a.mom}|` ? [b, a] : [a, b];
}

/**
 * Double fusion of two single hybrids {dad, mom, shiny}.
 * Stars: DoubleFusionRules.stars. Income: CreatureIncome.forEntry (DJB2 over the 4 parents in
 * stored dad/mom order + best mutation). Charm and level are inherited (max of the two) but are
 * not inputs to stars or income.
 */
export function double(hA, hB) {
  let [p1, p2] = orderHybrids(...[hA, hB].map(h => {
    assertPair(h.dad, h.mom);
    if (h.dad === h.mom) throw new Error("A hybrid needs two different parents");
    return { dad: h.dad, mom: h.mom, shiny: normShiny(h.shiny) };
  }));
  const c1 = baseStars(p1.dad, p1.mom) + shinyBonus(p1.shiny);
  const c2 = baseStars(p2.dad, p2.mom) + shinyBonus(p2.shiny);
  const lo = Math.min(c1, c2);
  const steps = DOUBLE_STEPS.filter(t => t <= lo).length;
  const roll = doubleBonusRoll(p1, p2);
  const parents = [p1.dad, p1.mom, p2.dad, p2.mom];
  const special = specialBonus(parents);
  const stars = Math.max(c1, c2) + Math.min(roll, steps) + special;
  const shiny = bestShiny(p1.shiny, p2.shiny);
  const seed = `${parents.join("|")}|${shiny || "none"}`;
  const income = incomeIn(stars, djb2(seed) / 2147483647);
  return { kind: "double", parents, hybrids: [p1, p2], parentStars: [c1, c2], roll, steps, bonus: Math.min(roll, steps), special, stars, shiny, income };
}

/** SellRules.value: a hybrid sells for 10 x its $/s. */
export const sellValue = income => Math.floor(income * SELL_MULTIPLIER);

// ---------- Mutation odds (ShinyRules.odds / effectiveOdds) ----------
// "1 in N" chance of each mutation for a fusion rolled at `stars`. The roll itself happens on the
// server, so WHICH star count the server passes in is not visible in the client code. The site
// uses the hybrid's stars before its mutation bonus (roll + special); treat these as estimates.
export function shinyOdds(type, stars, friends = 1) {
  const odds = (t, s) => SHINIES[t].denominator * ((Math.min(20, Math.max(3, s)) - 3) * 19 / 17 + 1);
  const mult = typeof friends === "number" && friends > 1 && friends <= FRIEND_MULTIPLIER ? friends : 1;
  let total = 0;
  for (const t of SHINY_ORDER) total += 1 / odds(t, stars);
  return odds(type, stars) / Math.min(mult, 1 / total);
}

/** Chance that one fusion at `stars` (before mutation) comes out with any mutation. */
export function mutationChance(stars, friends = 1) {
  return SHINY_ORDER.reduce((p, t) => p + 1 / shinyOdds(t, stars, friends), 0);
}

// ---------- Training (TreadmillRules.rate) ----------
/** CharmRules.multiplier: the charm's TRAINING multiplier ("x1.5 levels while training"). Not an income multiplier. */
export const charmTrainingMultiplier = tier => (CHARMS[tier - 1] ? CHARMS[tier - 1].multiplier : 1);
/** TreadmillMultipliers.multiplier: 2^tier, tier 0..12. */
export const speedBoostMultiplier = tier => 2 ** Math.min(TREADMILL_MAX_SPEED_TIER, Math.max(0, Math.floor(tier) || 0));
/**
 * EXP per second = rates[treadmillLevel] x (speedBoost + charm - 1).
 * The charm ADDS to the speed boost; it doesn't multiply it. 0 once the hybrid is at the level cap.
 */
export function trainingExpPerSecond(treadmillLevel, speedTier = 0, charmTier = 0, creatureLevel = 1) {
  if (creatureLevel >= MAX_LEVEL) return 0;
  const rate = TREADMILL_RATES[Math.min(10, Math.max(1, Math.floor(treadmillLevel) || 1)) - 1];
  return rate * (speedBoostMultiplier(speedTier) + charmTrainingMultiplier(charmTier) - 1);
}
/** Levels gained per second (EXP_PER_LEVEL EXP = 1 level). */
export const trainingLevelsPerSecond = (treadmillLevel, speedTier = 0, charmTier = 0) =>
  trainingExpPerSecond(treadmillLevel, speedTier, charmTier) / EXP_PER_LEVEL;

// ---------- Rankings (Best Partners, Top Hybrids, suggestions) ----------
const byStarsThenIncome = (a, b) => b.stars - a.stars || b.income - a.income;
export const rankComparator = sort => sort === "income" ? (a, b) => b.income - a.income || b.stars - a.stars : byStarsThenIncome;

/** Every single fusion of `pet` with each id in `ids`, best first. */
export function rankSinglePartners(pet, ids, { shiny = null, sort = "stars" } = {}) {
  return ids.filter(id => id !== pet).map(id => single(pet, id, shiny)).sort(rankComparator(sort));
}

/** Every gen-1 hybrid from `pairs` double fused with `h`. Both partner dad/mom orders are tried (it changes income). */
export function rankDoublePartners(h, pairs, { partnerShiny = null, sort = "stars" } = {}) {
  const rows = [];
  for (const [a, b] of pairs) {
    const r1 = double(h, { dad: a, mom: b, shiny: partnerShiny }), r2 = double(h, { dad: b, mom: a, shiny: partnerShiny });
    const r = r2.income > r1.income ? r2 : r1;
    r.partner = r === r1 ? { dad: a, mom: b, shiny: partnerShiny } : { dad: b, mom: a, shiny: partnerShiny };
    r.mine = { dad: h.dad, mom: h.mom, shiny: normShiny(h.shiny) };
    rows.push(r);
  }
  return rows.sort(rankComparator(sort));
}

/**
 * Exact top-k double fusions among all hybrids made from `pairs` (both hybrids carry `shiny`).
 * Branch and bound: a double's stars can't exceed max(c) + min(5, steps(min c)) + max(special),
 * so hybrid groups whose bound is below the k-th best are skipped. Each result uses the
 * dad/mom order (of both hybrids) with the highest income.
 */
export function topDoubles(pairs, k, shiny = null) {
  shiny = normShiny(shiny);
  const groups = new Map();
  for (const [a, b] of pairs) {
    const s = single(a, b, shiny);
    const c = s.base + s.mutation, key = `${c}|${s.special}`;
    if (!groups.has(key)) groups.set(key, { c, sp: s.special, list: [] });
    groups.get(key).list.push({ dad: a, mom: b, shiny, c });
  }
  const gs = [...groups.values()];
  const stepsFor = lo => DOUBLE_STEPS.filter(t => t <= lo).length;
  const gp = [];
  for (let i = 0; i < gs.length; i++) for (let j = i; j < gs.length; j++) {
    const A = gs[i], B = gs[j];
    gp.push({ A, B, ub: Math.max(A.c, B.c) + Math.min(5, stepsFor(Math.min(A.c, B.c))) + Math.max(A.sp, B.sp) });
  }
  gp.sort((x, y) => y.ub - x.ub);
  const hist = new Map(); // stars -> count of candidates found
  const cands = [];
  let thr = -Infinity, found = 0;
  const updateThr = () => {
    if (found < k) return;
    let acc = 0;
    for (const s of [...hist.keys()].sort((x, y) => y - x)) { acc += hist.get(s); if (acc >= k) { thr = s; return; } }
  };
  for (const { A, B, ub } of gp) {
    if (ub < thr) break;
    const sp = Math.max(A.sp, B.sp);
    for (let i = 0; i < A.list.length; i++) {
      const x = A.list[i];
      for (let j = A === B ? i : 0; j < B.list.length; j++) {
        const y = B.list[j];
        const steps = stepsFor(Math.min(x.c, y.c));
        const stars = Math.max(x.c, y.c) + Math.min(doubleBonusRoll(x, y), steps) + sp;
        if (stars < thr) continue;
        cands.push({ x, y, stars });
        hist.set(stars, (hist.get(stars) || 0) + 1); found++;
      }
    }
    updateThr();
  }
  const flip = h => ({ dad: h.mom, mom: h.dad, shiny: h.shiny });
  return cands.filter(c => c.stars >= thr).map(({ x, y }) => {
    let best = null;
    for (const p of [x, flip(x)]) for (const q of [y, flip(y)]) {
      const r = double(p, q);
      if (!best || r.income > best.income) best = r;
    }
    return best;
  }).sort(byStarsThenIncome).slice(0, k);
}

// ---------- Number formatting ----------
const MONEY_SUFFIXES = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", "Vg"];
/** CreatureIncome.Money.format: truncates (never rounds up) to 2 decimals and drops trailing zeros. */
export function formatMoney(v) {
  const n = Math.max(0, Math.floor(Number(v) || 0));
  const s = BigInt(n).toString();
  if (s.length <= 3) return s;
  const k = Math.floor((s.length - 1) / 3);
  const trim = t => t.replace(/0+$/, "").replace(/\.$/, "");
  if (MONEY_SUFFIXES[k - 1]) {
    const head = s.length - k * 3;
    return trim(`${s.slice(0, head)}.${s.slice(head, head + 2)}`) + MONEY_SUFFIXES[k - 1];
  }
  return `${trim(`${s[0]}.${s.slice(1, 3)}`)}e+${s.length - 1}`;
}
/** "$38.34K/s", the same text the game shows on a hybrid. */
export function money(v, perSec = true) {
  return "$" + formatMoney(v) + (perSec ? "/s" : "");
}

const COMPACT = [[1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "k"]];
/** CreatureLevelFormat's compact style (truncating, lowercase k), for any non-negative number. */
export function shortNum(v) {
  const n = Math.max(0, Math.floor(Number(v) || 0));
  for (const [div, u] of COMPACT) {
    if (div > n) continue;
    const x = n / div, d = x < 10 ? 2 : x < 100 ? 1 : 0, p = 10 ** d;
    let t = (Math.floor(x * p) / p).toFixed(d);
    if (d > 0) t = t.replace(/0+$/, "").replace(/\.$/, "");
    return t + u;
  }
  return String(n);
}
/** CreatureLevelFormat.format: how the game writes "Lv. 2.22M" (min 1, shows the cap as MAX). */
export function formatLevel(v) {
  const n = Math.max(1, Math.floor(Number(v) || 1));
  return n >= MAX_LEVEL ? "500,000,000 (MAX)" : shortNum(n);
}

// ---------- Hybrid names ----------
// English hybrid names are generated on the game's servers, so we only show names we know for sure:
// the game's own English overrides (FusionNameOverrides) plus names collected from player screenshots.
const KNOWN_NAMES = {
  "anglerfish+chicken": "Chickerfish",
  "ankylosaurus+ferret": "Ankylosarret",
  "ankylosaurus+velociraptor": "Velosaurus",
  "ankylosaurus+wasp": "Ankylosawasp",
  "ant+ferret": "Ferrant",
  "ant+velociraptor": "Velocirant",
  "axolotl+ferret": "Axolorret",
  "axolotl+velociraptor": "Axolociraptor",
  "axolotl+wasp": "Axolowasp",
  "bamboo+glitch": "Glimboo",
  "black-hole+monkey": "Blackhokey",
  "car+ferret": "Cawret",
  "car+velociraptor": "Caraptor",
  "car+wasp": "Carwasp",
  "cheeseburger+ferret": "Cheeseburet",
  "cheeseburger+glitch": "Gliteburger",
  "cheeseburger+millipede": "Milleburger",
  "cheeseburger+solar-eclipse": "Cheeseclipse",
  "cheeseburger+velociraptor": "Cheeseburaptor",
  "cheeseburger+wasp": "Cheesebuwasp",
  "cheetah+ferret": "Cheerret",
  "cheetah+velociraptor": "Cheeciraptor",
  "chicken+crocodile": "Chickodile",
  "chicken+giraffe": "Chickaffe",
  "chicken+jellyfish": "Chickyfish",
  "chicken+pufferfish": "Puffericken",
  "chicken+velociraptor": "Velocicken",
  "chicken+wolf": "Chickwolf",
  "cobra+glitch": "Glitobra",
  "cowboy+ferret": "Cowberret",
  "cowboy+glitch": "Cowitch",
  "cowboy+velociraptor": "Velocirawboy",
  "cowboy+wasp": "Cowasp",
  "crab+glitch": "Glicrab",
  "crocodile+ferret": "Ferrocodile",
  "crocodile+gorilla": "Crocodilla",
  "crocodile+velociraptor": "Crociraptor",
  "crocodile+wasp": "Crocowasp",
  "dolphin+velociraptor": "Dolphiraptor",
  "dolphin+wasp": "Waspin",
  "dragon+shark": "Sharagon",
  "dragonfly+velociraptor": "Velociragonfly",
  "excavator+ferret": "Excavarret",
  "excavator+velociraptor": "Velociravator",
  "excavator+wasp": "Excavwasp",
  "ferret+giraffe": "Ferraffe",
  "ferret+millipede": "Milliperret",
  "ferret+moose": "Moorret",
  "ferret+orangutan": "Ferrangutan",
  "ferret+owl": "Ferrowl",
  "ferret+red panda": "Redparret",
  "ferret+rhino": "Ferrino",
  "ferret+skeleton": "Skelegoret",
  "ferret+spider": "Ferrider",
  "ferret+stingray": "Stingret",
  "ferret+t-rex": "Ferretrex",
  "ferret+velociraptor": "Ferraptor",
  "ferret+venus-fly-trap": "Venusflyrret",
  "ferret+warthog": "Waret",
  "ferret+wasp": "Ferrewasp",
  "ferret+zombie": "Ferrembie",
  "fox+velociraptor": "Velocirafox",
  "fox+wasp": "Foxwasp",
  "giraffe+velociraptor": "Giraptor",
  "glitch+jerboa": "Gliterboa",
  "glitch+robot": "Glitobot",
  "glitch+zebra": "Glitebra",
  "glitch+zombie": "Glimbie",
  "goat+skeleton": "Skelegoat",
  "gorilla+velociraptor": "Velocirilla",
  "jerboa+velociraptor": "Velocirboa",
  "millipede+velociraptor": "Milliraptor",
  "millipede+wasp": "Waspede",
  "monkey+velociraptor": "Velocirankey",
  "moose+velociraptor": "Moociraptor",
  "moose+wasp": "Moowasp",
  "ninja+tiger": "Tigenja",
  "orangutan+velociraptor": "Velocirangutan",
  "owl+spider": "Owlider",
  "owl+velociraptor": "Owlociraptor",
  "owl+wasp": "Waspowl",
  "red panda+velociraptor": "Velocirapanda",
  "rhino+velociraptor": "Rhiraptor",
  "rhino+wasp": "Rhiwasp",
  "shark+tiger": "Tigark",
  "shark+turtle": "Turtark",
  "skeleton+velociraptor": "Skelociraptor",
  "skeleton+wasp": "Skelwasp",
  "spider+velociraptor": "Velocider",
  "spider+wasp": "Waspider",
  "stegosaurus+velociraptor": "Stegosaptor",
  "stegosaurus+wasp": "Stegosawasp",
  "stingray+velociraptor": "Stingraptor",
  "t-rex+velociraptor": "Velociratrex",
  "tank+velociraptor": "Velociraptank",
  "tiger+uranium": "Tiganium",
  "turtle+velociraptor": "Velocirtle",
  "velociraptor+venus-fly-trap": "Venusflytraptor",
  "velociraptor+warthog": "Velocirarthog",
  "velociraptor+wasp": "Velocirawasp",
  "velociraptor+zombie": "Zombiraptor",
  "warthog+wasp": "Warthowasp",
  "wasp+zombie": "Waspombie"
};
export const KNOWN_NAME_KEYS = Object.keys(KNOWN_NAMES);
/** In-game name for a single hybrid, or null when we don't know it. */
export function hybridName(a, b) {
  return KNOWN_NAMES[[a, b].sort().join("+")] || null;
}
