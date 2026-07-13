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
