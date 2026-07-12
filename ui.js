// ============================================================
// KHARUN LANDS — UI
// ============================================================
'use strict';

const UI = {};
let activeTab = 'adventure';       // adventure | character | city | journal
let activeCharSub = 'character';   // character | skills | inventory
let activeCitySub = 'shop';        // shop | tavern
let invFilter = 'all';     // all | usable
let invType = 'all';       // all | rune | <slot>
let invSort = 'rarity';    // rarity | type | value | name

const $ = sel => document.querySelector(sel);
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// ------------------------------------------------------------
// Screens
// ------------------------------------------------------------
UI.init = function () {
  const save = peekSave();
  if (save) UI.showTitle(save);
  else UI.showPrelude();
};

// One-time lore screen shown before a hero is chosen.
UI.showPrelude = function () {
  $('#app').innerHTML = `
    <div class="class-select prelude-screen">
      <h1>⚔️ KHARUN LANDS</h1>
      <div class="prelude-box">
        <h2 class="prelude-title">${esc(DATA.PRELUDE.title)}</h2>
        ${DATA.PRELUDE.paragraphs.map(p => `<p class="prelude-text">${esc(p)}</p>`).join('')}
        <button class="btn btn-primary btn-big" id="begin-btn">📜 Take Up the Contract</button>
      </div>
      <p class="subtitle version-tag">v${DATA.VERSION}</p>
    </div>`;
  $('#begin-btn').onclick = () => UI.showClassSelect();
};

