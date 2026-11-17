// Rankings (Best Partners, Top Hybrids, suggestions) must agree with brute force over the same
// formulas the calculators use. Brute force here is written independently of engine.topDoubles.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as E from "../assets/js/engine.js";
import * as R from "./reference/lua-reference.mjs";

const IDS = JSON.parse(fs.readFileSync(new URL("../assets/data/catalog.json", import.meta.url), "utf8")).map(c => c.id);
const pairsOf = ids => ids.flatMap((a, i) => ids.slice(i + 1).map(b => [a, b]));
const key = r => `${r.stars}:${r.income}`;

function bruteTopDoubles(pairs, k, shiny) {
  const hy = pairs.map(([a, b]) => ({ dad: a, mom: b, shiny }));
  const flip = h => ({ dad: h.mom, mom: h.dad, shiny });
  const rows = [];
  for (let i = 0; i < hy.length; i++) for (let j = i; j < hy.length; j++) {
    let best = null;
    for (const p of [hy[i], flip(hy[i])]) for (const q of [hy[j], flip(hy[j])]) {
      const ref = R.incomeForDouble(R.dfMake({ ...p, palette: {} }, { ...q, palette: {} }));
      if (!best || ref.income > best.income) best = ref;
    }
    rows.push(best);
  }
  return rows.sort((a, b) => b.stars - a.stars || b.income - a.income).slice(0, k);
}

test("Top Hybrids (double): exact search equals brute force on animal subsets", () => {
  const subsets = [
    IDS.slice(0, 28),
    IDS.filter((_, i) => i % 4 === 1),
    ["black-hole", "solar-eclipse", "glitch", "ninja", "car", "carrot", "lava", "lava-lamp", "owl", "spider", "gorilla", "glitter",
      "moose", "strawberry", "plasma", "triceratops", "warthog", "banana", "quadcopter", "wolf", "skeleton", "anglerfish"]
  ];
  for (const ids of subsets) for (const shiny of [null, "chaos"]) {
    const pairs = pairsOf(ids);
    const got = E.topDoubles(pairs, 40, shiny).map(key);
    const want = bruteTopDoubles(pairs, 40, shiny).map(key);
    assert.deepEqual(got, want, `${ids.length} animals, ${shiny}`);
  }
});

test("Top Hybrids (double): full-catalog results are real doubles, sorted, and at least as good as the old 140-hybrid shortlist", () => {
  const pairs = pairsOf(IDS);
  const top = E.topDoubles(pairs, 200, null);
  for (let i = 1; i < top.length; i++) assert.ok(top[i - 1].stars > top[i].stars || (top[i - 1].stars === top[i].stars && top[i - 1].income >= top[i].income));
  for (const r of top.slice(0, 50)) {
    const ref = R.incomeForDouble(R.dfMake({ ...r.hybrids[0], palette: {} }, { ...r.hybrids[1], palette: {} }));
    assert.equal(r.stars, ref.stars); assert.equal(r.income, ref.income);
  }
  // The previous implementation only paired the 140 strongest single hybrids.
  const singles = pairs.map(([a, b]) => E.single(a, b)).sort((a, b) => (b.base + b.mutation) - (a.base + a.mutation) || b.special - a.special).slice(0, 140);
  const old = [];
  for (let i = 0; i < singles.length; i++) for (let j = i; j < singles.length; j++) old.push(E.double(singles[i], singles[j]));
  old.sort((a, b) => b.stars - a.stars || b.income - a.income);
  for (let i = 0; i < 200; i++) assert.ok(top[i].stars > old[i].stars || (top[i].stars === old[i].stars && top[i].income >= old[i].income), `rank ${i + 1}`);
});

test("Best Partners (single): ranking equals brute force with the same single() used by the Fusion Lab", () => {
  for (const pet of ["owl", "glitch", "black-hole", "car"]) for (const shiny of [null, "golden"]) {
    const ranked = E.rankSinglePartners(pet, IDS, { shiny });
    const brute = IDS.filter(x => x !== pet).map(x => R.incomeCalculate(pet, x, shiny)).sort((a, b) => b.stars - a.stars || b.income - a.income);
    assert.deepEqual(ranked.map(key), brute.map(key));
    const byIncome = E.rankSinglePartners(pet, IDS, { shiny, sort: "income" });
    for (let i = 1; i < byIncome.length; i++) assert.ok(byIncome[i - 1].income >= byIncome[i].income);
  }
});

test("Best Partners (double): top partner is the best of all partner hybrids and both dad/mom orders", () => {
  const mine = { dad: "owl", mom: "spider", shiny: "golden" };
  const pairs = pairsOf(IDS.slice(0, 40));
  const ranked = E.rankDoublePartners(mine, pairs, { partnerShiny: null });
  let best = null;
  for (const [a, b] of pairs) for (const p of [{ dad: a, mom: b }, { dad: b, mom: a }]) {
    const ref = R.incomeForDouble(R.dfMake({ ...mine, palette: {} }, { ...p, palette: {} }));
    if (!best || ref.stars > best.stars || (ref.stars === best.stars && ref.income > best.income)) best = ref;
  }
  assert.equal(key(ranked[0]), key(best));
  // the double shown on a partner card is the same one the Double Fusion page computes
  const r = ranked[0];
  assert.equal(key(E.double(r.mine, r.partner)), key(r));
});

test("cross-page: My Pen, Fusion Lab and Top Hybrids all read the same memoised single()", () => {
  const a = E.single("owl", "spider", "golden"), b = E.single("owl", "spider", "golden");
  assert.equal(a, b);
  assert.ok(Object.isFrozen(a), "shared results can't be mutated by one page");
});
