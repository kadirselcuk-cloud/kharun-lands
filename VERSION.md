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

## 1.4.1 (fix)

- **Tavern Board/Gamble toggle**: `UI.renderTavern` (ui.js) now renders a
  `.subtabs`-styled `Board`/`Gamble` button pair (`UI.setTavernView`,
  new `tavernView` module var, defaults to `'board'`) and shows either
  the quest board or the Gambling Den, not both stacked in one long
  page.
- **Animated dice roll**: `playDice` (game.js) was split — RNG + gold
  mutation moved into a new pure `resolveDice(bet)` with no UI side
  effects, and `UI.playDice` (ui.js) now owns the roll: spins both
  `#dice-you`/`#dice-house` through random `DICE_FACES` (⚀-⚅) every
  80ms for 10 ticks (~800ms) via direct DOM writes (not `UI.refresh()`
  per tick, since a full re-render would also rebuild/re-enable the bet
  buttons mid-spin), then calls `resolveDice` and settles both dice on
  the real faces at the same moment the gold/topbar updates — so the
  reveal and the outcome land together instead of the gold changing
  before the dice visually stop. Bet buttons disable for the duration
  (guarded by a new `diceRolling` flag) to prevent overlapping rolls.
  Last roll is kept in a new ephemeral `lastDiceRoll` module var so the
  settled dice/result line persist correctly across a `UI.refresh()`
  (e.g. switching tabs and back) instead of resetting to blank.
- Verified via a headless-Chromium (Playwright) pass: Tavern defaults to
  the Board view; clicking Gamble swaps to the Gambling Den and hides
  the board; mid-roll (250ms in) both dice show different random faces,
  the result line reads "Rolling…", and all four bet buttons are
  disabled; after the roll finishes both dice show the actual rolled
  values, the result line/color (green win / red lose / neutral tie)
  and toast match, and gold moved by exactly the bet amount. No console
  errors.

## 1.4.0 (minor)

- **Tavern Gambling Den**: new `playDice(bet)` (game.js) — fixed stake
  tiers `DICE_BET_TIERS = [10, 50, 200, 1000]`, 1d6 vs 1d6 house roll,
  true 50/50 odds with no house edge (win: `G.gold += bet`, lose:
  `G.gold -= bet`, tie: no-op push). Rendered in `UI.renderTavern`
  (ui.js) as a `.dice-bets` row below the quest board; each button
  disables if `G.gold < bet`. Feedback is toast-only (`UI.toast`), same
  pattern as quest completion — no new modal.
- **Quest board 6 -> 8**: `genTavernBoard`'s loop condition in game.js
  (11 quest types exist, so 8 unique still fits comfortably under the
  existing `seen` dedup). 2-active-quest cap left unchanged (not part
  of the request).
