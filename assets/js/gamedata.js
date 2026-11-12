// Game constants, transcribed from the game's own modules
// (FusionRating, CreatureIncome, ShinyRules, CharmRules, AnimalUnlocks, WildRules, AnimalReleases, PenEconomy).

export const GAME_URL = "https://www.roblox.com/games/119929094294460/Impossible-Animals";

// FusionRating.weights — star roll buckets (index 0 => 3 stars ... index 17 => 20 stars)
export const WEIGHTS = [250000, 225690, 157983, 110588, 77412, 54188, 37932, 26552, 18587, 13011, 9107, 6375, 4463, 3124, 2187, 1531, 1070, 200];

// FusionRating.SPECIAL_BONUS — extra stars when either parent is one of these
export const SPECIAL_BONUS = {
  "ruby": 1, "electricity": 2, "lava": 2, "uranium": 2, "aurora": 2, "black-hole": 3, "clouds": 1, "glitter": 1,
  "jade": 1, "water": 1, "psychic-power": 2, "plasma": 2, "solar-eclipse": 3, "ghost": 1, "mummy": 1, "robot": 1,
  "blender": 2, "boba-tea": 1, "lava-lamp": 2, "quadcopter": 1
};

// FusionRating.STARTER_SPECIALS — fusions with these get a capped star roll
export const STARTER_SPECIALS = ["bismuth", "ninja", "fighter-jet", "giant-eyeball", "glitch"];

// FusionRating starter list used for the cap (the 26 classic starters)
export const CLASSIC_STARTERS = ["crab", "rhino", "warthog", "t-rex", "jerboa", "ant", "spider", "cheetah", "axolotl", "dolphin",
  "dragonfly", "fox", "giraffe", "monkey", "red panda", "venus-fly-trap", "owl", "turtle", "car", "cotton-candy", "crocodile",
  "orangutan", "stingray", "toilet", "cheeseburger", "shark"];

// AnimalUnlocks.starters — everyone owns these from the start
export const STARTERS = [...CLASSIC_STARTERS, ...STARTER_SPECIALS];

// CreatureIncome.ranges — $/s range per star tier
export const INCOME_RANGES = {
  3: [1, 2], 4: [3, 5], 5: [6, 9], 6: [10, 19], 7: [20, 49], 8: [50, 99], 9: [100, 199], 10: [200, 499], 11: [500, 999],
  12: [1000, 1900], 13: [2000, 4900], 14: [5000, 9900], 15: [10000, 19900], 16: [20000, 49900], 17: [50000, 99900],
  18: [100000, 199900], 19: [200000, 499900], 20: [500000, 999900], 21: [1000000, 1990000], 22: [2000000, 4990000],
  23: [5000000, 9990000], 24: [10000000, 19990000], 25: [20000000, 49990000], 26: [50000000, 99990000],
  27: [100000000, 199990000], 28: [200000000, 499990000], 29: [500000000, 999990000], 30: [1000000000, 3000000000],
  31: [3000000001, 5999999999], 32: [6000000000, 11999999999], 33: [12000000000, 23999999999],
  34: [24000000000, 47999999999], 35: [48000000000, 95999999999], 36: [96000000000, 191999999999],
  37: [192000000000, 383999999999], 38: [384000000000, 767999999999]
};
export const MAX_STARS = 38;

// ShinyRules.types
export const SHINIES = {
  golden:     { name: "Golden",     bonus: 2,  denominator: 10,  colors: ["#824b15", "#b87f1e", "#e4ae32", "#ffdd68", "#fff735"] },
  diamond:    { name: "Diamond",    bonus: 4,  denominator: 25,  colors: ["#2569a6", "#50a9eb", "#96dcff", "#d6f0ff", "#00eaff"] },
  iridescent: { name: "Iridescent", bonus: 6,  denominator: 100, colors: ["#3d427e", "#37adad", "#bd69cc", "#c5f082", "#75ffef"] },
  chaos:      { name: "Chaos",      bonus: 10, denominator: 250, colors: ["#110e18", "#2e1220", "#661327", "#ed2345", "#ff092c"] }
};
export const SHINY_ORDER = ["golden", "diamond", "iridescent", "chaos"];
export const FRIEND_MULTIPLIER = 10;
export const FIRST_GOLD_FUSION = 3;

// CharmRules tiers: [name, income multiplier, cash price, robux, colour]
export const CHARMS = [
  ["Ember", 1.5, 100, 0, "#FF7135"],
  ["Jade", 2, 5000, 19, "#45ECA0"],
  ["Arcane", 2.5, 25000, 29, "#B384FF"],
  ["Gilded", 3, 150000, 49, "#FFD15A"],
  ["Diamond", 3.5, 1000000, 79, "#85E6FF"],
  ["Radioactive", 4, 10000000, 119, "#A3FF24"],
  ["Chaos", 5, 150000000, 199, "#FF438A"],
  ["Celestial", 7, 3000000000, 349, "#8BAAFF"],
  ["Iridescent", 10, 80000000000, 599, "#EAB6FF"],
  ["Divine", 20, 300000000000000, 999, "#FFF0A0"]
].map(([name, multiplier, cash, robux, color], i) => ({ tier: i + 1, name, multiplier, cash, robux, color }));

