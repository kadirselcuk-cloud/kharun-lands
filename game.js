// ============================================================
// KHARUN LANDS — Game Engine
// ============================================================
'use strict';

const SAVE_KEY = 'kharun-lands-save-v1';
const MAX_LEVEL_AREA = 100;
const CREATURES_PER_LEVEL = 1111;
const MAX_RANK = 5;

let G = null;          // global game state
let ADV = null;        // active adventure run state
let advTimer = null;
let LOG = [];          // battle log — persists until the NEXT adventure starts

function log(t, txt, extra) {
  LOG.push(Object.assign({ t, txt }, extra || {}));
  if (LOG.length > 600) LOG.splice(0, LOG.length - 600);
}

// ------------------------------------------------------------
// State creation / persistence (localStorage — bigger and more
// reliable than cookies, and never sent over the network)
// ------------------------------------------------------------
function newGame(clsId) {
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
    settings: { packSize: 1, advSpeed: 600, lastAdvLevel: null },
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

function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { /* full/blocked */ } }
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function peekSave() {
  try { const g = JSON.parse(localStorage.getItem(SAVE_KEY)); return g && g.char ? g : null; } catch (e) { return null; }
}
function loadGame() {
  const g = peekSave();
  if (!g) return false;
  G = g;
  if (!G.settings) G.settings = { packSize: 1 };
  if (G.settings.advSpeed === undefined) { G.settings.advSpeed = 600; G.settings.lastAdvLevel = null; }
  if (G.totals && G.totals.kills && G.totals.kills.miniboss === undefined) G.totals.kills.miniboss = 0;
  if (!G.potions) G.potions = { hp: 0, mana: 0 };
  if (!G.shop || !G.shop.stock) genShopStock();
  if (!G.tavern) genTavernBoard();
  return true;
}
function resetGame() { localStorage.removeItem(SAVE_KEY); location.reload(); }

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
    hpRegen: 0, manaRegen: 0,
    dmgFlat: 0, dmgPct: 0, dr: 0,
    res: { phys: 0, magic: 0, poison: 0 },
    enemyResDown: 0,
    weaponMin: 1, weaponMax: 2, weaponMagic: false, weaponSpd: 0,
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
  d.hpRegen = +((1 + d.str * 0.2 + d.hpRegen) * 0.2).toFixed(1);
  d.evasion = Math.min(60, +(d.dex * 0.1 + d.evasion).toFixed(1));
  d.manaRegen = +((1 + d.int * 0.4 + d.manaRegen) * 0.5).toFixed(1);
  // caps
  d.res.phys = Math.min(75, d.res.phys); d.res.magic = Math.min(75, d.res.magic); d.res.poison = Math.min(75, d.res.poison);
  d.dr = Math.min(0.6, d.dr);
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
// Levels 1 and 2 are eased in (4x and 2x cheaper); level 3+ full price.
function xpForLevel(lvl) {
  const base = Math.round(1600 * Math.pow(lvl, 1.55));   // x10
  return lvl === 1 ? Math.round(base / 4) : lvl === 2 ? Math.round(base / 2) : base;
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

function rollAffixes(count, ilvl, clsId) {
  const out = [];
  const used = new Set();
  const pool = DATA.AFFIXES;
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
  it.affixes = rollAffixes(rint(aMin, aMax), ilvl, clsHint);
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

// Runes: 1 bonus = Flawed Rune, 2 = Rune, 3 = Great Rune.
// Prefix/suffix are generated from randomly chosen bonus stats.
function makeRune(ilvl, source) {
  const counts = { normal: [1, 1], rare: [1, 2], epic: [1, 3], legendary: [2, 3] };
  const n = rint(...counts[source]);
  const bonuses = rollAffixes(n, ilvl);
  const baseName = n === 1 ? 'Flawed Rune' : n === 2 ? 'Rune' : 'Great Rune';
  const pre = pick(DATA.NAME_PARTS[pick(bonuses).id].pre);
  const suf = pick(DATA.NAME_PARTS[pick(bonuses).id].suf);
  return {
    uid: G ? G.itemSeq++ : rint(1, 1e9), type: 'rune', rarity: 'magical', ilvl,
    icon: '🪨', name: `${pre} ${baseName} ${suf}`, baseName,
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

// Bulk selling. kind: 'junk' (normal+magical) | 'unusable' | 'rare' | 'epic' | 'legendary'
function sellMatches(kind) {
  return G.inventory.filter(i => {
    if (i.type !== 'item') return false;   // runes are never bulk-sold
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

function restockCost() { return 200 + G.unlocked * 100; }

// ------------------------------------------------------------
// Tavern — 3 random quests on the board, one active at a time.
// The board refreshes with new rumors every time you return home.
// ------------------------------------------------------------
function genQuest() {
  const u = Math.max(1, G.unlocked);
  const goldR = n => Math.round(n * (10 + u * 12) * (0.8 + Math.random() * 0.4));
  const xpR = n => Math.round(n * (8 + u * 6) * (0.85 + Math.random() * 0.3));
  const makers = [
    () => { const n = rint(30, 60); return { type: 'kill_normal', icon: '🗡️', name: 'The Culling', desc: `The village elder begs for relief: slay ${n} common creatures.`, target: n, reward: { gold: goldR(3), xp: xpR(3) } }; },
    () => { const n = rint(4, 8); return { type: 'kill_rare', icon: '📜', name: 'Bounty Board', desc: `Wanted posters flutter in the wind: bring down ${n} RARE creatures.`, target: n, reward: { gold: goldR(4), item: 'rare', xp: xpR(4) } }; },
    () => { const n = rint(1, 2); return { type: 'kill_epic', icon: '🏆', name: 'Trophy Hunter', desc: `A wealthy collector pays handsomely for proof of ${n} EPIC kill${n > 1 ? 's' : ''}.`, target: n, reward: { gold: goldR(5), item: 'rare', xp: xpR(5) } }; },
    () => { const n = rint(5, 9); return { type: 'item_magic', icon: '💎', name: 'The Collector', desc: `A shady dealer in the corner wants ${n} magical-or-better items found on adventure.`, target: n, reward: { gold: goldR(6), xp: xpR(6) } }; },
    () => { const n = rint(3, 6); return { type: 'potion', icon: '🧪', name: 'Potion Tester', desc: `The alchemist needs field data: drink ${n} potions while adventuring.`, target: n, reward: { gold: goldR(3), item: 'magical', xp: xpR(3) } }; },
    () => { const n = goldR(8); return { type: 'gold', icon: '🪙', name: 'Debt of Honor', desc: `The barkeep owes dangerous people. Earn ${n.toLocaleString()} gold on adventures to bail him out.`, target: n, reward: { item: 'epic', xp: xpR(7) } }; },
    () => { return { type: 'kill_legendary', icon: '🔶', name: 'Head of the Beast', desc: 'A hooded stranger slides a map across the table: slay a LEGENDARY level boss. Any will do.', target: 1, reward: { gold: goldR(10), item: 'epic', xp: xpR(10) } }; },
    () => { return { type: 'kill_miniboss', icon: '👑', name: 'Crownsnatcher', desc: 'Rumors tell of crowned beasts prowling the back half of a chapter (levels 5+). Slay a MINI BOSS.', target: 1, reward: { gold: goldR(6), item: 'rare', xp: xpR(6) } }; },
  ];
  return Object.assign(pick(makers)(), { progress: 0 });
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
  if (!q || q.type !== kind) return;
  q.progress = (q.progress || 0) + (amt || 1);
  if (q.progress >= q.target) completeQuest();
}

function completeQuest() {
  const q = G.tavern.active;
  const parts = [];
  if (q.reward.gold) { G.gold += q.reward.gold; parts.push(`🪙 ${q.reward.gold.toLocaleString()}`); }
  if (q.reward.xp) {
    const ups = gainXp(q.reward.xp);
    parts.push(`✨ ${q.reward.xp.toLocaleString()} XP`);
    if (ups) log('sys', `🎉 LEVEL UP! You are now level ${G.char.level} (+3 stat, +1 skill point)`);
  }
  if (q.reward.item) {
    const it = makeItem(Math.max(1, G.unlocked), q.reward.item, G.char.cls);
    G.inventory.push(it);
    parts.push(`${it.icon} ${it.name} (${q.reward.item})`);
  }
  log('sys', `🍺 QUEST COMPLETE: "${q.name}"! Reward: ${parts.join(' + ')}`);
  G.tavern.active = null;
  genTavernBoard();
  saveGame();
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
// Areas / creatures
// ------------------------------------------------------------
function areaInfo(level) {
  const t = DATA.BIOME_TYPES[Math.floor((level - 1) / 10)];
  return { level, type: t, biome: t.biomes[(level - 1) % 10] };
}

// The 10 biome types double as the game's 10 story chapters (levels
// 1-10 = Chapter 1, 11-20 = Chapter 2, etc). Chapters without a
// custom title yet fall back to their biome type name.
function chapterNumOf(level) { return Math.floor((level - 1) / 10) + 1; }
function chapterData(level) {
  const n = chapterNumOf(level);
  const ch = (DATA.CHAPTERS && DATA.CHAPTERS[n - 1]) || {};
  const title = ch.title || `Chapter ${n}: ${DATA.BIOME_TYPES[n - 1].type}`;
  return { num: n, title, headline: ch.headline || '', story: ch.story || [] };
}

// A Part is one individual level's own story beat: 'beginning' (shown
// when a hero first arrives) and 'end' (shown on that level's boss
// victory). Falls back to generic location-flavored text for levels
// that don't have authored content yet.
function partStory(level, kind) {
  const chapterIdx = Math.floor((level - 1) / 10);
  const partIdx = (level - 1) % 10;
  const locName = DATA.BIOME_TYPES[chapterIdx].biomes[partIdx];
  const ch = DATA.CHAPTERS && DATA.CHAPTERS[chapterIdx];
  const part = ch && ch.parts && ch.parts[partIdx];
  if (part && part[kind]) return part[kind];
  return kind === 'beginning'
    ? `The road leads on to ${locName}. Whatever's waiting there hasn't been named yet.`
    : `${locName} falls quiet behind them — one more stretch of road, walked and done.`;
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

// Each of a biome type's 10 levels gets a UNIQUE roster of 3 of its 5
// creatures — C(5,3) = 10 combinations, one per level, no repeats.
const CREATURE_COMBOS = [
  [0, 1, 2], [0, 3, 4], [1, 2, 3], [0, 1, 4], [2, 3, 4],
  [0, 1, 3], [1, 2, 4], [0, 2, 3], [1, 3, 4], [0, 2, 4],
];
function creaturesForLevel(level) {
  const info = areaInfo(level);
  const combo = CREATURE_COMBOS[(level - 1) % 10];
  return combo.map(i => info.type.creatures[i]);
}

function rareName(t) { return `${pick(t.rareA)} ${pick(t.rareB)}`; }
function bossName(t) {
  const name = pick(DATA.NAME_SYL_A) + pick(DATA.NAME_SYL_B) + pick(DATA.NAME_SYL_C);
  return `${name} — ${pick(t.bossTitles)}`;
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

// From the 5th level of each biome onward, a normal encounter has a
// very small chance to be replaced by a wandering mini boss.
const MINIBOSS_CHANCE = 0.015;
function minibossPossible(level) { return ((level - 1) % 10) >= 4; }

// The bag-carrying elf (a nod to Golden Axe): a rare bonus encounter.
// He never attacks; the hero gets at most 5 hits before he escapes.
// Every 25% of his HP lost shakes an item out of the bag (magical+,
// small chance of epic); killing him outright spills a rare-or-better
// with a very low chance of legendary. He doesn't count toward the
// level's 1111 creatures.
const ELF_CHANCE = 0.01;
function makeElf(level) {
  const hp = Math.round(39 * 5 * enemyHpScale(level));   // 5x a normal monster
  return {
    tier: 'elf', level, species: 'Bag Carrier', name: 'Sneaky Elf',
    attack: 'Frantic Dodging', atkType: 'phys', res: { phys: 0, magic: 0, poison: 0 },
    maxHp: hp, hp, dmg: 0, spd: 0,
    xp: Math.max(2, Math.round((4 + level * 2.2) / 2)),
    gauge: 0, stunned: 0, dead: false,
  };
}
function elfChunkRarity() { const r = Math.random() * 100; return r < 80 ? 'magical' : r < 97 ? 'rare' : 'epic'; }
function elfKillRarity() { const r = Math.random() * 100; return r < 75 ? 'rare' : r < 97 ? 'epic' : 'legendary'; }

function makeCreature(level, tier) {
  const info = areaInfo(level);
  const base = pick(creaturesForLevel(level));
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
  else if (tier === 'rare') { c.name = rareName(info.type); }
  else { c.name = bossName(info.type); }
  if (tier !== 'normal') {
    for (const k of Object.keys(c.res)) c.res[k] = Math.min(70, c.res[k] + { rare: 5, epic: 10, miniboss: 12, legendary: 15 }[tier]);
  }
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
    if (r < 80) dropItem(lvl, rollItemRarity(tier), run);
    else gainPotion(pick(['hp', 'mana', 'scroll']), run);
    return;
  }

  const r = Math.random() * 100;
  const T = {
    normal: { gold: 42, item: 12, hpPot: 3, manaPot: 2.5, buffPot: 0.25 },
    rare:   { gold: 55, item: 25, hpPot: 2.5, manaPot: 2, buffPot: 1 },
    epic:   { gold: 55, item: 32, hpPot: 1.5, manaPot: 1.5, buffPot: 1.5 },
  }[tier];
  let acc = 0;
  if (r < (acc += T.gold)) { run.gold += goldBase; G.gold += goldBase; return; }
  if (r < (acc += T.item)) { dropItem(lvl, rollItemRarity(tier), run); return; }
  if (r < (acc += T.hpPot)) { gainPotion('hp', run); return; }
  if (r < (acc += T.manaPot)) { gainPotion('mana', run); return; }
  if (r < (acc += T.buffPot)) { gainPotion('scroll', run); return; }
  // else: nothing
}

function dropItem(lvl, rarity, run) {
  const it = makeItem(lvl, rarity, G.char.cls);
  run.items.push(it); G.inventory.push(it);
  if (rarity !== 'normal') {
    log('loot', `${it.icon} ${DATA.RARITIES[rarity].name} drop: ${it.name}`, { rarity });
    questEvent('item_magic');
  }
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
// Combat — round-based with an ATB speed gauge.
// Every combat round each fighter gains gauge equal to their Speed;
// on reaching 100 they act. High Dexterity = more attacks.
// ------------------------------------------------------------
// Combat is player-driven now: the hero auto-swings his free basic
// attack, and casts a skill only when the player has queued one.
function pickSkill(fight) {
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

function playerHit(fight, enemy, skill, r) {
  const d = ADV.d;
  const raw = rint(d.baseDmgMin, d.baseDmgMax) * (skill.mult ? skill.mult(r) : 1);
  let dmgBoost = 1 + (ADV.scroll > 0 ? 0.12 : 0);   // power-up scroll
  for (const b of fight.buffs) if (b.dmgPct) dmgBoost += b.dmgPct;
  const isMagic = skill.magic || (d.weaponMagic && skill.cat === 'basic');
  const resKey = isMagic ? 'magic' : 'phys';
  let res = enemy.res[resKey] - d.enemyResDown - (fight.enemyResDown || 0);
  if (skill.pierce) res *= (1 - skill.pierce);
  res = Math.max(-50, Math.min(75, res));
  const dmg = Math.max(1, Math.round(raw * dmgBoost * (1 - res / 100)));
  enemy.hp -= dmg;
  ADV.run.dmgDealt += dmg;
  if (enemy.tier === 'elf') fight.elfHits = (fight.elfHits || 0) + 1;
  return dmg;
}

function enemyHit(fight, enemy) {
  const d = ADV.d;
  if (Math.random() * 100 < d.evasion) return { dodged: true, dmg: 0 };
  let raw = enemy.dmg * (0.85 + Math.random() * 0.3);
  if (fight.enemyDmgDown) raw *= (1 - fight.enemyDmgDown);
  const resKey = enemy.atkType === 'magic' ? 'magic' : enemy.atkType === 'poison' ? 'poison' : 'phys';
  let dmg = raw * (1 - d.res[resKey] / 100);
  if (enemy.atkType === 'phys') {
    const armorRed = d.armor / (d.armor + 40 + 8 * enemy.level);
    dmg *= (1 - armorRed);
  }
  dmg *= (1 - d.dr);
  dmg = Math.max(1, Math.round(dmg));
  G.char.hp -= dmg;
  ADV.run.dmgTaken += dmg;
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
      c.hp = Math.min(d.maxHp, c.hp + heal);
      log('act', `${skill.icon} ${skill.name} heals you for ${heal} HP`);
      ADV.lastAction = { side: 'player', icon: skill.icon, txt: `${skill.name} +${heal} HP` };
    } else if (skill.buff && !skill.mult) {
      fight.buffs.push({ ...skill.buff(r) });
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
      if (skill.buff) fight.buffs.push({ ...skill.buff(r) });
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
        parts.push(`${t.name.split(' — ')[0]} for ${dmg.toLocaleString()}`);
        if (skill.stun && t.hp > 0) t.stunned = (t.stunned || 0) + skill.stun;
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
  G.progress[ADV.level] = (G.progress[ADV.level] || 0) + 1;
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
    G.settings.advSpeed = 600;
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
    speedMs: G.settings.advSpeed || 600,
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
  log('sys', `⚔️ Venturing into ${info.biome} (Level ${level} — ${chapterData(level).title})...`);
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

function setPackSize(n) {
  G.settings.packSize = Math.max(1, Math.min(5, n));
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
        elf: true, elfHits: 0, elfChunks: 0,
      };
      log('encounter', `🧝 A SNEAKY ELF with a bulging bag darts across your path! (5 hits before he escapes!)`, { tier: 'elf' });
      saveGame();
      UI.refreshAdventure();
      return;
    }

    let enemies;
    if (tier === 'normal' && minibossPossible(level) && chance(MINIBOSS_CHANCE)) {
      enemies = [makeCreature(level, 'miniboss')];
      log('encounter', `👑 MINI BOSS: ${enemies[0].name} (${enemies[0].species}, Lv ${level}) prowls out of the wilds!`, { tier: 'miniboss' });
    } else if (tier === 'normal') {
      const packMax = Math.max(1, Math.min(G.settings.packSize, normalsUntilSpecial(kills)));
      enemies = Array.from({ length: packMax }, () => makeCreature(level, 'normal'));
      log('encounter', `⚔️ ${enemies.length > 1 ? enemies.length + ' creatures block your path' : 'A creature blocks your path'}: ${enemies.map(e => e.name).join(', ')}`);
    } else {
      enemies = [makeCreature(level, tier)];
      const label = { rare: '🔷 RARE', epic: '🟣 EPIC', legendary: '🔶 LEGENDARY BOSS' }[tier];
      log('encounter', `${label}: ${enemies[0].name} (${enemies[0].species}, Lv ${level}) appears!`, { tier });
    }
    ADV.fight = {
      enemies, cds: {}, buffs: [], enemyDmgDown: 0, enemyResDown: 0,
      debuffRounds: 0, debuffApplied: false, round: 0, playerGauge: 0,
    };
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

  // ATB gauges: Speed (from Dexterity) fills the gauge; the weapon's
  // attack interval decides how much gauge one swing costs
  f.playerGauge += d.speed;
  for (const e of f.enemies) if (e.hp > 0) e.gauge += e.spd;

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
      dropItem(ADV.level, elfChunkRarity(), run);
      log('loot', `🧝 Something shakes loose from the elf's bag! (${f.elfChunks * 25}% battered)`);
    }
    if (e.hp <= 0) {
      dropItem(ADV.level, elfKillRarity(), run);
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
  for (const e of f.enemies) if (e.hp <= 0 && !e.dead) handleKill(e, run);

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
        log('sys', `🗺️ Level ${level + 1} unlocked: ${nextInfo.biome}${enteringNewChapter ? ` — ${chapterData(level + 1).title} begins!` : '!'}`);
      }
      run.bossDefeated = true;
      grantPartClearReward(level, run);
      G.progress[level] = 0;   // cleared areas can be run again from the start
      log('sys', `♻️ ${areaInfo(level).biome} can be adventured again from the beginning.`);
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
