
const ANIMALS = [
    "anglerfish", "ankylosaurus", "ant", "aurora", "axolotl", "banana", "beetle", 
    "black-hole", "butterfly", "car", "cheeseburger", "cheetah", "chicken", "clouds", 
    "cobra", "coral", "cowboy", "crab", "crocodile", "demon", "dolphin", "dragon", 
    "dragonfly", "eagle", "electricity", "elephant", "excavator", "ferret", "fox", 
    "giraffe", "glitter", "goat", "gorilla", "human-man", "jade", "jellyfish", 
    "jerboa", "lava", "mermaid", "millipede", "monkey", "moose", "narwhal", 
    "octopus", "orangutan", "owl", "panther", "plasma", "praying-mantis", 
    "psychic-power", "pterodactyl", "pufferfish", "red panda", "rhino", "ruby", 
    "shark", "skeleton", "solar-eclipse", "spider", "stegosaurus", "stingray", 
    "strawberry", "t-rex", "tank", "tiger", "toilet", "triceratops", "turtle", 
    "uranium", "velociraptor", "venus-fly-trap", "warthog", "wasp", "water", 
    "wolf", "zebra", "zombie"
];

const ANIMAL_ICONS = {
    "anglerfish": "🐟", "ankylosaurus": "🦕", "ant": "🐜", "aurora": "🌌", "axolotl": "🦎",
    "banana": "🍌", "beetle": "🪲", "black-hole": "🕳️", "butterfly": "🦋", "car": "🚗",
    "cheeseburger": "🍔", "cheetah": "🐆", "chicken": "🐔", "clouds": "☁️", "cobra": "🐍",
    "coral": "🪸", "cowboy": "🤠", "crab": "🦀", "crocodile": "🐊", "demon": "👹",
    "dolphin": "🐬", "dragon": "🐉", "dragonfly": "蜻", "eagle": "🦅", "electricity": "⚡",
    "elephant": "🐘", "excavator": "🚜", "ferret": "🦦", "fox": "🦊", "giraffe": "🦒",
    "glitter": "✨", "goat": "🐐", "gorilla": "🦍", "human-man": "🧍", "jade": "🟢",
    "jellyfish": "🪼", "jerboa": "🐁", "lava": "🌋", "mermaid": "🧜‍♀️", "millipede": "🐛",
    "monkey": "🐒", "moose": "🫎", "narwhal": "🦄", "octopus": "🐙", "orangutan": "🦧",
    "owl": "🦉", "panther": "🐈‍⬛", "plasma": "🔮", "praying-mantis": "🦗", "psychic-power": "🧠",
    "pterodactyl": "🦅", "pufferfish": "🐡", "red panda": "🦊", "rhino": "🦏", "ruby": "💎",
    "shark": "🦈", "skeleton": "💀", "solar-eclipse": "🌑", "spider": "🕷️", "stegosaurus": "🦕",
    "stingray": "🐟", "strawberry": "🍓", "t-rex": "🦖", "tank": "🪖", "tiger": "🐅",
    "toilet": "🚽", "triceratops": "🦕", "turtle": "🐢", "uranium": "☢️", "velociraptor": "🦖",
    "venus-fly-trap": "🪴", "warthog": "🐗", "wasp": "🐝", "water": "💧", "wolf": "🐺",
    "zebra": "🦓", "zombie": "🧟"
};

const WEIGHTS = [
    250000, 225690, 157983, 110588, 77412, 54188, 
    37932, 26552, 18587, 13011, 9107, 6375, 
    4463, 3124, 2187, 1531, 1070, 200
];

const SPECIAL_BONUS = {
    "ruby": 1, "electricity": 2, "lava": 2, "uranium": 2, "aurora": 2,
    "black-hole": 3, "clouds": 1, "glitter": 1, "jade": 1, "water": 1,
    "psychic-power": 2, "plasma": 2, "solar-eclipse": 3
};

const MUTATION_DATA = {
    "none": { name: "Normal", bonus: 0 },
    "golden": { name: "Golden", bonus: 2 },
    "diamond": { name: "Diamond", bonus: 4 },
    "iridescent": { name: "Iridescent", bonus: 6 },
    "chaos": { name: "Chaos", bonus: 10 }
};

const SHINY_ORDER = ["none", "golden", "diamond", "iridescent", "chaos"];

const INCOME_RANGES = {
    3: [1, 2], 4: [3, 5], 5: [6, 9], 6: [10, 19], 7: [20, 49],
    8: [50, 99], 9: [100, 199], 10: [200, 499], 11: [500, 999],
    12: [1000, 1900], 13: [2000, 4900], 14: [5000, 9900],
    15: [10000, 19900], 16: [20000, 49900], 17: [50000, 99900],
    18: [100000, 199900], 19: [200000, 499900], 20: [500000, 999900],
    21: [1000000, 1990000], 22: [2000000, 4990000], 23: [5000000, 9990000],
    24: [10000000, 19990000], 25: [20000000, 49990000], 26: [50000000, 99990000],
    27: [100000000, 199990000], 28: [200000000, 499990000], 29: [500000000, 999990000],
    30: [1000000000, 3000000000], 31: [3000000001, 5999999999],
    32: [6000000000, 11999999999], 33: [12000000000, 23999999999],
    34: [24000000000, 47999999999], 35: [48000000000, 95999999999],
    36: [96000000000, 191999999999], 37: [192000000000, 383999999999],
    38: [384000000000, 767999999999]
};

// Formatting helpers
let useCompactNumbers = true;

function formatMoney(val) {
    if (!useCompactNumbers) {
        return "$" + Math.round(val).toLocaleString() + "/s";
    }
    if (val >= 1e12) return "$" + (val / 1e12).toFixed(2) + "T/s";
    if (val >= 1e9) return "$" + (val / 1e9).toFixed(2) + "B/s";
    if (val >= 1e6) return "$" + (val / 1e6).toFixed(2) + "M/s";
    if (val >= 1e3) return "$" + (val / 1e3).toFixed(2) + "K/s";
    return "$" + Math.round(val).toLocaleString() + "/s";
}

function getAnimalLabel(name) {
    const icon = ANIMAL_ICONS[name] || "🐾";
    const bonus = SPECIAL_BONUS[name];
    const bonusTag = bonus ? ` (+${bonus}★)` : "";
    return `${icon} ${name}${bonusTag}`;
}


// ROBLOX CHAT FORMATTERS & FUZZY TYPO MATCHER (TATAYDIGS MODE)
function formatRobloxRate(val) {
    if (val >= 1e12) return parseFloat((val / 1e12).toFixed(2)) + "T/s";
    if (val >= 1e9) return parseFloat((val / 1e9).toFixed(2)) + "B/s";
    if (val >= 1e6) return parseFloat((val / 1e6).toFixed(2)) + "M/s";
    if (val >= 1e3) return Math.round(val / 1e3) + "k/s";
    return Math.round(val) + "/s";
}

function capFirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function buildSingleChatString(p1, p2, stars, income, mut) {
    const mutTag = mut && mut !== "none" ? ` (${capFirst(mut)})` : "";
    return `${capFirst(p1)} + ${p2}${mutTag} ${stars} stars ${formatRobloxRate(income)}`;
}

function buildDualChatString(a1, a2, b1, b2, stars, income, mut) {
    const mutTag = mut && mut !== "none" ? ` (${capFirst(mut)})` : "";
    return `(${capFirst(a1)} + ${a2}) x (${capFirst(b1)} + ${b2})${mutTag} ${stars} stars ${formatRobloxRate(income)}`;
}

function copySingleChat(p1, p2, stars, income, mut) {
    const msg = buildSingleChatString(p1, p2, stars, income, mut);
    copyTextToClipboard(msg, `Copied for Roblox Chat: "${msg}"`);
}

function copyDualChat(a1, a2, b1, b2, stars, income, mut) {
    const msg = buildDualChatString(a1, a2, b1, b2, stars, income, mut);
    copyTextToClipboard(msg, `Copied for Roblox Chat: "${msg}"`);
}

function copyPodiumChat(idx) {
    const item = mmResults[idx];
    if (!item) return;
    const msg = `${capFirst(item.b1)} + ${item.b2} (makes ${item.finalStars} stars ${formatRobloxRate(item.income)})`;
    copyTextToClipboard(msg, `Copied for Roblox Chat: "${msg}"`);
}

function editDistance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }
    return dp[a.length][b.length];
}

const COMMON_ALIASES = {
    "ancalasaurus": "ankylosaurus",
    "ankylo": "ankylosaurus",
    "anky": "ankylosaurus",
    "sting": "stingray",
    "trex": "t-rex",
    "rex": "t-rex",
    "bh": "black-hole",
    "blackhole": "black-hole",
    "se": "solar-eclipse",
    "eclipse": "solar-eclipse",
    "solar": "solar-eclipse",
    "mantis": "praying-mantis",
    "flytrap": "venus-fly-trap",
    "venus": "venus-fly-trap",
    "psychic": "psychic-power",
    "redpanda": "red panda",
    "panda": "red panda",
    "human": "human-man",
    "burger": "cheeseburger",
    "ptero": "pterodactyl",
    "raptor": "velociraptor",
    "stego": "stegosaurus",
    "trike": "triceratops",
    "croc": "crocodile",
    "puffer": "pufferfish",
    "angler": "anglerfish",
    "elec": "electricity",
    "electric": "electricity"
};

function resolveFuzzyAnimal(token) {
    if (!token) return null;
    const clean = token.toLowerCase().replace(/[^a-z0-9- ]/g, "").trim();
    if (!clean) return null;
    if (ANIMALS.includes(clean)) return clean;
    if (COMMON_ALIASES[clean]) return COMMON_ALIASES[clean];

    // Prefix or substring match
    const prefixMatch = ANIMALS.find(a => a.startsWith(clean));
    if (prefixMatch) return prefixMatch;
    const subMatch = ANIMALS.find(a => a.includes(clean));
    if (subMatch) return subMatch;

    // Fuzzy Levenshtein distance match (for typos like "ancalasaurus" -> "ankylosaurus")
    let bestAnimal = null;
    let bestScore = 999;
    for (const animal of ANIMALS) {
        const d = editDistance(clean, animal.replace("-", ""));
        if (d < bestScore && d <= Math.max(3, Math.floor(animal.length * 0.4))) {
            bestScore = d;
            bestAnimal = animal;
        }
    }
    return bestAnimal;
}

