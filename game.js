// ============================================================
// KHARUN LANDS — Game Engine
// ============================================================
'use strict';

const SAVE_KEY = 'kharun-lands-save-v1';         // legacy single-save key, migrated into slot 0 on first load
const SLOTS_KEY = 'kharun-lands-slots-v1';
const MAX_SLOTS = 5;
let activeSlot = null;   // index (0..MAX_SLOTS-1) of the slot G was loaded from / is being saved to
const MAX_LEVEL_AREA = 100;
const CREATURES_PER_LEVEL = 1111;
const MAX_RANK = 10;

let G = null;          // global game state
let ADV = null;        // active adventure run state
let advTimer = null;
let LOG = [];          // battle log — persists until the NEXT adventure starts

function log(t, txt, extra) {
  LOG.push(Object.assign({ t, txt }, extra || {}));
  if (LOG.length > 50) LOG.splice(0, LOG.length - 50);
}

// ------------------------------------------------------------
// State creation / persistence (localStorage — bigger and more
// reliable than cookies, and never sent over the network)
// ------------------------------------------------------------
// Monster tiers used by the auto-use tier checkboxes, ordered
// strongest-to-weakest to match the Combat Options tier order.
const AUTO_USE_TIERS = ['legendary', 'miniboss', 'epic', 'rare', 'normal'];
function emptyTierSet(v) { const o = {}; for (const t of AUTO_USE_TIERS) o[t] = v; return o; }

function defaultSettings() {
  return {
    packSize: 1, advSpeed: 1200, lastAdvLevel: null,
    autoSell: { normal: false, magical: false, rare: false, epic: false, legendary: false, unusable: false, all: false },
    // per-encounter-tier behavior when a new pack of that tier spawns
    encounterMode: { legendary: 'speed1x', epic: 'speed1x', rare: 'continue', miniboss: 'continue', abnormal: 'continue' },
    autoUse: {
      hpPotion: 'off', manaPotion: 'off',      // 'off' | 100 | 50 | 25 (HP/mana % threshold)
      heal: 'off',                              // 'off' | 100 | 50 | 25
      buff: 'off',                               // 'off' | 100 | 50 | 25 (mana % threshold)
      debuff: { mode: 'off', tiers: emptyTierSet(false) },    // mode: 'off' | 100 | 50 | 'available'
      ultimate: { mode: 'off', tiers: emptyTierSet(false) },
      damage: { mode: 'off', tiers: emptyTierSet(false) },
    },
  };
}
// Fills in any settings fields missing from an older save without
// clobbering what the player already configured.
function ensureSettings() {
  if (!G.settings) G.settings = {};
  const def = defaultSettings();
  for (const k of ['packSize', 'advSpeed', 'lastAdvLevel']) if (G.settings[k] === undefined) G.settings[k] = def[k];
  if (!G.settings.autoSell) G.settings.autoSell = def.autoSell;
  if (!G.settings.encounterMode) G.settings.encounterMode = def.encounterMode;
  else for (const k of Object.keys(def.encounterMode)) if (G.settings.encounterMode[k] === undefined) G.settings.encounterMode[k] = def.encounterMode[k];
  if (!G.settings.autoUse) G.settings.autoUse = def.autoUse;
  else {
    const au = G.settings.autoUse;
    for (const k of ['hpPotion', 'manaPotion', 'heal', 'buff']) if (au[k] === undefined) au[k] = def.autoUse[k];
    for (const k of ['debuff', 'ultimate', 'damage']) {
      if (!au[k]) au[k] = def.autoUse[k];
      else if (!au[k].tiers) au[k].tiers = emptyTierSet(false);
    }
  }
}

function newGame(clsId, slotIdx) {
  activeSlot = slotIdx;
  const cls = DATA.CLASSES[clsId];
  G = {
    v: 1,
    char: {
      cls: clsId,
      version: DATA.VERSION,
      name: cls.heroName,
      level: 1, xp: 0,
      statPoints: 0, skillPoints: 1,
      stats: { ...cls.baseStats },
      skills: { [Object.values(DATA.SKILLS[clsId]).find(s => s.cat === 'basic').id]: 1 },
      equip: {},   // slot -> item
      hp: 0, mana: 0, // set after derive
      kills: 0,
      advancedClass: null,   // path id (e.g. 'knight') chosen at level 25, or null
      tier3Seen: false,      // guards the one-time level-50 evolution announcement
    },
    gold: 25,
    potions: { hp: 2, mana: 1 },   // drinkable stock — capped by potionCapacity(); used manually in combat
    inventory: [],       // items + runes
    area: 1,             // selected area level
    unlocked: 1,         // highest unlocked area
    progress: {},        // areaLevel -> kills in that level (0..1111)
    bossKilled: {},      // areaLevel -> true
    arenaResult: {},      // areaLevel -> 'won' | 'lost'
    totals: {
      adventures: 0, kills: { normal: 0, rare: 0, epic: 0, miniboss: 0, legendary: 0 },
      killsBySpecies: {}, bossesKilled: 0, deaths: 0,
      dmgDealt: 0, dmgTaken: 0,
      itemsFound: 0, itemsByRarity: { normal: 0, magical: 0, rare: 0, epic: 0, legendary: 0 }, runesFound: 0,
      goldFound: 0, goldSpent: 0, itemsSold: 0, goldFromSales: 0,
      potionsUsed: 0, runesSocketed: 0, questsCompleted: 0,
    },
    settings: defaultSettings(),
    shop: null,
    tavern: null,
    itemSeq: 1,
  };
  giveStarterGear(clsId);
  genShopStock();
  genTavernBoard();
  const d = derive();
  G.char.hp = d.maxHp; G.char.mana = d.maxMana;
  saveGame();
}

// Fresh heroes get a simple weapon and armor so level 1 is survivable.
function giveStarterGear(clsId) {
  const weaponId = { warrior: 'longsword', rogue: 'dagger', mage: 'wand' }[clsId];
  const armorWeight = { warrior: 'heavy', rogue: 'medium', mage: 'light' }[clsId];
  const wBase = DATA.WEAPON_BASES.find(w => w.id === weaponId);
  const weapon = {
    uid: G.itemSeq++, type: 'item', ilvl: 1, rarity: 'normal', runes: [], sockets: 0,
    slot: 'weapon', base: wBase.id, icon: wBase.icon, baseName: `Worn ${wBase.name}`,
    name: `Worn ${wBase.name}`, hands: wBase.hands, classes: wBase.classes, magic: !!wBase.magic,
    atkSpd: wBase.atkSpd || 1,
    dmgMin: wBase.dmg[0], dmgMax: wBase.dmg[1], affixes: [], value: 1,
  };
  const aBase = DATA.ARMOR_BASES.armor[armorWeight];
  const armor = {
    uid: G.itemSeq++, type: 'item', ilvl: 1, rarity: 'normal', runes: [], sockets: 0,
    slot: 'armor', base: `armor_${armorWeight}`, icon: DATA.ARMOR_ICONS.armor,
    baseName: `Worn ${aBase.name}`, name: `Worn ${aBase.name}`, weight: armorWeight,
    armor: aBase.armor, affixes: [], value: 1,
  };
  G.char.equip.weapon = weapon;
  G.char.equip.armor = armor;
}

// ------------------------------------------------------------
// Save slots — up to MAX_SLOTS concurrent heroes. Slot array is stored
// as one JSON blob (an array of length MAX_SLOTS, empty entries null).
// A pre-multi-slot save under the old SAVE_KEY is migrated into slot 0
// the first time loadSlots() runs.
// ------------------------------------------------------------
function loadSlots() {
  let slots;
  try { slots = JSON.parse(localStorage.getItem(SLOTS_KEY)); } catch (e) { slots = null; }
  if (!Array.isArray(slots)) slots = new Array(MAX_SLOTS).fill(null);
  while (slots.length < MAX_SLOTS) slots.push(null);
  if (slots.length > MAX_SLOTS) slots = slots.slice(0, MAX_SLOTS);
  // one-time migration of the legacy single-save slot
  if (slots.every(s => !s)) {
    try {
      const legacy = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (legacy && legacy.char) { slots[0] = legacy; saveSlots(slots); localStorage.removeItem(SAVE_KEY); }
    } catch (e) { /* no legacy save */ }
  }
  return slots;
}
function saveSlots(slots) { try { localStorage.setItem(SLOTS_KEY, JSON.stringify(slots)); } catch (e) { /* full/blocked */ } }

function saveGame() {
  if (activeSlot === null) return;
  const slots = loadSlots();
  slots[activeSlot] = G;
  saveSlots(slots);
}
function hasAnySave() { return loadSlots().some(s => !!s); }
function loadGame(slotIdx) {
  const slots = loadSlots();
  const g = slots[slotIdx];
  if (!g || !g.char) return false;
  G = g;
  activeSlot = slotIdx;
  ensureSettings();
  if (G.totals && G.totals.kills && G.totals.kills.miniboss === undefined) G.totals.kills.miniboss = 0;
  if (G.totals) {
    const t = G.totals;
    if (!t.killsBySpecies) t.killsBySpecies = {};
    for (const k of ['bossesKilled', 'deaths', 'dmgDealt', 'dmgTaken', 'itemsFound', 'runesFound', 'goldFound', 'goldSpent', 'itemsSold', 'goldFromSales', 'potionsUsed', 'runesSocketed', 'questsCompleted']) {
      if (t[k] === undefined) t[k] = 0;
    }
    if (!t.itemsByRarity) t.itemsByRarity = { normal: 0, magical: 0, rare: 0, epic: 0, legendary: 0 };
  }
  if (!G.potions) G.potions = { hp: 0, mana: 0 };
  if (!G.arenaResult) G.arenaResult = {};
  if (G.char.advancedClass === undefined) G.char.advancedClass = null;
  if (G.char.tier3Seen === undefined) G.char.tier3Seen = false;
  if (!G.shop || !G.shop.stock) genShopStock();
  // old saves carry quests with a baked-in "reward" object instead of
  // the current "rewardSpec" — those can't be displayed or claimed
  // under the new schema, so just reroll the board (and drop whatever
  // quest was active; nothing was owed on it since rewards weren't
  // claimable-on-demand before this).
  // Older saves also had a single `active` quest object (or null) instead
  // of the current up-to-2 array — normalize the shape before the
  // rewardSpec staleness check below reads it as an array.
  if (G.tavern && !Array.isArray(G.tavern.active)) {
    G.tavern.active = G.tavern.active ? [G.tavern.active] : [];
  }
  if (!G.tavern || G.tavern.active.some(q => !q.rewardSpec) || (G.tavern.board || []).some(q => !q.rewardSpec)) {
    G.tavern = { board: [], active: [] };
    genTavernBoard();
  }
  runVersionMigration();
  return true;
}

// Runs once per Continue whenever a save's stamped version doesn't match
// the running game's DATA.VERSION (including saves from before c.version
// existed, which read as undefined here) — an explicit request to keep
// returning characters aligned with whatever balance/content changed since
// they last played, rather than silently carrying stale numbers forward.
// Three things happen, in order: (1) skills — drop any learned skill id no
// longer defined for this class (a renamed/removed skill from an older
// build), reclamp any rank a since-lowered MAX_RANK would leave over cap,
// and retry migrateAdvancedClassRanks in case this save predates that fix
// existing at all; (2) items/runes — every equipped item, every inventory
// item, and every loose or socketed rune is regenerated fresh at its own
// existing slot/rarity/ilvl (items) or bonus-tier/ilvl (runes) via the same
// makeItem/buildRune paths normal drops use, so gear reflects current
// affix formulas instead of whatever rolled them originally; a rerolled
// item's socket count is rolled independently of its old one, so rerolled
// runes that no longer fit are kept as loose inventory runes rather than
// discarded; (3) vitals are reclamped last since gear affixes (+HP/+Mana)
// feed maxHp/maxMana.
function runVersionMigration() {
  const c = G.char;
  if (c.version === DATA.VERSION) return;

  const validIds = new Set(Object.keys(DATA.SKILLS[c.cls]));
  for (const id of Object.keys(c.skills)) {
    if (!validIds.has(id)) delete c.skills[id];
    else if (c.skills[id] > MAX_RANK) c.skills[id] = MAX_RANK;
  }
  migrateAdvancedClassRanks();

  const rerollRune = r => r.baseName === 'Mythic Rune'
    ? buildRune(MYTHIC_RUNE_BONUSES, r.ilvl, { baseName: 'Mythic Rune', rarity: 'legendary' })
    : buildRune(r.bonuses.length, r.ilvl);
  const overflowRunes = [];
  const rerollItemWithRunes = it => {
    const fresh = makeItem(it.ilvl, it.rarity, c.cls, it.slot);
    const rerolled = (it.runes || []).map(rerollRune);
    fresh.runes = rerolled.slice(0, fresh.sockets);
    overflowRunes.push(...rerolled.slice(fresh.sockets));
    return fresh;
  };

  for (const slot of Object.keys(c.equip)) {
    if (c.equip[slot]) c.equip[slot] = rerollItemWithRunes(c.equip[slot]);
  }
  G.inventory = G.inventory.map(it => it.type === 'rune' ? rerollRune(it) : rerollItemWithRunes(it));
  G.inventory.push(...overflowRunes);

  clampVitals();
  c.version = DATA.VERSION;
}

function deleteSlot(slotIdx) {
  const slots = loadSlots();
  slots[slotIdx] = null;
  saveSlots(slots);
}

// ------------------------------------------------------------
// Derived stats
// ------------------------------------------------------------
function effectiveRank(skillId) {
  const rank = G.char.skills[skillId] || 0;
  if (rank <= 0) return 0;
  let bonus = 0;
  for (const it of equippedItems()) {
    for (const a of allAffixesOf(it)) {
      if (a.id === 'allSkills') bonus += a.v;
      if (a.id === 'skill' && a.skillId === skillId) bonus += a.v;
    }
  }
  // Learned rank caps at MAX_RANK, but gear (+skill/+All Skills) can push
  // the effective rank beyond it — capped at double, not unlimited.
  return Math.min(rank + bonus, MAX_RANK * 2);
}

function equippedItems() { return Object.values(G.char.equip).filter(Boolean); }
function allAffixesOf(item) {
  const out = [...(item.affixes || [])];
  for (const r of (item.runes || [])) out.push(...r.bonuses);
  return out;
}

// Picks which skill occupies a given cat slot for the current character.
// Advanced Class path skills share a cat with the base skill they evolve
// (e.g. Divine Protection is also cat:'buff', replacing Battle Shout) so
// every "one skill per cat" site — the skill list, the hotbar, proc pools —
// can stay a flat per-cat lookup instead of needing a second dimension.
function classSkillFor(cat) {
  const c = G.char;
  const skills = Object.values(DATA.SKILLS[c.cls]);
  return skills.find(s => s.cat === cat && s.path === c.advancedClass)
      || skills.find(s => s.cat === cat && !s.path);
}

// The class name shown throughout the UI: base class until an Advanced
// Class path is chosen (level 25), that path's tier-2 name from 25-49, and
// its tier-3 name from level 50 on — tier-3 is a pure function of
// (advancedClass, level), no extra saved field needed.
function className(char) {
  const base = DATA.CLASSES[char.cls];
  if (!char.advancedClass) return base.name;
  const path = DATA.ADVANCED_PATHS[char.cls].find(p => p.id === char.advancedClass);
  if (!path) return base.name;
  return char.level >= 50 ? path.tier3Name : path.tier2Name;
}

