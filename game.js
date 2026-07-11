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
function newGame(clsId, name) {
  const cls = DATA.CLASSES[clsId];
  G = {
    v: 1,
    char: {
      cls: clsId,
      name: name || cls.name,
      level: 1, xp: 0,
      statPoints: 0, skillPoints: 1,
      stats: { ...cls.baseStats },
      skills: { [Object.values(DATA.SKILLS[clsId]).find(s => s.cat === 'basic').id]: 1 },
      equip: {},   // slot -> item
      hp: 0, mana: 0, // set after derive
      kills: 0,
    },
    gold: 25,
    inventory: [],       // items + runes
    area: 1,             // selected area level
    unlocked: 1,         // highest unlocked area
    progress: {},        // areaLevel -> kills in that level (0..1111)
    bossKilled: {},      // areaLevel -> true
    totals: { adventures: 0, kills: { normal: 0, rare: 0, epic: 0, legendary: 0 } },
    settings: { packSize: 1 },
    shop: null,
    itemSeq: 1,
  };
  giveStarterGear(clsId);
  genShopStock();
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
    dmgMin: wBase.dmg[0], dmgMax: wBase.dmg[1], affixes: [], value: 1,
  };
  if (wBase.spd) weapon.spd = wBase.spd;
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
  if (!G.shop || !G.shop.stock) genShopStock();
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
  d.hpRegen = +(1 + d.str * 0.2 + d.hpRegen).toFixed(1);
  d.evasion = Math.min(60, +(d.dex * 0.6 + d.evasion).toFixed(1));
  d.manaRegen = +(1 + d.int * 0.4 + d.manaRegen).toFixed(1);
  // caps
  d.res.phys = Math.min(75, d.res.phys); d.res.magic = Math.min(75, d.res.magic); d.res.poison = Math.min(75, d.res.poison);
  d.dr = Math.min(0.6, d.dr);
  // base damage: weapon + main stat scaling
  const main = { warrior: d.str, rogue: d.dex, mage: d.int }[c.cls];
  d.baseDmgMin = Math.round((d.weaponMin + main * 0.9) * (1 + d.dmgPct));
  d.baseDmgMax = Math.round((d.weaponMax + main * 1.1) * (1 + d.dmgPct));
  return d;
}

// ------------------------------------------------------------
// XP / leveling
// ------------------------------------------------------------
function xpForLevel(lvl) { return Math.round(80 * Math.pow(lvl, 1.55)); }

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
const MANA_COST_MULT = 3;
function skillCost(s) { return (s.cost ? s.cost() : 0) * MANA_COST_MULT; }

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

