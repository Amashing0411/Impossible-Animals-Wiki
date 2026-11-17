# Notes for AI assistants and contributors

This wiki's value is accuracy. Before changing any game number or mechanic description:

- Read `docs/MECHANICS.md`. It lists every formula, its source script and its verification status.
- Only state a mechanic as fact if a game script implements it. If it runs on the server or you can't find it,
  label it as an estimate or leave it out. Never invent formulas, multipliers, odds, names or sources.
- Charms and levels do **not** change $/s (`CreatureIncome` never reads them). Charms speed up training only.
- All game maths lives in `assets/js/engine.js`; constants live in `assets/js/gamedata.js`. Pages call the engine.
- Expected test values come from `tests/reference/lua-reference.mjs` (re-read from the Lua), never from `engine.js`.
- Run `npm test` (set `IA_DUMP` to the ia_dump folder to also check the constants against the game files).
