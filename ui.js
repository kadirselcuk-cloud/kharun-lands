// ============================================================
// KHARUN LANDS — UI
// ============================================================
'use strict';

const UI = {};
let activeTab = 'adventure';
let invFilter = 'all';

const $ = sel => document.querySelector(sel);
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// ------------------------------------------------------------
// Screens
// ------------------------------------------------------------
UI.init = function () {
  const save = peekSave();
  if (save) UI.showTitle(save);
  else UI.showClassSelect();
};

// Title screen when a saved hero exists: Continue or start over.
UI.showTitle = function (save) {
  const c = save.char;
  const cls = DATA.CLASSES[c.cls];
  $('#app').innerHTML = `
    <div class="class-select">
      <h1>⚔️ KHARUN LANDS</h1>
      <p class="subtitle">A hero awaits. Your progress is saved automatically in this browser.</p>
      <div class="title-box">
        <div class="title-hero">${cls.icon} <b>${esc(c.name)}</b><br>
          <small>Level ${c.level} ${cls.name} · Area ${save.unlocked}/${100} unlocked · ${(c.kills || 0).toLocaleString()} kills · 🪙 ${(save.gold || 0).toLocaleString()}</small>
        </div>
        <button class="btn btn-primary btn-big" id="continue-btn">▶ Continue</button>
        <button class="btn" id="newchar-btn">✚ New Character (deletes this hero)</button>
      </div>
    </div>`;
  $('#continue-btn').onclick = () => { loadGame(); UI.showGame(); };
  $('#newchar-btn').onclick = () => {
    if (confirm(`Delete ${c.name} (Lv ${c.level} ${cls.name}) and start a new hero?`)) {
      localStorage.removeItem(SAVE_KEY);
      UI.showClassSelect();
    }
  };
};

UI.showClassSelect = function () {
  const app = $('#app');
  app.innerHTML = `
    <div class="class-select">
      <h1>⚔️ KHARUN LANDS</h1>
      <p class="subtitle">100 levels. 111,100 monsters. One hero. Choose your class:</p>
      <div class="class-cards">
        ${Object.values(DATA.CLASSES).map(c => `
          <div class="class-card" data-cls="${c.id}">
            <div class="class-icon">${c.icon}</div>
            <h2>${c.name}</h2>
            <p class="class-desc">${c.desc}</p>
            <p class="class-story">${c.story}</p>
            <p class="class-playstyle">💡 ${c.playstyle}</p>
            <div class="class-stats">
              <div><span class="stat-str">STR</span> ${c.baseStats.str}</div>
              <div><span class="stat-dex">DEX</span> ${c.baseStats.dex}</div>
              <div><span class="stat-int">INT</span> ${c.baseStats.int}</div>
            </div>
            <div class="class-armor">Armor: ${c.armorWeights.map(cap).join(', ')}</div>
            <div class="class-skills-preview">
              ${Object.values(DATA.SKILLS[c.id]).slice(0, 6).map(s => `<span title="${esc(s.name)}">${s.icon}</span>`).join('')}…
            </div>
            <button class="btn btn-primary pick-btn">Play ${c.name}</button>
          </div>`).join('')}
      </div>
      <div class="name-row">
        <label>Hero name: <input id="hero-name" maxlength="18" value="${esc(pick(DATA.DEFAULT_NAMES))}"></label>
        <button class="btn btn-tiny" id="reroll-name" title="Roll another name">🎲</button>
      </div>
    </div>`;
  $('#reroll-name').onclick = () => {
    const cur = $('#hero-name').value;
    const others = DATA.DEFAULT_NAMES.filter(n => n !== cur);
    $('#hero-name').value = pick(others.length ? others : DATA.DEFAULT_NAMES);
  };
  app.querySelectorAll('.class-card').forEach(card => {
    card.querySelector('.pick-btn').onclick = () => {
      newGame(card.dataset.cls, $('#hero-name').value.trim());
      UI.showGame();
    };
  });
};

UI.showGame = function () {
  $('#app').innerHTML = `
    <div id="topbar"></div>
    <div id="tabs" class="tabs">
      <button data-tab="adventure">🗺️ Adventure</button>
      <button data-tab="character">🧍 Character</button>
      <button data-tab="skills">📜 Skills</button>
      <button data-tab="inventory">🎒 Inventory</button>
      <button data-tab="shop">🛒 Shop</button>
    </div>
    <div id="tab-content"></div>
    <div id="modal-root"></div>
    <div id="toast"></div>`;
  document.querySelectorAll('#tabs button').forEach(b => {
    b.onclick = () => { activeTab = b.dataset.tab; UI.refresh(); };
  });
  UI.refresh();
};

UI.refresh = function () {
  if (!G) return;
  UI.renderTopbar();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
  // level-up badge on the Character tab
  const charTab = document.querySelector('#tabs button[data-tab="character"]');
  if (charTab) {
    const pts = (G.char.statPoints || 0) + (G.char.skillPoints || 0);
    charTab.innerHTML = `🧍 Character${pts ? ' <span class="lvlup-badge">⬆</span>' : ''}`;
  }
  const el = $('#tab-content');
  if (!el) return;
  if (activeTab === 'character') UI.renderCharacter(el);
  else if (activeTab === 'skills') UI.renderSkills(el);
  else if (activeTab === 'inventory') UI.renderInventory(el);
  else if (activeTab === 'shop') UI.renderShop(el);
  else UI.renderAdventure(el);
};