function makeItem(ilvl, rarity, clsHint) {
  const scale = itemScale(ilvl);
  const rar = DATA.RARITIES[rarity];
  const it = { uid: G ? G.itemSeq++ : rint(1, 1e9), ilvl, rarity, runes: [], sockets: 0, type: 'item' };
  const roll = Math.random();

  if (roll < 0.30) { // weapon
    const base = pick(DATA.WEAPON_BASES);
    it.slot = 'weapon'; it.base = base.id; it.icon = base.icon;
    it.baseName = base.name; it.hands = base.hands; it.classes = base.classes; it.magic = !!base.magic;
    if (base.spd) it.spd = base.spd;
    it.dmgMin = Math.max(1, Math.round(base.dmg[0] * scale * rar.mult));
    it.dmgMax = Math.max(2, Math.round(base.dmg[1] * scale * rar.mult));
    it.sockets = rollSockets();
  } else if (roll < 0.42) { // offhand
    const base = pick(DATA.OFFHAND_BASES);
    it.slot = 'offhand'; it.base = base.id; it.icon = base.icon;
    it.baseName = base.name; it.classes = base.classes; it.weight = base.weight || null; it.magic = !!base.magic;
    if (base.armor) it.armor = Math.max(1, Math.round(base.armor * scale * rar.mult));
    if (base.dmg) {
      it.dmgMin = Math.max(1, Math.round(base.dmg[0] * scale * rar.mult));
      it.dmgMax = Math.max(1, Math.round(base.dmg[1] * scale * rar.mult));
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
  } else { // jewelry: amulet / ring / cloak — pure affix carriers, always at least magical
    const kind = pick(['amulet', 'ring', 'ring', 'cloak']);
    const base = DATA.JEWELRY_BASES[kind];
    it.slot = kind; it.base = kind; it.icon = base.icon; it.baseName = base.name;
    if (base.armor) it.armor = Math.max(1, Math.round(base.armor * scale * rar.mult));
    if (rarity === 'normal') { rarity = 'magical'; it.rarity = 'magical'; }
  }

  const [aMin, aMax] = DATA.RARITIES[it.rarity].affixes;
  it.affixes = rollAffixes(rint(aMin, aMax), ilvl, clsHint);
  it.name = buildItemName(it);
  it.value = Math.max(1, Math.round((2 + ilvl * 1.5) * DATA.RARITIES[it.rarity].value));
  return it;
}

// Names are generated from the item's own affixes: one random affix
// supplies the prefix word, another supplies the suffix phrase.
// Rare/epic/legendary WEAPONS instead get unique names:
//   rare      — two words tied to a bonus property ("Vile Sting")
//   epic      — one-word forged name or two-word property name
//   legendary — heroic epithet + weapon noun ("Master's Walker"),
//               or a one-word forged name
function buildItemName(it) {
  if (it.rarity === 'normal') return it.baseName;
  const affs = it.affixes && it.affixes.length ? it.affixes : null;
  if (it.slot === 'weapon' && affs && it.rarity !== 'magical') {
    const noun = pick(DATA.WEAPON_NOUNS[it.base] || ['Relic']);
    const adj = () => pick(DATA.AFFIX_ADJ[pick(affs).id] || DATA.FALLBACK_PRE);
    const heroic = () => pick(DATA.AFFIX_HEROIC[pick(affs).id] || DATA.FALLBACK_PRE);
    const forged = () => pick(DATA.NAME_SYL_A) + pick(DATA.NAME_SYL_B);
    if (it.rarity === 'rare') return `${adj()} ${noun}`;
    if (it.rarity === 'epic') return chance(0.5) ? forged() : `${adj()} ${noun}`;
    return chance(0.35) ? forged() : `${heroic()} ${noun}`;   // legendary
  }
  const pre = affs ? pick(DATA.NAME_PARTS[pick(affs).id].pre) : pick(DATA.FALLBACK_PRE);
  const suf = affs ? pick(DATA.NAME_PARTS[pick(affs).id].suf) : pick(DATA.FALLBACK_SUF);
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

function shopRollRarity() {
  const r = Math.random() * 100;
  if (r < 35) return 'normal';
  if (r < 75) return 'magical';
  if (r < 93) return 'rare';
  if (r < 99) return 'epic';
  return 'legendary';
}

function genShopStock() {
  const stock = [];
  for (let i = 0; i < 6; i++) {
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

function rareName(t) { return `${pick(t.rareA)} ${pick(t.rareB)}`; }
function bossName(t) {
  const name = pick(DATA.NAME_SYL_A) + pick(DATA.NAME_SYL_B) + pick(DATA.NAME_SYL_C);
  return `${name} — ${pick(t.bossTitles)}`;
}

// Each area level is 25% more difficult than the previous (compounding).
function enemyScale(level) { return bigScale(level); }

const TIER_CONF = {
  normal:    { hp: 1.0, dmg: 1.0, spd: 1.0, xp: 1, gold: 1 },
  rare:      { hp: 3.2, dmg: 1.5, spd: 1.1, xp: 6, gold: 5 },
  epic:      { hp: 9, dmg: 2.4, spd: 1.2, xp: 25, gold: 20 },
  legendary: { hp: 28, dmg: 3.8, spd: 1.35, xp: 120, gold: 100 },
};

function makeCreature(level, tier) {
  const info = areaInfo(level);
  const base = pick(info.type.creatures);
  const conf = TIER_CONF[tier];
  const s = enemyScale(level);
  const c = {
    tier, level,
    species: base.name, attack: base.attack, atkType: base.atkType,
    res: { ...base.res },
    maxHp: Math.max(5, Math.round(26 * base.hp * s * conf.hp * (0.9 + Math.random() * 0.2))),
    dmg: Math.max(1, Math.round(9 * base.dmg * s * conf.dmg * (0.9 + Math.random() * 0.2))),
    spd: Math.round((16 + 9 * base.spd + level * 0.4) * conf.spd),
    xp: Math.round((4 + level * 2.2) * conf.xp),
    gauge: 0, stunned: 0, dead: false,
  };
  c.hp = c.maxHp;
  if (tier === 'normal') c.name = base.name;
  else if (tier === 'rare') { c.name = rareName(info.type); }
  else { c.name = bossName(info.type); }
  if (tier !== 'normal') {
    for (const k of Object.keys(c.res)) c.res[k] = Math.min(70, c.res[k] + { rare: 5, epic: 10, legendary: 15 }[tier]);
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

const RUNE_CHANCE = { normal: 0.001, rare: 0.01, epic: 0.02, legendary: 0.10 };

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

  if (tier === 'legendary') {
    run.gold += goldBase; G.gold += goldBase;
    const r = Math.random() * 100;
    if (r < 80) dropItem(lvl, rollItemRarity('legendary'), run);
    else usePotion(pick(['hp', 'mana', 'buff']), run);
    return;
  }

  const r = Math.random() * 100;
  const T = {
    normal: { gold: 42, item: 12, hpPot: 6, manaPot: 5, buffPot: 0.5 },
    rare:   { gold: 55, item: 25, hpPot: 5, manaPot: 4, buffPot: 2 },
    epic:   { gold: 55, item: 32, hpPot: 3, manaPot: 3, buffPot: 3 },
  }[tier];
  let acc = 0;
  if (r < (acc += T.gold)) { run.gold += goldBase; G.gold += goldBase; return; }
  if (r < (acc += T.item)) { dropItem(lvl, rollItemRarity(tier), run); return; }
  if (r < (acc += T.hpPot)) { usePotion('hp', run); return; }
  if (r < (acc += T.manaPot)) { usePotion('mana', run); return; }
  if (r < (acc += T.buffPot)) { usePotion('buff', run); return; }
  // else: nothing
}

function dropItem(lvl, rarity, run) {
  const it = makeItem(lvl, rarity, G.char.cls);
  run.items.push(it); G.inventory.push(it);
  if (rarity !== 'normal') {
    log('loot', `${it.icon} ${DATA.RARITIES[rarity].name} drop: ${it.name}`, { rarity });
  }
}

function usePotion(kind, run) {
  const d = ADV.d;
  if (kind === 'hp') {
    // 1% Full Health, 25% Greater (40%), otherwise regular (20%)
    const roll = Math.random();
    let heal, label;
    if (roll < 0.01) { heal = d.maxHp; label = '🌟 FULL HEALTH potion! Fully restored'; }
    else if (roll < 0.26) { heal = Math.round(d.maxHp * 0.40); label = '✨ GREATER health potion!'; }
    else { heal = Math.round(d.maxHp * 0.20); label = 'Health potion!'; }
    const before = G.char.hp;
    G.char.hp = Math.min(d.maxHp, G.char.hp + heal);
    run.potions.hp++;
    log('loot', `🧪 ${label} +${Math.round(G.char.hp - before)} HP.`);
  } else if (kind === 'mana') {
    const m = Math.round(d.maxMana * 0.4);
    G.char.mana = Math.min(d.maxMana, G.char.mana + m);
    run.potions.mana++;
    log('loot', `🧪 Mana potion! +${m} mana.`);
  } else {
    ADV.buffPotion += 0.12;
    run.potions.buff++;
    log('loot', `🧪 Buff potion! +12% damage for the rest of this adventure.`);
  }
}

// ------------------------------------------------------------
// Combat — round-based with an ATB speed gauge.
// Every combat round each fighter gains gauge equal to their Speed;
// on reaching 100 they act. High Dexterity = more attacks.
// ------------------------------------------------------------
function pickSkill(fight) {
  const c = G.char, cls = c.cls;
  const skills = DATA.SKILLS[cls];
  const list = Object.values(skills).filter(s => (c.skills[s.id] || 0) > 0 && !s.passive);
  const alive = fight.enemies.filter(e => e.hp > 0);
  const hpPct = G.char.hp / ADV.d.maxHp;
  const cd = fight.cds;
  const usable = s => (cd[s.id] || 0) <= 0 && G.char.mana >= skillCost(s);

  const byCat = cat => list.find(s => s.cat === cat && usable(s));
  if (hpPct < 0.5) { const heal = byCat('heal'); if (heal) return heal; }
  const boss = alive.some(e => e.tier === 'epic' || e.tier === 'legendary');
  if (boss) { const u = byCat('ult2') || byCat('ult'); if (u) return u; }
  if (!fight.buffs.length) { const b = byCat('buff'); if (b) return b; }
  if (alive.some(e => e.tier !== 'normal') && !fight.debuffApplied) { const db = byCat('debuff'); if (db) return db; }
  if (alive.length >= 2) { const a = byCat('aoe2') || byCat('aoe'); if (a) return a; }
  const atk = byCat('attack2') || byCat('attack');
  if (atk) return atk;
  return skills[Object.values(skills).find(s => s.cat === 'basic').id];
}

function playerHit(fight, enemy, skill, r) {
  const d = ADV.d;
  const raw = rint(d.baseDmgMin, d.baseDmgMax) * (skill.mult ? skill.mult(r) : 1);
  let dmgBoost = 1 + ADV.buffPotion;
  for (const b of fight.buffs) if (b.dmgPct) dmgBoost += b.dmgPct;
  const isMagic = skill.magic || (d.weaponMagic && skill.cat === 'basic');
  const resKey = isMagic ? 'magic' : 'phys';
  let res = enemy.res[resKey] - d.enemyResDown - (fight.enemyResDown || 0);
  if (skill.pierce) res *= (1 - skill.pierce);
  res = Math.max(-50, Math.min(75, res));
  const dmg = Math.max(1, Math.round(raw * dmgBoost * (1 - res / 100)));
  enemy.hp -= dmg;
  ADV.run.dmgDealt += dmg;
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
    } else if (skill.buff && !skill.mult) {
      fight.buffs.push({ ...skill.buff(r) });
      log('act', `${skill.icon} You roar with ${skill.name}!`);
    } else if (skill.debuff && !skill.mult) {
      const db = skill.debuff(r);
      fight.enemyDmgDown = Math.max(fight.enemyDmgDown, db.dmgDown || 0);
      fight.enemyResDown = Math.max(fight.enemyResDown, db.resDown || 0);
      fight.debuffRounds = db.rounds; fight.debuffApplied = true;
      log('act', `${skill.icon} ${skill.name} weakens your enemies!`);
    } else {
      if (skill.buff) fight.buffs.push({ ...skill.buff(r) });
      if (skill.debuff) {
        const db = skill.debuff(r);
        fight.enemyResDown = Math.max(fight.enemyResDown, db.resDown || 0);
        fight.debuffRounds = db.rounds; fight.debuffApplied = true;
      }
      const tgts = skill.aoe ? alive : [alive[0]];
      const parts = [];
      for (const t of tgts) {
        const dmg = playerHit(fight, t, skill, r);
        parts.push(`${t.name.split(' — ')[0]} for ${dmg}`);
        if (skill.stun && t.hp > 0) t.stunned = (t.stunned || 0) + skill.stun;
      }
      log('act', `${skill.icon} ${skill.name} hits ${parts.join(', ')}`);
    }
  }
}

function enemyAct(fight, e) {
  if (e.hp <= 0) return;
  if (e.stunned > 0) { e.stunned--; log('enemy', `💫 ${e.name} is stunned and misses its turn!`); return; }
  const hit = enemyHit(fight, e);
  if (hit.dodged) log('enemy', `💨 You dodge ${e.name}'s ${e.attack}!`);
  else log('enemy', `🩸 ${e.name}'s ${e.attack} (${e.atkType}) deals ${hit.dmg} damage`);
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
  if (ups) log('sys', `🎉 LEVEL UP! You are now level ${G.char.level} (+3 stat, +1 skill point)`);
}

// ------------------------------------------------------------
// Adventure loop — no stamina: fight until 0 HP or the boss falls.
// ------------------------------------------------------------
function startAdventure() {
  if (ADV) return;
  const level = G.area;
  const d = derive();
  G.char.hp = d.maxHp; G.char.mana = d.maxMana; // rested before departure
  LOG = [];
  ADV = {
    level, d,
    buffPotion: 0,
    speedMs: 300,
    fight: null,
    run: {
      kills: { normal: 0, rare: 0, epic: 0, legendary: 0 },
      gold: 0, xp: 0, items: [], potions: { hp: 0, mana: 0, buff: 0 },
      dmgDealt: 0, dmgTaken: 0,
      levelUps: 0, bossDefeated: false, outcome: null,
    },
  };
  G.totals.adventures++;
  const info = areaInfo(level);
  log('sys', `⚔️ Venturing into ${info.biome} (Level ${level} — ${info.type.type})...`);
  UI.refresh();
  advTimer = setInterval(adventureTick, ADV.speedMs);
}

function setAdvSpeed(ms) {
  if (!ADV) return;
  ADV.speedMs = ms;
  clearInterval(advTimer);
  advTimer = setInterval(adventureTick, ms);
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
  const d = derive();
  G.char.hp = d.maxHp; G.char.mana = d.maxMana; // rest at home
  genShopStock(); // the merchant rotates wares while you were away
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

    let enemies;
    if (tier === 'normal') {
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

  // ATB gauges: Speed (from Dexterity) determines how often you act
  f.playerGauge += d.speed;
  for (const e of f.enemies) if (e.hp > 0) e.gauge += e.spd;

  const queue = [];
  while (f.playerGauge >= 100) { f.playerGauge -= 100; queue.push({ who: 'player', g: f.playerGauge + 100 }); }
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
        log('sys', `🗺️ Area Level ${level + 1} unlocked: ${areaInfo(level + 1).biome}!`);
      }
      run.bossDefeated = true;
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
