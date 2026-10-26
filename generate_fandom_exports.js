const fs = require('fs');

const appJsCode = fs.readFileSync('assets/app.js', 'utf8');

global.window = global;
global.document = {
    addEventListener: () => {},
    getElementById: () => ({ value: "none" })
};

eval(appJsCode + `
global.ANIMALS = ANIMALS;
global.calculateSingle = calculateSingle;
global.formatMoney = formatMoney;
`);

function capFirst(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatFormula(a, b) {
    return `${capFirst(a)} + ${capFirst(b)}`;
}

// Known portmanteau map from player screenshots
const KNOWN_NAMES = {
    "stegosaurus|wasp": "Stegosawasp",
    "cowboy|wasp": "Cowasp",
    "owl|wasp": "Waspowl",
    "axolotl|wasp": "Axolowasp",
    "ankylosaurus|wasp": "Ankylosawasp",
    "millipede|wasp": "Waspede",
    "wasp|zombie": "Waspombie",
    "velociraptor|wasp": "Velocirawasp",
    "moose|wasp": "Moowasp",
    "rhino|wasp": "Rhiwasp",
    "cheeseburger|wasp": "Cheesebuwasp",
    "crocodile|wasp": "Crocowasp",
    "excavator|wasp": "Excavwasp",
    "fox|wasp": "Foxwasp",
    "warthog|wasp": "Warthowasp",
    "dolphin|wasp": "Waspin",
    "skeleton|wasp": "Skelwasp",
    "car|wasp": "Carwasp",
    "spider|wasp": "Waspider",
    "ferret|wasp": "Ferrewasp",
    "ferret|zombie": "Ferrembie",
    "ferret|moose": "Moorret",
    "ferret|red panda": "Redparret",
    "ferret|millipede": "Milliperret",
    "ferret|spider": "Ferrider",
    "ferret|owl": "Ferrowl",
    "ferret|giraffe": "Ferraffe",
    "ferret|stingray": "Stingret",
    "ferret|t-rex": "Ferretrex",
    "ferret|warthog": "Waret",
    "cheetah|ferret": "Cheerret",
    "ferret|rhino": "Ferrino",
    "excavator|ferret": "Excavarret",
    "ant|ferret": "Ferrant",
    "ferret|orangutan": "Ferrangutan",
    "crocodile|ferret": "Ferrocodile",
    "ankylosaurus|ferret": "Ankylosarret",
    "axolotl|ferret": "Axolorret",
    "car|ferret": "Cawret",
    "cowboy|ferret": "Cowberret",
    "ferret|skeleton": "Skelegoret",
    "ferret|venus-fly-trap": "Venusflyrret",
    "cheeseburger|ferret": "Cheeseburet",
    "cheetah|velociraptor": "Cheeciraptor",
    "skeleton|velociraptor": "Skelociraptor",
    "fox|velociraptor": "Velocirafox",
    "velociraptor|venus-fly-trap": "Venusflytraptor",
    "spider|velociraptor": "Velocider",
    "dragonfly|velociraptor": "Velociragonfly",
    "ankylosaurus|velociraptor": "Velosaurus",
    "t-rex|velociraptor": "Velociratrex",
    "cowboy|velociraptor": "Velocirawboy",
    "axolotl|velociraptor": "Axolociraptor",
    "cheeseburger|velociraptor": "Cheeseburaptor",
    "turtle|velociraptor": "Velocirtle",
    "millipede|velociraptor": "Milliraptor",
    "excavator|velociraptor": "Velociravator",
    "stegosaurus|velociraptor": "Stegosaptor",
    "rhino|velociraptor": "Rhiraptor",
    "orangutan|velociraptor": "Velocirangutan",
    "tank|velociraptor": "Velociraptank",
    "jerboa|velociraptor": "Velocirboa",
    "crocodile|velociraptor": "Crociraptor",
    "red panda|velociraptor": "Velocirapanda",
    "dolphin|velociraptor": "Dolphiraptor",
    "velociraptor|zombie": "Zombiraptor",
    "monkey|velociraptor": "Velocirankey",
    "giraffe|velociraptor": "Giraptor",
    "velociraptor|warthog": "Velocirarthog",
    "gorilla|velociraptor": "Velocirilla",
    "chicken|velociraptor": "Velocicken",
    "owl|velociraptor": "Owlociraptor",
    "ferret|velociraptor": "Ferraptor",
    "stingray|velociraptor": "Stingraptor",
    "ant|velociraptor": "Velocirant",
    "moose|velociraptor": "Moociraptor",
    "car|velociraptor": "Caraptor",
    "crocodile|gorilla": "Crocodilla",
    "cheeseburger|millipede": "Milleburger",
    "goat|skeleton": "Skelegoat"
};

function getHybridName(a, b) {
    const key1 = `${a}|${b}`;
    const key2 = `${b}|${a}`;
    if (KNOWN_NAMES[key1]) return KNOWN_NAMES[key1];
    if (KNOWN_NAMES[key2]) return KNOWN_NAMES[key2];
    return `${capFirst(a)}-${capFirst(b)}`;
}

console.log("Generating combinations for all 77 animals...");
const combos = [];
for (let i = 0; i < ANIMALS.length; i++) {
    for (let j = i + 1; j < ANIMALS.length; j++) {
        const a1 = ANIMALS[i];
        const a2 = ANIMALS[j];
        const calc = calculateSingle(a1, a2, "none", 1);
        combos.push({
            p1: a1,
            p2: a2,
            formula: formatFormula(a1, a2),
            hybrid: getHybridName(a1, a2),
            stars: calc.finalStars,
            income: calc.income,
            incomeFmt: formatMoney(calc.income) // Already formatted with $ and /s
        });
    }
}

// 1. Build Top Combos Summary (10 Stars and above: 331 combos)
const highTier = combos.filter(c => c.stars >= 10);
highTier.sort((a, b) => b.income !== a.income ? b.income - a.income : b.stars - a.stars);

let highTierWiki = `{{DISPLAYTITLE:Fusion Database - Top Single Hybrids}}

The '''Top Single Hybrids''' table lists the highest-yielding single fusion combinations in ''Impossible Animals'' (10★ to 21★), sorted by maximum standard cash-per-second income.

== Community Tools & Matchmaker ==
* '''[https://discord.gg/mXKUsgmUD3 Impossible Animals Official Community Discord & Web Wiki]''' — Access the interactive breeding calculator, test dual fusions, and find optimal breeding paths.

== Top Tier Single Fusions (10★ to 21★) ==

{| class="wikitable sortable"
! Rank !! Hybrid !! Parents !! Stars !! Income shown !! Variant !! Method / origin
`;

highTier.forEach((c, idx) => {
    highTierWiki += `|-
| #${idx + 1} || ${c.hybrid} || ${c.formula} || data-sort-value="${c.stars}" | ${c.stars}★ || data-sort-value="${c.income}" | ${c.incomeFmt} || Standard || Fusion
`;
});
highTierWiki += `|}

[[Category:Game Guides]]
[[Category:Fusions]]
[[Category:Database]]
`;

fs.writeFileSync('fandom_fusion_top_combos_summary.txt', highTierWiki, 'utf8');
console.log(`Saved fandom_fusion_top_combos_summary.txt (${highTier.length} top combos)`);


// 2. Build Complete 2,926 Combos Master File (Grouped by Animal A-Z)
let fullWiki = `{{DISPLAYTITLE:Fusion Database - Complete Single Hybrids (All 2,926 Combos)}}

'''Fusion Database''' documents all 2,926 single hybrid combinations in ''Impossible Animals''. Every combination is deterministic based on the underlying Jenkins hash algorithm and star bracket ranges.

== Community Tools & Discord ==
* '''[https://discord.gg/mXKUsgmUD3 Impossible Animals Official Community Discord & Wiki Project]''' — Use our free interactive web calculator to simulate any 4-parent dual fusion, test breeding paths, and coordinate trades.

== Mechanics Quick Reference ==
* '''Golden Shiny:''' +2★ to final roll
* '''Diamond Shiny:''' +4★ to final roll
* '''Iridescent Shiny:''' +6★ to final roll
* '''Chaos Shiny:''' +10★ to final roll

`;

ANIMALS.forEach(animal => {
    const animalCombos = combos.filter(c => c.p1 === animal || c.p2 === animal);
    animalCombos.sort((a, b) => b.stars !== a.stars ? b.stars - a.stars : b.income - a.income);
    
    fullWiki += `== ${capFirst(animal)} Fusions ==\n\n`;
    fullWiki += `{| class="wikitable sortable"\n! Hybrid !! Parents !! Stars !! Income shown !! Variant !! Method / origin\n`;
    animalCombos.forEach(c => {
        fullWiki += `|-\n| ${c.hybrid} || ${c.formula} || data-sort-value="${c.stars}" | ${c.stars}★ || data-sort-value="${c.income}" | ${c.incomeFmt} || Standard || Fusion\n`;
    });
    fullWiki += `|}\n\n`;
});

fullWiki += `[[Category:Game Guides]]\n[[Category:Fusions]]\n[[Category:Database]]\n`;

fs.writeFileSync('fandom_fusion_database_all_combos.txt', fullWiki, 'utf8');
console.log(`Saved fandom_fusion_database_all_combos.txt (All 77 animal sections with 2,926 combinations)`);