UI.toast = function (msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(UI._toastTimer);
  UI._toastTimer = setTimeout(() => t.classList.remove('show'), 1500);
};

// ------------------------------------------------------------
// Topbar
// ------------------------------------------------------------
UI.renderTopbar = function () {
  const el = $('#topbar'); if (!el) return;
  const c = G.char, d = derive(), cls = DATA.CLASSES[c.cls];
  const xpNeed = xpForLevel(c.level);
  el.innerHTML = `
    <div class="tb-left">
      <span class="tb-name">${cls.icon} <b>${esc(c.name)}</b> <small>Lv ${c.level} ${cls.name}</small></span>
      <div class="bar xp-bar" title="XP: ${c.xp}/${xpNeed}"><div style="width:${Math.min(100, c.xp / xpNeed * 100)}%"></div><span>XP ${c.xp}/${xpNeed}</span></div>
    </div>
    <div class="tb-mid">
      <div class="bar hp-bar"><div style="width:${Math.max(0, c.hp / d.maxHp * 100)}%"></div><span>❤️ ${Math.round(c.hp)}/${d.maxHp}</span></div>
      <div class="bar mana-bar"><div style="width:${Math.max(0, c.mana / d.maxMana * 100)}%"></div><span>🔵 ${Math.round(c.mana)}/${d.maxMana}</span></div>
    </div>
    <div class="tb-right">
      <span class="gold">🪙 ${G.gold.toLocaleString()}</span>
      ${c.statPoints ? `<span class="pts">+${c.statPoints} stat</span>` : ''}
      ${c.skillPoints ? `<span class="pts">+${c.skillPoints} skill</span>` : ''}
      <button class="btn btn-tiny" onclick="saveGame();UI.toast('💾 Game saved')" title="The game also auto-saves constantly">💾 Save</button>
      <button class="btn btn-tiny" onclick="if(confirm('Delete this hero and start over?'))resetGame()">↺ Reset</button>
    </div>`;
};

// ------------------------------------------------------------
// Character tab
// ------------------------------------------------------------
UI.renderCharacter = function (el) {
  const c = G.char, d = derive(), cls = DATA.CLASSES[c.cls];
  const statRow = (key, label, cssCls, effect) => `
    <div class="stat-row">
      <span class="${cssCls}">${label}</span>
      <b>${d[key]}</b> <small>(base ${c.stats[key]})</small>
      ${c.statPoints > 0 ? `<button class="btn btn-tiny" onclick="spendStat('${key}')">+</button>` : ''}
      <small class="effect">${effect}</small>
    </div>`;
  const xpNeed = xpForLevel(c.level);
  el.innerHTML = `
    ${c.statPoints || c.skillPoints ? `
      <div class="lvlup-banner">⬆ LEVEL UP! You have
        ${c.statPoints ? `<b>${c.statPoints} stat point${c.statPoints > 1 ? 's' : ''}</b>` : ''}
        ${c.statPoints && c.skillPoints ? ' and ' : ''}
        ${c.skillPoints ? `<b>${c.skillPoints} skill point${c.skillPoints > 1 ? 's' : ''}</b>` : ''}
        to spend${c.skillPoints ? ' — skills are on the 📜 Skills tab' : ''}.
      </div>` : ''}
    <div class="panel level-panel">
      <h3>📈 Level ${c.level} ${cls.name}</h3>
      <div class="bar xp-bar xp-bar-big" title="XP: ${c.xp}/${xpNeed}"><div style="width:${Math.min(100, c.xp / xpNeed * 100)}%"></div><span>XP ${c.xp.toLocaleString()} / ${xpNeed.toLocaleString()} — next level grants +3 stat points, +1 skill point</span></div>
    </div>
    <div class="two-col">
      <div class="panel">
        <h3>Main Stats ${c.statPoints ? `<span class="pts">(${c.statPoints} points to spend)</span>` : ''}</h3>
        ${statRow('str', 'Strength', 'stat-str', 'drives HP & HP Regen')}
        ${statRow('dex', 'Dexterity', 'stat-dex', 'drives Speed, Evasion & attack rate')}
        ${statRow('int', 'Intelligence', 'stat-int', 'drives Mana & Mana Regen')}
        <h3>Important Stats</h3>
        <div class="stat-row"><span>❤️ Max HP</span><b>${d.maxHp}</b></div>
        <div class="stat-row"><span>⚡ Speed</span><b>${d.speed}</b><small class="effect">gauge/round — act at 100</small></div>
        <div class="stat-row"><span>🔵 Max Mana</span><b>${d.maxMana}</b></div>
        <h3>Sub Stats</h3>
        <div class="stat-row"><span>💗 HP Regen</span><b>${d.hpRegen}</b></div>
        <div class="stat-row"><span>💨 Evasion</span><b>${d.evasion}%</b></div>
        <div class="stat-row"><span>💧 Mana Regen</span><b>${d.manaRegen}</b></div>
        <h3>Combat</h3>
        <div class="stat-row"><span>🗡️ Damage</span><b>${d.baseDmgMin}–${d.baseDmgMax}</b>${d.weaponMagic ? ' <small>(magic)</small>' : ''}</div>
        <div class="stat-row"><span>🛡️ Armor</span><b>${d.armor}</b></div>
        <div class="stat-row"><span>🌫️ Damage Reduction</span><b>${Math.round(d.dr * 100)}%</b></div>
        <div class="stat-row"><span>Resistances</span><b>⚔️${d.res.phys}% ✨${d.res.magic}% ☠️${d.res.poison}%</b></div>
        <div class="stat-row"><span>Total kills</span><b>${c.kills.toLocaleString()}</b></div>
      </div>
      <div class="panel">
        <h3>Equipment <small>(${cls.name}: ${cls.armorWeights.map(cap).join('/')} armor)</small></h3>
        <div class="equip-grid">
          ${DATA.SLOTS.map(slot => {
            const it = c.equip[slot];
            return `<div class="equip-slot ${it ? 'filled rar-' + it.rarity : ''}" data-slot="${slot}">
              <div class="slot-label">${DATA.SLOT_LABEL[slot]}</div>
              ${it ? `<div class="slot-item" onclick="UI.showItem(${it.uid},'equipped','${slot}')">
                       ${it.icon} <span style="color:${DATA.RARITIES[it.rarity].color}">${esc(it.name)}</span>
                     </div>` : `<div class="slot-empty">—</div>`}
            </div>`;
          }).join('')}
        </div>
        <p class="hint">💡 A two-handed weapon fills both hands. You may also dual-wield two one-handers, or pair a weapon with a shield/off-hand.</p>
      </div>
    </div>`;
};

