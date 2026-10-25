# 🧬 Impossible Animals — Dual Fusion Studio, Matchmaker & Breeding Lab

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAmashing0411%2FImpossible-Animals-Wiki)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-38bdf8?style=for-the-badge&logo=github)](https://amashing0411.github.io/Impossible-Animals-Wiki/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Game](https://img.shields.io/badge/Roblox-Impossible%20Animals-10b981?style=for-the-badge&logo=roblox)](https://www.roblox.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-fbbf24?style=for-the-badge)](LICENSE)

An all-in-one interactive **Wiki, Breeding Matchmaker, and Dual Fusion Laboratory** for the Roblox game **[Impossible Animals](https://www.roblox.com)**.

Powered by exact reverse-engineered game engine formulas, this tool calculates deterministic star ratings, special elemental bonuses, and passive income multipliers for all single and dual fusion combinations.

---

## ⚡ 1-Click Deploy to Vercel

Deploy your own live instance of this Wiki to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAmashing0411%2FImpossible-Animals-Wiki)

### Manual Vercel Deployment:
1. Go to **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Import your GitHub repository: `Amashing0411/Impossible-Animals-Wiki`.
4. Leave all build settings as default (Framework Preset: *Other* / *Static Site*).
5. Click **"Deploy"**. Your Wiki will be live on a high-speed global CDN with a free SSL certificate!

---

## 🌟 Live Demo

> **Live GitHub Pages URL:**  
> 👉 **[https://amashing0411.github.io/Impossible-Animals-Wiki/](https://amashing0411.github.io/Impossible-Animals-Wiki/)**

Zero installation, zero setup. Runs 100% client-side in any modern web browser or mobile device.

---

## 🚀 Key Features

### 1. 🧬 Gen-1 Pet Matchmaker
* **Find the Perfect Partner:** Select any Gen-1 pet (e.g. `Cheetah + Dragon`) and immediately rank all valid partners in the game.
* **Top 3 Podium:** Highlights the top 3 best dual fusion partners to guarantee the highest possible star ratings and income rates.
* **Inventory Filter:** Filter recommendations based exclusively on animals you actually own in your pen.

### 2. 🔬 Dual Fusion Sandbox & Hash Inspector
* **Live Step-by-Step Math:** Inspect the exact internal Jenkins 32-bit hash calculation used by the game engine.
* **Special Elemental Bonuses:** Computes bonuses for rare special elements (+1 to +3 stars for Black Hole, Solar Eclipse, Uranium, Aurora, Lava, Electricity, Ruby, Jade, Psychic, Plasma).
* **Instant Star & Income Projection:** Visualizes exact coin output ($/sec) and star tiers (from 3★ up to 20★).

### 3. 🏆 Global Dual Fusion Leaderboard
* Discover the absolute best dual fusion combinations in the entire game.
* Sort and search by final star rating, bonus rolls, element tags, and income multipliers.

### 4. 🐾 Complete 2,926 Single Fusion Database
* Browse all $\frac{77 \times 76}{2} + 77 = 2,926$ single fusion recipes for all 77 base animals.
* Filter by animal name, element, base stars, or owned status.
* Send any pair straight into the Matchmaker with one click.

### 5. 📌 Breeding Goals Planner & Checklist
* Pin dream hybrids and dual fusions to your planner.
* View an auto-aggregated checklist of base animal ingredients needed to craft your breeding goals.
* Progress is automatically saved in your browser's `localStorage`.

### 6. 💬 Roblox Quick Chat Responder ("TatayDigs Mode")
* When players in your Roblox server ask for fusion recipes or optimal combinations, generate clean, formatted responses with one click:
  * `[IA Wiki] 🐅 Tiger + 🐉 Dragon = 18★ | $/sec: $12.5M`
* Supports fuzzy search for quick lookups during active gameplay.

### 7. 💾 Inventory Management & Backup
* Track your unlocked base animals.
* One-click presets: *Unlock All*, *Select Specials Only*, or *Invert Selection*.
* Export your unlocked inventory or planner goals to JSON, and download datasets as CSV.

---

## 📐 Reverse-Engineered Game Formulas

### A. Single Fusion Rating Algorithm
The star rating for combining any two base animals $A$ and $B$ uses the game's deterministic 32-bit Jenkins hash:

1. **Sort Parent IDs:** Ensure consistent alphabetical ordering ($p_1 \le p_2$).
2. **Build Seed String:**
   $$\text{HashInput} = \text{"ImpossibleAnimals:stars:v1:seed:67673:"} .. |p_1| .. \text{":"} .. p_1 .. |p_2| .. \text{":"} .. p_2$$
3. **Jenkins One-at-a-Time Hash:** Processes bytes through bitwise shifts (`lshift 10`, `rshift 6`, `bxor`).
4. **Weight Lookup:** Matches the normalized roll $(0 \dots 1,000,000)$ against the game's frozen weight table to determine stars ($3 \dots 20$).

### B. Dual Fusion Star Bonus
Dual fusion combines two existing hybrids $(H_1 + H_2)$ and rolls an additional bonus of $+1$ to $+5$ stars using:
$$\text{Input} = \text{"ImpossibleAnimals:double-stars:v1:"} .. \text{sorted}(H_1, H_2)$$

### C. Special Elemental Tier Chart
| Element | Star Bonus |
| :--- | :---: |
| **Black Hole**, **Solar Eclipse** | **+3 Stars** |
| **Uranium**, **Lava**, **Aurora**, **Electricity**, **Psychic Power**, **Plasma** | **+2 Stars** |
| **Ruby**, **Jade**, **Glitter**, **Clouds**, **Water** | **+1 Star** |

---

## 🛠️ Local Development

Because the entire application is contained with zero external dependencies:

```bash
# 1. Clone the repository
git clone https://github.com/Amashing0411/Impossible-Animals-Wiki.git

# 2. Enter project folder
cd Impossible-Animals-Wiki

# 3. Launch with npm / npx
npm start
# or open index.html directly in any browser
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
*Disclaimer: Impossible Animals is a trademark of its respective creators on the Roblox platform. This project is a community-created tool and is not officially affiliated with Roblox or the game developers.*
