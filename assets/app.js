
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


// =========================================================
// 🗺️ 14 WILDERNESS BIOMES & GUARANTEED UNLOCKS GUIDE
// =========================================================
const BIOMES_DATA = [
    { tier: 1, name: "Grasslands", diff: "Easy", stars: 1, guard: "e1", rewards: ["owl", "skeleton", "turtle"], color: "#10b981", icon: "🌱" },
    { tier: 2, name: "Desert", diff: "Medium", stars: 10, guard: "e2 / e3", rewards: ["car", "cowboy", "millipede"], color: "#fbbf24", icon: "🏜️" },
    { tier: 3, name: "Mushroom Marsh", diff: "Hard", stars: 125, guard: "e4 / e5", rewards: ["crocodile", "orangutan", "stegosaurus"], color: "#c084fc", icon: "🍄" },
    { tier: 4, name: "Arctic", diff: "Brutal", stars: 350, guard: "e6 / e7", rewards: ["ankylosaurus", "demon", "tank", "wasp"], color: "#38bdf8", icon: "❄️" },
    { tier: 5, name: "Jungle Ruins", diff: "Extreme", stars: 4250, guard: "e8 / e9", rewards: ["gorilla", "stingray", "toilet", "velociraptor"], color: "#34d399", icon: "🌴" },
    { tier: 6, name: "Redrock Canyon", diff: "Merciless", stars: 17500, guard: "e10 / e11", rewards: ["cheeseburger", "chicken", "pterodactyl", "zombie"], color: "#fb923c", icon: "🏜️" },
    { tier: 7, name: "Crystal Caverns", diff: "Nightmare", stars: 100000, guard: "e12 / e13", rewards: ["coral", "excavator", "ferret", "moose"], color: "#f472b6", icon: "💎" },
    { tier: 8, name: "Haunted Forest", diff: "Infernal", stars: 550000, guard: "e14 / e15", rewards: ["eagle", "panther", "tiger"], color: "#a855f7", icon: "👻" },
    { tier: 9, name: "Storm Peaks", diff: "Cataclysmic", stars: 3750000, guard: "e16 / e17", rewards: ["beetle", "cobra", "elephant", "octopus"], color: "#60a5fa", icon: "⚡" },
    { tier: 10, name: "Acid Wastes", diff: "Apocalyptic", stars: 40000000, guard: "e18 / e19", rewards: ["dragon", "mermaid", "pufferfish", "zebra"], color: "#22c55e", icon: "🧪" },
    { tier: 11, name: "Volcanic Fields", diff: "Armageddon", stars: 120000000, guard: "e20 / e21", rewards: ["banana", "human-man", "narwhal"], color: "#ef4444", icon: "🌋" },
    { tier: 12, name: "Obsidian Wastes", diff: "Oblivion", stars: 300000000, guard: "e22 / e23", rewards: ["jellyfish", "praying-mantis", "wolf"], color: "#818cf8", icon: "🌑" },
    { tier: 13, name: "Shattered Moon", diff: "Godslayer", stars: 425000000, guard: "e24 / e25", rewards: ["butterfly", "goat", "shark"], color: "#e879f9", icon: "🌙" },
    { tier: 14, name: "Cosmic Abyss", diff: "Reality Shattering", stars: 500000000, guard: "e26 / e27", rewards: ["anglerfish", "strawberry", "triceratops"], color: "#f43f5e", icon: "🌌" }
];