let currentChatReplies = [];
let currentChatTargetAnimal = "";

function runChatResponder() {
    const raw = (document.getElementById("chat-quick-query")?.value || "").toLowerCase().replace(/[?]/g, " ").trim();
    const mut = document.getElementById("chat-quick-mut")?.value || "none";
    const strip = document.getElementById("chat-results-strip");
    if (!strip) return;

    // Default to "stingray" example if empty so the user sees how it works immediately!
    const queryToUse = raw || "stingray";
    const tokens = queryToUse.split(/[+,×x/|\s]+/).filter(Boolean);

    // Check if user typed 2 animals (e.g. "glitter sting") or 1 animal (e.g. "sting+?" or "ancalasaurus+")
    let resolved = [];
    for (const t of tokens) {
        const match = resolveFuzzyAnimal(t);
        if (match && !resolved.includes(match)) resolved.push(match);
    }

    currentChatReplies = [];
    if (resolved.length >= 2) {
        // Specific pair lookup (e.g. "glitter sting" -> Glitter + stingray 18 stars 102k/s)
        const a = resolved[0], b = resolved[1];
        const exact = calculateSingle(a, b, mut);
        const exactStr = buildSingleChatString(a, b, exact.finalStars, exact.income, mut);
        currentChatReplies.push({ label: `Exact Pair`, text: exactStr, stars: exact.finalStars, income: exact.income });
        currentChatTargetAnimal = `${a} + ${b}`;
    }

    if (resolved.length >= 1) {
        const target = resolved[0];
        currentChatTargetAnimal = target;
        const partners = [];
        for (const other of ANIMALS) {
            if (other === target) continue;
            if (filterOwnedOnly && !ownedAnimals.has(other)) continue;
            partners.push({ partner: other, calc: calculateSingle(other, target, mut) });
        }
        partners.sort((x, y) => y.calc.income - x.calc.income);

        // Also include the best NON-special (normal base animal) partner in case the asker doesn't own Black-hole/Solar-eclipse!
        const bestNormal = partners.find(p => !SPECIAL_BONUS[p.partner]);
        const topList = partners.slice(0, 5);
        if (bestNormal && !topList.some(p => p.partner === bestNormal.partner)) {
            topList.push(bestNormal);
        }

        topList.forEach((p, idx) => {
            const replyText = buildSingleChatString(p.partner, target, p.calc.finalStars, p.calc.income, mut);
            const tag = !SPECIAL_BONUS[p.partner] ? "No-Special" : `#${idx + 1}`;
            currentChatReplies.push({
                label: tag,
                text: replyText,
                stars: p.calc.finalStars,
                income: p.calc.income
            });
        });
    }

    if (currentChatReplies.length === 0) {
        strip.innerHTML = `<span style="font-size:12px; color:#94a3b8;">No matching animal found. Try typing part of an animal name like <b>sting</b>, <b>anky</b>, or <b>glitter sting</b>.</span>`;
        return;
    }

    strip.innerHTML = currentChatReplies.map((item, i) => `
        <button type="button" class="chat-reply-pill" onclick="copyChatReplyIndex(${i})" title="Click to copy for Roblox chat">
            <span style="font-size:10.5px; font-weight:800; color:var(--accent); text-transform:uppercase;">${item.label}</span>
            <span style="font-weight:700;">${item.text}</span>
            <span style="font-size:11px; color:var(--green-bright);">📋</span>
        </button>
    `).join("");
}

function copyChatReplyIndex(idx) {
    const item = currentChatReplies[idx];
    if (!item) return;
    copyTextToClipboard(item.text, `Copied for Roblox Chat: "${item.text}"`);
}

function copyFirstChatReply() {
    if (currentChatReplies.length === 0) runChatResponder();
    if (currentChatReplies.length > 0) {
        copyChatReplyIndex(0);
    }
}

function copyTop3ChatReply() {
    if (currentChatReplies.length === 0) runChatResponder();
    if (currentChatReplies.length === 0) return;
    const top3 = currentChatReplies.slice(0, 3).map(r => r.text).join("  |  ");
    copyTextToClipboard(top3, `Copied Top 3 Replies: "${top3}"`);
}

function showToast(msg) {
    const container = document.getElementById("toast-container");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = "0";
        el.style.transition = "opacity 0.25s";
        setTimeout(() => el.remove(), 260);
    }, 2600);
}

function copyTextToClipboard(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showToast(message)).catch(() => fallbackCopy(text, message));
    } else {
        fallbackCopy(text, message);
    }
}

function fallbackCopy(text, message) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); showToast(message); } catch (e) {}
    ta.remove();
}

// 32-bit Jenkins Hash
function jenkinsHash(str) {
    let v9 = 0;
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        let v11 = (v9 + code) >>> 0;
        let v12 = (v11 + ((v11 << 10) >>> 0)) >>> 0;
        let v13 = (v12 >>> 6) >>> 0;
        v9 = (v12 ^ v13) >>> 0;
    }
    let v14 = (v9 + ((v9 << 3) >>> 0)) >>> 0;
    let v15 = (v14 >>> 11) >>> 0;
    let v16 = (v14 ^ v15) >>> 0;
    return ((v16 + ((v16 << 15) >>> 0)) >>> 0);
}

// DJB2 Hash
function djb2Hash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash * 33 + str.charCodeAt(i)) % 2147483647) >>> 0;
    }
    return hash;
}

function getBestShiny(shinyA, shinyB) {
    const rankA = SHINY_ORDER.indexOf(shinyA || "none");
    const rankB = SHINY_ORDER.indexOf(shinyB || "none");
    return rankA >= rankB ? shinyA : shinyB;
}

function getLevelMultiplier(lvl) {
    const cleanLvl = Math.max(1, parseInt(lvl) || 1);
    return 1 + (cleanLvl - 1) * 0.5;
}

// INVENTORY & PLANNER STORAGE
let ownedAnimals = new Set(ANIMALS);
let filterOwnedOnly = false;
let savedGoals = [];

function loadState() {
    try {
        const saved = localStorage.getItem("ia_owned");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) ownedAnimals = new Set(parsed);
        }
        const goalsRaw = localStorage.getItem("ia_planner_goals");
        if (goalsRaw) {
            const parsedGoals = JSON.parse(goalsRaw);
            if (Array.isArray(parsedGoals)) savedGoals = parsedGoals;
        }
    } catch(e) {}
    updateInventoryUI();
    renderPlanner();
}

function saveInventory() {
    try {
        localStorage.setItem("ia_owned", JSON.stringify([...ownedAnimals]));
    } catch(e) {}
    updateInventoryUI();
}

function savePlannerGoals() {
    try {
        localStorage.setItem("ia_planner_goals", JSON.stringify(savedGoals));
    } catch(e) {}
    document.getElementById("planner-count-badge").textContent = savedGoals.length;
    renderPlanner();
}

function updateInventoryUI() {
    const count = ownedAnimals.size;
    const total = ANIMALS.length;
    const pct = Math.round((count / total) * 100);
    document.getElementById("inv-count-badge").textContent = `${count}/${total}`;
    document.getElementById("hdr-owned-stat").textContent = `${count} / ${total} (${pct}%)`;
    const pairs = count >= 2 ? (count * (count - 1)) / 2 : 0;
    document.getElementById("hdr-gen1-stat").textContent = `${pairs.toLocaleString()} Pairs`;

    renderChips();
    runChatResponder();
    runMatchmaker();
    runLabCalculator();
    if (document.getElementById("panel-global").style.display !== "none") resetGlobalPage();
    if (document.getElementById("panel-single").style.display !== "none") resetDbPage();
    if (document.getElementById("panel-planner").style.display !== "none") renderPlanner();
}

function renderChips() {
    const grid = document.getElementById("chip-grid");
    const query = (document.getElementById("inv-search")?.value || "").toLowerCase().trim();
    const tierFilter = document.getElementById("inv-tier-filter")?.value || "all";

    grid.innerHTML = "";
    let shown = 0;

    ANIMALS.forEach(animal => {
        const bonus = SPECIAL_BONUS[animal] || 0;
        if (query && !animal.includes(query)) return;
        if (tierFilter === "special" && bonus === 0) return;
        if (tierFilter === "3" && bonus !== 3) return;
        if (tierFilter === "2" && bonus !== 2) return;
        if (tierFilter === "1" && bonus !== 1) return;
        if (tierFilter === "0" && bonus !== 0) return;

        shown++;
        const chip = document.createElement("div");
        chip.className = `chip ${ownedAnimals.has(animal) ? "active" : ""}`;
        const icon = ANIMAL_ICONS[animal] || "🐾";
        let bonusBadge = "";
        if (bonus > 0) {
            bonusBadge = `<span class="chip-bonus bonus-${bonus}">+${bonus}★</span>`;
        }
        chip.innerHTML = `<span>${icon} ${animal}</span>${bonusBadge}`;
        chip.onclick = () => {
            if (ownedAnimals.has(animal)) {
                ownedAnimals.delete(animal);
            } else {
                ownedAnimals.add(animal);
            }
            saveInventory();
        };
        grid.appendChild(chip);
    });

    const summaryEl = document.getElementById("inv-filter-summary");
    if (summaryEl) summaryEl.textContent = `Showing ${shown} of ${ANIMALS.length} animals`;
}

function setAllAnimals(state) {
    if (state) {
        ownedAnimals = new Set(ANIMALS);
        showToast("All 77 animals marked as Owned!");
    } else {
        ownedAnimals.clear();
        showToast("Cleared owned animal roster.");
    }
    saveInventory();
}

function selectSpecialOnly() {
    ownedAnimals = new Set(Object.keys(SPECIAL_BONUS));
    saveInventory();
    showToast("Selected all 13 Special Bonus (+1★ to +3★) animals!");
}

function invertAnimals() {
    const next = new Set();
    ANIMALS.forEach(a => {
        if (!ownedAnimals.has(a)) next.add(a);
    });
    ownedAnimals = next;
    saveInventory();
    showToast("Inverted animal ownership selection.");
}

function toggleInvPanel() {
    const panel = document.getElementById("inv-panel");
    const isHidden = panel.style.display !== "block";
    panel.style.display = isHidden ? "block" : "none";
    document.getElementById("inv-caret").textContent = isHidden ? "▲" : "▼";
}

