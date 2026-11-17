// Independent reference implementation, transliterated line by line from the decompiled Luau
// modules (FusionRating, ShinyRules, CreatureIncome, DoubleFusionRules, Generation.Palette.key,
// TreadmillRules, TreadmillMultipliers, CharmRules, SellRules, CreatureLevelFormat).
//
// It deliberately shares NO code with assets/js/engine.js:
//   * 32-bit maths uses BigInt and explicit bit32 helpers instead of JS >>> tricks
//   * strings are hashed as UTF-8 bytes (string.byte) and compared with Buffer.compare (Lua byte order)
//   * double fusions are ordered by the real Palette.key, including a palette
//   * the constant tables below are re-typed from the Lua sources, not imported from gamedata.js
// If the engine and this file ever disagree, one of them misread the Lua: re-read the Lua.

const U32 = 4294967296n;
const bit32 = {
  lshift: (x, n) => (x << BigInt(n)) % U32,
  rshift: (x, n) => x >> BigInt(n),
  bxor: (a, b) => (a ^ b) % U32
};
const bytes = s => Buffer.from(s, "utf8");
const len = s => bytes(s).length; // Lua # on a string = byte length
const ge = (a, b) => Buffer.compare(bytes(a), bytes(b)) >= 0; // Lua a >= b
const lt = (a, b) => Buffer.compare(bytes(a), bytes(b)) < 0;  // Lua a < b

function oneAtATime(str) {
  let v = 0n;
  for (const byte of bytes(str)) {
    const a = (v + BigInt(byte)) % U32;
    const b = (a + bit32.lshift(a, 10)) % U32;
    v = bit32.bxor(b, bit32.rshift(b, 6));
  }
  const c = (v + bit32.lshift(v, 3)) % U32;
  const d = bit32.bxor(c, bit32.rshift(c, 11));
  return (d + bit32.lshift(d, 15)) % U32; // BigInt in [0, 2^32)
}

// ---- FusionRating ----
const WEIGHTS = [250000, 225690, 157983, 110588, 77412, 54188, 37932, 26552, 18587, 13011, 9107, 6375, 4463, 3124, 2187, 1531, 1070, 200];
const STARTER_SPECIALS = { bismuth: true, ninja: true, "fighter-jet": true, "giant-eyeball": true, glitch: true };
const CLASSIC = ["crab", "rhino", "warthog", "t-rex", "jerboa", "ant", "spider", "cheetah", "axolotl", "dolphin", "dragonfly", "fox",
  "giraffe", "monkey", "red panda", "venus-fly-trap", "owl", "turtle", "car", "cotton-candy", "crocodile", "orangutan", "stingray",
  "toilet", "cheeseburger", "shark"];
const CLASSIC_SET = Object.fromEntries(CLASSIC.map(x => [x, true]));
export const SPECIAL_BONUS = { ruby: 1, electricity: 2, lava: 2, uranium: 2, aurora: 2, "black-hole": 3, clouds: 1, glitter: 1, jade: 1,
  water: 1, "psychic-power": 2, plasma: 2, "solar-eclipse": 3, ghost: 1, mummy: 1, robot: 1, blender: 2, "boba-tea": 1, "lava-lamp": 2, quadcopter: 1 };

function fusionRoll(p7, p8) {
  if (ge(p8, p7)) [p7, p8] = [p8, p7];
  const v11 = "ImpossibleAnimals:stars:v1:seed:67673:" + len(p8) + ":" + p8 + len(p7) + ":" + p7;
  return Number(oneAtATime(v11)) / 4294967296;
}
// The decompiled loops use `continue` where the original clearly breaks out with the found tier
// (otherwise every roll would land on the last tier). Tier for weight index i (1-based) is i + 2.
function tierOf(x) {
  let acc = 0;
  for (let i = 1; i <= WEIGHTS.length; i++) {
    acc += WEIGHTS[i - 1];
    if (x < acc) return i + 2;
  }
  return 20;
}
const capCache = {};
function capFor(id) {
  if (STARTER_SPECIALS[id] || CLASSIC_SET[id]) return 10;
  if (capCache[id] === undefined) {
    let v24 = 3;
    for (const s of CLASSIC) v24 = Math.max(v24, tierOf(fusionRoll(id, s) * 1000000));
    capCache[id] = v24;
  }
  return capCache[id];
}
export function fusionRatingCalculate(p32, p33) {
  const v34 = fusionRoll(p32, p33) * 1000000;
  if (!(STARTER_SPECIALS[p32] || STARTER_SPECIALS[p33])) return tierOf(v34);
  let v38;
  if (STARTER_SPECIALS[p32] && STARTER_SPECIALS[p33]) v38 = 10;
  else v38 = capFor(STARTER_SPECIALS[p32] ? p33 : p32);
  let v40 = 0;
  for (let i = 1; i <= v38 - 2; i++) v40 += WEIGHTS[i - 1];
  return tierOf(v34 * (v40 / 1000000));
}
export function specialBonus(list) {
  let m = 0;
  for (const id of list) m = Math.max(m, SPECIAL_BONUS[id] || 0);
  return m;
}

