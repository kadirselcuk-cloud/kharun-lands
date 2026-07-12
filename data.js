// ============================================================
// KHARUN LANDS — Game Data
// ============================================================
'use strict';

const DATA = {};

DATA.VERSION = '1.3.0';

// ------------------------------------------------------------
// Classes
// ------------------------------------------------------------
DATA.CLASSES = {
  warrior: {
    id: 'warrior', name: 'Warrior', heroName: 'Kharun', icon: '⚔️',
    desc: 'A front-line bruiser. High Strength and Dexterity make him a wall of HP that hits like a falling tower.',
    story: 'Kharun was born to a noble house that still claims descent from the ancient king whose name he carries — a birthright he never much wanted. He earned his rank in the legion honestly, until twenty years ago outside Harvestgate, when a comrade he trusted like a brother sold out his position to cover his own failure, leaving Kharun\'s unit slaughtered and Kharun himself branded a deserter rather than let the truth reach command. He\'s let the record stand ever since; a war of paperwork against a man with more friends than he has surviving soldiers isn\'t one he can win. These days he goes by no house name, takes any contract that pays, and has learned that a good mercenary is judged by results, not questions — which suits a man with plenty to hide, and a debt twenty years overdue.',
    playstyle: 'Play Kharun if you want to survive mistakes: the deepest HP pool, heavy armor, stuns, and damage reduction. He grinds through packs slowly but almost never dies.',
    baseStats: { str: 11, dex: 9, int: 5 },   // total 25, min 5
    mainStat: 'str',
    armorWeights: ['heavy', 'medium', 'light'],
  },
  rogue: {
    id: 'rogue', name: 'Rogue', heroName: 'Pars', icon: '🗡️',
    desc: 'A blur of blades. Highest Dexterity, solid Strength — strikes fast, dodges often, and bleeds enemies dry.',
    story: 'Young, talented well past what his experience should allow, and cocky in the way people are before they\'ve been humbled — Pars is the kind of natural who makes guild veterans nervous. What he didn\'t know when he joined was that the guild\'s masters had already traded its soul for its success: a pact with something that answers to the Fracture\'s pull, paid for in the loyalty, and eventually the lives, of its most promising rogues. Pars was never meant to survive his first real contract. He did, and kept surviving, until the guild stopped bothering to hide that they wanted him gone — not for running, but for being good enough to eventually notice what they\'d become. The trail leads through every dark corner of the Kharun Lands, and he was never one to leave a job unfinished. Especially not this one.',
    playstyle: 'Play Pars if you want tempo: the highest Speed means extra actions every round, high Evasion turns hits into misses, and resistance-piercing strikes shred tough enemies. Fast, slippery, and lethal — but thinner armor punishes bad odds.',
    baseStats: { str: 8, dex: 12, int: 5 },
    mainStat: 'dex',
    armorWeights: ['medium', 'light'],
  },
  mage: {
    id: 'mage', name: 'Mage', heroName: 'Minnie', icon: '🔮',
    desc: 'A glass cannon of raw Intelligence. Fragile, but with a deep pool of mana and devastating spells.',
    story: 'The last student of the Sunken Academy, Minnie was still an apprentice when one of her own masters was revealed as a secret summoner in service of an ancient demon — years of quiet ritual work disguised as scholarship, until the night he used the Academy\'s own rites to fling its doors open from the inside. The masters who caught it in time didn\'t have the strength left to undo what he\'d started; they had only enough to seal themselves inside the vaults with it, buying the world time they never expected to spend themselves. Minnie survived because she was sent running for help that arrived too late. Experienced and warm where the others are guarded, she\'s become the group\'s actual grown-up — the one who patches wounds, talks sense into the reckless, and asks the hard questions nobody else wants to ask. She carries the only key left — her own mind, and everything she saw that night — and a debt she intends to pay in full.',
    playstyle: 'Play Minnie if you want raw power: the biggest hits in the game, huge mana reserves, the strongest heal, and area spells that erase whole packs. Magic damage ignores armor entirely — but her low HP means the best defense is a dead enemy.',
    baseStats: { str: 5, dex: 7, int: 13 },
    mainStat: 'int',
    armorWeights: ['light'],
  },
};

// Opening-screen prelude, shown once before the hero is chosen.
DATA.PRELUDE = {
  title: 'The Contract',
  paragraphs: [
    'Long before the prophecy, there was a king. Kharun united the scattered holds of this land under one banner and gave his life holding a border no one else could hold. The land kept his name rather than let it be forgotten: the Kharun Lands.',
    'But the border he died defending was never truly closed — only slowed. Something old and patient still bleeds through the wound at the world\'s heart, and an older prophecy swore that a warrior, a mage, and a rogue would one day walk the length of these lands and seal it for good.',
    'Twenty years ago, three such heroes reached the first trial, outside a farming town called Harvestgate, and never came back. The monument they left behind still stands. So does the contract.',
    'No one has dared finish it in twenty years — until three strangers, each running from something of their own, were handed the dead heroes\' names, their gear, and their unfinished road.',
    'Whether they were chosen, or simply the last three left standing when the world needed a warrior, a mage, and a rogue, is a question none of them have thought to ask yet.',
  ],
};

// The 10 biome types (see DATA.BIOME_TYPES) double as the game's 10
// story chapters. Shown once, full-screen, the first time a hero
// enters that chapter. Only Chapter 1 has a settled title/story so
// far — the rest are placeholders (headline + a line of atmosphere)
// until they get the same treatment.
DATA.CHAPTERS = [
  { // Chapter 1 — levels 1-10, Plains
    title: 'Chapter 1: Harvestgate',
    headline: 'A dead contract. Three strangers. One road left unfinished.',
    story: [
      'Harvestgate smells like woodsmoke and turned earth — a farming town that has spent twenty years quietly pretending its monument isn\'t there.',
      'The town elder doesn\'t ask why the three of them came, or whether they\'re ready. She just holds out the paperwork the last heroes never got to sign, and gear the last heroes never got to wear.',
      'Kharun, Pars, and Minnie take up the names on the contract. Whatever answers, out past the wheat fields, doesn\'t know yet that it isn\'t three ghosts walking toward it.',
    ],
    // One {beginning, end} pair per Part (level), in order matching
    // DATA.BIOME_TYPES[0].biomes: Green Plains, Sunny Meadows, Grain
    // Fields, Windswept Steppe, Thistle Downs, Wildflower Expanse,
    // Dry Grasslands, Storm-Brushed Flats, Dark Plains, Ashen Prairie.
    parts: [
      { // Green Plains
        beginning: 'The wheat hasn\'t been harvested this season — not with something dragging livestock into the treeline at night. It\'s the kind of contract nobody in Harvestgate wanted to take alone.',
        end: 'The beast that has been terrorizing Green Plains falls, and for the first time in weeks the fields go quiet. It\'s a small thing. It\'s also the first time any of the three has done anything that mattered in years.',
      },
      { // Sunny Meadows
        beginning: 'Pars feels it before he sees it — the particular attention of something trained to hunt, not track. The guild knows he\'s still breathing.',
        end: 'The hunting-beast falls without its handler ever showing a face. Pars doesn\'t feel safer. He feels found.',
      },
      { // Grain Fields
        beginning: 'Harvestgate\'s granaries are emptying while the elder\'s own stores stay full. Kharun recognizes the pattern from another life — this is how you starve people into obedience, not poverty.',
        end: 'Whatever was gorging itself in the grain stores is dead now, and the town eats again. Nobody asks who was really being starved, or why.',
      },
      { // Windswept Steppe
        beginning: 'Bandit riders control the high steppe, and one of them wears a breastplate too fine for a bandit — old, well-made, and matching a description carved into a monument outside town.',
        end: 'The bandit chief falls, and the breastplate comes free easier than it should. It isn\'t bent. It isn\'t scarred. Whoever wore it before didn\'t die fighting in it.',
      },
      { // Thistle Downs
        beginning: 'The wildlife here moves wrong — too much unison, too little fear. Minnie recognizes the pressure in the air. She hasn\'t felt it since the night the Academy sealed its doors.',
        end: 'The corrupted thing stops moving, and the wrongness in the air goes with it — but only from here. Minnie doesn\'t say what she\'s thinking. She doesn\'t have to.',
      },
      { // Wildflower Expanse
        beginning: 'A shrine stands untouched in the middle of a dying field, marked with three symbols that match the monument in town. Someone has been tending it for twenty years.',
        end: 'The shrine\'s guardian falls, apologizing in a language none of them speak. It was never told the contract changed hands.',
      },
      { // Dry Grasslands
        beginning: 'A warlord is carving out territory in the drought-cracked grasslands, telling anyone who\'ll listen that the old heroes are gone for good and the old order with them.',
        end: 'The warlord falls like anyone falls to three people with nothing left to prove. It\'s the first fight all trip that had nothing to do with prophecy at all — and somehow the easiest one.',
      },
      { // Storm-Brushed Flats
        beginning: 'A storm rolls in on schedule, like clockwork, like a countdown nobody started on purpose. The locals call it the old warning and won\'t say what it\'s warning about.',
        end: 'Whatever rode in on the storm\'s leading edge is down, and the sky clears faster than weather should. Somewhere, something that was counting down loses its count.',
      },
      { // Dark Plains
        beginning: 'A body lies in armor that matches the missing rogue\'s description exactly — dead less than a year, though the monument in Harvestgate is twenty years old. The math doesn\'t close.',
        end: 'The guardian wearing a dead stranger\'s face and a dead hero\'s technique finally stops moving. Nobody in the group says what they\'re all thinking: that this has happened more than once.',
      },
      { // Ashen Prairie
        beginning: 'The trial itself waits at the edge of the ash-gray field — the same trial that ended the road for three better-prepared heroes twenty years ago. Kharun, Pars, and Minnie walk in expecting an ending.',
        end: 'They get a question instead of an ending. Three miles past the trial, a warhorse stands saddled and groomed, waiting for a rider who left yesterday — or twenty years ago, depending on who\'s counting.',
      },
    ],
  },
  { // Chapter 2 — Forest
    headline: 'The road narrows, and the trees remember more than the maps admit.',
    story: ['The wilds beyond Harvestgate don\'t have a name on any map yet — but something out here has been waiting for company.'],
  },
  { // Chapter 3 — Swamp
    headline: 'Debts come due where the water runs still and dark.',
    story: ['Every town keeps its secrets underwater. This one just floats them closer to the surface.'],
  },
  { // Chapter 4 — Desert
    headline: 'The sand keeps every footprint that was ever too afraid to come back.',
    story: ['Out past the last well, the map stops pretending it knows what\'s still alive.'],
  },
  { // Chapter 5 — Mountains
    headline: 'Old soldiers remember everything except how to stop marching.',
    story: ['The mountains don\'t forgive failed campaigns. They just keep them, frozen, at the top.'],
  },
  { // Chapter 6 — Tundra
    headline: 'The cold here isn\'t weather. It\'s a warning that stopped being polite.',
    story: ['Nothing survives this far north by accident.'],
  },
  { // Chapter 7 — Volcanic
    headline: 'Everything down here was made by someone who meant it.',
    story: ['The forge-heat never quite reaches the deepest halls — and neither does the truth.'],
  },
  { // Chapter 8 — Caverns
    headline: 'Some cities go underground to hide. This one went to be forgotten.',
    story: ['Not everyone who disappeared meant to.'],
  },
  { // Chapter 9 — Shadowlands
    headline: 'The dead here don\'t stay buried. They stay employed.',
    story: ['Grief, this far out, starts looking a lot like a job description.'],
  },
  { // Chapter 10 — The Abyss
    headline: 'Every road they walked was leading here. None of them chose that.',
    story: ['This is where the contract runs out, one way or another.'],
  },
];

