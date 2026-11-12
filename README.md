<div align="center">

# 🧬 Impossible Animals Wiki
### 3D Fusion Lab · Double Fusion · Best Partners · The Wild

*Unofficial community wiki and fusion toolkit for the Roblox game [Impossible Animals](https://www.roblox.com/games/119929094294460/Impossible-Animals).*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAmashing0411%2FImpossible-Animals-Wiki)
[![Roblox](https://img.shields.io/badge/Roblox-Impossible%20Animals-10b981?style=flat-square&logo=roblox)](https://www.roblox.com/games/119929094294460/Impossible-Animals)
[![License: MIT](https://img.shields.io/badge/License-MIT-fbbf24?style=flat-square)](LICENSE)

</div>

---

## What's inside

| Section | What it does |
| :--- | :--- |
| 🧬 **Fusion Lab** | Pick a dad and a mom like in-game, then spin the hybrid in **3D**. Shows the exact stars, $/s, mutation odds and charm earnings. |
| ⚡ **Double Fusion** | Pick two hybrids, press **DOUBLE FUSE**, see the 3D result, stars, income and how the bonus was capped. |
| 💞 **Best Partners** | Every partner for your animal, ranked, with 3D thumbnails. Can filter to animals you own. |
| 🏆 **Top Hybrids** | Best single fusions out of all 5,565 pairs, plus the best double fusions. |
| 🐾 **Animals** | All 106 animals with official icons, 3D models, where to get them, and release countdowns. |
| 🗺️ **The Wild** | All 14 biomes: difficulty, recommended level, reward lists, fusion-token chance and a live 5-minute reset timer. |
| 📖 **Guide** | Star odds, income ranges, mutations, charms, pen upgrades, double-fusion and starter-special rules. |
| 🏡 **My Pen** | Saved hybrids and owned animals (stored in your browser), with export/import. |

Keyboard: <kbd>1</kbd>–<kbd>8</kbd> switch sections, <kbd>/</kbd> search, <kbd>?</kbd> help, <kbd>Esc</kbd> close.

## How it works

Everything is ported from the game's own client modules:

- **Stars & income** (`assets/js/engine.js`): `FusionRating`, `CreatureIncome`, `ShinyRules` and `DoubleFusionRules`. These cover the Jenkins-hash star roll, the starter-special star cap, the special bonus, mutation bonuses, the 1–5 double bonus with its 3/9/15/21/29 cap, and DJB2 double-fusion income. Checked against in-game hybrids: Owl + Spider (Golden) gives 10★ $251/s, and the Cheeseburger + Solar Eclipse double (Diamond) gives 25★ $33.45M/s.
- **3D creatures** (`assets/js/creature.js`): every animal is a tree of coloured boxes, rebuilt from the game's `Animal_*` data. `CreatureMath.rig` lays the boxes out. `FusionGenerator.merge` combines two parents' limb trees, the same way the game builds fusions instead of storing them. `Palette` handles the six colour styles, and `ShinyAppearance` handles mutation recolours.
- **Game data** (`assets/js/gamedata.js`): biomes, rewards, release schedule, charms, mutations and pen prices.

Animals with special animated bodies (Black Hole, Cactus, Ninja…) show their official icon. When fused with a regular animal, the regular body is shown with a note.

## Project structure

```
index.html              App shell (hash-routed single page, no build step)
assets/css/game.css     Game-styled UI
assets/js/app.js        Pages & UI
assets/js/engine.js     Stars / income / double fusion maths
assets/js/creature.js   3D rig, fusion merge, palettes, Three.js viewer
assets/js/gamedata.js   Constants from the game
assets/data/            shapes.json (animal bodies), rules.json, catalog.json
assets/icons/           Official animal icons
api/feedback.js         Vercel function: feedback form → Discord
tools/build-data.mjs    Rebuild assets/data (and icons) from a new game dump
tools/fandom-exports.mjs  Regenerate the fandom_*.txt wiki tables
```

## Updating after a game update

```bash
node tools/build-data.mjs <path-to-ia_dump> --icons
node tools/fandom-exports.mjs
```
Then update `assets/js/gamedata.js` if biomes, releases, charms or specials changed.

## Local development

```bash
npx serve .
```

Deploy on Vercel with the **Other** preset, no build command, output directory `.`.

## Credits

* Original creator: **@TatayDigs** on Roblox
* Maintainer: **[@Amashing0411](https://github.com/Amashing0411)**
* Fan project, not affiliated with or endorsed by Roblox or the developers of Impossible Animals. Animal icons and models belong to their creators.