// ---- ShinyRules ----
export const SHINY = { golden: [2, 10], diamond: [4, 25], iridescent: [6, 100], chaos: [10, 250] }; // [bonus, denominator]
export const SHINY_ORDER = ["golden", "diamond", "iridescent", "chaos"];
const normalize = s => (typeof s === "string" && SHINY[s] ? s : null);
const shinyStars = (n, s) => n + (SHINY[s] ? SHINY[s][0] : 0);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export function shinyOdds(type, stars) { return SHINY[type][1] * ((clamp(stars, 3, 20) - 3) * 19 / 17 + 1); }
export function effectiveOdds(type, stars, friend) {
  const v10 = (typeof friend !== "number" || friend <= 1 || friend > 10) ? 1 : friend;
  let v11 = 0;
  for (const t of SHINY_ORDER) v11 += 1 / shinyOdds(t, stars);
  return shinyOdds(type, stars) / Math.min(v10, 1 / v11);
}
function bestShiny(a, b) {
  let v67 = 0, v68 = null;
  SHINY_ORDER.forEach((t, i) => { const v69 = i + 1; if ((a === t || b === t) && v67 < v69) { v68 = t; v67 = v69; } });
  return v68;
}

// ---- CreatureIncome ----
export const RANGES = {
  3: [1, 2], 4: [3, 5], 5: [6, 9], 6: [10, 19], 7: [20, 49], 8: [50, 99], 9: [100, 199], 10: [200, 499], 11: [500, 999], 12: [1000, 1900],
  13: [2000, 4900], 14: [5000, 9900], 15: [10000, 19900], 16: [20000, 49900], 17: [50000, 99900], 18: [100000, 199900],
  19: [200000, 499900], 20: [500000, 999900], 21: [1000000, 1990000], 22: [2000000, 4990000], 23: [5000000, 9990000],
  24: [10000000, 19990000], 25: [20000000, 49990000], 26: [50000000, 99990000], 27: [100000000, 199990000], 28: [200000000, 499990000],
  29: [500000000, 999990000], 30: [1000000000, 3000000000], 31: [3000000001, 5999999999], 32: [6000000000, 11999999999],
  33: [12000000000, 23999999999], 34: [24000000000, 47999999999], 35: [48000000000, 95999999999], 36: [96000000000, 191999999999],
  37: [192000000000, 383999999999], 38: [384000000000, 767999999999]
};
export function incomeCalculate(p15, p16, p17) {
  const v19 = normalize(p17);
  const v20 = shinyStars(fusionRatingCalculate(p15, p16), v19) + specialBonus([p15, p16]);
  const v22 = RANGES[v20];
  if (!v22) throw new Error("Add an explicit income range for this new star tier");
  if (ge(p16, p15)) [p15, p16] = [p16, p15];
  const v24 = v19 || "none";
  const v25 = "ImpossibleAnimals:income:v1:seed:67673:" + len(p16) + ":" + p16 + len(p15) + ":" + p15 + len(v24) + ":" + v24;
  const v34 = oneAtATime(v25);
  return { income: v22[0] + Math.floor(Number(v34) / 4294967296 * (v22[1] - v22[0] + 1)), stars: v20 };
}

// ---- Generation.Palette.key ----
const PALETTE_KEYS = ["color1", "color2", "color3", "color4", "eyecolor"];
function paletteKey(p) {
  const parts = [p.dad, p.mom];
  if (p.fusionParents) { parts.push("double-v1"); for (const fp of p.fusionParents) parts.push(paletteKey(fp)); }
  for (const k of PALETTE_KEYS) parts.push(p.palette ? (p.palette[k] || "legacy") : "legacy");
  return parts.join("|");
}

// ---- DoubleFusionRules ----
function dfParents(e) {
  const f = e.fusionParents;
  return f ? [f[0].dad, f[0].mom, f[1].dad, f[1].mom] : [e.dad, e.mom];
}
function dfBonus(e) {
  const v33 = e.fusionParents;
  let v35 = v33[0].dad, v36 = v33[0].mom;
  if (lt(v36, v35)) [v35, v36] = [v36, v35];
  let v38 = len(v35) + ":" + v35 + len(v36) + ":" + v36;
  let v40 = v33[1].dad, v41 = v33[1].mom;
  if (ge(v41, v40)) [v40, v41] = [v41, v40];
  let v43 = len(v41) + ":" + v41 + len(v40) + ":" + v40;
  if (ge(v43, v38)) [v38, v43] = [v43, v38];
  const v45 = "ImpossibleAnimals:double-stars:v1:" + len(v43) + ":" + v43 + len(v38) + ":" + v38;
  return Math.floor(Number(oneAtATime(v45)) / 4294967296 * 5) + 1;
}
function computed(e) {
  const f = e.fusionParents;
  if (!f) return shinyStars(fusionRatingCalculate(e.dad, e.mom), e.shiny);
  const v57 = computed(f[0]), v58 = computed(f[1]);
  let v59 = 0;
  for (const t of [3, 9, 15, 21, 29]) if (t <= Math.min(v57, v58)) v59++;
  return Math.max(v57, v58) + Math.min(dfBonus(e), v59);
}
export const dfStars = e => computed(e) + specialBonus(dfParents(e));

