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
const MAX_RANK = 5;

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
// Monster tiers used by the auto-use tier checkboxes and encounter-mode
// settings. "Abnormal" is this game's player-facing name for Miniboss.
const AUTO_USE_TIERS = ['normal', 'miniboss', 'rare', 'epic', 'legendary'];
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
      name: cls.heroName,
      level: 1, xp: 0,
      statPoints: 0, skillPoints: 1,
      stats: { ...cls.baseStats },
      skills: { [Object.values(DATA.SKILLS[clsId]).find(s => s.cat === 'basic').id]: 1 },
      equip: {},   // slot -> item
      hp: 0, mana: 0, // set after derive
      kills: 0,
    },
    gold: 25,
    potions: { hp: 2, mana: 1 },   // drinkable stock — capped by potionCapacity(); used manually in combat
    inventory: [],       // items + runes
    area: 1,             // selected area level
    unlocked: 1,         // highest unlocked area
    progress: {},        // areaLevel -> kills in that level (0..1111)
    bossKilled: {},      // areaLevel -> true
    totals: { adventures: 0, kills: { normal: 0, rare: 0, epic: 0, miniboss: 0, legendary: 0 } },
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
  if (!G.potions) G.potions = { hp: 0, mana: 0 };
  if (!G.shop || !G.shop.stock) genShopStock();
  // old saves carry quests with a baked-in "reward" object instead of
  // the current "rewardSpec" — those can't be displayed or claimed
  // under the new schema, so just reroll the board (and drop whatever
  // quest was active; nothing was owed on it since rewards weren't
  // claimable-on-demand before this).
  if (!G.tavern || (G.tavern.active && !G.tavern.active.rewardSpec) || (G.tavern.board || []).some(q => !q.rewardSpec)) {
    G.tavern = { board: [], active: null };
    genTavernBoard();
  }
  return true;
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
  return Math.min(rank + bonus, MAX_RANK + 3);
}

function equippedItems() { return Object.values(G.char.equip).filter(Boolean); }
function allAffixesOf(item) {
  const out = [...(item.affixes || [])];
  for (const r of (item.runes || [])) out.push(...r.bonuses);
  return out;
}

function derive() {
  const c = G.char;
  const cls = DATA.CLASSES[c.cls];
  const d = {
    str: c.stats.str, dex: c.stats.dex, int: c.stats.int,
    armor: 0, evasion: 0, speed: 0,
    hpFlat: 0, manaFlat: 0, hpPct: 0, manaPct: 0,
    hpRegen: 0, manaRegen: 0, lifesteal: 0, manasteal: 0,
    dmgFlat: 0, dmgPct: 0, dr: 0,
    res: { phys: 0, magic: 0, poison: 0 },
    enemyResDown: 0,
    weaponMin: 1, weaponMax: 2, weaponMagic: false, weaponSpd: 0,
    weaponPoison: null, weaponSlow: null,
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
      }
    }
  }
  // weapons
  const w = c.equip.weapon, oh = c.equip.offhand;
  let wMin = 0, wMax = 0;
  if (w) { wMin += w.dmgMin; wMax += w.dmgMax; d.weaponMagic = !!w.magic; }
  if (oh && oh.dmgMin) { wMin += Math.round(oh.dmgMin * 0.6); wMax += Math.round(oh.dmgMax * 0.6); }
  if (wMin > 0) { d.weaponMin = wMin; d.weaponMax = wMax; }
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
  }

  // MAIN STATS drive the important stats:
  d.maxHp = Math.round((50 + d.str * 9 + c.level * 8 + d.hpFlat) * (1 + d.hpPct));
  d.speed = Math.round(10 + d.dex * 2 + d.speed + d.weaponSpd);
  d.maxMana = Math.round((20 + d.int * 7 + c.level * 3 + d.manaFlat) * (1 + d.manaPct));
  // sub stats
  // Life Regen is 3x (200% more) as effective as its old formula.
  d.hpRegen = +((1 + d.str * 0.2 + d.hpRegen) * 0.2 * 3).toFixed(1);
  d.evasion = Math.min(60, +(d.dex * 0.1 + d.evasion).toFixed(1));
  d.manaRegen = +((1 + d.int * 0.4 + d.manaRegen) * 0.5).toFixed(1);
  // caps
  d.res.phys = Math.min(75, d.res.phys); d.res.magic = Math.min(75, d.res.magic); d.res.poison = Math.min(75, d.res.poison);
  d.dr = Math.min(0.6, d.dr);
  d.lifesteal = Math.min(10, d.lifesteal);
  d.manasteal = Math.min(10, d.manasteal);
  // base damage: weapon + main stat scaling; the class's main stat
  // additionally grants +1% damage per point
  const main = { warrior: d.str, rogue: d.dex, mage: d.int }[c.cls];
  const mainMult = 1 + main * 0.01;
  d.mainStatDmgPct = main;
  d.baseDmgMin = Math.round((d.weaponMin + main * 0.9) * (1 + d.dmgPct) * mainMult);
  d.baseDmgMax = Math.round((d.weaponMax + main * 1.1) * (1 + d.dmgPct) * mainMult);
  return d;
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