// ------------------------------------------------------------
// Skills — 12 per class
// cat: basic | passive | passive2 | attack | attack2 | aoe | aoe2 |
//      heal | buff | debuff | ult | ult2
// All numeric params are functions of effective rank r (1..8).
// ------------------------------------------------------------
function mkSkills(list) { const o = {}; for (const s of list) o[s.id] = s; return o; }

DATA.SKILLS = {
warrior: mkSkills([
  { id: 'w_basic', cat: 'basic', name: 'Slash', icon: '🗡️', minLvl: 1,
    desc: r => `Free weapon attack for ${100 + 6 * r}% damage. Costs nothing.`,
    mult: r => 1.0 + 0.06 * r, cost: () => 0, cd: 0 },
  { id: 'w_pass1', cat: 'passive', name: 'Toughness', icon: '🛡️', minLvl: 2,
    desc: r => `Passive: +${6 * r}% Max HP, +${2 * r} Armor, +${(0.6 * r).toFixed(1)} HP Regen.`,
    passive: r => ({ hpPct: 0.06 * r, armor: 2 * r, hpRegen: 0.6 * r }) },
  { id: 'w_pass2', cat: 'passive2', name: 'Battle Hardened', icon: '⚙️', minLvl: 10, req: 'w_pass1',
    desc: r => `Passive: ${2 * r}% damage reduction, +${2 * r}% all resistances, +${3 * r}% damage.`,
    passive: r => ({ dr: 0.02 * r, resAll: 2 * r, dmgPct: 0.03 * r }) },
  { id: 'w_atk1', cat: 'attack', name: 'Heavy Strike', icon: '💥', minLvl: 2,
    desc: r => `A crushing blow for ${150 + 30 * r}% damage.`,
    mult: r => 1.5 + 0.3 * r, cost: () => 10, cd: 2 },
  { id: 'w_atk2', cat: 'attack2', name: 'Skull Crusher', icon: '🔨', minLvl: 8, req: 'w_atk1',
    desc: r => `${250 + 50 * r}% damage and stuns the enemy for 1 round.`,
    mult: r => 2.5 + 0.5 * r, cost: () => 22, cd: 4, stun: 1 },
  { id: 'w_aoe1', cat: 'aoe', name: 'Whirlwind', icon: '🌀', minLvl: 5,
    desc: r => `Spin and hit ALL enemies for ${90 + 18 * r}% damage.`,
    mult: r => 0.9 + 0.18 * r, cost: () => 16, cd: 3, aoe: true },
  { id: 'w_aoe2', cat: 'aoe2', name: 'Earthquake', icon: '🌋', minLvl: 12, req: 'w_aoe1',
    desc: r => `Shatter the ground: ${160 + 32 * r}% damage to ALL enemies.`,
    mult: r => 1.6 + 0.32 * r, cost: () => 32, cd: 5, aoe: true },
  { id: 'w_heal', cat: 'heal', name: 'Second Wind', icon: '💚', minLvl: 3,
    desc: r => `Recover ${14 + 5 * r}% of Max HP.`,
    healPct: r => 0.14 + 0.05 * r, cost: () => 14, cd: 4 },
  { id: 'w_buff', cat: 'buff', name: 'Battle Shout', icon: '📯', minLvl: 4,
    desc: r => `+${10 + 6 * r}% damage and +${2 * r} Strength for 5 rounds.`,
    buff: r => ({ dmgPct: 0.10 + 0.06 * r, str: 2 * r, rounds: 5 }), cost: () => 15, cd: 6 },
  { id: 'w_debuff', cat: 'debuff', name: 'Intimidate', icon: '😤', minLvl: 6,
    desc: r => `Enemies deal ${10 + 5 * r}% less damage and lose ${4 * r}% resistances for 4 rounds.`,
    debuff: r => ({ dmgDown: 0.10 + 0.05 * r, resDown: 4 * r, rounds: 4 }), cost: () => 12, cd: 5 },
  { id: 'w_ult', cat: 'ult', name: 'Berserk', icon: '🔥', minLvl: 15,
    desc: r => `ULTIMATE: +${25 + 12 * r}% damage and attack twice per round for 6 rounds.`,
    buff: r => ({ dmgPct: 0.25 + 0.12 * r, extraHit: 1, rounds: 6 }), cost: () => 40, cd: 10 },
  { id: 'w_ult2', cat: 'ult2', name: 'Avatar of War', icon: '👹', minLvl: 25, req: 'w_ult',
    desc: r => `ULTIMATE: Become war itself — ${380 + 80 * r}% damage to ALL enemies, and +${15 + 5 * r}% damage for 4 rounds.`,
    mult: r => 3.8 + 0.8 * r, aoe: true, buff: r => ({ dmgPct: 0.15 + 0.05 * r, rounds: 4 }), cost: () => 60, cd: 12 },
]),
rogue: mkSkills([
  { id: 'r_basic', cat: 'basic', name: 'Quick Stab', icon: '🗡️', minLvl: 1,
    desc: r => `Free weapon attack for ${100 + 6 * r}% damage. Costs nothing.`,
    mult: r => 1.0 + 0.06 * r, cost: () => 0, cd: 0 },
  { id: 'r_pass1', cat: 'passive', name: 'Nimble', icon: '🪶', minLvl: 2,
    desc: r => `Passive: +${2 * r}% Evasion, +${3 * r} Speed, +${2 * r}% damage.`,
    passive: r => ({ evasion: 2 * r, speed: 3 * r, dmgPct: 0.02 * r }) },
  { id: 'r_pass2', cat: 'passive2', name: 'Shadow Dance', icon: '🌑', minLvl: 10, req: 'r_pass1',
    desc: r => `Passive: +${2 * r}% Evasion, +${4 * r}% damage, +${(0.4 * r).toFixed(1)} HP Regen.`,
    passive: r => ({ evasion: 2 * r, dmgPct: 0.04 * r, hpRegen: 0.4 * r }) },
  { id: 'r_atk1', cat: 'attack', name: 'Backstab', icon: '🔪', minLvl: 2,
    desc: r => `Strike a vital spot for ${150 + 32 * r}% damage.`,
    mult: r => 1.5 + 0.32 * r, cost: () => 10, cd: 2 },
  { id: 'r_atk2', cat: 'attack2', name: 'Eviscerate', icon: '🩸', minLvl: 8, req: 'r_atk1',
    desc: r => `${260 + 52 * r}% damage — ignores half the enemy's physical resistance.`,
    mult: r => 2.6 + 0.52 * r, cost: () => 22, cd: 4, pierce: 0.5 },
  { id: 'r_aoe1', cat: 'aoe', name: 'Fan of Knives', icon: '🎯', minLvl: 5,
    desc: r => `Throw blades at ALL enemies for ${85 + 18 * r}% damage.`,
    mult: r => 0.85 + 0.18 * r, cost: () => 16, cd: 3, aoe: true },
  { id: 'r_aoe2', cat: 'aoe2', name: 'Blade Storm', icon: '🌪️', minLvl: 12, req: 'r_aoe1',
    desc: r => `A whirl of steel: ${155 + 32 * r}% damage to ALL enemies.`,
    mult: r => 1.55 + 0.32 * r, cost: () => 32, cd: 5, aoe: true },
  { id: 'r_heal', cat: 'heal', name: 'Adrenaline Rush', icon: '💚', minLvl: 3,
    desc: r => `Surge of vigor: recover ${13 + 5 * r}% of Max HP.`,
    healPct: r => 0.13 + 0.05 * r, cost: () => 14, cd: 4 },
  { id: 'r_buff', cat: 'buff', name: 'Deadly Focus', icon: '👁️', minLvl: 4,
    desc: r => `+${12 + 6 * r}% damage and +${2 * r} Dexterity for 5 rounds.`,
    buff: r => ({ dmgPct: 0.12 + 0.06 * r, dex: 2 * r, rounds: 5 }), cost: () => 15, cd: 6 },
  { id: 'r_debuff', cat: 'debuff', name: 'Expose Weakness', icon: '🎯', minLvl: 6,
    desc: r => `Enemies lose ${5 * r}% resistances and deal ${8 + 4 * r}% less damage for 4 rounds.`,
    debuff: r => ({ dmgDown: 0.08 + 0.04 * r, resDown: 5 * r, rounds: 4 }), cost: () => 12, cd: 5 },
  { id: 'r_ult', cat: 'ult', name: 'Death Mark', icon: '💀', minLvl: 15,
    desc: r => `ULTIMATE: Mark all enemies for death — ${300 + 60 * r}% damage and they lose ${6 * r}% resistances for 4 rounds.`,
    mult: r => 3.0 + 0.6 * r, aoe: true, debuff: r => ({ resDown: 6 * r, dmgDown: 0, rounds: 4 }), cost: () => 40, cd: 10 },
  { id: 'r_ult2', cat: 'ult2', name: 'Thousand Cuts', icon: '⚔️', minLvl: 25, req: 'r_ult',
    desc: r => `ULTIMATE: ${420 + 85 * r}% damage to ALL enemies and attack twice per round for 4 rounds.`,
    mult: r => 4.2 + 0.85 * r, aoe: true, buff: r => ({ extraHit: 1, rounds: 4 }), cost: () => 60, cd: 12 },
]),
mage: mkSkills([
  { id: 'm_basic', cat: 'basic', name: 'Arcane Bolt', icon: '✨', minLvl: 1,
    desc: r => `Free magic attack for ${100 + 7 * r}% damage. Costs nothing.`,
    mult: r => 1.0 + 0.07 * r, cost: () => 0, cd: 0, magic: true },
  { id: 'm_pass1', cat: 'passive', name: 'Arcane Mind', icon: '🧠', minLvl: 2,
    desc: r => `Passive: +${8 * r}% Max Mana, +${(0.8 * r).toFixed(1)} Mana Regen, +${2 * r}% damage.`,
    passive: r => ({ manaPct: 0.08 * r, manaRegen: 0.8 * r, dmgPct: 0.02 * r }) },
  { id: 'm_pass2', cat: 'passive2', name: 'Archmage', icon: '🌟', minLvl: 10, req: 'm_pass1',
    desc: r => `Passive: +${5 * r}% damage, +${3 * r}% Max HP, +${2 * r}% all resistances.`,
    passive: r => ({ dmgPct: 0.05 * r, hpPct: 0.03 * r, resAll: 2 * r }) },
  { id: 'm_atk1', cat: 'attack', name: 'Fireball', icon: '🔥', minLvl: 2,
    desc: r => `Hurl fire for ${160 + 34 * r}% damage.`,
    mult: r => 1.6 + 0.34 * r, cost: () => 12, cd: 2, magic: true },
  { id: 'm_atk2', cat: 'attack2', name: 'Pyroblast', icon: '☄️', minLvl: 8, req: 'm_atk1',
    desc: r => `${280 + 55 * r}% damage — ignores half the enemy's magic resistance.`,
    mult: r => 2.8 + 0.55 * r, cost: () => 26, cd: 4, magic: true, pierce: 0.5 },
  { id: 'm_aoe1', cat: 'aoe', name: 'Frost Nova', icon: '❄️', minLvl: 5,
    desc: r => `Freeze ALL enemies for ${95 + 20 * r}% damage.`,
    mult: r => 0.95 + 0.2 * r, cost: () => 18, cd: 3, aoe: true, magic: true },
  { id: 'm_aoe2', cat: 'aoe2', name: 'Meteor Storm', icon: '🌠', minLvl: 12, req: 'm_aoe1',
    desc: r => `Rain destruction: ${175 + 36 * r}% damage to ALL enemies.`,
    mult: r => 1.75 + 0.36 * r, cost: () => 36, cd: 5, aoe: true, magic: true },
  { id: 'm_heal', cat: 'heal', name: 'Healing Light', icon: '💚', minLvl: 3,
    desc: r => `Mend wounds: recover ${16 + 6 * r}% of Max HP.`,
    healPct: r => 0.16 + 0.06 * r, cost: () => 16, cd: 4 },
  { id: 'm_buff', cat: 'buff', name: 'Arcane Power', icon: '🔮', minLvl: 4,
    desc: r => `+${14 + 7 * r}% damage and +${2 * r} Intelligence for 5 rounds.`,
    buff: r => ({ dmgPct: 0.14 + 0.07 * r, int: 2 * r, rounds: 5 }), cost: () => 18, cd: 6 },
  { id: 'm_debuff', cat: 'debuff', name: 'Curse of Weakness', icon: '🕯️', minLvl: 6,
    desc: r => `Enemies deal ${12 + 5 * r}% less damage and lose ${5 * r}% resistances for 4 rounds.`,
    debuff: r => ({ dmgDown: 0.12 + 0.05 * r, resDown: 5 * r, rounds: 4 }), cost: () => 14, cd: 5 },
  { id: 'm_ult', cat: 'ult', name: 'Elemental Fury', icon: '🌩️', minLvl: 15,
    desc: r => `ULTIMATE: ${340 + 65 * r}% damage to ALL enemies and +${20 + 8 * r}% damage for 4 rounds.`,
    mult: r => 3.4 + 0.65 * r, aoe: true, magic: true, buff: r => ({ dmgPct: 0.20 + 0.08 * r, rounds: 4 }), cost: () => 45, cd: 10 },
  { id: 'm_ult2', cat: 'ult2', name: 'Apocalypse', icon: '☀️', minLvl: 25, req: 'm_ult',
    desc: r => `ULTIMATE: ${460 + 90 * r}% damage to ALL enemies, ignoring half their magic resistance.`,
    mult: r => 4.6 + 0.9 * r, aoe: true, magic: true, pierce: 0.5, cost: () => 65, cd: 12 },
]),
};