function toggleOwnedOnly() {
    filterOwnedOnly = !filterOwnedOnly;
    document.getElementById("toggle-owned-wrap").classList.toggle("active", filterOwnedOnly);
    runMatchmaker();
    resetGlobalPage();
    resetDbPage();
    showToast(filterOwnedOnly ? "Filtering by Owned Animals Only" : "Showing All Possible Game Recipes");
}

function toggleCompactNumbers() {
    useCompactNumbers = !useCompactNumbers;
    document.getElementById("toggle-compact-wrap").classList.toggle("active", useCompactNumbers);
    runMatchmaker();
    runLabCalculator();
    renderGlobalDualTable();
    renderDbTable();
    renderPlanner();
}

// SINGLE FUSE ENGINE
function calculateSingle(p1, p2, mutation = "none", lvl = 1) {
    let pHigh = p1, pLow = p2;
    if (p2 >= p1) { pHigh = p2; pLow = p1; }

    const starsKey = `ImpossibleAnimals:stars:v1:seed:67673:${pLow.length}:${pLow}${pHigh.length}:${pHigh}`;
    const starRoll = (jenkinsHash(starsKey) / 4294967296) * 1000000;

    let v21 = 0;
    let baseStars = 20;
    for (let k = 0; k < WEIGHTS.length; k++) {
        v21 += WEIGHTS[k];
        if (starRoll < v21) {
            baseStars = k + 3;
            break;
        }
    }

    const specialBonus = Math.max(SPECIAL_BONUS[p1] || 0, SPECIAL_BONUS[p2] || 0);
    const mutBonus = MUTATION_DATA[mutation] ? MUTATION_DATA[mutation].bonus : 0;
    const finalStars = Math.min(38, Math.max(3, baseStars + specialBonus + mutBonus));

    const mutString = mutation === "none" ? "4:none" : `${mutation.length}:${mutation}`;
    const incomeKey = `ImpossibleAnimals:income:v1:seed:67673:${pLow.length}:${pLow}${pHigh.length}:${pHigh}${mutString}`;
    const incomeHash = jenkinsHash(incomeKey);

    const range = INCOME_RANGES[finalStars] || [384000000000, 767999999999];
    const income = range[0] + Math.floor((incomeHash / 4294967296) * (range[1] - range[0] + 1));
    const scaledIncome = Math.floor(income * getLevelMultiplier(lvl));

    return {
        name: `${p1} + ${p2}`,
        p1, p2,
        pLow, pHigh,
        starRoll: Math.floor(starRoll),
        baseStars,
        specialBonus,
        mutBonus,
        finalStars,
        income,
        scaledIncome,
        mutation,
        lvl: Math.max(1, parseInt(lvl) || 1)
    };
}

// DOUBLE FUSE ENGINE
function calculateDouble(a1, a2, mutA, lvlA, b1, b2, mutB, lvlB) {
    const h1 = calculateSingle(a1, a2, mutA, lvlA);
    const h2 = calculateSingle(b1, b2, mutB, lvlB);

    let [d1, m1] = [h1.pLow, h1.pHigh];
    if (m1 < d1) [d1, m1] = [m1, d1];
    const str1 = `${d1.length}:${d1}${m1.length}:${m1}`;

    let [d2, m2] = [h2.pLow, h2.pHigh];
    if (m2 >= d2) [d2, m2] = [m2, d2];
    const str2 = `${m2.length}:${m2}${d2.length}:${d2}`;

    let v43 = str2, v38 = str1;
    if (v43 >= v38) { v38 = str2; v43 = str1; }

    const doubleKey = `ImpossibleAnimals:double-stars:v1:${v43.length}:${v43}${v38.length}:${v38}`;
    const doubleBonus = Math.floor((jenkinsHash(doubleKey) / 4294967296) * 5) + 1;

    // TRUE LUA RULE (DoubleFusionRules.lua v_u_63):
    // Parent stars only use (Base Stars + Mutation Bonus); Special Element Bonus is added ONLY ONCE at the end!
    const p1RawStars = h1.baseStars + h1.mutBonus;
    const p2RawStars = h2.baseStars + h2.mutBonus;

    const minParentStars = Math.min(p1RawStars, p2RawStars);
    let thresholdCap = 0;
    if (3 <= minParentStars) thresholdCap++;
    if (9 <= minParentStars) thresholdCap++;
    if (15 <= minParentStars) thresholdCap++;
    if (21 <= minParentStars) thresholdCap++;
    if (29 <= minParentStars) thresholdCap++;

    const effectiveDoubleBonus = Math.min(doubleBonus, thresholdCap);
    const baseDoubleStars = Math.max(p1RawStars, p2RawStars) + effectiveDoubleBonus;

    const allParents = [h1.pLow, h1.pHigh, h2.pLow, h2.pHigh];
    let specialBonus = 0;
    for (let p of allParents) {
        specialBonus = Math.max(specialBonus, SPECIAL_BONUS[p] || 0);
    }

    const inheritedMutation = getBestShiny(mutA, mutB);
    const finalDoubleStars = Math.min(38, Math.max(3, baseDoubleStars + specialBonus));

    const mutString = inheritedMutation === "none" ? "none" : inheritedMutation;
    const incomeSeed = `${allParents.join("|")}|${mutString}`;
    const djbHash = djb2Hash(incomeSeed);
    const range = INCOME_RANGES[finalDoubleStars] || [384000000000, 767999999999];
    const income = range[0] + Math.floor((djbHash / 2147483647) * (range[1] - range[0] + 1));
    const inheritedLevel = Math.max(parseInt(lvlA) || 1, parseInt(lvlB) || 1);
    const scaledIncome = Math.floor(income * getLevelMultiplier(inheritedLevel));
    const bracketPct = Math.round(((income - range[0]) / Math.max(1, range[1] - range[0])) * 100);

    return {
        fullComboName: `(${a1} + ${a2}) × (${b1} + ${b2})`,
        partnerRecipe: `${b1} + ${b2}`,
        a1, a2, b1, b2,
        mutA, mutB,
        h1, h2,
        p1RawStars,
        p2RawStars,
        doubleBonus,
        thresholdCap,
        effectiveDoubleBonus,
        specialBonus,
        finalStars: finalDoubleStars,
        inheritedMutation,
        income,
        scaledIncome,
        inheritedLevel,
        incomeSeed,
        doubleKey,
        bracketPct
    };
}

const COMBO_IDS = ["mm-a1", "mm-a2", "lab-a1", "lab-a2", "lab-b1", "lab-b2"];

function initDropdowns() {
    COMBO_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = "";
        ANIMALS.forEach(animal => {
            const opt = document.createElement("option");
            opt.value = animal;
            opt.textContent = getAnimalLabel(animal);
            el.appendChild(opt);
        });
    });

    document.getElementById("mm-a1").value = "tiger";
    document.getElementById("mm-a2").value = "black-hole";

    document.getElementById("lab-a1").value = "axolotl";
    document.getElementById("lab-a2").value = "panther";
    document.getElementById("lab-mut-a").value = "diamond";
    document.getElementById("lab-b1").value = "coral";
    document.getElementById("lab-b2").value = "ruby";
    document.getElementById("lab-mut-b").value = "none";

    COMBO_IDS.forEach(id => mountSearchableCombo(id));
}

function mountSearchableCombo(selectId) {
    const selectEl = document.getElementById(selectId);
    if (!selectEl || selectEl.dataset.comboMounted === "true") return;
    selectEl.dataset.comboMounted = "true";

    const wrapper = document.createElement("div");
    wrapper.className = "Combo-wrap";
    selectEl.parentNode.insertBefore(wrapper, selectEl);
    wrapper.appendChild(selectEl);

    const inputBox = document.createElement("div");
    inputBox.className = "combo-input-box";

    const input = document.createElement("input");
    input.type = "text";
    input.id = selectId + "-search";
    input.className = "combo-input";
    input.placeholder = "Type animal name...";
    input.autocomplete = "off";
    input.value = getAnimalLabel(selectEl.value);

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "combo-clear-btn";
    clearBtn.title = "Clear & search";
    clearBtn.textContent = "🔍";

    const dropdown = document.createElement("div");
    dropdown.className = "combo-dropdown";
    dropdown.id = selectId + "-dropdown";

    inputBox.appendChild(input);
    inputBox.appendChild(clearBtn);
    wrapper.appendChild(inputBox);
    wrapper.appendChild(dropdown);

    let highlightIdx = 0;
    let currentMatches = [...ANIMALS];

    function renderList(filterText) {
        const q = (filterText || "").toLowerCase().trim();
        currentMatches = ANIMALS.filter(a => {
            if (filterOwnedOnly && !ownedAnimals.has(a) && a !== selectEl.value) return false;
            return !q || a.includes(q);
        });
        highlightIdx = 0;
        dropdown.innerHTML = "";

        if (currentMatches.length === 0) {
            const empty = document.createElement("div");
            empty.className = "combo-option";
            empty.style.color = "#64748b";
            empty.textContent = "No matching animal found";
            dropdown.appendChild(empty);
            return;
        }

        currentMatches.forEach((animal, idx) => {
            const item = document.createElement("div");
            item.className = "combo-option" +
                (idx === highlightIdx ? " highlighted" : "") +
                (animal === selectEl.value ? " selected" : "");
            const icon = ANIMAL_ICONS[animal] || "🐾";
            const bonus = SPECIAL_BONUS[animal] || 0;
            const bonusHtml = bonus > 0 ? `<span class="chip-bonus bonus-${bonus}">+${bonus}★</span>` : "";
            item.innerHTML = `<span>${icon} ${animal}</span>${bonusHtml}`;
            item.onmousedown = (e) => {
                e.preventDefault();
                selectAnimalValue(selectId, animal, true);
                dropdown.classList.remove("open");
                input.blur();
            };
            dropdown.appendChild(item);
        });
    }

    function updateHighlight() {
        const opts = dropdown.querySelectorAll(".combo-option");
        opts.forEach((el, i) => {
            el.classList.toggle("highlighted", i === highlightIdx);
            if (i === highlightIdx) {
                el.scrollIntoView({ block: "nearest" });
            }
        });
    }

    input.addEventListener("focus", () => {
        input.value = "";
        renderList("");
        dropdown.classList.add("open");
    });

    input.addEventListener("input", () => {
        renderList(input.value);
        dropdown.classList.add("open");
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (currentMatches.length > 0) {
                highlightIdx = (highlightIdx + 1) % currentMatches.length;
                updateHighlight();
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (currentMatches.length > 0) {
                highlightIdx = (highlightIdx - 1 + currentMatches.length) % currentMatches.length;
                updateHighlight();
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (currentMatches.length > 0) {
                const chosen = currentMatches[highlightIdx] || currentMatches[0];
                selectAnimalValue(selectId, chosen, true);
                dropdown.classList.remove("open");
                input.blur();
            }
        } else if (e.key === "Escape") {
            dropdown.classList.remove("open");
            input.value = getAnimalLabel(selectEl.value);
            input.blur();
        }
    });

    input.addEventListener("blur", () => {
        setTimeout(() => {
            dropdown.classList.remove("open");
            input.value = getAnimalLabel(selectEl.value);
        }, 120);
    });

    clearBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.focus();
        input.value = "";
        renderList("");
        dropdown.classList.add("open");
    });
}

