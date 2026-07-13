# Kharun Lands — working notes for Claude

## Working preferences

- Always ask clarifying questions before implementing anything ambiguous
  (layout specifics, game-balance numbers, behavior on edge cases) rather
  than guessing silently. If the user doesn't answer, proceed with the
  most conservative/reasonable default and say explicitly what was assumed.
- Commit automatically after changes; only push when explicitly asked.

## Battle arena layout (`.player-row` in style.css / `UI.playerCardHtml` in ui.js)

Row order, left to right: `.next-action-box` → `.hero-card` → `.effects-grid`.

- `.next-action-box` is fixed at 52×52px.
- `.effects-grid` is fixed at 60×124px (2 columns × 4 rows of 28px icons),
  sized the same whether 0 or 8 effects are active. This is intentional:
  the hero card must never shift position when buffs/debuffs appear or
  expire, so the grid acts as an invisible placeholder reserving max space
  up front rather than growing per icon.
- Max active buffs/debuffs shown is 8 (`UI.playerEffects` in ui.js slices
  to 8). If effects logic ever produces more than 8 simultaneously, extras
  are silently dropped from display rather than growing the grid — this
  was an assumed default (not confirmed with the user) since a "+N more"
  overflow indicator was the alternative.
- The two side boxes (52px vs 60px) are close but not pixel-identical, so
  the hero card is *not* mathematically centered to the exact pixel — it's
  centered enough that it doesn't visibly shift. Exact symmetry was not
  confirmed as a requirement.
- `.hero-card`'s HP/Mana/attack-gauge bars use the shared `.bar` class,
  which sets `flex: 1` for horizontal contexts (e.g. `.pack-row`). Since
  `.hero-card` is a *column* flex container, that same `flex:1` targets the
  vertical axis and collapses the bars to a sliver. Fixed via
  `.hero-card .bar { flex: none; }` — if `.bar` gets reused inside another
  column-flex container, it'll need the same override.

## Combat action bar (`UI.controlsHtml` in ui.js, `.icon-btn*` in style.css)

- Potions and skills render as one row of square icon buttons — potions
  are not visually separated from skills. Only rendered while an adventure
  is active (`UI.controlsHtml` returns `''` otherwise); potion counts
  aren't shown anywhere outside combat.
- `.ctl-row` is a CSS grid, not flex-wrap, so the row always spans full
  width with a fixed button count per row rather than however many happen
  to fit: `grid-template-columns: repeat(12, 1fr)` on desktop (2 potions +
  up to 10 skills = the 12 Q/W/1-9/0 shortcut slots), `repeat(6, 1fr)`
  below 860px so it wraps to 2 rows of 6 on mobile. `.icon-btn` is
  `width:100%; aspect-ratio:1` so it stays square while its actual pixel
  size follows the grid column width — don't reintroduce a fixed
  width/height on it, that would break the full-width fit.
- Each button shows a caption underneath (`n/cap` for potions, `XX MP` for
  skills, via `skillCost()` — not the raw base `s.cost()`) and a keyboard
  shortcut badge in the bottom-right corner (Q/W for potions, 1-9/0 for
  skills, `UI.activeSkills()`/`SKILL_SHORTCUTS` in ui.js). The badge is
  hidden below 860px (`@media (max-width: 860px)`, the project's existing
  mobile/tablet breakpoint) since touch devices have no keys to press.
- On cooldown, the icon is replaced by a faded overlay number
  (`.icon-btn-cd`, same visual language as `.effect-rounds`) and the whole
  button fades via the existing `.btn.on-cd`/`:disabled` styling.
- The Q/W/1-9/0 keydown listener (bottom of ui.js, before
  `DOMContentLoaded`) mirrors each button's own disabled conditions
  (cooldown, mana, `ADV.paused`) so a shortcut can never fire an action the
  matching click would have refused. It's inert outside the Adventure tab,
  outside combat, while a modal is open, or while an input/select is
  focused.

## Results modal on defeat (`retreat()` in game.js, `UI.showResults` in ui.js)

- `ADV.fight`/`ADV` are only nulled at the very end of `retreat()`, after
  `UI.showResults(run, level)` has already been called — so the fight's
  enemy list is still live at the point `retreat()` runs, even though the
  modal function itself only receives `run`/`level`, not the fight.
- On `reason === 'defeated'`, `retreat()` snapshots the final encounter
  onto `run.killedBy` — one entry per pack member with the *same* fields
  the live arena's enemy cards use (name/tier/species/level/affixes/hp/
  maxHp/dmg/spd/attack/atkType/res), plus `alive` (false = already dead
  when the player fell). `UI.showResults` renders these as full
  `.enemy-card`s (exact same classes/markup as `UI.enemyPanelHtml`, just in
  a plain 2-col `.killedby-cards` grid instead of the arena's fixed
  6-cell/placeholder grid — no live-shift concerns in a static one-time
  summary) under a "💀 The pack that got you" heading. Already-dead members
  get `.dead` (existing opacity-fade class, reused as-is) + a ☠️ prefix, so
  the section is the *whole* final pack, not just the survivor(s).