// WildRules — 14 biomes. Each 5-minute cycle one animal is picked from each reward list.
const DIFF = ["Easy", "Medium", "Hard", "Brutal", "Extreme", "Merciless", "Nightmare", "Infernal", "Cataclysmic", "Apocalyptic", "Armageddon", "Oblivion", "Godslayer", "Reality Shattering"];
const DIFF_EMOJI = ["😊", "😐", "😠", "💪", "⚡", "😈", "👻", "🔥", "🌋", "☢️", "💥", "💀", "⚔️", "🌌"];
const RECOMMENDED = [1, 10, 125, 350, 4250, 17500, 100000, 550000, 3750000, 40000000, 120000000, 300000000, 425000000, 500000000];
const NAMES = ["Grasslands", "Desert", "Mushroom Marsh", "Arctic", "Jungle Ruins", "Redrock Canyon", "Crystal Caverns", "Haunted Forest", "Storm Peaks", "Acid Wastes", "Volcanic Fields", "Obsidian Wastes", "Shattered Moon", "Cosmic Abyss"];
const REWARDS = [["brachiosaurus", "gorilla", "tank", "traffic-cone"], ["demon", "mosasaurus", "wasp"], ["chicken", "velociraptor", "zombie"], ["ankylosaurus", "ferret", "pterodactyl"], ["french-fries", "millipede", "panther", "tiger"], ["cowboy", "ramen", "stegosaurus"], ["broccoli", "coral", "eagle", "excavator"], ["beetle", "cobra", "elephant", "pirate"], ["moose", "pizza", "pufferfish", "samurai"], ["dragon", "helicopter", "octopus", "zebra"], ["bamboo", "banana", "mermaid", "scorpion"], ["cactus", "carrot", "human-man", "jellyfish", "mushroom"], ["anglerfish", "butterfly", "narwhal", "praying-mantis", "wolf"], ["bicycle", "goat", "skeleton", "strawberry", "triceratops"]];
const BIOME_COLORS = ["#5bd06b", "#f2b544", "#c27be0", "#8fd8ff", "#3fae6a", "#e0703c", "#7fd6ff", "#7b5ea7", "#8aa0b8", "#a5e03c", "#ff6b3d", "#4b4b6e", "#c9c9d6", "#6b4bd6"];
const BIOME_ICONS = ["🌱", "🏜️", "🍄", "❄️", "🌴", "🏞️", "💎", "🌲", "⛈️", "🧪", "🌋", "🪨", "🌙", "🌌"];
// Fusion-token drop chance per tier (DoubleFusionRules.tokenChance)
const tokenChance = t => t <= 4 ? 0.04 : t <= 9 ? 0.125 : 0.18;
export const BIOMES = NAMES.map((name, i) => ({
  tier: i + 1, name, difficulty: DIFF[i], emoji: DIFF_EMOJI[i], recommended: RECOMMENDED[i],
  rewards: REWARDS[i], color: BIOME_COLORS[i], icon: BIOME_ICONS[i], tokenChance: tokenChance(i + 1)
}));
export const WILD_RESET_SECONDS = 300;

// AnimalReleases.SCHEDULE (UTC)
export const RELEASES = {
  "pizza": "2026-10-27T15:00:00Z", "mosasaurus": "2026-10-28T14:00:00Z", "carrot": "2026-10-29T14:00:00Z",
  "scorpion": "2026-10-30T14:00:00Z", "ghost": "2026-10-31T14:00:00Z", "cotton-candy": "2026-11-01T14:00:00Z",
  "ramen": "2026-11-02T14:00:00Z", "brachiosaurus": "2026-11-03T14:00:00Z", "cactus": "2026-11-04T14:00:00Z",
  "mushroom": "2026-11-05T14:00:00Z", "bamboo": "2026-11-06T14:00:00Z", "broccoli": "2026-11-07T14:00:00Z",
  "pirate": "2026-11-10T14:00:00Z", "bicycle": "2026-11-12T14:00:00Z", "french-fries": "2026-11-14T14:00:00Z",
  "samurai": "2026-11-16T14:00:00Z", "helicopter": "2026-11-18T14:00:00Z", "traffic-cone": "2026-11-20T14:00:00Z"
};

// PenEconomy — pen upgrades (capacity = 4 + level - 1)
export const PEN_PRICES = { 2: 1000, 3: 100000, 4: 2500000, 5: 60000000, 6: 1500000000, 7: 40000000000, 8: 1000000000000, 9: 25000000000000, 10: 500000000000000, 11: 6000000000000000 };
export const OFFLINE_MULTIPLIER_PASS = 3;
export const MAX_LEVEL = 500000000;