function gainXp(amount, run) {
  const c = G.char;
  c.xp += amount;
  let ups = 0;
  while (c.xp >= xpForLevel(c.level)) {
    c.xp -= xpForLevel(c.level);
    c.level++; ups++;
    c.statPoints += 3; c.skillPoints += 1;
  }
  if (ups && run) run.levelUps += ups;
  return ups;
}

function spendStat(stat) {
  if (G.char.statPoints <= 0) return;
  G.char.statPoints--; G.char.stats[stat]++;
  clampVitals(); saveGame(); UI.refresh();
}

function canLearn(skill) {
  const c = G.char;
  const cur = c.skills[skill.id] || 0;
  if (cur >= MAX_RANK) return { ok: false, why: 'Max rank' };
  if (c.skillPoints <= 0) return { ok: false, why: 'No skill points' };
  if (c.level < skill.minLvl) return { ok: false, why: `Requires level ${skill.minLvl}` };
  if (skill.req && !(c.skills[skill.req] > 0)) {
    return { ok: false, why: `Requires ${DATA.SKILLS[c.cls][skill.req].name}` };
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

function clampVitals() {
  const d = derive();
  G.char.hp = Math.min(G.char.hp, d.maxHp);
  G.char.mana = Math.min(G.char.mana, d.maxMana);
}

// ------------------------------------------------------------
// Items
// ------------------------------------------------------------
// Items grow +25% per level, matching monster scaling (see bigScale).
function itemScale(ilvl) { return bigScale(ilvl); }

// All skill mana costs are tripled — mana is a scarce resource.
// Mage spells get a 30% discount on that.
const MANA_COST_MULT = 3;
function skillCost(s) {
  const mult = s.id && s.id.startsWith('m_') ? MANA_COST_MULT * 0.7 : MANA_COST_MULT;
  return Math.round((s.cost ? s.cost() : 0) * mult);
}

const RARITY_ORDER = { normal: 0, magical: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
function rollAffixes(count, ilvl, clsId, item) {
  const out = [];
  const used = new Set();
  // Gated affixes (e.g. Vampiric: weapon-only, epic+) only enter the
  // pool when the caller passes the item they're rolling for and it
  // qualifies — runes (no item passed) never roll them.
  const pool = DATA.AFFIXES.filter(a => {
    if (a.weaponOnly && (!item || item.slot !== 'weapon')) return false;
    if (a.minRarity && (!item || RARITY_ORDER[item.rarity] < RARITY_ORDER[a.minRarity])) return false;
    if (a.slots && (!item || !a.slots.includes(item.slot))) return false;
    return true;
  });
  const totalW = pool.reduce((s, a) => s + a.w, 0);
  let guard = 0;
  while (out.length < count && guard++ < 200) {
    let roll = Math.random() * totalW, af = pool[0];
    for (const a of pool) { roll -= a.w; if (roll <= 0) { af = a; break; } }
    if (used.has(af.id) && af.id !== 'skill') continue;
    used.add(af.id);
    const entry = { id: af.id, v: af.roll(ilvl) };
    if (af.id === 'skill') {
      const skills = Object.values(DATA.SKILLS[clsId || G?.char?.cls || 'warrior']);
      const s = pick(skills);
      entry.skillId = s.id; entry.skillName = s.name;
    }
    out.push(entry);
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

// Potion capacity a belt grants (applies equally to HP and Mana slots),
// tiered by the belt's item level: low levels 1-3, mid 2-6, high 4-8.
function beltPotionCap(ilvl) {
  if (ilvl <= 33) return rint(1, 3);
  if (ilvl <= 66) return rint(2, 6);
  return rint(4, 8);
}

function makeItem(ilvl, rarity, clsHint) {
  const scale = itemScale(ilvl);
  const rar = DATA.RARITIES[rarity];
  const it = { uid: G ? G.itemSeq++ : rint(1, 1e9), ilvl, rarity, runes: [], sockets: 0, type: 'item' };
  const roll = Math.random();

  if (roll < 0.30) { // weapon — damage rides the steeper dmgScale curve
    const base = pick(DATA.WEAPON_BASES);
    it.slot = 'weapon'; it.base = base.id; it.icon = base.icon;
    it.baseName = base.name; it.hands = base.hands; it.classes = base.classes; it.magic = !!base.magic;
    it.atkSpd = base.atkSpd || 1;
    it.dmgMin = Math.max(1, Math.round(base.dmg[0] * dmgScale(ilvl) * rar.mult));
    it.dmgMax = Math.max(2, Math.round(base.dmg[1] * dmgScale(ilvl) * rar.mult));
    it.sockets = rollSockets();
  } else if (roll < 0.42) { // offhand
    const base = pick(DATA.OFFHAND_BASES);
    it.slot = 'offhand'; it.base = base.id; it.icon = base.icon;
    it.baseName = base.name; it.classes = base.classes; it.weight = base.weight || null; it.magic = !!base.magic;
    if (base.armor) it.armor = Math.max(1, Math.round(base.armor * scale * rar.mult));
    if (base.dmg) {
      it.dmgMin = Math.max(1, Math.round(base.dmg[0] * dmgScale(ilvl) * rar.mult));
      it.dmgMax = Math.max(1, Math.round(base.dmg[1] * dmgScale(ilvl) * rar.mult));
    }
    it.sockets = rollSockets();
  } else if (roll < 0.80) { // armor piece
    const slot = pick(['helmet', 'armor', 'gloves', 'pants', 'boots']);
    const weight = pick(['heavy', 'medium', 'light']);
    const base = DATA.ARMOR_BASES[slot][weight];
    it.slot = slot; it.base = `${slot}_${weight}`; it.icon = DATA.ARMOR_ICONS[slot];
    it.baseName = base.name; it.weight = weight;
    it.armor = Math.max(1, Math.round(base.armor * scale * rar.mult));
    if (slot === 'helmet' || slot === 'armor') it.sockets = rollSockets();
  } else { // jewelry: amulet / ring / cloak / belt
    const kind = pick(['amulet', 'ring', 'ring', 'cloak', 'belt']);
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
  it.affixes = rollAffixes(rint(aMin, aMax), ilvl, clsHint, it);
  it.name = buildItemName(it);
  it.value = Math.max(1, Math.round((2 + ilvl * 1.5) * DATA.RARITIES[it.rarity].value));
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

// Rune tiers, by bonus count, ascending: Faded(1) < Rune(2) < Rare(3) <
// Epic(4) < Legendary(5) < Mythic(6, the ultimate tier — a rare shot
// off any legendary-creature drop). Bonus-count range depends on which
// creature tier dropped it.
const RUNE_BONUS_RANGE = { normal: [1, 1], rare: [1, 2], epic: [1, 3], miniboss: [2, 4], legendary: [3, 5] };
const RUNE_TIERS = {
  1: { baseName: 'Faded Rune', rarity: 'normal' },
  2: { baseName: 'Rune', rarity: 'magical' },
  3: { baseName: 'Rare Rune', rarity: 'rare' },
  4: { baseName: 'Epic Rune', rarity: 'epic' },
  5: { baseName: 'Legendary Rune', rarity: 'legendary' },
  6: { baseName: 'Mythic Rune', rarity: 'mythic' },
};
// Prefix/suffix are generated from randomly chosen bonus stats.
function makeRune(ilvl, source) {
  const range = RUNE_BONUS_RANGE[source] || RUNE_BONUS_RANGE.normal;
  let n = rint(...range);
  if (source === 'legendary' && chance(0.08)) n = 6;   // rare shot at the ultimate Mythic tier
  const tier = RUNE_TIERS[n];
  const bonuses = rollAffixes(n, ilvl);
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
  G.gold += G.inventory[idx].value;
  G.inventory.splice(idx, 1);
  saveGame(); UI.refresh();
}

// Bulk selling. kind: 'all' (every unequipped item) | 'junk' (normal+magical)
// | 'unusable' | 'rare' | 'epic' | 'legendary'
function sellMatches(kind) {
  return G.inventory.filter(i => {
    if (i.type !== 'item') return false;   // runes are never bulk-sold
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

// 2% legendary, 13% epic, 20% rare, 30% magical, 35% normal
function shopRollRarity() {
  const r = Math.random() * 100;
  if (r < 2) return 'legendary';
  if (r < 15) return 'epic';
  if (r < 35) return 'rare';
  if (r < 65) return 'magical';
  return 'normal';
}

function genShopStock() {
  const stock = [];
  for (let i = 0; i < 20; i++) {
    let it = null;
    // bias the merchant toward things this hero can actually wear
    for (let t = 0; t < 5; t++) {
      it = makeItem(shopIlvl(), shopRollRarity(), G.char.cls);
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
// Tavern — 3 random quests on the board, one active at a time.
// The board refreshes with new rumors every time you return home.
// ------------------------------------------------------------
// Reward gold/xp scale off the CURRENT chapter & part (area level) —
// computed fresh whenever a quest becomes ready to claim, not baked in
// at the moment it was picked up off the board. "mult" is per-quest
// flavor (how generous that quest type is relative to the others).
function questRewardAmounts(goldMult, xpMult) {
  const u = Math.max(1, G.area);
  return {
    gold: goldMult ? Math.round(goldMult * (10 + u * 12) * (0.8 + Math.random() * 0.4)) : 0,
    xp: xpMult ? Math.round(xpMult * (8 + u * 6) * (0.85 + Math.random() * 0.3)) : 0,
  };
}
// Same formula with the random jitter fixed at its midpoint — a stable
// "roughly this much" preview for quests not yet ready to claim, so
// the board doesn't visibly flicker on every re-render.
function questRewardPreview(goldMult, xpMult) {
  const u = Math.max(1, G.area);
  return {
    gold: goldMult ? Math.round(goldMult * (10 + u * 12)) : 0,
    xp: xpMult ? Math.round(xpMult * (8 + u * 6)) : 0,
  };
}

function genQuest() {
  const u = Math.max(1, G.area);
  const goldR = n => Math.round(n * (10 + u * 12) * (0.8 + Math.random() * 0.4));
  const makers = [
    () => { const n = rint(30, 60); return { type: 'kill_normal', icon: '🗡️', name: 'The Culling', desc: `The village elder begs for relief: slay ${n} common creatures.`, target: n, rewardSpec: { goldMult: 3, xpMult: 3 } }; },
    () => { const n = rint(4, 8); return { type: 'kill_rare', icon: '📜', name: 'Bounty Board', desc: `Wanted posters flutter in the wind: bring down ${n} RARE creatures.`, target: n, rewardSpec: { goldMult: 4, xpMult: 4, item: 'rare' } }; },
    () => { const n = rint(1, 2); return { type: 'kill_epic', icon: '🏆', name: 'Trophy Hunter', desc: `A wealthy collector pays handsomely for proof of ${n} EPIC kill${n > 1 ? 's' : ''}.`, target: n, rewardSpec: { goldMult: 5, xpMult: 5, item: 'rare' } }; },
    () => { const n = rint(5, 9); return { type: 'item_magic', icon: '💎', name: 'The Collector', desc: `A shady dealer in the corner wants ${n} magical-or-better items found on adventure.`, target: n, rewardSpec: { goldMult: 6, xpMult: 6 } }; },
    () => { const n = rint(3, 6); return { type: 'potion', icon: '🧪', name: 'Potion Tester', desc: `The alchemist needs field data: drink ${n} potions while adventuring.`, target: n, rewardSpec: { goldMult: 3, xpMult: 3, item: 'magical' } }; },
    () => { const n = goldR(8); return { type: 'gold', icon: '🪙', name: 'Debt of Honor', desc: `The barkeep owes dangerous people. Earn ${n.toLocaleString()} gold on adventures to bail him out.`, target: n, rewardSpec: { goldMult: 0, xpMult: 7, item: 'epic' } }; },
    () => { return { type: 'kill_legendary', icon: '🔶', name: 'Head of the Beast', desc: 'A hooded stranger slides a map across the table: slay a LEGENDARY level boss. Any will do.', target: 1, rewardSpec: { goldMult: 10, xpMult: 10, item: 'epic' } }; },
    () => { return { type: 'kill_miniboss', icon: '👑', name: 'Crownsnatcher', desc: 'Rumors tell of crowned beasts prowling the back half of a chapter (levels 5+). Slay a MINI BOSS.', target: 1, rewardSpec: { goldMult: 6, xpMult: 6, item: 'rare' } }; },
  ];
  return Object.assign(pick(makers)(), { progress: 0, ready: false });
}

function genTavernBoard() {
  const board = [];
  const seen = new Set();
  let guard = 0;
  while (board.length < 3 && guard++ < 40) {
    const q = genQuest();
    if (seen.has(q.type)) continue;
    seen.add(q.type);
    board.push(q);
  }
  if (!G.tavern) G.tavern = { board, active: null };
  else G.tavern.board = board;
}

function acceptQuest(idx) {
  if (!G.tavern || G.tavern.active) return;
  const q = G.tavern.board[idx];
  if (!q) return;
  G.tavern.active = q;
  G.tavern.board.splice(idx, 1);
  saveGame(); UI.refresh();
  UI.toast(`Quest accepted: ${q.name}`);
}

function abandonQuest() {
  if (!G.tavern || !G.tavern.active) return;
  G.tavern.active = null;
  genTavernBoard();
  saveGame(); UI.refresh();
}

function questEvent(kind, amt) {
  const q = G.tavern && G.tavern.active;
  if (!q || q.type !== kind || q.ready) return;
  q.progress = (q.progress || 0) + (amt || 1);
  if (q.progress >= q.target) markQuestReady();
}

// The task is done, but the reward isn't granted automatically anymore —
// lock in gold/XP against the CURRENT chapter & part (area level) right
// now, and let the player claim it manually from the tavern.
function markQuestReady() {
  const q = G.tavern.active;
  q.ready = true;
  q.finalReward = questRewardAmounts(q.rewardSpec.goldMult, q.rewardSpec.xpMult);
  q.finalReward.item = q.rewardSpec.item || null;
  q.finalArea = G.area;
  saveGame();
  UI.toast(`🍺 Quest ready: "${q.name}" — claim your reward at the tavern!`);
}

function claimQuestReward() {
  if (!G.tavern || !G.tavern.active || !G.tavern.active.ready) return;
  const q = G.tavern.active;
  const r = q.finalReward;
  const parts = [];
  if (r.gold) { G.gold += r.gold; parts.push(`🪙 ${r.gold.toLocaleString()}`); }
  if (r.xp) {
    const ups = gainXp(r.xp);
    parts.push(`✨ ${r.xp.toLocaleString()} XP`);
    if (ups) log('sys', `🎉 LEVEL UP! You are now level ${G.char.level} (+3 stat, +1 skill point)`);
  }
  if (r.item) {
    const it = makeItem(Math.max(1, q.finalArea || G.area), r.item, G.char.cls);
    G.inventory.push(it);
    parts.push(`${it.icon} ${it.name} (${r.item})`);
  }
  log('sys', `🍺 QUEST COMPLETE: "${q.name}"! Reward: ${parts.join(' + ')}`);
  G.tavern.active = null;
  genTavernBoard();
  saveGame();
  UI.refresh();
  UI.toast(`🍺 Quest complete: ${q.name}!`);
}

function restockShop() {
  const cost = restockCost();
  if (G.gold < cost) { UI.toast('Not enough gold!'); return; }
  G.gold -= cost;
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
  G.inventory.push(item);
  run.partReward = { gold, item };
  log('loot', `🎁 Quest reward: 🪙 ${gold.toLocaleString()} + ${item.icon} ${item.name}`);
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

// Monsters gain +50% HP and +20% damage for every level, compounding.
function enemyHpScale(level) { return Math.pow(1.5, Math.max(0, level - 1)); }
function enemyDmgScale(level) { return Math.pow(1.2, Math.max(0, level - 1)); }

const TIER_CONF = {
  normal:    { hp: 1.0, dmg: 1.0, spd: 1.0, xp: 1, gold: 1 },
  rare:      { hp: 3.2, dmg: 1.5, spd: 1.1, xp: 6, gold: 5 },
  epic:      { hp: 9, dmg: 2.4, spd: 1.2, xp: 25, gold: 20 },
  miniboss:  { hp: 15, dmg: 3.0, spd: 1.25, xp: 55, gold: 45 },
  legendary: { hp: 28, dmg: 3.8, spd: 1.35, xp: 120, gold: 100 },
};

// A single scalar for "how tough is this dungeon level", deliberately
// independent of any specific creature's rolled maxHp/dmg (which vary by
// species/RNG/tier) and of the player's own damage output. Ward-style
// specialties (Explosive, Reflective) key off this instead, so their
// damage scales with the level the player is on rather than snowballing
// with player gear, a lucky enemy roll, or that specific enemy's tier HP.
function levelDifficulty(level) { return 11.7 * enemyDmgScale(level); }
// Explosive/Reflective ward damage still scales up for tougher company —
// applied on top of levelDifficulty, not blended with TIER_CONF.dmg.
const WARD_TIER_MULT = { rare: 1.5, epic: 1.75, legendary: 2, miniboss: 2 };

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

function makeCreature(level, tier, opts) {
  const info = areaInfo(level);
  // The quest's Legendary boss is the story's named creature for that
  // quest — fixed name, stats and hand-picked specialties from data.js.
  const isQuestBoss = tier === 'legendary';
  const base = isQuestBoss ? info.quest.boss : pick(creaturesForLevel(level));
  const conf = TIER_CONF[tier];
  const c = {
    tier, level,
    species: base.name, attack: base.attack, atkType: base.atkType,
    res: { ...base.res },
    maxHp: Math.max(5, Math.round(39 * base.hp * enemyHpScale(level) * conf.hp * (0.9 + Math.random() * 0.2))),
    dmg: Math.max(1, Math.round(11.7 * base.dmg * enemyDmgScale(level) * conf.dmg * (0.9 + Math.random() * 0.2))),
    spd: Math.round((16 + 9 * base.spd + level * 0.4) * conf.spd),
    xp: Math.max(1, Math.round((4 + level * 2.2) * conf.xp)),   // x10 vs previous (was /10)
    gauge: 0, stunned: 0, dead: false,
  };
  c.hp = c.maxHp;
  if (tier === 'normal') c.name = base.name;
  else if (tier === 'rare') { c.name = rareName(info.chapter); }
  else if (isQuestBoss) { c.name = base.name; c.isChapterBoss = isChapterEndLevel(level); }
  else { c.name = bossName(info.chapter); }
  if (tier !== 'normal') {
    for (const k of Object.keys(c.res)) c.res[k] = Math.min(70, c.res[k] + { rare: 5, epic: 10, miniboss: 12, legendary: 15 }[tier]);
  }
  // Quest bosses use their story-picked specialties; everything else rolls.
  c.affixes = isQuestBoss ? (base.specialties || []).slice() : rollSpecialties(tier, opts && opts.isChapterBoss);
  applyAffixStatMods(c);
  return c;
}

// ------------------------------------------------------------
// Loot
// ------------------------------------------------------------
function rollItemRarity(tier) {
  const r = Math.random() * 100;
  switch (tier) {
    case 'legendary':
      if (r < 25) return 'legendary';
      if (r < 50) return 'epic';
      if (r < 75) return 'rare';
      return 'magical';
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
  const goldBase = Math.round((2 + lvl * 1.6) * TIER_CONF[tier].gold * (0.7 + Math.random() * 0.6));

  // Rune roll is independent (legendary: 10% per spec)
  if (chance(RUNE_CHANCE[tier])) {
    const rune = makeRune(lvl, tier);
    run.items.push(rune); G.inventory.push(rune);
    log('loot', `🪨 A ${rune.name} drops! (${rune.bonuses.length} bonus${rune.bonuses.length > 1 ? 'es' : ''})`);
  }

  if (tier === 'legendary' || tier === 'miniboss') {
    run.gold += goldBase; G.gold += goldBase;
    const r = Math.random() * 100;
    if (r < 75) dropItem(lvl, rollItemRarity(tier), run);
    else gainPotion(pick(['hp', 'mana', 'scroll']), run);
  } else {
    const r = Math.random() * 100;
    const T = {
      normal: { gold: 42, item: 12, hpPot: 4, manaPot: 3.5, buffPot: 0.35 },
      rare:   { gold: 55, item: 25, hpPot: 3.5, manaPot: 3, buffPot: 1.4 },
      epic:   { gold: 55, item: 32, hpPot: 2.5, manaPot: 2.2, buffPot: 2 },
    }[tier];
    let acc = 0;
    if (r < (acc += T.gold)) { run.gold += goldBase; G.gold += goldBase; }
    else if (r < (acc += T.item)) { dropItem(lvl, rollItemRarity(tier), run); }
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
      if (chance(chanceEach)) dropItem(lvl, rollItemRarity(tier), run);
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

function dropItem(lvl, rarity, run) {
  const it = makeItem(lvl, rarity, G.char.cls);
  if (rarity !== 'normal') questEvent('item_magic');
  if (shouldAutoSell(it)) {
    run.gold += it.value; G.gold += it.value;
    log('loot', `🪙 Auto-sold ${it.icon} ${it.name} for ${it.value.toLocaleString()} gold.`);
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
function necroticActive(fight) { return fight.enemies.some(e => e.hp > 0 && hasAffix(e, 'necrotic')); }

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
  enemy.hp -= dmg;
  ADV.run.dmgDealt += dmg;
  if (d.lifesteal) G.char.hp = Math.min(d.maxHp, G.char.hp + Math.max(1, Math.round(dmg * (d.lifesteal / 100))));
  if (d.manasteal) G.char.mana = Math.min(d.maxMana, G.char.mana + Math.max(1, Math.round(dmg * (d.manasteal / 100))));
  if (d.weaponPoison && chance(0.3)) {
    if (!enemy.dots) enemy.dots = {};
    enemy.dots.weaponPoison = { icon: '☠️', label: 'Poison', dmg: d.weaponPoison.dmg, rounds: d.weaponPoison.rounds };
  }
  if (d.weaponSlow && chance(d.weaponSlow.chance / 100)) {
    enemy.slow = { pct: d.weaponSlow.pct / 100, rounds: d.weaponSlow.rounds };
  }
  if (hasAffix(enemy, 'reflective')) {
    const reflect = Math.max(1, Math.round(levelDifficulty(enemy.level) * (WARD_TIER_MULT[enemy.tier] || 1)));
    G.char.hp -= reflect;
    ADV.run.dmgTaken += reflect;
    fight.lastHit = { icon: '🪞', label: `${enemy.name.split(' — ')[0]}'s reflective ward`, amount: reflect };
    log('enemy', `🪞 ${enemy.name.split(' — ')[0]}'s reflective ward sends ${reflect} damage back at you!`);
  }
  if (enemy.tier === 'elf') fight.elfHits = (fight.elfHits || 0) + 1;
  return dmg;
}

function enemyHit(fight, enemy) {
  const d = ADV.d;
  if (Math.random() * 100 < d.evasion) return { dodged: true, dmg: 0 };
  let raw = effectiveEnemyDmg(enemy) * (0.85 + Math.random() * 0.3);
  if (fight.enemyDmgDown) raw *= (1 - fight.enemyDmgDown);
  const resKey = enemy.atkType === 'magic' ? 'magic' : enemy.atkType === 'poison' ? 'poison' : 'phys';
  let dmg = raw * (1 - d.res[resKey] / 100);
  if (enemy.atkType === 'phys') {
    const armor = d.armor * (1 - (fight.corrosiveDebuff ? fight.corrosiveDebuff.armorDown : 0));
    const armorRed = armor / (armor + 40 + 8 * enemy.level);
    dmg *= (1 - armorRed);
  }
  dmg *= (1 - d.dr);
  if (hasAffix(enemy, 'magical')) dmg += raw * (0.15 + Math.random() * 0.15);
  dmg = Math.max(1, Math.round(dmg));
  G.char.hp -= dmg;
  ADV.run.dmgTaken += dmg;
  fight.lastHit = { icon: '🩸', label: `${enemy.name.split(' — ')[0]}'s ${enemy.attack}`, amount: dmg };
  if (hasAffix(enemy, 'vampiric')) enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.max(1, Math.round(dmg * 0.25)));
  if (hasAffix(enemy, 'poisonous')) {
    fight.playerDots.poison = { icon: '☠️', label: `${enemy.name.split(' — ')[0]}'s poison`, dmg: Math.max(1, Math.round(enemy.dmg * 0.12)), rounds: 3 };
  }
  if (hasAffix(enemy, 'burning') && Math.random() < 0.25) {
    fight.playerDots.burning = { icon: '🔥', label: 'Burning', dmg: Math.max(1, Math.round(enemy.dmg * 0.15)), rounds: 3 };
  }
  if (hasAffix(enemy, 'frozen') && Math.random() < 0.25) fight.playerSlow = { pct: 0.30, rounds: 2 };
  if (hasAffix(enemy, 'cursed')) fight.cursedDebuff = { dmgDown: 0.12, rounds: 3 };
  if (hasAffix(enemy, 'corrosive')) fight.corrosiveDebuff = { armorDown: 0.20, rounds: 3 };
  return { dodged: false, dmg };
}

// One player action: pick a skill, resolve it, log it.
function playerAct(fight) {
  const c = G.char;
  const d = ADV.d;
  const attacks = 1 + (fight.buffs.some(b => b.extraHit) ? 1 : 0);
  for (let i = 0; i < attacks; i++) {
    const alive = fight.enemies.filter(e => e.hp > 0);
    if (!alive.length) return;
    const skill = pickSkill(fight);
    const r = effectiveRank(skill.id) || 1;
    const cost = skillCost(skill);
    if (cost) c.mana -= cost;
    if (skill.cd) fight.cds[skill.id] = skill.cd + 1;

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
        parts.push(dmg > 0 ? `${t.name.split(' — ')[0]} for ${dmg.toLocaleString()}` : `${t.name.split(' — ')[0]} (evaded!)`);
        if (skill.stun && dmg > 0 && t.hp > 0) t.stunned = (t.stunned || 0) + skill.stun;
      }
      log('act', `${skill.icon} ${skill.name} hits ${parts.join(', ')}`);
      ADV.lastAction = { side: 'player', icon: skill.icon, txt: `${skill.name} — ${total.toLocaleString()} dmg` };
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
  const hit = enemyHit(fight, e);
  if (hit.dodged) {
    log('enemy', `💨 You dodge ${e.name}'s ${e.attack}!`);
    ADV.lastAction = { side: 'enemy', icon: '💨', txt: `Dodged ${shortName}'s ${e.attack}!` };
  } else {
    log('enemy', `🩸 ${e.name}'s ${e.attack} (${e.atkType}) deals ${hit.dmg.toLocaleString()} damage`);
    ADV.lastAction = { side: 'enemy', icon: '🩸', txt: `${shortName}: ${e.attack} — ${hit.dmg.toLocaleString()} dmg` };
  }
}

function handleKill(e, run) {
  e.dead = true;
  run.kills[e.tier]++;
  G.totals.kills[e.tier]++;
  G.char.kills++;
  // Only the featured creature of an encounter advances the level's
  // 1111 pattern position — escort companions are bonus kills (extra
  // XP/loot/stats) and must NOT push the kill-count past the exact
  // checkpoints (111th = Epic, 1111th = Legendary) that trigger them.
  if (!e.isEscort) G.progress[ADV.level] = (G.progress[ADV.level] || 0) + 1;
  const ups = gainXp(e.xp, run);
  run.xp += e.xp;
  log('kill', `☠️ ${e.name} is slain! (+${e.xp} XP)`, { tier: e.tier });
  rollLoot(e, run);
  questEvent('kill_' + e.tier);
  if (ups) log('sys', `🎉 LEVEL UP! You are now level ${G.char.level} (+3 stat, +1 skill point)`);
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
      gold: 0, xp: 0, items: [], potions: { hp: 0, mana: 0, scroll: 0 },
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
// that independently rolled a specialty (Vampiric, Explosive, etc.) —
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
  clearInterval(advTimer); advTimer = null;
  log('sys', reason === 'boss' ? '🏆 The boss has fallen! You return home in triumph.' :
    reason === 'defeated' ? '💀 You fall in battle... and wake up at home, aching but alive.' :
    reason === 'stalemate' ? '🏳️ The battle drags on forever — you disengage and slip away.' :
    reason === 'done' ? '🏁 Nothing left to fight here.' :
    '🏳️ You retreat in good order.');
  // Falling in battle resets the level: all kill progress there is lost.
  // (Loot, gold and XP are kept — retreat manually to keep progress!)
  if (reason === 'defeated') {
    run.progressLost = G.progress[ADV.level] || 0;
    G.progress[ADV.level] = 0;
    if (run.progressLost) log('sys', `☠️ Defeat wipes your progress here — ${run.progressLost} kills lost. Level ${ADV.level} restarts from the beginning.`);
    // Snapshot the final encounter before ADV/fight get torn down below, so
    // the results modal can show which pack the player fell to (full specs,
    // same fields the live battle arena's enemy cards show) and what the
    // actual killing blow was (fight.lastHit, kept up to date at every
    // player-HP-loss site: enemy basic attacks, DOTs, Explosive, Reflective).
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
  questEvent('gold', run.gold);   // gold-earning quests tally on return
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
  ADV.d = derive(); // refresh (level-ups / gear changes apply live)
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
      // Explosive) counts, with its own Combat Options slot.
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
  // caught by the "resolve deaths" loop later this round (On-death
  // effects like Explosive still fire).
  for (const e of f.enemies) {
    if (e.hp <= 0) continue;
    if (e.slow && --e.slow.rounds <= 0) e.slow = null;
    if (e.dots) {
      for (const key of Object.keys(e.dots)) {
        const dot = e.dots[key];
        e.hp -= dot.dmg;
        ADV.run.dmgDealt += dot.dmg;
        log('act', `${dot.icon} ${dot.label} deals ${dot.dmg.toLocaleString()} damage to ${e.name.split(' — ')[0]}`);
        if (--dot.rounds <= 0) delete e.dots[key];
      }
    }
  }

  if (G.char.hp <= 0) { G.char.hp = 0; retreat('defeated'); return; }

  autoUsePotions();

  // Regenerating specialty: passive heal every round regardless of actions
  for (const e of f.enemies) {
    if (e.hp > 0 && hasAffix(e, 'regen')) e.hp = Math.min(e.maxHp, e.hp + Math.max(1, Math.round(e.maxHp * 0.03)));
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
      const ups = gainXp(e.xp, run); run.xp += e.xp;
      log('kill', `🧝 The elf collapses — his whole bag spills open!`, { tier: 'elf' });
      if (ups) log('sys', `🎉 LEVEL UP! You are now level ${G.char.level} (+3 stat, +1 skill point)`);
      ADV.fight = null;
    } else if (f.elfHits >= 5) {
      log('sys', `🧝 After 5 hits the elf scurries off laughing, bag ${Math.round(lost * 100)}% lighter.`);
      ADV.fight = null;
    }
    saveGame();
    UI.refreshAdventure();
    return;
  }

  // resolve deaths
  for (const e of f.enemies) if (e.hp <= 0 && !e.dead) {
    if (hasAffix(e, 'explosive')) {
      const boom = Math.max(1, Math.round(levelDifficulty(e.level) * (WARD_TIER_MULT[e.tier] || 1)));
      G.char.hp = Math.max(0, G.char.hp - boom);
      ADV.run.dmgTaken += boom;
      f.lastHit = { icon: '💥', label: `${e.name.split(' — ')[0]}'s explosion`, amount: boom };
      log('enemy', `💥 ${e.name.split(' — ')[0]} explodes on death for ${boom} damage!`);
    }
    handleKill(e, run);
  }

  if (G.char.hp <= 0) { G.char.hp = 0; retreat('defeated'); return; }

  if (!f.enemies.some(e => e.hp > 0)) {
    const wasBoss = f.enemies.some(e => e.tier === 'legendary');
    ADV.fight = null;
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