DATA.SKILL_ORDER = ['basic', 'passive', 'passive2', 'attack', 'attack2', 'aoe', 'aoe2', 'heal', 'buff', 'debuff', 'ult', 'ult2'];
DATA.CAT_LABEL = {
  basic: 'Main Attack', passive: 'Passive', passive2: 'Greater Passive',
  attack: 'Attack', attack2: 'Greater Attack', aoe: 'Area Attack', aoe2: 'Greater Area Attack',
  heal: 'Healing', buff: 'Buff', debuff: 'Debuff', ult: 'Ultimate', ult2: 'Greater Ultimate',
};

// ------------------------------------------------------------
// Monster specialties — rolled onto individual creatures. Not to be
// confused with DATA.AFFIXES below, which is the unrelated item-enchant
// pool. Odds per tier and stacking rules live in game.js (rollAffixes);
// this table is just name/icon/color/tooltip for display + lookup.
// ------------------------------------------------------------
DATA.SPECIALTIES = {
  regen:      { name: 'Regenerating', icon: '🌿', color: '#6ccb8f', desc: 'Regenerates 3% of max HP every round.' },
  vampiric:   { name: 'Vampiric',     icon: '🩸', color: '#c23d6b', desc: 'Heals itself for 25% of the damage it deals to you.' },
  resistant:  { name: 'Resistant',    icon: '🛡️', color: '#6c9bff', desc: '+20% resistance to all damage types.' },
  resilient:  { name: 'Resilient',    icon: '🦴', color: '#9aa0b5', desc: 'Takes 20% less damage from all sources.' },
  poisonous:  { name: 'Poisonous',    icon: '☠️', color: '#7a9a3d', desc: 'Attacks poison you, dealing damage over a few rounds.' },
  necrotic:   { name: 'Necrotic',     icon: '💀', color: '#7d3da8', desc: 'While alive, your healing is reduced by 75%.' },
  magical:    { name: 'Magical',      icon: '✨', color: '#c77dff', desc: 'Attacks deal random bonus magic damage.' },
  explosive:  { name: 'Explosive',    icon: '💥', color: '#ff6b3d', desc: 'Explodes on death, damaging you.' },
  frozen:     { name: 'Frozen',       icon: '❄️', color: '#6cd4ff', desc: '25% chance per attack to slow your attack gauge.' },
  burning:    { name: 'Burning',      icon: '🔥', color: '#ff8b3d', desc: '25% chance per attack to ignite you over time.' },
  evasive:    { name: 'Evasive',      icon: '💨', color: '#b9bdcc', desc: '25% chance to fully evade your attacks.' },
  reflective: { name: 'Reflective',   icon: '🪞', color: '#4ecdc4', desc: 'Reflects 20% of the damage you deal back at you.' },
  enraged:    { name: 'Enraged',      icon: '😡', color: '#ff4d4d', desc: 'Attacks faster and harder as its HP drops.' },
  berserk:    { name: 'Berserk',      icon: '🪓', color: '#d94f4f', desc: 'Deals more damage but takes more as its HP drops.' },
  cursed:     { name: 'Cursed',       icon: '🕯️', color: '#7a5cff', desc: 'Attacks weaken your damage output for a few rounds.' },
  golem:      { name: 'Golem',        icon: '🗿', color: '#8a7355', desc: 'Takes 80% less magic damage, but double physical damage.' },
  spectral:   { name: 'Spectral',     icon: '👻', color: '#a8c8ff', desc: 'Takes 80% less physical damage, but double magic damage.' },
  colossal:   { name: 'Colossal',     icon: '🏔️', color: '#8a6d3d', desc: '+50% max HP, -25% speed.' },
  swift:      { name: 'Swift',        icon: '🌀', color: '#4cd9d9', desc: '+40% speed.' },
  corrosive:  { name: 'Corrosive',    icon: '🧪', color: '#8fbf3d', desc: "Attacks temporarily corrode your armor." },
};

