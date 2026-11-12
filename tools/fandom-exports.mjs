// Regenerates the Fandom wiki tables from the site's engine.
// Usage: node tools/fandom-exports.mjs   (writes fandom_*.txt in the repo root)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { single, money, hybridName } from "../assets/js/engine.js";
import { SHINIES, SHINY_ORDER } from "../assets/js/gamedata.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets/data/catalog.json"), "utf8"));
const NAME = Object.fromEntries(catalog.map(c => [c.id, c.name]));
const ids = catalog.map(c => c.id);

const combos = [];
for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
  const r = single(ids[i], ids[j]);
  combos.push({ ...r, formula: `${NAME[r.dad]} + ${NAME[r.mom]}`, hybrid: hybridName(r.dad, r.mom) || `${NAME[r.dad]}-${NAME[r.mom]}` });
}
const row = (c, rank) => `|-\n${rank ? `| #${rank} || ` : "| "}${c.hybrid} || ${c.formula} || data-sort-value="${c.stars}" | ${c.stars}★ || data-sort-value="${c.income}" | ${money(c.income)} || Standard || Fusion\n`;
const footer = "[[Category:Game Guides]]\n[[Category:Fusions]]\n[[Category:Database]]\n";
const mechanics = SHINY_ORDER.map(s => `* '''${SHINIES[s].name}:''' +${SHINIES[s].bonus}★ to final roll`).join("\n");

const top = combos.filter(c => c.stars >= 10).sort((a, b) => b.income - a.income || b.stars - a.stars);
const maxStars = Math.max(...combos.map(c => c.stars));
let topWiki = `{{DISPLAYTITLE:Fusion Database - Top Single Hybrids}}

The '''Top Single Hybrids''' table lists the highest-yielding single fusion combinations in ''Impossible Animals'' (10★ to ${maxStars}★), sorted by standard cash-per-second income.

== Community Tools ==
* '''[https://impossible-animals-wiki.vercel.app Impossible Animals Wiki]''' — 3D fusion previews, exact stars and income, double fusions and best partners.
* '''[https://discord.gg/mXKUsgmUD3 Impossible Animals Community Discord]''' — Share discoveries and coordinate trades.

== Top Tier Single Fusions (10★ to ${maxStars}★) ==

{| class="wikitable sortable"
! Rank !! Hybrid !! Parents !! Stars !! Income shown !! Variant !! Method / origin
`;
top.forEach((c, i) => { topWiki += row(c, i + 1); });
topWiki += `|}\n\n${footer}`;
fs.writeFileSync(path.join(root, "fandom_fusion_top_combos_summary.txt"), topWiki, "utf8");

let fullWiki = `{{DISPLAYTITLE:Fusion Database - Complete Single Hybrids (All ${combos.length} Combos)}}

'''Fusion Database''' documents all ${combos.length} single hybrid combinations across all ${ids.length} base animals in ''Impossible Animals''. Every combination is deterministic: the game hashes the two animal names to pick the star roll and income.

== Community Tools ==
* '''[https://impossible-animals-wiki.vercel.app Impossible Animals Wiki]''' — 3D fusion previews, exact stars and income, double fusions and best partners.
* '''[https://discord.gg/mXKUsgmUD3 Impossible Animals Community Discord]''' — Share discoveries and coordinate trades.

== Mechanics Quick Reference ==
${mechanics}

`;
for (const id of ids) {
  const list = combos.filter(c => c.dad === id || c.mom === id).sort((a, b) => b.stars - a.stars || b.income - a.income);
  fullWiki += `== ${NAME[id]} Fusions ==\n\n{| class="wikitable sortable"\n! Hybrid !! Parents !! Stars !! Income shown !! Variant !! Method / origin\n`;
  list.forEach(c => { fullWiki += row(c); });
  fullWiki += "|}\n\n";
}
fullWiki += footer;
fs.writeFileSync(path.join(root, "fandom_fusion_database_all_combos.txt"), fullWiki, "utf8");
console.log(`${combos.length} combos across ${ids.length} animals, ${top.length} at 10★+`);
