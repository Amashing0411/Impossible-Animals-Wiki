# Game mechanics registry

Every number the wiki shows comes from `assets/js/engine.js` (formulas) and `assets/js/gamedata.js`
(constants). This file lists each formula, what it reads, where it comes from, and how sure we are.

**Status labels**

| Label | Meaning |
| :-- | :-- |
| **Verified** | Read directly from the game's client scripts, and `npm test` checks the site against an independent port of that code. |
| **Estimated** | Uses the game's formula, but one input is decided on the game's servers and we had to assume it. |
| **Unverified** | Not supported by the scripts we have. Don't present it as fact. |
| **Outdated** | Known to come from an older game version. (None right now.) |

Source scripts are the decompiled `ReplicatedStorage.ImpossibleAnimals.*` modules in the `ia_dump/`
folder produced by the dump script (dumped 2026-11-12). Server scripts are **not** in the dump.

## Formulas

### Base star roll — Verified
- **Inputs:** the two parent ids (order doesn't matter).
- **Source:** `FusionRating.calculate`, `FusionRating.weights`.
- **How:** Jenkins one-at-a-time hash of `"ImpossibleAnimals:stars:v1:seed:67673:" .. #lo .. ":" .. lo .. #hi .. ":" .. hi`
  (ids sorted byte-wise), divided by 2^32, times 1,000,000, bucketed by the 18 weights → 3★–20★.
- **Notes:** the decompiled loops show `continue` where the original code breaks out with the found tier;
  any other reading would put every roll on the last tier.

### Starter-special cap — Verified
- **Inputs:** parent ids.
- **Source:** `FusionRating.calculate` / `capFor`, `STARTER_SPECIALS`, the 26 classic starters.
- **How:** if exactly one parent is Bismuth, Ninja, Fighter Jet, Giant Eyeball or Glitch, the roll is
  scaled into the range below the other animal's best roll with any classic starter. Two starter
  specials, or a starter special with a classic starter, cap at 10★.

### Special bonus — Verified
- **Inputs:** parent ids. **Source:** `FusionRating.SPECIAL_BONUS`, `specialBonus`.
- **How:** the highest bonus among the parents (not the sum). Doubles count it once over all 4 parents.

### Mutation bonus — Verified
- **Inputs:** mutation. **Source:** `ShinyRules.types`, `ShinyRules.stars`.
- Golden +2, Diamond +4, Iridescent +6, Chaos +10.

### Single hybrid income ($/s) — Verified
- **Inputs:** the two parent ids and the mutation. **Nothing else.**
- **Source:** `CreatureIncome.calculate`, `CreatureIncome.ranges`.
- **How:** stars = roll + mutation + special; Jenkins hash of
  `"ImpossibleAnimals:income:v1:seed:67673:"` + sorted ids + mutation (or `none`) picks a whole number in that
  star tier's range. Deterministic, never random.
- **Not inputs:** charm, level, treadmill, pen. (`npm test` fails if the dumped `CreatureIncome` ever mentions them.)
- **Limitation:** `PenLabels` and `CollectionOrder` prefer an `income` value stored on the creature if the
  server sent one. We can't see whether the server ever stores a different number.

### Double fusion stars — Verified
- **Inputs:** both hybrids' parents and mutations. **Source:** `DoubleFusionRules.computed`, `bonus`, `stars`.
- **How:** each hybrid = roll + its mutation (no special). Take the stronger one, add a bonus roll of 1–5
  (Jenkins hash of both sorted recipes) capped by how many of 3/9/15/21/29 the weaker hybrid reaches, then
  add the best special bonus over all four parents once.

### Double fusion income — Verified
- **Inputs:** the 4 parents in stored order + the best mutation. **Source:** `CreatureIncome.forEntry`,
  `DoubleFusionRules.make`, `Generation.Palette.key`.
- **How:** DJB2 (mod 2^31−1) of `dad1|mom1|dad2|mom2|mutation` picks a number in the star tier's range.
  Which hybrid comes first is decided by `Palette.key` = `dad|mom|color1|…|eyecolor`. The site compares
  `dad|mom|`, which gives the same order whenever the two recipes differ. When they're identical the palette
  decides, but then the order doesn't change the result.
- **Note:** swapping a hybrid's dad and mom can change a double's income (never its stars).

### Double fusion inheritance — Verified
- **Source:** `DoubleFusionRules.make`. The result keeps the best mutation (`bestShiny`), the higher charm tier
  and the higher level (capped at 500,000,000). None of these except the mutation feed stars or income.

### Charms — Verified
- **What they do:** speed up training. **Source:** `CharmRules`, `TreadmillRules.rate`, Charm Shop label
  "x1.5 levels while training" (`CharmShopUI`).
- **They do not change $/s.** `CharmRules.multiplier` is only read by `TreadmillRules.rate`.

### Training speed (EXP/s) — Verified
- **Inputs:** treadmill level (1–10), speed-boost tier (0–12), charm tier, creature level.
- **Source:** `TreadmillRules.rate`, `TreadmillMultipliers.multiplier`, `CharmRules.multiplier`.
- **How:** `rates[treadmillLevel] × (2^speedTier + charmMultiplier − 1)`; 0 at level 500,000,000.
  100 EXP = 1 level (`TreadmillRules.advance`). The charm adds to the boost; it doesn't multiply it.
- **Limitation:** the treadmill tick itself runs on the server; the client shows this same rate as "XP/s".

### Sell value — Verified
- **Source:** `SellRules.value` = `floor(income × 10)`.

### Mutation odds — Estimated
- **Source:** `ShinyRules.odds`, `effectiveOdds`, `roll`.
- **How:** `denominator × ((clamp(stars, 3, 20) − 3) × 19/17 + 1)`, divided by the friend multiplier
  (capped at 10 and at the combined odds).
- **Why estimated:** `ShinyRules.roll` is called by the server. We assume it passes the hybrid's stars before
  the mutation (roll + special). The friend multiplier comes from a server attribute (`FriendShinyMultiplier`).
- **Early fusions:** `roll` returns no mutation while the fusion counter is below 3 and forces Golden when it
  equals 3. Whether the counter is 0- or 1-based isn't visible, so the wiki doesn't say "3rd fusion".

### The Wild — Verified (with one inference)
- **Source:** `WildRules`, `DoubleFusionRules.tokenChance`.
- Biome names, difficulty, recommended level, reward lists: from `WildRules`.
- Reward cycle: `rotate` sets `expiresAt = now + 300` when a new cycle is rolled, so the timer is per player.
  The wiki doesn't show a shared countdown.
- Fusion token chance per biome per cycle: 4% (tiers 1–4), 12.5% (5–9), 18% (10–14).
- Wild strength: `stats(level, stars)` → power = 2^levelProgress(level) × starPower(stars).
- *Inference:* `rotate` skips ids in a set passed by the server; we read this as "animals you own".

### Number formatting — Verified
- `$` amounts follow `CreatureIncome.Money.format` (truncates to 2 decimals, drops trailing zeros: `$4.2K/s`).
- Levels follow `CreatureLevelFormat.format` (`2.22M`, `500,000,000 (MAX)`).

### Rankings — Verified (same formulas)
- Best Partners, Top Hybrids and suggestions all call `engine.js` (`rankSinglePartners`, `rankDoublePartners`,
  `topDoubles`). Top double fusions use an exact branch-and-bound search, tested against brute force.

### Animal sources — partly Unverified
- Starters: `AnimalUnlocks.starters` (Verified). Wild animals: `WildRules.rewards` (Verified); the shop's
  animal packs are built from the same lists (`AnimalShopOffers.build`).
- How the 20 special animals are obtained is **not** in the client scripts. The wiki says so.

### Hybrid names — partly Unverified
- English names are generated on the server. The wiki shows `FusionNameOverrides.en` (Verified) plus names
  players reported from screenshots (Unverified). Unknown names are never invented.

## Adding or changing a mechanic

1. Find the script that implements it. Quote the module and function in a comment and in this file.
2. Decompiled code can mislead: check loops with `continue`, swapped variables and missing server code.
   If the logic is on the server, label it **Estimated** or **Unverified** and say so on the page.
3. Put constants in `gamedata.js` and formulas in `engine.js`. Pages must not compute game numbers themselves.
4. Add the expected behaviour to `tests/reference/lua-reference.mjs` by re-reading the Lua, **not** by copying
   `engine.js`, and add a test. Add a dump check in `tests/game-data.test.mjs` for new constants.
5. Run `npm test` with `IA_DUMP` pointing at the dump.
6. If you can't verify something, don't ship a number for it. Say what is unknown.

## After a game update

```bash
node tools/build-data.mjs <path-to-ia_dump> --icons
IA_DUMP=<path-to-ia_dump> npm test
```

Any failing dump test means the game changed something the wiki relies on: re-read that module before
updating the constant.