function selectAnimalValue(selectId, animal, triggerChange = false) {
    const selectEl = document.getElementById(selectId);
    if (!selectEl || !ANIMALS.includes(animal)) return;
    selectEl.value = animal;
    const searchInput = document.getElementById(selectId + "-search");
    if (searchInput && document.activeElement !== searchInput) {
        searchInput.value = getAnimalLabel(animal);
    } else if (searchInput && triggerChange) {
        searchInput.value = getAnimalLabel(animal);
    }
    if (triggerChange) {
        if (selectId.startsWith("mm-")) runMatchmaker();
        if (selectId.startsWith("lab-")) runLabCalculator();
    }
}

function syncAllComboInputs() {
    COMBO_IDS.forEach(id => {
        const selectEl = document.getElementById(id);
        const searchInput = document.getElementById(id + "-search");
        if (selectEl && searchInput && document.activeElement !== searchInput) {
            searchInput.value = getAnimalLabel(selectEl.value);
        }
    });
}

function handleQuickPairInput(e, mode) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const raw = e.target.value.toLowerCase().trim();
    if (!raw) return;

    // Match any 2 animals mentioned in the query or partial tokens
    const parts = raw.split(/[+,×x/|\s]+/).filter(Boolean);
    let found = [];

    // First check exact or multi-word animal matches in raw string
    const sortedByLen = [...ANIMALS].sort((a, b) => b.length - a.length);
    let tempRaw = raw;
    for (const an of sortedByLen) {
        if (tempRaw.includes(an) && !found.includes(an)) {
            found.push(an);
            tempRaw = tempRaw.replace(an, " ");
            if (found.length === 2) break;
        }
    }

    // Fallback prefix/substring match on tokens
    if (found.length < 2) {
        for (const token of parts) {
            const match = ANIMALS.find(a => a.startsWith(token) || a.includes(token));
            if (match && !found.includes(match)) {
                found.push(match);
                if (found.length === 2) break;
            }
        }
    }

    if (found.length >= 2) {
        if (mode === "mm") {
            selectAnimalValue("mm-a1", found[0], false);
            selectAnimalValue("mm-a2", found[1], true);
            showToast(`Selected ${found[0]} + ${found[1]}!`);
            e.target.value = "";
        }
    } else if (found.length === 1) {
        if (mode === "mm") {
            selectAnimalValue("mm-a1", found[0], true);
            showToast(`Set Animal 1 to ${found[0]} — type a second animal name to set both!`);
        }
    } else {
        showToast("No matching animal names found.");
    }
}

function swapMatchmakerAnimals() {
    const el1 = document.getElementById("mm-a1");
    const el2 = document.getElementById("mm-a2");
    const tmp = el1.value;
    el1.value = el2.value;
    el2.value = tmp;
    runMatchmaker();
}

function randomizeMatchmakerPet() {
    const pool = filterOwnedOnly && ownedAnimals.size >= 2 ? [...ownedAnimals] : ANIMALS;
    const idx1 = Math.floor(Math.random() * pool.length);
    let idx2 = Math.floor(Math.random() * pool.length);
    if (idx2 === idx1) idx2 = (idx1 + 1) % pool.length;
    document.getElementById("mm-a1").value = pool[idx1];
    document.getElementById("mm-a2").value = pool[idx2];
    runMatchmaker();
    showToast(`Randomized to ${pool[idx1]} + ${pool[idx2]}!`);
}

function setBestOwnedGen1Pet() {
    const mut = document.getElementById("mm-mut").value;
    let best = null;
    for (let i = 0; i < ANIMALS.length; i++) {
        for (let j = i + 1; j < ANIMALS.length; j++) {
            const a = ANIMALS[i], b = ANIMALS[j];
            if (filterOwnedOnly && (!ownedAnimals.has(a) || !ownedAnimals.has(b))) continue;
            const res = calculateSingle(a, b, mut);
            if (!best || res.income > best.income) best = res;
        }
    }
    if (best) {
        document.getElementById("mm-a1").value = best.pLow;
        document.getElementById("mm-a2").value = best.pHigh;
        runMatchmaker();
        showToast(`Loaded #1 Gen-1 Pet: ${best.pLow} + ${best.pHigh} (${best.finalStars}★)!`);
    } else {
        showToast("Unlock at least 2 animals in your inventory first!");
    }
}

// ==========================================
// TAB 1: THE DUAL FUSION MATCHMAKER
// ==========================================
let mmResults = [];
let mmPage = 1;
const MM_PAGE_SIZE = 50;

function runMatchmaker() {
    syncAllComboInputs();
    const a1 = document.getElementById("mm-a1").value;
    const a2 = document.getElementById("mm-a2").value;
    const mutA = document.getElementById("mm-mut").value;
    const lvlA = Math.max(1, parseInt(document.getElementById("mm-lvl").value) || 1);
    const partnerMut = document.getElementById("mm-partner-mut").value;
    const partnerLvl = Math.max(1, parseInt(document.getElementById("mm-partner-lvl").value) || 1);
    const search = document.getElementById("mm-search").value.toLowerCase().trim();

    if (a1 === a2) {
        document.getElementById("mm-user-title").textContent = "⚠️ Select 2 different animals";
        document.getElementById("mm-user-breakdown").textContent = "In Impossible Animals, a Gen-1 hybrid requires two distinct base animals.";
        return;
    }

    const userH = calculateSingle(a1, a2, mutA, lvlA);
    const mutPrefix = mutA !== "none" ? `[${mutA.toUpperCase()}] ` : "";
    document.getElementById("mm-user-title").textContent = `${mutPrefix}${a1} + ${a2}`;
    document.getElementById("mm-user-breakdown").textContent =
        `Base Hash Roll: ${userH.baseStars}★ | Special Bonus: +${userH.specialBonus}★ | Mutation Bonus: +${userH.mutBonus}★ | Treadmill Lvl ${lvlA} (${getLevelMultiplier(lvlA).toFixed(1)}x)`;
    document.getElementById("mm-user-stars").textContent = `${userH.finalStars} ★`;
    document.getElementById("mm-user-inc").textContent = formatMoney(userH.income);
    document.getElementById("mm-user-scaled-inc").textContent = formatMoney(userH.scaledIncome);

    mmResults = [];
    for (let i = 0; i < ANIMALS.length; i++) {
        for (let j = i + 1; j < ANIMALS.length; j++) {
            const b1 = ANIMALS[i];
            const b2 = ANIMALS[j];

            if (filterOwnedOnly && (!ownedAnimals.has(b1) || !ownedAnimals.has(b2))) {
                continue;
            }
            if (search && !b1.includes(search) && !b2.includes(search)) continue;

            const res = calculateDouble(a1, a2, mutA, lvlA, b1, b2, partnerMut, partnerLvl);
            mmResults.push(res);
        }
    }

    mmResults.sort((a, b) => b.income !== a.income ? b.income - a.income : b.finalStars - a.finalStars);

    // Populate Top 3 Podium
    if (mmResults.length > 0) {
        [0, 1, 2].forEach(idx => {
            const item = mmResults[idx] || mmResults[0];
            const num = idx + 1;
            const multGain = userH.income > 0 ? (item.income / userH.income) : 1;
            const gainText = multGain >= 10
                ? `${multGain.toFixed(1)}x Income`
                : `+${Math.max(0, Math.round((multGain - 1) * 100)).toLocaleString()}%`;

            document.getElementById(`podium-${num}-name`).textContent = item.fullComboName;
            document.getElementById(`podium-${num}-partner`).textContent = `Breed Partner: ${item.partnerRecipe} (${item.h2.finalStars}★)`;
            document.getElementById(`podium-${num}-stars`).textContent = `${item.finalStars} ★ (+${item.finalStars - userH.finalStars}★)`;
            document.getElementById(`podium-${num}-inc`).textContent = formatMoney(item.scaledIncome);
            document.getElementById(`podium-${num}-gain`).textContent = gainText;
        });
    } else {
        ["1", "2", "3"].forEach(num => {
            document.getElementById(`podium-${num}-name`).textContent = "No craftable combos found";
            document.getElementById(`podium-${num}-partner`).textContent = "Unlock more animals in inventory!";
            document.getElementById(`podium-${num}-stars`).textContent = "- ★";
            document.getElementById(`podium-${num}-inc`).textContent = "$0/s";
            document.getElementById(`podium-${num}-gain`).textContent = "-";
        });
    }

    renderMmTable();
}

