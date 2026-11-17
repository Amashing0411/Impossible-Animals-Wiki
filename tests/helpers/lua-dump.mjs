// Reads constants straight out of the decompiled game dump (ia_dump/), so dataset tests compare the
// site against the game files rather than against itself.
// Point IA_DUMP at the dump folder (the one containing code/ and data/). Tests skip when it's missing.
import fs from "node:fs";
import path from "node:path";

export const DUMP = process.env.IA_DUMP && fs.existsSync(path.join(process.env.IA_DUMP, "code")) ? process.env.IA_DUMP : null;
export const skipNoDump = DUMP ? false : "IA_DUMP not set (path to the ia_dump folder): game-file comparison skipped";

export function luaSource(module) {
  return fs.readFileSync(path.join(DUMP, "code", `ReplicatedStorage.ImpossibleAnimals.${module}.lua`), "utf8");
}
export function dumpJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DUMP, "data", file), "utf8"));
}

/** Parses the Lua table constructor that starts at the first "{" after `anchor` in `src`. */
export function luaTableAfter(src, anchor) {
  const at = src.indexOf(anchor);
  if (at < 0) throw new Error(`anchor not found: ${anchor}`);
  return parseTable(src, src.indexOf("{", at)).value;
}

// Minimal parser for literal Lua tables: numbers, strings, booleans, nested tables, [k] = v, k = v.
// Anything else (function calls such as Color3.fromHex(...)) is captured as raw source text.
function parseTable(s, i) {
  if (s[i] !== "{") throw new Error("expected {");
  i++;
  const arr = [], obj = {};
  let isObj = false;
  const ws = () => { while (i < s.length && /[\s,;]/.test(s[i])) i++; };
  for (;;) {
    ws();
    if (s[i] === "}") { i++; break; }
    let key = null;
    if (s[i] === "[") {
      i++; const k = parseValue(); key = k; ws(); i++; // ]
      ws(); i++; // =
    } else {
      const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)/.exec(s.slice(i, i + 80));
      if (m) { key = m[1]; i += m[0].length; }
    }
    ws();
    const v = parseValue();
    if (key === null) arr.push(v); else { isObj = true; obj[key] = v; }
  }
  return { value: isObj ? Object.assign(obj, arr.length ? { _list: arr } : {}) : arr, end: i };
  function parseValue() {
    ws();
    if (s[i] === "{") { const r = parseTable(s, i); i = r.end; return r.value; }
    if (s[i] === '"') {
      let j = i + 1, out = "";
      while (s[j] !== '"') { if (s[j] === "\\") { out += s[j + 1]; j += 2; } else out += s[j++]; }
      i = j + 1; return out;
    }
    const num = /^-?\d+(\.\d+)?(e[+-]?\d+)?/i.exec(s.slice(i, i + 40));
    if (num && !/[A-Za-z_]/.test(s[i + num[0].length] || "")) { i += num[0].length; return Number(num[0]); }
    if (s.startsWith("true", i)) { i += 4; return true; }
    if (s.startsWith("false", i)) { i += 5; return false; }
    if (s.startsWith("nil", i)) { i += 3; return null; }
    // raw expression up to the next top-level , or }
    let depth = 0, j = i;
    for (; j < s.length; j++) {
      const c = s[j];
      if (c === "(" || c === "{") depth++;
      else if (c === ")" || c === "}") { if (depth === 0) break; depth--; }
      else if (c === "," && depth === 0) break;
    }
    const raw = s.slice(i, j).trim(); i = j; return { raw };
  }
}
