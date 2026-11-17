// Compares the site engine against the independent Luau transliteration in tests/reference.
// Expected values never come from engine.js itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as E from "../assets/js/engine.js";
import * as R from "./reference/lua-reference.mjs";

const CATALOG = JSON.parse(fs.readFileSync(new URL("../assets/data/catalog.json", import.meta.url), "utf8"));
const IDS = CATALOG.map(c => c.id);
const PAIRS = IDS.flatMap((a, i) => IDS.slice(i + 1).map(b => [a, b]));
const SHINIES = [null, ...R.SHINY_ORDER];

// Small deterministic PRNG so sampled cases are the same on every run.
function prng(seed) { return () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648); }
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const palette = rnd => Object.fromEntries(["color1", "color2", "color3", "color4", "eyecolor"].map(k => [k, "#" + Math.floor(rnd() * 0xffffff).toString(16).padStart(6, "0")]));

test("regular fusion: stars and income match the Lua reference for all pairs x all mutations, both orders", () => {
  let n = 0;
  for (const [a, b] of PAIRS) for (const s of SHINIES) {
    const ref = R.incomeCalculate(a, b, s);
    for (const [d, m] of [[a, b], [b, a]]) {
      const r = E.single(d, m, s);
      assert.equal(r.stars, ref.stars, `${d}+${m} ${s} stars`);
      assert.equal(r.income, ref.income, `${d}+${m} ${s} income`);
      assert.equal(r.base, R.fusionRatingCalculate(d, m), `${d}+${m} base roll`);
      assert.equal(r.special, R.specialBonus([d, m]));
      n++;
    }
  }
  assert.equal(n, PAIRS.length * SHINIES.length * 2);
});

test("regular fusion: parent order never changes a single hybrid", () => {
  for (const [a, b] of PAIRS) {
    const x = E.single(a, b), y = E.single(b, a);
    assert.equal(x.stars, y.stars); assert.equal(x.income, y.income);
  }
});

test("star bounds: base roll 3..20, singles 3..33, income always inside its tier's range", () => {
  for (const [a, b] of PAIRS) for (const s of SHINIES) {
    const r = E.single(a, b, s);
    assert.ok(r.base >= 3 && r.base <= 20);
    assert.ok(r.stars >= 3 && r.stars <= 33);
    const [lo, hi] = R.RANGES[r.stars];
    assert.ok(r.income >= lo && r.income <= hi, `${a}+${b} ${s}: ${r.income} outside ${lo}-${hi}`);
  }
});

test("starter specials: rolls stay at or under their cap, and two starter specials cap at 10", () => {
  const ss = ["bismuth", "ninja", "fighter-jet", "giant-eyeball", "glitch"];
  for (const s of ss) for (const id of IDS) {
    if (id === s) continue;
    const cap = E.starterCap(s, id);
    assert.ok(cap >= 3 && cap <= 20);
    if (ss.includes(id)) assert.equal(cap, 10);
    assert.ok(E.baseStars(s, id) <= cap, `${s}+${id} exceeds cap ${cap}`);
  }
});

function sampleDoubles(count, seed) {
  const rnd = prng(seed), out = [];
  for (let k = 0; k < count; k++) {
    const [a, b] = pick(rnd, PAIRS), [c, d] = pick(rnd, PAIRS);
    out.push([
      { ...(rnd() < 0.5 ? { dad: a, mom: b } : { dad: b, mom: a }), shiny: pick(rnd, SHINIES), palette: palette(rnd) },
      { ...(rnd() < 0.5 ? { dad: c, mom: d } : { dad: d, mom: c }), shiny: pick(rnd, SHINIES), palette: palette(rnd) }
    ]);
  }
  return out;
}

function checkDouble(h1, h2, label) {
  const entry = R.dfMake(h1, h2);
  const ref = R.incomeForDouble(entry);
  for (const [x, y] of [[h1, h2], [h2, h1]]) {
    const r = E.double(x, y);
    assert.equal(r.stars, ref.stars, `${label} stars`);
    assert.equal(r.income, ref.income, `${label} income`);
    assert.equal(r.roll, ref.bonus, `${label} bonus roll`);
    assert.equal(r.shiny, entry.shiny, `${label} mutation`);
    assert.deepEqual(r.parents, entry.fusionParents.flatMap(p => [p.dad, p.mom]), `${label} parent order`);
  }
}

test("double fusion: 20,000 sampled recipes match the Lua reference (stars, income, bonus, mutation, parent order)", () => {
  for (const [h1, h2] of sampleDoubles(20000, 42)) checkDouble(h1, h2, `${h1.dad}+${h1.mom} x ${h2.dad}+${h2.mom}`);
});

test("double fusion: ids that are prefixes of other ids (car/carrot, dragon/dragonfly, lava/lava-lamp)", () => {
  // Regression: the site used to compare "dad|mom" instead of the game's Palette.key "dad|mom|palette...",
  // which put these hybrids in the wrong order and changed the double's income.
  const rnd = prng(7);
  for (const [short, long] of [["car", "carrot"], ["dragon", "dragonfly"], ["lava", "lava-lamp"]]) {
    for (const other of ["owl", "zebra", "ant", "wolf"]) {
      for (const third of ["fox", "shark"]) {
        checkDouble({ dad: other, mom: short, palette: palette(rnd) }, { dad: other, mom: long, palette: palette(rnd) }, `${other}+${short} vs ${long}`);
        checkDouble({ dad: short, mom: third, palette: palette(rnd) }, { dad: long, mom: third, palette: palette(rnd) }, `${short} vs ${long}+${third}`);
      }
    }
  }
});

