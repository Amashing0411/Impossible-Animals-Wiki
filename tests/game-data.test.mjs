// Dataset tests.
//  1. Internal consistency of the site's data (always runs).
//  2. The site's constants vs the game dump (runs when IA_DUMP points at ia_dump/).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as G from "../assets/js/gamedata.js";
import * as E from "../assets/js/engine.js";
import { DUMP, skipNoDump, luaSource, luaTableAfter, dumpJSON } from "./helpers/lua-dump.mjs";

const read = p => fs.readFileSync(new URL(p, import.meta.url), "utf8");
const CATALOG = JSON.parse(read("../assets/data/catalog.json"));
const IDS = CATALOG.map(c => c.id);
const ID_SET = new Set(IDS);

// ---------- 1. internal consistency ----------
test("catalog: unique ids and names, an icon file for every animal", () => {
  assert.equal(new Set(IDS).size, IDS.length, "duplicate ids");
  assert.equal(new Set(CATALOG.map(c => c.name)).size, CATALOG.length, "duplicate names");
  for (const id of IDS) assert.ok(fs.existsSync(new URL(`../assets/icons/${id}.webp`, import.meta.url)), `missing icon for ${id}`);
});

test("every id referenced by the site's data exists in the catalog", () => {
  const refs = [...Object.keys(G.SPECIAL_BONUS), ...G.STARTER_SPECIALS, ...G.CLASSIC_STARTERS, ...G.BIOMES.flatMap(b => b.rewards), ...Object.keys(G.RELEASES)];
  for (const id of refs) assert.ok(ID_SET.has(id), `unknown id ${id}`);
  for (const k of E.KNOWN_NAME_KEYS) {
    const [a, b] = k.split("+");
    assert.ok(ID_SET.has(a) && ID_SET.has(b), `bad hybrid name key ${k}`);
    assert.equal(k, [a, b].sort().join("+"), `hybrid name key not sorted: ${k}`);
  }
});

test("each Wild animal belongs to exactly one biome", () => {
  const seen = new Map();
  for (const b of G.BIOMES) for (const id of b.rewards) { assert.ok(!seen.has(id), `${id} in ${seen.get(id)} and ${b.name}`); seen.set(id, b.name); }
});

test("star weights sum to 1,000,000 and income ranges cover every reachable star count (3..38)", () => {
  assert.equal(G.WEIGHTS.reduce((a, b) => a + b, 0), 1000000);
  let prevHi = 0;
  for (let s = 3; s <= 38; s++) {
    const r = G.INCOME_RANGES[s];
    assert.ok(r, `no range for ${s}`);
    assert.ok(r[0] <= r[1] && r[0] > prevHi, `range ${s} overlaps or is inverted`);
    prevHi = r[1];
  }
  // max single: 20 roll + 10 chaos + 3 special = 33; max double: 30 + 5 + 3 = 38
  assert.equal(G.MAX_STARS, 38);
});

test("special animals: the catalog's special flag matches FusionRating.SPECIAL_BONUS", () => {
  assert.deepEqual(CATALOG.filter(c => c.element).map(c => c.id).sort(), Object.keys(G.SPECIAL_BONUS).sort());
});

// ---------- 2. against the game dump ----------
const t = (name, fn) => test(name, { skip: skipNoDump }, fn);

t("dump: FusionRating weights, starter specials, classic starters, special bonuses", () => {
  const src = luaSource("FusionRating");
  assert.deepEqual(luaTableAfter(src, "local v_u_3 = table.freeze("), G.WEIGHTS);
  assert.deepEqual(Object.keys(luaTableAfter(src, "local v_u_4 = table.freeze(")).sort(), [...G.STARTER_SPECIALS].sort());
  assert.deepEqual(luaTableAfter(src, "local v_u_5 = table.freeze("), G.CLASSIC_STARTERS);
  assert.deepEqual(luaTableAfter(src, "local v_u_46 = table.freeze("), G.SPECIAL_BONUS);
  assert.match(src, /"ImpossibleAnimals:stars:v1:seed:" \.\. 67673/);
});

t("dump: CreatureIncome ranges and hash seeds", () => {
  const src = luaSource("CreatureIncome");
  const ranges = luaTableAfter(src, '["ranges"] = table.freeze(');
  assert.deepEqual(Object.fromEntries(Object.entries(ranges).map(([k, v]) => [k, v])), Object.fromEntries(Object.entries(G.INCOME_RANGES).map(([k, v]) => [k, v])));
  assert.match(src, /"ImpossibleAnimals:income:v1:seed:67673:"/);
  assert.match(src, /v11 = \(v11 \* 33 \+ string\.byte\(v10, v12\)\) % 2147483647/);
});

t("dump: income code still ignores charms and levels (re-verify the wiki if this fails)", () => {
  const src = luaSource("CreatureIncome");
  const income = src.slice(0, src.indexOf("local v_u_40 = {")); // forEntry + calculate, before the Money helpers
  assert.doesNotMatch(income, /charm|Charm|level|Level|Treadmill/);
  const tread = luaSource("TreadmillRules");
  assert.match(tread, /require\(script\.Parent\.CharmRules\)\.multiplier/);
  assert.match(tread, /v_u_1\.rates\[v_u_1\.level\(p9\.treadmillLevel\)\] \* \(v11 \+ v13 - 1\)/);
  assert.match(luaSource("CharmShopUI"), /levels<br \/>while training/);
});