// ------------------------------------------------------------
// Skills tab
// ------------------------------------------------------------
UI.renderSkills = function (el) {
  const c = G.char;
  const skills = Object.values(DATA.SKILLS[c.cls]);
  const ordered = DATA.SKILL_ORDER.map(cat => skills.find(s => s.cat === cat)).filter(Boolean);
  el.innerHTML = `
    <div class="panel">
      <h3>Skills — ${c.skillPoints} point${c.skillPoints === 1 ? '' : 's'} available</h3>
      <div class="skill-list">
        ${ordered.map(s => {
          const rank = c.skills[s.id] || 0;
          const eff = effectiveRank(s.id);
          const learn = canLearn(s);
          const locked = rank === 0 && !learn.ok;
          return `<div class="skill-row ${locked ? 'locked' : ''} ${rank > 0 ? 'learned' : ''}">
            <div class="skill-icon">${s.icon}</div>
            <div class="skill-body">
              <div class="skill-head">
                <b>${s.name}</b>
                <span class="skill-cat">${DATA.CAT_LABEL[s.cat]}</span>
                <span class="skill-rank">${rank > 0 ? `Rank ${rank}/${MAX_RANK}${eff > rank ? ` <span class="bonus">(+${eff - rank} gear)</span>` : ''}` : '—'}</span>
              </div>
              <div class="skill-desc">${s.desc(Math.max(1, eff))}</div>
              <div class="skill-meta">
                ${skillCost(s) ? `Cost: ${skillCost(s)} mana · ` : s.passive ? 'Passive · ' : 'Free · '}
                ${s.cd ? `Cooldown: ${s.cd} rounds · ` : ''}
                Req: level ${s.minLvl}${s.req ? ` + ${DATA.SKILLS[c.cls][s.req].name}` : ''}
              </div>
            </div>
            <div class="skill-action">
              ${learn.ok
                ? `<button class="btn btn-primary btn-small" onclick="learnSkill('${s.id}')">${rank > 0 ? 'Rank up' : 'Learn'}</button>`
                : `<span class="why">${rank >= MAX_RANK ? 'MAX' : esc(learn.why)}</span>`}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
};