- `retreat()` also snapshots `run.killedByHit` from `ADV.fight.lastHit` —
  whatever last set `G.char.hp -=`. `fight.lastHit = { icon, label,
  amount }` is set at all four places player HP can drop: `enemyHit()`
  (basic attacks), the Reflective branch in `playerHit()`, the Explosive
  branch in the death-resolution loop, and the DOT tick loop (poison/
  burning) — all in `adventureTick()`'s call chain in game.js. Rendered as
  a one-line "☠️ Killing blow" above the pack cards. If a new player-damage
  source is ever added, it needs to set `fight.lastHit` too or it'll just
  silently leave the old value showing.
- No UI affordance to force a real death for testing — verified by
  swapping in a synthetic `ADV`/`fight`/`run` in the browser console,
  calling `retreat('defeated')`, inspecting the rendered modal, then
  restoring the real `G` from a snapshot taken beforehand. Same technique
  works for testing any other death-triggered behavior later.

## Encounter kinds: Miniboss vs Abnormal (game.js, `G.settings.encounterMode`)

These used to share one settings slot (`encounterMode.miniboss`, labeled
"Abnormal" in the UI) — split into two independent slots on request:
- `miniboss` — the actual Miniboss tier spawning (`encounterKind =
  'miniboss'` when `minibossPossible(level) && chance(minibossChance(level))`
  rolls true for a Normal-tier pack, game.js ~1601-1609). `minibossChance`
  (not a flat constant anymore) returns 3% on a chapter's 10th part
  (`level % 10 === 0`, the boss level) and 1.5% on parts 5-9.
- `abnormal` — any creature of *any* tier that independently rolled a
  specialty affix (Vampiric, Explosive, etc.) — currently only reachable
  from a plain Normal-tier pack, since Rare/Epic/Legendary packs already
  have their own dedicated slot regardless of affixes (game.js ~1610-1617).
Both funnel through the same generic `applyEncounterMode(tier)` /
`TIER_DISPLAY_NAME` — adding a new encounter kind is just: add it to
`defaultSettings().encounterMode`, `TIER_DISPLAY_NAME`, and the `tiers`
array in `UI.showCombatOptions` (ui.js).
- `ensureSettings()` used to backfill `encounterMode` only if the *entire*
  object was missing, so an existing save with an old `encounterMode`
  object (missing a newly-added key like `abnormal`) would silently never
  get it. Fixed to backfill missing keys individually — do this for any
  future settings sub-object, not just `encounterMode`.
- `TIER_UI_LABEL` (ui.js) is shared between the Combat Options modal and
  the Auto-Use tier-targeting checkboxes (which match real `e.tier`, never
  the Abnormal/specialty concept) — so `miniboss: 'Miniboss'` here is
  correct for both call sites; don't relabel it to "Abnormal" again.

## Ward specialties: Explosive / Reflective (game.js)

Both used to scale off instance-specific numbers that could blow up
unboundedly: Explosive was `round(e.maxHp * 0.08)` (and `maxHp` compounds
at `1.5^(level-1)` via `enemyHpScale`, so this hit billions of damage by
~level 50); Reflective was `round(dmg * 0.20)`, i.e. it scaled with the
player's *own* damage output, so better gear made the punishment worse.
- Replaced both with `levelDifficulty(level) * (WARD_TIER_MULT[tier] ||
  1)`. `levelDifficulty(level) = 11.7 * enemyDmgScale(level)` (game.js,
  right after `TIER_CONF`) is a from-scratch scalar — same base constant
  and growth curve (`1.2^(level-1)`) as a creature's own `dmg` stat
  formula, but with no species/tier/RNG jitter folded in, so it's a pure
  "how tough is this dungeon level" number instead of an instance stat.
- `WARD_TIER_MULT = { rare: 1.5, epic: 1.75, legendary: 2, miniboss: 2 }`
  — miniboss intentionally shares legendary's 2x per the original request
  ("legendary creatures (including minibosses)"). Unlisted tiers (normal,
  elf) fall back to 1x via `|| 1`.
- Both call sites use `e.level`/`enemy.level` (the enemy's own `level`
  field, set from the dungeon area level in `makeCreature`) — not
  `ADV.level` from outer scope — so this works the same whether called
  from the death-resolution loop or `playerHit`.
- Verified in the browser console (not through real combat, which can't
  reliably reproduce a specific tier/level/affix combo on demand): mocked
  `playerHit()`/the death-resolution loop with synthetic enemies, and
  confirmed reflect/explosion damage is now identical regardless of the
  enemy's `maxHp` or the player's dealt damage, and matches
  `levelDifficulty(level) * tierMult` exactly.