function renderMmTable() {
    const tbody = document.getElementById("mm-table-body");
    const totalPages = Math.ceil(mmResults.length / MM_PAGE_SIZE) || 1;
    mmPage = Math.min(mmPage, totalPages);

    const start = (mmPage - 1) * MM_PAGE_SIZE;
    const slice = mmResults.slice(start, start + MM_PAGE_SIZE);

    let html = "";
    slice.forEach((item, idx) => {
        const globalIdx = start + idx;
        html += `
            <tr>
                <td class="rank">#${globalIdx + 1}</td>
                <td style="font-weight:700; color:var(--heading); text-transform:capitalize;">${item.fullComboName}</td>
                <td style="font-weight:700; text-transform:capitalize; color:var(--accent);">${ANIMAL_ICONS[item.b1] || "🐾"} ${item.b1} + ${ANIMAL_ICONS[item.b2] || "🐾"} ${item.b2}</td>
                <td><span style="color:#94a3b8; font-weight:600;">${item.h2.finalStars} ★ (${formatMoney(item.h2.income)})</span></td>
                <td style="color:var(--gold); font-weight:800;">${item.finalStars} ★</td>
                <td class="mono" style="color:var(--green-bright); font-weight:700;">${formatMoney(item.income)}</td>
                <td class="mono" style="color:var(--accent); font-weight:700;">${formatMoney(item.scaledIncome)}</td>
                <td>
                    <div class="action-cell">
                        <button class="btn btn-sm btn-chat-copy" onclick="copyDualChat('${item.a1}','${item.a2}','${item.b1}','${item.b2}',${item.finalStars},${item.income},'${item.inheritedMutation}')" title="Copy Roblox Chat Reply">💬</button>
                        <button class="btn btn-sm" onclick="loadComboIntoLab('${item.a1}','${item.a2}','${item.mutA}',${item.h1.lvl},'${item.b1}','${item.b2}','${item.mutB}',${item.h2.lvl})" title="Inspect Formula in Lab">🔬</button>
                        <button class="btn btn-sm" onclick="addGoalToPlanner('${item.a1}','${item.a2}','${item.mutA}','${item.b1}','${item.b2}','${item.mutB}')" title="Save to Breeding Planner">📌</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;

    document.getElementById("mm-page-info").textContent = `Page ${mmPage} of ${totalPages} (${mmResults.length.toLocaleString()} craftable partner options)`;
    document.getElementById("btn-mm-prev").disabled = mmPage === 1;
    document.getElementById("btn-mm-next").disabled = mmPage >= totalPages;
}

function resetMmPage() {
    mmPage = 1;
    runMatchmaker();
}

function changeMmPage(delta) {
    mmPage += delta;
    renderMmTable();
}

function inspectPodiumInLab(idx) {
    const item = mmResults[idx];
    if (!item) return;
    loadComboIntoLab(item.a1, item.a2, item.mutA, item.h1.lvl, item.b1, item.b2, item.mutB, item.h2.lvl);
}

function pinPodiumToPlanner(idx) {
    const item = mmResults[idx];
    if (!item) return;
    addGoalToPlanner(item.a1, item.a2, item.mutA, item.b1, item.b2, item.mutB);
}

// ==========================================
// TAB 2: DUAL FUSION SANDBOX & FORMULA LAB
// ==========================================
let currentLabResult = null;

function runLabCalculator() {
    syncAllComboInputs();
    const a1 = document.getElementById("lab-a1").value;
    const a2 = document.getElementById("lab-a2").value;
    const mutA = document.getElementById("lab-mut-a").value;
    const lvlA = Math.max(1, parseInt(document.getElementById("lab-lvl-a").value) || 1);

    const b1 = document.getElementById("lab-b1").value;
    const b2 = document.getElementById("lab-b2").value;
    const mutB = document.getElementById("lab-mut-b").value;
    const lvlB = Math.max(1, parseInt(document.getElementById("lab-lvl-b").value) || 1);

    const badgeA = document.getElementById("lab-h1-badge");
    badgeA.className = `badge badge-${mutA}`;
    badgeA.textContent = MUTATION_DATA[mutA].name;

    const badgeB = document.getElementById("lab-h2-badge");
    badgeB.className = `badge badge-${mutB}`;
    badgeB.textContent = MUTATION_DATA[mutB].name;

    const res = calculateDouble(a1, a2, mutA, lvlA, b1, b2, mutB, lvlB);
    currentLabResult = res;

    document.getElementById("lab-h1-summary").innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#94a3b8;">Gen-1 Stars:</span>
            <b style="color:var(--gold);">${res.h1.finalStars} ★ (Roll ${res.h1.baseStars}★ + Spec ${res.h1.specialBonus}★ + Mut ${res.h1.mutBonus}★)</b>
        </div>
        <div style="display:flex; justify-content:space-between;">
            <span style="color:#94a3b8;">Gen-1 Base Income:</span>
            <b class="mono" style="color:var(--green-bright);">${formatMoney(res.h1.income)}</b>
        </div>
    `;

    document.getElementById("lab-h2-summary").innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#94a3b8;">Gen-1 Stars:</span>
            <b style="color:var(--gold);">${res.h2.finalStars} ★ (Roll ${res.h2.baseStars}★ + Spec ${res.h2.specialBonus}★ + Mut ${res.h2.mutBonus}★)</b>
        </div>
        <div style="display:flex; justify-content:space-between;">
            <span style="color:#94a3b8;">Gen-1 Base Income:</span>
            <b class="mono" style="color:var(--green-bright);">${formatMoney(res.h2.income)}</b>
        </div>
    `;

    document.getElementById("lab-result-name").textContent = res.fullComboName;
    document.getElementById("lab-result-sub").textContent = `DJB2 Income Seed: "${res.incomeSeed}" • Bracket Roll Percentile: ${res.bracketPct}%`;
    document.getElementById("lab-result-mut").innerHTML = `<span class="badge badge-${res.inheritedMutation}">${MUTATION_DATA[res.inheritedMutation].name}</span>`;
    document.getElementById("lab-result-stars").textContent = `${res.finalStars} ★`;
    document.getElementById("lab-result-inc").textContent = formatMoney(res.income);
    document.getElementById("lab-result-lvl").textContent = res.inheritedLevel;
    document.getElementById("lab-result-scaled").textContent = formatMoney(res.scaledIncome);

    const grid = document.getElementById("lab-formula-grid");
    grid.innerHTML = `
        <div class="formula-step">
            <div class="step-num">Step 1 • Raw Parent Stars (No Spec)</div>
            <div class="step-val">${Math.max(res.p1RawStars, res.p2RawStars)} ★</div>
            <div class="step-sub">Uses Base + Mut only: Hybrid A (${res.p1RawStars}★) vs Hybrid B (${res.p2RawStars}★). Special bonus is not counted here.</div>
        </div>
        <div class="formula-step">
            <div class="step-num">Step 2 • Weakest Raw Parent Cap</div>
            <div class="step-val">+${res.thresholdCap} ★ Max Cap</div>
            <div class="step-sub">Min raw parent is ${Math.min(res.p1RawStars, res.p2RawStars)}★ (Thresholds at 3, 9, 15, 21, 29★ unlock +1 to +5 cap).</div>
        </div>
        <div class="formula-step">
            <div class="step-num">Step 3 • Jenkins Double Roll</div>
            <div class="step-val">+${res.effectiveDoubleBonus} ★ (Rolled +${res.doubleBonus}★)</div>
            <div class="step-sub">Jenkins hash rolled +${res.doubleBonus}★, clamped by Step 2 cap (+${res.thresholdCap}★) = +${res.effectiveDoubleBonus}★.</div>
        </div>
        <div class="formula-step">
            <div class="step-num">Step 4 • 4-Parent Special Bonus</div>
            <div class="step-val">+${res.specialBonus} ★</div>
            <div class="step-sub">Highest special animal bonus among [${res.a1}, ${res.a2}, ${res.b1}, ${res.b2}], capped at 38★ max.</div>
        </div>
        <div class="formula-step">
            <div class="step-num">Step 5 • Inherited Mutation &amp; Level</div>
            <div class="step-val">${MUTATION_DATA[res.inheritedMutation].name} • Lvl ${res.inheritedLevel}</div>
            <div class="step-sub">Inherits best shiny (${res.mutA} vs ${res.mutB}) and max Treadmill Level (${lvlA} vs ${lvlB}).</div>
        </div>
    `;
}

function swapLabHybrids() {
    const a1 = document.getElementById("lab-a1").value;
    const a2 = document.getElementById("lab-a2").value;
    const mutA = document.getElementById("lab-mut-a").value;
    const lvlA = document.getElementById("lab-lvl-a").value;

    document.getElementById("lab-a1").value = document.getElementById("lab-b1").value;
    document.getElementById("lab-a2").value = document.getElementById("lab-b2").value;
    document.getElementById("lab-mut-a").value = document.getElementById("lab-mut-b").value;
    document.getElementById("lab-lvl-a").value = document.getElementById("lab-lvl-b").value;

    document.getElementById("lab-b1").value = a1;
    document.getElementById("lab-b2").value = a2;
    document.getElementById("lab-mut-b").value = mutA;
    document.getElementById("lab-lvl-b").value = lvlA;

    runLabCalculator();
}

function loadComboIntoLab(a1, a2, mutA, lvlA, b1, b2, mutB, lvlB) {
    document.getElementById("lab-a1").value = a1;
    document.getElementById("lab-a2").value = a2;
    document.getElementById("lab-mut-a").value = mutA || "none";
    document.getElementById("lab-lvl-a").value = lvlA || 1;

    document.getElementById("lab-b1").value = b1;
    document.getElementById("lab-b2").value = b2;
    document.getElementById("lab-mut-b").value = mutB || "none";
    document.getElementById("lab-lvl-b").value = lvlB || 1;

    switchTab("lab");
    showToast(`Loaded ${a1}+${a2} × ${b1}+${b2} into Formula Lab!`);
}

function pinLabToPlanner() {
    if (!currentLabResult) return;
    addGoalToPlanner(
        currentLabResult.a1, currentLabResult.a2, currentLabResult.mutA,
        currentLabResult.b1, currentLabResult.b2, currentLabResult.mutB
    );
}

function copyLabSummary() {
    if (!currentLabResult) return;
    const r = currentLabResult;
    const txt = `Impossible Animals Dual Fusion: ${r.fullComboName} | Mutation: ${r.inheritedMutation.toUpperCase()} | Stars: ${r.finalStars}★ | Base Income: $${r.income.toLocaleString()}/s | Scaled (Lvl ${r.inheritedLevel}): $${r.scaledIncome.toLocaleString()}/s`;
    copyTextToClipboard(txt, "Copied Dual Fusion summary to clipboard!");
}

// ==========================================
// TAB 3: GLOBAL ALL-TIME BEST COMBOS
// ==========================================
let globalDualData = [];
let globalPage = 1;
const GLOBAL_PAGE_SIZE = 50;

function computeGlobalDualDataset() {
    const search = document.getElementById("global-search").value.toLowerCase().trim();
    const mutA = document.getElementById("global-mut-a").value;
    const mutB = document.getElementById("global-mut-b").value;
    const depth = parseInt(document.getElementById("global-depth").value) || 120;
    const sort = document.getElementById("global-sort").value;

    globalDualData = [];

    const blocksA = [];
    const blocksB = [];
    for (let i = 0; i < ANIMALS.length; i++) {
        for (let j = i + 1; j < ANIMALS.length; j++) {
            const anA = ANIMALS[i], anB = ANIMALS[j];
            if (filterOwnedOnly && (!ownedAnimals.has(anA) || !ownedAnimals.has(anB))) continue;
            blocksA.push(calculateSingle(anA, anB, mutA));
            blocksB.push(calculateSingle(anA, anB, mutB));
        }
    }
    blocksA.sort((a, b) => b.income - a.income);
    blocksB.sort((a, b) => b.income - a.income);

    const scanLimit = Math.min(blocksA.length, depth);
    for (let i = 0; i < scanLimit; i++) {
        for (let j = i + 1; j < scanLimit; j++) {
            const h1 = blocksA[i];
            const h2 = blocksB[j];

            if (search && !h1.pLow.includes(search) && !h1.pHigh.includes(search) && !h2.pLow.includes(search) && !h2.pHigh.includes(search)) {
                continue;
            }

            const res = calculateDouble(h1.pLow, h1.pHigh, mutA, 1, h2.pLow, h2.pHigh, mutB, 1);
            globalDualData.push(res);
        }
    }

    if (sort === "income-desc") globalDualData.sort((a, b) => b.income - a.income);
    if (sort === "income-asc") globalDualData.sort((a, b) => a.income - b.income);
    if (sort === "stars-desc") globalDualData.sort((a, b) => b.finalStars !== a.finalStars ? b.finalStars - a.finalStars : b.income - a.income);
    if (sort === "stars-asc") globalDualData.sort((a, b) => a.finalStars !== b.finalStars ? a.finalStars - b.finalStars : a.income - b.income);
}

function renderGlobalDualTable() {
    const tbody = document.getElementById("global-table-body");
    const totalPages = Math.ceil(globalDualData.length / GLOBAL_PAGE_SIZE) || 1;
    globalPage = Math.min(globalPage, totalPages);

    const start = (globalPage - 1) * GLOBAL_PAGE_SIZE;
    const slice = globalDualData.slice(start, start + GLOBAL_PAGE_SIZE);

    let html = "";
    slice.forEach((item, idx) => {
        html += `
            <tr>
                <td class="rank">#${start + idx + 1}</td>
                <td style="font-weight:700; color:var(--heading); text-transform:capitalize;">${item.fullComboName}</td>
                <td><span class="badge badge-${item.inheritedMutation}">${MUTATION_DATA[item.inheritedMutation].name}</span></td>
                <td style="color:var(--gold); font-weight:800;">${item.finalStars} ★</td>
                <td class="mono" style="color:var(--green-bright); font-weight:800;">${formatMoney(item.income)}</td>
                <td><span style="font-size:12px; color:#94a3b8;">${item.bracketPct}% of ${item.finalStars}★ max</span></td>
                <td>
                    <div class="action-cell">
                        <button class="btn btn-sm btn-chat-copy" onclick="copyDualChat('${item.a1}','${item.a2}','${item.b1}','${item.b2}',${item.finalStars},${item.income},'${item.inheritedMutation}')" title="Copy Roblox Chat Reply">💬</button>
                        <button class="btn btn-sm" onclick="loadComboIntoLab('${item.a1}','${item.a2}','${item.mutA}',1,'${item.b1}','${item.b2}','${item.mutB}',1)" title="Inspect in Lab">🔬</button>
                        <button class="btn btn-sm" onclick="addGoalToPlanner('${item.a1}','${item.a2}','${item.mutA}','${item.b1}','${item.b2}','${item.mutB}')" title="Pin to Planner">📌</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;

    document.getElementById("global-page-info").textContent = `Page ${globalPage} of ${totalPages} (${globalDualData.length.toLocaleString()} combos evaluated)`;
    document.getElementById("btn-global-prev").disabled = globalPage === 1;
    document.getElementById("btn-global-next").disabled = globalPage >= totalPages;
}

function resetGlobalPage() {
    globalPage = 1;
    computeGlobalDualDataset();
    renderGlobalDualTable();
}

function changeGlobalPage(delta) {
    globalPage += delta;
    renderGlobalDualTable();
}

// ==========================================
// TAB 4: SINGLE FUSIONS (GEN 1 DATABASE)
// ==========================================
let dbItems = [];
let dbPage = 1;
const DB_PAGE_SIZE = 50;

function computeDbDataset() {
    const search = document.getElementById("db-search").value.toLowerCase().trim();
    const mut = document.getElementById("db-mut").value;
    const bonusFilter = document.getElementById("db-bonus-filter").value;
    const sort = document.getElementById("db-sort").value;

    dbItems = [];
    for (let i = 0; i < ANIMALS.length; i++) {
        for (let j = i + 1; j < ANIMALS.length; j++) {
            const a = ANIMALS[i], b = ANIMALS[j];
            if (filterOwnedOnly && (!ownedAnimals.has(a) || !ownedAnimals.has(b))) continue;
            if (search && !a.includes(search) && !b.includes(search)) continue;
            const item = calculateSingle(a, b, mut);
            if (bonusFilter !== "all" && item.specialBonus !== parseInt(bonusFilter)) continue;
            dbItems.push(item);
        }
    }

    if (sort === "income-desc") dbItems.sort((a, b) => b.income - a.income);
    if (sort === "income-asc") dbItems.sort((a, b) => a.income - b.income);
    if (sort === "stars-desc") dbItems.sort((a, b) => b.finalStars !== a.finalStars ? b.finalStars - a.finalStars : b.income - a.income);
    if (sort === "stars-asc") dbItems.sort((a, b) => a.finalStars !== b.finalStars ? a.finalStars - b.finalStars : a.income - b.income);
    if (sort === "base-desc") dbItems.sort((a, b) => b.baseStars !== a.baseStars ? b.baseStars - a.baseStars : b.income - a.income);
}

function renderDbTable() {
    const tbody = document.getElementById("db-table-body");
    const totalPages = Math.ceil(dbItems.length / DB_PAGE_SIZE) || 1;
    dbPage = Math.min(dbPage, totalPages);

    const start = (dbPage - 1) * DB_PAGE_SIZE;
    const slice = dbItems.slice(start, start + DB_PAGE_SIZE);

    let html = "";
    slice.forEach((item, idx) => {
        const specBadge = item.specialBonus > 0
            ? `<span class="chip-bonus bonus-${item.specialBonus}">+${item.specialBonus}★</span>`
            : `<span style="color:#64748b;">+0★</span>`;
        html += `
            <tr>
                <td class="rank">#${start + idx + 1}</td>
                <td style="font-weight:700; text-transform:capitalize; color:var(--heading);">${ANIMAL_ICONS[item.p1] || "🐾"} ${item.p1} + ${ANIMAL_ICONS[item.p2] || "🐾"} ${item.p2}</td>
                <td style="color:#94a3b8; font-weight:600;">${item.baseStars} ★</td>
                <td>${specBadge}</td>
                <td><span class="badge badge-${item.mutation}">${MUTATION_DATA[item.mutation].name}</span></td>
                <td style="color:var(--gold); font-weight:800;">${item.finalStars} ★</td>
                <td class="mono" style="color:var(--green-bright); font-weight:800;">${formatMoney(item.income)}</td>
                <td>
                    <div class="action-cell">
                        <button class="btn btn-sm btn-chat-copy" onclick="copySingleChat('${item.p1}','${item.p2}',${item.finalStars},${item.income},'${item.mutation}')" title="Copy Roblox Chat Reply (e.g. Glitter + stingray 18 stars 102k/s)">💬 Copy Chat</button>
                        <button class="btn btn-sm" onclick="sendSingleToMatchmaker('${item.p1}','${item.p2}','${item.mutation}')">🧬 Find Best Partner</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;

    document.getElementById("db-page-info").textContent = `Page ${dbPage} of ${totalPages} (${dbItems.length.toLocaleString()} craftable Gen-1 recipes)`;
    document.getElementById("btn-prev").disabled = dbPage === 1;
    document.getElementById("btn-next").disabled = dbPage >= totalPages;
}

function sendSingleToMatchmaker(p1, p2, mut) {
    document.getElementById("mm-a1").value = p1;
    document.getElementById("mm-a2").value = p2;
    document.getElementById("mm-mut").value = mut || "none";
    switchTab("matchmaker");
    showToast(`Loaded ${p1} + ${p2} into Matchmaker!`);
}

function resetDbPage() {
    dbPage = 1;
    computeDbDataset();
    renderDbTable();
}

function changeDbPage(delta) {
    dbPage += delta;
    renderDbTable();
}

// ==========================================
// TAB 5: BREEDING PLANNER & SAVED GOALS
// ==========================================
function addGoalToPlanner(a1, a2, mutA, b1, b2, mutB) {
    const id = `${a1}|${a2}|${mutA}|${b1}|${b2}|${mutB}`;
    if (savedGoals.some(g => g.id === id)) {
        showToast("Combo is already in your Breeding Planner!");
        return;
    }
    savedGoals.unshift({ id, a1, a2, mutA: mutA || "none", b1, b2, mutB: mutB || "none" });
    savePlannerGoals();
    showToast(`Pinned (${a1} + ${a2}) × (${b1} + ${b2}) to Planner!`);
}

function removeGoalFromPlanner(id) {
    savedGoals = savedGoals.filter(g => g.id !== id);
    savePlannerGoals();
}

function clearPlannerGoals() {
    savedGoals = [];
    savePlannerGoals();
    showToast("Cleared all saved breeding goals.");
}

function addTop3GlobalToPlanner() {
    if (globalDualData.length === 0) computeGlobalDualDataset();
    const top3 = globalDualData.slice(0, 3);
    top3.forEach(item => {
        const id = `${item.a1}|${item.a2}|${item.mutA}|${item.b1}|${item.b2}|${item.mutB}`;
        if (!savedGoals.some(g => g.id === id)) {
            savedGoals.push({
                id,
                a1: item.a1, a2: item.a2, mutA: item.mutA,
                b1: item.b1, b2: item.b2, mutB: item.mutB
            });
        }
    });
    savePlannerGoals();
    switchTab("planner");
    showToast("Pinned Top 3 Global Dual Combos to your Breeding Planner!");
}

function renderPlanner() {
    document.getElementById("planner-count-badge").textContent = savedGoals.length;
    const emptyEl = document.getElementById("planner-empty");
    const gridEl = document.getElementById("planner-grid");

    if (savedGoals.length === 0) {
        emptyEl.style.display = "block";
        gridEl.innerHTML = "";
        return;
    }
    emptyEl.style.display = "none";

    let html = "";
    savedGoals.forEach(g => {
        const calc = calculateDouble(g.a1, g.a2, g.mutA, 1, g.b1, g.b2, g.mutB, 1);
        const parents = [g.a1, g.a2, g.b1, g.b2];
        const ownedCount = parents.filter(p => ownedAnimals.has(p)).length;
        const readyBadge = ownedCount === 4
            ? `<span class="gain-pill">✅ Ready to Craft (4/4 Owned)</span>`
            : `<span class="badge" style="background:rgba(248,113,113,0.15); color:#fca5a5; border:1px solid rgba(248,113,113,0.4);">${ownedCount}/4 Base Animals Owned</span>`;

        const ingHtml = parents.map(p => {
            const has = ownedAnimals.has(p);
            return `
                <div class="ing-pill ${has ? 'owned' : 'missing'}" onclick="toggleSingleAnimalFromPlanner('${p}')" style="cursor:pointer;" title="Click to toggle ownership">
                    <span>${ANIMAL_ICONS[p] || "🐾"} ${p}</span>
                    <span>${has ? "✓" : "✕"}</span>
                </div>
            `;
        }).join("");

        html += `
            <div class="planner-card">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    ${readyBadge}
                    <span class="badge badge-${calc.inheritedMutation}">${MUTATION_DATA[calc.inheritedMutation].name}</span>
                </div>
                <div style="font-size:15.5px; font-weight:800; color:var(--heading); text-transform:capitalize;">
                    ${calc.fullComboName}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:13px; background:#070a10; padding:8px 12px; border-radius:6px; border:1px solid var(--border);">
                    <span style="color:var(--gold); font-weight:800;">${calc.finalStars} ★ Dual Hybrid</span>
                    <span class="mono" style="color:var(--green-bright); font-weight:800;">${formatMoney(calc.income)}</span>
                </div>
                <div style="font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase;">Required 4 Base Animals (Click to Toggle):</div>
                <div class="ingredient-list">${ingHtml}</div>
                <div style="display:flex; gap:6px; margin-top:4px;">
                    <button class="btn btn-sm" style="flex:1; justify-content:center;" onclick="loadComboIntoLab('${g.a1}','${g.a2}','${g.mutA}',1,'${g.b1}','${g.b2}','${g.mutB}',1)">🔬 Inspect</button>
                    <button class="btn btn-sm" onclick="removeGoalFromPlanner('${g.id}')">🗑️ Remove</button>
                </div>
            </div>
        `;
    });
    gridEl.innerHTML = html;
}

function toggleSingleAnimalFromPlanner(animal) {
    if (ownedAnimals.has(animal)) ownedAnimals.delete(animal);
    else ownedAnimals.add(animal);
    saveInventory();
}

// ==========================================
// CSV EXPORT & INVENTORY MODAL
// ==========================================
function exportCurrentTableCSV(mode) {
    let rows = [];
    let filename = "impossible_animals_export.csv";

    if (mode === "matchmaker") {
        rows.push(["Rank", "Full Dual Combo", "Partner Recipe", "Dual Stars", "Base Income ($/s)", "Scaled Income ($/s)"]);
        mmResults.slice(0, 250).forEach((r, i) => {
            rows.push([i + 1, `"${r.fullComboName}"`, `"${r.partnerRecipe}"`, r.finalStars, r.income, r.scaledIncome]);
        });
        filename = "matchmaker_top_combos.csv";
    } else if (mode === "global") {
        rows.push(["Rank", "Full Dual Combo", "Inherited Mutation", "Stars", "Base Income ($/s)"]);
        globalDualData.slice(0, 250).forEach((r, i) => {
            rows.push([i + 1, `"${r.fullComboName}"`, r.inheritedMutation, r.finalStars, r.income]);
        });
        filename = "global_best_dual_combos.csv";
    } else if (mode === "single") {
        rows.push(["Rank", "Recipe", "Base Roll Stars", "Special Bonus", "Mutation", "Final Stars", "Base Income ($/s)"]);
        dbItems.slice(0, 500).forEach((r, i) => {
            rows.push([i + 1, `"${r.name}"`, r.baseStars, r.specialBonus, r.mutation, r.finalStars, r.income]);
        });
        filename = "single_gen1_fusions.csv";
    }

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename}!`);
}

function openInventoryModal() {
    document.getElementById("inv-json-box").value = JSON.stringify([...ownedAnimals]);
    document.getElementById("inv-modal").style.display = "flex";
}

function closeInventoryModal() {
    document.getElementById("inv-modal").style.display = "none";
}

function copyInventoryJson() {
    const val = document.getElementById("inv-json-box").value;
    copyTextToClipboard(val, "Copied inventory JSON to clipboard!");
}

function importInventoryJson() {
    try {
        const raw = document.getElementById("inv-json-box").value.trim();
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
            const valid = arr.filter(x => ANIMALS.includes(x));
            ownedAnimals = new Set(valid);
            saveInventory();
            closeInventoryModal();
            showToast(`Loaded ${valid.length} unlocked animals!`);
        }
    } catch (e) {
        showToast("Invalid JSON format — please check your pasted array.");
    }
}


// =========================================================
// TAB 6: 14 WILDERNESS BIOMES & GUARANTEED ANIMAL UNLOCKS
// (Extracted from game engine: WildRules.lua & LinearWildMap.lua)
// =========================================================
const BIOMES_DATA = [
    { tier: 1, name: "Grassland", stars: 1, guard: "e1", diff: "Tutorial", color: "#4ade80", icon: "🌱", rewards: ["chicken", "dog", "cat", "sheep"] },
    { tier: 2, name: "Dense Forest", stars: 5, guard: "e3", diff: "Easy", color: "#22c55e", icon: "🌲", rewards: ["cow", "pig", "horse", "wolf"] },
    { tier: 3, name: "Scorching Desert", stars: 25, guard: "e5", diff: "Normal", color: "#eab308", icon: "🏜️", rewards: ["camel", "snake", "scorpion", "vulture"] },
    { tier: 4, name: "Subzero Tundra", stars: 125, guard: "e7", diff: "Normal+", color: "#38bdf8", icon: "❄️", rewards: ["polar bear", "penguin", "walrus", "arctic fox"] },
    { tier: 5, name: "Volcanic Caverns", stars: 600, guard: "e9", diff: "Hard", color: "#f97316", icon: "🌋", rewards: ["fire lizard", "magma hound", "lava turtle", "obsidian golem"] },
    { tier: 6, name: "Abyssal Trench", stars: 3000, guard: "e11", diff: "Hard+", color: "#06b6d4", icon: "🌊", rewards: ["anglerfish", "giant squid", "kraken spawn", "abyssal shark"] },
    { tier: 7, name: "Celestial Peaks", stars: 15000, guard: "e13", diff: "Expert", color: "#a855f7", icon: "🏔️", rewards: ["griffin", "storm eagle", "pegasus", "sky serpent"] },
    { tier: 8, name: "Shadow Realm", stars: 80000, guard: "e15", diff: "Expert+", color: "#6366f1", icon: "🌑", rewards: ["shadow panther", "phantom wolf", "nightmare steed", "void bat"] },
    { tier: 9, name: "Ancient Ruins", stars: 450000, guard: "e17", diff: "Master", color: "#ec4899", icon: "🏛️", rewards: ["sphynx", "chimera", "manticore", "ouroboros"] },
    { tier: 10, name: "Astral Expanse", stars: 2500000, guard: "e19", diff: "Master+", color: "#c084fc", icon: "🌌", rewards: ["cosmic jellyfish", "star whale", "nebula drake", "solar lion"] },
    { tier: 11, name: "Infernal Abyss", stars: 15000000, guard: "e21", diff: "Nightmare", color: "#ef4444", icon: "🔥", rewards: ["cerberus", "phoenix", "inferno wyrm", "hellhound"] },
    { tier: 12, name: "Chrono Dimension", stars: 80000000, guard: "e23", diff: "Nightmare+", color: "#facc15", icon: "⏳", rewards: ["time weaver", "chrono tiger", "aeon basilisk", "rift stalker"] },
    { tier: 13, name: "Quantum Void", stars: 200000000, guard: "e25", diff: "Mythic", color: "#818cf8", icon: "🌀", rewards: ["quantum hydra", "tachyon cheetah", "singularity worm", "void leviathan"] },
    { tier: 14, name: "The Singularity", stars: 500000000, guard: "e27", diff: "Apex", color: "#f43f5e", icon: "💠", rewards: ["singularity chimera", "void dragon", "primordial phoenix"] }
];

function formatPower(num) {
    if (num >= 1000000) return (num / 1000000).toLocaleString() + 'M';
    if (num >= 1000) return (num / 1000).toLocaleString() + 'K';
    return num.toLocaleString();
}

function selectBiomeAnimalForMatchmaker(animal) {
    selectAnimalValue("mm-a", animal);
    switchTab("matchmaker");
    showToast(`Loaded ${capFirst(animal)} into Matchmaker!`);
}

function renderBiomes() {
    const container = document.getElementById("biomes-grid");
    if (!container) return;
    const filter = (document.getElementById("biome-search")?.value || "").toLowerCase().trim();

    container.innerHTML = "";
    let matchesCount = 0;

    BIOMES_DATA.forEach(b => {
        const matchesName = b.name.toLowerCase().includes(filter);
        const matchesDiff = b.diff.toLowerCase().includes(filter);
        const matchesReward = b.rewards.some(r => r.toLowerCase().includes(filter));

        if (filter && !matchesName && !matchesDiff && !matchesReward) return;
        matchesCount++;

        const card = document.createElement("div");
        card.className = "biome-card";
        card.style.borderColor = b.color + "55";

        const rewardChips = b.rewards.map(animal => {
            const isOwned = typeof ownedAnimals !== 'undefined' && ownedAnimals.has(animal);
            const icon = (typeof ANIMAL_ICONS !== 'undefined' && ANIMAL_ICONS[animal]) || "🐾";
            const ownedTag = isOwned
                ? `<span class="biome-owned-badge owned">✓ Owned</span>`
                : `<span class="biome-owned-badge locked">🔒 Locked</span>`;
            return `
                <div class="biome-reward-chip ${isOwned ? 'is-owned' : ''}" onclick="selectBiomeAnimalForMatchmaker('${animal}')" title="Click to load ${capFirst(animal)} into Matchmaker">
                    <span>${icon}</span>
                    <span>${capFirst(animal)}</span>
                    ${ownedTag}
                </div>
            `;
        }).join("");

        card.innerHTML = `
            <div class="biome-card-top">
                <div class="biome-header-left">
                    <span class="biome-icon">${b.icon}</span>
                    <div>
                        <div class="biome-tier-label" style="color:${b.color};">Biome ${b.tier}</div>
                        <h3 class="biome-title">${b.name}</h3>
                    </div>
                </div>
                <div class="biome-badges">
                    <span class="biome-diff-badge" style="background:${b.color}22; color:${b.color}; border-color:${b.color}66">${b.diff}</span>
                </div>
            </div>
            <div class="biome-stats-row">
                <div class="biome-stat">
                    <span>Power Target</span>
                    <strong>${formatPower(b.stars)} ★</strong>
                </div>
                <div class="biome-stat">
                    <span>Boss Guard</span>
                    <strong>${b.guard}</strong>
                </div>
                <div class="biome-stat">
                    <span>Unlock Pool</span>
                    <strong>${b.rewards.length} Animals</strong>
                </div>
            </div>
            <div class="biome-rewards-section">
                <div class="biome-rewards-heading">Guaranteed Animal Unlock Rewards:</div>
                <div class="biome-rewards-grid">${rewardChips}</div>
            </div>
        `;
        container.appendChild(card);
    });

    const empty = document.getElementById("biomes-empty");
    if (empty) empty.style.display = matchesCount === 0 ? "block" : "none";
}

// Bind live search on biomes search input
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("biome-search");
    if (searchInput) {
        searchInput.addEventListener("input", renderBiomes);
    }
});