- **Quest rewards roughly doubled**: `questRewardAmounts`/
  `questRewardPreview` (game.js) base coefficients doubled again
  (13->26, 15->30 gold; 11->22, 8->16 xp) on top of 1.3.0's earlier
  ~30% bump. The `goldR` helper inside `genQuest` (used only for the
  Debt of Honor quest's gold-earned *target*, not its reward) was left
  untouched — doubling it would have made that quest harder to
  complete, not more rewarding.
- **Kill_miniboss/kill_legendary quests now reward Runes, not items**:
  Crownsnatcher's `rewardSpec` changed from `item: 'rare'` to
  `rune: 'miniboss'`, Head of the Beast's from `item: 'epic'` to
  `rune: 'legendary'`. Both go through the existing `makeRune(ilvl,
  source)` (game.js) with its existing `RUNE_BONUS_RANGE` table
  (`miniboss: [2,4]`, `legendary: [3,5]`) — which already guaranteed
  miniboss-source runes are Rune-tier-or-better (bonus count >= 2) and
  legendary-source runes are Elder-Rune-tier-or-better (bonus count >=
  3, one tier above miniboss's floor) with zero new tuning needed; the
  quest-reward change was purely which generator function
  `claimQuestReward` calls (`makeRune` vs `makeItem`) and what it
  stores on `q.finalReward` (`.rune` alongside `.item`).
- **Tavern item-reward rarity floor raised to Rare, escalating toward
  Legendary at higher areas**: new `questItemRarity(minRarity, area)` +
  `QUEST_ITEM_RARITY_ORDER = ['rare','epic','legendary']` in game.js —
  starts at the quest type's own baseline (now `'rare'` at minimum,
  bumped up from `'magical'` for Potion Tester/Pack Rat) and rolls a
  chance to step up one tier at a time, `upChance` scaling linearly
  from 10% at area 1 to 70% at area 100. Rolled once per claim in
  `claimQuestReward`, not pre-baked at ready-time like gold/xp, so it
  reads the area at the moment of claiming.
- UI: `rewardLineHtml` (ui.js, `UI.renderTavern`) now takes the whole
  `rewardSpec`/`finalReward` object instead of just an item-rarity
  string, so it can show both the item floor (e.g. "Rare+ item") and
  rune reward (e.g. "🪨 Rune+" / "🪨 Elder Rune+", colored by the
  RUNE_TIERS rarity each source's floor maps to) on the same line.
- Verified end-to-end via a headless-Chromium (Playwright, driving the
  existing `node server.js` at :3111) pass: quest board renders exactly
  8 cards; Rare+/Epic+ item labels show correctly; forcing a ready
  Crownsnatcher + Head of the Beast quest and claiming both produced an
  actual epic-tier Elder Rune (legendary source) and a rare-tier Elder
  Rune (miniboss source) in inventory, both meeting their guaranteed
  floors; 20 scripted dice bets at a fixed stake all resolved to
  exactly +bet/-bet/0 gold with no other outcome, confirming the fair
  50/50 payout; no console errors during any of the above.

## 1.3.1 (fix)

- City hub's Shop sub-tab button relabeled "⚒️ Blacksmith" (`UI.renderCityHub`
  in ui.js). Purely the menu label — `data-sub="shop"`, `renderShop`,
  `showShopItem`, and every other internal name stay `shop`.

## 1.3.0 (minor)

- **Advanced Classes**: at level 25 each base class picks one of two paths
  (Warrior: Knight/Paladin or Mercenary/Warlord; Rogue: Assassin/Ninja or
  Hunter/Sniper; Mage: Sorcerer/Archmage or Radiant/Archon), unlocking a new
  active + passive skill. At level 50 the path automatically evolves to its
  tier-3 name, unlocking a second passive and a stronger Ultimate that
  replaces the original one (banked ranks kept, just no longer learnable).
- **Combat rebalance**: fixed a real bug where armor's mitigation formula
  (`armor/(armor+40+8*level)`) paired with armor's old exponential (1.25^L)
  growth curve drove physical damage taken toward zero by ~level 35 —
  switched armor to a linear curve so mitigation plateaus at a stable,
  gear-weight-differentiated ceiling (~75% heavy/~71% medium/~61% light)
  instead of runaway immunity. Weapon damage scaling matched to monster
  HP/damage scaling (both `level * 1.10^(level-1)` for monsters, weapons at
  `level * 1.05^(level-1)`) so difficulty stays consistent across the whole
  level range instead of trivializing late-game. `+HP`/`+Mana` affixes moved
  off the same old exponential curve for the same reason (a single lucky
  roll could otherwise make a character nearly unkillable or give a Mage
  effectively infinite mana).
- **Mage**: cooldowns cut ~35-45% and mana costs brought in line with
  Warrior/Rogue (was a ~15-20% mage-only premium) — a "cast often" identity
  shift, applied to her base kit and both Advanced Class paths.
- **Rogue**: dagger attack speed trimmed (atkSpd 0.5 -> 0.6) — it was giving
  2-3x the attack frequency of other weapon choices independent of any
  stat/gear difference.
- **Tavern**: board expanded 3 -> 6 quests, up to 2 can be active
  simultaneously (was 1), 3 new quest types (Clear the Roads/kill any tier,
  Pack Rat/find any item, Trailblazer/clear story quests), reward formula
  base coefficients raised ~30%.
- **Gold**: per-tier multiplier flattened from a near-geometric 1/5/20/45/100
  to linear-ish 1/3/5/10/20 steps.
- **Poison DOTs** (Venomous Strike, Shadow Execution, the Poison Weapon
  affix) now deal a percentage of the target's Max HP per round instead of a
  flat number, so they stay relevant at any level instead of trivializing.
- **UI**: all large numbers (damage, HP, gold, XP, item values) now display
  compactly as `X.XXK`/`X.XXM`/`X.XXB` instead of full digit strings.
- Script tags in `index.html` now carry a `?v=` cache-busting query string,
  bumped on every deploy — without it a host/browser with no explicit
  cache-control header could keep serving stale JS after a change like this
  one ships, which looks exactly like a gameplay bug.

## 1.2.3 (fix)

- Fixed the Tavern's active-quest progress bar (`.quest-bar`): `.quest-card`
  is a column-flex container, so `.bar`'s `flex:1` (flex-basis:0) was
  collapsing it to ~2px — same bug class as the hero-card and enemy-card
  fixes in earlier versions, just never applied here. Added
  `.quest-card .bar { flex: none; }`.
- City tab and its Tavern sub-tab now get the `.tab-notify` breathing
  highlight whenever `G.tavern.active.ready` is true, so a claimable
  Tavern quest is visible from the tab bar itself.

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