// Title screen when a saved hero exists: Continue or start over.
UI.showTitle = function (save) {
  const c = save.char;
  const cls = DATA.CLASSES[c.cls];
  $('#app').innerHTML = `
    <div class="class-select">
      <h1>⚔️ KHARUN LANDS</h1>
      <p class="subtitle">A hero awaits. Your progress is saved automatically in this browser. <span class="version-tag">v${DATA.VERSION}</span></p>
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
      UI.showPrelude();
    }
  };
};

// Shown once, full-screen, the first time a hero enters a chapter —
// currently only used for Chapter 1, right after character creation.
UI.showChapterIntro = function (chapterNum) {
  const startLevel = (chapterNum - 1) * 10 + 1;
  const ch = chapterData(startLevel);
  const icon = DATA.BIOME_TYPES[chapterNum - 1].icon;
  const partName = areaInfo(startLevel).biome;
  const partBeginning = partStory(startLevel, 'beginning');
  $('#app').innerHTML = `
    <div class="class-select prelude-screen">
      <h1>⚔️ KHARUN LANDS</h1>
      <div class="prelude-box">
        <h2 class="prelude-title">${icon} ${esc(ch.title)}</h2>
        ${ch.headline ? `<p class="chapter-headline-big">${esc(ch.headline)}</p>` : ''}
        ${ch.story.map(p => `<p class="prelude-text">${esc(p)}</p>`).join('')}
        <h3 class="part-intro-header">${esc(partName)}</h3>
        <p class="prelude-text">${esc(partBeginning)}</p>
        <button class="btn btn-primary btn-big" id="chapter-start-btn">▶ Start</button>
      </div>
    </div>`;
  $('#chapter-start-btn').onclick = () => UI.showGame();
};

// Mid-chapter transition: just the next Part's header + beginning
// story, shown after a boss-victory Continue click (when the next
// level doesn't start a new chapter — that case uses the full
// showChapterIntro instead).
UI.showPartIntro = function (level) {
  const locName = areaInfo(level).biome;
  const beginning = partStory(level, 'beginning');
  const chapter = chapterData(level);
  $('#app').innerHTML = `
    <div class="class-select prelude-screen">
      <h1>⚔️ KHARUN LANDS</h1>
      <div class="prelude-box">
        <div class="part-intro-chapter-tag">${esc(chapter.title)}</div>
        <h2 class="prelude-title part-intro-header">${esc(locName)}</h2>
        <p class="prelude-text">${esc(beginning)}</p>
        <button class="btn btn-primary btn-big" id="part-start-btn">▶ Start</button>
      </div>
    </div>`;
  $('#part-start-btn').onclick = () => UI.showGame();
};

// Called after the boss-victory modal's Continue button. Routes to a
// full chapter intro if the next level starts a new chapter, a plain
// part intro otherwise, or straight back into the game if there's no
// next level (level 100 cleared).
UI.afterBossVictory = function (clearedLevel) {
  const nextLevel = clearedLevel + 1;
  if (nextLevel > MAX_LEVEL_AREA) { UI.showGame(); return; }
  if ((nextLevel - 1) % 10 === 0) UI.showChapterIntro(chapterNumOf(nextLevel));
  else UI.showPartIntro(nextLevel);
};

UI.showClassSelect = function () {
  const app = $('#app');
  app.innerHTML = `
    <div class="class-select">
      <h1>⚔️ KHARUN LANDS</h1>
      <p class="subtitle">Three heroes, one road. Choose who answers: <span class="version-tag">v${DATA.VERSION}</span></p>
      <div class="class-cards">
        ${Object.values(DATA.CLASSES).map(c => `
          <div class="class-card" data-cls="${c.id}">
            <div class="class-icon">${c.icon}</div>
            <h2>${esc(c.heroName)}</h2>
            <div class="class-title">${c.name}</div>
            <p class="class-desc">${c.desc}</p>
            <p class="class-story">${c.story}</p>
            <p class="class-playstyle">💡 ${c.playstyle}</p>
            <div class="class-stats">
              <div class="${c.mainStat === 'str' ? 'main-stat-chip' : ''}">${c.mainStat === 'str' ? '<span class="star-icon">⭐</span>' : ''}<span class="stat-str">STR</span> ${c.baseStats.str}</div>
              <div class="${c.mainStat === 'dex' ? 'main-stat-chip' : ''}">${c.mainStat === 'dex' ? '<span class="star-icon">⭐</span>' : ''}<span class="stat-dex">DEX</span> ${c.baseStats.dex}</div>
              <div class="${c.mainStat === 'int' ? 'main-stat-chip' : ''}">${c.mainStat === 'int' ? '<span class="star-icon">⭐</span>' : ''}<span class="stat-int">INT</span> ${c.baseStats.int}</div>
            </div>
            <div class="class-mainstat">⭐ Main stat: <span class="stat-${c.mainStat}">${{ str: 'Strength', dex: 'Dexterity', int: 'Intelligence' }[c.mainStat]}</span> — each point grants +1% damage</div>
            <div class="class-armor">Armor: ${c.armorWeights.map(cap).join(', ')}</div>
            <div class="class-skills-preview">
              ${Object.values(DATA.SKILLS[c.id]).slice(0, 6).map(s => `<span title="${esc(s.name)}">${s.icon}</span>`).join('')}…
            </div>
            <button class="btn btn-primary pick-btn">Play as ${esc(c.heroName)}</button>
          </div>`).join('')}
      </div>
    </div>`;
  app.querySelectorAll('.class-card').forEach(card => {
    card.querySelector('.pick-btn').onclick = () => {
      newGame(card.dataset.cls);
      UI.showChapterIntro(1);
    };
  });
};

UI.showGame = function () {
  $('#app').innerHTML = `
    <div id="topbar"></div>
    <div id="tabs" class="tabs">
      <button data-tab="adventure">🗺️ Adventure</button>
      <button data-tab="character">🧍 Character</button>
      <button data-tab="city">🏙️ City</button>
      <button data-tab="journal">📔 Journal</button>
    </div>
    <div id="tab-content"></div>
    <div id="modal-root"></div>
    <div id="toast"></div>
    <div class="version-footer">Kharun Lands v${DATA.VERSION}</div>`;
  document.querySelectorAll('#tabs button').forEach(b => {
    b.onclick = () => { activeTab = b.dataset.tab; UI.refresh(); };
  });
  UI.refresh();
};

UI.refresh = function () {
  if (!G) return;
  UI.renderTopbar();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
  // level-up badge: lights up if either stat or skill points are unspent
  const charTab = document.querySelector('#tabs button[data-tab="character"]');
  if (charTab) charTab.innerHTML = `🧍 Character${(G.char.statPoints || G.char.skillPoints) ? ' <span class="lvlup-badge">⬆</span>' : ''}`;
  const el = $('#tab-content');
  if (!el) return;
  if (activeTab === 'character') UI.renderCharacterHub(el);
  else if (activeTab === 'city') UI.renderCityHub(el);
  else if (activeTab === 'journal') UI.renderJournal(el);
  else UI.renderAdventure(el);
};

// ------------------------------------------------------------
// Character hub: Character / Skills / Inventory sub-tabs
// ------------------------------------------------------------
UI.renderCharacterHub = function (el) {
  el.innerHTML = `
    <div class="subtabs">
      <button data-sub="character" class="${activeCharSub === 'character' ? 'active' : ''}">🧍 Character${G.char.statPoints ? ' <span class="lvlup-badge">⬆</span>' : ''}</button>
      <button data-sub="skills" class="${activeCharSub === 'skills' ? 'active' : ''}">📜 Skills${G.char.skillPoints ? ' <span class="lvlup-badge">⬆</span>' : ''}</button>
      <button data-sub="inventory" class="${activeCharSub === 'inventory' ? 'active' : ''}">🎒 Inventory</button>
    </div>
    <div id="char-sub-content"></div>`;
  el.querySelectorAll('.subtabs button').forEach(b => b.onclick = () => { activeCharSub = b.dataset.sub; UI.refresh(); });
  const sc = $('#char-sub-content');
  if (activeCharSub === 'skills') UI.renderSkills(sc);
  else if (activeCharSub === 'inventory') UI.renderInventory(sc);
  else UI.renderCharacter(sc);
};

// ------------------------------------------------------------
// City hub: Shop / Tavern sub-tabs
// ------------------------------------------------------------
UI.renderCityHub = function (el) {
  el.innerHTML = `
    <div class="subtabs">
      <button data-sub="shop" class="${activeCitySub === 'shop' ? 'active' : ''}">🛒 Shop</button>
      <button data-sub="tavern" class="${activeCitySub === 'tavern' ? 'active' : ''}">🍺 Tavern</button>
    </div>
    <div id="city-sub-content"></div>`;
  el.querySelectorAll('.subtabs button').forEach(b => b.onclick = () => { activeCitySub = b.dataset.sub; UI.refresh(); });
  const sc = $('#city-sub-content');
  if (activeCitySub === 'tavern') UI.renderTavern(sc);
  else UI.renderShop(sc);
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
    ${c.statPoints ? `
      <div class="lvlup-banner">⬆ LEVEL UP! You have <b>${c.statPoints} stat point${c.statPoints > 1 ? 's' : ''}</b> to spend below.</div>` : ''}
    <div class="panel level-panel">
      <h3>📈 Level ${c.level} ${cls.name}</h3>
      <div class="bar xp-bar xp-bar-big" title="XP: ${c.xp}/${xpNeed}"><div style="width:${Math.min(100, c.xp / xpNeed * 100)}%"></div><span>XP ${c.xp.toLocaleString()} / ${xpNeed.toLocaleString()} — next level grants +3 stat points, +1 skill point</span></div>
    </div>
    <div class="two-col">
      <div class="panel">
        <h3>Main Stats ${c.statPoints ? `<span class="pts">(${c.statPoints} points to spend)</span>` : ''}</h3>
        ${statRow('str', cls.mainStat === 'str' ? '⭐ Strength' : 'Strength', 'stat-str', `drives HP & HP Regen${cls.mainStat === 'str' ? ' · MAIN: +1% dmg/point' : ''}`)}
        ${statRow('dex', cls.mainStat === 'dex' ? '⭐ Dexterity' : 'Dexterity', 'stat-dex', `drives Speed, Evasion & attack rate${cls.mainStat === 'dex' ? ' · MAIN: +1% dmg/point' : ''}`)}
        ${statRow('int', cls.mainStat === 'int' ? '⭐ Intelligence' : 'Intelligence', 'stat-int', `drives Mana & Mana Regen${cls.mainStat === 'int' ? ' · MAIN: +1% dmg/point' : ''}`)}
        <h3>Important Stats</h3>
        <div class="stat-row"><span>❤️ Max HP</span><b>${d.maxHp}</b></div>
        <div class="stat-row"><span>⚡ Speed</span><b>${d.speed}</b><small class="effect">gauge/round — act at 100</small></div>
        <div class="stat-row"><span>🔵 Max Mana</span><b>${d.maxMana}</b></div>
        <h3>Sub Stats</h3>
        <div class="stat-row"><span>💗 HP Regen</span><b>${d.hpRegen}</b></div>
        <div class="stat-row"><span>💨 Evasion</span><b>${d.evasion}%</b></div>
        <div class="stat-row"><span>💧 Mana Regen</span><b>${d.manaRegen}</b></div>
        <div class="stat-row"><span>👝 Potion Capacity</span><b>${potionCapacity()}</b><small class="effect">${G.char.equip.belt ? esc(G.char.equip.belt.name) : 'no belt equipped — base 2'}</small></div>
        <h3>Combat</h3>
        <div class="stat-row"><span>🗡️ Damage</span><b>${d.baseDmgMin.toLocaleString()}–${d.baseDmgMax.toLocaleString()}</b>${d.weaponMagic ? ' <small>(magic)</small>' : ''}</div>
        <div class="stat-row"><span>⏱️ Attack Interval</span><b>${d.atkInterval}</b><small class="effect">weapon ×${d.atkFactor} — lower = faster swings</small></div>
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
    ${c.skillPoints ? `<div class="lvlup-banner">⬆ You have <b>${c.skillPoints} unused skill point${c.skillPoints > 1 ? 's' : ''}</b> — learn or rank up a skill below!</div>` : ''}
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
const INV_TYPES = [
  ['all', 'All types'], ['weapon', 'Weapon'], ['offhand', 'Off Hand / Shield'],
  ['helmet', 'Helmet'], ['armor', 'Armor'], ['gloves', 'Gloves'], ['pants', 'Pants'], ['boots', 'Footwear'],
  ['amulet', 'Amulet'], ['ring', 'Ring'], ['cloak', 'Cloak'], ['rune', 'Rune'],
];
const INV_SORTS = [['rarity', 'Rarity'], ['type', 'Type'], ['value', 'Value'], ['name', 'Name']];

function invTypeOf(i) { return i.type === 'rune' ? 'rune' : i.slot; }
function slotOrderOf(i) {
  if (i.type === 'rune') return 99;
  const idx = DATA.SLOTS.indexOf(i.slot === 'ring' ? 'ring1' : i.slot);
  return idx < 0 ? 98 : idx;
}

UI.renderInventory = function (el) {
  const rarOrder = Object.keys(DATA.RARITIES);
  const items = G.inventory.filter(i => {
    if (invFilter === 'usable' && !(i.type === 'item' && canUseItem(i).ok)) return false;
    if (invType !== 'all' && invTypeOf(i) !== invType) return false;
    return true;
  });
  const byRarity = (a, b) => rarOrder.indexOf(b.rarity) - rarOrder.indexOf(a.rarity) || b.ilvl - a.ilvl;
  items.sort({
    rarity: byRarity,
    type: (a, b) => slotOrderOf(a) - slotOrderOf(b) || byRarity(a, b),
    value: (a, b) => b.value - a.value,
    name: (a, b) => a.name.localeCompare(b.name),
  }[invSort] || byRarity);
  el.innerHTML = `
    <div class="panel">
      <h3>Inventory (${G.inventory.length})
        <span class="filters">
          ${['all', 'usable'].map(f => `<button class="btn btn-tiny ${invFilter === f ? 'active' : ''}" data-f="${f}">${cap(f)}</button>`).join('')}
          <label class="inv-select">Type <select id="inv-type">${INV_TYPES.map(([v, l]) => `<option value="${v}" ${invType === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
          <label class="inv-select">Sort <select id="inv-sort">${INV_SORTS.map(([v, l]) => `<option value="${v}" ${invSort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
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
  const typeSel = $('#inv-type'); if (typeSel) typeSel.onchange = () => { invType = typeSel.value; UI.refresh(); };
  const sortSel = $('#inv-sort'); if (sortSel) sortSel.onchange = () => { invSort = sortSel.value; UI.refresh(); };
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
  if (it.potionCap) m.potionCap = it.potionCap;
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
    ${it.potionCap ? `<div class="istat ${cls('potionCap')}">Potion Capacity: <b>+${it.potionCap}</b> (HP &amp; Mana each)</div>` : ''}
    ${it.spd ? `<div class="istat ${cls('spd')}">Speed: <b>+${it.spd}</b></div>` : ''}
    ${it.atkSpd ? `<div class="istat">Attack Speed: <b>${it.atkSpd < 0.8 ? 'Very Fast' : it.atkSpd < 1 ? 'Fast' : it.atkSpd === 1 ? 'Normal' : it.atkSpd <= 1.2 ? 'Slow' : 'Very Slow'}</b> (×${it.atkSpd})</div>` : ''}
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

// ------------------------------------------------------------
// Tavern tab
// ------------------------------------------------------------
UI.renderTavern = function (el) {
  if (!G.tavern) genTavernBoard();
  const t = G.tavern;
  const questCard = (q, idx) => `
    <div class="quest-card ${idx === -1 ? 'active-quest' : ''}">
      <div class="quest-head">${q.icon} <b>${esc(q.name)}</b>
        ${idx === -1 ? `<span class="quest-tag">ACTIVE</span>` : ''}
      </div>
      <div class="quest-desc">${esc(q.desc)}</div>
      <div class="quest-reward">Reward: ${[
        q.reward.gold ? `🪙 ${q.reward.gold.toLocaleString()}` : '',
        q.reward.xp ? `✨ ${q.reward.xp.toLocaleString()} XP` : '',
        q.reward.item ? `<span style="color:${DATA.RARITIES[q.reward.item].color}">${cap(q.reward.item)} item</span>` : '',
      ].filter(Boolean).join(' + ')}</div>
      ${idx === -1 ? `
        <div class="bar quest-bar"><div style="width:${Math.min(100, (q.progress || 0) / q.target * 100)}%"></div><span>${(q.progress || 0).toLocaleString()} / ${q.target.toLocaleString()}</span></div>
        <button class="btn btn-tiny danger" onclick="if(confirm('Abandon this quest? Progress is lost.'))abandonQuest()">✖ Abandon</button>`
      : `<button class="btn btn-primary btn-small" ${t.active ? 'disabled' : ''} onclick="acceptQuest(${idx})">${t.active ? 'Finish your quest first' : 'Accept'}</button>`}
    </div>`;
  el.innerHTML = `
    <div class="panel">
      <h3>🍺 The Weary Wyvern Tavern</h3>
      <p class="hint">The tavern hums with rumors. Take a quest — only one at a time — and its progress counts automatically while you adventure. New rumors arrive whenever you return home.</p>
      ${t.active ? `<h4>Your current quest</h4>${questCard(t.active, -1)}` : ''}
      <h4>Quest board</h4>
      ${t.board.length ? `<div class="quest-board">${t.board.map((q, i) => questCard(q, i)).join('')}</div>` : '<p class="hint">The board is empty — come back after an adventure.</p>'}
    </div>`;
};

// ------------------------------------------------------------
// Journal tab: Prologue + Chapter/Part progress as nested
// open-close (<details>) menus. Current = gold, past = faded +
// strikethrough, not-yet-reached = dim and locked.
// ------------------------------------------------------------
UI.renderJournal = function (el) {
  const frontier = Math.min(G.unlocked || 1, MAX_LEVEL_AREA);
  const curChapterNum = chapterNumOf(frontier);

  const partEntry = (bt, chapterIdx, partIdx) => {
    const level = chapterIdx * 10 + partIdx + 1;
    const locName = bt.biomes[partIdx];
    const cleared = !!G.bossKilled[level];
    const isCurrent = !cleared && level === frontier;
    const isFuture = level > frontier;
    const state = cleared ? 'past' : isCurrent ? 'current' : 'future';
    const kills = G.progress[level] || 0;
    const body = cleared
      ? `<p>🏆 Cleared — the legendary boss of ${esc(locName)} has fallen. This ground can still be walked again, but its tale here is told.</p>`
      : isFuture
        ? `<p class="hint">🔒 Not yet reached.</p>`
        : `<p>${Math.floor(kills / CREATURES_PER_LEVEL * 100)}% cleared so far.</p>`;
    return `<details class="journal-entry journal-part ${state}" ${isCurrent ? 'open' : ''}>
      <summary>Part ${partIdx + 1}: ${esc(locName)}</summary>
      <div class="journal-body">${body}</div>
    </details>`;
  };

  // Only chapters reached so far (past or current) are shown at all —
  // unreached chapters aren't listed, not even locked.
  const chapterEntry = (bt, i) => {
    const chapterNum = i + 1;
    const ch = chapterData(chapterNum * 10 - 9);
    const state = chapterNum < curChapterNum ? 'past' : 'current';
    const parts = Array.from({ length: 10 }, (_, p) => partEntry(bt, i, p)).join('');
    return `<details class="journal-entry journal-chapter ${state}" ${state === 'current' ? 'open' : ''}>
      <summary>${bt.icon} ${esc(ch.title)}</summary>
      <div class="journal-body">
        ${ch.headline ? `<p class="chapter-headline">${esc(ch.headline)}</p>` : ''}
        ${ch.story.map(p => `<p class="prelude-text journal-story-text">${esc(p)}</p>`).join('')}
        <div class="journal-parts">${parts}</div>
      </div>
    </details>`;
  };

  const visibleChapters = DATA.BIOME_TYPES.slice(0, curChapterNum);
  el.innerHTML = `
    <div class="panel">
      <h3>📔 Journal</h3>
      <details class="journal-entry journal-prologue">
        <summary>📜 Prologue: ${esc(DATA.PRELUDE.title)}</summary>
        <div class="journal-body">${DATA.PRELUDE.paragraphs.map(p => `<p class="prelude-text journal-story-text">${esc(p)}</p>`).join('')}</div>
      </details>
      ${visibleChapters.map(chapterEntry).join('')}
    </div>`;
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
  const chapter = chapterData(G.area);
  const kills = G.progress[G.area] || 0;
  const nextTier = nextCreatureTier(kills);
  el.innerHTML = `
    <div class="two-col">
      <div class="panel">
        <h3>📖 ${esc(chapter.title)}</h3>
        ${chapter.headline ? `<p class="chapter-headline">${esc(chapter.headline)}</p>` : ''}
        <div class="area-picker">
          <button class="btn" ${G.area <= 1 || ADV ? 'disabled' : ''} onclick="G.area--;saveGame();UI.refresh()">◀</button>
          <div class="area-info">
            <div class="area-name">${info.type.icon} ${esc(info.biome)}</div>
            <div class="area-sub">Level ${G.area} / ${MAX_LEVEL_AREA} ${G.bossKilled[G.area] ? '· 🏆 boss defeated' : ''}</div>
          </div>
          <button class="btn" ${G.area >= G.unlocked || ADV ? 'disabled' : ''} onclick="G.area++;saveGame();UI.refresh()">▶</button>
        </div>
        <div class="bar progress-bar" title="Level progress">
          <div style="width:${kills / CREATURES_PER_LEVEL * 100}%"></div>
          <span>${Math.floor(kills / CREATURES_PER_LEVEL * 100)}% cleared</span>
        </div>
        <div class="pattern-hint">Next up: <b>${nextTier ? { normal: 'Normal creature', rare: '🔷 Rare creature', epic: '🟣 Epic creature', legendary: '🔶 LEGENDARY BOSS' }[nextTier] : 'Level cleared!'}</b></div>
        <div class="pattern-hint hint">Every 11th kill is a 🔷 Rare · every 111th a 🟣 Epic · the 1,111th is the 🔶 Legendary Boss. Slay the boss to unlock the next level.</div>
        <div class="pack-row">
          <span>⚔️ Enemies at once:</span>
          ${[1, 2, 3, 4, 5].map(n => `<button class="btn btn-tiny ${G.settings.packSize === n ? 'active' : ''}" onclick="setPackSize(${n})">${n}</button>`).join('')}
          <small class="hint-inline">more enemies = faster progress, more danger</small>
        </div>
        <h3>Local wildlife <small>(unique roster for this level)</small></h3>
        <div class="wildlife">
          ${creaturesForLevel(G.area).map(cr => `<div class="creature-chip" title="${esc(cr.attack)} (${cr.atkType}) — res ⚔️${cr.res.phys}% ✨${cr.res.magic}% ☠️${cr.res.poison}%">${esc(cr.name)}</div>`).join('')}
        </div>
        ${ADV ? `
          <div class="adv-status">
            <div class="adv-buttons">
              <button class="btn" onclick="${ADV.paused ? 'resumeAdventure()' : 'pauseAdventure()'}">${ADV.paused ? '▶ Resume' : '⏸ Pause'}</button>
              <button class="btn danger" onclick="stopAdventure()">🏳️ Retreat now</button>
              <span class="speed-ctl">Speed:
                <button class="btn btn-tiny ${ADV.speedMs === 600 ? 'active' : ''}" onclick="setAdvSpeed(600)">1×</button>
                <button class="btn btn-tiny ${ADV.speedMs === 200 ? 'active' : ''}" onclick="setAdvSpeed(200)">3×</button>
                <button class="btn btn-tiny ${ADV.speedMs === 60 ? 'active' : ''}" onclick="setAdvSpeed(60)">10×</button>
                <button class="btn btn-tiny ${ADV.speedMs === 20 ? 'active' : ''}" onclick="setAdvSpeed(20)">MAX</button>
              </span>
            </div>
            <p class="hint">Your hero fights until the boss falls or their HP hits 0. ⚠️ Falling in battle resets this level's progress — retreat while you still can to keep it!</p>
          </div>` : `
          <button class="btn btn-primary btn-big" onclick="startAdventure()">⚔️ ADVENTURE!</button>
          <p class="hint">Your hero fights round by round until the level boss falls or they drop to 0 HP. ⚠️ Falling in battle resets this level's progress (loot, gold and XP are kept) — retreating manually keeps your progress. Potions found are drunk on the spot.</p>`}
      </div>
      <div class="panel">
        <h3>⚔️ Battle Arena</h3>
        <div class="battle-arena">
          <div id="player-card">${UI.playerCardHtml()}</div>
          <div id="action-box">${UI.actionBoxHtml()}</div>
          <div id="enemy-panel" class="arena-enemies">${UI.enemyPanelHtml()}</div>
        </div>
        <div id="player-controls">${UI.controlsHtml()}</div>
        <h3>📖 Battle Log</h3>
        <div id="battle-log" class="battle-log">${UI.logHtml()}</div>
      </div>
    </div>`;
  UI.scrollLog();
};

// Left side of the arena: the hero.
UI.playerCardHtml = function () {
  const c = G.char, cls = DATA.CLASSES[c.cls];
  const d = ADV ? ADV.d : derive();
  const gaugePct = ADV && ADV.fight ? Math.min(100, ADV.fight.playerGauge / (d.atkInterval || 100) * 100) : 0;
  return `
    <div class="hero-card">
      <div class="hero-icon">${cls.icon}</div>
      <div class="hero-name">${esc(c.name)}</div>
      <div class="hero-sub">Lv ${c.level} ${cls.name}</div>
      <div class="bar hp-bar"><div style="width:${Math.max(0, c.hp / d.maxHp * 100)}%"></div><span>${Math.round(c.hp).toLocaleString()}/${d.maxHp.toLocaleString()}</span></div>
      <div class="bar mana-bar"><div style="width:${Math.max(0, c.mana / d.maxMana * 100)}%"></div><span>${Math.round(c.mana).toLocaleString()}/${d.maxMana.toLocaleString()}</span></div>
      <div class="bar enemy-gauge" title="attack gauge — swings every ${d.atkInterval} (weapon ×${d.atkFactor})"><div style="width:${gaugePct}%"></div></div>
      ${ADV && ADV.scroll > 0 ? `<div class="scroll-ind">📜 +12% dmg (${ADV.scroll} rounds)</div>` : ''}
      ${ADV && ADV.queued ? `<div class="queued-ind">⏳ ${DATA.SKILLS[c.cls][ADV.queued].icon} ${esc(DATA.SKILLS[c.cls][ADV.queued].name)} queued</div>` : ''}
    </div>`;
};

// Middle of the arena: whatever just happened.
UI.actionBoxHtml = function () {
  const a = ADV && ADV.lastAction;
  if (!a) return `<div class="action-inner idle"><div class="action-icon">⚔️</div><div class="action-txt">…</div></div>`;
  return `<div class="action-inner ${a.side}">
    <div class="action-arrow">${a.side === 'player' ? '➡️' : '⬅️'}</div>
    <div class="action-icon">${a.icon}</div>
    <div class="action-txt">${esc(a.txt)}</div>
  </div>`;
};

// Under the arena: manual potions and activatable skills.
UI.controlsHtml = function () {
  const potCap = potionCapacity();
  if (!ADV) return `<p class="hint">🧪 Potions stored: ❤️ ${G.potions.hp}/${potCap} · 🔵 ${G.potions.mana}/${potCap}${G.char.equip.belt ? ` (${esc(G.char.equip.belt.name)} equipped)` : ' — no belt equipped, base capacity only'} — usable during adventures.</p>`;
  const c = G.char;
  const potBtn = (kind, icon, label) => {
    const cd = ADV.potCd[kind] || 0;
    const n = G.potions[kind] || 0;
    return `<button class="btn pot-btn ${cd > 0 ? 'on-cd' : ''}" ${cd > 0 || n <= 0 || ADV.paused ? 'disabled' : ''} onclick="drinkPotion('${kind}')">
      ${icon} ${label} ×${n}/${potCap}${cd > 0 ? ` <span class="cd-num">${cd}</span>` : ''}</button>`;
  };
  const actives = Object.values(DATA.SKILLS[c.cls]).filter(s => !s.passive && s.cat !== 'basic' && (c.skills[s.id] || 0) > 0);
  const skillBtn = s => {
    const cd = ADV.fight ? (ADV.fight.cds[s.id] || 0) : 0;
    const cost = skillCost(s);
    const noMana = G.char.mana < cost;
    const queued = ADV.queued === s.id;
    return `<button class="btn skill-btn ${queued ? 'queued' : ''} ${cd > 0 ? 'on-cd' : ''}" ${cd > 0 || noMana || ADV.paused ? 'disabled' : ''}
      title="${esc(s.desc(Math.max(1, effectiveRank(s.id))))} — ${cost} mana${s.cd ? `, ${s.cd} round cd` : ''}"
      onclick="queueSkill('${s.id}')">${s.icon} ${esc(s.name)}${cd > 0 ? ` <span class="cd-num">${cd}</span>` : ` <small>${cost}</small>`}</button>`;
  };
  return `
    <div class="ctl-row">${potBtn('hp', '❤️', 'Health')} ${potBtn('mana', '🔵', 'Mana')}
      <small class="hint-inline">potions: ${POTION_CD}-tick cooldown · skills: click to cast on your next swing</small></div>
    ${actives.length ? `<div class="ctl-row skill-row-ctl">${actives.map(skillBtn).join('')}</div>` : ''}`;
};

// Detailed cards for every enemy in the current fight.
// grid cells each tier occupies in the 2x3 (mobile-friendly) battle grid
const TIER_CELLS = { normal: 1, rare: 1, miniboss: 2, elf: 2, epic: 2, legendary: 4 };

UI.enemyPanelHtml = function () {
  if (!ADV) return `<p class="hint">No fight in progress.</p>`;
  if (!ADV.fight) {
    return `<p class="hint">🥾 Traveling to the next encounter…</p>
      <div class="enemy-cards">${'<div class="enemy-placeholder"></div>'.repeat(6)}</div>`;
  }
  const f = ADV.fight;
  const used = f.enemies.reduce((s, e) => s + (TIER_CELLS[e.tier] || 1), 0);
  const placeholders = Math.max(0, 6 - used);
  const tierColor = { normal: '#c8c8c8', rare: '#6c9bff', epic: '#c77dff', miniboss: '#4ecdc4', legendary: '#ff8b3d', elf: '#8fd96c' };
  return `<div class="round-ind">Round ${f.round} · your gauge ${Math.round(f.playerGauge)}/100 (+${ADV.d.speed}/round)</div>
    <div class="enemy-cards">
    ${f.enemies.map(e => `
      <div class="enemy-card ${e.hp <= 0 ? 'dead' : ''} tierb-${e.tier}">
        <div class="enemy-name" style="color:${tierColor[e.tier]}">${e.hp <= 0 ? '☠️ ' : ''}${esc(e.name)}</div>
        <div class="enemy-sub">${e.tier !== 'normal' ? `${cap(e.tier)} ${esc(e.species)} · ` : ''}Lv ${e.level}</div>
        <div class="bar enemy-hp"><div style="width:${Math.max(0, e.hp / e.maxHp * 100)}%"></div><span>${Math.max(0, Math.round(e.hp))}/${e.maxHp}</span></div>
        <div class="enemy-stats">
          ${e.tier === 'elf' ? `<span>🎒 Hits: ${f.elfHits || 0}/5 — he never fights back!</span>` : `
          <span title="damage">🗡️ ${e.dmg.toLocaleString()}</span>
          <span title="speed — gauge gained per round">⚡ ${e.spd}</span>
          <span title="attack">${esc(e.attack)} (${e.atkType})</span>`}
          ${e.stunned > 0 ? '<span>💫 stunned</span>' : ''}
        </div>
        <div class="enemy-stats res" title="resistances">⚔️ ${e.res.phys}% · ✨ ${e.res.magic}% · ☠️ ${e.res.poison}%</div>
        <div class="bar enemy-gauge" title="action gauge"><div style="width:${Math.min(100, e.gauge)}%"></div></div>
      </div>`).join('')}
    ${'<div class="enemy-placeholder"></div>'.repeat(placeholders)}
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
  const pc = $('#player-card');
  if (pc) pc.innerHTML = UI.playerCardHtml();
  const ab = $('#action-box');
  if (ab) ab.innerHTML = UI.actionBoxHtml();
  const ctl = $('#player-controls');
  if (ctl) ctl.innerHTML = UI.controlsHtml();
  const logEl = $('#battle-log');
  if (logEl) logEl.innerHTML = UI.logHtml();
  const kills = G.progress[ADV ? ADV.level : G.area] || 0;
  const pb = document.querySelector('.progress-bar');
  if (pb) {
    pb.querySelector('div').style.width = (kills / CREATURES_PER_LEVEL * 100) + '%';
    pb.querySelector('span').textContent = `${Math.floor(kills / CREATURES_PER_LEVEL * 100)}% cleared`;
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
  const chapter = chapterData(level);
  const k = run.kills;
  const totalKills = k.normal + k.rare + k.epic + (k.miniboss || 0) + k.legendary;
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
  const isBoss = run.outcome === 'boss';
  UI.modal(`
    <h3>${outcomeTxt}</h3>
    <div class="item-sub">${info.type.icon} ${esc(chapter.title)} · ${esc(info.biome)} — Level ${level}</div>
    ${isBoss ? `<p class="part-end-story">${esc(partStory(level, 'end'))}</p>` : ''}
    ${isBoss && run.partReward ? `
      <h4>🎁 Quest Reward</h4>
      <div class="quest-reward-box">
        <span class="gold">🪙 ${run.partReward.gold.toLocaleString()}</span>
        <span class="reward-item" style="color:${DATA.RARITIES[run.partReward.item.rarity].color}">${run.partReward.item.icon} ${esc(run.partReward.item.name)} <small>(${DATA.RARITIES[run.partReward.item.rarity].name})</small></span>
      </div>` : ''}
    <h4>Battle report</h4>
    <div class="results-grid">
      <div class="res-box"><b>⚔️ ${Math.round(run.dmgDealt).toLocaleString()}</b><span>damage dealt</span></div>
      <div class="res-box"><b>🩸 ${Math.round(run.dmgTaken).toLocaleString()}</b><span>damage taken</span></div>
      <div class="res-box"><b>${run.xp.toLocaleString()}</b><span>XP${run.levelUps ? ` (+${run.levelUps} level${run.levelUps > 1 ? 's' : ''}!)` : ''}</span></div>
      <div class="res-box"><b>🧪 ${run.potions.hp + run.potions.mana}${run.potions.scroll ? ` · 📜 ${run.potions.scroll}` : ''}</b><span>potions / scrolls found</span></div>
    </div>
    <h4>Creatures slain — ${totalKills}</h4>
    <div class="results-grid">
      <div class="res-box"><b>${k.normal}</b><span>normal</span></div>
      <div class="res-box"><b style="color:#6c9bff">${k.rare}</b><span>rare</span></div>
      <div class="res-box"><b style="color:#c77dff">${k.epic}</b><span>epic</span></div>
      <div class="res-box"><b style="color:#ff8b3d">${k.legendary}</b><span>legendary</span></div>
      ${k.miniboss ? `<div class="res-box"><b style="color:#4ecdc4">👑 ${k.miniboss}</b><span>mini boss${k.miniboss > 1 ? 'es' : ''}</span></div>` : ''}
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
      ${isBoss
        ? `<button class="btn btn-primary" onclick="UI.closeModal();UI.afterBossVictory(${level})">▶ Continue</button>`
        : `<button class="btn btn-primary" onclick="UI.closeModal();startAdventure()">⚔️ Adventure again</button>
           <button class="btn" onclick="UI.closeModal()">Close</button>`}
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