// ------------------------------------------------------------
// Inventory tab
// ------------------------------------------------------------
UI.renderInventory = function (el) {
  const items = G.inventory.filter(i =>
    invFilter === 'all' ? true :
    invFilter === 'runes' ? i.type === 'rune' :
    invFilter === 'usable' ? (i.type === 'item' && canUseItem(i).ok) : true);
  items.sort((a, b) => Object.keys(DATA.RARITIES).indexOf(b.rarity) - Object.keys(DATA.RARITIES).indexOf(a.rarity) || b.ilvl - a.ilvl);
  el.innerHTML = `
    <div class="panel">
      <h3>Inventory (${G.inventory.length})
        <span class="filters">
          ${['all', 'usable', 'runes'].map(f => `<button class="btn btn-tiny ${invFilter === f ? 'active' : ''}" data-f="${f}">${cap(f)}</button>`).join('')}
        </span>
      </h3>
      <div class="sell-row">Sell all:
        <button class="btn btn-tiny danger" data-sell="junk">Normal/Magical</button>
        <button class="btn btn-tiny danger" data-sell="unusable">Unusable</button>
        <button class="btn btn-tiny danger" data-sell="rare">Rare</button>
        <button class="btn btn-tiny danger" data-sell="epic">Epic</button>
        <button class="btn btn-tiny danger" data-sell="legendary">Legendary</button>
      </div>
      ${items.length === 0 ? '<p class="hint">Nothing here yet — go on an adventure!</p>' : ''}
      <div class="inv-grid">
        ${items.map(it => {
          const usable = it.type === 'item' ? canUseItem(it) : { ok: false };
          return `<div class="inv-item rar-${it.rarity} ${it.type === 'item' && !usable.ok ? 'unusable' : ''}" onclick="UI.showItem(${it.uid},'inv')">
            <div class="inv-icon">${it.icon}</div>
            <div class="inv-name" style="color:${DATA.RARITIES[it.rarity].color}">${esc(it.name)}</div>
            <div class="inv-sub">${it.type === 'rune' ? `Rune · ${it.bonuses.length} bonus` : `${DATA.SLOT_LABEL[it.slot === 'ring' ? 'ring1' : it.slot] || cap(it.slot)} · ${esc(it.baseName)}`}</div>
            ${it.type === 'item' ? `<div class="inv-usable ${usable.ok ? 'yes' : 'no'}">${usable.ok ? '✔ usable' : '✖ ' + esc(usable.why)}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { invFilter = b.dataset.f; UI.refresh(); });
  el.querySelectorAll('[data-sell]').forEach(b => b.onclick = () => {
    const kind = b.dataset.sell;
    const matches = sellMatches(kind);
    if (!matches.length) { UI.toast('Nothing to sell'); return; }
    const gold = matches.reduce((s, i) => s + i.value, 0);
    if (!confirm(`Sell ${matches.length} item${matches.length > 1 ? 's' : ''} for 🪙 ${gold.toLocaleString()}?`)) return;
    const r = sellAllOf(kind);
    UI.toast(`Sold ${r.count} for 🪙 ${r.gold.toLocaleString()}`);
  });
};

// ------------------------------------------------------------
// Stat comparison — candidate item vs currently equipped.
// Better values render green, equal white, worse red.
// ------------------------------------------------------------
function statMapOf(it) {
  const m = {};
  if (it.dmgMin) m.dmg = (it.dmgMin + it.dmgMax) / 2;
  if (it.armor) m.armor = it.armor;
  if (it.spd) m.spd = it.spd;
  for (const a of allAffixesOf(it)) m['a_' + a.id] = (m['a_' + a.id] || 0) + a.v;
  return m;
}
function mapScore(m) { return Object.values(m).reduce((s, v) => s + v, 0); }
function cmpClsFor(candMap, eqMap, key) {
  const a = candMap[key] || 0, b = (eqMap || {})[key] || 0;
  return a > b ? 'cmp-better' : a < b ? 'cmp-worse' : 'cmp-same';
}

// Renders an item's stat lines. baseline: undefined = no comparison
// coloring; null = empty slot (everything is an upgrade); object =
// stat map of the equipped item to compare against.
UI.itemStatsHtml = function (it, baseline) {
  if (it.type === 'rune') return it.bonuses.map(b => `<div class="affix">◆ ${affixText(b)}</div>`).join('');
  const cand = statMapOf(it);
  const cls = key => baseline === undefined ? '' : cmpClsFor(cand, baseline, key);
  const runes = it.runes || [];
  return `${it.dmgMin ? `<div class="istat ${cls('dmg')}">Damage: <b>${it.dmgMin.toLocaleString()}–${it.dmgMax.toLocaleString()}</b>${it.magic ? ' (magic)' : ''}</div>` : ''}
    ${it.armor ? `<div class="istat ${cls('armor')}">Armor: <b>${it.armor.toLocaleString()}</b></div>` : ''}
    ${it.spd ? `<div class="istat ${cls('spd')}">Speed: <b>+${it.spd}</b></div>` : ''}
    ${it.hands ? `<div class="istat">${it.hands === 2 ? 'Two-Handed' : 'One-Handed'}</div>` : ''}
    ${it.weight ? `<div class="istat">${cap(it.weight)} armor</div>` : ''}
    ${(it.affixes || []).map(a => `<div class="affix ${cls('a_' + a.id)}">◆ ${affixText(a)}</div>`).join('')}
    ${it.sockets ? `<div class="sockets">Sockets: ${runes.map(r => `<span class="socket filled" title="${esc(r.name)}: ${r.bonuses.map(affixText).join(', ')}">🪨</span>`).join('')}${'<span class="socket">○</span>'.repeat(it.sockets - runes.length)}</div>` : ''}
    ${runes.flatMap(r => r.bonuses).map(b => `<div class="affix rune-affix ${cls('a_' + b.id)}">🪨 ${affixText(b)}</div>`).join('')}`;
};

// Which equipped items should a candidate be compared against?
function compareTargetsFor(it) {
  if (it.type !== 'item') return [];
  if (it.slot === 'ring') return [G.char.equip.ring1, G.char.equip.ring2].filter(Boolean);
  return [G.char.equip[it.slot]].filter(Boolean);
}
// Coloring baseline: the weakest of the compare targets (the one you'd replace).
function baselineFor(targets) {
  if (!targets.length) return null;
  return statMapOf(targets.reduce((worst, t) => mapScore(statMapOf(t)) < mapScore(statMapOf(worst)) ? t : worst));
}

UI.equippedBlockHtml = function (eq, label) {
  if (!eq) return '';
  return `<div class="compare"><h4>${label}: <span style="color:${DATA.RARITIES[eq.rarity].color}">${esc(eq.name)}</span></h4>${UI.itemStatsHtml(eq)}</div>`;
};

UI.cmpLegendHtml = function () {
  return `<p class="cmp-legend">vs equipped: <span class="cmp-better">better</span> · <span class="cmp-same">equal</span> · <span class="cmp-worse">worse</span></p>`;
};

UI.ringLabel = function (t) { return t === G.char.equip.ring1 ? 'Equipped Left Ring' : 'Equipped Right Ring'; };

// Item detail modal. context: 'inv' | 'equipped'
UI.showItem = function (uid, context, slot) {
  let it = G.inventory.find(i => i.uid === uid);
  if (!it) it = equippedItems().find(i => i.uid === uid);
  if (!it) return;
  const rar = DATA.RARITIES[it.rarity];
  const usable = it.type === 'item' ? canUseItem(it) : null;
  const targets = context === 'equipped' ? [] : compareTargetsFor(it);
  const baseline = (context === 'equipped' || it.type !== 'item') ? undefined : baselineFor(targets);
  const statsHtml = UI.itemStatsHtml(it, baseline);

  const actions = [];
  if (it.type === 'rune') {
    actions.push(`<button class="btn btn-primary" onclick="UI.pickSocketTarget(${it.uid})">Socket into item…</button>`);
  } else if (context === 'inv' && usable.ok) {
    if (it.slot === 'ring') {
      actions.push(`<button class="btn btn-primary" onclick="equipItem(${it.uid},'ring1');UI.closeModal()">Equip Left</button>`);
      actions.push(`<button class="btn btn-primary" onclick="equipItem(${it.uid},'ring2');UI.closeModal()">Equip Right</button>`);
    } else if (it.slot === 'weapon' && it.hands === 1) {
      actions.push(`<button class="btn btn-primary" onclick="equipItem(${it.uid},'weapon');UI.closeModal()">Equip Main Hand</button>`);
      actions.push(`<button class="btn" onclick="equipItem(${it.uid},'offhand');UI.closeModal()">Equip Off Hand</button>`);
    } else {
      actions.push(`<button class="btn btn-primary" onclick="equipItem(${it.uid});UI.closeModal()">Equip</button>`);
    }
  } else if (context === 'equipped') {
    actions.push(`<button class="btn" onclick="unequipItem('${slot}');UI.closeModal()">Unequip</button>`);
  }
  if (context === 'inv') actions.push(`<button class="btn danger" onclick="sellItem(${it.uid});UI.closeModal()">Sell (🪙 ${it.value})</button>`);

  UI.modal(`
    <h3 style="color:${rar.color}">${it.icon} ${esc(it.name)}</h3>
    <div class="item-sub">${rar.name}${it.type === 'rune' ? ` ${esc(it.baseName || 'Rune')}` : ` · ${esc(it.baseName)}`}${usable && !usable.ok ? ` · <span class="no">✖ ${esc(usable.why)}</span>` : usable ? ' · <span class="yes">✔ usable</span>' : ''}</div>
    ${statsHtml}
    ${targets.length && baseline !== undefined ? UI.cmpLegendHtml() : ''}
    ${targets.map(t => UI.equippedBlockHtml(t, it.slot === 'ring' ? UI.ringLabel(t) : 'Currently equipped')).join('')}
    <div class="modal-actions">${actions.join('')}<button class="btn" onclick="UI.closeModal()">Close</button></div>`);
};

// ------------------------------------------------------------
// Shop tab
// ------------------------------------------------------------
UI.renderShop = function (el) {
  if (!G.shop || !G.shop.stock) genShopStock();
  const stock = G.shop.stock;
  el.innerHTML = `
    <div class="panel">
      <h3>🛒 Traveling Merchant
        <span class="filters">
          <button class="btn btn-tiny" onclick="restockShop()" ${G.gold < restockCost() ? 'disabled' : ''}>♻ New stock (🪙 ${restockCost()})</button>
        </span>
      </h3>
      <p class="hint">Wares are generated for area level ${shopIlvl()} and priced at 6× their sell value. Free new stock arrives whenever you return from an adventure.</p>
      ${stock.length === 0 ? '<p class="hint">Sold out! Come back after your next adventure.</p>' : ''}
      <div class="inv-grid">
        ${stock.map(it => {
          const usable = it.type === 'item' ? canUseItem(it) : null;
          const afford = G.gold >= it.price;
          return `<div class="inv-item rar-${it.rarity} ${usable && !usable.ok ? 'unusable' : ''}" onclick="UI.showShopItem(${it.uid})">
            <div class="inv-icon">${it.icon}</div>
            <div class="inv-name" style="color:${DATA.RARITIES[it.rarity].color}">${esc(it.name)}</div>
            <div class="inv-sub">${it.type === 'rune' ? `Rune · ${it.bonuses.length} bonus` : `${DATA.SLOT_LABEL[it.slot === 'ring' ? 'ring1' : it.slot] || cap(it.slot)} · ${esc(it.baseName)}`}</div>
            ${usable ? `<div class="inv-usable ${usable.ok ? 'yes' : 'no'}">${usable.ok ? '✔ usable' : '✖ ' + esc(usable.why)}</div>` : ''}
            <div class="shop-price ${afford ? '' : 'poor'}">🪙 ${it.price.toLocaleString()}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
};

UI.showShopItem = function (uid) {
  const it = G.shop && G.shop.stock.find(i => i.uid === uid);
  if (!it) return;
  const rar = DATA.RARITIES[it.rarity];
  const usable = it.type === 'item' ? canUseItem(it) : null;
  const afford = G.gold >= it.price;
  const targets = compareTargetsFor(it);
  const baseline = it.type === 'item' ? baselineFor(targets) : undefined;
  const statsHtml = UI.itemStatsHtml(it, baseline);
  UI.modal(`
    <h3 style="color:${rar.color}">${it.icon} ${esc(it.name)}</h3>
    <div class="item-sub">${rar.name}${it.type === 'rune' ? ` ${esc(it.baseName || 'Rune')}` : ` · ${esc(it.baseName)}`}${usable && !usable.ok ? ` · <span class="no">✖ ${esc(usable.why)}</span>` : usable ? ' · <span class="yes">✔ usable</span>' : ''}</div>
    ${statsHtml}
    ${targets.length && baseline !== undefined ? UI.cmpLegendHtml() : ''}
    ${targets.map(t => UI.equippedBlockHtml(t, it.slot === 'ring' ? UI.ringLabel(t) : 'Currently equipped')).join('')}
    <div class="modal-actions">
      <button class="btn btn-primary" ${afford ? '' : 'disabled'} onclick="buyShopItem(${it.uid});UI.closeModal()">Buy (🪙 ${it.price.toLocaleString()})</button>
      <button class="btn" onclick="UI.closeModal()">Close</button>
    </div>`);
};

UI.pickSocketTarget = function (runeUid) {
  const targets = socketableItems();
  if (!targets.length) { UI.modal(`<h3>🪨 No socketable items</h3><p class="hint">Weapons, armors, helmets and shields can roll rune slots. Find one with an empty socket!</p><div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`); return; }
  UI.modal(`
    <h3>🪨 Socket rune into…</h3>
    <div class="socket-targets">
      ${targets.map(t => `<button class="btn socket-target" onclick="socketRune(${runeUid},${t.uid});UI.closeModal()">
        ${t.icon} <span style="color:${DATA.RARITIES[t.rarity].color}">${esc(t.name)}</span>
        <small>(${t.runes.length}/${t.sockets} sockets used)${equippedItems().includes(t) ? ' · equipped' : ''}</small>
      </button>`).join('')}
    </div>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Cancel</button></div>`);
};

// ------------------------------------------------------------
// Adventure tab
// ------------------------------------------------------------
UI.renderAdventure = function (el) {
  const info = areaInfo(G.area);
  const kills = G.progress[G.area] || 0;
  const nextTier = nextCreatureTier(kills);
  el.innerHTML = `
    <div class="two-col">
      <div class="panel">
        <h3>🗺️ Area Selection</h3>
        <div class="area-picker">
          <button class="btn" ${G.area <= 1 || ADV ? 'disabled' : ''} onclick="G.area--;saveGame();UI.refresh()">◀</button>
          <div class="area-info">
            <div class="area-name">${info.type.icon} ${esc(info.biome)}</div>
            <div class="area-sub">Level ${G.area} / ${MAX_LEVEL_AREA} · ${info.type.type} biome ${G.bossKilled[G.area] ? '· 🏆 boss defeated' : ''}</div>
          </div>
          <button class="btn" ${G.area >= G.unlocked || ADV ? 'disabled' : ''} onclick="G.area++;saveGame();UI.refresh()">▶</button>
        </div>
        <div class="bar progress-bar" title="${kills}/${CREATURES_PER_LEVEL} creatures">
          <div style="width:${kills / CREATURES_PER_LEVEL * 100}%"></div>
          <span>${kills} / ${CREATURES_PER_LEVEL} slain</span>
        </div>
        <div class="pattern-hint">Next up: <b>${nextTier ? { normal: 'Normal creature', rare: '🔷 Rare creature', epic: '🟣 Epic creature', legendary: '🔶 LEGENDARY BOSS' }[nextTier] : 'Level cleared!'}</b></div>
        <div class="pattern-hint hint">Every 11th kill is a 🔷 Rare · every 111th a 🟣 Epic · the 1,111th is the 🔶 Legendary Boss. Slay the boss to unlock the next level.</div>
        <div class="pack-row">
          <span>⚔️ Enemies at once:</span>
          ${[1, 2, 3, 4, 5].map(n => `<button class="btn btn-tiny ${G.settings.packSize === n ? 'active' : ''}" onclick="setPackSize(${n})">${n}</button>`).join('')}
          <small class="hint-inline">more enemies = faster progress, more danger</small>
        </div>
        <h3>Local wildlife</h3>
        <div class="wildlife">
          ${info.type.creatures.map(cr => `<div class="creature-chip" title="${esc(cr.attack)} (${cr.atkType}) — res ⚔️${cr.res.phys}% ✨${cr.res.magic}% ☠️${cr.res.poison}%">${esc(cr.name)}</div>`).join('')}
        </div>
        ${ADV ? `
          <div class="adv-status">
            <div class="adv-buttons">
              <button class="btn danger" onclick="stopAdventure()">🏳️ Retreat now</button>
              <span class="speed-ctl">Speed:
                <button class="btn btn-tiny ${ADV.speedMs === 300 ? 'active' : ''}" onclick="setAdvSpeed(300)">1×</button>
                <button class="btn btn-tiny ${ADV.speedMs === 100 ? 'active' : ''}" onclick="setAdvSpeed(100)">3×</button>
                <button class="btn btn-tiny ${ADV.speedMs === 30 ? 'active' : ''}" onclick="setAdvSpeed(30)">10×</button>
                <button class="btn btn-tiny ${ADV.speedMs === 10 ? 'active' : ''}" onclick="setAdvSpeed(10)">MAX</button>
              </span>
            </div>
            <p class="hint">Your hero fights until the boss falls or their HP hits 0. ⚠️ Falling in battle resets this level's progress — retreat while you still can to keep it!</p>
          </div>` : `
          <button class="btn btn-primary btn-big" onclick="startAdventure()">⚔️ ADVENTURE!</button>
          <p class="hint">Your hero fights round by round until the level boss falls or they drop to 0 HP. ⚠️ Falling in battle resets this level's progress (loot, gold and XP are kept) — retreating manually keeps your progress. Potions found are drunk on the spot.</p>`}
      </div>
      <div class="panel">
        <h3>⚔️ Current Fight</h3>
        <div id="enemy-panel">${UI.enemyPanelHtml()}</div>
        <h3>📖 Battle Log</h3>
        <div id="battle-log" class="battle-log">${UI.logHtml()}</div>
      </div>
    </div>`;
  UI.scrollLog();
};

// Detailed cards for every enemy in the current fight.
UI.enemyPanelHtml = function () {
  if (!ADV || !ADV.fight) {
    return `<p class="hint">${ADV ? '🥾 Traveling to the next encounter…' : 'No fight in progress.'}</p>`;
  }
  const f = ADV.fight;
  const tierColor = { normal: '#c8c8c8', rare: '#6c9bff', epic: '#c77dff', legendary: '#ff8b3d' };
  return `<div class="round-ind">Round ${f.round} · your gauge ${Math.round(f.playerGauge)}/100 (+${ADV.d.speed}/round)</div>
    <div class="enemy-cards">
    ${f.enemies.map(e => `
      <div class="enemy-card ${e.hp <= 0 ? 'dead' : ''} tierb-${e.tier}">
        <div class="enemy-name" style="color:${tierColor[e.tier]}">${e.hp <= 0 ? '☠️ ' : ''}${esc(e.name)}</div>
        <div class="enemy-sub">${e.tier !== 'normal' ? `${cap(e.tier)} ${esc(e.species)} · ` : ''}Lv ${e.level}</div>
        <div class="bar enemy-hp"><div style="width:${Math.max(0, e.hp / e.maxHp * 100)}%"></div><span>${Math.max(0, Math.round(e.hp))}/${e.maxHp}</span></div>
        <div class="enemy-stats">
          <span title="damage">🗡️ ${e.dmg}</span>
          <span title="speed — gauge gained per round">⚡ ${e.spd}</span>
          <span title="attack">${esc(e.attack)} (${e.atkType})</span>
          ${e.stunned > 0 ? '<span>💫 stunned</span>' : ''}
        </div>
        <div class="enemy-stats res" title="resistances">⚔️ ${e.res.phys}% · ✨ ${e.res.magic}% · ☠️ ${e.res.poison}%</div>
        <div class="bar enemy-gauge" title="action gauge"><div style="width:${Math.min(100, e.gauge)}%"></div></div>
      </div>`).join('')}
    </div>`;
};

UI.logHtml = function () {
  if (!LOG.length) return '<p class="hint">The log fills up while adventuring…</p>';
  return LOG.slice(-150).map(l => `<div class="log-line log-${l.t} ${l.tier ? 'tier-' + l.tier : ''} ${l.rarity ? 'rar-txt-' + l.rarity : ''}">${esc(l.txt)}</div>`).join('');
};

UI.refreshAdventure = function () {
  UI.renderTopbar();
  if (activeTab !== 'adventure') return;
  const panel = $('#enemy-panel');
  if (panel) panel.innerHTML = UI.enemyPanelHtml();
  const logEl = $('#battle-log');
  if (logEl) logEl.innerHTML = UI.logHtml();
  const kills = G.progress[ADV ? ADV.level : G.area] || 0;
  const pb = document.querySelector('.progress-bar');
  if (pb) {
    pb.querySelector('div').style.width = (kills / CREATURES_PER_LEVEL * 100) + '%';
    pb.querySelector('span').textContent = `${kills} / ${CREATURES_PER_LEVEL} slain`;
  }
  UI.scrollLog();
};

UI.scrollLog = function () {
  const logEl = $('#battle-log');
  if (logEl) logEl.scrollTop = logEl.scrollHeight;
};

// ------------------------------------------------------------
// Results modal
// ------------------------------------------------------------
UI.showResults = function (run, level) {
  const info = areaInfo(level);
  const k = run.kills;
  const totalKills = k.normal + k.rare + k.epic + k.legendary;
  const outcomeTxt = {
    boss: '🏆 VICTORY! The Legendary Boss has fallen!',
    defeated: `💀 You fell in battle — the level resets!${run.progressLost ? ` ${run.progressLost} kills of progress lost.` : ''} Loot and XP are yours to keep.`,
    stalemate: '🏳️ The battle dragged on forever; you slipped away.',
    manual: '🏳️ You chose to retreat — progress is kept.',
    done: '🏁 Nothing left to fight here.',
  }[run.outcome] || 'The adventure ends.';
  // loot breakdown by type
  const drops = { normal: 0, magical: 0, rare: 0, epic: 0, legendary: 0, rune: 0 };
  for (const it of run.items) { if (it.type === 'rune') drops.rune++; else drops[it.rarity]++; }
  const dropChips = [
    ...Object.keys(DATA.RARITIES).filter(r => drops[r]).map(r =>
      `<span class="drop-chip" style="color:${DATA.RARITIES[r].color}">${drops[r]} ${DATA.RARITIES[r].name}</span>`),
    ...(drops.rune ? [`<span class="drop-chip" style="color:#d9a94c">${drops.rune} Rune${drops.rune > 1 ? 's' : ''}</span>`] : []),
  ];
  UI.modal(`
    <h3>${outcomeTxt}</h3>
    <div class="item-sub">${info.type.icon} ${esc(info.biome)} — Level ${level}</div>
    <h4>Battle report</h4>
    <div class="results-grid">
      <div class="res-box"><b>⚔️ ${Math.round(run.dmgDealt).toLocaleString()}</b><span>damage dealt</span></div>
      <div class="res-box"><b>🩸 ${Math.round(run.dmgTaken).toLocaleString()}</b><span>damage taken</span></div>
      <div class="res-box"><b>${run.xp.toLocaleString()}</b><span>XP${run.levelUps ? ` (+${run.levelUps} level${run.levelUps > 1 ? 's' : ''}!)` : ''}</span></div>
      <div class="res-box"><b>🧪 ${run.potions.hp + run.potions.mana + run.potions.buff}</b><span>potions drunk</span></div>
    </div>
    <h4>Creatures slain — ${totalKills}</h4>
    <div class="results-grid">
      <div class="res-box"><b>${k.normal}</b><span>normal</span></div>
      <div class="res-box"><b style="color:#6c9bff">${k.rare}</b><span>rare</span></div>
      <div class="res-box"><b style="color:#c77dff">${k.epic}</b><span>epic</span></div>
      <div class="res-box"><b style="color:#ff8b3d">${k.legendary}</b><span>legendary</span></div>
    </div>
    <h4>Spoils</h4>
    <div class="results-grid results-grid-2">
      <div class="res-box"><b class="gold">🪙 ${run.gold.toLocaleString()}</b><span>gold</span></div>
      <div class="res-box"><b>📦 ${run.items.length}</b><span>items dropped</span></div>
    </div>
    ${dropChips.length ? `<div class="drop-chips">${dropChips.join(' · ')}</div>` : ''}
    ${run.items.length ? `<h4>Loot acquired</h4>
      <div class="loot-list">
        ${run.items.map(it => `<div class="loot-row" onclick="UI.showItem(${it.uid},'inv')">
          ${it.icon} <span style="color:${DATA.RARITIES[it.rarity].color}">${esc(it.name)}</span>
          <small>${it.type === 'rune' ? `rune · ${it.bonuses.length} bonus` : `${DATA.RARITIES[it.rarity].name} · ${esc(it.baseName)}`}</small>
        </div>`).join('')}
      </div>` : '<p class="hint">No items this time — the wilds are stingy.</p>'}
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="UI.closeModal();startAdventure()">⚔️ Adventure again</button>
      <button class="btn" onclick="UI.closeModal()">Close</button>
    </div>`);
};

// ------------------------------------------------------------
// Modal helpers
// ------------------------------------------------------------
UI.modal = function (innerHtml) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-backdrop" onclick="if(event.target===this)UI.closeModal()"><div class="modal">${innerHtml}</div></div>`;
};
UI.closeModal = function () { $('#modal-root').innerHTML = ''; };

window.addEventListener('DOMContentLoaded', UI.init);