// =========================================================
// FLOATING COMMUNITY & FEEDBACK DRAWER (REAL USER POSTS ONLY)
// =========================================================
let currentCommunityFilter = "all";

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function toggleCommunityWidget(forceState) {
    const drawer = document.getElementById("community-drawer");
    if (!drawer) return;

    const isOpen = drawer.style.display === "flex";
    const newState = (forceState !== undefined) ? forceState : !isOpen;

    drawer.style.display = newState ? "flex" : "none";
    if (newState) {
        loadCommunityFeed();
        const userSaved = localStorage.getItem("ia_roblox_username") || "";
        const userInp = document.getElementById("comm-username");
        if (userInp && userSaved) userInp.value = userSaved;
    }
}

function updateCommCharCount() {
    const msg = document.getElementById("comm-message");
    const count = document.getElementById("comm-char-count");
    if (msg && count) {
        count.textContent = `${msg.value.length}/500`;
    }
}

function filterCommunityFeed(cat) {
    currentCommunityFilter = cat;
    ['all', 'feedback', 'bug', 'trade', 'discovery'].forEach(c => {
        const btn = document.getElementById(`cf-${c}`);
        if (btn) btn.classList.toggle('active', c === cat);
    });
    renderCommunityFeed();
}

function getCommunityPosts() {
    try {
        const stored = localStorage.getItem("ia_community_posts_v2");
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {}
    // Zero fake seed posts: starts empty for genuine player feedback & questions
    return [];
}

function saveCommunityPosts(posts) {
    try {
        localStorage.setItem("ia_community_posts_v2", JSON.stringify(posts));
    } catch (e) {}
}

function containsInappropriateWords(str) {
    if (!str) return false;
    const lower = str.toLowerCase();
    const badWords = [
        "nigger", "nigga", "faggot", "retard", "cunt", "bitch", "whore", "slut",
        "hitler", "nazi", "pedophile", "cp", "rape", "kill yourself", "kys"
    ];
    return badWords.some(w => lower.includes(w));
}

function submitCommunityPost() {
    const userInput = document.getElementById("comm-username");
    const msgInput = document.getElementById("comm-message");
    const catInput = document.getElementById("comm-category");

    const rawUser = (userInput?.value || "").trim().replace(/^@+/, "");
    const msg = (msgInput?.value || "").trim();
    const cat = catInput?.value || "general";

    if (!rawUser) {
        showToast("Please enter your Roblox username!");
        userInput?.focus();
        return;
    }
    if (!msg) {
        showToast("Please enter a message or feedback!");
        msgInput?.focus();
        return;
    }
    if (containsInappropriateWords(msg) || containsInappropriateWords(rawUser)) {
        showToast("Please keep messages friendly and respectful for all players!");
        return;
    }

    localStorage.setItem("ia_roblox_username", rawUser);

    const posts = getCommunityPosts();
    const newPost = {
        id: "post_" + Date.now(),
        author: "@" + rawUser,
        category: cat,
        message: msg,
        time: "Just now",
        timestamp: Date.now(),
        likes: 0,
        flagged: false
    };

    posts.unshift(newPost);
    saveCommunityPosts(posts);

    msgInput.value = "";
    updateCommCharCount();
    showToast("Feedback posted! Thank you for helping improve the wiki.");
    renderCommunityFeed();
}

function likeCommunityPost(postId) {
    const posts = getCommunityPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const likedKey = `ia_liked_${postId}`;
    if (localStorage.getItem(likedKey)) {
        post.likes = Math.max(0, (post.likes || 1) - 1);
        localStorage.removeItem(likedKey);
    } else {
        post.likes = (post.likes || 0) + 1;
        localStorage.setItem(likedKey, "1");
    }

    saveCommunityPosts(posts);
    renderCommunityFeed();
}

function flagCommunityPost(postId) {
    if (!confirm("Report and hide this comment for inappropriate content?")) return;
    const posts = getCommunityPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.flagged = true;
        saveCommunityPosts(posts);
        showToast("Comment flagged and hidden.");
        renderCommunityFeed();
    }
}

