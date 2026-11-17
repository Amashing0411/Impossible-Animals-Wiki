// Regression tests for the reported bug: the Double Fusion card showed "Ember Charm x1.5: $57.51K/s".
// In the game, CreatureIncome never reads charmTier or level; CharmRules.multiplier only feeds
// TreadmillRules.rate (EXP while training), where it is ADDED to the speed boost.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as E from "../assets/js/engine.js";
import * as R from "./reference/lua-reference.mjs";

const read = p => fs.readFileSync(new URL(p, import.meta.url), "utf8");
const APP = read("../assets/js/app.js");
const ENGINE = read("../assets/js/engine.js");

test("income functions take no charm or level input", () => {
  assert.equal(E.single.length <= 3, true, "single(dad, mom, shiny)");
  assert.equal(E.double.length, 2, "double(hybridA, hybridB)");
  // extra fields on a hybrid (charm, level) must not change the result
  const plain = E.double({ dad: "owl", mom: "spider" }, { dad: "fox", mom: "shark" });
  const charmed = E.double({ dad: "owl", mom: "spider", charmTier: 10, level: 499999999 }, { dad: "fox", mom: "shark", charmTier: 1, level: 7 });
  assert.equal(charmed.income, plain.income);
  assert.equal(charmed.stars, plain.stars);
});

test("no page multiplies income by a charm", () => {
  assert.equal(/withCharm/.test(APP), false, "withCharm helper must not come back");
  assert.equal(/charmMultiplier\s*\(/.test(APP), false, "app.js must not call a charm multiplier");
  assert.equal(/with charm/i.test(APP), false, "no 'with charm' income labels");
  assert.equal(/charm[^.]{0,40}multipl\w* (a hybrid's )?income/i.test(APP), false, "no text claiming charms multiply income");
  assert.equal(/export const charmMultiplier/.test(ENGINE), false, "the ambiguous charmMultiplier export was renamed to charmTrainingMultiplier");
});

test("the guide says charms speed up training and don't change $/s", () => {
  assert.match(APP, /level up faster while training/);
  assert.match(APP, /It does not change \$\/s/);
});

test("training EXP/s matches TreadmillRules.rate for every treadmill level, speed tier and charm", () => {
  for (let lvl = 1; lvl <= 10; lvl++) for (let tier = 0; tier <= 12; tier++) for (let charm = 0; charm <= 10; charm++) {
    assert.equal(E.trainingExpPerSecond(lvl, tier, charm), R.treadmillRate({ treadmillLevel: lvl, treadmillMultiplierTier: tier }, { charmTier: charm }), `${lvl}/${tier}/${charm}`);
  }
});

test("charm adds to the speed boost (x2 speed + Ember x1.5 = x2.5, not x3)", () => {
  const base = E.trainingExpPerSecond(1, 0, 0);
  assert.equal(E.trainingExpPerSecond(1, 0, 1), base * 1.5);
  assert.equal(E.trainingExpPerSecond(1, 1, 1), base * 2.5);
  assert.equal(E.trainingExpPerSecond(10, 12, 10), 6000 * (4096 + 20 - 1));
});

test("training stops at the level cap", () => {
  assert.equal(E.trainingExpPerSecond(10, 12, 10, 500000000), 0);
  assert.equal(R.treadmillRate({ treadmillLevel: 10 }, { level: 500000000 }), 0);
});

test("levels per second = EXP/s / 100", () => {
  assert.equal(E.trainingLevelsPerSecond(3, 2, 4), E.trainingExpPerSecond(3, 2, 4) / 100);
});

test("README and Fandom exports don't claim charms change income", () => {
  for (const f of ["../README.md", "../tools/fandom-exports.mjs"]) {
    const s = read(f);
    assert.equal(/charm earnings|charm[^.\n]{0,40}(multipl|boost)\w*[^.\n]{0,20}income/i.test(s), false, f);
  }
});
