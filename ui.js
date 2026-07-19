// ============================================================
// KHARUN LANDS — UI
// ============================================================
'use strict';

const UI = {};
let activeTab = 'adventure';       // adventure | character | city | journal
let activeCharSub = 'character';   // character | skills | inventory
let activeCitySub = 'shop';        // shop | tavern | enchanter | arena
let tavernView = 'board';          // board | gamble — which Tavern sub-panel is shown, defaults to the quest board
let enchanterView = 'table';       // table | carver | forge — which Enchanter sub-panel is shown, defaults to the Enchantment Table
let carverSelected = [];           // uids of runes picked for the Rune Carver's merge (max 3), ephemeral UI state
let forgeItem = null;              // uid of the item targeted at the Rune Forge (add/destroy sockets), ephemeral UI state
let forgeRuneSel = [];             // uids of legendary-tier runes picked to pay the Rune Forge (max 5), ephemeral UI state
let lastDiceRoll = null;           // {you, house, result, bet} of the most recent dice roll, or null if never played — ephemeral, not saved
let diceRolling = false;           // true while the dice-roll animation is mid-spin, guards against overlapping rolls
let invFilter = 'all';     // all | usable
let invType = 'all';       // all | rune | <slot>
let invSort = 'rarity';    // rarity | type | value | name
let journalPage = null;    // 'prologue' | chapter number | 'epilogue' — null defaults to the current chapter on next render
let pendingNewSlot = 0;    // which save slot a freshly-picked class goes into
let cheatSeq = { stage: 'city', count: 0 };   // tab-click gesture tracker for the hidden cheat console — ephemeral, not saved

const $ = sel => document.querySelector(sel);
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
// Compact display for topbar numbers — 1,234 -> 1.2K, 2,000,000 -> 2M.
// Below 1000, numbers round to whole (no decimal clutter on gold/XP/damage/
// counts) unless keepDecimals is passed — used only by the handful of
// legitimately-fractional rate/percentage stats (HP/Mana Regen, the
// equip-comparison stat deltas) that need their precision even under 1000.
function formatK(n, keepDecimals) {
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  if (keepDecimals) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return Math.round(n).toLocaleString();
}
// Several weapons share one base emoji (e.g. the whole sword family uses
// 🗡️) and are told apart by size instead — see iconSize on DATA.WEAPON_BASES.
function itemIconHtml(it) {
  if (it.slot !== 'weapon') return it.icon;
  const base = DATA.WEAPON_BASES.find(b => b.id === it.base);
  const sz = base && base.iconSize;
  return sz ? `<span style="font-size:${sz}em">${it.icon}</span>` : it.icon;
}

// Runes deliberately use their own tier-based color ramp instead of
// DATA.RARITIES' item-rarity colors, even though a rune's own `.rarity`
// field still borrows those same keys (kept for sorting/filtering only —
// see byRarity in UI.renderInventory). Faded(1)->blue, Rune(2)->yellow,
// Elder Rune rare-tier(3)->epic purple, Elder Rune epic/legendary-tier
// (4-5, Mythic included)->legendary orange — the top two tiers share a
// color, mirroring the existing convention that Mythic Runes already
// borrow Legendary's color rather than getting a distinct one of their own.
const RUNE_TIER_COLOR = { 1: '#6c9bff', 2: '#ffd84d', 3: '#c77dff', 4: '#ff8b3d', 5: '#ff8b3d' };
const RUNE_TIER_CLASS = { 1: 'rar-magical', 2: 'rar-rare', 3: 'rar-epic', 4: 'rar-legendary', 5: 'rar-legendary' };
function itemColor(it) { return it.type === 'rune' ? RUNE_TIER_COLOR[runeTier(it)] : DATA.RARITIES[it.rarity].color; }
function itemBorderClass(it) { return it.type === 'rune' ? RUNE_TIER_CLASS[runeTier(it)] : 'rar-' + it.rarity; }