/** DoubleFusionRules.make(h1, h2) for two gen-1 hybrids {dad, mom, shiny, palette}. */
export function dfMake(h1, h2) {
  const v77 = [h1, h2].map(h => ({ dad: h.dad, mom: h.mom, palette: h.palette, shiny: normalize(h.shiny) }));
  if (lt(paletteKey(v77[1]), paletteKey(v77[0]))) v77.reverse();
  return { dad: v77[0].dad, mom: v77[0].mom, fusionParents: v77, shiny: bestShiny(h1.shiny, h2.shiny) };
}

/** CreatureIncome.forEntry for a double-fusion entry. */
export function incomeForDouble(e) {
  const v6 = dfStars(e);
  const v8 = RANGES[v6];
  if (!v8) throw new Error("missing range");
  const v10 = dfParents(e).join("|") + "|" + (e.shiny || "none");
  let v11 = 5381n;
  for (const byte of bytes(v10)) v11 = (v11 * 33n + BigInt(byte)) % 2147483647n;
  return { income: v8[0] + Math.floor(Number(v11) / 2147483647 * (v8[1] - v8[0] + 1)), stars: v6, bonus: dfBonus(e) };
}

// ---- Training: TreadmillRules.rate / TreadmillMultipliers / CharmRules ----
const RATES = [4, 10, 24, 60, 120, 200, 500, 1000, 2000, 6000];
const CHARM_MULT = [1.5, 2, 2.5, 3, 3.5, 4, 5, 7, 10, 20];
const charmTier = t => (typeof t !== "number" || Number.isNaN(t) || !Number.isFinite(t)) ? 0 : clamp(Math.floor(t), 0, 10);
const charmMultiplier = t => (charmTier(t) > 0 ? CHARM_MULT[charmTier(t) - 1] : 1);
const speedTier = t => (typeof t === "number" && t === t) ? clamp(Math.floor(t), 0, 12) : 0;
const treadmillLevel = l => (typeof l === "number" && l === l) ? clamp(Math.floor(l), 1, 10) : 1;
export function treadmillRate(player, creature) {
  if (creature && (creature.level || 1) >= 500000000) return 0;
  const v11 = 2 ** speedTier(player.treadmillMultiplierTier);
  const v13 = charmMultiplier(creature ? creature.charmTier : undefined);
  return RATES[treadmillLevel(player.treadmillLevel) - 1] * (v11 + v13 - 1);
}

// ---- SellRules ----
export const sellValue = income => Math.floor(income * 10);

// ---- CreatureIncome.Money.format (string based, like the Lua) ----
const SUF = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", "Vg"];
export function moneyFormat(digits) {
  let v142 = String(digits).replace(/^0+/, "") || "0";
  if (v142.length <= 3) return v142;
  const v144 = Math.floor((v142.length - 1) / 3);
  const gsubZeros = s => s.replace(/0+$/, "");
  const gsubDot = s => s.replace(/\.$/, "");
  if (SUF[v144 - 1]) {
    const v145 = v142.length - v144 * 3;
    return gsubDot(gsubZeros(v142.substring(0, v145) + "." + v142.substring(v145, v145 + 2))) + SUF[v144 - 1];
  }
  return gsubDot(gsubZeros(v142[0] + "." + v142.substring(1, 3))) + "e+" + (v142.length - 1);
}

// ---- CreatureLevelFormat.format ----
const LV = [[1000000000000, "T"], [1000000000, "B"], [1000000, "M"], [1000, "k"]];
export function levelFormat(p3) {
  const v4 = (typeof p3 === "number" && p3 === p3 && p3 < Infinity) ? Math.max(1, Math.floor(p3)) : 1;
  if (v4 >= 500000000) return "500,000,000 (MAX)";
  for (const [d, u] of LV) {
    if (d > v4) continue;
    const v7 = v4 / d;
    const v8 = v7 < 10 ? 2 : v7 < 100 ? 1 : 0;
    const v9 = 10 ** v8;
    let v13 = (Math.floor(v7 * v9) / v9).toFixed(v8);
    if (v8 > 0) v13 = v13.replace(/0+$/, "").replace(/\.$/, "");
    return v13 + u;
  }
  return String(v4);
}
