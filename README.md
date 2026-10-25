<div align="center">

# 🧬 Impossible Animals Wiki
### Dual Fusion Studio, Matchmaker & Breeding Lab

*The definitive community-driven fusion calculator, breeding lab, and wiki for the Roblox game [Impossible Animals](https://www.roblox.com/games/119929094294460/Impossible-Animals).*

<br>

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAmashing0411%2FImpossible-Animals-Wiki)
[![Live Demo](https://img.shields.io/badge/Live%20App-GitHub%20Pages-38bdf8?style=flat-square&logo=github)](https://amashing0411.github.io/Impossible-Animals-Wiki/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Ready-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![Roblox](https://img.shields.io/badge/Roblox-Impossible%20Animals-10b981?style=flat-square&logo=roblox)](https://www.roblox.com/games/119929094294460/Impossible-Animals)
[![License: MIT](https://img.shields.io/badge/License-MIT-fbbf24?style=flat-square)](LICENSE)

<br>

**[🌐 Launch Web App](https://amashing0411.github.io/Impossible-Animals-Wiki/)** • **[⚡ 1-Click Vercel Deploy](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAmashing0411%2FImpossible-Animals-Wiki)** • **[🎮 Play on Roblox](https://www.roblox.com/games/119929094294460/Impossible-Animals)**

</div>

---

## ⚡ What is this?

**Impossible Animals Wiki** is a standalone, client-side web application and reference toolkit. It reverse-engineers the game's exact procedural fusion math (Jenkins 32-bit Hash, deterministic seeds, star rating weights, and elemental modifiers) to give players the optimal strategy for every fusion.

---

## 🚀 Feature Highlights

| Feature | Description |
| :--- | :--- |
| 🧬 **Pet Matchmaker** | Pick your current pet to instantly find its **Top 3 best partner combos** and view the complete ranked partner leaderboard. |
| 🔬 **Dual Fusion Sandbox** | Test any two hybrid pairs with a step-by-step math inspector showing the exact hash roll, star bonus, and coin income ($/sec). |
| 🏆 **Global Leaderboard** | Browse the all-time highest-multiplier combinations in the game to discover optimal endgame targets. |
| 🐾 **2,926 Single Fusions** | Complete searchable encyclopedia of all Gen-1 combinations across all 77 base animals. |
| 📌 **Breeding Planner** | Pin target fusions to a local breeding roadmap. Automatically tallies base ingredient shopping lists. |
| 💬 **Roblox Chat Responder** | Generate formatted replies to paste into in-game chat when players ask for fusion recipes. |
| 💾 **Inventory Sync** | Toggle which animals you own in your pens to get customized partner recommendations. Export/import data via JSON or CSV. |

---

## ⌨️ Keyboard Shortcuts

Navigate the entire studio without touching your mouse:

| Key | Action |
| :---: | :--- |
| <kbd>/</kbd> | Instantly focus the **Chat Quick-Reply** search input |
| <kbd>1</kbd> | Switch to **Matchmaker** tab |
| <kbd>2</kbd> | Switch to **Dual Fusion Lab** tab |
| <kbd>3</kbd> | Switch to **Global Top Duals** tab |
| <kbd>4</kbd> | Switch to **Single Fusions (Gen 1)** database |
| <kbd>5</kbd> | Switch to **Breeding Planner** tab |
| <kbd>?</kbd> | Open the **Help & Shortcuts** dialog |
| <kbd>Esc</kbd> | Close any active modal or dropdown |

---

## 📐 Game Engine Math at a Glance

### 1. Deterministic Hash Formula
The game does not roll random numbers on fusion. It uses a **32-bit Jenkins One-At-A-Time hash** with a fixed seed (`67673`) salted against sorted parent identifiers:

```
Hash Input = "ImpossibleAnimals:stars:v1:seed:67673:" + len(p1) + ":" + p1 + len(p2) + ":" + p2
```

### 2. Elemental Bonus Tiers
Special elements grant guaranteed star bonuses:

| Tier | Star Bonus | Elements |
| :---: | :---: | :--- |
| **S+ Tier** | **+3 Stars** | 🕳️ Black Hole, 🌘 Solar Eclipse |
| **S Tier** | **+2 Stars** | ☢️ Uranium, 🌋 Lava, 🌌 Aurora, ⚡ Electricity, 🔮 Psychic Power, 🧬 Plasma |
| **A Tier** | **+1 Star** | 💎 Ruby, 🟩 Jade, ✨ Glitter, ☁️ Clouds, 💧 Water |

---

## 📁 Project Structure

```
Impossible-Animals-Wiki/
├── index.html           # Core HTML app shell & semantic UI
├── vercel.json          # Vercel caching rules & edge security headers
├── package.json         # NPM metadata & preview scripts
├── LICENSE              # MIT License
├── README.md            # Project showcase & documentation
└── assets/
    ├── styles.css       # Dark-mode design system & animations
    ├── app.js           # Engine math, datasets & fusion algorithms
    ├── extras.js        # Keyboard navigation & QoL shortcuts
    └── favicon.svg      # SVG Favicon
```

---

## 🛠️ Local Development

Zero build step or bundling required. Pure static web standards:

```bash
# 1. Clone repository
git clone https://github.com/Amashing0411/Impossible-Animals-Wiki.git
cd Impossible-Animals-Wiki

# 2. Start local server
npx serve .
# Or with Python:
# python -m http.server 8000
```

---

## 🚀 Deploying to Vercel

1. Click the **[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAmashing0411%2FImpossible-Animals-Wiki)** button above.
2. Link your GitHub account and import `Amashing0411/Impossible-Animals-Wiki`.
3. Set Framework Preset to **Other** (no build command, output directory `.`).
4. Click **Deploy**. Vercel will launch your site across global CDN edge nodes in seconds.

---

## 👥 Credits & Attribution

* **Original Creator:** Created by **[@TatayDigs](https://www.roblox.com)** on Roblox.
* **Repository Maintainer:** **[@Amashing0411](https://github.com/Amashing0411)**.
* **Disclaimer:** *This is an unofficial community fan project. Impossible Animals is a trademark of its respective creators on the Roblox platform. Not affiliated with or endorsed by Roblox or the game developers.*