t("dump: ShinyRules types, order, friend multiplier, first gold fusion", () => {
  const src = luaSource("ShinyRules");
  const types = luaTableAfter(src, "local v2 = {");
  for (const [k, v] of Object.entries(G.SHINIES)) {
    assert.equal(types[k].name, v.name); assert.equal(types[k].bonus, v.bonus); assert.equal(types[k].denominator, v.denominator);
    assert.deepEqual(types[k].colors, v.colors);
  }
  assert.deepEqual(luaTableAfter(src, '["order"] = {'), G.SHINY_ORDER);
  assert.match(src, new RegExp(`\\["FRIEND_MULTIPLIER"\\] = ${G.FRIEND_MULTIPLIER},`));
  assert.match(src, new RegExp(`\\["FIRST_GOLD_FUSION"\\] = ${G.FIRST_GOLD_FUSION},`));
});

t("dump: CharmRules tiers (name, training multiplier, cash, robux, colour)", () => {
  const rows = luaTableAfter(luaSource("CharmRules"), "local v2 = {");
  assert.equal(rows.length, G.CHARMS.length);
  rows.forEach((r, i) => {
    const c = G.CHARMS[i];
    assert.deepEqual([r[0], r[1], r[2], r[3], "#" + r[5]], [c.name, c.multiplier, c.cash, c.robux, c.color]);
  });
});

t("dump: TreadmillRules rates, prices, EXP per level, level cap; TreadmillMultipliers max tier", () => {
  const src = luaSource("TreadmillRules");
  assert.deepEqual(luaTableAfter(src, '["rates"] = table.freeze('), G.TREADMILL_RATES);
  assert.deepEqual(luaTableAfter(src, '["prices"] = table.freeze('), G.TREADMILL_PRICES);
  assert.match(src, new RegExp(`\\["EXP_PER_LEVEL"\\] = ${G.EXP_PER_LEVEL},`));
  assert.match(src, new RegExp(`\\["CREATURE_LEVEL_CAP"\\] = ${G.MAX_LEVEL},`));
  assert.match(luaSource("TreadmillMultipliers"), new RegExp(`\\["MAX_TIER"\\] = ${G.TREADMILL_MAX_SPEED_TIER},`));
  assert.match(luaSource("TreadmillMultipliers"), /return 2 \^ v_u_1\.tier\(p9\)/);
});

t("dump: SellRules = income x 10", () => {
  assert.match(luaSource("SellRules"), new RegExp(`forEntry\\(p2\\) \\* ${G.SELL_MULTIPLIER}\\b`));
});

t("dump: PenEconomy upgrade prices", () => {
  const prices = luaTableAfter(luaSource("PenEconomy"), '["prices"] = table.freeze(');
  assert.deepEqual(Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v])), Object.fromEntries(Object.entries(G.PEN_PRICES).map(([k, v]) => [k, v])));
  assert.match(luaSource("OfflineEarningsRules"), new RegExp(`\\["MULTIPLIER"\\] = ${G.OFFLINE_MULTIPLIER_PASS},`));
});

t("dump: WildRules biomes (names, difficulties, recommended level, rewards, reset) and token chances", () => {
  const src = luaSource("WildRules");
  assert.deepEqual(luaTableAfter(src, '["names"] = {'), G.BIOMES.map(b => b.name));
  assert.deepEqual(luaTableAfter(src, '["difficulties"] = {'), G.BIOMES.map(b => b.difficulty));
  assert.deepEqual(luaTableAfter(src, '["recommended"] = {'), G.BIOMES.map(b => b.recommended));
  const rewards = JSON.parse(src.match(/JSONDecode\("(.*?)"\)/)[1].replace(/\\"/g, '"'));
  assert.deepEqual(rewards, G.BIOMES.map(b => b.rewards));
  assert.match(src, new RegExp(`\\["RESET_SECONDS"\\] = ${G.WILD_RESET_SECONDS},`));
  assert.match(src, /\["expiresAt"\] = p31 \+ v_u_62\.RESET_SECONDS/, "reset is relative to when the cycle was rolled");
  assert.match(luaSource("DoubleFusionRules"), /return p12 <= 4 and 0\.04 or \(p12 <= 9 and 0\.125 or 0\.18\)/);
  G.BIOMES.forEach(b => assert.equal(b.tokenChance, b.tier <= 4 ? 0.04 : b.tier <= 9 ? 0.125 : 0.18));
});

t("dump: AnimalReleases schedule", () => {
  const src = luaSource("AnimalReleases");
  const sched = {};
  for (const m of src.matchAll(/\["id"\] = "([^"]+)",[\s\S]*?fromUniversalTime\((\d+), (\d+), (\d+), (\d+)\)/g)) {
    const [, id, y, mo, d, h] = m;
    sched[id] = new Date(Date.UTC(+y, +mo - 1, +d, +h)).toISOString().replace(".000Z", "Z");
  }
  assert.deepEqual(sched, G.RELEASES);
});

t("dump: AnimalUnlocks starters", () => {
  assert.deepEqual(luaTableAfter(luaSource("AnimalUnlocks"), '["starters"] = table.freeze('), G.STARTERS);
});

t("dump: every English name override is in the site's name list", () => {
  const en = luaTableAfter(luaSource("FusionNameOverrides"), '["en"] = {');
  for (const [k, v] of Object.entries(en)) {
    const [a, b] = k.split("+");
    assert.equal(E.hybridName(a, b), v, k);
  }
});

t("dump: catalog.json and rules.json match the game's data files", () => {
  const cat = dumpJSON("Catalog.json");
  assert.deepEqual(cat.map(c => [c.id, c.name, !!c.special]), CATALOG.map(c => [c.id, c.name, c.element]));
  assert.deepEqual(dumpJSON("Rules.json"), JSON.parse(read("../assets/data/rules.json")));
});

if (DUMP) test("dump folder in use", () => assert.ok(DUMP));