// buffBonus: optional { str, dex, int } from active combat buffs (e.g. a
// buff skill's stat bonus) — previously declared on every class's buff
// skill but never actually consumed anywhere, so "+X Strength" etc. from
// Battle Shout/Deadly Focus/Arcane Power did nothing. Folded in here,
// before it feeds every downstream formula (HP/Mana/Speed/Evasion/Regen/
// damage), so it only needs to be passed once by the live-combat caller.
function derive(buffBonus) {
  const c = G.char;
  const cls = DATA.CLASSES[c.cls];
  const bb = buffBonus || { str: 0, dex: 0, int: 0 };
  const d = {
    str: c.stats.str + bb.str, dex: c.stats.dex + bb.dex, int: c.stats.int + bb.int,
    armor: 0, evasion: 0, speed: 0,
    hpFlat: 0, manaFlat: 0, hpPct: 0, manaPct: 0,
    hpRegen: 0, manaRegen: 0, lifesteal: 0, manasteal: 0,
    dmgFlat: 0, dmgPct: 0, dr: 0,
    res: { phys: 0, magic: 0, poison: 0 },
    enemyResDown: 0,
    weaponMin: 1, weaponMax: 2, weaponMagic: false, weaponSpd: 0,
    weaponPoison: null, weaponSlow: null,
    painReflect: 0, execute: 0, goldFind: 0, magicFind: 0,
    critStrike: 0, doubleStrike: 0, procOffense: 0, procSupport: 0,
    blockChance: 0, immuneSlow: false, immuneCharm: false, immuneNecrotic: false,
  };
  // gear
  for (const it of equippedItems()) {
    if (it.armor) d.armor += it.armor;
    if (it.spd) d.weaponSpd += it.spd;
    for (const a of allAffixesOf(it)) {
      switch (a.id) {
        case 'str': d.str += a.v; break;
        case 'dex': d.dex += a.v; break;
        case 'int': d.int += a.v; break;
        case 'allStats': d.str += a.v; d.dex += a.v; d.int += a.v; break;
        case 'hp': d.hpFlat += a.v; break;
        case 'mana': d.manaFlat += a.v; break;
        case 'speed': d.speed += a.v; break;
        case 'hpRegen': d.hpRegen += a.v; break;
        case 'manaRegen': d.manaRegen += a.v; break;
        case 'evasion': d.evasion += a.v; break;
        case 'dmgFlat': d.dmgFlat += a.v; break;
        case 'dmgPct': d.dmgPct += a.v / 100; break;
        case 'armor': d.armor += a.v; break;
        case 'dr': d.dr += a.v / 100; break;
        case 'resPhys': d.res.phys += a.v; break;
        case 'resMagic': d.res.magic += a.v; break;
        case 'resPoison': d.res.poison += a.v; break;
        case 'enemyResDown': d.enemyResDown += a.v; break;
        case 'lifesteal': d.lifesteal += a.v; break;
        case 'manasteal': d.manasteal += a.v; break;
        case 'poisonWeapon': d.weaponPoison = a.v; break;
        case 'slowWeapon': d.weaponSlow = a.v; break;
        case 'painReflect': d.painReflect += a.v; break;
        case 'execute': d.execute += a.v; break;
        case 'goldFind': d.goldFind += a.v; break;
        case 'magicFind': d.magicFind += a.v; break;
        case 'critStrike': d.critStrike += a.v; break;
        case 'doubleStrike': d.doubleStrike += a.v; break;
        case 'procOffense': d.procOffense += a.v; break;
        case 'procSupport': d.procSupport += a.v; break;
      }
    }
  }
  // weapons
  const w = c.equip.weapon, oh = c.equip.offhand;
  let wMin = 0, wMax = 0;
  if (w) { wMin += w.dmgMin; wMax += w.dmgMax; d.weaponMagic = !!w.magic; }
  if (oh && oh.dmgMin) { wMin += Math.round(oh.dmgMin * 0.6); wMax += Math.round(oh.dmgMax * 0.6); }
  if (wMin > 0) { d.weaponMin = wMin; d.weaponMax = wMax; }
  // Shields: a level-scaled chance to block an incoming hit outright (see
  // enemyHit), plus up to 3 rolled protection flags (immunities/half-damage).
  if (isShieldItem(oh)) {
    d.blockChance = shieldBlockChance(G.area);
    for (const p of (oh.protections || [])) {
      if (p === 'immuneSlow') d.immuneSlow = true;
      else if (p === 'immuneCharm') d.immuneCharm = true;
      else if (p === 'immuneNecrotic') d.immuneNecrotic = true;
      else if (p === 'resPhysHalf') d.res.phys += 50;
      else if (p === 'resMagicHalf') d.res.magic += 50;
      else if (p === 'resPoisonHalf') d.res.poison += 50;
    }
  }
  d.weaponMin += d.dmgFlat; d.weaponMax += d.dmgFlat;
  // weapon speed: the hero acts every atkInterval gauge (dagger 50, greatsword 150)
  let atkFactor = w ? (w.atkSpd || 1) : 1;
  if (oh && oh.dmgMin && oh.atkSpd) atkFactor = (atkFactor + oh.atkSpd) / 2;   // dual wield averages
  d.atkFactor = atkFactor;
  d.atkInterval = Math.max(30, Math.round(100 * atkFactor));

  // passives
  for (const s of Object.values(DATA.SKILLS[c.cls])) {
    if (!s.passive) continue;
    const r = effectiveRank(s.id);
    if (r <= 0) continue;
    const p = s.passive(r);
    if (p.hpPct) d.hpPct += p.hpPct;
    if (p.manaPct) d.manaPct += p.manaPct;
    if (p.armor) d.armor += p.armor;
    if (p.hpRegen) d.hpRegen += p.hpRegen;
    if (p.manaRegen) d.manaRegen += p.manaRegen;
    if (p.evasion) d.evasion += p.evasion;
    if (p.speed) d.speed += p.speed;
    if (p.dmgPct) d.dmgPct += p.dmgPct;
    if (p.dr) d.dr += p.dr;
    if (p.resAll) { d.res.phys += p.resAll; d.res.magic += p.resAll; d.res.poison += p.resAll; }
    if (p.critStrike) d.critStrike += p.critStrike;
    if (p.doubleStrike) d.doubleStrike += p.doubleStrike;
    if (p.execute) d.execute += p.execute;
    if (p.painReflect) d.painReflect += p.painReflect;
    if (p.lifesteal) d.lifesteal += p.lifesteal;
  }

  // MAIN STATS drive the important stats. statLevelMult makes each point
  // of Str/Dex/Int worth more as the character levels up (+2%/level,
  // e.g. 2x at level 50, 3x at level 100) — a direct request that stat
  // points and the Speed sub-stat felt too weak at high level. Only
  // applied to HP/Mana/Speed/Evasion/Regen, not the 1%/pt damage bonus
  // below (that's a separate, already-powerful lever left untouched).
  const statLevelMult = 1 + c.level * 0.02;
  d.maxHp = Math.round((50 + d.str * 9 * statLevelMult + c.level * 8 + d.hpFlat) * (1 + d.hpPct));
  d.speed = Math.round(10 + d.dex * 2 * statLevelMult + d.speed + d.weaponSpd);
  d.maxMana = Math.round((20 + d.int * 7 * statLevelMult + c.level * 3 + d.manaFlat) * (1 + d.manaPct));
  // sub stats
  // Life Regen is 3x (200% more) as effective as its old formula.
  d.hpRegen = +((1 + d.str * 0.2 * statLevelMult + d.hpRegen) * 0.2 * 3).toFixed(1);
  d.evasion = Math.min(60, +(d.dex * 0.1 * statLevelMult + d.evasion).toFixed(1));
  d.manaRegen = +((1 + d.int * 0.4 * statLevelMult + d.manaRegen) * 0.5).toFixed(1);
  // caps
  d.res.phys = Math.min(75, d.res.phys); d.res.magic = Math.min(75, d.res.magic); d.res.poison = Math.min(75, d.res.poison);
  d.dr = Math.min(0.6, d.dr);
  d.lifesteal = Math.min(10, d.lifesteal);
  d.manasteal = Math.min(10, d.manasteal);
  d.painReflect = Math.min(50, d.painReflect);
  d.critStrike = Math.min(50, d.critStrike);
  d.doubleStrike = Math.min(40, d.doubleStrike);
  d.procOffense = Math.min(30, d.procOffense);
  d.procSupport = Math.min(30, d.procSupport);
  // dmgPct/execute were the only two combat-relevant percentage stats
  // with no ceiling at all (every sibling stat above has one) — capped
  // generously so normal itemization/passive investment never binds,
  // only truly maxed-out stacking across every possible source does.
  d.dmgPct = Math.min(1.5, d.dmgPct);
  d.execute = Math.min(75, d.execute);
  // base damage: weapon + main stat scaling; the class's main stat
  // additionally grants +1% damage per point
  const main = { warrior: d.str, rogue: d.dex, mage: d.int }[c.cls];
  const mainMult = 1 + main * 0.01;
  d.mainStatDmgPct = main;
  d.baseDmgMin = Math.round((d.weaponMin + main * 0.9) * (1 + d.dmgPct) * mainMult);
  d.baseDmgMax = Math.round((d.weaponMax + main * 1.1) * (1 + d.dmgPct) * mainMult);
  return d;
}

function sumBuffStats(buffs) {
  const b = { str: 0, dex: 0, int: 0 };
  for (const buf of buffs) { b.str += buf.str || 0; b.dex += buf.dex || 0; b.int += buf.int || 0; }
  return b;
}

// ------------------------------------------------------------
// XP / leveling
// ------------------------------------------------------------
// Level 1 = 100 XP, Level 2 = 200 XP. Level N (N>=3) = 60% of the sum of
// the two preceding levels' requirements, plus a flat 1000 — e.g.
// L3 = (100+200)*0.6 + 1000 = 1180.
const XP_LEVEL_CACHE = [undefined, 100, 200];
function xpForLevel(lvl) {
  if (XP_LEVEL_CACHE[lvl] !== undefined) return XP_LEVEL_CACHE[lvl];
  for (let l = XP_LEVEL_CACHE.length; l <= lvl; l++) {
    XP_LEVEL_CACHE[l] = Math.round((XP_LEVEL_CACHE[l - 1] + XP_LEVEL_CACHE[l - 2]) * 0.6 + 1000);
  }
  return XP_LEVEL_CACHE[lvl];
}

// Stat points per level rise in two brackets past the Advanced Class
// milestones: the base +3/level up to 25, +4/level from 26-50, +5/level
// from 51 on. Skill points stay a flat +1/level throughout.
function statPointsForLevel(level) {
  if (level > 50) return 5;
  if (level > 25) return 4;
  return 3;
}

function gainXp(amount, run) {
  const c = G.char;
  c.xp += amount;
  let ups = 0, statGained = 0;
  while (c.xp >= xpForLevel(c.level)) {
    c.xp -= xpForLevel(c.level);
    c.level++; ups++;
    const sp = statPointsForLevel(c.level);
    c.statPoints += sp; c.skillPoints += 1;
    statGained += sp;
  }
  if (ups) {
    if (run) run.levelUps += ups;
    log('sys', `🎉 LEVEL UP! You are now level ${c.level} (+${statGained} stat, +${ups} skill point${ups > 1 ? 's' : ''})`);
  }
  return ups;
}

function spendStat(stat) {
  if (G.char.statPoints <= 0) return;
  G.char.statPoints--; G.char.stats[stat]++;
  clampVitals(); saveGame(); UI.refresh();
}

// Resolves a skill's `req` id to whichever skill actually needs to have
// rank for that requirement to still mean anything for this character.
// Needed because an Advanced Class path can replace — and, per
// migrateAdvancedClassRanks, delete the now-orphaned entry for — the exact
// skill a `req` id names. Two cases: (1) nothing has taken over the req'd
// skill's cat, so it still resolves to itself (the common case, and the
// only case for a character with no Advanced Class chosen yet); (2) a path
// skill now occupies that cat instead (e.g. Avatar of War's req names
// Berserk, but a Knight's Berserk rank now lives under Aegis of the
// Paladin) — resolves to that replacement so the requirement keeps working
// off wherever the rank actually is.
//
// A third case needs its own handling: when the skill being checked IS
// itself the thing currently occupying that cat — a path skill whose own
// req names the exact base skill it replaces, like Divine Protection
// naming Battle Shout, or Venomous Strike naming Eviscerate. A successor
// must never require its own predecessor (that req would be either
// redundant, since any rank it has came from migrating that very skill, or
// a permanent deadlock at rank 0 — "requires rank > 0 of itself"). But the
// predecessor's OWN req, if it had one, is a real, separate prerequisite
// skill that migration never carried over on its own (e.g. Eviscerate
// itself required Backstab — a different skill, in a different, untouched
// cat) — so the successor inherits THAT instead, recursively, same as if
// the predecessor had been asked "what do you require?" one level up.
function effectiveReqSkill(skill) {
  if (!skill.req) return null;
  const reqBase = DATA.SKILLS[G.char.cls][skill.req];
  const current = classSkillFor(reqBase.cat) || reqBase;
  return current === skill ? effectiveReqSkill(reqBase) : current;
}

function canLearn(skill) {
  const c = G.char;
  // Advanced Class path skills are exclusive to the chosen path; the base
  // skill they evolve (same cat, no path) becomes locked the moment that
  // path's replacement exists for this character, whether or not it's
  // been learned yet. Any rank already invested in the base skill is
  // transferred to the replacement by chooseAdvancedClass/
  // migrateAdvancedClassRanks below, so this lock never costs progress.
  if (skill.path) {
    if (c.advancedClass !== skill.path) return { ok: false, why: 'Wrong Advanced Class path' };
  } else {
    const replacement = classSkillFor(skill.cat);
    if (replacement !== skill) return { ok: false, why: `Replaced by ${replacement.name}` };
  }
  const cur = c.skills[skill.id] || 0;
  if (cur >= MAX_RANK) return { ok: false, why: 'Max rank' };
  if (c.skillPoints <= 0) return { ok: false, why: 'No skill points' };
  if (c.level < skill.minLvl) return { ok: false, why: `Requires level ${skill.minLvl}` };
  const req = effectiveReqSkill(skill);
  if (req && !(c.skills[req.id] > 0)) {
    return { ok: false, why: `Requires ${req.name}` };
  }
  return { ok: true };
}

function learnSkill(skillId) {
  const skill = DATA.SKILLS[G.char.cls][skillId];
  if (!canLearn(skill).ok) return;
  G.char.skillPoints--;
  G.char.skills[skillId] = (G.char.skills[skillId] || 0) + 1;
  saveGame(); UI.refresh();
}

// For every path skill that shares a cat with a base (non-path) skill —
// i.e. every skill that actually replaces one, not the brand-new
// passive3/passive4 slots — carries over any rank already invested in
// that base skill so picking a path never resets a skill the player had
// been ranking up (e.g. a maxed Eviscerate becoming Venomous Strike keeps
// its 10 ranks instead of restarting at 0). The base skill's now-orphaned
// entry is deleted since canLearn locks it out permanently the moment a
// path is chosen. Guarded with `!(c.skills[s.id] > 0)` so a second call
// (e.g. from a future version-migration re-run) can't clobber rank the
// player has since organically earned in the replacement itself.
function migrateAdvancedClassRanks() {
  const c = G.char;
  if (!c.advancedClass) return;
  const skills = Object.values(DATA.SKILLS[c.cls]);
  for (const s of skills.filter(sk => sk.path === c.advancedClass)) {
    const base = skills.find(b => !b.path && b.cat === s.cat);
    if (base && c.skills[base.id] > 0 && !(c.skills[s.id] > 0)) {
      c.skills[s.id] = Math.min(c.skills[base.id], MAX_RANK);
      delete c.skills[base.id];
    }
  }
}

function chooseAdvancedClass(pathId) {
  G.char.advancedClass = pathId;
  migrateAdvancedClassRanks();
  saveGame();
}

function clampVitals() {
  const d = derive();
  G.char.hp = Math.min(G.char.hp, d.maxHp);
  G.char.mana = Math.min(G.char.mana, d.maxMana);
}

// ------------------------------------------------------------
// Items
// ------------------------------------------------------------
// Armor scaling — deliberately NOT bigScale (1.25^level). Armor feeds a
// diminishing-returns mitigation formula (see enemyHit) whose denominator
// grows linearly with enemy level; pairing that with exponentially-growing
// armor made armorRed asymptote to ~100% by roughly level 35 (physical
// damage taken trending to the Math.max(1,...) floor regardless of build).
// dmgFlatScale (linear, already used for the +Weapon Damage affix for the
// same "old curve let this explode" reason) keeps armor growing at the
// same rate as the formula's own denominator, so a full armor set now
// converges to a stable, gear-weight-differentiated mitigation percentage
// (roughly 55% light / 66% medium / 76% heavy at endgame) instead of
// runaway immunity — see enemyHit's added 75% hard cap for the safety net.
function itemScale(ilvl) { return dmgFlatScale(ilvl); }

// All skill mana costs are tripled — mana is a scarce resource.
// Mage spells get a 30% discount on that.
const MANA_COST_MULT = 3;
function skillCost(s) {
  const mult = s.id && s.id.startsWith('m_') ? MANA_COST_MULT * 0.7 : MANA_COST_MULT;
  return Math.round((s.cost ? s.cost() : 0) * mult);
}