function formatPower(num) {
    if (num >= 1000000) return (num / 1000000).toLocaleString() + "M";
    if (num >= 1000) return (num / 1000).toLocaleString() + "K";
    return num.toString();
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

// =========================================================
// 💬 FLOATING COMMUNITY & FEEDBACK DRAWER SYSTEM
// =========================================================
let communityFilter = "all";
let flaggedPostIds = new Set(JSON.parse(localStorage.getItem("ia_flagged_posts") || "[]"));

const INITIAL_COMMUNITY_POSTS = [
    {
        id: "post_dev_1",
        user: "TatayDigs",
        role: "Creator",
        category: "feedback",
        message: "Welcome to the Impossible Animals community! Have feature suggestions or found a new 20★ recipe? Post it here or in GitHub Discussions!",
        time: "Pinned",
        likes: 42
    },
    {
        id: "post_dev_2",
        user: "Amashing0411",
        role: "Maintainer",
        category: "discovery",
        message: "Tip: Rush Biome 10 (Acid Wastes) to unlock Dragon. Fusing Dragon + Tiger rolls a guaranteed 18★ base rating with massive coin scaling!",
        time: "1h ago",
        likes: 28
    },
    {
        id: "post_user_3",
        user: "QuantumBreeder",
        role: "Player",
        category: "discovery",
        message: "Black Hole + Solar Eclipse dual fusion gives +6 stars from special elements alone! Highly recommend saving tokens for this combo.",
        time: "3h ago",
        likes: 19
    },
    {
        id: "post_user_4",
        user: "RobloxTrader",
        role: "Player",
        category: "trade",
        message: "Looking for partners for Uranium! Any high-star recommendations with standard animals?",
        time: "5h ago",
        likes: 11
    }
];

let communityPosts = JSON.parse(localStorage.getItem("ia_community_posts_v3") || "null");
if (!communityPosts || communityPosts.length === 0) {
    communityPosts = INITIAL_COMMUNITY_POSTS;
    localStorage.setItem("ia_community_posts_v3", JSON.stringify(communityPosts));
}

function toggleCommunityWidget() {
    const drawer = document.getElementById("community-drawer");
    if (!drawer) return;
    const isHidden = drawer.style.display === "none" || drawer.style.display === "";
    drawer.style.display = isHidden ? "flex" : "none";
    if (isHidden) {
        renderCommunityFeed();
        const savedUser = localStorage.getItem("ia_roblox_username") || "";
        const uInput = document.getElementById("comm-username");
        if (uInput && !uInput.value) uInput.value = savedUser;
    }
}

function filterCommunityFeed(cat) {
    communityFilter = cat;
    document.querySelectorAll(".cf-btn").forEach(btn => {
        btn.classList.toggle("active", btn.id === "cf-" + cat);
    });
    renderCommunityFeed();
}

function updateCommCharCount() {
    const txt = document.getElementById("comm-message")?.value || "";
    const counter = document.getElementById("comm-char-count");
    if (counter) counter.innerText = `${txt.length}/500`;
}

function containsInappropriateWords(str) {
    const banned = ["scam", "free robux", "f**k", "bitch", "nigger", "cunt", "whore", "asshole", "retard", "dick", "pussy", "stfu"];
    const lower = str.toLowerCase();
    return banned.some(word => lower.includes(word));
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
        showToast("Please keep messages friendly and safe for all players!");
        return;
    }

    // Save username for next time
    localStorage.setItem("ia_roblox_username", rawUser);

    const newPost = {
        id: "post_" + Date.now(),
        user: rawUser,
        role: "Player",
        category: cat,
        message: msg,
        time: "Just now",
        likes: 0
    };

    communityPosts.unshift(newPost);
    localStorage.setItem("ia_community_posts_v3", JSON.stringify(communityPosts));

    if (msgInput) msgInput.value = "";
    updateCommCharCount();
    renderCommunityFeed();
    showToast("Posted to Community!");
}

function likeCommunityPost(postId) {
    const post = communityPosts.find(p => p.id === postId);
    if (!post) return;
    post.likes = (post.likes || 0) + 1;
    localStorage.setItem("ia_community_posts_v3", JSON.stringify(communityPosts));
    renderCommunityFeed();
    showToast("Liked!");
}

function flagCommunityPost(postId) {
    if (!confirm("Report this post as inappropriate or spam?")) return;
    flaggedPostIds.add(postId);
    localStorage.setItem("ia_flagged_posts", JSON.stringify(Array.from(flaggedPostIds)));
    renderCommunityFeed();
    showToast("Post reported and hidden.");
}

function unhideFlaggedPost(postId) {
    flaggedPostIds.delete(postId);
    localStorage.setItem("ia_flagged_posts", JSON.stringify(Array.from(flaggedPostIds)));
    renderCommunityFeed();
}

function renderCommunityFeed() {
    const container = document.getElementById("community-feed");
    if (!container) return;

    const filtered = communityPosts.filter(p => {
        if (communityFilter === "all") return true;
        return p.category === communityFilter;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:32px 14px; color:#94a3b8; font-size:13px;">
                No posts in this category yet. Be the first to post!
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(p => {
        const isFlagged = flaggedPostIds.has(p.id);
        const tagNames = {
            feedback: "💡 Feedback",
            bug: "🐛 Bug Report",
            trade: "🤝 Trade / Breed",
            discovery: "✨ 20★ Combo",
            general: "💬 Discussion"
        };
        const tagName = tagNames[p.category] || "💬 Discussion";
        const initial = p.user.charAt(0).toUpperCase();

        if (isFlagged) {
            return `
                <div class="comm-card flagged">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:12px; color:#f87171;">⚠️ [Flagged by community as inappropriate]</span>
                        <button class="comm-act-btn" onclick="unhideFlaggedPost('${p.id}')">Reveal</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="comm-card">
                <div class="comm-card-top">
                    <div class="comm-author-wrap">
                        <div class="comm-avatar">${initial}</div>
                        <div>
                            <span class="comm-username">@${p.user}</span>
                            ${p.role === 'Creator' ? '<span class="comm-tag" style="background:#0ea5e926; color:#38bdf8; border:1px solid #38bdf866; margin-left:4px;">CREATOR</span>' : ''}
                        </div>
                    </div>
                    <span class="comm-tag ${p.category}">${tagName}</span>
                </div>
                <div class="comm-body">${escapeHtml(p.message)}</div>
                <div class="comm-card-bottom">
                    <span>${p.time}</span>
                    <div class="comm-actions">
                        <button class="comm-act-btn" onclick="likeCommunityPost('${p.id}')">👍 ${p.likes || 0}</button>
                        <button class="comm-act-btn flag" onclick="flagCommunityPost('${p.id}')" title="Flag as inappropriate">🚩 Flag</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// =========================================================
// TAB SWITCHER
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