// ------------------------------------------------------------
// Biomes — 10 types x 10 variations = 100 levels
// Each creature: name, attack name, atkType (phys|magic|poison),
// res {phys, magic, poison} in %, and role multipliers.
// ------------------------------------------------------------
DATA.BIOME_TYPES = [
{
  type: 'Plains', icon: '🌾', shopName: 'Harvestgate Trading Post',
  biomes: ['Green Plains', 'Sunny Meadows', 'Grain Fields', 'Windswept Steppe', 'Thistle Downs',
           'Wildflower Expanse', 'Dry Grasslands', 'Storm-Brushed Flats', 'Dark Plains', 'Ashen Prairie'],
  creatures: [
    { name: 'Plains Boar', attack: 'Tusk Gore', atkType: 'phys', res: { phys: 20, magic: 0, poison: 5 }, hp: 1.3, dmg: 1.0, spd: 0.9 },
    { name: 'Grass Viper', attack: 'Venom Bite', atkType: 'poison', res: { phys: 0, magic: 5, poison: 40 }, hp: 0.7, dmg: 1.1, spd: 1.3 },
    { name: 'Meadow Sprite', attack: 'Pollen Burst', atkType: 'magic', res: { phys: 5, magic: 30, poison: 10 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
    { name: 'Wild Hound', attack: 'Savage Bite', atkType: 'phys', res: { phys: 10, magic: 0, poison: 0 }, hp: 0.9, dmg: 1.1, spd: 1.2 },
    { name: 'Living Scarecrow', attack: 'Straw Lash', atkType: 'phys', res: { phys: 15, magic: 10, poison: 60 }, hp: 1.1, dmg: 0.9, spd: 0.8 },
  ],
  rareA: ['Grain', 'Sod', 'Dust', 'Wind', 'Thorn', 'Field', 'Hay', 'Storm'],
  rareB: ['Stalker', 'Render', 'Howler', 'Trampler', 'Reaper', 'Whisperer', 'Gnawer', 'Charger'],
  bossTitles: ['the Prairie Terror', 'the Endless Hunger', 'the Field Reaper', 'the Storm That Walks',
               'the Trampler of Harvests', 'the Golden Plague', 'the Whispering Doom', 'the Horizon Shadow'],
},
{
  type: 'Forest', icon: '🌲', shopName: 'Hollow Bough Trading Post',
  biomes: ['Verdant Woods', 'Old Growth Forest', 'Mossy Thicket', 'Whispering Grove', 'Tangled Briarwood',
           'Fungal Undergrowth', 'Shadowed Canopy', 'Bleakbark Forest', 'Gloomroot Wilds', 'Rotwood'],
  creatures: [
    { name: 'Timber Wolf', attack: 'Rending Fangs', atkType: 'phys', res: { phys: 10, magic: 0, poison: 5 }, hp: 0.9, dmg: 1.1, spd: 1.2 },
    { name: 'Thorn Sprite', attack: 'Bramble Whip', atkType: 'magic', res: { phys: 5, magic: 35, poison: 15 }, hp: 0.7, dmg: 1.2, spd: 1.1 },
    { name: 'Venom Spider', attack: 'Toxic Fangs', atkType: 'poison', res: { phys: 0, magic: 5, poison: 50 }, hp: 0.8, dmg: 1.1, spd: 1.3 },
    { name: 'Treant Sapling', attack: 'Crushing Branch', atkType: 'phys', res: { phys: 30, magic: 5, poison: 40 }, hp: 1.5, dmg: 0.9, spd: 0.6 },
    { name: 'Bark Golem', attack: 'Log Slam', atkType: 'phys', res: { phys: 35, magic: 0, poison: 60 }, hp: 1.4, dmg: 1.0, spd: 0.7 },
  ],
  rareA: ['Moss', 'Root', 'Bark', 'Sap', 'Fungal', 'Bough', 'Canopy', 'Thicket'],
  rareB: ['Creeper', 'Strangler', 'Devourer', 'Lurker', 'Shrieker', 'Weaver', 'Snapper', 'Prowler'],
  bossTitles: ['the Ancient Rot', 'the Forest’s Wrath', 'the Root of All Fear', 'the Canopy King',
               'the Verdant Nightmare', 'the Hundred-Ring Horror', 'the Sap-Drinker', 'the Grove Warden Fallen'],
},
{
  type: 'Swamp', icon: '🐸', shopName: 'Murkwater Bazaar',
  biomes: ['Misty Marsh', 'Croaking Fen', 'Peat Bog', 'Leech Waters', 'Sunken Mire',
           'Fetid Quagmire', 'Blackwater Bayou', 'Serpent’s Wallow', 'Plague Marsh', 'Dead Man’s Bog'],
  creatures: [
    { name: 'Bog Toad', attack: 'Tongue Lash', atkType: 'phys', res: { phys: 10, magic: 5, poison: 45 }, hp: 1.2, dmg: 0.9, spd: 0.8 },
    { name: 'Marsh Leech', attack: 'Blood Drain', atkType: 'poison', res: { phys: 5, magic: 0, poison: 55 }, hp: 0.8, dmg: 1.0, spd: 1.0 },
    { name: 'Swamp Hag', attack: 'Hex Bolt', atkType: 'magic', res: { phys: 5, magic: 40, poison: 25 }, hp: 0.9, dmg: 1.3, spd: 0.9 },
    { name: 'Mire Crocodile', attack: 'Death Roll', atkType: 'phys', res: { phys: 30, magic: 0, poison: 20 }, hp: 1.4, dmg: 1.2, spd: 0.7 },
    { name: 'Will-o-Wisp', attack: 'Soul Spark', atkType: 'magic', res: { phys: 50, magic: 30, poison: 60 }, hp: 0.6, dmg: 1.2, spd: 1.4 },
  ],
  rareA: ['Filth', 'Bile', 'Rot', 'Sludge', 'Plague', 'Murk', 'Scum', 'Mire'],
  rareB: ['Spreader', 'Spawn', 'Lurker', 'Croaker', 'Drinker', 'Belcher', 'Crawler', 'Wallower'],
  bossTitles: ['the Dreaded Sloth', 'the Bog Tyrant', 'the Sunken Horror', 'the Plague Mother',
               'the Fetid King', 'the Thing Below', 'the Croaking Doom', 'the Leech Lord'],
},
{
  type: 'Desert', icon: '🏜️', shopName: 'Last Oasis Caravan',
  biomes: ['Golden Dunes', 'Scorched Sands', 'Mirage Flats', 'Cactus Barrens', 'Sirocco Wastes',
           'Bone Dunes', 'Glass Desert', 'Sandstorm Expanse', 'Sunblasted Wastes', 'Dune Sea of Ash'],
  creatures: [
    { name: 'Sand Scorpion', attack: 'Stinger Strike', atkType: 'poison', res: { phys: 25, magic: 0, poison: 50 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
    { name: 'Dune Serpent', attack: 'Burrowing Strike', atkType: 'phys', res: { phys: 15, magic: 5, poison: 35 }, hp: 1.1, dmg: 1.2, spd: 1.1 },
    { name: 'Desert Bandit', attack: 'Scimitar Slash', atkType: 'phys', res: { phys: 15, magic: 10, poison: 10 }, hp: 1.0, dmg: 1.1, spd: 1.1 },
    { name: 'Dust Elemental', attack: 'Choking Cloud', atkType: 'magic', res: { phys: 45, magic: 25, poison: 60 }, hp: 0.9, dmg: 1.0, spd: 1.0 },
    { name: 'Vulture Harpy', attack: 'Talon Dive', atkType: 'phys', res: { phys: 5, magic: 15, poison: 15 }, hp: 0.8, dmg: 1.3, spd: 1.4 },
  ],
  rareA: ['Sand', 'Sun', 'Bone', 'Glass', 'Mirage', 'Ash', 'Dune', 'Thirst'],
  rareB: ['Scourer', 'Burner', 'Picker', 'Stalker', 'Weaver', 'Bringer', 'Swallower', 'Flayer'],
  bossTitles: ['the Sun’s Cruelty', 'the Endless Thirst', 'the Dune Emperor', 'the Glass-Maker',
               'the Bleached Horror', 'the Storm of a Thousand Grains', 'the Mirage King', 'the Scouring Wind'],
},
{
  type: 'Mountains', icon: '⛰️', shopName: 'Cairnwatch Armory',
  biomes: ['Foothill Crags', 'Granite Slopes', 'Eagle Peaks', 'Misty Summits', 'Avalanche Pass',
           'Thunder Ridge', 'Frostbitten Cliffs', 'Titan’s Staircase', 'Shattered Spires', 'Doompeak'],
  creatures: [
    { name: 'Rock Golem', attack: 'Boulder Fist', atkType: 'phys', res: { phys: 45, magic: 5, poison: 70 }, hp: 1.6, dmg: 1.0, spd: 0.5 },
    { name: 'Cliff Harpy', attack: 'Shrieking Dive', atkType: 'phys', res: { phys: 5, magic: 20, poison: 10 }, hp: 0.8, dmg: 1.3, spd: 1.4 },
    { name: 'Mountain Troll', attack: 'Club Smash', atkType: 'phys', res: { phys: 30, magic: 0, poison: 25 }, hp: 1.5, dmg: 1.3, spd: 0.6 },
    { name: 'Storm Drake', attack: 'Lightning Breath', atkType: 'magic', res: { phys: 20, magic: 40, poison: 20 }, hp: 1.1, dmg: 1.3, spd: 1.0 },
    { name: 'Cave Bear', attack: 'Mauling Swipe', atkType: 'phys', res: { phys: 25, magic: 5, poison: 15 }, hp: 1.3, dmg: 1.2, spd: 0.8 },
  ],
  rareA: ['Stone', 'Peak', 'Crag', 'Thunder', 'Granite', 'Summit', 'Boulder', 'Frost'],
  rareB: ['Breaker', 'Hurler', 'Screamer', 'Crusher', 'Climber', 'Sunderer', 'Roarer', 'Grinder'],
  bossTitles: ['the Mountain’s Fist', 'the Avalanche Incarnate', 'the Peak Tyrant', 'the Sky-Render',
               'the Granite Colossus', 'the Thunder That Answers', 'the Unclimbable', 'the Summit’s Curse'],
},
{
  type: 'Tundra', icon: '❄️', shopName: 'Frosthold Trading Post',
  biomes: ['White Expanse', 'Frozen Steppe', 'Glacier Fields', 'Permafrost Plains', 'Icebound Coast',
           'Blizzard Wastes', 'Crystal Tundra', 'Aurora Flats', 'Frozen Graveyard', 'Eternal Winter'],
  creatures: [
    { name: 'Ice Wolf', attack: 'Frozen Fangs', atkType: 'phys', res: { phys: 15, magic: 25, poison: 20 }, hp: 1.0, dmg: 1.1, spd: 1.2 },
    { name: 'Frost Wraith', attack: 'Chilling Touch', atkType: 'magic', res: { phys: 50, magic: 35, poison: 70 }, hp: 0.8, dmg: 1.3, spd: 1.1 },
    { name: 'Snow Yeti', attack: 'Frozen Haymaker', atkType: 'phys', res: { phys: 30, magic: 15, poison: 30 }, hp: 1.5, dmg: 1.3, spd: 0.7 },
    { name: 'Glacial Elemental', attack: 'Ice Shard Volley', atkType: 'magic', res: { phys: 40, magic: 45, poison: 70 }, hp: 1.3, dmg: 1.1, spd: 0.6 },
    { name: 'Winter Witch', attack: 'Frostbite Curse', atkType: 'magic', res: { phys: 10, magic: 45, poison: 25 }, hp: 0.9, dmg: 1.4, spd: 1.0 },
  ],
  rareA: ['Frost', 'Ice', 'Snow', 'Rime', 'Glacier', 'Winter', 'Hail', 'Chill'],
  rareB: ['Biter', 'Caller', 'Walker', 'Shaper', 'Howler', 'Bringer', 'Freezer', 'Wanderer'],
  bossTitles: ['the Heart of Winter', 'the White Death', 'the Frozen Sovereign', 'the Blizzard’s Voice',
               'the Glacier That Hungers', 'the Last Cold', 'the Aurora’s Shadow', 'the Permafrost King'],
},
{
  type: 'Volcanic', icon: '🌋', shopName: 'Cinderforge Bazaar',
  biomes: ['Ember Foothills', 'Smoldering Fields', 'Basalt Flats', 'Lava Rivers', 'Ashfall Plateau',
           'Cinder Wastes', 'Magma Chasms', 'Obsidian Ridge', 'Pyroclast Plain', 'Heart of the Volcano'],
  creatures: [
    { name: 'Magma Imp', attack: 'Ember Toss', atkType: 'magic', res: { phys: 15, magic: 45, poison: 40 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
    { name: 'Fire Salamander', attack: 'Scorching Bite', atkType: 'phys', res: { phys: 20, magic: 40, poison: 30 }, hp: 1.0, dmg: 1.2, spd: 1.0 },
    { name: 'Ash Ghoul', attack: 'Cinder Claws', atkType: 'poison', res: { phys: 25, magic: 20, poison: 60 }, hp: 1.1, dmg: 1.1, spd: 0.9 },
    { name: 'Obsidian Golem', attack: 'Volcanic Slam', atkType: 'phys', res: { phys: 50, magic: 30, poison: 70 }, hp: 1.7, dmg: 1.1, spd: 0.5 },
    { name: 'Flame Djinn', attack: 'Inferno Blast', atkType: 'magic', res: { phys: 30, magic: 55, poison: 50 }, hp: 1.0, dmg: 1.4, spd: 1.1 },
  ],
  rareA: ['Cinder', 'Magma', 'Ash', 'Ember', 'Obsidian', 'Soot', 'Pyre', 'Slag'],
  rareB: ['Belcher', 'Forger', 'Eater', 'Spitter', 'Walker', 'Kindler', 'Smelter', 'Scorcher'],
  bossTitles: ['the Molten Heart', 'the Eruption Given Form', 'the Cinder Lord', 'the World-Burner',
               'the Obsidian Tyrant', 'the Furnace That Breathes', 'the Ashbringer', 'the Caldera King'],
},
{
  type: 'Caverns', icon: '🕳️', shopName: 'Deepvault Exchange',
  biomes: ['Echoing Caves', 'Glowshroom Caverns', 'Crystal Grottos', 'Web-Choked Tunnels', 'Sunless Lake',
           'Chasm of Whispers', 'Fungal Depths', 'Bone Pits', 'Abyssal Caverns', 'The Screaming Dark'],
  creatures: [
    { name: 'Cave Crawler', attack: 'Chitin Slash', atkType: 'phys', res: { phys: 25, magic: 10, poison: 40 }, hp: 1.1, dmg: 1.1, spd: 1.0 },
    { name: 'Giant Spider', attack: 'Paralyzing Bite', atkType: 'poison', res: { phys: 10, magic: 10, poison: 55 }, hp: 0.9, dmg: 1.2, spd: 1.3 },
    { name: 'Myconid Warrior', attack: 'Spore Cloud', atkType: 'poison', res: { phys: 20, magic: 25, poison: 70 }, hp: 1.2, dmg: 1.0, spd: 0.8 },
    { name: 'Young Basilisk', attack: 'Petrifying Gaze', atkType: 'magic', res: { phys: 35, magic: 30, poison: 45 }, hp: 1.3, dmg: 1.3, spd: 0.7 },
    { name: 'Shadow Bat', attack: 'Sonic Screech', atkType: 'magic', res: { phys: 10, magic: 30, poison: 20 }, hp: 0.7, dmg: 1.2, spd: 1.5 },
  ],
  rareA: ['Gloom', 'Echo', 'Web', 'Spore', 'Crystal', 'Depth', 'Chasm', 'Dark'],
  rareB: ['Skitterer', 'Whisperer', 'Spinner', 'Burrower', 'Gnasher', 'Creeper', 'Dweller', 'Watcher'],
  bossTitles: ['the Deep Terror', 'the Whisper in the Dark', 'the Cave Mother', 'the Thing That Waits',
               'the Sunless Emperor', 'the Hundred-Eyed', 'the Echo of Madness', 'the Devourer Below'],
},
{
  type: 'Shadowlands', icon: '👻', shopName: 'Wraithmarket',
  biomes: ['Twilight Moor', 'Gloom Valley', 'Cursed Barrows', 'Haunted Wastes', 'Nightmare Fields',
           'Spectral Forest', 'Vale of Sorrow', 'Wraithlands', 'The Black Mire', 'Edge of Oblivion'],
  creatures: [
    { name: 'Restless Shade', attack: 'Spectral Grasp', atkType: 'magic', res: { phys: 55, magic: 30, poison: 70 }, hp: 0.8, dmg: 1.2, spd: 1.2 },
    { name: 'Grave Ghoul', attack: 'Rotting Claws', atkType: 'poison', res: { phys: 20, magic: 15, poison: 65 }, hp: 1.2, dmg: 1.1, spd: 0.9 },
    { name: 'Banshee', attack: 'Wail of Despair', atkType: 'magic', res: { phys: 45, magic: 40, poison: 70 }, hp: 0.9, dmg: 1.4, spd: 1.1 },
    { name: 'Bone Knight', attack: 'Cursed Blade', atkType: 'phys', res: { phys: 40, magic: 20, poison: 70 }, hp: 1.5, dmg: 1.2, spd: 0.7 },
    { name: 'Nightmare Steed', attack: 'Trampling Dread', atkType: 'phys', res: { phys: 20, magic: 35, poison: 50 }, hp: 1.1, dmg: 1.3, spd: 1.3 },
  ],
  rareA: ['Grave', 'Dread', 'Sorrow', 'Wraith', 'Gloom', 'Night', 'Soul', 'Bone'],
  rareB: ['Harvester', 'Weeper', 'Binder', 'Stealer', 'Mourner', 'Screamer', 'Shackler', 'Herald'],
  bossTitles: ['the Sorrow Eternal', 'the Grave King', 'the Last Lament', 'the Shadow of All Ends',
               'the Soul-Shackler', 'the Nightmare Made Flesh', 'the Weeping Tyrant', 'the Herald of Oblivion'],
},
{
  type: 'The Abyss', icon: '🔥', shopName: 'Abyssal Black Market',
  biomes: ['Rift’s Edge', 'Broken Reality', 'Void Shallows', 'Demonic Foothold', 'Chaos Spires',
           'Burning Abyss', 'The Endless Fall', 'Maw of Madness', 'Throne Approach', 'Heart of the Abyss'],
  creatures: [
    { name: 'Void Imp', attack: 'Chaos Spark', atkType: 'magic', res: { phys: 25, magic: 45, poison: 45 }, hp: 0.8, dmg: 1.3, spd: 1.4 },
    { name: 'Abyssal Hound', attack: 'Hellfire Maw', atkType: 'phys', res: { phys: 30, magic: 30, poison: 40 }, hp: 1.1, dmg: 1.3, spd: 1.2 },
    { name: 'Chaos Spawn', attack: 'Writhing Tendrils', atkType: 'poison', res: { phys: 30, magic: 30, poison: 65 }, hp: 1.3, dmg: 1.2, spd: 0.9 },
    { name: 'Demon Knight', attack: 'Doomblade', atkType: 'phys', res: { phys: 45, magic: 35, poison: 55 }, hp: 1.6, dmg: 1.3, spd: 0.8 },
    { name: 'Eye of Ruin', attack: 'Annihilation Ray', atkType: 'magic', res: { phys: 35, magic: 55, poison: 60 }, hp: 1.0, dmg: 1.5, spd: 1.0 },
  ],
  rareA: ['Void', 'Chaos', 'Doom', 'Ruin', 'Hate', 'Rift', 'Hell', 'End'],
  rareB: ['Bringer', 'Spawn', 'Render', 'Devourer', 'Unmaker', 'Corruptor', 'Flayer', 'Usurper'],
  bossTitles: ['the End of All Things', 'the Abyssal Sovereign', 'the Unmaker', 'the First Sin',
               'the Throne’s Guardian', 'the Hunger Between Worlds', 'the Final Nightmare', 'the Crown of Ruin'],
},
];

// Syllables for epic/legendary one-word names
DATA.NAME_SYL_A = ['Gor', 'Mor', 'Zar', 'Kra', 'Vex', 'Thul', 'Drak', 'Bal', 'Nag', 'Ur', 'Skar', 'Grim', 'Vor', 'Xal', 'Mal', 'Rag', 'Zug', 'Kel', 'Ash', 'Bruk'];
DATA.NAME_SYL_B = ['gath', 'mok', 'zul', 'thar', 'grim', 'nox', 'rok', 'dun', 'vash', 'gul', 'moth', 'rax', 'ghul', 'dor', 'blub', 'fang', 'maw', 'thorn', 'skul', 'doom'];
DATA.NAME_SYL_C = ['', '', '', 'us', 'ok', 'ar', 'oth', 'ix', 'esh', 'un'];

// ------------------------------------------------------------
// Items
// ------------------------------------------------------------
DATA.RARITIES = {
  normal:    { name: 'Normal',    color: '#c8c8c8', affixes: [0, 0], mult: 1.0, value: 1 },
  magical:   { name: 'Magical',   color: '#6c9bff', affixes: [1, 2], mult: 1.15, value: 3 },
  rare:      { name: 'Rare',      color: '#ffd84d', affixes: [3, 3], mult: 1.3, value: 8 },
  epic:      { name: 'Epic',      color: '#c77dff', affixes: [4, 4], mult: 1.5, value: 20 },
  legendary: { name: 'Legendary', color: '#ff8b3d', affixes: [5, 5], mult: 1.75, value: 60 },
};

DATA.SLOTS = ['weapon', 'offhand', 'helmet', 'amulet', 'armor', 'cloak', 'belt', 'ring1', 'ring2', 'gloves', 'pants', 'boots'];
DATA.SLOT_LABEL = {
  weapon: 'Weapon', offhand: 'Off Hand / Shield', helmet: 'Helmet', amulet: 'Amulet', armor: 'Armor',
  cloak: 'Cloak', belt: 'Belt', ring1: 'Left Ring', ring2: 'Right Ring', gloves: 'Gloves', pants: 'Pants', boots: 'Footwear',
};

// Weapon bases. hands: 1|2. classes: which classes can use (null = all).
// atkSpd: attack interval multiplier — 0.5 = twice as fast, 1.5 = 50% slower.
DATA.WEAPON_BASES = [
  { id: 'greatsword', name: 'Greatsword', icon: '🗡️', hands: 2, classes: ['warrior'], dmg: [9, 14], atkSpd: 1.5 },
  { id: 'battleaxe', name: 'Battle Axe', icon: '🪓', hands: 2, classes: ['warrior'], dmg: [9, 13], atkSpd: 1.4 },
  { id: 'warhammer', name: 'War Hammer', icon: '🔨', hands: 1, classes: ['warrior'], dmg: [5, 8], atkSpd: 1.1 },
  { id: 'spear', name: 'Spear', icon: '🔱', hands: 2, classes: ['warrior'], dmg: [7, 11], atkSpd: 1.1 },
  { id: 'crossbow', name: 'Crossbow', icon: '🏹', hands: 2, classes: ['warrior', 'rogue'], dmg: [8, 13], atkSpd: 1.3 },
  { id: 'longsword', name: 'Longsword', icon: '⚔️', hands: 1, classes: ['warrior', 'rogue'], dmg: [4, 7], atkSpd: 1.0 },
  { id: 'dagger', name: 'Dagger', icon: '🔪', hands: 1, classes: ['rogue'], dmg: [3, 5], atkSpd: 0.5 },
  { id: 'throwingknives', name: 'Throwing Knives', icon: '🥷', hands: 1, classes: ['rogue'], dmg: [3, 5], atkSpd: 0.6 },
  { id: 'bow', name: 'Hunting Bow', icon: '🏹', hands: 2, classes: ['rogue'], dmg: [6, 10], atkSpd: 1.0 },
  { id: 'twinblade', name: 'Twinblade', icon: '⚔️', hands: 2, classes: ['rogue'], dmg: [6, 10], atkSpd: 1.15 },
  { id: 'shortsword', name: 'Shortsword', icon: '🗡️', hands: 1, classes: null, dmg: [3, 6], atkSpd: 0.9 },
  { id: 'staff', name: 'Arcane Staff', icon: '🪄', hands: 2, classes: ['mage'], dmg: [7, 12], magic: true, atkSpd: 1.3 },
  { id: 'wand', name: 'Wand', icon: '🪄', hands: 1, classes: ['mage'], dmg: [3, 5], magic: true, atkSpd: 0.8 },
  { id: 'scepter', name: 'Scepter', icon: '🔱', hands: 1, classes: ['mage'], dmg: [4, 7], magic: true, atkSpd: 1.0 },
];

// Offhand bases. kind: shield | weapon-like offhand item
DATA.OFFHAND_BASES = [
  { id: 'buckler', name: 'Buckler', icon: '🛡️', classes: null, armor: 3, weight: 'medium' },
  { id: 'kiteshield', name: 'Kite Shield', icon: '🛡️', classes: ['warrior'], armor: 5, weight: 'heavy' },
  { id: 'towershield', name: 'Tower Shield', icon: '🛡️', classes: ['warrior'], armor: 8, weight: 'heavy' },
  { id: 'orb', name: 'Arcane Orb', icon: '🔮', classes: ['mage'], dmg: [2, 4], magic: true },
  { id: 'tome', name: 'Spell Tome', icon: '📖', classes: ['mage'], dmg: [1, 3], magic: true },
];

// Armor bases per slot & weight class.
DATA.ARMOR_BASES = {
  helmet: { heavy: { name: 'Great Helm', armor: 5 }, medium: { name: 'Leather Hood', armor: 3 }, light: { name: 'Cloth Cowl', armor: 2 } },
  armor:  { heavy: { name: 'Plate Armor', armor: 10 }, medium: { name: 'Leather Armor', armor: 6 }, light: { name: 'Robes', armor: 4 } },
  gloves: { heavy: { name: 'Gauntlets', armor: 3 }, medium: { name: 'Leather Gloves', armor: 2 }, light: { name: 'Cloth Wraps', armor: 1 } },
  pants:  { heavy: { name: 'Plate Greaves', armor: 5 }, medium: { name: 'Leather Pants', armor: 3 }, light: { name: 'Cloth Leggings', armor: 2 } },
  boots:  { heavy: { name: 'Plate Sabatons', armor: 4 }, medium: { name: 'Leather Boots', armor: 2 }, light: { name: 'Cloth Shoes', armor: 1 } },
};
DATA.ARMOR_ICONS = { helmet: '🪖', armor: '🎽', gloves: '🧤', pants: '👖', boots: '🥾' };

// Jewelry / misc bases (no weight class). amulet/ring/cloak are pure
// affix carriers, always at least magical. belt is the exception:
// not socketable, unrestricted by class/weight, and can be normal
// rarity — every belt (any rarity) carries potion capacity as its
// base stat (see beltPotionCap in game.js), with affixes on top once
// magical+.
DATA.JEWELRY_BASES = {
  amulet: { name: 'Amulet', icon: '📿' },
  ring: { name: 'Ring', icon: '💍' },
  cloak: { name: 'Cloak', icon: '🧣', armor: 2 },
  belt: { name: 'Belt', icon: '👝' },
};

// Affix pool: id, label(v), weight, roll(ilvl) -> value
// Magnitude stats (HP, mana, damage, armor, regen) grow exponentially
// with item level (+25%/level) to match monster scaling; percentage
// and capped stats stay on gentle linear growth.
DATA.AFFIXES = [
  { id: 'str', w: 10, roll: i => 1 + Math.floor(i / 8) + rint(0, 2), fmt: v => `+${v} Strength` },
  { id: 'dex', w: 10, roll: i => 1 + Math.floor(i / 8) + rint(0, 2), fmt: v => `+${v} Dexterity` },
  { id: 'int', w: 10, roll: i => 1 + Math.floor(i / 8) + rint(0, 2), fmt: v => `+${v} Intelligence` },
  { id: 'hp', w: 10, roll: i => Math.round((12 + rint(0, 10)) * bigScale(i)), fmt: v => `+${v.toLocaleString()} Max HP` },
  { id: 'mana', w: 8, roll: i => Math.round((8 + rint(0, 6)) * bigScale(i)), fmt: v => `+${v.toLocaleString()} Max Mana` },
  { id: 'speed', w: 8, roll: i => 2 + Math.floor(i / 5) + rint(0, 3), fmt: v => `+${v} Speed` },
  { id: 'hpRegen', w: 6, roll: i => Math.round((1 + rint(0, 1)) * bigScale(i) * 0.5), fmt: v => `+${v.toLocaleString()} HP Regen` },
  { id: 'manaRegen', w: 6, roll: i => Math.round((1 + rint(0, 1)) * bigScale(i) * 0.5), fmt: v => `+${v.toLocaleString()} Mana Regen` },
  { id: 'evasion', w: 6, roll: i => 1 + Math.floor(i / 15) + rint(0, 2), fmt: v => `+${v}% Evasion` },
  { id: 'dmgFlat', w: 10, roll: i => Math.round((2 + rint(0, 3)) * dmgScale(i)), fmt: v => `+${v.toLocaleString()} Weapon Damage` },
  { id: 'dmgPct', w: 8, roll: i => 3 + Math.floor(i / 6) + rint(0, 4), fmt: v => `+${v}% Weapon Damage` },
  { id: 'armor', w: 9, roll: i => Math.round((3 + rint(0, 3)) * bigScale(i)), fmt: v => `+${v.toLocaleString()} Armor` },
  { id: 'dr', w: 4, roll: i => 1 + Math.floor(i / 20) + rint(0, 2), fmt: v => `${v}% Damage Reduction` },
  { id: 'resPhys', w: 6, roll: i => 3 + Math.floor(i / 8) + rint(0, 4), fmt: v => `+${v}% Physical Resistance` },
  { id: 'resMagic', w: 6, roll: i => 3 + Math.floor(i / 8) + rint(0, 4), fmt: v => `+${v}% Magic Resistance` },
  { id: 'resPoison', w: 6, roll: i => 3 + Math.floor(i / 8) + rint(0, 4), fmt: v => `+${v}% Poison Resistance` },
  { id: 'enemyResDown', w: 3, roll: i => 2 + Math.floor(i / 12) + rint(0, 3), fmt: v => `Enemies lose ${v}% Resistances` },
  { id: 'skill', w: 4, roll: () => 1, fmt: (v, x) => `+${v} to ${x || 'a skill'}` },   // extra: skill id
  { id: 'allSkills', w: 1.5, roll: () => 1, fmt: v => `+${v} to All Skills` },
  // Vampiric: very rare, epic+ weapons only (see rollAffixes' eligibility filter).
  // Scales 1-10% life steal with item level.
  { id: 'lifesteal', w: 1, weaponOnly: true, minRarity: 'epic', roll: i => Math.min(10, 1 + Math.floor(i / 11) + rint(0, 1)), fmt: v => `+${v}% Life Steal` },
];

// Name parts keyed by affix id — items and runes generate their
// prefix/suffix from the stats they actually carry.
DATA.NAME_PARTS = {
  str:          { pre: ['Mighty', 'Brutish', "Giant's", 'Ironthewed'], suf: ['of Strength', 'of the Ox', 'of Iron Arms', 'of the Colossus'] },
  dex:          { pre: ['Agile', 'Limber', "Viper's", 'Featherlight'], suf: ['of Dexterity', 'of the Cat', 'of Quick Hands', 'of the Acrobat'] },
  int:          { pre: ['Clever', "Sage's", 'Mindful', 'Erudite'], suf: ['of Intelligence', 'of the Owl', 'of Deep Thought', 'of the Scholar'] },
  hp:           { pre: ['Stout', 'Vital', "Bear's", 'Hearty'], suf: ['of Vitality', 'of the Bear', 'of Long Life', 'of the Oak Heart'] },
  mana:         { pre: ['Azure', 'Soulful', 'Brimming', 'Bottomless'], suf: ['of Mana', 'of the Deep Well', 'of the Inner Sea', 'of Reverie'] },
  speed:        { pre: ['Fleet', 'Rushing', "Falcon's", 'Untiring'], suf: ['of Speed', 'of the Wind', 'of Haste', 'of the Chase'] },
  hpRegen:      { pre: ['Mending', 'Regrowing', "Troll's", 'Knitting'], suf: ['of Mending', 'of Regrowth', 'of Recovery', 'of Second Breath'] },
  manaRegen:    { pre: ['Flowing', 'Tidal', 'Welling', 'Murmuring'], suf: ['of Flow', 'of the Spring', 'of Clarity', 'of the Tide'] },
  evasion:      { pre: ['Elusive', 'Ghostly', 'Shifting', 'Blurred'], suf: ['of Evasion', 'of Mist', 'of Slipping Shadows', 'of the Untouched'] },
  dmgFlat:      { pre: ['Sharp', 'Cruel', 'Jagged', 'Biting'], suf: ['of Harm', 'of the Fang', 'of Wounding', 'of Keen Edges'] },
  dmgPct:       { pre: ['Savage', 'Merciless', 'Raging', 'Bloodthirsty'], suf: ['of Slaughter', 'of Fury', 'of Carnage', 'of the Berserker'] },
  armor:        { pre: ['Plated', 'Warding', "Turtle's", 'Bolstered'], suf: ['of Armor', 'of the Shell', 'of Warding', 'of the Rampart'] },
  dr:           { pre: ['Unyielding', 'Stony', 'Steadfast', 'Adamant'], suf: ['of Bulwarks', 'of Stone Skin', 'of Endurance', 'of the Bastion'] },
  resPhys:      { pre: ['Ironhide', 'Sturdy', 'Oaken', 'Deflecting'], suf: ['of Iron Hide', 'of Deflection', 'of the Ram', 'of Blunted Blades'] },
  resMagic:     { pre: ['Spellbane', 'Gleaming', 'Nullifying', 'Sigiled'], suf: ['of Spell Warding', 'of the Null', 'of the Sigil', 'of Broken Hexes'] },
  resPoison:    { pre: ['Cleansing', 'Pure', "Serpent's", 'Unblighted'], suf: ['of Antivenom', 'of Purity', 'of the Serpent', 'of Clean Blood'] },
  enemyResDown: { pre: ['Sundering', 'Piercing', 'Rending', 'Cracking'], suf: ['of Sundering', 'of Breaching', 'of the Breaker', 'of Split Guards'] },
  skill:        { pre: ["Adept's", 'Practiced', "Master's", 'Honed'], suf: ['of the Adept', 'of Technique', 'of Mastery', 'of Drilled Forms'] },
  allSkills:    { pre: ["Grandmaster's", 'Exalted', 'Allwise', 'Peerless'], suf: ['of All Arts', 'of the Grandmaster', 'of Ascendance', 'of Every Discipline'] },
};
// fallback if an item somehow has no affixes to name itself after
DATA.FALLBACK_PRE = ['Curious', 'Weathered', 'Polished', 'Odd'];
DATA.FALLBACK_SUF = ['of the Wanderer', 'of the Road', 'of Fortune', 'of the Unknown'];

// ------------------------------------------------------------
// Unique weapon names (rare / epic / legendary weapons)
// ------------------------------------------------------------
// Evocative nouns per weapon type — the second word of a unique name.
DATA.WEAPON_NOUNS = {
  greatsword: ['Cleaver', 'Reaver', 'Edge', 'Sorrow', 'Doom'],
  battleaxe: ['Hewer', 'Splitter', 'Maw', 'Bite', 'Grudge'],
  warhammer: ['Crusher', 'Knell', 'Fist', 'Toll', 'Verdict'],
  spear: ['Reach', 'Star', 'Pike', 'Answer', 'Horizon'],
  crossbow: ['Bolt', 'Judgment', 'Snap', 'Reply', 'Full-Stop'],
  bow: ['Song', 'Sigh', 'Arc', 'Whisper', 'Rain'],
  throwingknives: ['Swarm', 'Flight', 'Scatter', 'Chorus', 'Hail'],
  longsword: ['Fang', 'Oath', 'Song', 'Promise', 'Edge'],
  dagger: ['Sting', 'Kiss', 'Whisper', 'Thorn', 'Secret'],
  twinblade: ['Dance', 'Talon', 'Storm', 'Scissor', 'Waltz'],
  shortsword: ['Bite', 'Shard', 'Point', 'Snarl', 'Quill'],
  staff: ['Walker', 'Pillar', 'Word', 'Root', 'Question'],
  wand: ['Spark', 'Whim', 'Point', 'Wink', 'Murmur'],
  scepter: ['Crown', 'Scion', 'Star', 'Decree', 'Rod'],
};

// Evocative nouns for non-weapon items (epic/legendary unique names).
// Keyed by base id (offhands) or slot (armor pieces, jewelry).
DATA.ITEM_NOUNS = {
  buckler: ['Ward', 'Rebuff', 'Answer', 'Guard'],
  kiteshield: ['Wall', 'Bastion', 'Refuge', 'Aegis'],
  towershield: ['Mountain', 'Gate', 'Rampart', 'Bulwark'],
  orb: ['Eye', 'Sphere', 'Mind', 'Focus'],
  tome: ['Codex', 'Verse', 'Word', 'Grimoire'],
  helmet: ['Crown', 'Visage', 'Gaze', 'Brow'],
  armor: ['Aegis', 'Shell', 'Heart', 'Embrace'],
  gloves: ['Grip', 'Touch', 'Fists', 'Hold'],
  pants: ['Stride', 'March', 'Stance', 'Path'],
  boots: ['Walkers', 'Treads', 'Steps', 'Journey'],
  amulet: ['Tear', 'Heart', 'Promise', 'Memory'],
  ring: ['Band', 'Coil', 'Oath', 'Circle'],
  cloak: ['Shadow', 'Wings', 'Veil', 'Shroud'],
  belt: ['Cinch', 'Girdle', 'Sash', 'Reserve'],
};

// Short adjectives per affix — the first word of a rare/epic weapon name.
DATA.AFFIX_ADJ = {
  str: ['Brutal', 'Mighty', 'Heavy'], dex: ['Swift', 'Keen', 'Nimble'], int: ['Arcane', 'Wise', 'Lucid'],
  hp: ['Stout', 'Lifebound', 'Vital'], mana: ['Soulful', 'Azure', 'Deep'], speed: ['Fleet', 'Quick', 'Restless'],
  hpRegen: ['Mending', 'Living', 'Warm'], manaRegen: ['Flowing', 'Welling', 'Humming'],
  evasion: ['Ghostly', 'Fleeting', 'Pale'], dmgFlat: ['Cruel', 'Sharp', 'Hungry'], dmgPct: ['Savage', 'Raging', 'Wild'],
  armor: ['Warded', 'Iron', 'Shielding'], dr: ['Adamant', 'Stone', 'Grim'],
  resPhys: ['Sturdy', 'Oaken', 'Blunting'], resMagic: ['Runed', 'Gleaming', 'Null'], resPoison: ['Vile', 'Venom', 'Sour'],
  enemyResDown: ['Sundering', 'Piercing', 'Rending'], skill: ['Practiced', 'Honed', 'Studied'],
  allSkills: ['Peerless', 'Perfect', 'Exalted'],
  lifesteal: ['Vampiric', 'Bloodthirsty', 'Leeching'],
};

// Heroic epithets per affix — the first word of a legendary weapon name.
DATA.AFFIX_HEROIC = {
  str: ["Titan's", "Warlord's"], dex: ["Windrunner's", "Shadowdancer's"], int: ["Archmage's", "Oracle's"],
  hp: ["Lifewarden's", 'Everliving'], mana: ["Soulkeeper's", "Voidheart's"], speed: ["Stormchaser's", "Galewind's"],
  hpRegen: ["Phoenix's", 'Undying'], manaRegen: ["Wellspring's", "Tidecaller's"],
  evasion: ["Phantom's", 'Untouchable'], dmgFlat: ["Executioner's", 'Doomforged'], dmgPct: ["Warbringer's", "Slaughterer's"],
  armor: ["Bulwark's", 'Aegisborn'], dr: ['Unbreakable', "Mountain's"],
  resPhys: ["Juggernaut's", "Ironsoul's"], resMagic: ["Spellbreaker's", "Nullwarden's"], resPoison: ["Plaguebane's", "Serpentlord's"],
  enemyResDown: ["Worldsplitter's", "Siegemaster's"], skill: ["Virtuoso's", "Master's"],
  allSkills: ["Master's", "Grandmaster's"],
  lifesteal: ["Bloodletter's", "Nightfeeder's"],
};

// helper available to data + game
function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function chance(p) { return Math.random() < p; }
// +25% compounding growth per level (armor & magnitude affixes)
function bigScale(i) { return Math.pow(1.25, Math.max(0, i - 1)); }
// +50% compounding growth per level — weapon damage tracks monster HP
function dmgScale(i) { return Math.pow(1.5, Math.max(0, i - 1)); }