const RARITY_ORDER = { normal: 0, magical: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
// Jewelry ("Jewelry can get everything") bypasses both `weaponOnly` and
// `slots` gating below — it never bypasses `minRarity`.
const JEWELRY_SLOTS = ['ring', 'amulet', 'cloak', 'belt'];
function isJewelrySlot(slot) { return JEWELRY_SLOTS.includes(slot); }

// How many stats a rolled item ends up with: starts at `min`, then each
// step has a coin-flip chance to add one more, up to `max` — so the
// distribution halves at each step (e.g. Epic 4-7: 50% @4, 25% @5,
// 12.5% @6, 12.5% @7). The flip's odds shift with item level: low-level
// areas roll fewer extra stats, high-level areas roll more — centered
// on ilvl 50 so early/late game both visibly diverge from a flat 50%.
function extraStatChance(ilvl) {
  return Math.max(0.3, Math.min(0.7, 0.5 + (ilvl - 50) * 0.003));
}
function rollItemStatCount(min, max, ilvl) {
  let n = min;
  const p = extraStatChance(ilvl);
  while (n < max && chance(p)) n++;
  return n;
}
// "Increase the stat bonus range by 100%" — every plain magnitude affix
// roll is doubled (so a stat that used to roll 1-10 now rolls 1-20).
// Explicitly excluded: the rare, deliberately-capped combat procs (Crit/
// Double Strike, Life/Mana Steal, Execute, Spellstrike/Blessing) and the
// compound proc affixes (Poison/Slow Weapon) — those keep their existing
// tuned ranges rather than blowing past their documented balance caps.
const RANGE_DOUBLE_EXCLUDE = new Set([
  'lifesteal', 'manasteal', 'poisonWeapon', 'slowWeapon', 'execute',
  'critStrike', 'doubleStrike', 'procOffense', 'procSupport',
]);
function rollAffixValue(def, ilvl) {
  const v = def.roll(ilvl);
  return (typeof v === 'number' && !RANGE_DOUBLE_EXCLUDE.has(def.id)) ? v * 2 : v;
}

// runeRarity: the rarity a rune-in-progress will end up as (its bonus-count
// tier — see RUNE_TIERS), used in place of an item's own rarity to gate
// minRarity affixes when rolling for a rune (item is null in that case).
function rollAffixes(count, ilvl, clsId, item, runeRarity) {
  const out = [];
  const used = new Set();
  const isRune = !item;
  // Gated affixes (e.g. Vampiric: weapon-only, epic+) enter the pool once
  // the item/rune actually qualifies. Jewelry ("can get everything") and
  // runes (not tied to any one slot until socketed — see rollShieldSockets'
  // neighboring comment history for why they used to be excluded outright)
  // both bypass the weaponOnly/slots gates; minRarity is still enforced
  // against whichever rarity applies (the item's own, or the rune's).
  const pool = DATA.AFFIXES.filter(a => {
    const jewelry = !!item && isJewelrySlot(item.slot);
    const bypassSlot = jewelry || isRune;
    if (a.weaponOnly && !bypassSlot) return false;
    if (a.minRarity) {
      const rarity = item ? item.rarity : runeRarity;
      if (!rarity || RARITY_ORDER[rarity] < RARITY_ORDER[a.minRarity]) return false;
    }
    if (a.slots && !bypassSlot) return false;
    return true;
  });
  const totalW = pool.reduce((s, a) => s + a.w, 0);
  let guard = 0;
  while (out.length < count && guard++ < 200) {
    let roll = Math.random() * totalW, af = pool[0];
    for (const a of pool) { roll -= a.w; if (roll <= 0) { af = a; break; } }
    if (used.has(af.id) && af.id !== 'skill') continue;
    used.add(af.id);
    const entry = { id: af.id, v: rollAffixValue(af, ilvl) };
    if (af.id === 'skill') {
      const skills = Object.values(DATA.SKILLS[clsId || G?.char?.cls || 'warrior']);
      const s = pick(skills);
      entry.skillId = s.id; entry.skillName = s.name;
    }
    out.push(entry);
  }
  return out;
}

// Minnie's (mage) class-exclusive weapons/offhands: legendary-rarity Arcane
// Staff/Wand/Scepter/Orb/Tome additionally guarantee 1-3 DISTINCT +skill
// affixes (each +1..+3, same shape/behavior as the generic 'skill' affix —
// see rollAffixes above) on top of the normal roll, gated to legendary
// rarity to match the game's existing "ultra rare" convention (critStrike/
// doubleStrike/spellstrike are also legendary-only). The skill count scales
// with ilvl (1-100, i.e. chapter 1 through the end of chapter 10):
// 90/9/1% chance of 1/2/3 skills at ilvl 1, sliding to 50/30/20% at ilvl 100.
function minnieWeaponSkillCount(ilvl) {
  const t = Math.max(0, Math.min(1, (ilvl - 1) / 99));
  const p3 = 0.01 + (0.20 - 0.01) * t;
  const p2 = 0.09 + (0.30 - 0.09) * t;
  const r = Math.random();
  if (r < p3) return 3;
  if (r < p3 + p2) return 2;
  return 1;
}
function rollMinnieWeaponSkills(ilvl) {
  const n = minnieWeaponSkillCount(ilvl);
  const pool = Object.values(DATA.SKILLS.mage);
  const used = new Set();
  const out = [];
  let guard = 0;
  while (out.length < n && guard++ < 50) {
    const s = pick(pool);
    if (used.has(s.id)) continue;
    used.add(s.id);
    out.push({ id: 'skill', v: rint(1, 3), skillId: s.id, skillName: s.name });
  }
  return out;
}

function affixText(a) {
  const def = DATA.AFFIXES.find(x => x.id === a.id);
  return def ? def.fmt(a.v, a.skillName) : '';
}

function rollSockets() {
  const r = Math.random();
  if (r < 0.05) return 3;
  if (r < 0.15) return 2;
  if (r < 0.40) return 1;
  return 0;
}

// Shields (the defensive offhand bases — buckler/kiteshield/towershield,
// as opposed to the mage's weapon-like orb/tome offhands) get their own,
// much friendlier socket curve per direct request: an even 25% each for
// 0/1/2/3, instead of rollSockets()'s 60/25/10/5%.
const SHIELD_BASE_IDS = ['buckler', 'kiteshield', 'towershield'];
function isShieldItem(it) { return !!it && it.slot === 'offhand' && SHIELD_BASE_IDS.includes(it.base); }
function rollShieldSockets() {
  const r = Math.random();
  if (r < 0.25) return 0;
  if (r < 0.50) return 1;
  if (r < 0.75) return 2;
  return 3;
}

// Shield-only "protection" bonuses — flat immunities/half-damage effects,
// distinct from the normal DATA.AFFIXES pool (those are numeric rolls;
// these are binary flags). 50/25/15/10% for 0/1/2/3 of them, each drawn
// without replacement from DATA.SHIELD_PROTECTIONS, per direct request.
function shieldProtectionCount() {
  const r = Math.random();
  if (r < 0.50) return 0;
  if (r < 0.75) return 1;
  if (r < 0.90) return 2;
  return 3;
}
function rollShieldProtections() {
  const n = shieldProtectionCount();
  if (!n) return [];
  const pool = DATA.SHIELD_PROTECTIONS.map(p => p.id);
  const out = [];
  for (let i = 0; i < n && pool.length; i++) out.push(pool.splice(rint(0, pool.length - 1), 1)[0]);
  return out;
}
function shieldBlockChance(level) {
  const t = Math.max(0, Math.min(1, ((level || 1) - 1) / (MAX_LEVEL_AREA - 1)));
  return 0.20 + (0.40 - 0.20) * t;
}

// Potion capacity a belt grants (applies equally to HP and Mana slots),
// tiered by the belt's item level: low levels 1-3, mid 2-6, high 4-8.
function beltPotionCap(ilvl) {
  if (ilvl <= 33) return rint(1, 3);
  if (ilvl <= 66) return rint(2, 6);
  return rint(4, 8);
}

const ARMOR_SLOT_NAMES = ['helmet', 'armor', 'gloves', 'pants', 'boots'];
const JEWELRY_SLOT_NAMES = ['amulet', 'ring', 'cloak', 'belt'];

// forceSlot (optional 4th param) pins the generated item to a specific
// slot instead of letting `roll` pick a random category — used only by
// the cheat console's "fill every slot" command (see cheatFillLegendaryGear
// near the end of this file). Every normal call site omits it, so the
// original random roll< thresholds are untouched.
function makeItem(ilvl, rarity, clsHint, forceSlot) {
  const scale = itemScale(ilvl);
  const rar = DATA.RARITIES[rarity];
  const it = { uid: G ? G.itemSeq++ : rint(1, 1e9), ilvl, rarity, runes: [], sockets: 0, type: 'item' };
  const roll = Math.random();

  if (forceSlot === 'weapon' || (!forceSlot && roll < 0.30)) { // weapon — damage rides the steeper dmgScale curve
    let bases = DATA.WEAPON_BASES;
    if (forceSlot === 'weapon') {
      const clsBases = clsHint ? bases.filter(b => !b.classes || b.classes.includes(clsHint)) : bases;
      const oneHanded = clsBases.filter(b => b.hands === 1);
      bases = oneHanded.length ? oneHanded : (clsBases.length ? clsBases : bases);
    }
    const base = pick(bases);
    it.slot = 'weapon'; it.base = base.id; it.icon = base.icon;
    it.baseName = base.name; it.hands = base.hands; it.classes = base.classes; it.magic = !!base.magic;
    it.atkSpd = base.atkSpd || 1;
    it.dmgMin = Math.max(1, Math.round(base.dmg[0] * dmgScale(ilvl) * rar.mult));
    it.dmgMax = Math.max(2, Math.round(base.dmg[1] * dmgScale(ilvl) * rar.mult));
    it.sockets = rollSockets();
  } else if (forceSlot === 'offhand' || (!forceSlot && roll < 0.42)) { // offhand
    let bases = DATA.OFFHAND_BASES;
    if (forceSlot === 'offhand' && clsHint) {
      const clsBases = bases.filter(b => !b.classes || b.classes.includes(clsHint));
      bases = clsBases.length ? clsBases : bases;
    }
    const base = pick(bases);
    it.slot = 'offhand'; it.base = base.id; it.icon = base.icon;
    it.baseName = base.name; it.classes = base.classes; it.weight = base.weight || null; it.magic = !!base.magic;
    if (base.armor) it.armor = Math.max(1, Math.round(base.armor * scale * rar.mult));
    if (base.dmg) {
      it.dmgMin = Math.max(1, Math.round(base.dmg[0] * dmgScale(ilvl) * rar.mult));
      it.dmgMax = Math.max(1, Math.round(base.dmg[1] * dmgScale(ilvl) * rar.mult));
    }
    if (SHIELD_BASE_IDS.includes(base.id)) {
      it.sockets = rollShieldSockets();
      it.protections = rollShieldProtections();
    } else {
      it.sockets = rollSockets();
    }
  } else if (ARMOR_SLOT_NAMES.includes(forceSlot) || (!forceSlot && roll < 0.80)) { // armor piece
    const slot = ARMOR_SLOT_NAMES.includes(forceSlot) ? forceSlot : pick(ARMOR_SLOT_NAMES);
    const weight = (forceSlot && ({ warrior: 'heavy', rogue: 'medium', mage: 'light' })[clsHint]) || pick(['heavy', 'medium', 'light']);
    const base = DATA.ARMOR_BASES[slot][weight];
    it.slot = slot; it.base = `${slot}_${weight}`; it.icon = DATA.ARMOR_ICONS[slot];
    it.baseName = base.name; it.weight = weight;
    it.armor = Math.max(1, Math.round(base.armor * scale * rar.mult));
    if (slot === 'helmet' || slot === 'armor') it.sockets = rollSockets();
  } else { // jewelry: amulet / ring / cloak / belt
    const kind = JEWELRY_SLOT_NAMES.includes(forceSlot) ? forceSlot : pick(['amulet', 'ring', 'ring', 'cloak', 'belt']);
    const base = DATA.JEWELRY_BASES[kind];
    it.slot = kind; it.base = kind; it.icon = base.icon; it.baseName = base.name;
    if (base.armor) it.armor = Math.max(1, Math.round(base.armor * scale * rar.mult));
    if (kind === 'belt') {
      it.potionCap = beltPotionCap(ilvl);   // belts function at any rarity, not socketable
    } else if (rarity === 'normal') { // amulet/ring/cloak are pure affix carriers
      rarity = 'magical'; it.rarity = 'magical';
    }
  }

  const [aMin, aMax] = DATA.RARITIES[it.rarity].affixes;
  it.affixes = rollAffixes(rollItemStatCount(aMin, aMax, ilvl), ilvl, clsHint, it);
  if (it.rarity === 'legendary' && it.classes && it.classes.length === 1 && it.classes[0] === 'mage' && (it.slot === 'weapon' || it.slot === 'offhand')) {
    it.affixes = it.affixes.concat(rollMinnieWeaponSkills(ilvl));
  }
  it.name = buildItemName(it);
  // Value scales with rarity (as before) and now also with how many
  // stats actually rolled — a well-rolled Epic is worth noticeably more
  // than a bare-minimum one, not just more than a Rare.
  it.value = Math.max(1, Math.round((2 + ilvl * 1.5) * DATA.RARITIES[it.rarity].value * (1 + it.affixes.length * 0.12)));
  return it;
}

// Names are generated from the item's own affixes.
//   magical    — affix-driven prefix/suffix; a single-property item
//                gets only ONE of the two ("Mighty Ring" or "Ring of the Ox")
//   rare       — weapons get two-word unique names ("Vile Sting");
//                other rares keep prefix + base + suffix
//   epic       — ALL items: one-word forged name or two-word property name
//   legendary  — ALL items: heroic epithet + item noun ("Master's Walker")
//                or a one-word forged name
function nounFor(it) {
  if (it.slot === 'weapon') return pick(DATA.WEAPON_NOUNS[it.base] || ['Relic']);
  return pick(DATA.ITEM_NOUNS[it.base] || DATA.ITEM_NOUNS[it.slot] || ['Relic']);
}

function buildItemName(it) {
  if (it.rarity === 'normal') return it.baseName;
  const affs = it.affixes && it.affixes.length ? it.affixes : null;
  if (!affs) return `${pick(DATA.FALLBACK_PRE)} ${it.baseName}`;
  const adj = () => pick(DATA.AFFIX_ADJ[pick(affs).id] || DATA.FALLBACK_PRE);
  const heroic = () => pick(DATA.AFFIX_HEROIC[pick(affs).id] || DATA.FALLBACK_PRE);
  const forged = () => pick(DATA.NAME_SYL_A) + pick(DATA.NAME_SYL_B);
  if (it.rarity === 'epic') return chance(0.5) ? forged() : `${adj()} ${nounFor(it)}`;
  if (it.rarity === 'legendary') return chance(0.35) ? forged() : `${heroic()} ${nounFor(it)}`;
  if (it.rarity === 'rare' && it.slot === 'weapon') return `${adj()} ${nounFor(it)}`;
  const pre = pick(DATA.NAME_PARTS[pick(affs).id].pre);
  const suf = pick(DATA.NAME_PARTS[pick(affs).id].suf);
  if (it.rarity === 'magical' && affs.length === 1) {
    return chance(0.5) ? `${pre} ${it.baseName}` : `${it.baseName} ${suf}`;
  }
  return `${pre} ${it.baseName} ${suf}`;
}

// Rune tiers, by bonus count, ascending: Faded(1) < Rune(2) < Elder(3-5,
// still colored rare/epic/legendary by count). Mythic Rune is NOT part of
// this ascending count ladder — it's an independent, much-rarer roll
// (see MYTHIC_RUNE_CHANCE) that always carries exactly 4 bonuses and
// borrows Legendary's color rather than a distinct Mythic one.
// Bonus-count range (for the non-Mythic roll) depends on which creature
// tier dropped it.
const RUNE_BONUS_RANGE = { normal: [1, 1], rare: [1, 2], epic: [1, 3], miniboss: [2, 4], legendary: [3, 5] };
const RUNE_TIERS = {
  1: { baseName: 'Faded Rune', rarity: 'normal' },
  2: { baseName: 'Rune', rarity: 'magical' },
  3: { baseName: 'Elder Rune', rarity: 'rare' },
  4: { baseName: 'Elder Rune', rarity: 'epic' },
  5: { baseName: 'Elder Rune', rarity: 'legendary' },
};
// Much rarer than the old 8% legendary-source bump it replaces — this
// now rolls independently of source tier.
const MYTHIC_RUNE_CHANCE = 0.015;
const MYTHIC_RUNE_BONUSES = 4;
// Prefix/suffix are generated from randomly chosen bonus stats.
// Shared by makeRune (random source-tier roll) and the Rune Carver (which
// forces a specific bonus count instead of rolling one from a source tier).
function buildRune(n, ilvl, tierOverride) {
  const tier = tierOverride || RUNE_TIERS[n];
  const bonuses = rollAffixes(n, ilvl, null, null, tier.rarity);
  // A single-bonus rune (e.g. a Faded Rune) must only get ONE of
  // prefix/suffix — giving both from the same lone bonus reads as two
  // stats when the rune only actually carries one.
  let runeName;
  if (bonuses.length === 1) {
    const parts = DATA.NAME_PARTS[bonuses[0].id];
    runeName = chance(0.5) ? `${pick(parts.pre)} ${tier.baseName}` : `${tier.baseName} ${pick(parts.suf)}`;
  } else {
    const pre = pick(DATA.NAME_PARTS[pick(bonuses).id].pre);
    const suf = pick(DATA.NAME_PARTS[pick(bonuses).id].suf);
    runeName = `${pre} ${tier.baseName} ${suf}`;
  }
  return {
    uid: G ? G.itemSeq++ : rint(1, 1e9), type: 'rune', rarity: tier.rarity, ilvl,
    icon: '🪨', name: runeName, baseName: tier.baseName,
    bonuses,
    value: 15 + ilvl * 2 + n * 10,
  };
}
function makeRune(ilvl, source) {
  if (chance(MYTHIC_RUNE_CHANCE)) return buildRune(MYTHIC_RUNE_BONUSES, ilvl, { baseName: 'Mythic Rune', rarity: 'legendary' });
  const range = RUNE_BONUS_RANGE[source] || RUNE_BONUS_RANGE.normal;
  return buildRune(rint(...range), ilvl);
}
// A rune's forge/enchant "tier" (1-5, matching RUNE_TIERS) is just its
// bonus count — except Mythic Runes, which always carry exactly 4 bonuses
// (MYTHIC_RUNE_BONUSES) but are the rarest rune in the game, so they're
// treated as tier 5 (top tier) for matching purposes rather than tier 4.
function runeTier(rune) {
  if (rune.baseName === 'Mythic Rune') return 5;
  return rune.bonuses.length;
}

// ------------------------------------------------------------
// The Enchanter (city shop): Enchantment Table + Rune Carver (see also the
// Rune Forge, further down this file, right after carveRunes)
// ------------------------------------------------------------

// Which rune tier an item's rarity requires to be re-enchanted — the rune
// must match, not just meet a floor: magical->Faded Rune(1), rare->Rune(2),
// epic->second-best Elder Rune(4), legendary->best Elder Rune(5). Normal
// items have no affixes to speak of and aren't enchantable.
const ENCHANT_RUNE_TIER = { magical: 1, rare: 2, epic: 4, legendary: 5 };

function baseStatsFor(it) {
  if (it.slot === 'weapon') return DATA.WEAPON_BASES.find(b => b.id === it.base);
  if (it.slot === 'offhand') return DATA.OFFHAND_BASES.find(b => b.id === it.base);
  if (DATA.ARMOR_BASES[it.slot]) return DATA.ARMOR_BASES[it.slot][it.weight];
  return DATA.JEWELRY_BASES[it.slot];
}

// Re-rolls each existing affix's VALUE at a new ilvl while keeping the same
// affix ids (and the same granted skill, for the 'skill' affix) — an
// "enchant" powers an item up to the current level without gambling away
// the stats the player already built around.
function rerollAffixValues(affixes, ilvl) {
  return (affixes || []).map(a => {
    const def = DATA.AFFIXES.find(x => x.id === a.id);
    if (!def) return a;
    const entry = { id: a.id, v: rollAffixValue(def, ilvl) };
    if (a.id === 'skill') { entry.skillId = a.skillId; entry.skillName = a.skillName; }
    return entry;
  });
}

function reenchantItem(itemUid, runeUid) {
  let item = G.inventory.find(i => i.uid === itemUid && i.type === 'item');
  if (!item) item = equippedItems().find(i => i.uid === itemUid);
  if (!item) return { ok: false, why: 'Item not found' };
  const need = ENCHANT_RUNE_TIER[item.rarity];
  if (!need) return { ok: false, why: `${DATA.RARITIES[item.rarity].name} items can't be enchanted` };
  const rune = G.inventory.find(i => i.uid === runeUid && i.type === 'rune');
  if (!rune) return { ok: false, why: 'Rune not found' };
  if (runeTier(rune) !== need) return { ok: false, why: `A ${DATA.RARITIES[item.rarity].name} item needs a matching-tier rune` };

  G.inventory = G.inventory.filter(i => i.uid !== rune.uid);
  const newIlvl = Math.max(1, G.area);
  const base = baseStatsFor(item);
  const rar = DATA.RARITIES[item.rarity];
  item.ilvl = newIlvl;
  if (item.slot === 'weapon' || (item.slot === 'offhand' && base && base.dmg)) {
    item.dmgMin = Math.max(1, Math.round(base.dmg[0] * dmgScale(newIlvl) * rar.mult));
    item.dmgMax = Math.max(item.slot === 'weapon' ? 2 : 1, Math.round(base.dmg[1] * dmgScale(newIlvl) * rar.mult));
  }
  if (item.armor !== undefined && base && base.armor) {
    item.armor = Math.max(1, Math.round(base.armor * itemScale(newIlvl) * rar.mult));
  }
  if (item.slot === 'belt') item.potionCap = beltPotionCap(newIlvl);
  item.affixes = rerollAffixValues(item.affixes, newIlvl);
  item.value = Math.max(1, Math.round((2 + newIlvl * 1.5) * rar.value * (1 + item.affixes.length * 0.12)));
  questEvent('enchant_item');
  saveGame(); UI.refresh();
  return { ok: true, item };
}

// Merge 3 same-tier runes into 1 rune one tier higher, at the current
// ilvl. Tiers 1-4 have a 50% chance the merge fails and destroys all 3;
// legendary-tier (5, including Mythic) merges never fail and reforge into
// a fresh (non-Mythic) legendary-tier rune. The 3 input runes are always
// consumed, win or lose.
// Named "carveRunes"/the Rune Carver in the UI (renamed from "Rune Forge"
// so that name could be reused for the socket-manipulation feature below)
// — the questEvent id stays 'forge_rune' so existing/in-progress "Rune
// Smith" Tavern quests (which store that type string in save data) keep
// tracking correctly.
function carveRunes(uids) {
  if (!uids || uids.length !== 3) return { ok: false, why: 'Select exactly 3 runes' };
  const runes = uids.map(id => G.inventory.find(i => i.uid === id && i.type === 'rune')).filter(Boolean);
  if (runes.length !== 3) return { ok: false, why: 'Select exactly 3 runes' };
  const tier = runeTier(runes[0]);
  if (runes.some(r => runeTier(r) !== tier)) return { ok: false, why: 'Runes must all be the same tier' };
  const uidSet = new Set(uids);
  G.inventory = G.inventory.filter(i => !uidSet.has(i.uid));
  const success = tier >= 5 || chance(0.5);
  let newRune = null;
  if (success) {
    newRune = buildRune(Math.min(5, tier + 1), Math.max(1, G.area));
    G.inventory.push(newRune);
    questEvent('forge_rune');
  }
  saveGame(); UI.refresh();
  return { ok: true, success, rune: newRune };
}

// Bulk version of the Rune Carver: repeatedly carves every group of 3
// same-tier runes it can, tier by tier ascending (1→2→3→4). Processing a
// tier to exhaustion before moving to the next means any new rune a
// successful carve creates cascades naturally into the next tier's pass —
// no separate re-pass needed. Stops at tier 4->5: legendary-tier runes are
// left untouched even if 3+ are available, since merging 3 legendaries only
// re-rolls a 4th (no tier to climb to) and "merge runes up to legendary"
// reads as a ceiling, not something to keep spending them into.
function mergeAllRunes() {
  let merged = 0, destroyed = 0;
  for (let tier = 1; tier <= 4; tier++) {
    let pool = G.inventory.filter(i => i.type === 'rune' && runeTier(i) === tier);
    while (pool.length >= 3) {
      const r = carveRunes(pool.slice(0, 3).map(x => x.uid));
      if (r.success) merged++; else destroyed++;
      pool = G.inventory.filter(i => i.type === 'rune' && runeTier(i) === tier);
    }
  }
  return { merged, destroyed };
}

// ------------------------------------------------------------
// The Rune Forge (distinct from the Rune Carver above): spend 5 Elder Rune
// (legendary-tier, Mythic included since runeTier() already treats it as
// tier 5) runes to either roll fresh sockets onto an item that has none,
// or wipe out whatever's currently plugged into an item's sockets so they
// can be resocketed differently. The sockets themselves are never removed
// by the latter — only what's inside them.
// ------------------------------------------------------------
const RUNE_FORGE_COST = 5;
// Mirrors makeItem's own rollSockets() call sites — only these slot types
// ever roll sockets at all (gloves/pants/boots/jewelry never do).
const SOCKETABLE_SLOTS = ['weapon', 'offhand', 'helmet', 'armor'];

function forgeableItems() {
  return [...equippedItems(), ...G.inventory.filter(i => i.type === 'item')];
}
function unsocketedForgeItems() {
  return forgeableItems().filter(i => SOCKETABLE_SLOTS.includes(i.slot) && i.sockets === 0);
}
function socketedForgeItems() {
  return forgeableItems().filter(i => i.sockets > 0 && i.runes.length > 0);
}
// Validates the payment is exactly RUNE_FORGE_COST distinct legendary-tier
// runes actually in inventory; returns the matched rune objects or null.
function takeLegendaryRunePayment(uids) {
  if (!uids || uids.length !== RUNE_FORGE_COST) return null;
  const runes = uids.map(id => G.inventory.find(i => i.uid === id && i.type === 'rune')).filter(Boolean);
  if (runes.length !== RUNE_FORGE_COST || runes.some(r => runeTier(r) !== 5)) return null;
  return runes;
}

// Odds mirror rollSockets()'s own 0/1/2/3 curve (60/25/10/5%) renormalized
// to exclude the 0-socket outcome, since paying 5 legendary runes always
// yields at least one socket.
function rollForgedSocketCount() {
  const r = Math.random();
  if (r < 0.625) return 1;
  if (r < 0.875) return 2;
  return 3;
}

function forgeAddSockets(itemUid, runeUids) {
  const item = forgeableItems().find(i => i.uid === itemUid);
  if (!item) return { ok: false, why: 'Item not found' };
  if (!SOCKETABLE_SLOTS.includes(item.slot) || item.sockets !== 0) return { ok: false, why: 'That item already has sockets, or can never roll any' };
  const runes = takeLegendaryRunePayment(runeUids);
  if (!runes) return { ok: false, why: `Needs exactly ${RUNE_FORGE_COST} Elder Rune (legendary) runes` };
  const uidSet = new Set(runes.map(r => r.uid));
  G.inventory = G.inventory.filter(i => !uidSet.has(i.uid));
  item.sockets = rollForgedSocketCount();
  saveGame(); UI.refresh();
  return { ok: true, item };
}

function forgeDestroySockets(itemUid, runeUids) {
  const item = forgeableItems().find(i => i.uid === itemUid);
  if (!item) return { ok: false, why: 'Item not found' };
  if (!item.sockets || !item.runes.length) return { ok: false, why: 'That item has no socketed runes to remove' };
  const runes = takeLegendaryRunePayment(runeUids);
  if (!runes) return { ok: false, why: `Needs exactly ${RUNE_FORGE_COST} Elder Rune (legendary) runes` };
  const uidSet = new Set(runes.map(r => r.uid));
  G.inventory = G.inventory.filter(i => !uidSet.has(i.uid));
  item.runes = [];
  saveGame(); UI.refresh();
  return { ok: true, item };
}

// --- equip rules ---
function canUseItem(it) {
  const cls = DATA.CLASSES[G.char.cls];
  if (it.type === 'rune') return { ok: false, why: 'Socket into an item' };
  if (it.classes && !it.classes.includes(G.char.cls)) {
    return { ok: false, why: `${it.classes.map(c => DATA.CLASSES[c].name).join('/')} only` };
  }
  if (it.weight && !cls.armorWeights.includes(it.weight)) {
    return { ok: false, why: `${cap(it.weight)} armor — too heavy for a ${cls.name}` };
  }
  return { ok: true };
}

function equipItem(uid, targetSlot) {
  const idx = G.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const it = G.inventory[idx];
  if (!canUseItem(it).ok) return;
  const eq = G.char.equip;

  let slot = targetSlot || it.slot;
  if (it.slot === 'ring') slot = targetSlot || (!eq.ring1 ? 'ring1' : (!eq.ring2 ? 'ring2' : 'ring1'));
  if (it.slot === 'weapon' && targetSlot === 'offhand' && it.hands === 2) return;
  // Minnie (mage) can't wield two weapons — her offhand has to be an
  // Arcane Orb/Spell Tome/shield, never a second wand or scepter, per
  // direct request. Other classes are unaffected.
  if (it.slot === 'weapon' && targetSlot === 'offhand' && G.char.cls === 'mage') return;

  const unequipped = [];
  if (it.slot === 'weapon' && it.hands === 2) {
    if (eq.weapon) unequipped.push(eq.weapon);
    if (eq.offhand) unequipped.push(eq.offhand);
    delete eq.weapon; delete eq.offhand;
    slot = 'weapon';
  } else if (slot === 'offhand' && eq.weapon && eq.weapon.hands === 2) {
    unequipped.push(eq.weapon); delete eq.weapon;
  }
  if (eq[slot]) unequipped.push(eq[slot]);

  G.inventory.splice(idx, 1);
  eq[slot] = it;
  G.inventory.push(...unequipped);
  clampVitals(); saveGame(); UI.refresh();
}

function unequipItem(slot) {
  const it = G.char.equip[slot];
  if (!it) return;
  delete G.char.equip[slot];
  G.inventory.push(it);
  clampVitals(); saveGame(); UI.refresh();
}

function sellItem(uid) {
  const idx = G.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const value = G.inventory[idx].value;
  G.gold += value;
  G.totals.itemsSold++; G.totals.goldFromSales += value;
  G.inventory.splice(idx, 1);
  questEvent('item_sold');
  questEvent('sell_value', value);
  saveGame(); UI.refresh();
}

// Bulk selling. kind: 'all' (every unequipped item) | 'junk' (normal+magical)
// | 'unusable' | 'rare' | 'epic' | 'legendary' | 'runes' (every loose rune —
// runes can never be equipped, so there's no "unequipped" distinction for
// them; a rune socketed into an item isn't in G.inventory as its own entry
// and so isn't touched by this)
function sellMatches(kind) {
  if (kind === 'runes') return G.inventory.filter(i => i.type === 'rune');
  return G.inventory.filter(i => {
    if (i.type !== 'item') return false;   // runes are only bulk-sold via kind: 'runes'
    if (kind === 'all') return true;
    if (kind === 'junk') return i.rarity === 'normal' || i.rarity === 'magical';
    if (kind === 'unusable') return !canUseItem(i).ok;
    return i.rarity === kind;
  });
}

function sellAllOf(kind) {
  const sel = sellMatches(kind);
  let gold = 0;
  for (const s of sel) gold += s.value;
  const uids = new Set(sel.map(s => s.uid));
  G.inventory = G.inventory.filter(i => !uids.has(i.uid));
  G.gold += gold;
  G.totals.itemsSold += sel.length; G.totals.goldFromSales += gold;
  if (sel.length) { questEvent('item_sold', sel.length); questEvent('sell_value', gold); }
  saveGame(); UI.refresh();
  return { count: sel.length, gold };
}

function socketRune(runeUid, itemUid) {
  const rIdx = G.inventory.findIndex(i => i.uid === runeUid && i.type === 'rune');
  if (rIdx < 0) return;
  let target = G.inventory.find(i => i.uid === itemUid);
  if (!target) target = equippedItems().find(i => i.uid === itemUid);
  if (!target || !target.sockets || target.runes.length >= target.sockets) return;
  target.runes.push(G.inventory[rIdx]);
  G.inventory.splice(rIdx, 1);
  G.totals.runesSocketed++;
  questEvent('socket_rune');
  clampVitals(); saveGame(); UI.refresh();
}

function socketableItems() {
  return [...equippedItems(), ...G.inventory.filter(i => i.type === 'item')]
    .filter(i => i.sockets > 0 && i.runes.length < i.sockets);
}

// ------------------------------------------------------------
// Shop — randomly generated stock, priced at 3× sell value.
// Restocks for free every time the hero returns from an adventure.
// ------------------------------------------------------------
function shopIlvl() { return Math.max(1, G.unlocked); }

// Base curve (at area 1): 2% legendary, 13% epic, 20% rare, 30% magical,
// 35% normal. Legendary chance climbs to 30% by area 100 (linear, matching
// the same t-ramp used elsewhere for level-scaled odds); the other 4
// buckets shrink to make room for it, keeping their relative proportions
// to each other unchanged (13:20:30:35) rather than cutting one arbitrarily.
function shopRollRarity() {
  const t = Math.max(0, Math.min(1, (shopIlvl() - 1) / (MAX_LEVEL_AREA - 1)));
  const legendaryPct = 2 + (30 - 2) * t;
  const restScale = (100 - legendaryPct) / 98;
  const epicPct = 13 * restScale, rarePct = 20 * restScale, magicalPct = 30 * restScale;
  const r = Math.random() * 100;
  let acc = legendaryPct;
  if (r < acc) return 'legendary';
  if (r < (acc += epicPct)) return 'epic';
  if (r < (acc += rarePct)) return 'rare';
  if (r < (acc += magicalPct)) return 'magical';
  return 'normal';
}

// Every equip-slot "kind" makeItem can roll (see forceSlot) — used to
// sample the shop's stock uniformly across all of them. Without this, the
// merchant used makeItem's own unforced roll thresholds (30% weapon / 12%
// offhand / 38% armor split across 5 slots / 20% jewelry split across 4),
// which makes a weapon show up far more often than any single armor piece
// or jewelry type — the "weapons appear more" the Blacksmith was showing.
const SHOP_SLOT_KINDS = ['weapon', 'offhand', 'helmet', 'armor', 'gloves', 'pants', 'boots', 'amulet', 'ring', 'cloak', 'belt'];

function genShopStock() {
  const stock = [];
  for (let i = 0; i < 20; i++) {
    let it = null;
    // bias the merchant toward things this hero can actually wear
    for (let t = 0; t < 5; t++) {
      it = makeItem(shopIlvl(), shopRollRarity(), G.char.cls, pick(SHOP_SLOT_KINDS));
      if (canUseItem(it).ok) break;
    }
    it.price = it.value * 6;
    stock.push(it);
  }
  if (chance(0.3)) {
    const rune = makeRune(shopIlvl(), pick(['rare', 'rare', 'epic']));
    rune.price = rune.value * 6;
    stock.push(rune);
  }
  G.shop = { stock };
}

function buyShopItem(uid) {
  if (!G.shop) return;
  const idx = G.shop.stock.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const it = G.shop.stock[idx];
  if (G.gold < it.price) { UI.toast('Not enough gold!'); return; }
  G.gold -= it.price;
  G.totals.goldSpent += it.price;
  G.shop.stock.splice(idx, 1);
  G.inventory.push(it);
  saveGame(); UI.refresh();
  UI.toast(`Bought ${it.name}`);
}

// Buy then immediately equip, as one action. `slot` is only meaningful for
// rings ('ring1'/'ring2') and 1H weapons ('weapon'/'offhand') — equipItem
// falls back to the item's own slot otherwise. If the purchase fails (not
// enough gold), the uid never lands in G.inventory, so the equip is skipped.
function buyAndEquip(uid, slot) {
  buyShopItem(uid);
  if (G.inventory.some(i => i.uid === uid)) equipItem(uid, slot);
}

function restockCost() { return 200 + G.unlocked * 100; }

// ------------------------------------------------------------
// Tavern — 8 random quests on the board, up to 2 active at once.
// The board refreshes with new rumors every time you return home.
// ------------------------------------------------------------
// Reward gold/xp scale off the CURRENT chapter & part (area level) —
// computed fresh whenever a quest becomes ready to claim, not baked in
// at the moment it was picked up off the board. "mult" is per-quest
// flavor (how generous that quest type is relative to the others). Base
// coefficients doubled again (13->26, 15->30, 11->22, 8->16) on top of
// the earlier ~30% bump — a direct "make quest rewards much better"
// request, applied once here so it scales every quest type uniformly
// instead of hand-tuning each one's mult.
function questRewardAmounts(goldMult, xpMult) {
  const u = Math.max(1, G.area);
  return {
    gold: goldMult ? Math.round(goldMult * (26 + u * 30) * (0.8 + Math.random() * 0.4)) : 0,
    xp: xpMult ? Math.round(xpMult * (22 + u * 16) * (0.85 + Math.random() * 0.3)) : 0,
  };
}
// Same formula with the random jitter fixed at its midpoint — a stable
// "roughly this much" preview for quests not yet ready to claim, so
// the board doesn't visibly flicker on every re-render.
function questRewardPreview(goldMult, xpMult) {
  const u = Math.max(1, G.area);
  return {
    gold: goldMult ? Math.round(goldMult * (26 + u * 30)) : 0,
    xp: xpMult ? Math.round(xpMult * (22 + u * 16)) : 0,
  };
}
// Tavern item rewards never roll below Rare, and get a chance to climb
// further up toward Legendary the deeper into the game you are (area
// 1-100) — a flat floor plus a late-game escalation, per an explicit
// "item rewards should be at least rare, better legendaries as you go
// higher" request. minRarity is the quest type's own baseline (some
// quests are already pitched at 'epic' and should never roll below
// that either).
const QUEST_ITEM_RARITY_ORDER = ['rare', 'epic', 'legendary'];
function questItemRarity(minRarity, area) {
  let idx = Math.max(0, QUEST_ITEM_RARITY_ORDER.indexOf(minRarity));
  const u = Math.max(1, Math.min(100, area));
  const upChance = 0.1 + (u / 100) * 0.6; // 10% at area 1 -> 70% at area 100
  while (idx < QUEST_ITEM_RARITY_ORDER.length - 1 && chance(upChance)) idx++;
  return QUEST_ITEM_RARITY_ORDER[idx];
}

function genQuest() {
  const u = Math.max(1, G.area);
  const goldR = n => Math.round(n * (13 + u * 15) * (0.8 + Math.random() * 0.4));
  const makers = [
    () => { const n = rint(30, 60); return { type: 'kill_normal', icon: '🗡️', name: 'The Culling', desc: `The village elder begs for relief: slay ${n} common creatures.`, target: n, rewardSpec: { goldMult: 3, xpMult: 3 } }; },
    () => { const n = rint(4, 8); return { type: 'kill_rare', icon: '📜', name: 'Bounty Board', desc: `Wanted posters flutter in the wind: bring down ${n} RARE creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(1, 2); return { type: 'kill_epic', icon: '🏆', name: 'Trophy Hunter', desc: `A wealthy collector pays handsomely for proof of ${n} EPIC kill${n > 1 ? 's' : ''}.`, target: n, rewardSpec: { goldMult: 5, xpMult: 5, item: 'rare' } }; },
    () => { const n = rint(5, 9); return { type: 'item_magic', icon: '💎', name: 'The Collector', desc: `A shady dealer in the corner wants ${n} magical-or-better items found on adventure.`, target: n, rewardSpec: { goldMult: 6, xpMult: 6 } }; },
    () => { const n = rint(3, 6); return { type: 'potion', icon: '🧪', name: 'Potion Tester', desc: `The alchemist needs field data: drink ${n} potions while adventuring.`, target: n, rewardSpec: { goldMult: 3, xpMult: 3, item: 'rare' } }; },
    () => { const n = goldR(8); return { type: 'gold', icon: '🪙', name: 'Debt of Honor', desc: `The barkeep owes dangerous people. Earn ${formatK(n)} gold on adventures to bail him out.`, target: n, rewardSpec: { goldMult: 0, xpMult: 7, item: 'epic' } }; },
    () => { return { type: 'kill_legendary', icon: '🔶', name: 'Head of the Beast', desc: 'A hooded stranger slides a map across the table: slay a LEGENDARY level boss. Any will do.', target: 1, rewardSpec: { goldMult: 10, xpMult: 10, rune: 'legendary' } }; },
    () => { return { type: 'kill_miniboss', icon: '👑', name: 'Crownsnatcher', desc: 'Rumors tell of crowned beasts prowling the back half of a chapter (levels 5+). Slay a MINI BOSS.', target: 1, rewardSpec: { goldMult: 6, xpMult: 6, rune: 'miniboss' } }; },
    () => { const n = rint(40, 80); return { type: 'kill_any', icon: '🛡️', name: 'Clear the Roads', desc: `A caravan master needs the roads swept clear: fell ${n} creatures of any kind blocking the way.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4 } }; },
    () => { const n = rint(10, 18); return { type: 'item_any', icon: '🎒', name: 'Pack Rat', desc: `A quartermaster is buying anything shiny: bring back ${n} items of any kind found on adventure.`, target: n, rewardSpec: { goldMult: 3, xpMult: 3, item: 'rare' } }; },
    () => { const n = rint(2, 4); return { type: 'level_clear', icon: '🗺️', name: 'Trailblazer', desc: `A cartographer wants fresh ground broken: clear ${n} Quests to help fill in the map.`, target: n, rewardSpec: { goldMult: 7, xpMult: 8, item: 'epic' } }; },
    () => { const n = rint(3, 6); return { type: 'socket_rune', icon: '🪨', name: 'Rune Hunter', desc: `A rune-smith mutters about wasted potential: socket ${n} runes into your gear.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(8, 15); return { type: 'item_sold', icon: '🧺', name: "Fence's Errand", desc: `A fence at the market wants inventory moving: sell ${n} items.`, target: n, rewardSpec: { goldMult: 6, xpMult: 3 } }; },
    () => { const n = rint(1, 2); return { type: 'chapter_boss', icon: '💀', name: 'Boss Breaker', desc: `Veteran adventurers dare you to prove yourself: fell ${n} chapter boss${n > 1 ? 'es' : ''}.`, target: n, rewardSpec: { goldMult: 9, xpMult: 9, rune: 'legendary' } }; },
    () => { const n = rint(2, 4); return { type: 'item_epic', icon: '🗝️', name: 'Treasure Vault', desc: `A vault-keeper is cataloguing wonders: bring back ${n} EPIC-or-better item${n > 1 ? 's' : ''}.`, target: n, rewardSpec: { goldMult: 6, xpMult: 6, item: 'epic' } }; },
    () => { const n = goldR(5); return { type: 'sell_value', icon: '🏷️', name: "Merchant's Favor", desc: `The merchant's guild wants coin flowing: earn ${formatK(n)} gold selling your finds.`, target: n, rewardSpec: { goldMult: 0, xpMult: 6, item: 'rare' } }; },
    () => { const n = rint(4, 9); return { type: 'kill_poisonous', icon: '☠️', name: 'Poison Purge', desc: `A healer begs for relief from the venom: cull ${n} Poisonous creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(4, 9); return { type: 'kill_frozen', icon: '❄️', name: 'Frost Warden', desc: `The frost is creeping into the village: destroy ${n} Frozen creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(4, 9); return { type: 'kill_burning', icon: '🔥', name: 'Cinder Watch', desc: `Fires keep starting in the wilds: put down ${n} Burning creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(4, 9); return { type: 'kill_vampiric', icon: '🩸', name: 'Bloodhound', desc: `A grieving hunter wants the bleeders dead: slay ${n} Vampiric creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(4, 9); return { type: 'kill_healing', icon: '💚', name: "Mender's End", desc: `The healers in the wilds keep patching each other up: stop ${n} Healing creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(8, 15); return { type: 'kill_abnormal', icon: '🌀', name: 'Ward Breaker', desc: `Something abnormal is spreading: end ${n} creatures bearing a specialty ward.`, target: n, rewardSpec: { goldMult: 5, xpMult: 5, item: 'rare' } }; },
    () => { const n = rint(4, 9); return { type: 'kill_golem', icon: '🗿', name: 'Golem Crusher', desc: `The old quarry is haunted by living stone: smash ${n} Golem creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(4, 9); return { type: 'kill_charm', icon: '💘', name: 'Charmbreaker', desc: `A jilted apprentice wants payback: destroy ${n} Charming creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(4, 9); return { type: 'kill_regen', icon: '🌿', name: 'Regen Ender', desc: `A frustrated duelist swears these things never stay dead: finish ${n} Regenerating creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(1, 3); return { type: 'enchant_item', icon: '✨', name: "Enchanter's Apprentice", desc: `The enchanter needs a demonstration: re-enchant ${n} item${n > 1 ? 's' : ''} at the Enchantment Table.`, target: n, rewardSpec: { goldMult: 5, xpMult: 5, item: 'epic' } }; },
    () => { const n = rint(1, 3); return { type: 'forge_rune', icon: '🔨', name: 'Rune Smith', desc: `The Rune Carver is hungry for work: carve ${n} new rune${n > 1 ? 's' : ''}.`, target: n, rewardSpec: { goldMult: 5, xpMult: 5, rune: 'miniboss' } }; },
    () => { const n = rint(15, 30); return { type: 'skill_cast', icon: '🌟', name: 'Skillful Caster', desc: `A traveling instructor wants proof of technique: cast ${n} skills in combat.`, target: n, rewardSpec: { goldMult: 3, xpMult: 4 } }; },
    () => { const n = rint(2, 4); return { type: 'elf_encounter', icon: '🧝', name: 'Elf Chaser', desc: `A fed-up quartermaster wants those thieving elves dealt with: resolve ${n} Sneaky Elf encounter${n > 1 ? 's' : ''}.`, target: n, rewardSpec: { goldMult: 5, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(4, 9); return { type: 'kill_berserk', icon: '🪓', name: "Berserker's Bane", desc: `A battle-scarred veteran wants the maddened put down: slay ${n} Berserk creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(4, 9); return { type: 'kill_spectral', icon: '👻', name: 'Spectral Hunt', desc: `A priest needs the restless put to rest: banish ${n} Spectral creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
  ];
  return Object.assign(pick(makers)(), { progress: 0, ready: false });
}

function genTavernBoard() {
  const board = [];
  const seen = new Set();
  let guard = 0;
  while (board.length < 8 && guard++ < 80) {
    const q = genQuest();
    if (seen.has(q.type)) continue;
    seen.add(q.type);
    board.push(q);
  }
  if (!G.tavern) G.tavern = { board, active: [] };
  else G.tavern.board = board;
}

function acceptQuest(idx) {
  if (!G.tavern) return;
  if (!G.tavern.active) G.tavern.active = [];
  if (G.tavern.active.length >= 2) return;
  const q = G.tavern.board[idx];
  if (!q) return;
  G.tavern.active.push(q);
  G.tavern.board.splice(idx, 1);
  // The board stays at a full 8 offers regardless of how many you've
  // accepted — backfill the freed slot immediately with a fresh,
  // non-duplicate-type quest instead of leaving a gap until the next town
  // return (retreat()) regenerates the whole board from scratch.
  const seen = new Set(G.tavern.board.map(b => b.type));
  let guard = 0;
  while (guard++ < 40) {
    const nq = genQuest();
    if (seen.has(nq.type)) continue;
    G.tavern.board.push(nq);
    break;
  }
  saveGame(); UI.refresh();
  UI.toast(`Quest accepted: ${q.name}`);
}

function abandonQuest(idx) {
  if (!G.tavern || !G.tavern.active || !G.tavern.active[idx]) return;
  G.tavern.active.splice(idx, 1);
  genTavernBoard();
  saveGame(); UI.refresh();
}

function questEvent(kind, amt) {
  if (!G.tavern || !G.tavern.active) return;
  for (const q of G.tavern.active) {
    if (q.type !== kind || q.ready) continue;
    q.progress = (q.progress || 0) + (amt || 1);
    if (q.progress >= q.target) markQuestReady(q);
  }
}

// The task is done, but the reward isn't granted automatically anymore —
// lock in gold/XP against the CURRENT chapter & part (area level) right
// now, and let the player claim it manually from the tavern.
function markQuestReady(q) {
  q.ready = true;
  q.finalReward = questRewardAmounts(q.rewardSpec.goldMult, q.rewardSpec.xpMult);
  q.finalReward.item = q.rewardSpec.item || null;
  q.finalReward.rune = q.rewardSpec.rune || null;
  q.finalArea = G.area;
  saveGame();
  UI.toast(`🍺 Quest ready: "${q.name}" — claim your reward at the tavern!`);
}

function claimQuestReward(idx) {
  if (!G.tavern || !G.tavern.active || !G.tavern.active[idx] || !G.tavern.active[idx].ready) return;
  const q = G.tavern.active[idx];
  const r = q.finalReward;
  const parts = [];
  if (r.gold) { G.gold += r.gold; G.totals.goldFound += r.gold; parts.push(`🪙 ${formatK(r.gold)}`); }
  if (r.xp) {
    gainXp(r.xp);
    parts.push(`✨ ${formatK(r.xp)} XP`);
  }
  if (r.item) {
    const rarity = questItemRarity(r.item, q.finalArea || G.area);
    const it = makeItem(Math.max(1, q.finalArea || G.area), rarity, G.char.cls);
    G.totals.itemsFound++;
    G.totals.itemsByRarity[rarity] = (G.totals.itemsByRarity[rarity] || 0) + 1;
    if (shouldAutoSell(it)) {
      G.gold += it.value;
      G.totals.itemsSold++; G.totals.goldFromSales += it.value;
      parts.push(`🪙 ${formatK(it.value)} (auto-sold ${it.icon} ${it.name})`);
    } else {
      G.inventory.push(it);
      parts.push(`${it.icon} ${it.name} (${rarity})`);
    }
  }
  if (r.rune) {
    const rn = makeRune(Math.max(1, q.finalArea || G.area), r.rune);
    G.inventory.push(rn);
    G.totals.itemsFound++;
    G.totals.itemsByRarity[rn.rarity] = (G.totals.itemsByRarity[rn.rarity] || 0) + 1;
    parts.push(`${rn.icon} ${rn.name}`);
  }
  G.totals.questsCompleted++;
  log('sys', `🍺 QUEST COMPLETE: "${q.name}"! Reward: ${parts.join(' + ')}`);
  G.tavern.active.splice(idx, 1);
  genTavernBoard();
  saveGame();
  UI.refresh();
  UI.toast(`🍺 Quest complete: ${q.name}!`);
}

// ------------------------------------------------------------
// Tavern gambling — Dice: bet gold on a 2d6-sum roll-off against the
// house (you roll two dice, house rolls two dice, higher total wins).
// True 50/50 odds (no house edge): a win doubles the stake (net +bet),
// a loss forfeits it (net -bet), a tie is a no-op push. Fixed stake
// tiers rather than free-form input, so a misclick can't wipe out the
// player's gold in one go.
//
// resolveDice is pure outcome resolution (RNG + gold mutation) with no
// UI side effects — UI.playDice (ui.js) owns the roll animation and
// calls this only once the dice have visually finished spinning, so the
// gold change and the revealed faces land at the same moment instead of
// the topbar updating before the dice stop.
// ------------------------------------------------------------
const DICE_BET_TIERS = [10, 50, 200, 1000];
function resolveDice(bet) {
  const you = [rint(1, 6), rint(1, 6)];
  const house = [rint(1, 6), rint(1, 6)];
  const youSum = you[0] + you[1];
  const houseSum = house[0] + house[1];
  let result;
  if (youSum > houseSum) { result = 'win'; G.gold += bet; G.totals.goldFound += bet; }
  else if (youSum < houseSum) { result = 'lose'; G.gold -= bet; }
  else { result = 'tie'; }
  saveGame();
  return { you, house, youSum, houseSum, result, bet };
}

function restockShop() {
  const cost = restockCost();
  if (G.gold < cost) { UI.toast('Not enough gold!'); return; }
  G.gold -= cost;
  G.totals.goldSpent += cost;
  genShopStock();
  saveGame(); UI.refresh();
}

// ------------------------------------------------------------
// Chapters / quests / creatures
// ------------------------------------------------------------
// A level IS a quest: levels 1-10 = Chapter 1 Quests 1-10, level 100 =
// Chapter 10 Quest 10. Every quest is tied 1:1 to a Location and ends
// with a Legendary boss named after the story's creature for that quest.
function chapterNumOf(level) { return Math.floor((level - 1) / 10) + 1; }
function questNumOf(level) { return ((level - 1) % 10) + 1; }
function chapterOf(level) { return DATA.CHAPTERS[chapterNumOf(level) - 1]; }
function questOf(level) { return chapterOf(level).quests[(level - 1) % 10]; }

function areaInfo(level) {
  const ch = chapterOf(level);
  const q = questOf(level);
  return { level, chapter: ch, quest: q, questNum: questNumOf(level), location: q.location };
}

function chapterData(level) {
  const ch = chapterOf(level);
  return { num: ch.num, title: ch.title, headline: ch.headline || '', story: ch.story || [], ending: ch.ending || [], icon: ch.icon };
}

// Guaranteed reward for clearing a level's story (on top of whatever
// the boss itself randomly dropped): gold plus an item of at least
// rare quality.
function grantPartClearReward(level, run) {
  const gold = Math.round((50 + level * 15) * (0.85 + Math.random() * 0.3));
  const r = Math.random();
  const rarity = r < 0.6 ? 'rare' : r < 0.9 ? 'epic' : 'legendary';
  const item = makeItem(level, rarity, G.char.cls);
  G.gold += gold;
  G.totals.goldFound += gold;
  G.totals.itemsFound++;
  G.totals.itemsByRarity[rarity] = (G.totals.itemsByRarity[rarity] || 0) + 1;
  if (shouldAutoSell(item)) {
    G.gold += item.value;
    G.totals.itemsSold++; G.totals.goldFromSales += item.value;
    run.partReward = { gold, item, autoSold: true };
    log('loot', `🎁 Quest reward: 🪙 ${formatK(gold)} + 🪙 ${formatK(item.value)} (auto-sold ${item.icon} ${item.name})`);
  } else {
    G.inventory.push(item);
    run.partReward = { gold, item };
    log('loot', `🎁 Quest reward: 🪙 ${formatK(gold)} + ${item.icon} ${item.name}`);
  }
  questEvent('level_clear');
}

// tier of the NEXT creature given kills-so-far in this area level
function nextCreatureTier(kills) {
  if (kills >= CREATURES_PER_LEVEL) return null;
  if (kills === CREATURES_PER_LEVEL - 1) return 'legendary';
  const posInBlock = (kills % 111) + 1;        // 1..111
  if (posInBlock === 111) return 'epic';
  if (posInBlock % 11 === 0) return 'rare';
  return 'normal';
}

// how many normals remain before the next non-normal (for pack sizing)
function normalsUntilSpecial(kills) {
  let n = 0;
  while (nextCreatureTier(kills + n) === 'normal') n++;
  return n;
}

// Every quest carries its own roster of 3 story-fitting creatures.
function creaturesForLevel(level) {
  return questOf(level).creatures;
}

function rareName(ch) { return `${pick(ch.rareA)} ${pick(ch.rareB)}`; }
// Epic/Miniboss names: generated syllable name + a chapter-themed title.
function bossName(ch) {
  const name = pick(DATA.NAME_SYL_A) + pick(DATA.NAME_SYL_B) + pick(DATA.NAME_SYL_C);
  return `${name} — ${pick(ch.eliteTitles)}`;
}

// Mostly-linear growth (scales with level itself) plus a small 5%
// compounding kicker per level — replaces the old pure-exponential
// 1.5^level/1.2^level curve, which stayed too weak through the opening
// chapters and only got dangerous very late. Weapon damage (dmgScale,
// data.js) matches this exactly at 1.05 so hits-to-kill stays flat across
// the whole level range — monster HP/damage use a slightly steeper 1.10
// on top of that shared base, a deliberate small edge so monsters get
// modestly tougher relative to player power over a long run instead of
// staying perfectly flat forever.
function enemyHpScale(level) { const l = Math.max(1, level); return l * Math.pow(1.10, l - 1); }
function enemyDmgScale(level) { const l = Math.max(1, level); return l * Math.pow(1.10, l - 1); }

// gold was 1/5/20/45/100 — a roughly geometric (2-5x per step) jump between
// tiers that made total gold earned feel like it exploded as tougher/rarer
// encounters became common through the story. Flattened to even, ~linear
// steps; xp is untouched (only gold was flagged as too steep).
const TIER_CONF = {
  normal:    { hp: 1.0, dmg: 1.0, spd: 1.0, xp: 1, gold: 1 },
  rare:      { hp: 3.2, dmg: 1.5, spd: 1.1, xp: 6, gold: 3 },
  epic:      { hp: 9, dmg: 2.4, spd: 1.2, xp: 25, gold: 5 },
  miniboss:  { hp: 15, dmg: 3.0, spd: 1.25, xp: 55, gold: 10 },
  legendary: { hp: 28, dmg: 3.8, spd: 1.35, xp: 120, gold: 20 },
};

// From the 5th part of each chapter onward, a normal encounter has a
// very small chance to be replaced by a wandering mini boss — doubled on
// the 10th part (the chapter's boss level) to 3%.
function minibossChance(level) { return (level % 10 === 0) ? 0.03 : 0.015; }
// Chapter 1 eases the player in — minibosses only start from its 3rd
// quest. Every later chapter can roll a miniboss from its very first quest.
function minibossPossible(level) {
  if (chapterNumOf(level) === 1) return (((level - 1) % 10) + 1) >= 3;
  return true;
}

// The bag-carrying elf (a nod to Golden Axe): a rare bonus encounter.
// He never attacks; the hero gets at most 5 hits before he escapes.
// Every 25% of his HP lost shakes an item out of the bag (magical+,
// small chance of epic); killing him outright spills a rare-or-better
// with a very low chance of legendary. He doesn't count toward the
// level's 1111 creatures.
//
// Three types, rolled whenever an elf encounter triggers — Golden is the
// common baseline, Emerald and Diamond are progressively rarer, tougher
// (more HP), and carry better loot odds (both chunk and kill drops).
const ELF_CHANCE = 0.01;
const ELF_TYPES = {
  golden:  { name: 'Golden Elf',  color: '#e0c14c', hpMult: 10, weight: 70,
    chunk: [['magical', 80], ['rare', 17], ['epic', 3]],
    kill:  [['rare', 75], ['epic', 22], ['legendary', 3]] },
  emerald: { name: 'Emerald Elf', color: '#3ddc6f', hpMult: 14, weight: 22,
    chunk: [['magical', 55], ['rare', 35], ['epic', 10]],
    kill:  [['rare', 55], ['epic', 35], ['legendary', 10]] },
  diamond: { name: 'Diamond Elf', color: '#3ddbe0', hpMult: 18, weight: 8,
    chunk: [['magical', 30], ['rare', 45], ['epic', 25]],
    kill:  [['rare', 30], ['epic', 45], ['legendary', 25]] },
};
function pickElfType() {
  const totalW = Object.values(ELF_TYPES).reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * totalW;
  for (const [id, t] of Object.entries(ELF_TYPES)) { if (r < t.weight) return id; r -= t.weight; }
  return 'golden';
}
function rollFromTable(table) {
  const r = Math.random() * 100;
  let acc = 0;
  for (const [rarity, pct] of table) { acc += pct; if (r < acc) return rarity; }
  return table[table.length - 1][0];
}
function makeElf(level) {
  const elfType = pickElfType();
  const t = ELF_TYPES[elfType];
  const hp = Math.round(39 * t.hpMult * enemyHpScale(level));
  return {
    tier: 'elf', elfType, level, species: 'Bag Carrier', name: t.name,
    attack: 'Frantic Dodging', atkType: 'phys', res: { phys: 0, magic: 0, poison: 0 },
    maxHp: hp, hp, dmg: 0, spd: 0,
    xp: Math.max(2, Math.round((4 + level * 2.2) / 2)),
    gauge: 0, stunned: 0, dead: false,
  };
}
function elfChunkRarity(elfType) { return rollFromTable(ELF_TYPES[elfType || 'golden'].chunk); }
function elfKillRarity(elfType) { return rollFromTable(ELF_TYPES[elfType || 'golden'].kill); }

// ------------------------------------------------------------
// Monster specialties (affixes)
// ------------------------------------------------------------
// Chance a creature of a given tier rolls ONE specialty. Legendary is
// handled separately below (it always gets 1-2, or exactly 2 for the
// boss at the end of a chapter — level % 10 === 0).
const AFFIX_CHANCE = { normal: 0.10, rare: 0.20, epic: 0.50, miniboss: 1.0 };
const AFFIX_IDS = Object.keys(DATA.SPECIALTIES);
function isChapterEndLevel(level) { return level % 10 === 0; }

function rollAffixCount(tier, isChapterBoss) {
  if (tier === 'legendary') return isChapterBoss ? 2 : (Math.random() < 0.5 ? 1 : 2);
  const ch = AFFIX_CHANCE[tier] || 0;
  return Math.random() < ch ? 1 : 0;
}
function rollSpecialties(tier, isChapterBoss) {
  const n = rollAffixCount(tier, isChapterBoss);
  if (n === 0) return [];
  const pool = AFFIX_IDS.slice();
  const out = [];
  for (let i = 0; i < n && pool.length; i++) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}
function hasAffix(e, id) { return !!(e.affixes && e.affixes.includes(id)); }
// specialties whose stat effect is baked in once, at creation time —
// everything else (poison, vamp, evasive, etc.) is resolved live in combat
function applyAffixStatMods(c) {
  if (!c.affixes || !c.affixes.length) return;
  for (const a of c.affixes) {
    if (a === 'resistant') { for (const k of Object.keys(c.res)) c.res[k] = Math.min(85, c.res[k] + 20); }
    else if (a === 'resilient') { c.dr = (c.dr || 0) + 0.20; }
    else if (a === 'colossal') { c.maxHp = Math.round(c.maxHp * 1.5); c.hp = c.maxHp; c.spd = Math.round(c.spd * 0.75); }
    else if (a === 'swift') { c.spd = Math.round(c.spd * 1.4); }
  }
  // Each specialty makes the creature worth 20% more XP.
  c.xp = Math.round(c.xp * (1 + 0.20 * c.affixes.length));
}

// opts.hpMult scales maxHp beyond the tier's own curve (used by the Arena's
// "+50% HP" captives); opts.forceAffixes, when present (even as an empty
// array), overrides the normal per-tier random specialty roll entirely —
// also Arena-only, so a forced-abnormal captive gets exactly the affix(es)
// given and a non-forced one gets exactly none, instead of both being
// subject to AFFIX_CHANCE's independent per-creature roll.
function makeCreature(level, tier, opts) {
  const info = areaInfo(level);
  // The quest's Legendary boss is the story's named creature for that
  // quest — fixed name, stats and hand-picked specialties from data.js.
  const isQuestBoss = tier === 'legendary';
  const base = isQuestBoss ? info.quest.boss : pick(creaturesForLevel(level));
  const conf = TIER_CONF[tier];
  const hpMult = (opts && opts.hpMult) || 1;
  const c = {
    tier, level,
    species: base.name, attack: base.attack, atkType: base.atkType,
    res: { ...base.res },
    maxHp: Math.max(5, Math.round(39 * base.hp * enemyHpScale(level) * conf.hp * (0.9 + Math.random() * 0.2) * hpMult)),
    dmg: Math.max(1, Math.round(11.7 * base.dmg * enemyDmgScale(level) * conf.dmg * (0.9 + Math.random() * 0.2))),
    spd: Math.round((16 + 9 * base.spd + level * 0.4) * conf.spd),
    xp: Math.max(1, Math.round((4 + level * 2.2) * conf.xp)),   // x10 vs previous (was /10)
    gauge: 0, stunned: 0, dead: false, regenTotal: 0, healCount: 0,
  };
  c.hp = c.maxHp;
  if (tier === 'normal') c.name = base.name;
  else if (tier === 'rare') { c.name = rareName(info.chapter); }
  else if (isQuestBoss) { c.name = base.name; c.isChapterBoss = isChapterEndLevel(level); }
  else { c.name = bossName(info.chapter); }
  if (tier !== 'normal') {
    for (const k of Object.keys(c.res)) c.res[k] = Math.min(70, c.res[k] + { rare: 5, epic: 10, miniboss: 12, legendary: 15 }[tier]);
  }
  // Quest bosses use their story-picked specialties; everything else rolls
  // (unless forceAffixes overrides it).
  c.affixes = isQuestBoss ? (base.specialties || []).slice()
    : (opts && opts.forceAffixes) ? opts.forceAffixes.slice()
    : rollSpecialties(tier, opts && opts.isChapterBoss);
  applyAffixStatMods(c);
  return c;
}

// ------------------------------------------------------------
// City Arena — a one-shot, per-level bonus fight against a captured group
// of the quest's own local beasts, tougher than anything the normal 1-in-11
// encounter pattern throws at you. Available for the player's current level
// (G.area) as long as that level's story quest isn't cleared yet
// (!G.bossKilled[level]) and the Arena hasn't already been resolved there
// (!G.arenaResult[level] — set to 'won' on victory or 'lost' on defeat;
// defeat forfeits that level's challenge for good, per explicit request).
// ------------------------------------------------------------
const ARENA_COMPS = {
  mb_epic: ['miniboss', 'epic'],
  epics3: ['epic', 'epic', 'epic'],
  rares6: ['rare', 'rare', 'rare', 'rare', 'rare', 'rare'],
};
const ARENA_HP_MULT = 1.5;
// Rune reward tier scales with which comp was drawn — the miniboss+epic
// pairing is the single toughest option, so it earns the best rune floor.
const ARENA_RUNE_SOURCE = { mb_epic: 'miniboss', epics3: 'epic', rares6: 'rare' };

// Builds the captive group: +50% HP across the board, and exactly 2 of the
// beasts forced abnormal (1 specialty each) — the rest get none, rather
// than also being subject to the normal per-tier AFFIX_CHANCE roll, so the
// group always has precisely 2 anomalies, never more or fewer. Every beast
// is flagged isEscort so its kill doesn't touch the level's own 1111-kill
// story counter (handleKill only advances G.progress for non-escort kills)
// — the Arena is deliberately outside that pattern entirely.
function makeArenaGroup(level) {
  const compId = pick(Object.keys(ARENA_COMPS));
  const tiers = ARENA_COMPS[compId];
  const forcedIdx = new Set();
  const pool = tiers.map((_, i) => i);
  while (forcedIdx.size < Math.min(2, tiers.length)) {
    forcedIdx.add(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  const enemies = tiers.map((tier, i) => {
    const e = makeCreature(level, tier, {
      hpMult: ARENA_HP_MULT,
      forceAffixes: forcedIdx.has(i) ? [pick(AFFIX_IDS)] : [],
    });
    e.isEscort = true;
    return e;
  });
  return { compId, enemies };
}

function grantArenaReward(level, run) {
  const gold = Math.round((80 + level * 25) * (0.85 + Math.random() * 0.3));
  const rune = makeRune(level, ARENA_RUNE_SOURCE[run.arenaComp] || 'rare');
  G.gold += gold;
  G.totals.goldFound += gold;
  G.inventory.push(rune);
  G.totals.itemsFound++;
  G.totals.itemsByRarity[rune.rarity] = (G.totals.itemsByRarity[rune.rarity] || 0) + 1;
  run.arenaReward = { gold, rune };
  log('loot', `🏛️ Arena victory! Reward: 🪙 ${formatK(gold)} + ${rune.icon} ${rune.name}`);
}

// Starts a stand-alone Arena fight against G.area's captive group. Reuses
// the exact same ADV/fight machinery as a normal adventure (pause/retreat/
// speed controls, the Battle Arena panel, playerAct/adventureTick all work
// unmodified) but skips straight to a single pre-built encounter instead of
// going through nextCreatureTier's 1-in-11/1-in-111 pattern — adventureTick
// and retreat() both check ADV.isArena to route the outcome differently
// (see the all-enemies-dead branch in adventureTick and the 'defeated'/
// 'arena_won' handling in retreat).
function startArenaFight(level) {
  if (ADV) return;
  if (G.bossKilled[level] || G.arenaResult[level]) return;
  const d = derive();
  G.char.hp = d.maxHp; G.char.mana = d.maxMana;
  LOG = [];
  const { compId, enemies } = makeArenaGroup(level);
  ADV = {
    level, d,
    scroll: 0, potCd: { hp: 0, mana: 0 }, queued: null, lastAction: null,
    speedMs: G.settings.advSpeed || 1200, tempSpeedOverride: null,
    isArena: true,
    fight: {
      enemies, cds: {}, buffs: [], enemyDmgDown: 0, enemyResDown: 0,
      debuffRounds: 0, debuffApplied: false, round: 0, playerGauge: 0,
      playerDots: {}, playerSlow: null, cursedDebuff: null, corrosiveDebuff: null,
    },
    run: {
      kills: { normal: 0, rare: 0, epic: 0, miniboss: 0, legendary: 0 },
      gold: 0, xp: 0, items: [], autoSold: [], potions: { hp: 0, mana: 0, scroll: 0 },
      dmgDealt: 0, dmgTaken: 0,
      levelUps: 0, bossDefeated: false, outcome: null,
      arenaComp: compId,
    },
  };
  log('sys', `🏛️ You step into the Arena to face a captured horde: ${enemies.map(e => e.name).join(', ')}!`);
  UI.refresh();
  advTimer = setInterval(adventureTick, ADV.speedMs);
}

// ------------------------------------------------------------
// Loot
// ------------------------------------------------------------
function rollItemRarity(tier, magicFind, lvl) {
  // Magic Find compresses the roll toward the rarer end of each tier's
  // table (capped at a 60% pull so it can't guarantee the top rarity).
  let r = Math.random() * 100;
  if (magicFind) r *= (1 - Math.min(0.6, magicFind / 100));
  switch (tier) {
    case 'legendary': {
      // Legendary-tier creatures' own legendary-item chance climbs from its
      // base 25% up to 30% by level 100 — same treatment as the Blacksmith's
      // legendary chance above. The 25-50-75 split below it is unaffected.
      const t = Math.max(0, Math.min(1, ((lvl || 1) - 1) / (MAX_LEVEL_AREA - 1)));
      const legendaryPct = 25 + (30 - 25) * t;
      if (r < legendaryPct) return 'legendary';
      if (r < legendaryPct + 25) return 'epic';
      if (r < legendaryPct + 50) return 'rare';
      return 'magical';
    }
    case 'miniboss':   // half the boss's legendary chance; rest shifts down
      if (r < 12.5) return 'legendary';
      if (r < 42) return 'epic';
      if (r < 72) return 'rare';
      return 'magical';
    case 'epic':
      if (r < 5) return 'legendary';
      if (r < 30) return 'epic';
      if (r < 65) return 'rare';
      return 'magical';
    case 'rare':
      if (r < 1) return 'legendary';
      if (r < 6) return 'epic';
      if (r < 40) return 'rare';
      if (r < 85) return 'magical';
      return 'normal';
    default:
      if (r < 78) return 'normal';
      if (r < 97) return 'magical';
      if (r < 99.7) return 'rare';
      return 'epic';
  }
}

const RUNE_CHANCE = { normal: 0.001, rare: 0.01, epic: 0.02, miniboss: 0.05, legendary: 0.10 };

// Per-tier chance an item (rather than gold/potion/nothing) drops —
// reused below to give specialty creatures extra, independent shots
// at an item on top of their normal roll.
function itemDropChance(tier) {
  if (tier === 'legendary' || tier === 'miniboss') return 0.75;
  return ({ normal: 12, rare: 25, epic: 32 }[tier] || 0) / 100;
}

function rollLoot(creature, run) {
  const tier = creature.tier;
  const lvl = creature.level;
  const magicFind = (ADV && ADV.d && ADV.d.magicFind) || 0;
  const goldMult = 1 + ((ADV && ADV.d && ADV.d.goldFind) || 0) / 100;
  const goldBase = Math.round((2 + lvl * 1.6) * TIER_CONF[tier].gold * (0.7 + Math.random() * 0.6) * goldMult);

  // Rune roll is independent (legendary: 10% per spec)
  if (chance(RUNE_CHANCE[tier])) {
    const rune = makeRune(lvl, tier);
    run.items.push(rune); G.inventory.push(rune);
    G.totals.runesFound++;
    log('loot', `🪨 A ${rune.name} drops! (${rune.bonuses.length} bonus${rune.bonuses.length > 1 ? 'es' : ''})`);
  }

  if (tier === 'legendary' || tier === 'miniboss') {
    run.gold += goldBase; G.gold += goldBase; G.totals.goldFound += goldBase;
    const r = Math.random() * 100;
    if (r < 75) dropItem(lvl, rollItemRarity(tier, magicFind, lvl), run);
    else gainPotion(pick(['hp', 'mana', 'scroll']), run);
  } else {
    const r = Math.random() * 100;
    const T = {
      normal: { gold: 42, item: 12, hpPot: 4, manaPot: 3.5, buffPot: 0.35 },
      rare:   { gold: 55, item: 25, hpPot: 3.5, manaPot: 3, buffPot: 1.4 },
      epic:   { gold: 55, item: 32, hpPot: 2.5, manaPot: 2.2, buffPot: 2 },
    }[tier];
    let acc = 0;
    if (r < (acc += T.gold)) { run.gold += goldBase; G.gold += goldBase; G.totals.goldFound += goldBase; }
    else if (r < (acc += T.item)) { dropItem(lvl, rollItemRarity(tier, magicFind, lvl), run); }
    else if (r < (acc += T.hpPot)) { gainPotion('hp', run); }
    else if (r < (acc += T.manaPot)) { gainPotion('mana', run); }
    else if (r < (acc += T.buffPot)) { gainPotion('scroll', run); }
    // else: nothing
  }

  // Specialties: one extra independent item-drop roll per abnormality
  // (same per-tier item chance as the base roll) — a creature with 2
  // specialties gets 2 extra rolls, on top of its normal roll, so it
  // can drop up to 3 items total.
  const specialtyCount = (creature.affixes && creature.affixes.length) || 0;
  if (specialtyCount) {
    const chanceEach = itemDropChance(tier);
    for (let i = 0; i < specialtyCount; i++) {
      if (chance(chanceEach)) dropItem(lvl, rollItemRarity(tier, magicFind, lvl), run);
    }
  }
}

// Whether an auto-sell setting matches a freshly-dropped item. Runes
// never pass through here (they're not created via dropItem), so the
// "sell all unequipped except runes" rule from the manual bulk-sell is
// preserved automatically.
function shouldAutoSell(it) {
  const s = G.settings.autoSell;
  if (!s) return false;
  if (s.all) return true;
  if (s.unusable && !canUseItem(it).ok) return true;
  return !!s[it.rarity];
}

// Auto-sell only fires on freshly dropped items (dropItem), so toggling an
// Inventory Settings checkbox on wouldn't otherwise touch items already
// sitting in the inventory from before it was enabled. Called right after
// a settings change to sweep those up immediately, same rules as a manual
// bulk-sell.
function sweepAutoSell() {
  const sold = G.inventory.filter(i => i.type === 'item' && shouldAutoSell(i));
  if (!sold.length) return { count: 0, gold: 0 };
  let gold = 0;
  for (const it of sold) gold += it.value;
  const uids = new Set(sold.map(i => i.uid));
  G.inventory = G.inventory.filter(i => !uids.has(i.uid));
  G.gold += gold;
  G.totals.itemsSold += sold.length; G.totals.goldFromSales += gold;
  saveGame(); UI.refresh();
  return { count: sold.length, gold };
}

function dropItem(lvl, rarity, run) {
  const it = makeItem(lvl, rarity, G.char.cls);
  G.totals.itemsFound++;
  G.totals.itemsByRarity[rarity] = (G.totals.itemsByRarity[rarity] || 0) + 1;
  if (rarity !== 'normal') questEvent('item_magic');
  if (rarity === 'epic' || rarity === 'legendary') questEvent('item_epic');
  questEvent('item_any');
  if (shouldAutoSell(it)) {
    run.gold += it.value; G.gold += it.value;
    G.totals.itemsSold++; G.totals.goldFromSales += it.value;
    run.autoSold.push({ icon: it.icon, name: it.name, rarity: it.rarity, value: it.value });
    log('loot', `🪙 Auto-sold ${it.icon} ${it.name} for ${formatK(it.value)} gold.`);
    return;
  }
  run.items.push(it); G.inventory.push(it);
  if (rarity !== 'normal') log('loot', `${it.icon} ${DATA.RARITIES[rarity].name} drop: ${it.name}`, { rarity });
}

// Found potions are STORED (drunk manually); power-up scrolls auto-use.
const SCROLL_ROUNDS = 100;
const BASE_POTION_CAP = 2;   // capacity per potion type with no belt equipped

// A belt adds its potionCap to BOTH the HP and Mana slots equally.
function potionCapacity() {
  const belt = G.char.equip.belt;
  return BASE_POTION_CAP + (belt && belt.potionCap ? belt.potionCap : 0);
}

function gainPotion(kind, run) {
  if (kind === 'scroll') {
    ADV.scroll = (ADV.scroll || 0) + SCROLL_ROUNDS;
    run.potions.scroll++;
    log('loot', `📜 A power-up scroll unfurls on its own! +12% damage for ${SCROLL_ROUNDS} rounds.`);
    return;
  }
  const cap = potionCapacity();
  if ((G.potions[kind] || 0) >= cap) {
    log('loot', `🧪 Found a ${kind === 'hp' ? 'health' : 'mana'} potion, but your belt has no room for it — it spills, wasted. (${cap}/${cap} ${kind === 'hp' ? 'health' : 'mana'})`);
    return;
  }
  G.potions[kind] = (G.potions[kind] || 0) + 1;
  run.potions[kind]++;
  log('loot', `🧪 Found a ${kind === 'hp' ? 'health' : 'mana'} potion (${G.potions[kind]}/${cap} stored — click to drink).`);
  questEvent('potion');
}

// Manual drinking, on a shared-per-type cooldown of combat ticks.
const POTION_CD = 12;
function drinkPotion(kind) {
  if (!ADV) { UI.toast('Potions are drunk during adventures'); return; }
  if ((G.potions[kind] || 0) <= 0) { UI.toast('None left!'); return; }
  if ((ADV.potCd[kind] || 0) > 0) return;
  const d = ADV.d;
  G.potions[kind]--;
  G.totals.potionsUsed++;
  ADV.potCd[kind] = POTION_CD;
  if (kind === 'hp') {
    // 0.5% Full Health, 25% Greater (40%), otherwise regular (20%)
    const roll = Math.random();
    let heal, label;
    if (roll < 0.005) { heal = d.maxHp; label = '🌟 FULL HEALTH potion! Fully restored'; }
    else if (roll < 0.255) { heal = Math.round(d.maxHp * 0.40); label = '✨ GREATER health potion!'; }
    else { heal = Math.round(d.maxHp * 0.20); label = 'Health potion.'; }
    if (ADV.fight && necroticActive(ADV.fight)) { heal = Math.round(heal * 0.25); label += ' (weakened by a Necrotic aura)'; }
    const before = G.char.hp;
    G.char.hp = Math.min(d.maxHp, G.char.hp + heal);
    log('loot', `🧪 ${label} +${Math.round(G.char.hp - before)} HP.`);
  } else {
    const m = Math.round(d.maxMana * 0.4);
    G.char.mana = Math.min(d.maxMana, G.char.mana + m);
    log('loot', `🧪 Mana potion! +${m} mana.`);
  }
  saveGame();
  UI.refreshAdventure();
}

// Click a skill to queue it for the hero's next action; click again to cancel.
function queueSkill(id) {
  if (!ADV) return;
  const s = DATA.SKILLS[G.char.cls][id];
  if (!s || s.passive || !(G.char.skills[id] > 0)) return;
  ADV.queued = ADV.queued === id ? null : id;
  UI.refreshAdventure();
}

// ------------------------------------------------------------
// Auto-Use: automatically queues potions/skills per G.settings.autoUse
// whenever the player hasn't manually queued anything themselves.
// ------------------------------------------------------------
// 'off'|'100'|'50'|'25' — true once the resource has dropped BELOW
// that fraction (100 fires on any missing amount at all).
function belowGate(mode, frac) {
  if (mode === '100') return frac < 0.999;
  if (mode === '50') return frac < 0.5;
  if (mode === '25') return frac < 0.25;
  return false;
}
// 'off'|'100'|'50'|'25'|'available' — mana-based gates for buff/debuff/
// ultimate/damage rules. '100' requires full mana, '50'/'25' require
// ABOVE that fraction (so the resource isn't blown on a whim), and
// 'available' (debuff/ultimate/damage only) ignores mana entirely.
function manaGate(mode, frac) {
  if (mode === '100') return frac >= 0.999;
  if (mode === '50') return frac > 0.5;
  if (mode === '25') return frac > 0.25;
  if (mode === 'available') return true;
  return false;
}
// "Abnormal" (the tierSet.miniboss checkbox) also matches any living
// creature carrying a specialty affix, regardless of its actual tier —
// not just true Miniboss-tier enemies (which always have one anyway).
function anyEnemyTierMatches(fight, tierSet) {
  return fight.enemies.some(e => e.hp > 0 && (tierSet[e.tier] || (tierSet.miniboss && e.affixes && e.affixes.length)));
}
function eligibleSkillsOf(cats, fight) {
  const skills = DATA.SKILLS[G.char.cls];
  return Object.values(skills).filter(s =>
    cats.includes(s.cat) && (G.char.skills[s.id] || 0) > 0 &&
    (fight.cds[s.id] || 0) <= 0 && G.char.mana >= skillCost(s));
}

// Auto-drink potions once per round, same cooldown/stock rules as
// manual drinking. Priority: heal > ultimate > debuff > buff > damage.
function autoUsePotions() {
  const au = G.settings.autoUse;
  const d = ADV.d;
  const hpFrac = d.maxHp > 0 ? G.char.hp / d.maxHp : 1;
  const manaFrac = d.maxMana > 0 ? G.char.mana / d.maxMana : 1;
  if (belowGate(au.hpPotion, hpFrac) && (G.potions.hp || 0) > 0 && (ADV.potCd.hp || 0) <= 0) drinkPotion('hp');
  if (belowGate(au.manaPotion, manaFrac) && (G.potions.mana || 0) > 0 && (ADV.potCd.mana || 0) <= 0) drinkPotion('mana');
}

// Auto-selects the player's next action when nothing is manually
// queued. Only ever sets ADV.queued — pickSkill (below) still does the
// final validity check and actually consumes it.
function autoQueueSkill(fight) {
  const au = G.settings.autoUse;
  const d = ADV.d;
  const hpFrac = d.maxHp > 0 ? G.char.hp / d.maxHp : 1;
  const manaFrac = d.maxMana > 0 ? G.char.mana / d.maxMana : 1;

  if (belowGate(au.heal, hpFrac)) {
    const opts = eligibleSkillsOf(['heal'], fight);
    if (opts.length) { ADV.queued = pick(opts).id; return; }
  }
  if (manaGate(au.ultimate.mode, manaFrac) && anyEnemyTierMatches(fight, au.ultimate.tiers)) {
    const opts = eligibleSkillsOf(['ult', 'ult2'], fight);
    if (opts.length) { ADV.queued = pick(opts).id; return; }
  }
  if (manaGate(au.debuff.mode, manaFrac) && anyEnemyTierMatches(fight, au.debuff.tiers)) {
    const opts = eligibleSkillsOf(['debuff'], fight);
    if (opts.length) { ADV.queued = pick(opts).id; return; }
  }
  if (manaGate(au.buff, manaFrac)) {
    const opts = eligibleSkillsOf(['buff'], fight);
    if (opts.length) { ADV.queued = pick(opts).id; return; }
  }
  if (manaGate(au.damage.mode, manaFrac) && anyEnemyTierMatches(fight, au.damage.tiers)) {
    const opts = eligibleSkillsOf(['attack', 'attack2', 'aoe', 'aoe2'], fight);
    if (opts.length) { ADV.queued = pick(opts).id; return; }
  }
}

// ------------------------------------------------------------
// Combat — round-based with an ATB speed gauge.
// Every combat round each fighter gains gauge equal to their Speed;
// on reaching 100 they act. High Dexterity = more attacks.
// ------------------------------------------------------------
// Combat is player-driven now: the hero auto-swings his free basic
// attack, and casts a skill only when the player has queued one
// (manually, or automatically via Auto-Use).
function pickSkill(fight) {
  if (!ADV.queued) autoQueueSkill(fight);
  const skills = DATA.SKILLS[G.char.cls];
  const basic = Object.values(skills).find(s => s.cat === 'basic');
  const qid = ADV.queued;
  if (qid) {
    const s = skills[qid];
    if (s && !s.passive && (G.char.skills[qid] || 0) > 0 &&
        (fight.cds[qid] || 0) <= 0 && G.char.mana >= skillCost(s)) {
      ADV.queued = null;   // consumed
      return s;
    }
  }
  return basic;
}

// ------------------------------------------------------------
// Specialty helpers that depend on live combat state (current HP,
// active fight debuffs) rather than a one-time stat at creation.
// ------------------------------------------------------------
function enemyMissingFrac(e) { return e.maxHp > 0 ? Math.max(0, 1 - e.hp / e.maxHp) : 0; }
function effectiveEnemyDmg(e) {
  let mult = 1;
  const mf = enemyMissingFrac(e);
  if (hasAffix(e, 'enraged')) mult += mf * 0.6;
  if (hasAffix(e, 'berserk')) mult += mf * 0.8;
  return e.dmg * mult;
}
function effectiveEnemySpd(e) {
  let spd = hasAffix(e, 'enraged') ? e.spd * (1 + enemyMissingFrac(e) * 0.5) : e.spd;
  if (e.slow) spd *= (1 - e.slow.pct);
  return spd;
}
function incomingDmgMult(e) {
  return hasAffix(e, 'berserk') ? 1 + enemyMissingFrac(e) * 0.5 : 1;
}
function necroticActive(fight) {
  if (ADV && ADV.d && ADV.d.immuneNecrotic) return false;
  return fight.enemies.some(e => e.hp > 0 && hasAffix(e, 'necrotic'));
}

function playerHit(fight, enemy, skill, r) {
  if (hasAffix(enemy, 'evasive') && Math.random() < 0.25) return 0;
  const d = ADV.d;
  const raw = rint(d.baseDmgMin, d.baseDmgMax) * (skill.mult ? skill.mult(r) : 1);
  let dmgBoost = 1 + (ADV.scroll > 0 ? 0.12 : 0) - (fight.cursedDebuff ? fight.cursedDebuff.dmgDown : 0);   // power-up scroll, weakened by Cursed
  dmgBoost = Math.max(0.1, dmgBoost);
  for (const b of fight.buffs) if (b.dmgPct) dmgBoost += b.dmgPct;
  const isMagic = skill.magic || (d.weaponMagic && skill.cat === 'basic');
  const resKey = isMagic ? 'magic' : 'phys';
  let res = enemy.res[resKey] - d.enemyResDown - (fight.enemyResDown || 0);
  if (skill.pierce) res *= (1 - skill.pierce);
  res = Math.max(-50, Math.min(75, res));
  let dmg = Math.max(1, Math.round(raw * dmgBoost * (1 - res / 100)));
  if (hasAffix(enemy, 'golem')) dmg = resKey === 'phys' ? dmg * 2 : Math.max(1, Math.round(dmg * 0.2));
  if (hasAffix(enemy, 'spectral')) dmg = resKey === 'phys' ? Math.max(1, Math.round(dmg * 0.2)) : dmg * 2;
  if (enemy.dr) dmg = Math.max(1, Math.round(dmg * (1 - enemy.dr)));
  dmg = Math.max(1, Math.round(dmg * incomingDmgMult(enemy)));
  if (d.execute && enemy.hp / enemy.maxHp < 0.25) dmg = Math.round(dmg * (1 + d.execute / 100));
  if (d.critStrike && chance(d.critStrike / 100)) dmg *= 2;
  enemy.hp -= dmg;
  ADV.run.dmgDealt += dmg;
  if (d.lifesteal) G.char.hp = Math.min(d.maxHp, G.char.hp + Math.max(1, Math.round(dmg * (d.lifesteal / 100))));
  if (d.manasteal) G.char.mana = Math.min(d.maxMana, G.char.mana + Math.max(1, Math.round(dmg * (d.manasteal / 100))));
  if (d.weaponPoison && chance(0.3)) {
    if (!enemy.dots) enemy.dots = {};
    const wpDmg = Math.max(1, Math.round(enemy.maxHp * d.weaponPoison.pct));
    enemy.dots.weaponPoison = { icon: '☠️', label: 'Poison', dmg: wpDmg, rounds: d.weaponPoison.rounds };
  }
  if (d.weaponSlow && chance(d.weaponSlow.chance / 100)) {
    enemy.slow = { pct: d.weaponSlow.pct / 100, rounds: d.weaponSlow.rounds };
  }
  if (enemy.tier === 'elf') fight.elfHits = (fight.elfHits || 0) + 1;
  return dmg;
}

function enemyHit(fight, enemy) {
  const d = ADV.d;
  if (Math.random() * 100 < d.evasion) return { dodged: true, dmg: 0 };
  if (d.blockChance && Math.random() < d.blockChance) return { dodged: false, blocked: true, dmg: 0 };
  let raw = effectiveEnemyDmg(enemy) * (0.85 + Math.random() * 0.3);
  if (fight.enemyDmgDown) raw *= (1 - fight.enemyDmgDown);
  const resKey = enemy.atkType === 'magic' ? 'magic' : enemy.atkType === 'poison' ? 'poison' : 'phys';
  let dmg = raw * (1 - d.res[resKey] / 100);
  if (enemy.atkType === 'phys') {
    const armor = d.armor * (1 - (fight.corrosiveDebuff ? fight.corrosiveDebuff.armorDown : 0));
    // Capped at 75%, matching resistance/DR — with linear armor scaling
    // (see itemScale) this rarely binds, but stacking every possible
    // +Armor affix across 6 slots could still push past it without a floor.
    const armorRed = Math.min(0.75, armor / (armor + 40 + 8 * enemy.level));
    dmg *= (1 - armorRed);
  }
  let buffDr = 0;
  for (const b of fight.buffs) if (b.dr) buffDr += b.dr;
  dmg *= (1 - Math.min(0.75, d.dr + buffDr));
  if (hasAffix(enemy, 'magical')) dmg += raw * (0.15 + Math.random() * 0.15);
  dmg = Math.max(1, Math.round(dmg));
  G.char.hp -= dmg;
  ADV.run.dmgTaken += dmg;
  fight.lastHit = { icon: '🩸', label: `${enemy.name.split(' — ')[0]}'s ${enemy.attack}`, amount: dmg };
  if (d.painReflect) {
    const reflected = Math.max(1, Math.round(dmg * (d.painReflect / 100)));
    enemy.hp -= reflected;
    ADV.run.dmgDealt += reflected;
    log('act', `🌵 Pain Reflection sends ${formatK(reflected)} damage back at ${enemy.name.split(' — ')[0]}!`);
  }
  if (hasAffix(enemy, 'vampiric')) enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.max(1, Math.round(dmg * 0.25)));
  if (hasAffix(enemy, 'poisonous')) {
    fight.playerDots.poison = { icon: '☠️', label: `${enemy.name.split(' — ')[0]}'s poison`, dmg: Math.max(1, Math.round(enemy.dmg * 0.12)), rounds: 3 };
  }
  if (hasAffix(enemy, 'burning') && Math.random() < 0.25) {
    fight.playerDots.burning = { icon: '🔥', label: 'Burning', dmg: Math.max(1, Math.round(enemy.dmg * 0.15)), rounds: 3 };
  }
  if (hasAffix(enemy, 'frozen') && !d.immuneSlow && Math.random() < 0.25) fight.playerSlow = { pct: 0.30, rounds: 2 };
  if (hasAffix(enemy, 'cursed')) fight.cursedDebuff = { dmgDown: 0.12, rounds: 3 };
  if (hasAffix(enemy, 'corrosive')) fight.corrosiveDebuff = { armorDown: 0.20, rounds: 3 };
  return { dodged: false, dmg };
}

// One player action: pick a skill, resolve it, log it.
function playerAct(fight) {
  const c = G.char;
  const d = ADV.d;
  // Charm specialty: 50% chance, rolled once per player turn (not per swing),
  // that a charming enemy prevents you from attacking or casting entirely.
  if (!d.immuneCharm && fight.enemies.some(e => e.hp > 0 && hasAffix(e, 'charm')) && chance(0.5)) {
    const charmer = fight.enemies.find(e => e.hp > 0 && hasAffix(e, 'charm'));
    const shortName = charmer.name.split(' — ')[0];
    log('player', `💘 ${shortName}'s charm stops you from acting this turn!`);
    ADV.lastAction = { side: 'player', icon: '💘', txt: `Charmed by ${shortName}!` };
    return;
  }
  const attacks = 1 + (fight.buffs.some(b => b.extraHit) ? 1 : 0) + (d.doubleStrike && chance(d.doubleStrike / 100) ? 1 : 0);
  for (let i = 0; i < attacks; i++) {
    const alive = fight.enemies.filter(e => e.hp > 0);
    if (!alive.length) return;
    const skill = pickSkill(fight);
    const r = effectiveRank(skill.id) || 1;
    const cost = skillCost(skill);
    if (cost) c.mana -= cost;
    if (skill.cd) fight.cds[skill.id] = skill.cd + 1;
    if (skill.cat !== 'basic') questEvent('skill_cast');

    if (skill.healPct) {
      let heal = Math.round(d.maxHp * skill.healPct(r));
      if (c.cls === 'mage') heal += Math.round(d.int * 1.5);
      if (necroticActive(fight)) heal = Math.round(heal * 0.25);
      c.hp = Math.min(d.maxHp, c.hp + heal);
      log('act', `${skill.icon} ${skill.name} heals you for ${heal} HP${necroticActive(fight) ? ' (weakened by a Necrotic aura)' : ''}`);
      ADV.lastAction = { side: 'player', icon: skill.icon, txt: `${skill.name} +${heal} HP` };
    } else if (skill.buff && !skill.mult) {
      fight.buffs.push({ ...skill.buff(r), icon: skill.icon, name: skill.name });
      log('act', `${skill.icon} You roar with ${skill.name}!`);
      ADV.lastAction = { side: 'player', icon: skill.icon, txt: skill.name };
    } else if (skill.debuff && !skill.mult) {
      const db = skill.debuff(r);
      fight.enemyDmgDown = Math.max(fight.enemyDmgDown, db.dmgDown || 0);
      fight.enemyResDown = Math.max(fight.enemyResDown, db.resDown || 0);
      fight.debuffRounds = db.rounds; fight.debuffApplied = true;
      log('act', `${skill.icon} ${skill.name} weakens your enemies!`);
      ADV.lastAction = { side: 'player', icon: skill.icon, txt: skill.name };
    } else {
      if (skill.buff) fight.buffs.push({ ...skill.buff(r), icon: skill.icon, name: skill.name });
      if (skill.debuff) {
        const db = skill.debuff(r);
        fight.enemyResDown = Math.max(fight.enemyResDown, db.resDown || 0);
        fight.debuffRounds = db.rounds; fight.debuffApplied = true;
      }
      const tgts = skill.aoe ? alive : [alive[0]];
      const parts = [];
      let total = 0;
      for (const t of tgts) {
        const dmg = playerHit(fight, t, skill, r);
        total += dmg;
        parts.push(dmg > 0 ? `${t.name.split(' — ')[0]} for ${formatK(dmg)}` : `${t.name.split(' — ')[0]} (evaded!)`);
        if (skill.stun && dmg > 0 && t.hp > 0) t.stunned = (t.stunned || 0) + skill.stun;
        if (skill.poisonDot && dmg > 0 && t.hp > 0) {
          if (!t.dots) t.dots = {};
          const pd = skill.poisonDot(r);
          const pdDmg = pd.pct ? Math.max(1, Math.round(t.maxHp * pd.pct)) : pd.dmg;
          t.dots.skillPoison = { icon: '☠️', label: 'Poison', dmg: pdDmg, rounds: pd.rounds };
        }
      }
      log('act', `${skill.icon} ${skill.name} hits ${parts.join(', ')}`);
      ADV.lastAction = { side: 'player', icon: skill.icon, txt: `${skill.name} — ${formatK(total)} dmg` };

      // Ultra-rare gear procs: casting a random spell on landing a hit.
      // Independent of learned rank/mana/cooldown (the item is casting,
      // not the player) and always resolved at a fixed low rank (1), so
      // it's a minor bonus rather than a free copy of the player's build.
      if (d.procOffense && chance(d.procOffense / 100)) {
        // classSkillFor (not a flat filter) so a banked/replaced base skill
        // or the other Advanced Class path's skill can never proc.
        const opts = ['attack', 'attack2', 'aoe', 'aoe2', 'debuff'].map(classSkillFor).filter(Boolean);
        if (opts.length) {
          const ps = pick(opts);
          const stillAlive = fight.enemies.filter(e => e.hp > 0);
          if (stillAlive.length) {
            if (ps.mult) {
              const ptgts = ps.aoe ? stillAlive : [stillAlive[0]];
              for (const t of ptgts) { const pd = playerHit(fight, t, ps, 1); log('act', `${ps.icon} ${ps.name} (proc) hits ${t.name.split(' — ')[0]} for ${formatK(pd)}`); }
            } else if (ps.debuff) {
              const db = ps.debuff(1);
              fight.enemyDmgDown = Math.max(fight.enemyDmgDown, db.dmgDown || 0);
              fight.enemyResDown = Math.max(fight.enemyResDown, db.resDown || 0);
              fight.debuffRounds = Math.max(fight.debuffRounds, db.rounds || 4); fight.debuffApplied = true;
              log('act', `${ps.icon} ${ps.name} (proc) weakens the enemy!`);
            }
          }
        }
      }
      if (d.procSupport && chance(d.procSupport / 100)) {
        const opts = ['heal', 'buff'].map(classSkillFor).filter(Boolean);
        if (opts.length) {
          const ps = pick(opts);
          if (ps.healPct) {
            const heal = Math.round(d.maxHp * ps.healPct(1));
            c.hp = Math.min(d.maxHp, c.hp + heal);
            log('act', `${ps.icon} ${ps.name} (proc) heals you for ${heal} HP`);
          } else if (ps.buff) {
            fight.buffs.push({ ...ps.buff(1), icon: ps.icon, name: ps.name });
            log('act', `${ps.icon} ${ps.name} (proc) triggers!`);
          }
        }
      }
    }
  }
}

function enemyAct(fight, e) {
  if (e.hp <= 0) return;
  const shortName = e.name.split(' — ')[0];
  if (e.stunned > 0) {
    e.stunned--;
    log('enemy', `💫 ${e.name} is stunned and misses its turn!`);
    ADV.lastAction = { side: 'enemy', icon: '💫', txt: `${shortName} is stunned!` };
    return;
  }
  // Healing specialty: instead of attacking, a 50% chance each turn to heal
  // itself or an injured ally for 20% of the target's max HP, capped at 10
  // uses per creature (regen's own passive-tick heal is a separate, always-on
  // effect — this is a discrete attack-or-heal choice on the creature's turn).
  if (hasAffix(e, 'healing') && (e.healCount || 0) < 10) {
    const injured = fight.enemies.filter(o => o.hp > 0 && o.hp < o.maxHp);
    if (injured.length && chance(0.5)) {
      const target = pick(injured);
      const heal = Math.max(1, Math.round(target.maxHp * 0.2));
      const actual = Math.min(heal, target.maxHp - target.hp);
      target.hp += actual;
      e.healCount = (e.healCount || 0) + 1;
      const selfHeal = target === e;
      const targetShort = target.name.split(' — ')[0];
      log('enemy', `💚 ${shortName} heals ${selfHeal ? 'itself' : targetShort} for ${formatK(actual)} HP!`);
      ADV.lastAction = { side: 'enemy', icon: '💚', txt: `${shortName} heals ${selfHeal ? 'itself' : targetShort}` };
      return;
    }
  }
  const hit = enemyHit(fight, e);
  if (hit.dodged) {
    log('enemy', `💨 You dodge ${e.name}'s ${e.attack}!`);
    ADV.lastAction = { side: 'enemy', icon: '💨', txt: `Dodged ${shortName}'s ${e.attack}!` };
  } else if (hit.blocked) {
    log('enemy', `🛡️ You block ${e.name}'s ${e.attack}!`);
    ADV.lastAction = { side: 'enemy', icon: '🛡️', txt: `Blocked ${shortName}'s ${e.attack}!` };
  } else {
    log('enemy', `🩸 ${e.name}'s ${e.attack} (${e.atkType}) deals ${formatK(hit.dmg)} damage`);
    ADV.lastAction = { side: 'enemy', icon: '🩸', txt: `${shortName}: ${e.attack} — ${formatK(hit.dmg)} dmg` };
  }
}

function handleKill(e, run) {
  e.dead = true;
  run.kills[e.tier]++;
  G.totals.kills[e.tier]++;
  G.totals.killsBySpecies[e.species] = (G.totals.killsBySpecies[e.species] || 0) + 1;
  G.char.kills++;
  // Only the featured creature of an encounter advances the level's
  // 1111 pattern position — escort companions are bonus kills (extra
  // XP/loot/stats) and must NOT push the kill-count past the exact
  // checkpoints (111th = Epic, 1111th = Legendary) that trigger them.
  if (!e.isEscort) G.progress[ADV.level] = (G.progress[ADV.level] || 0) + 1;
  gainXp(e.xp, run);
  run.xp += e.xp;
  log('kill', `☠️ ${e.name} is slain! (+${e.xp} XP)`, { tier: e.tier });
  rollLoot(e, run);
  questEvent('kill_' + e.tier);
  questEvent('kill_any');
  // Specialty/abnormality bounty quests: fires one event per specialty the
  // creature had (a creature can carry several), plus a catch-all for "any
  // specialty" and chapter-boss kills specifically.
  if (e.affixes && e.affixes.length) {
    questEvent('kill_abnormal');
    for (const aff of e.affixes) questEvent('kill_' + aff);
  }
  if (e.isChapterBoss) questEvent('chapter_boss');
}

// ------------------------------------------------------------
// Adventure loop — no stamina: fight until 0 HP or the boss falls.
// ------------------------------------------------------------
function startAdventure() {
  if (ADV) return;
  const level = G.area;
  // Speed and pack-size choices persist for repeat runs of the same
  // level, but reset to defaults when adventuring in a new level.
  if (G.settings.lastAdvLevel !== level) {
    G.settings.packSize = 1;
    G.settings.advSpeed = 1200;
    G.settings.lastAdvLevel = level;
  }
  // areas cleared before re-runnability landed sit at 1111 — reset them
  if ((G.progress[level] || 0) >= CREATURES_PER_LEVEL) G.progress[level] = 0;
  const d = derive();
  G.char.hp = d.maxHp; G.char.mana = d.maxMana; // rested before departure
  LOG = [];
  ADV = {
    level, d,
    scroll: 0,                       // power-up scroll rounds remaining
    potCd: { hp: 0, mana: 0 },       // manual potion cooldowns (ticks)
    queued: null,                    // manually queued skill id
    lastAction: null,                // shown in the arena's action box
    speedMs: G.settings.advSpeed || 1200,
    tempSpeedOverride: null,        // set while a Combat Options "1x Speed" rule is forcing the pace down
    fight: null,
    run: {
      kills: { normal: 0, rare: 0, epic: 0, miniboss: 0, legendary: 0 },
      gold: 0, xp: 0, items: [], autoSold: [], potions: { hp: 0, mana: 0, scroll: 0 },
      dmgDealt: 0, dmgTaken: 0,
      levelUps: 0, bossDefeated: false, outcome: null,
    },
  };
  G.totals.adventures++;
  const info = areaInfo(level);
  log('sys', `⚔️ Quest ${info.questNum}: ${info.quest.name} — setting out for ${info.location} (${info.chapter.title})...`);
  UI.refresh();
  advTimer = setInterval(adventureTick, ADV.speedMs);
}

function setAdvSpeed(ms) {
  if (!ADV) return;
  ADV.speedMs = ms;
  G.settings.advSpeed = ms;   // remembered for repeat runs of this level
  clearInterval(advTimer); advTimer = null;
  if (!ADV.paused) advTimer = setInterval(adventureTick, ms);
  saveGame();
  UI.refresh();
}

function pauseAdventure() {
  if (!ADV || ADV.paused) return;
  ADV.paused = true;
  clearInterval(advTimer); advTimer = null;
  log('sys', '⏸ Adventure paused.');
  saveGame();
  UI.refresh();
}

function resumeAdventure() {
  if (!ADV || !ADV.paused) return;
  ADV.paused = false;
  advTimer = setInterval(adventureTick, ADV.speedMs);
  log('sys', '▶ Adventure resumed.');
  UI.refresh();
}

// "Miniboss" is the tier itself; "Abnormal" is any creature (of any tier)
// that independently rolled a specialty (Vampiric, Healing, etc.) —
// they're tracked as separate, independently configurable encounter kinds.
const TIER_DISPLAY_NAME = { miniboss: 'Miniboss', abnormal: 'Abnormal', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

// Combat Options: Pause / 1x Speed / Continue Normally per encounter
// tier, applied right after that tier's pack spawns.
function applyEncounterMode(tier) {
  const mode = G.settings.encounterMode[tier];
  if (!mode || mode === 'continue' || ADV.paused) return;
  if (mode === 'pause') {
    ADV.paused = true;
    clearInterval(advTimer); advTimer = null;
    log('sys', `⏸ Auto-paused: a ${TIER_DISPLAY_NAME[tier]} encounter appeared.`);
  } else if (mode === 'speed1x') {
    if (ADV.tempSpeedOverride == null) {
      ADV.tempSpeedOverride = ADV.speedMs;
      ADV.speedMs = 1200;
      clearInterval(advTimer);
      advTimer = setInterval(adventureTick, 1200);
    }
  }
}

function setPackSize(n) {
  G.settings.packSize = Math.max(1, Math.min(6, n));
  saveGame(); UI.refresh();
}

function retreat(reason) {
  const run = ADV.run;
  run.outcome = reason;
  run.isArena = !!ADV.isArena;
  clearInterval(advTimer); advTimer = null;
  log('sys', reason === 'boss' ? '🏆 The boss has fallen! You return home in triumph.' :
    reason === 'arena_won' ? '🏛️ The Arena crowd roars — you\'ve won this city\'s challenge!' :
    reason === 'defeated' ? (run.isArena ? '💀 The Arena\'s captives overpower you — you wake up at home, aching but alive.' : '💀 You fall in battle... and wake up at home, aching but alive.') :
    reason === 'stalemate' ? '🏳️ The battle drags on forever — you disengage and slip away.' :
    reason === 'done' ? '🏁 Nothing left to fight here.' :
    '🏳️ You retreat in good order.');
  // Falling in battle resets the level: all kill progress there is lost.
  // (Loot, gold and XP are kept — retreat manually to keep progress!) An
  // Arena defeat is different: it doesn't touch the level's own story
  // progress at all (Arena kills never advanced it in the first place,
  // via isEscort) — instead it forfeits that level's Arena challenge for
  // good, per an explicit "one attempt only" request. Arena victory sets
  // the same flag the other way; a manual retreat/stalemate leaves the
  // challenge untouched either way, so backing out mid-fight isn't
  // punished the same way an actual loss is.
  if (reason === 'defeated') {
    if (run.isArena) {
      G.arenaResult[ADV.level] = 'lost';
    } else {
      run.progressLost = G.progress[ADV.level] || 0;
      G.progress[ADV.level] = 0;
      if (run.progressLost) log('sys', `☠️ Defeat wipes your progress here — ${run.progressLost} kills lost. Level ${ADV.level} restarts from the beginning.`);
    }
    // Snapshot the final encounter before ADV/fight get torn down below, so
    // the results modal can show which pack the player fell to (full specs,
    // same fields the live battle arena's enemy cards show) and what the
    // actual killing blow was (fight.lastHit, kept up to date at every
    // player-HP-loss site: enemy basic attacks, DOTs).
    if (ADV.fight) {
      run.killedBy = ADV.fight.enemies.map(e => ({
        name: e.name, tier: e.tier, species: e.species, level: e.level,
        isChapterBoss: !!e.isChapterBoss,
        alive: e.hp > 0, affixes: e.affixes || [],
        hp: Math.max(0, Math.round(e.hp)), maxHp: e.maxHp,
        dmg: e.dmg, spd: e.spd, attack: e.attack, atkType: e.atkType, res: e.res,
      }));
      run.killedByHit = ADV.fight.lastHit || null;
    }
  }
  if (reason === 'arena_won') G.arenaResult[ADV.level] = 'won';
  questEvent('gold', run.gold);   // gold-earning quests tally on return
  G.totals.dmgDealt += run.dmgDealt;
  G.totals.dmgTaken += run.dmgTaken;
  if (reason === 'defeated') G.totals.deaths++;
  if (reason === 'boss') G.totals.bossesKilled++;
  const d = derive();
  G.char.hp = d.maxHp; G.char.mana = d.maxMana; // rest at home
  genShopStock(); // the merchant rotates wares while you were away
  genTavernBoard(); // fresh rumors at the tavern (active quest is kept)
  saveGame();
  UI.showResults(run, ADV.level);
  ADV = null;
  UI.refresh();
}

function stopAdventure() { if (ADV) retreat('manual'); }

function adventureTick() {
  if (!ADV) return;
  const run = ADV.run;
  const level = ADV.level;
  ADV.d = derive(ADV.fight ? sumBuffStats(ADV.fight.buffs) : undefined); // refresh (level-ups / gear changes / active buffs apply live)
  const d = ADV.d;

  // manual potion cooldowns tick down every game tick
  ADV.potCd.hp = Math.max(0, (ADV.potCd.hp || 0) - 1);
  ADV.potCd.mana = Math.max(0, (ADV.potCd.mana || 0) - 1);

  // ---------- between fights: travel & recover ----------
  // Recovery on the road is modest: wounds accumulate, and eventually
  // the hero falls and retreats home with the loot. HP Regen investment
  // directly extends how deep a run goes.
  if (!ADV.fight) {
    // restore whatever speed the player had chosen before a Combat
    // Options "1x Speed" override forced it down for the last encounter
    if (ADV.tempSpeedOverride != null) {
      ADV.speedMs = ADV.tempSpeedOverride;
      ADV.tempSpeedOverride = null;
      clearInterval(advTimer);
      advTimer = setInterval(adventureTick, ADV.speedMs);
    }
    G.char.hp = Math.min(d.maxHp, G.char.hp + d.hpRegen * 1.0);
    G.char.mana = Math.min(d.maxMana, G.char.mana + d.manaRegen * 4);
    const kills = G.progress[level] || 0;
    const tier = nextCreatureTier(kills);
    if (tier === null) { retreat('done'); return; }

    // bonus encounter: the bag-carrying elf (doesn't consume the pattern)
    if (chance(ELF_CHANCE)) {
      const elf = makeElf(level);
      ADV.fight = {
        enemies: [elf], cds: {}, buffs: [], enemyDmgDown: 0, enemyResDown: 0,
        debuffRounds: 0, debuffApplied: false, round: 0, playerGauge: 0,
        playerDots: {}, playerSlow: null, cursedDebuff: null, corrosiveDebuff: null,
        elf: true, elfHits: 0, elfChunks: 0,
      };
      log('encounter', `🧝 A ${elf.name.toUpperCase()} with a bulging bag darts across your path! (5 hits before he escapes!)`, { tier: 'elf' });
      saveGame();
      UI.refreshAdventure();
      return;
    }

    // Non-normal encounters bring a pack of escorts along (sized to fit
    // the battle grid's fixed 6-cell capacity exactly — see TIER_CELLS
    // in ui.js). The player's pack-size setting only scales pure-Normal
    // encounters below; these ranges are fixed regardless of that setting.
    // encounterKind: which of the five configurable kinds (if any) this
    // pack counts as, for the Combat Options pause/speed behavior below.
    // Stays null for plain Normal packs (with no specialty), which aren't
    // configurable.
    let enemies, encounterKind = null;
    if (tier === 'normal' && minibossPossible(level) && chance(minibossChance(level))) {
      const miniboss = makeCreature(level, 'miniboss');
      const escort = Math.random() < 0.20
        ? [makeCreature(level, 'epic')]
        : Array.from({ length: rint(1, 2) }, () => makeCreature(level, 'rare'));
      escort.forEach(e => e.isEscort = true);   // bonus kills — don't consume the 1111 pattern position
      enemies = [miniboss, ...escort];
      encounterKind = 'miniboss';
      log('encounter', `👑 MINI BOSS: ${miniboss.name} (${miniboss.species}, Lv ${level}) prowls out of the wilds, backed by ${escort.length} ${escort[0].tier}!`, { tier: 'miniboss' });
    } else if (tier === 'normal') {
      const packMax = Math.max(1, Math.min(G.settings.packSize, normalsUntilSpecial(kills)));
      enemies = Array.from({ length: packMax }, () => makeCreature(level, 'normal'));
      log('encounter', `⚔️ ${enemies.length > 1 ? enemies.length + ' creatures block your path' : 'A creature blocks your path'}: ${enemies.map(e => e.name).join(', ')}`);
      // "Abnormal" is separate from the Miniboss tier: any creature that
      // independently rolled a specialty (e.g. a plain Normal with
      // Healing) counts, with its own Combat Options slot.
      if (enemies.some(e => e.affixes && e.affixes.length)) encounterKind = 'abnormal';
    } else if (tier === 'rare') {
      const rare = makeCreature(level, 'rare');
      const count = rint(1, 3);
      const escort = Array.from({ length: count }, () => makeCreature(level, 'normal'));
      escort.forEach(e => e.isEscort = true);
      enemies = [rare, ...escort];
      encounterKind = 'rare';
      log('encounter', `🔷 RARE: ${rare.name} (${rare.species}, Lv ${level}) appears, flanked by ${count} creature${count > 1 ? 's' : ''}!`, { tier: 'rare' });
    } else if (tier === 'epic') {
      const epic = makeCreature(level, 'epic');
      const count = rint(2, 4);
      const escortTier = Math.random() < 0.20 ? 'rare' : 'normal';
      const escort = Array.from({ length: count }, () => makeCreature(level, escortTier));
      escort.forEach(e => e.isEscort = true);
      enemies = [epic, ...escort];
      encounterKind = 'epic';
      log('encounter', `🟣 EPIC: ${epic.name} (${epic.species}, Lv ${level}) appears with ${count} ${escortTier} creatures!`, { tier: 'epic' });
    } else {
      const isChapterBoss = isChapterEndLevel(level);
      const boss = makeCreature(level, 'legendary', { isChapterBoss });
      const escort = makeCreature(level, 'epic');
      escort.isEscort = true;
      enemies = [boss, escort];
      encounterKind = 'legendary';
      const label = isChapterBoss ? '👑🩸 CHAPTER BOSS' : '🔶 QUEST BOSS';
      log('encounter', `${label}: ${boss.name} (Lv ${level}) appears, backed by an Epic guardian!`, { tier: 'legendary' });
    }
    ADV.fight = {
      enemies, cds: {}, buffs: [], enemyDmgDown: 0, enemyResDown: 0,
      debuffRounds: 0, debuffApplied: false, round: 0, playerGauge: 0,
      playerDots: {}, playerSlow: null, cursedDebuff: null, corrosiveDebuff: null,
    };
    if (encounterKind) applyEncounterMode(encounterKind);
    saveGame();
    UI.refreshAdventure();
    return;
  }

  // ---------- one combat round ----------
  const f = ADV.fight;
  f.round++;

  // durations tick per round
  for (const k of Object.keys(f.cds)) f.cds[k] = Math.max(0, f.cds[k] - 1);
  f.buffs = f.buffs.filter(b => --b.rounds > 0);
  if (f.debuffRounds > 0 && --f.debuffRounds === 0) {
    f.enemyDmgDown = 0; f.enemyResDown = 0; f.debuffApplied = false;
  }
  if (ADV.scroll > 0) ADV.scroll--;   // power-up scroll burns during combat

  // monster-specialty DOTs/debuffs applied on the player tick down and
  // deal their damage here (poisonous/burning), same cadence as buffs above
  if (f.playerDots) {
    for (const key of Object.keys(f.playerDots)) {
      const dot = f.playerDots[key];
      G.char.hp = Math.max(0, G.char.hp - dot.dmg);
      ADV.run.dmgTaken += dot.dmg;
      f.lastHit = { icon: dot.icon, label: dot.label, amount: dot.dmg };
      log('enemy', `${dot.icon} ${dot.label} deals ${dot.dmg} damage`);
      if (--dot.rounds <= 0) delete f.playerDots[key];
    }
  }
  if (f.playerSlow && --f.playerSlow.rounds <= 0) f.playerSlow = null;
  if (f.cursedDebuff && --f.cursedDebuff.rounds <= 0) f.cursedDebuff = null;
  if (f.corrosiveDebuff && --f.corrosiveDebuff.rounds <= 0) f.corrosiveDebuff = null;

  // Weapon Poison/Slow affixes tick on the enemies carrying them, same
  // cadence as the player's own DOTs above. Enemies dying here are still
  // caught by the "resolve deaths" loop later this round.
  for (const e of f.enemies) {
    if (e.hp <= 0) continue;
    if (e.slow && --e.slow.rounds <= 0) e.slow = null;
    if (e.dots) {
      for (const key of Object.keys(e.dots)) {
        const dot = e.dots[key];
        e.hp -= dot.dmg;
        ADV.run.dmgDealt += dot.dmg;
        log('act', `${dot.icon} ${dot.label} deals ${formatK(dot.dmg)} damage to ${e.name.split(' — ')[0]}`);
        if (--dot.rounds <= 0) delete e.dots[key];
      }
    }
  }

  if (G.char.hp <= 0) { G.char.hp = 0; retreat('defeated'); return; }

  autoUsePotions();

  // Regenerating specialty: passive heal every round regardless of actions,
  // capped at 100% of maxHp in total lifetime healing — once a creature has
  // regenerated its own max HP worth of damage, it stops regenerating.
  for (const e of f.enemies) {
    if (e.hp > 0 && hasAffix(e, 'regen') && (e.regenTotal || 0) < e.maxHp) {
      const heal = Math.min(Math.max(1, Math.round(e.maxHp * 0.03)), e.maxHp - (e.regenTotal || 0));
      e.hp = Math.min(e.maxHp, e.hp + heal);
      e.regenTotal = (e.regenTotal || 0) + heal;
    }
  }

  // ATB gauges: Speed (from Dexterity) fills the gauge; the weapon's
  // attack interval decides how much gauge one swing costs
  f.playerGauge += d.speed * (f.playerSlow ? (1 - f.playerSlow.pct) : 1);
  for (const e of f.enemies) if (e.hp > 0) e.gauge += effectiveEnemySpd(e);

  const queue = [];
  const intv = d.atkInterval || 100;
  while (f.playerGauge >= intv) { f.playerGauge -= intv; queue.push({ who: 'player', g: (f.playerGauge + intv) / intv * 100 }); }
  for (const e of f.enemies) {
    if (e.hp <= 0) continue;
    while (e.gauge >= 100) { e.gauge -= 100; queue.push({ who: e, g: e.gauge + 100 }); }
  }
  queue.sort((a, b) => b.g - a.g);

  for (const a of queue) {
    if (G.char.hp <= 0) break;
    if (a.who === 'player') playerAct(f);
    else enemyAct(f, a.who);
  }

  // mana trickles back in combat; HP does not — wounds are wounds
  G.char.mana = Math.min(d.maxMana, G.char.mana + d.manaRegen * 0.3);

  // --- elf encounter: bag drops per 25% HP lost, escape after 5 hits ---
  if (f.elf) {
    const e = f.enemies[0];
    const lost = (e.maxHp - Math.max(0, e.hp)) / e.maxHp;
    while (f.elfChunks < 3 && lost >= 0.25 * (f.elfChunks + 1)) {
      f.elfChunks++;
      dropItem(ADV.level, elfChunkRarity(e.elfType), run);
      log('loot', `🧝 Something shakes loose from the elf's bag! (${f.elfChunks * 25}% battered)`);
    }
    if (e.hp <= 0) {
      dropItem(ADV.level, elfKillRarity(e.elfType), run);
      gainXp(e.xp, run); run.xp += e.xp;
      log('kill', `🧝 The elf collapses — his whole bag spills open!`, { tier: 'elf' });
      ADV.fight = null;
      questEvent('elf_encounter');
    } else if (f.elfHits >= 5) {
      log('sys', `🧝 After 5 hits the elf scurries off laughing, bag ${Math.round(lost * 100)}% lighter.`);
      ADV.fight = null;
      questEvent('elf_encounter');
    }
    saveGame();
    UI.refreshAdventure();
    return;
  }

  // resolve deaths
  for (const e of f.enemies) if (e.hp <= 0 && !e.dead) {
    handleKill(e, run);
  }

  if (G.char.hp <= 0) { G.char.hp = 0; retreat('defeated'); return; }

  if (!f.enemies.some(e => e.hp > 0)) {
    const wasBoss = f.enemies.some(e => e.tier === 'legendary');
    ADV.fight = null;
    if (ADV.isArena) {
      grantArenaReward(level, run);
      retreat('arena_won');
      return;
    }
    if (wasBoss) {
      G.bossKilled[level] = true;
      if (level < MAX_LEVEL_AREA && G.unlocked <= level) {
        G.unlocked = level + 1;
        const nextInfo = areaInfo(level + 1);
        const enteringNewChapter = chapterNumOf(level + 1) !== chapterNumOf(level);
        log('sys', `🗺️ Quest ${nextInfo.questNum} unlocked: ${nextInfo.quest.name} — ${nextInfo.location}${enteringNewChapter ? ` (${chapterData(level + 1).title} begins!)` : '!'}`);
      }
      run.bossDefeated = true;
      grantPartClearReward(level, run);
      G.progress[level] = 0;   // cleared areas can be run again from the start
      log('sys', `♻️ ${areaInfo(level).location} can be adventured again from the beginning.`);
      retreat('boss');
      return;
    }
    saveGame();
  } else if (f.round > 400) {
    retreat('stalemate');
    return;
  }

  UI.refreshAdventure();
}

// misc
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ------------------------------------------------------------
// Cheat console — reachable only via a hidden UI gesture (see ui.js,
// UI.trackCheatSequence/UI.showCheatDialog/UI.submitCheatCode). Deliberately
// undocumented in DATA.CHANGELOG/VERSION.md/any in-game help per the request
// that created this; each function just returns {ok, msg} for the dialog's
// toast rather than logging to the adventure log.
// ------------------------------------------------------------
function cheatGiveXpToLevel(target) {
  target = Math.max(1, Math.min(999, Math.round(target) || 0));
  const c = G.char;
  if (target <= c.level) return { ok: false, msg: `Already level ${c.level}` };
  // Leveled up one rank at a time (rather than adding one huge precomputed
  // sum) so float rounding on the astronomically large late-game XP curve
  // can't accumulate across hundreds of terms and land a level short.
  let guard = 0;
  while (c.level < target && guard++ < 2000) {
    gainXp(Math.max(0, xpForLevel(c.level) - c.xp));
  }
  saveGame(); UI.refresh();
  return { ok: true, msg: `Leveled up to ${c.level}` };
}

function cheatGoToArea(target) {
  target = Math.max(1, Math.min(MAX_LEVEL_AREA, Math.round(target) || 0));
  if (ADV) return { ok: false, msg: 'Retreat from your current adventure first' };
  G.unlocked = Math.max(G.unlocked, target);
  G.area = target;
  saveGame(); UI.refresh();
  const info = areaInfo(target);
  return { ok: true, msg: `Warped to Chapter ${chapterNumOf(target)}, Quest ${info.questNum}: ${info.location}` };
}

function cheatFillLegendaryGear() {
  const ilvl = Math.max(1, G.area);
  const cls = G.char.cls;
  const eq = G.char.equip;
  const replaced = [];
  for (const slot of ['weapon', 'offhand', 'helmet', 'amulet', 'armor', 'cloak', 'belt', 'gloves', 'pants', 'boots']) {
    if (eq[slot]) replaced.push(eq[slot]);
    eq[slot] = makeItem(ilvl, 'legendary', cls, slot);
  }
  if (eq.ring1) replaced.push(eq.ring1);
  eq.ring1 = makeItem(ilvl, 'legendary', cls, 'ring');
  if (eq.ring2) replaced.push(eq.ring2);
  eq.ring2 = makeItem(ilvl, 'legendary', cls, 'ring');
  G.inventory.push(...replaced);   // bumped gear isn't destroyed, just unequipped
  clampVitals(); saveGame(); UI.refresh();
  return { ok: true, msg: `Equipped legendary gear (ilvl ${ilvl}) in every slot` };
}

function cheatGiveRunes(count) {
  count = Math.max(1, Math.min(100, Math.round(count) || 0));
  const ilvl = Math.max(1, G.area);
  for (let i = 0; i < count; i++) G.inventory.push(makeRune(ilvl, 'legendary'));
  saveGame(); UI.refresh();
  return { ok: true, msg: `Added ${count} rune${count > 1 ? 's' : ''} to your inventory` };
}