// Clickable version tag + Changelog link, same markup on every screen
// (title, prelude, class select, chapter/quest screens, epilogue, in-game).
// Quest .setup strings in data.js are written as "Sets up Quest N: <scene
// sentence>" (a dev-facing hook comment baked into the story text). At
// render time we strip that prefix and capitalize what's left, so players
// only see the scene-setting sentence itself.
function questSetupText(setup) {
  if (!setup) return '';
  const rest = setup.replace(/^Sets up Quest \d+:\s*/i, '');
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

UI.versionFooterHtml = function () {
  return `<div class="version-footer">Kharun Lands v${DATA.VERSION} · <a href="#" onclick="UI.showChangelog();return false;">Changelog</a></div>`;
};

// ------------------------------------------------------------
// Screens
// ------------------------------------------------------------
UI.init = function () {
  if (hasAnySave()) UI.showTitle();
  else UI.showPrelude();
};

// One-time lore prologue shown before a hero is chosen — paged, one
// context-block of the story at a time, stepped through with Continue.
UI.showPrelude = function (pageIdx) {
  const pages = DATA.PRELUDE.pages;
  const i = Math.max(0, Math.min(pages.length - 1, pageIdx || 0));
  const page = pages[i];
  const last = i === pages.length - 1;
  $('#app').innerHTML = `
    <div class="class-select prelude-screen">
      <h1>⚔️ KHARUN LANDS</h1>
      <div class="prelude-box">
        <div class="part-intro-chapter-tag">Prologue: ${esc(DATA.PRELUDE.title)} · Page ${i + 1} of ${pages.length}</div>
        <h2 class="prelude-title">${esc(page.title)}</h2>
        ${page.paragraphs.map(p => `<p class="prelude-text">${esc(p)}</p>`).join('')}
        <div class="prelude-nav">
          <div class="prelude-nav-side">
            ${i > 0 ? `<button class="btn btn-big" id="prelude-back-btn">◀ Back</button>` : ''}
            ${i === 0 && !last ? `<button class="btn btn-big" id="prelude-skip-btn">Skip ▶▶</button>` : ''}
          </div>
          <div class="prelude-nav-side">
            <button class="btn btn-primary btn-big" id="prelude-next-btn">${last ? '⚔️ Choose Your Hero' : '▶ Continue'}</button>
            <span class="prelude-page-indicator">Page ${i + 1}/${pages.length}</span>
          </div>
        </div>
      </div>
      ${UI.versionFooterHtml()}
    </div>`;
  const back = $('#prelude-back-btn');
  if (back) back.onclick = () => UI.showPrelude(i - 1);
  const skip = $('#prelude-skip-btn');
  if (skip) skip.onclick = () => UI.showClassSelect();
  $('#prelude-next-btn').onclick = () => last ? UI.showClassSelect() : UI.showPrelude(i + 1);
};

// Title screen: up to MAX_SLOTS heroes, each its own slot card — Continue,
// Export (downloads a .json) or Delete on a populated slot; New Character
// on an empty one. Also offers Import to load a previously exported file
// into whichever slot is free.
UI.slotCardHtml = function (save, i) {
  const c = save.char, cls = DATA.CLASSES[c.cls];
  return `<div class="slot-card">
    <div class="title-hero">${cls.icon} <b>${esc(c.name)}</b><br>
      <small>Level ${c.level} ${className(c)} · 🧭 Quest ${save.unlocked}/100 unlocked · ${formatK(c.kills || 0)} kills · 🪙 ${formatK(save.gold || 0)}</small>
    </div>
    <div class="slot-actions">
      <button class="btn btn-primary" id="continue-btn-${i}">▶ Continue</button>
      <button class="btn btn-tiny btn-sq" id="export-btn-${i}" title="Export character">📤</button>
      <button class="btn btn-tiny btn-sq danger" id="delete-btn-${i}" title="Delete character">🗑️</button>
    </div>
  </div>`;
};
UI.emptySlotCardHtml = function (i) {
  return `<div class="slot-card empty"><button class="btn btn-primary btn-big" id="new-btn-${i}">✚ New Character</button></div>`;
};
UI.showTitle = function () {
  const slots = loadSlots();
  $('#app').innerHTML = `
    <div class="class-select">
      <h1>⚔️ KHARUN LANDS</h1>
      <p class="subtitle">Choose a hero to continue, or start a new one. Progress is saved automatically in this browser.</p>
      <div class="slot-grid">
        ${slots.map((s, i) => s ? UI.slotCardHtml(s, i) : UI.emptySlotCardHtml(i)).join('')}
      </div>
      <div class="title-actions">
        <button class="btn" id="import-btn">📥 Import Character</button>
        <input type="file" id="import-file" accept="application/json" style="display:none">
      </div>
      ${UI.versionFooterHtml()}
    </div>`;
  slots.forEach((save, i) => {
    if (save) {
      const c = save.char;
      $(`#continue-btn-${i}`).onclick = () => { loadGame(i); UI.showGame(); };
      $(`#export-btn-${i}`).onclick = () => UI.exportSlot(i);
      $(`#delete-btn-${i}`).onclick = () => {
        if (confirm(`Delete ${c.name} (Lv ${c.level} ${className(c)}) permanently? This can't be undone unless you exported them first.`)) {
          deleteSlot(i);
          UI.showTitle();
        }
      };
    } else {
      $(`#new-btn-${i}`).onclick = () => { pendingNewSlot = i; UI.showClassSelect(); };
    }
  });
  $('#import-btn').onclick = () => $('#import-file').click();
  $('#import-file').onchange = e => UI.importCharacterFile(e.target.files[0]);
};

// Downloads one slot's save as a .json file the player can keep or move
// to another browser/device.
UI.exportSlot = function (i) {
  const save = loadSlots()[i];
  if (!save) return;
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (save.char.name || 'hero').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  a.href = url; a.download = `kharun-lands-${safeName}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
};

// Reads a previously exported .json file and drops it into the first free
// slot. Refuses if the file isn't a recognizable character save, or if
// every slot is already taken.
UI.importCharacterFile = function (file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try { parsed = JSON.parse(reader.result); } catch (e) { UI.toast('❌ Not a valid character file'); return; }
    if (!parsed || !parsed.char || !parsed.char.cls || !DATA.CLASSES[parsed.char.cls]) { UI.toast('❌ Not a valid character file'); return; }
    const slots = loadSlots();
    const emptyIdx = slots.findIndex(s => !s);
    if (emptyIdx === -1) { UI.toast('❌ All 5 character slots are full — delete one first'); return; }
    slots[emptyIdx] = parsed;
    saveSlots(slots);
    UI.toast(`✅ Imported ${parsed.char.name} into slot ${emptyIdx + 1}`);
    UI.showTitle();
  };
  reader.readAsText(file);
};

// Full-screen chapter opening, shown when a hero first enters a chapter.
// Continues into that chapter's first quest-start screen.
UI.showChapterIntro = function (chapterNum) {
  const startLevel = (chapterNum - 1) * 10 + 1;
  const ch = chapterData(startLevel);
  $('#app').innerHTML = `
    <div class="class-select prelude-screen">
      <h1>⚔️ KHARUN LANDS</h1>
      <div class="prelude-box">
        <h2 class="prelude-title">📖 ${esc(ch.title)}</h2>
        ${ch.headline ? `<p class="chapter-headline-big">${esc(ch.headline)}</p>` : ''}
        ${ch.story.map(p => `<p class="prelude-text">${esc(p)}</p>`).join('')}
        <button class="btn btn-primary btn-big" id="chapter-start-btn">▶ Continue</button>
      </div>
      ${UI.versionFooterHtml()}
    </div>`;
  $('#chapter-start-btn').onclick = () => UI.showQuestStart(startLevel);
};

// Quest-start screen: the quest's opening story + objective, with a
// Start button that switches to the Adventure tab at the quest location.
UI.showQuestStart = function (level) {
  const info = areaInfo(level);
  $('#app').innerHTML = `
    <div class="class-select prelude-screen">
      <h1>⚔️ KHARUN LANDS</h1>
      <div class="prelude-box">
        <div class="part-intro-chapter-tag">${esc(info.chapter.title)}</div>
        <h2 class="prelude-title part-intro-header">🧭 ${esc(info.quest.name)}</h2>
        <div class="quest-location-tag">🗺️ ${esc(info.location)}</div>
        ${info.quest.intro.map(p => `<p class="prelude-text">${esc(p)}</p>`).join('')}
        <p class="quest-objective">🎯 Objective: ${esc(info.quest.objective)}</p>
        <button class="btn btn-primary btn-big" id="quest-start-btn">▶ Start</button>
      </div>
      ${UI.versionFooterHtml()}
    </div>`;
  $('#quest-start-btn').onclick = () => {
    G.area = Math.min(level, G.unlocked);
    activeTab = 'adventure';
    saveGame();
    UI.showGame();
  };
};

// Quest-end screen: the story sentences after the objective, revealed
// only once the quest boss falls, plus the "Sets up Quest N" hook as its
// own final paragraph. Continues to the next quest's start — or to the
// chapter ending when this was the chapter's 10th quest.
UI.showQuestEnd = function (level) {
  const info = areaInfo(level);
  const chapterDone = isChapterEndLevel(level);
  $('#app').innerHTML = `
    <div class="class-select prelude-screen">
      <h1>⚔️ KHARUN LANDS</h1>
      <div class="prelude-box">
        <div class="part-intro-chapter-tag">${esc(info.chapter.title)}</div>
        <h2 class="prelude-title part-intro-header">🧭 ${esc(info.quest.name)} — Complete</h2>
        <div class="quest-location-tag">🗺️ ${esc(info.location)}</div>
        ${info.quest.outro.map(p => `<p class="prelude-text">${esc(p)}</p>`).join('')}
        ${info.quest.setup ? `<p class="quest-setup">${esc(questSetupText(info.quest.setup))}</p>` : ''}
        <button class="btn btn-primary btn-big" id="quest-end-btn">▶ Continue</button>
      </div>
      ${UI.versionFooterHtml()}
    </div>`;
  $('#quest-end-btn').onclick = () => {
    if (chapterDone) UI.showChapterEnd(chapterNumOf(level));
    else UI.showQuestStart(level + 1);
  };
};

// Chapter-ending screen, shown after the 10th quest's ending. Continues
// into the next chapter's opening — or the Epilogue after Chapter 10.
UI.showChapterEnd = function (chapterNum) {
  const ch = DATA.CHAPTERS[chapterNum - 1];
  const lastChapter = chapterNum >= DATA.CHAPTERS.length;
  $('#app').innerHTML = `
    <div class="class-select prelude-screen">
      <h1>⚔️ KHARUN LANDS</h1>
      <div class="prelude-box">
        <div class="part-intro-chapter-tag">Chapter Ending</div>
        <h2 class="prelude-title">📖 ${esc(ch.title)}</h2>
        ${(ch.ending || []).map(p => `<p class="prelude-text">${esc(p)}</p>`).join('')}
        <button class="btn btn-primary btn-big" id="chapter-end-btn">${lastChapter ? '📖 Epilogue' : '▶ Continue'}</button>
      </div>
      ${UI.versionFooterHtml()}
    </div>`;
  $('#chapter-end-btn').onclick = () => lastChapter ? UI.showEpilogue() : UI.showChapterIntro(chapterNum + 1);
};

// The Epilogue — shown once after Chapter 10's ending (and afterwards
// readable any time from the Journal). Paged one section at a time, same
// Back/Continue/page-indicator/Skip pattern as the Prologue (UI.showPrelude).
UI.showEpilogue = function (pageIdx) {
  const sections = DATA.EPILOGUE.sections;
  const i = Math.max(0, Math.min(sections.length - 1, pageIdx || 0));
  const section = sections[i];
  const last = i === sections.length - 1;
  $('#app').innerHTML = `
    <div class="class-select prelude-screen">
      <h1>⚔️ KHARUN LANDS</h1>
      <div class="prelude-box">
        <div class="part-intro-chapter-tag">📖 Epilogue: ${esc(DATA.EPILOGUE.title)} · Page ${i + 1} of ${sections.length}</div>
        <h2 class="prelude-title">${esc(section.h)}</h2>
        ${section.paragraphs.map(p => `<p class="prelude-text">${esc(p)}</p>`).join('')}
        ${last ? `<p class="prelude-text epilogue-end">— END —</p>` : ''}
        <div class="prelude-nav">
          <div class="prelude-nav-side">
            ${i > 0 ? `<button class="btn btn-big" id="epilogue-back-btn">◀ Back</button>` : ''}
            ${i === 0 && !last ? `<button class="btn btn-big" id="epilogue-skip-btn">Skip ▶▶</button>` : ''}
          </div>
          <div class="prelude-nav-side">
            <button class="btn btn-primary btn-big" id="epilogue-next-btn">${last ? '🏠 Return to the Kharun Lands' : '▶ Continue'}</button>
            <span class="prelude-page-indicator">Page ${i + 1}/${sections.length}</span>
          </div>
        </div>
      </div>
      ${UI.versionFooterHtml()}
    </div>`;
  const back = $('#epilogue-back-btn');
  if (back) back.onclick = () => UI.showEpilogue(i - 1);
  const skip = $('#epilogue-skip-btn');
  if (skip) skip.onclick = () => UI.showGame();
  $('#epilogue-next-btn').onclick = () => last ? UI.showGame() : UI.showEpilogue(i + 1);
};

// Called after the boss-victory modal's Continue button: first the
// cleared quest's ending screen, which then chains onward (next quest
// start, chapter ending, next chapter intro, or the epilogue).
UI.afterBossVictory = function (clearedLevel) {
  const nextLevel = clearedLevel + 1;
  if (nextLevel <= MAX_LEVEL_AREA) {
    // Jump the Adventure tab to the quest the player is about to start,
    // same convention as the manual ◀/▶ level pickers.
    G.area = Math.min(nextLevel, G.unlocked);
    saveGame();
  }
  UI.showQuestEnd(clearedLevel);
};

UI.showClassSelect = function () {
  const app = $('#app');
  app.innerHTML = `
    <div class="class-select">
      <h1>⚔️ KHARUN LANDS</h1>
      <p class="subtitle">Three heroes, one road. Choose who answers.</p>
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
      ${UI.versionFooterHtml()}
    </div>`;
  app.querySelectorAll('.class-card').forEach(card => {
    card.querySelector('.pick-btn').onclick = () => {
      newGame(card.dataset.cls, pendingNewSlot);
      UI.showChapterIntro(1);
    };
  });
};

// Mandatory full-screen picker shown once a character reaches level 25
// without an Advanced Class path yet — reuses UI.showClassSelect's
// card-grid pattern, sourced from the 2 paths for this base class instead
// of the 3 base classes. No back-out; picking is required to continue.
UI.showPathSelect = function () {
  const c = G.char;
  const paths = DATA.ADVANCED_PATHS[c.cls];
  $('#app').innerHTML = `
    <div class="class-select">
      <h1>⚔️ KHARUN LANDS</h1>
      <p class="subtitle">${esc(c.name)} has reached level 25 — choose an Advanced Class path.</p>
      <div class="class-cards">
        ${paths.map(p => {
          const pathSkills = Object.values(DATA.SKILLS[c.cls]).filter(s => s.path === p.id);
          return `<div class="class-card" data-path="${p.id}">
            <div class="class-icon">${p.icon}</div>
            <h2>${esc(p.tier2Name)}</h2>
            <div class="class-title">→ ${esc(p.tier3Name)} at level 50</div>
            <p class="class-desc">${esc(p.desc)}</p>
            <p class="class-playstyle">💡 Focus: ${esc(p.focus)}</p>
            <div class="class-skills-preview">
              ${pathSkills.map(s => `<span title="${esc(s.name)} (Lv ${s.minLvl})">${s.icon}</span>`).join('')}
            </div>
            <button class="btn btn-primary pick-btn">Become a ${esc(p.tier2Name)}</button>
          </div>`;
        }).join('')}
      </div>
      ${UI.versionFooterHtml()}
    </div>`;
  $('#app').querySelectorAll('.class-card').forEach(card => {
    card.querySelector('.pick-btn').onclick = () => {
      chooseAdvancedClass(card.dataset.path);
      UI.showGame();
    };
  });
};

// One-time, dismissable congrats modal for the automatic level-50
// evolution (tier2 -> tier3 name). Lists the two skills that just
// unlocked (the path's passive4 and its Ultimate replacement).
UI.showTier3Announce = function () {
  const c = G.char;
  const path = DATA.ADVANCED_PATHS[c.cls].find(p => p.id === c.advancedClass);
  const newSkills = Object.values(DATA.SKILLS[c.cls]).filter(s => s.path === c.advancedClass && s.minLvl === 50);
  UI.modal(`
    <h3>🎉 ${esc(c.name)} is now a ${esc(path.tier3Name)}!</h3>
    <p class="prelude-text">Your training is complete — you've automatically evolved into your path's final form.</p>
    <p class="prelude-text">Newly unlocked:</p>
    <ul>${newSkills.map(s => `<li>${s.icon} <b>${esc(s.name)}</b> — ${esc(s.desc(1))}</li>`).join('')}</ul>
    <div class="modal-actions"><button class="btn btn-primary" onclick="UI.closeModal()">Continue</button></div>`);
};

// Checked at the top of UI.refresh/UI.refreshAdventure — the single choke
// point both non-combat actions and every combat tick pass through, so a
// level-25/50 milestone reached mid-fight is caught immediately rather
// than waiting for the player to next switch tabs. Returns true if it took
// over the screen (caller should stop rendering normally this pass).
UI.checkClassMilestones = function () {
  const c = G.char;
  if (c.level >= 25 && !c.advancedClass) {
    if (ADV && ADV.fight) ADV.paused = true;
    UI.showPathSelect();
    return true;
  }
  if (c.level >= 50 && c.advancedClass && !c.tier3Seen) {
    c.tier3Seen = true; saveGame();
    if (ADV && ADV.fight) ADV.paused = true;
    UI.showTier3Announce();
  }
  return false;
};

UI.showGame = function () {
  $('#app').innerHTML = `
    <div id="topbar"></div>
    <div id="tabs" class="tabs">
      <button data-tab="adventure">🗺️ Adventure</button>
      <button data-tab="character">🛡️ Character</button>
      <button data-tab="city">🏙️ City</button>
      <button data-tab="journal">📔 Journal</button>
    </div>
    <div id="tab-content"></div>
    ${UI.versionFooterHtml()}`;
  document.querySelectorAll('#tabs button').forEach(b => {
    b.onclick = () => {
      activeTab = b.dataset.tab;
      UI.trackCheatSequence(b.dataset.tab);
      UI.refresh();
      if (b.dataset.tab === 'adventure') {
        const arena = document.querySelector('.battle-arena');
        if (arena) arena.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
  });
  UI.refresh();
};

// Hidden gesture: click City 5x in a row, then Character 5x in a row,
// to open the cheat console. Any other tab click resets progress.
UI.trackCheatSequence = function (tab) {
  if (cheatSeq.stage === 'city') {
    if (tab === 'city') {
      cheatSeq.count++;
      if (cheatSeq.count >= 5) cheatSeq = { stage: 'character', count: 0 };
    } else {
      cheatSeq = { stage: 'city', count: 0 };
    }
  } else { // stage === 'character'
    if (tab === 'character') {
      cheatSeq.count++;
      if (cheatSeq.count >= 5) {
        cheatSeq = { stage: 'city', count: 0 };
        UI.showCheatDialog();
      }
    } else if (tab === 'city') {
      cheatSeq = { stage: 'city', count: 1 };
    } else {
      cheatSeq = { stage: 'city', count: 0 };
    }
  }
};

UI.showCheatDialog = function () {
  UI.modal(`
    <h3>Cheat Console</h3>
    <input type="text" id="cheat-input" class="cheat-input" autocomplete="off" spellcheck="false" autocapitalize="off">
    <div class="modal-actions">
      <button class="btn" onclick="UI.submitCheatCode()">Submit</button>
      <button class="btn" onclick="UI.closeModal()">Cancel</button>
    </div>
  `);
  const input = document.getElementById('cheat-input');
  if (input) {
    input.focus();
    input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); UI.submitCheatCode(); } };
  }
};

UI.submitCheatCode = function () {
  const input = document.getElementById('cheat-input');
  const code = input ? input.value.trim() : '';
  let m, result = null;
  if ((m = /^kgschar(\d{1,3})$/i.exec(code))) result = cheatGiveXpToLevel(parseInt(m[1], 10));
  else if ((m = /^kgsarea(\d{1,3})$/i.exec(code))) result = cheatGoToArea(parseInt(m[1], 10));
  else if (/^kgsitems$/i.test(code)) result = cheatFillLegendaryGear();
  else if ((m = /^kgsrune(\d{1,3})$/i.exec(code))) result = cheatGiveRunes(parseInt(m[1], 10));
  UI.closeModal();
  if (result) UI.toast(result.msg);
  else if (code) UI.toast('Unknown code');
};

// Unspent stat/skill points and a finished (unclaimed) Tavern quest each
// breathe a highlight on their top-level tab — kept as its own function so
// it can be called from the adventure tick loop too, not just UI.refresh(),
// otherwise a level-up or quest completion mid-combat wouldn't show until
// the player next switched tabs.
UI.updateTabNotifications = function () {
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
  const charTab = document.querySelector('#tabs button[data-tab="character"]');
  if (charTab) {
    charTab.innerHTML = `🛡️ Character`;
    charTab.classList.toggle('tab-notify', !!(G.char.statPoints || G.char.skillPoints));
  }
  const cityTab = document.querySelector('#tabs button[data-tab="city"]');
  if (cityTab) cityTab.classList.toggle('tab-notify', !!(G.tavern && G.tavern.active && G.tavern.active.some(q => q.ready)));
};

UI.refresh = function () {
  if (!G) return;
  if (UI.checkClassMilestones()) return;
  UI.renderTopbar();
  UI.updateTabNotifications();
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
      <button data-sub="character" class="${activeCharSub === 'character' ? 'active' : ''} ${G.char.statPoints ? 'tab-notify' : ''}">🛡️ Character</button>
      <button data-sub="skills" class="${activeCharSub === 'skills' ? 'active' : ''} ${G.char.skillPoints ? 'tab-notify' : ''}">📜 Skills</button>
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
// City hub: Shop / Tavern / Enchanter / Arena sub-tabs
// ------------------------------------------------------------
UI.renderCityHub = function (el) {
  const questReady = !!(G.tavern && G.tavern.active && G.tavern.active.some(q => q.ready));
  el.innerHTML = `
    <div class="subtabs">
      <button data-sub="shop" class="${activeCitySub === 'shop' ? 'active' : ''}">⚒️ Blacksmith</button>
      <button data-sub="tavern" class="${activeCitySub === 'tavern' ? 'active' : ''} ${questReady ? 'tab-notify' : ''}">🍺 Tavern</button>
      <button data-sub="enchanter" class="${activeCitySub === 'enchanter' ? 'active' : ''}">🔮 Enchanter</button>
      <button data-sub="arena" class="${activeCitySub === 'arena' ? 'active' : ''}">🏛️ Arena</button>
    </div>
    <div id="city-sub-content"></div>`;
  el.querySelectorAll('.subtabs button').forEach(b => b.onclick = () => { activeCitySub = b.dataset.sub; UI.refresh(); });
  const sc = $('#city-sub-content');
  if (activeCitySub === 'tavern') UI.renderTavern(sc);
  else if (activeCitySub === 'enchanter') UI.renderEnchanter(sc);
  else if (activeCitySub === 'arena') UI.renderArena(sc);
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
    <div class="tb-charbox">
      <span class="tb-name">${cls.icon} <b>${esc(c.name)}</b> <small>Lv ${c.level} ${className(c)}</small></span>
      <div class="bar xp-bar" title="XP: ${c.xp}/${xpNeed}"><div style="width:${Math.min(100, c.xp / xpNeed * 100)}%"></div><span>XP ${formatK(c.xp)}/${formatK(xpNeed)}</span></div>
      <div class="bar hp-bar"><div style="width:${Math.max(0, c.hp / d.maxHp * 100)}%"></div><span>❤️ ${formatK(c.hp)}/${formatK(d.maxHp)}</span></div>
      <div class="bar mana-bar"><div style="width:${Math.max(0, c.mana / d.maxMana * 100)}%"></div><span>🔵 ${formatK(c.mana)}/${formatK(d.maxMana)}</span></div>
    </div>
    <div class="tb-side">
      <span class="gold">🪙 ${formatK(G.gold)}</span>
      <span class="inv-count" title="Items in inventory">🎒 ${formatK(G.inventory.length)}</span>
    </div>
    <button class="btn btn-tiny btn-sq tb-help" onclick="UI.showGameHelp()" title="Help">❓</button>`;
};

UI.showGameHelp = function () {
  UI.modal(`
    <h3>❓ Kharun Lands — Help</h3>
    <p class="prelude-text">Play through a ten-chapter story as Kharun (Warrior), Pars (Rogue), or Minnie (Mage). Every Quest is tied to one Location and ends with a named boss — beat it to unlock the next Quest, and beat a chapter's 10th Quest to unlock the next Chapter.</p>
    <p class="prelude-text"><b>📖 Chapters</b> group ten Quests each around one region of the story. <b>🧭 Quests</b> are individual objectives with their own intro, creatures and boss. <b>🗺️ Locations</b> are where a Quest physically takes place.</p>
    <p class="prelude-text"><b>🗺️ Adventure</b> — fight through your current Quest's creatures. Has its own ❓ Help and ⚔️ Combat Arena ❓ Help for details on the gauge, potions and skills.</p>
    <p class="prelude-text"><b>🛡️ Character</b> — your stats, skills, and inventory/equipment.</p>
    <p class="prelude-text">Leveling up grants stat points and +1 skill point every level: +3 stat points up to level 25, +4 from 26-50, and +5 from level 51 on. The number shown next to each Main Stat already includes gear bonuses; spending a point raises your base value by 1. <b>Strength</b> drives Max HP & HP Regen, <b>Dexterity</b> drives Speed, Evasion & attack rate, and <b>Intelligence</b> drives Max Mana & Mana Regen — whichever is your class's main stat also adds +1% damage per point. <b>Speed</b> is how much your attack gauge fills each round; you act once it reaches 100. <b>Attack Interval</b> is your weapon's swing speed factor — lower is faster. <b>Potion Capacity</b> is 2 by default and increases with an equipped belt. Each class can only equip certain armor weights (Light/Medium/Heavy); a two-handed weapon fills both weapon slots, or you can dual-wield two one-handers, or pair one with a shield/off-hand.</p>
    <p class="prelude-text"><b>⚔️ Advanced Classes</b> — at level 25 you choose one of two paths for your class, unlocking a new active skill and a new passive skill built around that path. At level 50 your path automatically evolves to its final form — no choice needed, you'll be notified when it happens — unlocking a second new passive and a stronger Ultimate that replaces your original one. Points already spent on a skill a path replaces aren't refunded, but nothing is wasted going in: every path skill is strictly stronger than what it replaces.</p>
    <p class="prelude-text">
      <b>⚔️ Kharun (Warrior):</b> 🛡️ Knight → Paladin (Protection & Armor) or ⚔️ Mercenary → Warlord (Damage & Disability).<br>
      <b>🗡️ Pars (Rogue):</b> 🥷 Assassin → Ninja (Dagger, Exotic Weapons & Poison) or 🏹 Hunter → Sniper (Bows, Crossbows & Ranged Damage).<br>
      <b>🔮 Minnie (Mage):</b> ☄️ Sorcerer → Archmage (Magic Damage) or 🌟 Radiant → Archon (Protection, Healing, Crowd Control & AOE).
    </p>
    <p class="prelude-text"><b>🏙️ City</b> — the Shop (buy/sell/equip gear) and the Tavern (side quests for gold/gear).</p>
    <p class="prelude-text"><b>📔 Journal</b> — read back the Prologue, any chapter you've reached, and the Epilogue once unlocked; tracks each Quest's objective and, once cleared, its resolution.</p>
    <p class="prelude-text">Your progress auto-saves constantly — there's no manual save needed. To delete a hero, go to the title screen and use 🗑️ Delete on their slot.</p>
    <p class="prelude-text">You can keep up to 5 heroes at once — the title screen lets you Continue, 📤 Export (download as a file) or 🗑️ Delete any of them, and start a new one in any empty slot. 📥 Import loads a previously exported character file back into a free slot.</p>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
};

// Lifetime stats, tracked in G.totals as events happen throughout the game
// (see handleKill/rollLoot/dropItem/sellItem/buyShopItem/drinkPotion/
// socketRune/claimQuestReward/retreat in game.js) rather than computed
// after the fact, so this stays accurate even across sold/deleted items.
UI.showPlayerStats = function () {
  const t = G.totals;
  const totalKills = Object.values(t.kills).reduce((a, b) => a + b, 0);
  const totalItems = Object.values(t.itemsByRarity).reduce((a, b) => a + b, 0);
  const topSpecies = Object.entries(t.killsBySpecies).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const row = (label, value) => `<div class="stat-row"><span>${label}</span><b>${value}</b></div>`;
  UI.modal(`
    <h3>📊 Player Statistics</h3>
    <div class="two-col">
      <div class="panel">
        <h3>⚔️ Combat</h3>
        ${row('Adventures completed', formatK(t.adventures))}
        ${row('Deaths', formatK(t.deaths))}
        ${row('Chapter/Quest bosses defeated', formatK(t.bossesKilled))}
        ${row('Damage dealt', formatK(t.dmgDealt))}
        ${row('Damage taken', formatK(t.dmgTaken))}
        <h3>💀 Kills — ${formatK(totalKills)} total</h3>
        ${row('⚪ Normal', formatK(t.kills.normal))}
        ${row('🔷 Rare', formatK(t.kills.rare))}
        ${row('🟣 Epic', formatK(t.kills.epic))}
        ${row('🩷 Miniboss', formatK(t.kills.miniboss))}
        ${row('🔶 Legendary', formatK(t.kills.legendary))}
      </div>
      <div class="panel">
        <h3>📦 Loot</h3>
        ${row('Items found', formatK(totalItems))}
        ${row('Runes found', formatK(t.runesFound))}
        ${row('Runes socketed', formatK(t.runesSocketed))}
        ${row('Items sold', formatK(t.itemsSold))}
        <h3>Items found by rarity</h3>
        ${row('Normal', formatK(t.itemsByRarity.normal))}
        ${row('Magical', formatK(t.itemsByRarity.magical))}
        ${row('Rare', formatK(t.itemsByRarity.rare))}
        ${row('Epic', formatK(t.itemsByRarity.epic))}
        ${row('Legendary', formatK(t.itemsByRarity.legendary))}
        <h3>🪙 Gold</h3>
        ${row('Gold found', formatK(t.goldFound))}
        ${row('Gold from selling items', formatK(t.goldFromSales))}
        ${row('Gold spent', formatK(t.goldSpent))}
        <h3>Other</h3>
        ${row('Potions used', formatK(t.potionsUsed))}
        ${row('Tavern quests completed', formatK(t.questsCompleted))}
      </div>
    </div>
    ${topSpecies.length ? `
    <h3>🐾 Most-killed creatures</h3>
    <div class="bestiary-tiers">
      ${topSpecies.map(([species, n]) => `<div class="bestiary-tier-row"><span>${esc(species)}</span><span>${formatK(n)} kills</span></div>`).join('')}
    </div>` : ''}
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
};

// ------------------------------------------------------------
// Character tab
// ------------------------------------------------------------
UI.renderCharacter = function (el) {
  const c = G.char, d = derive(), cls = DATA.CLASSES[c.cls];
  const statRow = (key, label, cssCls) => `
    <div class="stat-row">
      <span class="${cssCls}">${label}</span>
      <b>${d[key]}</b>
      ${c.statPoints > 0 ? `<button class="btn btn-tiny" onclick="spendStat('${key}')">+</button>` : ''}
    </div>`;
  const xpNeed = xpForLevel(c.level);
  el.innerHTML = `
    ${c.statPoints ? `
      <div class="lvlup-banner">⬆ LEVEL UP! You have <b>${c.statPoints} stat point${c.statPoints > 1 ? 's' : ''}</b> to spend below.</div>` : ''}
    <div class="panel level-panel">
      <h3>📈 Level ${c.level} ${className(c)}
        <span class="filters">
          <button class="btn btn-tiny btn-sq" onclick="UI.showPlayerStats()" title="Player Statistics">📊</button>
        </span>
      </h3>
      <div class="bar xp-bar xp-bar-big" title="XP: ${c.xp}/${xpNeed}"><div style="width:${Math.min(100, c.xp / xpNeed * 100)}%"></div><span>XP ${formatK(c.xp)} / ${formatK(xpNeed)}</span></div>
    </div>
    <div class="two-col">
      <div class="panel">
        <h3>Main Stats ${c.statPoints ? `<span class="pts">(${c.statPoints} points to spend)</span>` : ''}</h3>
        ${statRow('str', cls.mainStat === 'str' ? '⭐ Strength' : 'Strength', 'stat-str')}
        ${statRow('dex', cls.mainStat === 'dex' ? '⭐ Dexterity' : 'Dexterity', 'stat-dex')}
        ${statRow('int', cls.mainStat === 'int' ? '⭐ Intelligence' : 'Intelligence', 'stat-int')}
        <h3>Important Stats</h3>
        <div class="stat-row"><span>❤️ Max HP</span><b>${formatK(d.maxHp)}</b></div>
        <div class="stat-row"><span>⚡ Speed</span><b>${formatK(d.speed)}</b></div>
        <div class="stat-row"><span>🔵 Max Mana</span><b>${formatK(d.maxMana)}</b></div>
        <h3>Sub Stats</h3>
        <div class="stat-row"><span>💗 HP Regen</span><b>${formatK(d.hpRegen, true)}</b></div>
        <div class="stat-row"><span>💨 Evasion</span><b>${d.evasion}%</b></div>
        <div class="stat-row"><span>💧 Mana Regen</span><b>${formatK(d.manaRegen, true)}</b></div>
        <div class="stat-row"><span>👝 Potion Capacity</span><b>${potionCapacity()}</b></div>
        <h3>Combat</h3>
        <div class="stat-row"><span>🗡️ Damage</span><b>${formatK(d.baseDmgMin)}–${formatK(d.baseDmgMax)}</b>${d.weaponMagic ? ' <small>(magic)</small>' : ''}</div>
        <div class="stat-row"><span>⏱️ Attack Interval</span><b>${d.atkInterval}</b></div>
        <div class="stat-row"><span>🛡️ Armor</span><b>${formatK(d.armor)}</b></div>
        <div class="stat-row"><span>🌫️ Damage Reduction</span><b>${Math.round(d.dr * 100)}%</b></div>
        <div class="stat-row"><span>Resistances</span><b>⚔️${d.res.phys}% ✨${d.res.magic}% ☠️${d.res.poison}%</b></div>
        <div class="stat-row"><span>Total kills</span><b>${formatK(c.kills)}</b></div>
      </div>
      <div class="panel">
        <h3>Equipment</h3>
        <div class="equip-grid">
          ${DATA.SLOTS.map(slot => {
            const it = c.equip[slot];
            return `<div class="equip-slot ${it ? 'filled rar-' + it.rarity : ''}" data-slot="${slot}">
              <div class="slot-label">${DATA.SLOT_LABEL[slot]}</div>
              ${it ? `<div class="slot-item" onclick="UI.showItem(${it.uid},'equipped','${slot}')">
                       ${itemIconHtml(it)} <span style="color:${DATA.RARITIES[it.rarity].color}">${esc(it.name)}</span>
                     </div>` : `<div class="slot-empty">—</div>`}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
};

// ------------------------------------------------------------
// Skills tab
// ------------------------------------------------------------
UI.renderSkills = function (el) {
  const c = G.char;
  const ordered = DATA.SKILL_ORDER.map(classSkillFor).filter(Boolean);
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
                ${s.path ? `<span class="skill-cat">${DATA.ADVANCED_PATHS[c.cls].find(p => p.id === s.path).icon} ${esc(DATA.ADVANCED_PATHS[c.cls].find(p => p.id === s.path).tier2Name)}</span>` : ''}
                <span class="skill-rank">${rank > 0 ? `Rank ${rank}/${MAX_RANK}${eff > rank ? ` <span class="bonus">(+${eff - rank} gear)</span>` : ''}` : '—'}</span>
              </div>
              <div class="skill-desc">${s.desc(Math.max(1, eff))}</div>
              ${rank > 0 && rank < MAX_RANK ? `<div class="skill-next">Next (Rank ${rank + 1}): ${s.desc(Math.min(eff + 1, MAX_RANK * 2))}</div>` : ''}
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
          <button class="btn btn-tiny" onclick="UI.showInventorySettings()">⚙️ Settings</button>
        </span>
      </h3>
      <div class="sell-row">Sell all:
        <button class="btn btn-tiny danger" data-sell="junk">Normal/Magical</button>
        <button class="btn btn-tiny danger" data-sell="unusable">Unusable</button>
        <button class="btn btn-tiny danger" data-sell="rare">Rare</button>
        <button class="btn btn-tiny danger" data-sell="epic">Epic</button>
        <button class="btn btn-tiny danger" data-sell="legendary">Legendary</button>
        <button class="btn btn-tiny danger" data-sell="all">Unequipped (except Runes)</button>
        <button class="btn btn-tiny danger" data-sell="runes">🪨 Runes</button>
      </div>
      ${items.length === 0 ? '<p class="hint">Nothing here yet — go on an adventure!</p>' : ''}
      <div class="inv-grid">
        ${items.map(it => {
          const usable = it.type === 'item' ? canUseItem(it) : { ok: false };
          return `<div class="inv-item ${itemBorderClass(it)} ${it.type === 'item' && !usable.ok ? 'unusable' : ''}" onclick="UI.showItem(${it.uid},'inv')">
            <div class="inv-icon">${itemIconHtml(it)}</div>
            <div class="inv-name" style="color:${itemColor(it)}">${esc(it.name)}</div>
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
    if (!confirm(`Sell ${matches.length} item${matches.length > 1 ? 's' : ''} for 🪙 ${formatK(gold)}?`)) return;
    const r = sellAllOf(kind);
    UI.toast(`Sold ${r.count} for 🪙 ${formatK(r.gold)}`);
  });
};

UI.showInventorySettings = function () {
  const s = G.settings.autoSell;
  const rows = [
    ['unusable', 'Unusable by your class/weight'],
    ['normal', 'Normal rarity'],
    ['magical', 'Magical rarity'],
    ['rare', 'Rare rarity'],
    ['epic', 'Epic rarity'],
    ['legendary', 'Legendary rarity'],
    ['all', 'Everything (except Runes)'],
  ];
  UI.modal(`
    <h3>⚙️ Inventory Settings</h3>
    <p class="hint">Auto-sell: when a dropped item matches a checked category below, it's sold on the spot instead of going into your inventory. Runes are never auto-sold.</p>
    <div class="settings-list">
      ${rows.map(([k, label]) => `
        <label class="settings-row">
          <input type="checkbox" data-autosell="${k}" ${s[k] ? 'checked' : ''}>
          ${esc(label)}
        </label>`).join('')}
    </div>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
  document.querySelectorAll('[data-autosell]').forEach(cb => cb.onchange = () => {
    G.settings.autoSell[cb.dataset.autosell] = cb.checked;
    saveGame();
    if (cb.checked) {
      const r = sweepAutoSell();
      if (r.count) UI.toast(`Auto-sold ${r.count} matching item${r.count > 1 ? 's' : ''} for 🪙 ${formatK(r.gold)}`);
    }
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
  // compound-valued affixes (poisonWeapon/slowWeapon carry {dmg/rounds} or
  // {chance/pct/rounds} objects, not a plain number) don't have a single
  // scalar to compare/sum — skip them here, they still render via affixText.
  for (const a of allAffixesOf(it)) if (typeof a.v === 'number') m['a_' + a.id] = (m['a_' + a.id] || 0) + a.v;
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
  return `${it.dmgMin ? `<div class="istat ${cls('dmg')}">Damage: <b>${formatK(it.dmgMin)}–${formatK(it.dmgMax)}</b>${it.magic ? ' (magic)' : ''}</div>` : ''}
    ${it.armor ? `<div class="istat ${cls('armor')}">Armor: <b>${formatK(it.armor)}</b></div>` : ''}
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

// candMap: when given, colors this (equipped) item's own stats relative
// to the candidate item being considered — the reverse direction of
// the coloring itemStatsHtml normally does for the candidate itself.
UI.equippedBlockHtml = function (eq, label, candMap) {
  if (!eq) return '';
  return `<div class="compare"><h4>${label}: <span style="color:${DATA.RARITIES[eq.rarity].color}">${esc(eq.name)}</span></h4>${UI.itemStatsHtml(eq, candMap)}</div>`;
};

UI.cmpLegendHtml = function () {
  return `<p class="cmp-legend">vs equipped: <span class="cmp-better">better</span> · <span class="cmp-same">equal</span> · <span class="cmp-worse">worse</span></p>`;
};

UI.ringLabel = function (t) { return t === G.char.equip.ring1 ? 'Equipped Left Ring' : 'Equipped Right Ring'; };

// Human labels for the flat stat-map keys produced by statMapOf, used
// by the "Equipping changes" net-delta summary below.
const STAT_LABEL = {
  dmg: 'Damage', armor: 'Armor', spd: 'Speed', potionCap: 'Potion Capacity',
  str: 'Strength', dex: 'Dexterity', int: 'Intelligence', hp: 'Max HP', mana: 'Max Mana',
  speed: 'Speed', hpRegen: 'HP Regen', manaRegen: 'Mana Regen', evasion: 'Evasion %',
  dmgFlat: 'Weapon Damage', dmgPct: 'Weapon Damage %', dr: 'Damage Reduction %',
  resPhys: 'Physical Resist %', resMagic: 'Magic Resist %', resPoison: 'Poison Resist %',
  enemyResDown: 'Enemy Resist Shred %', skill: 'Skill Rank', allSkills: 'All Skills',
  lifesteal: 'Life Steal %', manasteal: 'Mana Steal %', allStats: 'All Stats',
  painReflect: 'Pain Reflection %', execute: 'Execute %', goldFind: 'Gold Find %', magicFind: 'Magic Find %',
  critStrike: 'Critical Strike %', doubleStrike: 'Double Strike %', procOffense: 'Spellstrike %', procSupport: 'Blessing %',
};
function statLabel(key) {
  if (STAT_LABEL[key]) return STAT_LABEL[key];
  if (key.startsWith('a_')) { const bare = key.slice(2); return STAT_LABEL[bare] || bare; }
  return key;
}
function fmtDelta(v) {
  const r = Math.round(v * 100) / 100;
  return (r > 0 ? '+' : '') + formatK(r, true);
}

// Net stat deltas between a candidate item and whatever it would
// replace — the "Equipping changes:" summary at the bottom of the
// comparison, independent of the per-line better/worse coloring above.
UI.equipChangesHtml = function (candMap, baseMap) {
  const keys = new Set([...Object.keys(candMap), ...Object.keys(baseMap || {})]);
  const rows = [];
  for (const k of keys) {
    const diff = (candMap[k] || 0) - ((baseMap || {})[k] || 0);
    if (Math.abs(diff) < 1e-9) continue;
    rows.push({ k, diff });
  }
  if (!rows.length) return '<p class="hint">No stat changes.</p>';
  rows.sort((x, y) => y.diff - x.diff);
  return rows.map(({ k, diff }) => `<div class="istat ${diff > 0 ? 'cmp-better' : 'cmp-worse'}">${statLabel(k)}: ${fmtDelta(diff)}</div>`).join('');
};

// Shared block: legend + equipped-item comparisons (now colored both
// ways) + the net "Equipping changes:" summary. Used by both the
// inventory item modal and the shop item modal.
UI.compareBlockHtml = function (it, targets, baseline) {
  if (!targets.length || baseline === undefined || it.type !== 'item') return '';
  const candMap = statMapOf(it);
  return `${UI.cmpLegendHtml()}
    ${targets.map(t => UI.equippedBlockHtml(t, it.slot === 'ring' ? UI.ringLabel(t) : 'Currently equipped', candMap)).join('')}
    <div class="compare equip-changes"><h4>Equipping changes:</h4>${UI.equipChangesHtml(candMap, baseline)}</div>`;
};

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
    <h3 style="color:${itemColor(it)}">${itemIconHtml(it)} ${esc(it.name)}</h3>
    <div class="item-sub">${rar.name}${it.type === 'rune' ? ` ${esc(it.baseName || 'Rune')}` : ` · ${esc(it.baseName)}`}${usable && !usable.ok ? ` · <span class="no">✖ ${esc(usable.why)}</span>` : usable ? ' · <span class="yes">✔ usable</span>' : ''}</div>
    ${statsHtml}
    ${UI.compareBlockHtml(it, targets, baseline)}
    <div class="modal-actions">${actions.join('')}<button class="btn" onclick="UI.closeModal()">Close</button></div>`);
};

// ------------------------------------------------------------
// Shop tab
// ------------------------------------------------------------
UI.renderShop = function (el) {
  if (!G.shop || !G.shop.stock) genShopStock();
  const stock = G.shop.stock;
  const shopName = DATA.CHAPTERS[chapterNumOf(G.area) - 1].shopName;
  el.innerHTML = `
    <div class="panel">
      <h3>🛒 ${esc(shopName)}
        <span class="filters">
          <div class="restock-wrap">
            <button class="btn btn-sq restock-btn" onclick="restockShop()" title="New stock" ${G.gold < restockCost() ? 'disabled' : ''}>♻</button>
            <div class="restock-cost">🪙 ${formatK(restockCost())}</div>
          </div>
        </span>
      </h3>
      <p class="hint">Wares are generated for area level ${shopIlvl()} and priced at 6× their sell value. Free new stock arrives whenever you return from an adventure.</p>
      ${stock.length === 0 ? '<p class="hint">Sold out! Come back after your next adventure.</p>' : ''}
      <div class="inv-grid">
        ${stock.map(it => {
          const usable = it.type === 'item' ? canUseItem(it) : null;
          const afford = G.gold >= it.price;
          return `<div class="inv-item ${itemBorderClass(it)} ${usable && !usable.ok ? 'unusable' : ''}" onclick="UI.showShopItem(${it.uid})">
            <div class="inv-icon">${itemIconHtml(it)}</div>
            <div class="inv-name" style="color:${itemColor(it)}">${esc(it.name)}</div>
            <div class="inv-sub">${it.type === 'rune' ? `Rune · ${it.bonuses.length} bonus` : `${DATA.SLOT_LABEL[it.slot === 'ring' ? 'ring1' : it.slot] || cap(it.slot)} · ${esc(it.baseName)}`}</div>
            ${usable ? `<div class="inv-usable ${usable.ok ? 'yes' : 'no'}">${usable.ok ? '✔ usable' : '✖ ' + esc(usable.why)}</div>` : ''}
            <div class="shop-price ${afford ? '' : 'poor'}">🪙 ${formatK(it.price)}</div>
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

  const equipActions = [];
  if (it.type === 'item' && usable.ok) {
    if (it.slot === 'ring') {
      equipActions.push(`<button class="btn" ${afford ? '' : 'disabled'} onclick="buyAndEquip(${it.uid},'ring1');UI.closeModal()">Buy & Equip Left</button>`);
      equipActions.push(`<button class="btn" ${afford ? '' : 'disabled'} onclick="buyAndEquip(${it.uid},'ring2');UI.closeModal()">Buy & Equip Right</button>`);
    } else if (it.slot === 'weapon' && it.hands === 1) {
      equipActions.push(`<button class="btn" ${afford ? '' : 'disabled'} onclick="buyAndEquip(${it.uid},'weapon');UI.closeModal()">Buy & Equip Main Hand</button>`);
      equipActions.push(`<button class="btn" ${afford ? '' : 'disabled'} onclick="buyAndEquip(${it.uid},'offhand');UI.closeModal()">Buy & Equip Off Hand</button>`);
    } else {
      equipActions.push(`<button class="btn" ${afford ? '' : 'disabled'} onclick="buyAndEquip(${it.uid});UI.closeModal()">Buy & Equip</button>`);
    }
  }

  UI.modal(`
    <h3 style="color:${itemColor(it)}">${itemIconHtml(it)} ${esc(it.name)}</h3>
    <div class="item-sub">${rar.name}${it.type === 'rune' ? ` ${esc(it.baseName || 'Rune')}` : ` · ${esc(it.baseName)}`}${usable && !usable.ok ? ` · <span class="no">✖ ${esc(usable.why)}</span>` : usable ? ' · <span class="yes">✔ usable</span>' : ''}</div>
    ${statsHtml}
    ${UI.compareBlockHtml(it, targets, baseline)}
    <div class="modal-actions">
      <button class="btn btn-primary" ${afford ? '' : 'disabled'} onclick="buyShopItem(${it.uid});UI.closeModal()">Buy (🪙 ${formatK(it.price)})</button>
      ${equipActions.join('')}
      <button class="btn" onclick="UI.closeModal()">Close</button>
    </div>`);
};

// ------------------------------------------------------------
// Tavern tab
// ------------------------------------------------------------
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

UI.setTavernView = function (view) { tavernView = view; UI.refresh(); };

function diceResultLine(r) {
  return `You rolled ${r.you[0]}+${r.you[1]}=${r.youSum}, the house rolled ${r.house[0]}+${r.house[1]}=${r.houseSum} — ${r.result === 'win' ? `You win 🪙 ${formatK(r.bet)}!` : r.result === 'lose' ? `You lose 🪙 ${formatK(r.bet)}.` : 'Tie — bet returned.'}`;
}

UI.renderTavern = function (el) {
  if (!G.tavern) genTavernBoard();
  if (!G.tavern.active) G.tavern.active = [];
  const t = G.tavern;
  const RUNE_SOURCE_LABEL = { miniboss: 'Rune', legendary: 'Elder Rune' };
  const rewardLineHtml = (r, spec) => [
    r.gold ? `🪙 ${formatK(r.gold)}` : '',
    r.xp ? `✨ ${formatK(r.xp)} XP` : '',
    spec.item ? `<span style="color:${DATA.RARITIES[spec.item].color}">${cap(spec.item)}+ item</span>` : '',
    spec.rune ? `<span style="color:${RUNE_TIER_COLOR[spec.rune === 'legendary' ? 3 : 2]}">🪨 ${RUNE_SOURCE_LABEL[spec.rune]}+</span>` : '',
  ].filter(Boolean).join(' + ');
  const activeCard = (q, idx) => {
    const reward = q.ready ? q.finalReward : questRewardPreview(q.rewardSpec.goldMult, q.rewardSpec.xpMult);
    return `
    <div class="quest-card active-quest ${q.ready ? 'ready' : ''}">
      <div class="quest-head">${q.icon} <b>${esc(q.name)}</b>
        <span class="quest-tag">${q.ready ? 'READY' : 'ACTIVE'}</span>
      </div>
      <div class="quest-desc">${esc(q.desc)}</div>
      <div class="quest-reward">${q.ready ? 'Reward' : 'Reward (approx.)'}: ${rewardLineHtml(reward, q.rewardSpec)}</div>
      <div class="bar quest-bar"><div style="width:${Math.min(100, (q.progress || 0) / q.target * 100)}%"></div><span>${formatK(q.progress || 0)} / ${formatK(q.target)}</span></div>
      ${q.ready
        ? `<button class="btn btn-primary btn-small" onclick="claimQuestReward(${idx})">🎁 Claim Reward</button>`
        : `<button class="btn btn-tiny danger" onclick="if(confirm('Abandon this quest? Progress is lost.'))abandonQuest(${idx})">✖ Abandon</button>`}
    </div>`;
  };
  const boardCard = (q, idx) => {
    const full = t.active.length >= 2;
    const preview = questRewardPreview(q.rewardSpec.goldMult, q.rewardSpec.xpMult);
    return `
    <div class="quest-card">
      <div class="quest-head">${q.icon} <b>${esc(q.name)}</b></div>
      <div class="quest-desc">${esc(q.desc)}</div>
      <div class="quest-reward">Reward (approx.): ${rewardLineHtml(preview, q.rewardSpec)}</div>
      <button class="btn btn-primary btn-small" ${full ? 'disabled' : ''} onclick="acceptQuest(${idx})">${full ? 'Two quests active' : 'Accept'}</button>
    </div>`;
  };
  const boardHtml = `
    ${t.active.length ? `<h4>Your current quests (${t.active.length}/2)</h4>${t.active.map((q, i) => activeCard(q, i)).join('')}` : ''}
    <h4>Quest board</h4>
    ${t.board.length ? `<div class="quest-board">${t.board.map((q, i) => boardCard(q, i)).join('')}</div>` : '<p class="hint">The board is empty — come back after an adventure.</p>'}`;
  const dieFace = (side, i) => lastDiceRoll ? DICE_FACES[lastDiceRoll[side][i] - 1] : DICE_FACES[0];
  const gambleHtml = `
    <h4>🎲 Gambling Den</h4>
    <p class="hint">Bet gold on a 2-dice roll-off against the house: whoever's pair totals higher doubles their stake, lower loses it, a tie returns your gold. True 50/50 odds — no house edge.</p>
    <div class="dice-arena">
      <div class="dice-side">
        <div class="dice-pair">
          <div class="dice-face" id="dice-you-1">${dieFace('you', 0)}</div>
          <div class="dice-face" id="dice-you-2">${dieFace('you', 1)}</div>
        </div>
        <span>You <b id="dice-you-sum">${lastDiceRoll ? lastDiceRoll.youSum : ''}</b></span>
      </div>
      <div class="dice-vs">vs</div>
      <div class="dice-side">
        <div class="dice-pair">
          <div class="dice-face" id="dice-house-1">${dieFace('house', 0)}</div>
          <div class="dice-face" id="dice-house-2">${dieFace('house', 1)}</div>
        </div>
        <span>House <b id="dice-house-sum">${lastDiceRoll ? lastDiceRoll.houseSum : ''}</b></span>
      </div>
    </div>
    <div id="dice-result" class="dice-result ${lastDiceRoll ? 'dice-' + lastDiceRoll.result : ''}">${lastDiceRoll ? diceResultLine(lastDiceRoll) : ''}</div>
    <div class="dice-bets">
      ${DICE_BET_TIERS.map(b => `<button class="btn btn-small" ${(G.gold < b || diceRolling) ? 'disabled' : ''} onclick="UI.playDice(${b})">🎲 Bet 🪙${formatK(b)}</button>`).join('')}
    </div>`;
  el.innerHTML = `
    <div class="panel">
      <h3>🍺 The Weary Wyvern Tavern</h3>
      <p class="hint">The tavern hums with rumors. Take up to two quests at a time — their progress counts automatically while you adventure. Once finished, claim each reward yourself — it's valued against your current chapter &amp; part. New rumors arrive whenever you return home.</p>
      <div class="subtabs">
        <button class="${tavernView === 'board' ? 'active' : ''}" onclick="UI.setTavernView('board')">📜 Board</button>
        <button class="${tavernView === 'gamble' ? 'active' : ''}" onclick="UI.setTavernView('gamble')">🎲 Gamble</button>
      </div>
      ${tavernView === 'gamble' ? gambleHtml : boardHtml}
    </div>`;
};

// Animates all four dice (a pair each for you and the house) spinning
// through random faces before revealing the actual result — resolveDice
// (game.js) is only called once the animation settles, so the gold/topbar
// change lands at the same moment the dice stop instead of jumping ahead
// of the visual. Manipulates the dice DOM directly during the spin rather
// than calling UI.refresh() every tick, since a full re-render would also
// rebuild (and reset) the disabled bet buttons mid-roll.
UI.playDice = function (bet) {
  if (diceRolling) return;
  if (G.gold < bet) { UI.toast('Not enough gold!'); return; }
  diceRolling = true;
  const dieEls = ['dice-you-1', 'dice-you-2', 'dice-house-1', 'dice-house-2'].map(id => document.getElementById(id));
  const sumEls = [document.getElementById('dice-you-sum'), document.getElementById('dice-house-sum')];
  const resultEl = document.getElementById('dice-result');
  document.querySelectorAll('.dice-bets button').forEach(b => b.disabled = true);
  if (resultEl) { resultEl.className = 'dice-result'; resultEl.textContent = 'Rolling…'; }
  sumEls.forEach(el => { if (el) el.textContent = ''; });
  let ticks = 0;
  const spin = setInterval(() => {
    dieEls.forEach(el => { if (el) el.textContent = pick(DICE_FACES); });
    ticks++;
    if (ticks >= 10) {
      clearInterval(spin);
      const r = resolveDice(bet);
      lastDiceRoll = r;
      diceRolling = false;
      UI.refresh();
      UI.toast(`🎲 ${diceResultLine(r)}`);
    }
  }, 80);
};

// ------------------------------------------------------------
// The Enchanter: Enchantment Table (re-enchant) / Rune Carver (merge 3
// same-tier runes into 1, formerly labeled "Rune Forge") / Rune Forge
// (spend 5 legendary-tier runes to add random sockets to an unsocketed
// item, or wipe out whatever's socketed into an item so it can be
// resocketed). All in-page explanatory copy lives in UI.showEnchanterHelp
// instead of inline hints, one header per feature.
// ------------------------------------------------------------
UI.setEnchanterView = function (view) {
  enchanterView = view; carverSelected = []; forgeItem = null; forgeRuneSel = [];
  UI.refresh();
};

const ENCHANT_TIER_LABEL = { 1: 'Faded Rune', 2: 'Rune', 3: 'Elder Rune (rare)', 4: 'Elder Rune (epic)', 5: 'Elder Rune (legendary)' };

UI.pickEnchantTarget = function (runeUid) {
  const rune = G.inventory.find(i => i.uid === runeUid && i.type === 'rune');
  if (!rune) return;
  const tier = runeTier(rune);
  const pool = [...equippedItems(), ...G.inventory.filter(i => i.type === 'item')];
  const targets = pool.filter(i => ENCHANT_RUNE_TIER[i.rarity] === tier);
  if (!targets.length) {
    const need = Object.keys(ENCHANT_RUNE_TIER).find(k => ENCHANT_RUNE_TIER[k] === tier);
    UI.modal(`<h3>🔮 No matching items</h3><p class="hint">A ${esc(ENCHANT_TIER_LABEL[tier])} only enchants ${cap(need)} items. Find or equip one first.</p><div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
    return;
  }
  UI.modal(`
    <h3>🔮 Enchant with ${rune.icon} ${esc(rune.name)}…</h3>
    <div class="socket-targets">
      ${targets.map(t => `<button class="btn socket-target" onclick="reenchantItem(${t.uid},${runeUid});UI.closeModal()">
        ${itemIconHtml(t)} <span style="color:${itemColor(t)}">${esc(t.name)}</span>
        <small>ilvl ${t.ilvl} → ${Math.max(1, G.area)}${equippedItems().includes(t) ? ' · equipped' : ''}</small>
      </button>`).join('')}
    </div>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Cancel</button></div>`);
};

UI.toggleCarverRune = function (uid) {
  const i = carverSelected.indexOf(uid);
  if (i >= 0) carverSelected.splice(i, 1);
  else if (carverSelected.length < 3) carverSelected.push(uid);
  UI.refresh();
};

// Selection is cleared BEFORE calling carveRunes, not after — carveRunes
// ends with its own saveGame()/UI.refresh(), which re-renders the Enchanter
// mid-call. If carverSelected still held the 3 just-consumed uids at that
// point, renderEnchanter's `runeTier(G.inventory.find(...))` lookup would
// find nothing for a spent uid and throw, breaking that refresh and
// leaving the Enchanter tab blank until an unrelated refresh papered over
// it (this is exactly the "the city no longer shows anything under
// Enchanter" bug after a successful forge/carve).
UI.doCarveRunes = function () {
  const uids = carverSelected;
  carverSelected = [];
  const r = carveRunes(uids);
  if (!r.ok) { UI.toast(r.why || 'Carve failed'); UI.refresh(); return; }
  UI.toast(r.success ? `🔨 Carve succeeded! ${r.rune.icon} ${r.rune.name}` : '💥 The runes shattered on the carving bench...');
};

// Clicking the currently-selected item again deselects it; picking a new
// one swaps the selection outright (the 5-rune payment selection is left
// alone, since it's independent of which item it'll be spent on).
UI.selectForgeItem = function (uid) {
  forgeItem = forgeItem === uid ? null : uid;
  UI.refresh();
};

UI.toggleForgeRune = function (uid) {
  const i = forgeRuneSel.indexOf(uid);
  if (i >= 0) forgeRuneSel.splice(i, 1);
  else if (forgeRuneSel.length < 5) forgeRuneSel.push(uid);
  UI.refresh();
};

UI.doForgeAddSockets = function () {
  const itemUid = forgeItem, runeUids = forgeRuneSel;
  forgeItem = null; forgeRuneSel = [];
  const r = forgeAddSockets(itemUid, runeUids);
  if (!r.ok) { UI.toast(r.why || 'Forge failed'); UI.refresh(); return; }
  UI.toast(`🔓 ${esc(r.item.name)} now has ${r.item.sockets} socket${r.item.sockets > 1 ? 's' : ''}!`);
};

UI.doForgeDestroySockets = function () {
  const itemUid = forgeItem, runeUids = forgeRuneSel;
  forgeItem = null; forgeRuneSel = [];
  const r = forgeDestroySockets(itemUid, runeUids);
  if (!r.ok) { UI.toast(r.why || 'Forge failed'); UI.refresh(); return; }
  UI.toast(`💥 The runes socketed in ${esc(r.item.name)} were destroyed.`);
};

UI.showEnchanterHelp = function () {
  UI.modal(`
    <h3>❓ The Enchanter's Workshop</h3>
    <h4>🔮 Enchantment Table</h4>
    <p class="prelude-text">Give an item and a matching rune: the rune is consumed, and the item is reforged to your current level — same stats, freshly rolled to match. Magical items need a Faded Rune, Rare need a Rune, Epic need a 4-bonus Elder Rune, Legendary need a 5-bonus Elder Rune.</p>
    <h4>🔨 Rune Carver</h4>
    <p class="prelude-text">Merge 3 runes of the same tier into one better rune, forged fresh at your current level. Tiers 1-4 have a 50% chance the runes shatter instead; legendary-tier (5, Mythic included) runes never fail.</p>
    <h4>⚒️ Rune Forge</h4>
    <p class="prelude-text">Spend 5 Elder Rune (legendary) runes on an item to either roll it 1-3 fresh sockets (only weapons, offhands, helmets and armor can ever have sockets, and only if it has none yet), or destroy whatever's currently socketed into it so you can resocket differently. Either way the 5 runes are consumed.</p>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
};

UI.renderEnchanter = function (el) {
  const runes = G.inventory.filter(i => i.type === 'rune');
  const tableHtml = `
    ${runes.length ? `<div class="inv-grid">${runes.map(r => `
      <div class="inv-item ${itemBorderClass(r)}" onclick="UI.pickEnchantTarget(${r.uid})">
        <div class="inv-icon">${itemIconHtml(r)}</div>
        <div class="inv-name" style="color:${itemColor(r)}">${esc(r.name)}</div>
        <div class="inv-sub">${ENCHANT_TIER_LABEL[runeTier(r)]}</div>
      </div>`).join('')}</div>` : '<p class="hint">No runes in your inventory yet — they drop from tough kills, or come out of the Rune Carver.</p>'}`;

  const selTiers = new Set(carverSelected.map(u => runeTier(G.inventory.find(i => i.uid === u))));
  const carverHtml = `
    <div class="forge-selected">Selected: ${carverSelected.length}/3${carverSelected.length === 3 && selTiers.size > 1 ? ' <span class="no">— must all be the same tier</span>' : ''}</div>
    <button class="btn btn-primary btn-small" ${carverSelected.length !== 3 || selTiers.size > 1 ? 'disabled' : ''} onclick="UI.doCarveRunes()">🔨 Carve</button>
    ${runes.length ? `<div class="inv-grid">${runes.map(r => `
      <div class="inv-item ${itemBorderClass(r)} ${carverSelected.includes(r.uid) ? 'selected' : ''}" onclick="UI.toggleCarverRune(${r.uid})">
        <div class="inv-icon">${itemIconHtml(r)}</div>
        <div class="inv-name" style="color:${itemColor(r)}">${esc(r.name)}</div>
        <div class="inv-sub">${ENCHANT_TIER_LABEL[runeTier(r)]}</div>
      </div>`).join('')}</div>` : '<p class="hint">No runes in your inventory yet.</p>'}`;

  const forgeTargets = [...unsocketedForgeItems(), ...socketedForgeItems()];
  const selectedForgeItem = forgeItem !== null ? forgeTargets.find(i => i.uid === forgeItem) : null;
  const legendaryRunes = runes.filter(r => runeTier(r) === 5);
  const canAdd = !!selectedForgeItem && selectedForgeItem.sockets === 0 && forgeRuneSel.length === 5;
  const canDestroy = !!selectedForgeItem && selectedForgeItem.sockets > 0 && selectedForgeItem.runes.length > 0 && forgeRuneSel.length === 5;
  const forgeHtml = `
    <h4 class="enchanter-step">1. Choose an item</h4>
    ${forgeTargets.length ? `<div class="inv-grid">${forgeTargets.map(t => `
      <div class="inv-item ${itemBorderClass(t)} ${forgeItem === t.uid ? 'selected' : ''}" onclick="UI.selectForgeItem(${t.uid})">
        <div class="inv-icon">${itemIconHtml(t)}</div>
        <div class="inv-name" style="color:${itemColor(t)}">${esc(t.name)}</div>
        <div class="inv-sub">${t.sockets === 0 ? 'No sockets' : `${t.runes.length}/${t.sockets} sockets used`}${equippedItems().includes(t) ? ' · equipped' : ''}</div>
      </div>`).join('')}</div>` : '<p class="hint">No eligible weapons, offhands, helmets or armor right now.</p>'}
    <h4 class="enchanter-step">2. Pay 5 Elder Rune (legendary) runes</h4>
    <div class="forge-selected">Selected: ${forgeRuneSel.length}/5</div>
    ${legendaryRunes.length ? `<div class="inv-grid">${legendaryRunes.map(r => `
      <div class="inv-item ${itemBorderClass(r)} ${forgeRuneSel.includes(r.uid) ? 'selected' : ''}" onclick="UI.toggleForgeRune(${r.uid})">
        <div class="inv-icon">${itemIconHtml(r)}</div>
        <div class="inv-name" style="color:${itemColor(r)}">${esc(r.name)}</div>
        <div class="inv-sub">${ENCHANT_TIER_LABEL[5]}</div>
      </div>`).join('')}</div>` : '<p class="hint">No Elder Rune (legendary) runes in your inventory yet.</p>'}
    <div class="forge-actions">
      <button class="btn btn-primary btn-small" ${canAdd ? '' : 'disabled'} onclick="UI.doForgeAddSockets()">🔓 Add Random Sockets</button>
      <button class="btn danger btn-small" ${canDestroy ? '' : 'disabled'} onclick="UI.doForgeDestroySockets()">💥 Destroy Socketed Runes</button>
    </div>`;

  el.innerHTML = `
    <div class="panel enchanter-panel">
      <h3>🔮 The Enchanter's Workshop
        <span class="filters">
          <button class="btn btn-tiny btn-sq" onclick="UI.showEnchanterHelp()" title="Help">❓</button>
        </span>
      </h3>
      <div class="subtabs">
        <button class="${enchanterView === 'table' ? 'active' : ''}" onclick="UI.setEnchanterView('table')">🔮 Enchantment Table</button>
        <button class="${enchanterView === 'carver' ? 'active' : ''}" onclick="UI.setEnchanterView('carver')">🔨 Rune Carver</button>
        <button class="${enchanterView === 'forge' ? 'active' : ''}" onclick="UI.setEnchanterView('forge')">⚒️ Rune Forge</button>
      </div>
      ${enchanterView === 'carver' ? carverHtml : enchanterView === 'forge' ? forgeHtml : tableHtml}
    </div>`;
};

// ------------------------------------------------------------
// City Arena — a one-shot bonus fight against a captured, empowered group
// of the current level's own local beasts. Always keyed to G.area (same
// convention as the Blacksmith's stock/Tavern's rewards), gated off once
// that level's story quest is cleared (G.bossKilled) or the Arena there
// has already been resolved either way (G.arenaResult: 'won'/'lost').
// ------------------------------------------------------------
UI.renderArena = function (el) {
  const level = G.area;
  const info = areaInfo(level);
  const result = G.arenaResult[level];
  const beaten = !!G.bossKilled[level];
  const busy = !!ADV;
  let bodyHtml;
  if (beaten) {
    bodyHtml = `<p class="hint">${esc(info.location)}'s Arena has moved on — this quest's story is already cleared here.</p>`;
  } else if (result === 'won') {
    bodyHtml = `<p class="hint">🏆 You already conquered ${esc(info.location)}'s Arena challenge — the Arena Master still nods respectfully whenever you pass.</p>`;
  } else if (result === 'lost') {
    bodyHtml = `<p class="hint">💀 The captured beasts here bested you. This level's Arena challenge is forfeit for good — the next quest's Arena awaits.</p>`;
  } else {
    bodyHtml = `
      <p class="hint">A caged, snarling group of ${esc(info.location)}'s own beasts awaits — either a Miniboss and an Epic, three Epics, or six Rares, all fattened with 50% more HP and 2 of them forced abnormal. One shot only: win and claim gold plus a rune; lose and this level's challenge is gone for good.</p>
      <button class="btn btn-primary btn-big" ${busy ? 'disabled' : ''} onclick="UI.enterArena()">🏛️ Enter the Arena</button>
      ${busy ? '<p class="hint">Finish or retreat from your current fight first.</p>' : ''}`;
  }
  el.innerHTML = `
    <div class="panel">
      <h3>🏛️ The Arena — ${esc(info.location)}</h3>
      <div class="item-sub">📖 ${esc(info.chapter.title)} · 🧭 Quest ${info.questNum}: ${esc(info.quest.name)}</div>
      ${bodyHtml}
    </div>`;
};

// Same "jump to the fight" pattern as the tab bar's own Adventure click
// (UI.showGame) — start the Arena fight, switch to the Adventure tab, and
// scroll straight to the Battle Arena panel so the fight is immediately
// visible instead of requiring a second manual tab click.
UI.enterArena = function () {
  startArenaFight(G.area);
  activeTab = 'adventure';
  UI.refresh();
  const arena = document.querySelector('.battle-arena');
  if (arena) arena.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ------------------------------------------------------------
// Journal tab: one page at a time (Prologue / a chapter / Epilogue),
// stepped through with ◀/▶ next to the title — same picker pattern as
// the Adventure tab's level picker (.area-picker/.area-info). Parts
// within the selected chapter stay nested open-close (<details>) menus,
// same as before. Only pages the player has actually reached are ever
// navigable — Epilogue only appears once the final chapter is cleared.
// ------------------------------------------------------------
// Ordered list of navigable pages: 'prologue', then every reached
// chapter number, then 'epilogue' once the whole game (level 100) is
// cleared — there's no story written for it yet, but the page exists.
UI.journalPages = function () {
  const frontier = Math.min(G.unlocked || 1, MAX_LEVEL_AREA);
  const curChapterNum = chapterNumOf(frontier);
  const epilogueUnlocked = !!G.bossKilled[MAX_LEVEL_AREA];
  return ['prologue', ...Array.from({ length: curChapterNum }, (_, i) => i + 1), ...(epilogueUnlocked ? ['epilogue'] : [])];
};

UI.setJournalPage = function (delta) {
  const pages = UI.journalPages();
  let idx = pages.indexOf(journalPage);
  if (idx === -1) idx = pages.length - 1;
  idx = Math.max(0, Math.min(pages.length - 1, idx + delta));
  journalPage = pages[idx];
  UI.refresh();
};

UI.renderJournal = function (el) {
  const pages = UI.journalPages();
  if (journalPage === null || !pages.includes(journalPage)) journalPage = pages[pages.length - 1];
  const idx = pages.indexOf(journalPage);

  const frontier = Math.min(G.unlocked || 1, MAX_LEVEL_AREA);
  const curChapterNum = chapterNumOf(frontier);

  // Only quests reached so far (past or current) are rendered at all.
  // A quest entry shows its Location, its intro, and the objective while
  // in progress; the outro + "Sets up Quest N" hook appear only once the
  // quest is cleared.
  const questEntry = (ch, chapterIdx, questIdx) => {
    const level = chapterIdx * 10 + questIdx + 1;
    const q = ch.quests[questIdx];
    const cleared = !!G.bossKilled[level];
    const state = cleared ? 'past' : 'current';
    const kills = G.progress[level] || 0;
    const intro = q.intro.map(p => `<p class="prelude-text journal-story-text">${esc(p)}</p>`).join('');
    const objective = `<p class="quest-objective">🎯 Objective: ${esc(q.objective)}</p>`;
    const body = cleared
      ? `${intro}${objective}
         ${q.outro.map(p => `<p class="prelude-text journal-story-text">${esc(p)}</p>`).join('')}
         ${q.setup ? `<p class="quest-setup">${esc(questSetupText(q.setup))}</p>` : ''}
         <p class="hint">🏆 Quest complete — this ground can still be walked again, but its tale here is told.</p>`
      : `${intro}${objective}<p>${Math.floor(kills / CREATURES_PER_LEVEL * 100)}% cleared so far.</p>`;
    return `<details class="journal-entry journal-part ${state}" ${state === 'current' ? 'open' : ''}>
      <summary>🧭 ${esc(q.name)}</summary>
      <div class="journal-body">
        <div class="quest-location-tag">🗺️ Location: ${esc(q.location)}</div>
        ${body}
      </div>
    </details>`;
  };

  let pageTitle, pageBody;
  if (journalPage === 'prologue') {
    pageTitle = `📜 Prologue: ${esc(DATA.PRELUDE.title)}`;
    pageBody = DATA.PRELUDE.pages.map(pg => `
      <h4 class="journal-section-head">${esc(pg.title)}</h4>
      ${pg.paragraphs.map(p => `<p class="prelude-text journal-story-text">${esc(p)}</p>`).join('')}`).join('');
  } else if (journalPage === 'epilogue') {
    pageTitle = `📖 Epilogue: ${esc(DATA.EPILOGUE.title)}`;
    pageBody = DATA.EPILOGUE.sections.map(s => `
      <h4 class="journal-section-head">${esc(s.h)}</h4>
      ${s.paragraphs.map(p => `<p class="prelude-text journal-story-text">${esc(p)}</p>`).join('')}`).join('') +
      '<p class="prelude-text journal-story-text epilogue-end">— END —</p>';
  } else {
    const chapterNum = journalPage, i = chapterNum - 1;
    const ch = DATA.CHAPTERS[i];
    const state = chapterNum < curChapterNum ? 'past' : 'current';
    // past chapters: every quest is cleared. current chapter: only up
    // through the frontier quest (the rest haven't started yet).
    const visibleQuestCount = state === 'past' ? 10 : ((frontier - 1) % 10) + 1;
    const quests = Array.from({ length: visibleQuestCount }, (_, q) => questEntry(ch, i, q)).join('');
    const chapterCleared = !!G.bossKilled[chapterNum * 10];
    pageTitle = `📖 ${esc(ch.title)}`;
    pageBody = `
      ${ch.headline ? `<p class="chapter-headline">${esc(ch.headline)}</p>` : ''}
      ${ch.story.map(p => `<p class="prelude-text journal-story-text">${esc(p)}</p>`).join('')}
      <div class="journal-parts">${quests}</div>
      ${chapterCleared ? `
        <h4 class="journal-section-head">Chapter Ending</h4>
        ${(ch.ending || []).map(p => `<p class="prelude-text journal-story-text">${esc(p)}</p>`).join('')}` : ''}`;
  }

  el.innerHTML = `
    <div class="panel">
      <h3>📔 Journal</h3>
      <div class="area-picker">
        <button class="btn" ${idx <= 0 ? 'disabled' : ''} onclick="UI.setJournalPage(-1)">◀</button>
        <div class="area-info"><div class="area-name">${pageTitle}</div></div>
        <button class="btn" ${idx >= pages.length - 1 ? 'disabled' : ''} onclick="UI.setJournalPage(1)">▶</button>
      </div>
      <div class="journal-body journal-page-body">${pageBody}</div>
    </div>`;
};

UI.pickSocketTarget = function (runeUid) {
  const targets = socketableItems();
  if (!targets.length) { UI.modal(`<h3>🪨 No socketable items</h3><p class="hint">Weapons, armors, helmets and shields can roll rune slots. Find one with an empty socket!</p><div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`); return; }
  UI.modal(`
    <h3>🪨 Socket rune into…</h3>
    <div class="socket-targets">
      ${targets.map(t => `<button class="btn socket-target" onclick="socketRune(${runeUid},${t.uid});UI.closeModal()">
        ${itemIconHtml(t)} <span style="color:${DATA.RARITIES[t.rarity].color}">${esc(t.name)}</span>
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
  const chapter = info.chapter;
  const kills = G.progress[G.area] || 0;
  el.innerHTML = `
    <div class="two-col">
      <div class="panel">
        <h3>📖 ${esc(chapter.title)}
          <span class="filters">
            <button class="btn btn-tiny btn-sq" onclick="UI.showAdventureSettings()" title="Adventure Settings">⚙️</button>
            <button class="btn btn-tiny btn-sq" onclick="UI.showBestiary(${G.area})" title="Bestiary">🐾</button>
            <button class="btn btn-tiny btn-sq" onclick="UI.showAdventureHelp()" title="Help">❓</button>
          </span>
        </h3>
        <div class="area-picker">
          <button class="btn" ${G.area <= 1 || ADV ? 'disabled' : ''} onclick="G.area--;saveGame();UI.refresh()">◀</button>
          <div class="area-info">
            <div class="area-sub area-clickable" onclick="UI.showQuestInfo(${G.area})">🧭 ${esc(info.quest.name)}</div>
            <div class="area-name area-clickable" onclick="UI.showQuestInfo(${G.area})">🗺️ ${esc(info.location)}</div>
          </div>
          <button class="btn" ${G.area >= G.unlocked || ADV ? 'disabled' : ''} onclick="G.area++;saveGame();UI.refresh()">▶</button>
        </div>
        <div class="quest-objective adv-objective">🎯 ${esc(info.quest.objective)}</div>
        <div class="bar progress-bar" title="Quest progress">
          <div style="width:${kills / CREATURES_PER_LEVEL * 100}%"></div>
          <span>${Math.floor(kills / CREATURES_PER_LEVEL * 100)}% cleared${G.bossKilled[G.area] ? ' · 🏆 quest complete' : ''}</span>
        </div>
        ${ADV ? `
          <div class="adv-status">
            <div class="adv-buttons">
              <button class="btn" onclick="${ADV.paused ? 'resumeAdventure()' : 'pauseAdventure()'}">${ADV.paused ? '▶ Resume' : '⏸ Pause'}</button>
              <button class="btn danger" onclick="stopAdventure()">🏳️ Retreat now</button>
              <span class="speed-ctl">Speed:
                <button class="btn btn-tiny ${ADV.speedMs === 1200 ? 'active' : ''}" onclick="setAdvSpeed(1200)">1×</button>
                <button class="btn btn-tiny ${ADV.speedMs === 400 ? 'active' : ''}" onclick="setAdvSpeed(400)">3×</button>
                <button class="btn btn-tiny ${ADV.speedMs === 120 ? 'active' : ''}" onclick="setAdvSpeed(120)">10×</button>
                <button class="btn btn-tiny ${ADV.speedMs === 40 ? 'active' : ''}" onclick="setAdvSpeed(40)">MAX</button>
              </span>
            </div>
          </div>` : `
          <button class="btn btn-primary btn-big" onclick="startAdventure()">⚔️ ADVENTURE!</button>`}
      </div>
      <div class="panel">
        <h3>⚔️ Battle Arena
          <span class="filters">
            <button class="btn btn-tiny btn-sq" onclick="UI.showCombatOptions()" title="Combat Options">⚙️</button>
            <button class="btn btn-tiny btn-sq" onclick="UI.showAutoUseSettings()" title="Auto-Use">🤖</button>
            <button class="btn btn-tiny btn-sq" onclick="UI.showCombatHelp()" title="Help">❓</button>
          </span>
        </h3>
        <div id="player-controls">${UI.controlsHtml()}</div>
        <div class="battle-arena">
          <div id="player-card">${UI.playerCardHtml()}</div>
          <div id="action-box">${UI.actionBoxHtml()}</div>
          <div id="enemy-panel" class="arena-enemies">${UI.enemyPanelHtml()}</div>
        </div>
        <h3>📖 Battle Log</h3>
        <div id="battle-log" class="battle-log">${UI.logHtml()}</div>
      </div>
    </div>`;
  UI.scrollLog();
};

// Quick modal summary of a quest — location, story-so-far and objective —
// opened by clicking the quest name/location on the Adventure panel
// without navigating away or restarting the quest-start screen.
UI.showQuestInfo = function (level) {
  const info = areaInfo(level);
  const cleared = !!G.bossKilled[level];
  UI.modal(`
    <h3>🧭 ${esc(info.quest.name)}</h3>
    <div class="item-sub">📖 ${esc(info.chapter.title)} · 🗺️ ${esc(info.location)}</div>
    ${info.quest.intro.map(p => `<p class="prelude-text">${esc(p)}</p>`).join('')}
    <p class="quest-objective">🎯 Objective: ${esc(info.quest.objective)}</p>
    ${cleared ? `
      ${info.quest.outro.map(p => `<p class="prelude-text">${esc(p)}</p>`).join('')}
      ${info.quest.setup ? `<p class="quest-setup">${esc(questSetupText(info.quest.setup))}</p>` : ''}
    ` : ''}
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
};

// Adventure-page settings — currently just pack size ("Enemies at once").
UI.showAdventureSettings = function () {
  UI.modal(`
    <h3>⚙️ Adventure Settings</h3>
    <div class="settings-section" style="border-top:none;margin-top:0;padding-top:0">
      <h4>⚔️ Enemies at once</h4>
      <div class="pack-row">
        ${[1, 2, 3, 4, 5, 6].map(n => `<button class="btn btn-tiny ${G.settings.packSize === n ? 'active' : ''}" data-packsize="${n}">${n}</button>`).join('')}
      </div>
      <p class="hint">More enemies fought at once means faster progress, but more danger.</p>
    </div>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
  document.querySelectorAll('[data-packsize]').forEach(b => b.onclick = () => { setPackSize(Number(b.dataset.packsize)); UI.showAdventureSettings(); });
};

UI.showAdventureHelp = function () {
  UI.modal(`
    <h3>❓ Adventure Help</h3>
    <p class="prelude-text">Each Quest is tied to one Location. Fight through its creatures and track your progress on the progress bar — along the way you'll run into 🔷 Rare and 🟣 Epic creatures, sometimes a Miniboss, before facing the quest's 🟠 Legendary named boss. Slaying the boss completes the quest and unlocks the next.</p>
    <p class="prelude-text">Tap the quest name or location to re-read its story and objective. Use 🐾 Bestiary to see every creature this quest can throw at you, including rare/elite versions, the wandering elf, and the boss.</p>
    <p class="prelude-text">⚔️ ADVENTURE! starts the fight — your hero battles round by round until the boss falls or their HP hits 0. ⚠️ Falling in battle resets this quest's kill progress (loot, gold and XP earned are kept); retreating manually keeps your progress. Potions found along the way are drunk on the spot.</p>
    <p class="prelude-text">While adventuring you can Pause, Retreat, or change playback Speed at any time. ⚙️ Settings controls how many enemies you fight at once — more enemies means faster progress but more danger.</p>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
};

UI.showCombatHelp = function () {
  UI.modal(`
    <h3>❓ Combat Arena Help</h3>
    <p class="prelude-text"><b>Attack gauge</b> — the bar under your HP/Mana on the hero card. Every round, every fighter's gauge fills by their Speed; whoever reaches 100 first acts. Faster heroes and enemies attack more often.</p>
    <p class="prelude-text"><b>Potions &amp; skills</b> — the icon row above the arena. Click one to use it, or press its keyboard shortcut badge (Q/W for potions, 1-9/0 for skills, desktop only). A faded number over an icon means it's on cooldown; the caption underneath shows stock left (potions) or mana cost (skills). Potions: ${POTION_CD}-tick cooldown. Skills: click to cast on your next swing.</p>
    <p class="prelude-text"><b>Layout</b> — left: your hero card (portrait, HP/Mana/gauge bars) plus a small box above it previewing your next action, and a grid of active buff/debuff icons to its right. Middle: the last thing that happened. Right: the enemy pack you're fighting.</p>
    <p class="prelude-text">Use ⚙️ Combat Options to decide what happens the instant a Rare/Epic/Miniboss/Abnormal encounter appears (pause, slow down, or continue normally), and 🤖 Auto-Use to automate potions and skills during combat.</p>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
};

// What will actually happen on the hero's next action: the manually
// queued skill if one is set, otherwise the free basic attack.
UI.nextActionSkill = function () {
  if (!G || !G.char) return null;
  const skills = DATA.SKILLS[G.char.cls];
  if (ADV && ADV.queued && skills[ADV.queued]) return skills[ADV.queued];
  return Object.values(skills).find(s => s.cat === 'basic');
};

// Every buff/DOT/debuff currently active on the player, regardless of
// source (a cast skill, a power-up scroll, or a monster specialty).
UI.playerEffects = function () {
  if (!ADV || !ADV.fight) return [];
  const f = ADV.fight;
  const out = [];
  if (ADV.scroll > 0) out.push({ icon: '📜', rounds: ADV.scroll, label: 'Power-up scroll — +12% damage' });
  for (const b of f.buffs) out.push({ icon: b.icon || '✨', rounds: b.rounds, label: b.name || 'Buff' });
  if (f.cursedDebuff) out.push({ icon: '🕯️', rounds: f.cursedDebuff.rounds, label: 'Cursed — weaker attacks' });
  if (f.corrosiveDebuff) out.push({ icon: '🧪', rounds: f.corrosiveDebuff.rounds, label: 'Corroded — less armor' });
  if (f.playerSlow) out.push({ icon: '❄️', rounds: f.playerSlow.rounds, label: 'Slowed' });
  if (f.playerDots) for (const k of Object.keys(f.playerDots)) {
    const dot = f.playerDots[k];
    out.push({ icon: dot.icon, rounds: dot.rounds, label: dot.label });
  }
  // The effects-grid box is a fixed size for at most 8 icons — cap here so
  // an unexpected 9th effect can't grow the grid and shift the hero card.
  return out.slice(0, 8);
};

// Left side of the arena: next-action box, the hero, and active effects.
UI.playerCardHtml = function () {
  const c = G.char;
  const d = ADV ? ADV.d : derive();
  const gaugePct = ADV && ADV.fight ? Math.min(100, ADV.fight.playerGauge / (d.atkInterval || 100) * 100) : 0;
  const gaugeDur = ADV && ADV.speedMs ? ADV.speedMs : 1200;
  const nextPlayerGauge = ADV && ADV.fight ? ADV.fight.playerGauge + d.speed * (ADV.fight.playerSlow ? (1 - ADV.fight.playerSlow.pct) : 1) : 0;
  const gaugeNextPct = ADV && ADV.fight ? Math.min(100, nextPlayerGauge / (d.atkInterval || 100) * 100) : 0;
  const nextSkill = UI.nextActionSkill();
  const effects = UI.playerEffects();
  return `
    <div class="player-row">
      <div class="next-action-box" title="${nextSkill ? esc(nextSkill.name) : ''}">${nextSkill ? nextSkill.icon : ''}</div>
      <div class="hero-card">
        <div class="hero-name">${esc(c.name)}</div>
        <div class="hero-sub">Lv ${c.level} ${className(c)}</div>
        <div class="bar hp-bar"><div style="width:${Math.max(0, c.hp / d.maxHp * 100)}%"></div><span>${formatK(Math.round(c.hp))}/${formatK(d.maxHp)}</span></div>
        <div class="bar mana-bar"><div style="width:${Math.max(0, c.mana / d.maxMana * 100)}%"></div><span>${formatK(Math.round(c.mana))}/${formatK(d.maxMana)}</span></div>
        <div class="bar enemy-gauge" title="attack gauge — swings every ${d.atkInterval} (weapon ×${d.atkFactor})"><div style="--from:${gaugePct}%;--to:${gaugeNextPct}%;--gauge-dur:${gaugeDur}ms"></div></div>
      </div>
      <div class="effects-grid">
        ${effects.map(e => `<div class="effect-icon" title="${esc(e.label)}">${e.icon}<span class="effect-rounds">${e.rounds}</span></div>`).join('')}
      </div>
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

const TIER_UI_LABEL = { normal: 'Normal', miniboss: 'Miniboss', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

// ------------------------------------------------------------
// Bestiary — a paged "book" of everything a quest can throw at you:
// its local threats (and their Rare/Epic/Miniboss versions, computed
// with the same formulas makeCreature uses), the wandering Sneaky Elf,
// and the quest's named boss.
// ------------------------------------------------------------
UI.bestiaryPages = function (level) {
  const info = areaInfo(level);
  const pages = [];
  pages.push({ kind: 'intro', info });
  for (const cr of creaturesForLevel(level)) pages.push({ kind: 'threat', cr, level, info });
  pages.push({ kind: 'elf', level });
  pages.push({ kind: 'boss', info, level });
  return pages;
};

UI.bestiaryTierRow = function (base, level, tier) {
  const conf = TIER_CONF[tier];
  const hp = Math.max(5, Math.round(39 * base.hp * enemyHpScale(level) * conf.hp));
  const dmg = Math.max(1, Math.round(11.7 * base.dmg * enemyDmgScale(level) * conf.dmg));
  const tierIcon = { normal: '⚪', rare: '🔷', epic: '🟣', miniboss: '🩷', legendary: '🔶' }[tier];
  return `<div class="bestiary-tier-row"><span>${tierIcon} ${TIER_UI_LABEL[tier]}</span><span>❤️ ~${formatK(hp)} HP</span><span>⚔️ ~${formatK(dmg)} dmg</span></div>`;
};

UI.showBestiary = function (level, pageIdx) {
  const pages = UI.bestiaryPages(level);
  const i = Math.max(0, Math.min(pages.length - 1, pageIdx || 0));
  const page = pages[i];
  const info = areaInfo(level);
  let body;
  if (page.kind === 'intro') {
    body = `
      <h3>🐾 Bestiary — ${esc(info.location)}</h3>
      <p class="prelude-text">This quest's 1,111 creatures follow a fixed pattern: every 11th kill is a 🔷 Rare, every 111th a 🟣 Epic, and the 1,111th is the quest's boss. From partway through the chapter, normal encounters also have a small chance to be a wandering 🩷 Miniboss instead. Rare/Epic/Miniboss encounters are one of this quest's own local threats, just renamed and much stronger.</p>
      <p class="prelude-text">Flip through this book for stats on every local threat, the wandering Sneaky Elf, and this quest's named boss.</p>`;
  } else if (page.kind === 'threat') {
    const cr = page.cr;
    const tiers = ['normal', 'rare', 'epic'];
    if (minibossPossible(level)) tiers.push('miniboss');
    body = `
      <h3>${esc(cr.name)}</h3>
      <div class="item-sub">${esc(cr.attack)} (${cr.atkType}) — res ⚔️${cr.res.phys}% ✨${cr.res.magic}% ☠️${cr.res.poison}%</div>
      <p class="hint">Stats shown are approximate, at your current quest's level.</p>
      <div class="bestiary-tiers">${tiers.map(t => UI.bestiaryTierRow(cr, level, t)).join('')}</div>`;
  } else if (page.kind === 'elf') {
    body = `
      <h3>🧝 Sneaky Elf</h3>
      <div class="item-sub">A rare bonus encounter (${(ELF_CHANCE * 100).toFixed(0)}% chance instead of a normal fight) — doesn't count toward the quest's 1,111 kills.</div>
      <p class="prelude-text">He never attacks and flees after at most 5 hits. Every 25% of his HP you knock off shakes an item loose from his bag; killing him outright before he flees spills the whole thing.</p>
      <div class="bestiary-tiers">
        ${Object.entries(ELF_TYPES).map(([id, t]) => `<div class="bestiary-tier-row"><span style="color:${t.color}">🧝 ${esc(t.name)}</span><span>❤️ ~${formatK(Math.round(39 * t.hpMult * enemyHpScale(level)))} HP</span><span>${t.weight}% of elf sightings</span></div>`).join('')}
      </div>
      <p class="prelude-text">Golden is the common baseline. Emerald and Diamond are progressively rarer, tougher, and carry noticeably better loot odds on both the 25%-HP bag drops and the final kill drop.</p>`;
  } else {
    const boss = info.quest.boss;
    const isChapterBoss = isChapterEndLevel(level);
    body = `
      <h3 style="${isChapterBoss ? 'color:#8b1a2b' : ''}">${isChapterBoss ? '🩸' : '🔶'} ${esc(boss.name)}${isChapterBoss ? ' — Chapter Boss' : ' — Quest Boss'}</h3>
      <div class="item-sub">${esc(boss.attack)} (${boss.atkType}) — res ⚔️${boss.res.phys}% ✨${boss.res.magic}% ☠️${boss.res.poison}%</div>
      <div class="bestiary-tiers">${UI.bestiaryTierRow(boss, level, 'legendary')}</div>
      ${boss.specialties && boss.specialties.length ? `<div class="bestiary-specialties">${boss.specialties.map(id => {
        const s = DATA.SPECIALTIES[id];
        return s ? `<div class="affix" style="color:${s.color}">${s.icon} <b>${esc(s.name)}</b> — ${esc(s.desc)}</div>` : '';
      }).join('')}</div>` : ''}
      <p class="prelude-text">The 1,111th kill of this quest. Slay it to complete the quest and unlock the next.</p>`;
  }
  UI.modal(`
    <div class="bestiary-page">${body}</div>
    <div class="prelude-nav">
      <div class="prelude-nav-side">
        <button class="btn btn-tiny" ${i === 0 ? 'disabled' : ''} onclick="UI.showBestiary(${level},${i - 1})">◀ Prev</button>
      </div>
      <div class="prelude-nav-side">
        <button class="btn btn-tiny" ${i === pages.length - 1 ? 'disabled' : ''} onclick="UI.showBestiary(${level},${i + 1})">Next ▶</button>
        <span class="prelude-page-indicator">Page ${i + 1}/${pages.length}</span>
      </div>
    </div>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
};

UI.showCombatOptions = function () {
  const m = G.settings.encounterMode;
  const tiers = [['legendary', 'Legendary'], ['miniboss', 'Miniboss'], ['epic', 'Epic'], ['rare', 'Rare'], ['abnormal', 'Abnormal']];
  const modeOptions = [['pause', 'Pause'], ['speed1x', '1x Speed'], ['continue', 'Continue Normally']];
  UI.modal(`
    <h3>⚙️ Combat Options</h3>
    <p class="hint">Choose what happens the moment each type of encounter appears. "Miniboss" is the Miniboss tier itself; "Abnormal" is any regular creature that independently rolled a specialty (Vampiric, Explosive, etc.), whatever its rarity.</p>
    <div class="settings-list">
      ${tiers.map(([id, label]) => `
        <div class="settings-card">
          <b>${label}</b>
          <select data-mode-tier="${id}">${modeOptions.map(([v, l]) => `<option value="${v}" ${m[id] === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        </div>`).join('')}
    </div>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
  document.querySelectorAll('[data-mode-tier]').forEach(r => r.onchange = () => {
    G.settings.encounterMode[r.dataset.modeTier] = r.value; saveGame();
  });
};

const AUTO_MODE_SIMPLE = [['off', 'Off'], ['100', 'Below 100% (any missing)'], ['50', 'Below 50%'], ['25', 'Below 25%']];
const AUTO_MODE_MANA_BUFF = [['off', 'Off'], ['100', 'Mana at 100%'], ['50', 'Mana above 50%'], ['25', 'Mana above 25%']];
const AUTO_MODE_AVAILABLE = [['off', 'Off'], ['100', 'Mana at 100%'], ['50', 'Mana above 50%'], ['available', 'Whenever available']];

UI.showAutoUseSettings = function () {
  const au = G.settings.autoUse;
  const tierRow = key => `<div class="tier-checks">${AUTO_USE_TIERS.map(t =>
    `<label><input type="checkbox" data-tier="${key}:${t}" ${au[key].tiers[t] ? 'checked' : ''}> ${TIER_UI_LABEL[t]}</label>`).join('')}</div>`;
  const simpleSelect = (key, options) => `<select data-simple="${key}">${options.map(([v, l]) => `<option value="${v}" ${au[key] === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const complexSelect = key => `<select data-complex="${key}">${AUTO_MODE_AVAILABLE.map(([v, l]) => `<option value="${v}" ${au[key].mode === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  UI.modal(`
    <h3>🤖 Auto-Use Settings</h3>
    <p class="hint">Automates potions and skills during combat, whenever nothing is manually queued. Skill rules only fire if you've learned that skill category. "Abnormal" covers Mini Bosses and also any regular creature that rolled a specialty, whatever its rarity.</p>
    <div class="settings-section"><h4>❤️ Health Potion</h4>${simpleSelect('hpPotion', AUTO_MODE_SIMPLE)}</div>
    <div class="settings-section"><h4>🔵 Mana Potion</h4>${simpleSelect('manaPotion', AUTO_MODE_SIMPLE)}</div>
    <div class="settings-section"><h4>💚 Heal Skill</h4>${simpleSelect('heal', AUTO_MODE_SIMPLE)}</div>
    <div class="settings-section"><h4>📯 Buff Skill</h4>${simpleSelect('buff', AUTO_MODE_MANA_BUFF)}</div>
    <div class="settings-section"><h4>😤 Debuff Skill</h4>${complexSelect('debuff')}${tierRow('debuff')}</div>
    <div class="settings-section"><h4>🔥 Ultimate</h4>${complexSelect('ultimate')}${tierRow('ultimate')}</div>
    <div class="settings-section"><h4>⚔️ Damage Skill <small>(random among available)</small></h4>${complexSelect('damage')}${tierRow('damage')}</div>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
  document.querySelectorAll('[data-simple]').forEach(sel => sel.onchange = () => { G.settings.autoUse[sel.dataset.simple] = sel.value; saveGame(); });
  document.querySelectorAll('[data-complex]').forEach(sel => sel.onchange = () => { G.settings.autoUse[sel.dataset.complex].mode = sel.value; saveGame(); });
  document.querySelectorAll('[data-tier]').forEach(cb => cb.onchange = () => {
    const [key, t] = cb.dataset.tier.split(':');
    G.settings.autoUse[key].tiers[t] = cb.checked; saveGame();
  });
};

// Skills currently available to activate (owned, non-passive, non-basic),
// in the fixed order used both for the control row and for the 1-9/0
// keyboard shortcuts, so the Nth button always matches the Nth key.
UI.activeSkills = function () {
  if (!G || !G.char) return [];
  return DATA.SKILL_ORDER.map(classSkillFor).filter(Boolean)
    .filter(s => !s.passive && s.cat !== 'basic' && (G.char.skills[s.id] || 0) > 0);
};

const SKILL_SHORTCUTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

// Above the arena: manual potions and activatable skills as one row of
// square icon buttons — potions are just two more actions here, not a
// separate category. Cooldown replaces the icon with a faded number
// overlay while the button is disabled/faded, same as before; count/cost
// sits in a caption underneath so the button itself stays square. Each
// button shows its keyboard shortcut (Q/W for potions, 1-9/0 for skills)
// as a corner badge, hidden on touch-sized screens in CSS.
UI.controlsHtml = function () {
  if (!ADV) return '';
  const potCap = potionCapacity();
  const potBtn = (kind, icon, label, key) => {
    const cd = ADV.potCd[kind] || 0;
    const n = G.potions[kind] || 0;
    return `<div class="icon-btn-wrap">
      <button class="btn icon-btn pot-btn ${cd > 0 ? 'on-cd' : ''}" ${cd > 0 || n <= 0 || ADV.paused ? 'disabled' : ''}
        title="${label} potion (${key}) — ${n}/${potCap} available${cd > 0 ? `, ${cd} rounds left on cooldown` : ''}" onclick="drinkPotion('${kind}')">
        ${icon}${cd > 0 ? `<span class="icon-btn-cd">${cd}</span>` : ''}<span class="icon-btn-key">${key}</span></button>
      <div class="icon-btn-caption">${n}/${potCap}</div>
    </div>`;
  };
  const actives = UI.activeSkills();
  const skillBtn = (s, key) => {
    const cd = ADV.fight ? (ADV.fight.cds[s.id] || 0) : 0;
    const cost = skillCost(s);
    const noMana = G.char.mana < cost;
    const queued = ADV.queued === s.id;
    return `<div class="icon-btn-wrap">
      <button class="btn icon-btn skill-btn ${queued ? 'queued' : ''} ${cd > 0 ? 'on-cd' : ''}" ${cd > 0 || noMana || ADV.paused ? 'disabled' : ''}
        title="${esc(s.name)}${key ? ` (${key})` : ''} — ${esc(s.desc(Math.max(1, effectiveRank(s.id))))} — ${cost} mana${s.cd ? `, ${s.cd} round cd` : ''}"
        onclick="queueSkill('${s.id}')">${s.icon}${cd > 0 ? `<span class="icon-btn-cd">${cd}</span>` : ''}${key ? `<span class="icon-btn-key">${key}</span>` : ''}</button>
      <div class="icon-btn-caption">${cost} MP</div>
    </div>`;
  };
  return `
    <div class="ctl-row">
      ${potBtn('hp', '❤️', 'Health', 'Q')} ${potBtn('mana', '🔵', 'Mana', 'W')}
      ${actives.map((s, i) => skillBtn(s, SKILL_SHORTCUTS[i] || '')).join('')}
    </div>`;
};

// Detailed cards for every enemy in the current fight.
// grid cells each tier occupies in the 2x3 (mobile-friendly) battle grid
const TIER_CELLS = { normal: 1, rare: 1, miniboss: 2, elf: 2, epic: 2, legendary: 4 };
// Miniboss: light pinkish red. Legendary (quest boss): standard orange.
// A chapter's 10th-quest boss overrides to a darker blood-red.
const TIER_COLOR = { normal: '#c8c8c8', rare: '#6c9bff', epic: '#c77dff', miniboss: '#ff6b7a', legendary: '#ff8b3d', elf: '#8fd96c' };
const CHAPTER_BOSS_COLOR = '#d1202c';
function enemyColor(e) {
  if (e.isChapterBoss) return CHAPTER_BOSS_COLOR;
  if (e.tier === 'elf' && e.elfType && ELF_TYPES[e.elfType]) return ELF_TYPES[e.elfType].color;
  return TIER_COLOR[e.tier] || TIER_COLOR.normal;
}
function enemyCardClass(e) { return `tierb-${e.tier}${e.isChapterBoss ? ' tierb-chapterboss' : ''}`; }
function enemyTierLabel(e) {
  if (e.tier === 'legendary') return e.isChapterBoss ? 'Chapter Boss' : 'Quest Boss';
  return `${cap(e.tier)} ${e.species}`;
}

UI.enemyPanelHtml = function () {
  if (!ADV) return `<p class="hint">No fight in progress.</p>`;
  if (!ADV.fight) {
    return `<div class="round-ind">Travelling...</div>
      <div class="enemy-cards">${'<div class="enemy-placeholder"></div>'.repeat(6)}</div>`;
  }
  const f = ADV.fight;
  const used = f.enemies.reduce((s, e) => s + (TIER_CELLS[e.tier] || 1), 0);
  const placeholders = Math.max(0, 6 - used);
  const gaugeDur = ADV.speedMs || 1200;
  return `<div class="round-ind">Round ${f.round} · your gauge ${Math.round(f.playerGauge)}/100 (+${ADV.d.speed}/round)</div>
    <div class="enemy-cards">
    ${f.enemies.map(e => {
      const gFrom = Math.min(100, e.gauge);
      const gTo = e.hp > 0 ? Math.min(100, e.gauge + effectiveEnemySpd(e)) : gFrom;
      return `
      <div class="enemy-card ${e.hp <= 0 ? 'dead' : ''} ${enemyCardClass(e)}">
        <div class="enemy-name" style="color:${enemyColor(e)}">${e.hp <= 0 ? '☠️ ' : ''}${esc(e.name)}</div>
        <div class="enemy-sub">${e.tier !== 'normal' ? `${esc(enemyTierLabel(e))} · ` : ''}Lv ${e.level}
          ${(e.affixes || []).map(a => `<span class="affix-badge" style="color:${DATA.SPECIALTIES[a].color}" title="${esc(DATA.SPECIALTIES[a].name)} — ${esc(DATA.SPECIALTIES[a].desc)}">${DATA.SPECIALTIES[a].icon} ${esc(DATA.SPECIALTIES[a].name)}</span>`).join('')}
        </div>
        <div class="bar enemy-hp"><div style="width:${Math.max(0, e.hp / e.maxHp * 100)}%"></div><span>${formatK(Math.max(0, Math.round(e.hp)))}/${formatK(e.maxHp)}</span></div>
        <div class="enemy-stats">
          ${e.tier === 'elf' ? `<span>🎒 Hits: ${f.elfHits || 0}/5 — he never fights back!</span>` : `
          <span title="damage">🗡️ ${formatK(e.dmg)}</span>
          <span title="speed — gauge gained per round">⚡ ${e.spd}</span>
          <span title="attack">${esc(e.attack)} (${e.atkType})</span>`}
          ${e.stunned > 0 ? '<span>💫 stunned</span>' : ''}
        </div>
        <div class="enemy-stats res" title="resistances">⚔️ ${e.res.phys}% · ✨ ${e.res.magic}% · ☠️ ${e.res.poison}%</div>
        <div class="bar enemy-gauge" title="action gauge"><div style="--from:${gFrom}%;--to:${gTo}%;--gauge-dur:${gaugeDur}ms"></div></div>
      </div>`;
    }).join('')}
    ${'<div class="enemy-placeholder"></div>'.repeat(placeholders)}
    </div>`;
};

UI.logHtml = function () {
  if (!LOG.length) return '<p class="hint">The log fills up while adventuring…</p>';
  return LOG.slice(-50).reverse().map(l => `<div class="log-line log-${l.t} ${l.tier ? 'tier-' + l.tier : ''} ${l.rarity ? 'rar-txt-' + l.rarity : ''}">${esc(l.txt)}</div>`).join('');
};

UI.refreshAdventure = function () {
  if (!G) return;
  if (UI.checkClassMilestones()) return;
  UI.renderTopbar();
  UI.updateTabNotifications();
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
  if (logEl) logEl.scrollTop = 0;
};

// ------------------------------------------------------------
// Results modal
// ------------------------------------------------------------
UI.showResults = function (run, level) {
  const info = areaInfo(level);
  const chapter = info.chapter;
  const k = run.kills;
  const totalKills = k.normal + k.rare + k.epic + (k.miniboss || 0) + k.legendary;
  const outcomeTxt = {
    boss: '🏆 VICTORY! The Legendary Boss has fallen!',
    arena_won: '🏛️ ARENA VICTORY! The captured beasts are defeated!',
    defeated: run.isArena
      ? '💀 The Arena\'s captives overpower you — this level\'s challenge is forfeit. Loot and XP are yours to keep.'
      : `💀 You fell in battle — the level resets!${run.progressLost ? ` ${run.progressLost} kills of progress lost.` : ''} Loot and XP are yours to keep.`,
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
    <div class="item-sub">📖 ${esc(chapter.title)} · 🧭 Quest ${info.questNum}: ${esc(info.quest.name)} — 🗺️ ${esc(info.location)}</div>
    ${run.outcome === 'defeated' && run.killedByHit ? `
      <h4>☠️ Killing blow</h4>
      <p class="hint">${run.killedByHit.icon} ${esc(run.killedByHit.label)} — ${formatK(run.killedByHit.amount)} damage</p>` : ''}
    ${run.outcome === 'defeated' && run.killedBy && run.killedBy.length ? `
      <h4>💀 The pack that got you
        <button class="btn btn-tiny" onclick="UI.closeModal();UI.showBestiary(${level})">🐾 View in Bestiary</button>
      </h4>
      <div class="killedby-cards">
        ${run.killedBy.map(e => `
          <div class="enemy-card ${e.alive ? '' : 'dead'} ${enemyCardClass(e)}">
            <div class="enemy-name" style="color:${enemyColor(e)}">${e.alive ? '' : '☠️ '}${esc(e.name)}</div>
            <div class="enemy-sub">${e.tier !== 'normal' ? `${esc(enemyTierLabel(e))} · ` : ''}Lv ${e.level}
              ${e.affixes.map(a => `<span class="affix-badge" style="color:${DATA.SPECIALTIES[a].color}" title="${esc(DATA.SPECIALTIES[a].name)} — ${esc(DATA.SPECIALTIES[a].desc)}">${DATA.SPECIALTIES[a].icon} ${esc(DATA.SPECIALTIES[a].name)}</span>`).join('')}
            </div>
            <div class="bar enemy-hp"><div style="width:${Math.max(0, e.hp / e.maxHp * 100)}%"></div><span>${formatK(e.hp)}/${formatK(e.maxHp)}</span></div>
            <div class="enemy-stats">
              <span title="damage">🗡️ ${formatK(e.dmg)}</span>
              <span title="speed — gauge gained per round">⚡ ${e.spd}</span>
              <span title="attack">${esc(e.attack)} (${e.atkType})</span>
            </div>
            <div class="enemy-stats res" title="resistances">⚔️ ${e.res.phys}% · ✨ ${e.res.magic}% · ☠️ ${e.res.poison}%</div>
          </div>`).join('')}
      </div>` : ''}
    ${isBoss ? `<p class="part-end-story">🏆 ${esc(info.quest.boss.name)} has fallen — ${esc(info.quest.name)} is complete! Hit Continue to see how the story unfolds.</p>` : ''}
    ${isBoss && run.partReward ? `
      <h4>🎁 Quest Reward</h4>
      <div class="quest-reward-box">
        <span class="gold">🪙 ${formatK(run.partReward.gold)}</span>
        ${run.partReward.autoSold
          ? `<span class="reward-item">🪙 ${formatK(run.partReward.item.value)} <small>(auto-sold ${itemIconHtml(run.partReward.item)} ${esc(run.partReward.item.name)})</small></span>`
          : `<span class="reward-item" style="color:${DATA.RARITIES[run.partReward.item.rarity].color}">${itemIconHtml(run.partReward.item)} ${esc(run.partReward.item.name)} <small>(${DATA.RARITIES[run.partReward.item.rarity].name})</small></span>`}
      </div>` : ''}
    ${run.outcome === 'arena_won' && run.arenaReward ? `
      <h4>🏛️ Arena Reward</h4>
      <div class="quest-reward-box">
        <span class="gold">🪙 ${formatK(run.arenaReward.gold)}</span>
        <span class="reward-item" style="color:${itemColor(run.arenaReward.rune)}">${run.arenaReward.rune.icon} ${esc(run.arenaReward.rune.name)}</span>
      </div>
      <p class="part-end-story">🏛️ The Arena Master grins: "You won this city's challenge to the arena — try your luck in the next city!"</p>` : ''}
    <h4>Battle report</h4>
    <div class="results-grid">
      <div class="res-box"><b>⚔️ ${formatK(Math.round(run.dmgDealt))}</b><span>damage dealt</span></div>
      <div class="res-box"><b>🩸 ${formatK(Math.round(run.dmgTaken))}</b><span>damage taken</span></div>
      <div class="res-box"><b>${formatK(run.xp)}</b><span>XP${run.levelUps ? ` (+${run.levelUps} level${run.levelUps > 1 ? 's' : ''}!)` : ''}</span></div>
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
      <div class="res-box"><b class="gold">🪙 ${formatK(run.gold)}</b><span>gold</span></div>
      <div class="res-box"><b>📦 ${run.items.length}</b><span>items dropped</span></div>
    </div>
    ${dropChips.length ? `<div class="drop-chips">${dropChips.join(' · ')}</div>` : ''}
    ${run.items.length ? `<h4>Loot acquired</h4>
      <div class="loot-list">
        ${run.items.map(it => `<div class="loot-row">
          ${itemIconHtml(it)} <span style="color:${itemColor(it)}">${esc(it.name)}</span>
          <small>${it.type === 'rune' ? `rune · ${it.bonuses.length} bonus` : `${DATA.RARITIES[it.rarity].name} · ${esc(it.baseName)}`}</small>
        </div>`).join('')}
      </div>` : '<p class="hint">No items this time — the wilds are stingy.</p>'}
    ${run.autoSold && run.autoSold.length ? `<h4>🪙 Auto-sold</h4>
      <div class="loot-list">
        ${run.autoSold.map(it => `<div class="loot-row">
          ${it.icon} <span style="color:${DATA.RARITIES[it.rarity].color}">${esc(it.name)}</span>
          <small>sold for 🪙 ${formatK(it.value)}</small>
        </div>`).join('')}
      </div>` : ''}
    <div class="modal-actions">
      ${isBoss
        ? `<button class="btn btn-primary" onclick="UI.closeModal();UI.afterBossVictory(${level})">▶ Continue</button>`
        : `<button class="btn btn-primary" onclick="UI.closeModal();startAdventure()">⚔️ Adventure again</button>
           <button class="btn" onclick="UI.closeModal()">Close</button>`}
    </div>`, !isBoss);
};

UI.showChangelog = function () {
  UI.modal(`
    <h3>📋 Changelog</h3>
    <div class="changelog-list">
      ${DATA.CHANGELOG.map(entry => `
        <div class="changelog-entry">
          <h4>v${entry.v}</h4>
          <ul>${entry.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
        </div>`).join('')}
    </div>
    <div class="modal-actions"><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
};

// ------------------------------------------------------------
// Modal helpers
// ------------------------------------------------------------
// closable=false omits the X button and backdrop-click-to-close, forcing
// the modal's own action button(s) as the only way out — used for the
// boss-victory results screen, same "no escape hatch but the button"
// behavior as the Chapter/Quest start screens.
UI.modal = function (innerHtml, closable) {
  const root = $('#modal-root');
  const notClosable = closable === false;
  root.innerHTML = `<div class="modal-backdrop" ${notClosable ? '' : 'onclick="if(event.target===this)UI.closeModal()"'}><div class="modal">
    ${notClosable ? '' : '<button class="modal-x" onclick="UI.closeModal()" title="Close" aria-label="Close">✕</button>'}
    ${innerHtml}
  </div></div>`;
};
UI.closeModal = function () { $('#modal-root').innerHTML = ''; };

// ------------------------------------------------------------
// Keyboard shortcuts: Q/W for the two potions, 1-9/0 for the currently
// active skills (same order as UI.activeSkills / the control row). Mirrors
// each button's own disabled logic so a shortcut can't fire an action the
// matching click would have refused.
// ------------------------------------------------------------
window.addEventListener('keydown', e => {
  if (activeTab !== 'adventure' || !ADV || ADV.paused) return;
  const modalRoot = $('#modal-root');
  if (modalRoot && modalRoot.innerHTML.trim()) return;
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const key = e.key.toLowerCase();
  if (key === 'q') {
    if ((ADV.potCd.hp || 0) <= 0 && (G.potions.hp || 0) > 0) { e.preventDefault(); drinkPotion('hp'); }
    return;
  }
  if (key === 'w') {
    if ((ADV.potCd.mana || 0) <= 0 && (G.potions.mana || 0) > 0) { e.preventDefault(); drinkPotion('mana'); }
    return;
  }
  const idx = SKILL_SHORTCUTS.indexOf(e.key);
  if (idx === -1) return;
  const skill = UI.activeSkills()[idx];
  if (!skill) return;
  const cd = ADV.fight ? (ADV.fight.cds[skill.id] || 0) : 0;
  if (cd > 0 || G.char.mana < skillCost(skill)) return;
  e.preventDefault();
  queueSkill(skill.id);
});

window.addEventListener('DOMContentLoaded', UI.init);