## Topbar (`#topbar` in style.css)

No longer `position: sticky` — HP/Mana are also shown in the battle
arena's hero card (see above), so the topbar doesn't need to stay pinned
while scrolling. It now scrolls with the page like any other panel. There
was no compensating `padding-top`/`z-index` dependency elsewhere to clean
up when this was removed.

## Story progression: Quest/Chapter screens (ui.js) — v1.0.0 story rework

- The game follows the ten-chapter story document verbatim (Prologue "The Last Ward", Chapters 1-10 with 10 Quests each, Epilogue "What Came After"). Biomes and Parts no longer exist anywhere — `DATA.CHAPTERS[i].quests[j]` carries `{name, location, intro[], objective, outro[], setup, boss, creatures[3]}`.
- A level number *is* the quest number — no separate mapping. `chapterNumOf(level) = floor((level-1)/10)+1`, quest index = `(level-1)%10`, helpers `chapterOf/questOf/areaInfo` in game.js. `isChapterEndLevel(level)` = `level % 10 === 0` (chapter-boss quest).
- Screen chain: prologue (paged, `UI.showPrelude(pageIdx)`) → class select → `UI.showChapterIntro(n)` → `UI.showQuestStart(level)` → adventure. Boss victory modal Continue → `UI.afterBossVictory` → `UI.showQuestEnd(level)` (outro + "→ Sets up Quest N" hook) → next `showQuestStart`, or on chapter end `UI.showChapterEnd(n)` → `showChapterIntro(n+1)`; Chapter 10 ends in `UI.showEpilogue()`.
- Quest outro/setup text is shown ONLY after the quest is cleared (both on the quest-end screen and in the Journal); before that the Journal shows Location + intro + objective + progress %.
- Every quest's Legendary boss is the story's named creature (`quest.boss`, exact name, hand-picked `specialties` — no random roll for legendaries). `e.isChapterBoss` is set on 10th-quest bosses: dark blood-red name (`CHAPTER_BOSS_COLOR` in ui.js) + `.tierb-chapterboss` CSS (faster pulse). Miniboss tier is pinkish red (`#ff6b7a`) with `tense-pulse-mini`; legendaries pulse via `tense-pulse-legendary`. `.enemy-card.dead` and results-modal cards suppress the animation.
- `UI.afterBossVictory(clearedLevel)` (ui.js, called from the boss-victory results modal's Continue button) routes to `UI.showChapterIntro`/`UI.showPartIntro` for `nextLevel = clearedLevel + 1`. It now also sets `G.area = Math.min(nextLevel, G.unlocked)` + `saveGame()` before routing, so the Adventure tab actually reflects the part/chapter the player is about to start — previously `G.area` was never touched here, so starting the next part left the Adventure tab on whatever level it happened to be on. The `Math.min(..., G.unlocked)` mirrors the ◀/▶ level-picker's own bound (`ui.js` `UI.renderAdventure`) — `G.unlocked` should already be `>= nextLevel` by this point (bumped on boss kill in game.js), so it's a defensive clamp, not expected to bind in practice.
- Verified via direct `UI.afterBossVictory(level)` calls in the browser console: part-boundary and chapter-boundary clears both jump `G.area` correctly, clearing the final level (100) leaves `G.area` untouched (no level 101 to route to), and the `G.unlocked` clamp works when set artificially low.

## Mobile icon-button sizing (`.icon-btn-wrap` in style.css)

`.ctl-row`'s grid always creates a fixed number of equal-width columns
(12 desktop, 6 mobile) regardless of how many buttons are actually
present — a 6-column track on a narrow phone can stretch even 2-3 real
buttons well past their intended size, since column width doesn't shrink
to fit fewer children. Fixed with a **mobile-only** (`@media (max-width:
860px)`) cap: `.icon-btn-wrap { max-width: 42px; margin: 0 auto; }`,
which shrinks the button back down and centers it within its (now
oversized) grid column. Desktop is untouched — don't add a `max-width` to
the base `.icon-btn-wrap` rule, only inside that media query, or it'll
also affect the already-correct desktop sizing.

## Pack size ("Enemies at once") cap

Raised from 5 to 6 in two places that both need to move together:
`setPackSize(n)`'s clamp in game.js (`Math.min(6, n)`) and the button
list in `UI.renderAdventure` (ui.js, `[1,2,3,4,5,6].map(...)`). 6 happens
to exactly fill the battle arena's fixed 6-cell grid (`TIER_CELLS.normal
= 1` each) with no placeholder cells needed for a pure-Normal pack.

## Sneaky Elf HP (`makeElf` in game.js)

`hp = round(39 * 10 * enemyHpScale(level))` — was `39 * 5` ("5x a normal
monster"); doubled to `39 * 10` per a direct "+100% HP" request. Comment
updated to say 10x rather than describe it as "5x, doubled" so a future
read of the code isn't left doing that arithmetic again.

## Shop "Buy & Equip" (`buyAndEquip` in game.js, `UI.showShopItem` in ui.js)

- `equipItem(uid, slot)` (game.js) only ever looks the item up **in
  `G.inventory` by uid** — it has no path for equipping something that
  isn't already owned. So "Buy & Equip" can't be its own primitive; it has
  to be "buy, then equip" as two calls. `buyAndEquip(uid, slot)` does
  exactly that: calls `buyShopItem(uid)`, then only calls `equipItem` if
  the uid actually made it into `G.inventory` (i.e. the purchase didn't
  get rejected for insufficient gold) — reuses `buyShopItem`'s own
  gold-check/toast rather than duplicating that logic.
- This causes `saveGame()`/`UI.refresh()` to run twice in a row (once
  inside each of `buyShopItem` and `equipItem`) — harmless, not worth
  special-casing to avoid.
- `UI.showShopItem` branches on `it.slot` exactly like the inventory item
  modal's equip buttons (`UI.showItem`, same file) does: `ring` → "Buy &
  Equip Left"/"Buy & Equip Right" (`ring1`/`ring2`), a 1-handed `weapon` →
  "Buy & Equip Main Hand"/"Buy & Equip Off Hand" (`weapon`/`offhand`),
  anything else usable → a single "Buy & Equip" (no explicit slot, so
  `equipItem` falls back to `it.slot`). Runes (`it.type === 'rune'`) get
  no equip buttons — they're socketed into an item, not equipped.
- Verified in the browser console: buying+equipping a ring actually lands
  it in `G.char.equip.ring1` (not left sitting in inventory), removes it
  from `G.shop.stock`, and deducts gold; with `G.gold = 0`, the call is a
  no-op (item stays in shop stock, nothing equipped).

## Journal tab: single-page navigation (`UI.renderJournal` etc. in ui.js)

Was a flat list of every reached chapter's `<details>`, each nested with
its own reached parts as `<details>` — no navigation, just scroll.
Redesigned per explicit user answers (asked because the request was
ambiguous on 3 points):
- **"Quests" in the request meant the existing Part entries** (e.g. "Part
  3: Green Plains"), not the Tavern's actual quest system — those two are
  and remain unrelated. Parts still render as nested open-close
  `<details>` under whichever chapter page is selected, unchanged from
  before.
- Top of the tab is now **one page at a time** — Prologue, a chapter, or
  Epilogue — stepped through with ◀/▶ (`UI.setJournalPage(delta)`),
  reusing the Adventure tab's `.area-picker`/`.area-info` CSS classes
  as-is (same visual pattern, no new picker CSS needed). Selection lives
  in the module-level `journalPage` var (ui.js, near `activeTab`) —
  ephemeral UI state, not saved to `G`.
- **Epilogue is hidden until Chapter 10 is cleared**
  (`G.bossKilled[MAX_LEVEL_AREA]`) — per explicit answer, not shown as a
  locked/greyed entry beforehand. `UI.journalPages()` is the single source
  of truth for the ordered, currently-navigable page list (`['prologue',
  ...reached chapter numbers, ...maybe 'epilogue']`) — both the render
  function and the arrow-click handler call it, so they can't drift.
- **Arrows are bounded to reached pages only** (per explicit answer) — you
  can't preview an unreached chapter by pressing ▶ past your progress.
- `DATA.EPILOGUE` (data.js, same shape as `DATA.PRELUDE`: `{title,
  paragraphs}`) is a deliberately minimal placeholder ("hasn't been
  written yet") — no invented lore. Only Chapter 1 has real story content
  so far; keep additions literal and confirm new lore with the user before
  writing it, same as the existing chapter placeholders do.
- Watch for `ch.title` already containing "Chapter N: " (only Chapter 1 is
  authored so far, e.g. `'Chapter 1: Harvestgate'`) — don't prepend
  "Chapter N:" again when building the page title, or it doubles up.
- `.journal-body` has a 30px left-indent tuned for sitting under a
  `<details>` chevron; the new top-level page body isn't nested in one, so
  it uses an added `.journal-page-body` modifier to pull that indent back
  in (relies on source order over `.journal-body`, not higher specificity
  — both are single-class selectors).
- Verified in the browser console: default page on first render is the
  furthest-reached page (prologue → current chapter → epilogue once
  unlocked); ◀/▶ clamp correctly at both ends; `UI.journalPages()`
  correctly excludes/includes `'epilogue'` before/after
  `G.bossKilled[100]`; Part `<details>` still list correctly under a
  selected chapter.