test("double fusion: specific prefix case changes income (documents the fixed bug)", () => {
  const A = { dad: "owl", mom: "car" }, B = { dad: "owl", mom: "carrot" };
  const ref = R.incomeForDouble(R.dfMake({ ...A, palette: {} }, { ...B, palette: {} }));
  const r = E.double(A, B);
  assert.deepEqual(r.parents, ["owl", "carrot", "owl", "car"], "game sorts 'owl|carrot|...' before 'owl|car|...'");
  assert.equal(r.income, ref.income);
});

test("double fusion: bonus is 1-5, capped by the weaker hybrid at 3/9/15/21/29 stars", () => {
  const steps = lo => (lo >= 29 ? 5 : lo >= 21 ? 4 : lo >= 15 ? 3 : lo >= 9 ? 2 : lo >= 3 ? 1 : 0);
  for (const [h1, h2] of sampleDoubles(5000, 99)) {
    const r = E.double(h1, h2);
    const lo = Math.min(...r.parentStars);
    assert.ok(r.roll >= 1 && r.roll <= 5);
    assert.equal(r.steps, steps(lo));
    assert.equal(r.bonus, Math.min(r.roll, steps(lo)));
    assert.equal(r.stars, Math.max(...r.parentStars) + r.bonus + r.special);
    assert.ok(r.stars <= 38);
  }
  // boundary values of the step table
  for (const [lo, want] of [[3, 1], [8, 1], [9, 2], [14, 2], [15, 3], [20, 3], [21, 4], [28, 4], [29, 5], [30, 5]]) assert.equal(steps(lo), want);
});

test("double fusion: dad/mom order of a hybrid can change income but never stars", () => {
  let incomeChanged = 0;
  for (const [h1, h2] of sampleDoubles(2000, 5)) {
    const a = E.double(h1, h2), b = E.double({ ...h1, dad: h1.mom, mom: h1.dad }, h2);
    assert.equal(a.stars, b.stars);
    if (a.income !== b.income) incomeChanged++;
  }
  assert.ok(incomeChanged > 0);
});

test("double fusion: rejects a hybrid with the same dad and mom (the game refuses it)", () => {
  assert.throws(() => E.double({ dad: "owl", mom: "owl" }, { dad: "fox", mom: "ant" }));
});

test("mutation odds match ShinyRules.odds / effectiveOdds", () => {
  for (const t of R.SHINY_ORDER) for (let s = 1; s <= 40; s++) for (const f of [1, 2, 5, 10, 11, 0.5]) {
    assert.ok(Math.abs(E.shinyOdds(t, s, f) - R.effectiveOdds(t, s, f)) < 1e-9, `${t} ${s} ${f}`);
  }
});

test("sell value is 10x income (SellRules)", () => {
  for (const [a, b] of PAIRS.slice(0, 500)) { const r = E.single(a, b); assert.equal(E.sellValue(r.income), R.sellValue(r.income)); }
});

test("money format matches CreatureIncome.Money.format (truncates, drops trailing zeros)", () => {
  const cases = { 0: "0", 7: "7", 251: "251", 999: "999", 1000: "1K", 1050: "1.05K", 38340: "38.34K", 38349: "38.34K", 38300: "38.3K",
    999999: "999.99K", 1000000: "1M", 33450000: "33.45M", 879029: "879.02K", 1e15: "1Qa", 6000000000000000: "6Qa", 767999999999: "767.99B" };
  for (const [v, want] of Object.entries(cases)) { assert.equal(E.formatMoney(Number(v)), want, v); assert.equal(R.moneyFormat(v), want, `ref ${v}`); }
  const rnd = prng(3);
  for (let k = 0; k < 20000; k++) {
    const v = Math.floor(10 ** (rnd() * 16));
    assert.equal(E.formatMoney(v), R.moneyFormat(String(v)), String(v));
  }
  for (const [a, b] of PAIRS) { const r = E.single(a, b, "chaos"); assert.equal(E.money(r.income), "$" + R.moneyFormat(String(r.income)) + "/s"); }
});

test("level format matches CreatureLevelFormat", () => {
  for (const [v, want] of [[1, "1"], [0, "1"], [999, "999"], [1000, "1k"], [2229999, "2.22M"], [12345, "12.3k"], [1234, "1.23k"], [123456, "123k"], [500000000, "500,000,000 (MAX)"]]) {
    assert.equal(E.formatLevel(v), want); assert.equal(R.levelFormat(v), want);
  }
  const rnd = prng(11);
  for (let k = 0; k < 20000; k++) { const v = Math.floor(10 ** (rnd() * 9)); assert.equal(E.formatLevel(v), R.levelFormat(v), String(v)); }
});

// Player-reported in-game observation (from the project README, not re-checked in-game for this audit).
// It is the only expected value here that doesn't come from reading the Lua.
test("reported in-game observation: Owl + Spider (Golden) = 10 stars, $251/s", () => {
  const r = E.single("owl", "spider", "golden");
  assert.equal(r.stars, 10);
  assert.equal(r.income, 251);
  assert.equal(E.money(r.income), "$251/s");
});
