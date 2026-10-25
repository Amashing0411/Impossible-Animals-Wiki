# Impossible Animals Wiki

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAmashing0411%2FImpossible-Animals-Wiki)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-38bdf8?style=for-the-badge&logo=github)](https://amashing0411.github.io/Impossible-Animals-Wiki/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Game](https://img.shields.io/badge/Roblox-Impossible%20Animals-10b981?style=for-the-badge&logo=roblox)](https://www.roblox.com/games/119929094294460/Impossible-Animals)
[![License: MIT](https://img.shields.io/badge/License-MIT-fbbf24?style=for-the-badge)](LICENSE)

Unofficial community wiki and fusion toolkit for the Roblox game [Impossible Animals](https://www.roblox.com/games/119929094294460/Impossible-Animals).

---

## ⚡ 1-Click Deploy to Vercel

Deploy your own live instance of this Wiki with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAmashing0411%2FImpossible-Animals-Wiki)

---

## Features
- **Best Partner Matchmaker:** Select any pet to find its top 3 and full ranked list of dual fusion partner combos.
- **Dual Fusion Sandbox & Formula Lab:** Exact hash simulation matching the game engine's Jenkins One-At-A-Time hash with live step-by-step math inspector.
- **Global Leaderboard & Gen 1 Database:** All-time top dual fusions and all 2,926 single fusions across 77 animals.
- **Breeding Goals Planner:** Saved locally in your browser (`localStorage`) with aggregated ingredient checklists.
- **Roblox Chat Quick-Reply Helper ("TatayDigs Mode"):** One-click formatted replies for in-game chat queries.
- **Data Portability:** Inventory unlock tracker, JSON backup/restore, and CSV export.
- **Keyboard Shortcuts:**
  - `/` &mdash; Focus chat search
  - `1` &ndash; `5` &mdash; Switch tabs
  - `?` &mdash; Open help modal

---

## Project Structure
```
Impossible-Animals-Wiki/
├── index.html          # Main HTML entry point
├── vercel.json         # Vercel deployment configuration & caching
├── package.json        # NPM scripts & metadata
├── LICENSE             # MIT License
├── README.md           # Documentation
└── assets/
    ├── styles.css      # Theme & responsive design system
    ├── app.js          # Core fusion algorithms & calculations
    ├── extras.js       # Keyboard shortcuts & QoL features
    └── favicon.svg     # SVG Favicon
```

---

## Run Locally
No build step required. Open `index.html` directly in your browser, or run a local server:

```bash
# Using Node / npx
npx serve .

# Or using Python
python -m http.server 8000
```

---

## Deploy to Vercel

1. Import this repository in **[Vercel](https://vercel.com)**.
2. Framework Preset: **Other** (Static Site).
3. Build Command: *None*.
4. Output Directory: `.`.
5. Click **Deploy**.

---

## Credits
Created by **@TatayDigs** (Roblox).  
Maintained by **@Amashing0411**.

## Disclaimer
Fan project, not affiliated with or endorsed by Roblox or the game's developers. Values are calculated from known game formulas and may change after game updates.
