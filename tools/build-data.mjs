// Builds the site's data files from an in-game dump (ia_dump/ produced by the dump script).
// Usage:  node tools/build-data.mjs <path-to-ia_dump> [--icons]
//   writes assets/data/shapes.json, assets/data/rules.json, assets/data/catalog.json
//   --icons also downloads each animal's official catalog icon into assets/icons/<id>.png
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dump = process.argv[2];
if (!dump || !fs.existsSync(path.join(dump, "data"))) {
  console.error("Usage: node tools/build-data.mjs <ia_dump folder> [--icons]");
  process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(dump, "data");
const outDir = path.join(root, "assets", "data");
fs.mkdirSync(outDir, { recursive: true });

const read = f => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));
const round = v => Array.isArray(v) ? v.map(round) : (typeof v === "number" ? Math.round(v * 1e5) / 1e5 : v);

const KEEP = ["key", "type", "name", "parent", "parentAnchor", "parentFace", "extrusionFace", "kind", "rotation", "scale",
  "palette", "symmetrical", "autoOrient", "dominantSize", "dominantRotation", "dominantProportions", "useWorldRotationOnMerge", "hidden"];

const catalog = read("Catalog.json");
const shapes = {};
const cat = [];
for (const c of catalog) {
  const a = read(`Animal_${c.id}.json`);
  const limbs = a.limbs.map(l => {
    const o = {};
    for (const k of KEEP) if (l[k] !== undefined && l[k] !== false) o[k] = round(l[k]);
    return o;
  });
  shapes[c.id] = { palette: a.palette, dominantColorScheme: !!a.dominantColorScheme, limbs };
  if (a.special) shapes[c.id].special = a.special.type;
  cat.push({ id: c.id, name: c.name, image: c.image, element: !!c.special, body: a.special ? "special" : "limbs" });
}
fs.writeFileSync(path.join(outDir, "shapes.json"), JSON.stringify(shapes));
fs.writeFileSync(path.join(outDir, "rules.json"), JSON.stringify(read("Rules.json")));
fs.writeFileSync(path.join(outDir, "catalog.json"), JSON.stringify(cat));
console.log(`shapes: ${Object.keys(shapes).length} animals, ${cat.filter(c => c.body === "special").length} special bodies`);

if (process.argv.includes("--icons")) {
  const iconDir = path.join(root, "assets", "icons");
  fs.mkdirSync(iconDir, { recursive: true });
  const ids = cat.map(c => ({ id: c.id, asset: c.image.replace(/\D/g, "") }));
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    let pending = batch;
    for (let attempt = 0; attempt < 6 && pending.length; attempt++) {
      const url = `https://thumbnails.roblox.com/v1/assets?assetIds=${pending.map(b => b.asset).join(",")}&size=250x250&format=Png&isCircular=false`;
      const res = await (await fetch(url)).json();
      const next = [];
      for (const b of pending) {
        const d = res.data.find(x => String(x.targetId) === b.asset);
        if (d && d.state === "Completed") {
          const buf = Buffer.from(await (await fetch(d.imageUrl)).arrayBuffer());
          fs.writeFileSync(path.join(iconDir, `${b.id}.png`), buf);
        } else next.push(b);
      }
      pending = next;
      if (pending.length) await new Promise(r => setTimeout(r, 2500));
    }
    if (pending.length) console.warn("icons not ready:", pending.map(p => p.id).join(", "));
  }
  console.log("icons done");
}
