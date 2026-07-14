# Kharun Lands — Version History

Versioning is `MAJOR.MINOR.FIX`.

- **MAJOR** — bumped only when explicitly requested by the user.
- **MINOR** — gameplay changes (balance, new mechanics, content). Not capped
  at 9 — can run 0.10, 0.11, 0.12, ... indefinitely under a major version.
- **FIX** — bug fixes and/or design/UX-only updates (no gameplay change).

This file is the human-facing dev record of what shipped in each version and
why. The in-game Changelog modal (`DATA.CHANGELOG` in `data.js`) is updated
by hand alongside this file to stay in sync — this file is not read by the
game at runtime.

---

## 1.2.2 (fix)

- Top bar restructured: `.tb-charbox` (name/XP/HP/Mana, stacked into a
  bordered card on mobile) + `.tb-side` (Gold, new inventory item count)
  + a standalone right-aligned Help button. Save/Reset buttons removed —
  progress auto-saves, and per-hero deletion already exists as 🗑️ Delete
  on the title screen's slot cards; `resetGame()` (game.js) removed as
  dead code since nothing called it anymore.
- Removed the "+N stat"/"+N skill" `.pts` badges from the top bar — the
  Character tab's breathing highlight (from 1.2.1) already covers this.
- `tab-breathe` keyframes: color changed from the accent gold (too easy
  to mistake for "this tab is active") to a dark green (`#3ecf6a`), and
  now also breathes `background-color`, not just text/glow.

## 1.2.1 (fix)

- Unspent stat/skill points (Character tab + its Character/Skills subtabs)
  no longer show an appended ⬆ icon badge — instead a `.tab-notify` CSS
  class applies a slow `tab-breathe` keyframe animation (color/text-shadow
  oscillating toward `--accent`) directly to the tab's own text. Reusable
  for any future "something to look at, no icon" tab state.
- Character tab's icon changed from 🧍 to 🛡️ (also updated in the game
  help modal's tab-list line).

## 1.2.0 (minor)

Multi-character save slots (a real architecture/gameplay change), bundled
with the Adventure/Bestiary/mobile polish requested alongside it.

- Save system reworked from one `localStorage` key to a `SLOTS_KEY` array
  of `MAX_SLOTS` (5) slots (`game.js`: `loadSlots`/`saveSlots`/`loadGame(i)`
  /`newGame(cls, slotIdx)`/`deleteSlot(i)`). `activeSlot` (module var)
  tracks which slot the in-memory `G` belongs to; `saveGame()` writes to
  `slots[activeSlot]`. A legacy single-save (`SAVE_KEY`) is migrated into
  slot 0 the first time `loadSlots()` runs, then removed.
- `UI.showTitle()` (ui.js) is now a slot grid: populated slots show
  Continue/Export/Delete, empty slots show New Character. `pendingNewSlot`
  records which empty slot a freshly-picked class should land in.
- Export downloads a slot's save as `.json` (Blob + temporary `<a
  download>`). Import reads a `.json` file, validates it has a recognizable
  `char.cls`, and drops it into the first empty slot — refuses if none are
  free or the file doesn't look like a character save.
- Adventure page: removed the "Local threats" creature-chip list entirely
  (fully superseded by the Bestiary, which got a parchment/book-page
  visual treatment); moved the Bestiary button next to Settings/Help.
- Settings/Help/Bestiary/Combat Options/Auto-Use/Save/Reset buttons are
  now icon-only squares (`.btn-sq`, 30×30) with the label moved to a
  `title` hover tooltip instead of visible text.
- Combat Options: replaced 5 rows of 3 stacked radio buttons with one
  per-tier dropdown card (`.settings-card`) — the radio-list version
  wasn't actually comfortable to use on a phone even though it technically
  didn't overflow. Auto-Use's checkboxes/selects got larger touch targets.

## 1.1.1 (fix)

- Quest-start screen (`UI.showQuestStart`) dropped its "Quest N:"/"Location:"
  text labels, keeping only the icons + quest name/location — same cleanup
  already applied to the Journal and quest-end screens in 1.1.0.

## 1.1.0 (minor)

Gameplay changes: Sneaky Elf tiers and Miniboss timing, bundled with a few
small UI/text cleanups touched along the way.

- Sneaky Elf split into three types: Golden (common baseline), Emerald and
  Diamond (rarer, more HP, better bag-shake/kill drop odds). Spawn weights
  ~70/22/8%. HP multipliers 10x/14x/18x vs a normal monster.
- `minibossPossible`: Chapter 1 now allows Minibosses from its 3rd quest
  (was the 5th); every chapter after Chapter 1 allows them from its very
  first quest.
- Journal entries and quest-end/victory text drop "Quest N" numbering,
  showing just the quest name. The `.setup` "Sets up Quest N: …" hook text
  is now stripped of that dev-facing prefix and capitalized at render time
  (`questSetupText` in ui.js) rather than shown raw.
- Removed the class icon from the Battle Arena hero card (kept in the
  topbar and title/continue screen).
- Fixed a real bug: Epic/Miniboss/Legendary/Elf enemy cards are column-flex
  containers, so `.bar`'s `flex:1` (flex-basis:0) was silently collapsing
  their HP/gauge bars to ~1.6px regardless of the tier-specific `height`
  rules — the same class of bug already fixed once on `.hero-card .bar`.
  Added `.enemy-card .bar { flex: none; }`.

## 1.0.1 (fix)

UI/UX and mobile-friendliness pass following the v1.0.0 story rework. No
gameplay/balance changes.

- Epilogue is now paged one section at a time, matching the Prologue's
  Back/Continue/page-counter pattern, plus a Skip button on its first page.
- Every pre-game screen (Prologue, Title, Class Select, Chapter intro/end,
  Quest start/end, Epilogue) now shows the same clickable version tag that
  opens the Changelog — previously only the in-game footer was clickable,
  and several screens showed no version at all.
- Unified iconography: 📖 for Chapters, 🧭 for Quests, 🗺️ for Locations,
  everywhere they appear (previously each chapter had its own flavor icon
  like 🐸/🌲/⚓).
- Adventure page simplified: quest name shown directly (no "Quest 1:"
  prefix), redundant chapter-headline blurb removed from the top, the
  "Level X/100" line removed (percentage already shown), and the "Next
  up"/1,111-pattern hint lines removed from the page. Quest name and
  location are now clickable and open a quick story/objective summary.
- Added a dedicated Adventure ❓ Help modal and a Combat Arena ❓ Help modal
  (explains the attack gauge, potions/skills row, and arena layout),
  moving the page's previously inline explanatory text out of the way.
- Added an ⚙️ Adventure Settings modal; "Enemies at once" moved there from
  the main page.
- New 🐾 Bestiary: a paged book of a quest's local threats (with computed
  Normal/Rare/Epic/Miniboss stats), the wandering Sneaky Elf and its drop
  behavior, and the quest's named boss with its specialties. Reachable
  from the Adventure page and from the defeat results screen's "The pack
  that got you" section.
- Added a ❓ Help button next to Save/Reset explaining the game, tabs, and
  the Chapter/Quest/Location structure.
- Switching to the Adventure tab now scrolls/focuses the Battle Arena.
- Mobile-friendliness pass: topbar wraps/stacks cleanly on narrow screens,
  modal padding shrinks on small screens, Combat Options/Auto-Use rows
  and selects are readable and properly sized on mobile, header button
  rows wrap instead of overflowing.