function loadCommunityFeed() {
    renderCommunityFeed();
}

function renderCommunityFeed() {
    const feed = document.getElementById("community-feed");
    if (!feed) return;

    const posts = getCommunityPosts();
    const visiblePosts = posts.filter(p => {
        if (p.flagged) return false;
        if (currentCommunityFilter === "all") return true;
        return p.category === currentCommunityFilter;
    });

    if (visiblePosts.length === 0) {
        feed.innerHTML = `
            <div style="text-align:center; padding:36px 16px; color:var(--text-muted); font-size:13px;">
                <div style="font-size:32px; margin-bottom:8px;">💬</div>
                <strong style="color:var(--heading); font-size:14px; display:block; margin-bottom:4px;">No community posts yet</strong>
                <span>Share feedback, report a bug, or post a breeding combo discovery above!</span>
            </div>
        `;
        return;
    }

    const catLabels = {
        feedback: "Feedback",
        bug: "Bug Report",
        trade: "Trading",
        discovery: "Discovery",
        general: "General"
    };

    feed.innerHTML = visiblePosts.map(p => {
        const likedKey = `ia_liked_${p.id}`;
        const isLiked = !!localStorage.getItem(likedKey);
        const catLabel = catLabels[p.category] || "General";
        const cleanName = (p.author || "@Player").replace(/^@/, "");
        const initial = (cleanName[0] || "U").toUpperCase();
        const safeAuthor = escapeHtml(p.author || "@Player");
        const safeMsg = escapeHtml(p.message || "");

        return `
            <div class="comm-card" id="${p.id}">
                <div class="comm-card-top">
                    <div class="comm-author-wrap">
                        <span class="comm-avatar">${initial}</span>
                        <span class="comm-username">${safeAuthor}</span>
                    </div>
                    <span class="comm-tag ${p.category}">${catLabel}</span>
                </div>
                <div class="comm-body">${safeMsg}</div>
                <div class="comm-card-bottom">
                    <span>${p.time || "Recently"}</span>
                    <div class="comm-actions">
                        <button class="comm-act-btn" onclick="likeCommunityPost('${p.id}')">
                            <span>${isLiked ? '❤️' : '🤍'}</span>
                            <span>${p.likes || 0}</span>
                        </button>
                        <button class="comm-act-btn flag" onclick="flagCommunityPost('${p.id}')" title="Flag inappropriate comment">
                            🚩 Flag
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}


// =========================================================
// TAB SWITCHER (6 MAIN TABS + COMMUNITY DRAWER)
// =========================================================
function switchTab(tab) {
    if (tab === 'community') {
        if (typeof toggleCommunityWidget === 'function') toggleCommunityWidget(true);
        return;
    }

    const tabs = ['matchmaker', 'lab', 'global', 'single', 'planner', 'biomes'];
    tabs.forEach(t => {
        const btn = document.getElementById(`btn-tab-${t}`);
        const panel = document.getElementById(`panel-${t}`);
        if (btn) btn.classList.toggle('active', t === tab);
        if (panel) panel.style.display = t === tab ? 'block' : 'none';
    });

    if (tab === 'matchmaker') runMatchmaker();
    if (tab === 'lab') runLabCalculator();
    if (tab === 'global') resetGlobalPage();
    if (tab === 'single') resetDbPage();
    if (tab === 'planner') renderPlanner();
    if (tab === 'biomes') renderBiomes();
    if (location.hash !== '#' + tab) history.replaceState(null, '', '#' + tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    loadState();
    renderBiomes();
    const h = location.hash.replace('#','');
    if (h === 'community') {
        switchTab('matchmaker');
        if (typeof toggleCommunityWidget === 'function') toggleCommunityWidget(true);
    } else if (['matchmaker','lab','global','single','planner','biomes'].includes(h)) {
        switchTab(h);
    } else {
        switchTab('matchmaker');
    }
});
