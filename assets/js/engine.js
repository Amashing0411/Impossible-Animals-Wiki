// Fusion maths — a direct port of the game's FusionRating, CreatureIncome, ShinyRules and DoubleFusionRules modules.
import {
  WEIGHTS, SPECIAL_BONUS, STARTER_SPECIALS, CLASSIC_STARTERS, INCOME_RANGES, SHINIES, SHINY_ORDER,
  FRIEND_MULTIPLIER, CHARMS, MAX_STARS
} from "./gamedata.js";

const SEED_PREFIX = "ImpossibleAnimals:stars:v1:seed:67673:";
const STARTER_SPECIAL_SET = new Set(STARTER_SPECIALS);
const CLASSIC_SET = new Set(CLASSIC_STARTERS);

// 32-bit Jenkins one-at-a-time, exactly as the Luau source does it
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

function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) % 2147483647;
  return h;
}

// Lua string comparison is byte-wise; JS < on ASCII strings matches it
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

/** Base star roll for a pair (before mutation / special bonus). */
export function baseStars(a, b) {
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
  const range = INCOME_RANGES[Math.min(MAX_STARS, Math.max(3, stars))];
  return range[0] + Math.floor(unit * (range[1] - range[0] + 1));
}

/** Single (gen-1) hybrid. dad/mom order does not matter for singles. */
export function single(dad, mom, shiny = null) {
  shiny = normShiny(shiny);
  const base = baseStars(dad, mom);
  const bonus = specialBonus([dad, mom]);
  const stars = base + shinyBonus(shiny) + bonus;
  const [hi, lo] = sortPair(dad, mom);
  const s = shiny || "none";
  const h = jenkins(`ImpossibleAnimals:income:v1:seed:67673:${lo.length}:${lo}${hi.length}:${hi}${s.length}:${s}`);
  return { kind: "single", dad, mom, shiny, base, special: bonus, mutation: shinyBonus(shiny), stars, income: incomeIn(stars, h / 4294967296), cap: starterCap(dad, mom) };
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
 * Double fusion of two single hybrids {dad, mom, shiny}. The game orders the two hybrids
 * by "dad|mom|palette"; we approximate the palette tiebreak with dad|mom.
 */
export function double(hA, hB) {
  let [p1, p2] = [hA, hB].map(h => ({ dad: h.dad, mom: h.mom, shiny: normShiny(h.shiny) }));
  if (`${p2.dad}|${p2.mom}` < `${p1.dad}|${p1.mom}`) [p1, p2] = [p2, p1];
  const c1 = baseStars(p1.dad, p1.mom) + shinyBonus(p1.shiny);
  const c2 = baseStars(p2.dad, p2.mom) + shinyBonus(p2.shiny);
  const lo = Math.min(c1, c2);
  const steps = [3, 9, 15, 21, 29].filter(t => t <= lo).length;
  const roll = doubleBonusRoll(p1, p2);
  const parents = [p1.dad, p1.mom, p2.dad, p2.mom];
  const special = specialBonus(parents);
  const stars = Math.max(c1, c2) + Math.min(roll, steps) + special;
  const shiny = bestShiny(p1.shiny, p2.shiny);
  const seed = `${parents.join("|")}|${shiny || "none"}`;
  const income = incomeIn(stars, djb2(seed) / 2147483647);
  return { kind: "double", parents, hybrids: [p1, p2], parentStars: [c1, c2], roll, steps, bonus: Math.min(roll, steps), special, stars, shiny, income };
}

// ShinyRules.odds — "1 in N" chance of each mutation at a given star count
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

// TreadmillRules: EXP per second by treadmill level; 100 EXP = 1 creature level.
export const TREADMILL_RATES = [4, 10, 24, 60, 120, 200, 500, 1000, 2000, 6000];
export const TREADMILL_PRICES = [0, 15000, 75000, 350000, 5000000, 1000000000, 40000000000, 1000000000000, 30000000000000, 1500000000000000];
/** Levels gained per second: rate × (2^speedTier + charm multiplier − 1) / 100 */
export function trainingLevelsPerSecond(treadmillLevel, speedTier = 0, charmTier = 0) {
  const rate = TREADMILL_RATES[Math.min(10, Math.max(1, treadmillLevel)) - 1];
  return rate * (2 ** Math.min(12, Math.max(0, speedTier)) + charmMultiplier(charmTier) - 1) / 100;
}

export const charmMultiplier = tier => (CHARMS[tier - 1] ? CHARMS[tier - 1].multiplier : 1);

// ---------- Number formatting (matches the in-game style: $1.23M/s) ----------
export function money(v, perSec = true) {
  const units = [[1e15, "Qa"], [1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"]];
  let s = null;
  for (const [n, u] of units) if (v >= n) { s = (v / n).toFixed(2) + u; break; }
  if (!s) s = String(Math.round(v));
  return "$" + s + (perSec ? "/s" : "");
}
export function shortNum(v) {
  const units = [[1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "k"]];
  for (const [n, u] of units) if (v >= n) { const x = v / n; return (x < 10 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : x.toFixed(0)).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "") + u; }
  return String(Math.round(v));
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
/** In-game name for a single hybrid, or null when we don't know it. */
export function hybridName(a, b) {
  return KNOWN_NAMES[[a, b].sort().join("+")] || null;
}
