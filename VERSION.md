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

## 1.7.0 (minor)

Small punch list: skill/poison duration scaling, effects-grid readability,
poison-affix rework, and two mobile layout bugs.

- **Buff/debuff/poison durations now scale with rank**: new shared
  `skillRounds(base, r)` helper (data.js, right after `mkSkills`) —
  `base + Math.min(3, Math.floor((r - 1) / 3))`, i.e. +1 round every 3
  ranks, capped at +3 so a gear-boosted rank (`effectiveRank` can exceed
  `MAX_RANK=10`, up to 20) doesn't run away. Applied to every `rounds:`
  literal across all 18 buff/debuff/`poisonDot` skill closures (both
  base-class and Advanced-Class-path skills, all 3 classes) and their
  matching `desc()` strings, which previously said e.g. "for 5 rounds"
  unconditionally — magnitude (damage%, stat bonus, resist shred, poison
  %) already scaled with rank on every one of these; duration was the
  only thing still fixed. No formula/curve was specified in the request,
  so this shape was picked as a reasonable default and flagged here as
  an assumption rather than asked about, given explicit "just do it,
  stop asking" feedback earlier this session.
- **Poison Weapon affix reworked** (data.js, `DATA.AFFIXES`
  `poisonWeapon`): previously `pct` scaled with ilvl (capped 4%) but
  `rounds` was a flat `rint(2,4)` unrelated to item level. Per an
  explicit "start with 2% per 2 turns up to 5% per 8 turns, ilvl growth
  should affect rolls" request, both now scale together linearly from
  ilvl 1 to ilvl 100: `pct: 0.02 + t*0.03`, `rounds: round(2 + t*6)`
  where `t = clamp((ilvl-1)/99, 0, 1)`. Scoped to this ilvl-based affix
  specifically, not the skill-based poisons (Venomous Strike/Shadow
  Execution) — those scale with skill rank `r`, not item level, and
  "ilvl growth" only applies to gear; their duration got the same
  rank-based `skillRounds` treatment as every other buff/debuff/DOT
  skill above, but their pct-per-rank curves were untouched.
- **Effects-grid readability**: `.effect-icon` 28px -> 34px,
  `.effects-grid` 60×124px -> 72×148px to match (style.css) — per an
  explicit "boxes a little larger" request. `.effect-rounds` color
  changed from white-at-.55-opacity (read as washed-out/faded) to fully
  opaque dark (`#0e0f14`) with a light text-shadow halo instead of the
  old dark one — inverse of the old white-on-dark-with-black-shadow
  trick, so the number stays legible against any emoji icon underneath
  instead of blending into it. Deliberately scoped to `.effect-rounds`
  only, not the visually-similar `.icon-btn-cd` (skill/potion cooldown
  overlay in the action bar) — that wasn't part of the complaint.
- **Mobile layout, two bugs fixed** (style.css, both scoped to the
  existing `max-width: 480px` convention already used elsewhere in this
  file, desktop untouched):
  - `h1` ("⚔️ KHARUN LANDS") shrinks from 2.4rem/2px letter-spacing to
    1.7rem/1px on phones — at the base size it overflowed narrow
    viewports and wrapped mid-title ("LANDS" alone on the next line).
  - `.prelude-box`'s own 30px/34px padding plus the Skip/Back/Continue
    buttons side-by-side didn't leave enough room on phones and the row
    wrapped badly. `.prelude-box` padding reduced to 20px/16px, and
    `.prelude-nav`/`.prelude-nav-side` switch to a stacked column
    (`flex-direction: column; align-items: stretch`) so each button
    goes full-width on its own row instead of competing for horizontal
    space — affects the Prologue and Epilogue paged screens, which
    share this exact markup/CSS.
- Verified via a headless-Chromium (Playwright) pass: `Battle Shout`'s
  `buff(r).rounds` returns 5/6/8/8 at r=1/4/10/20 (confirming the +1-
  per-3-ranks-capped-at-+3 curve); `Venomous Strike`'s `poisonDot(r)`
  goes 3->6 rounds r=1->10; the `poisonWeapon` affix's `roll(i)` returns
  exactly `{pct:0.02, rounds:2}` at ilvl 1 and `{pct:0.05, rounds:8}` at
  ilvl 100; `.effects-grid` measures 72×148px with `.effect-rounds` at
  fully-opaque `rgb(14,15,20)`; at a 375px mobile viewport the title
  renders as a single line at 343px width, and the Prologue's Skip/
  Continue buttons and page indicator each render on their own full-
  width row instead of wrapping mid-button. No console errors.

## 1.6.0 (minor)

**The Arena** — new 4th City sub-tab (`UI.renderArena`/`UI.enterArena`,
ui.js; `activeCitySub === 'arena'`, same `.subtabs` pattern as Blacksmith/
Tavern/Enchanter). Full design writeup in CLAUDE.md "City: The Arena
(one-shot per-level bonus fight)" — summary:

- Always keyed to the player's current `G.area`, same convention as the
  Blacksmith's stock. Available whenever `!G.bossKilled[level] &&
  !G.arenaResult[level]`; `G.arenaResult` (new save field, `newGame`/
  `loadGame` migration) is `'won'`/`'lost'`, set once the fight resolves
  either way — a loss forfeits that level's Arena for good (explicit
  "one attempt only" answer), a manual retreat or 400-round stalemate
  does not consume the attempt.
- `makeCreature` (game.js) gained two new opts: `hpMult` (multiplies
  the tier's own HP formula — Arena uses 1.5) and `forceAffixes` (an
  explicit array that bypasses the normal per-tier random specialty
  roll entirely, even as `[]`). New `makeArenaGroup(level)` picks one of
  `ARENA_COMPS` (`mb_epic`/`epics3`/`rares6`), forces exactly 2 of the
  group to carry 1 specialty each via `forceAffixes` and the rest to
  carry none — guaranteeing precisely 2 anomalies regardless of group
  size, rather than layering the normal independent per-creature chance
  on top. Every Arena beast is flagged `isEscort` so its kill doesn't
  advance the level's own 1111-kill story counter (`handleKill` only
  bumps `G.progress` for non-escort kills) — kills still count toward
  `G.totals.kills`/`killsBySpecies` and fire the normal `kill_rare`/
  `kill_epic`/`kill_miniboss` Tavern quest-progress events, and still
  roll normal per-kill loot via the existing `rollLoot` path, on top of
  a guaranteed win reward.
- `startArenaFight(level)` (game.js) builds the same `ADV`/`fight`/`run`
  shape `startAdventure()` does, just with `isArena: true` and a
  pre-built single encounter instead of going through
  `nextCreatureTier`'s 1-in-11/1-in-111 pattern — reuses the entire
  existing combat engine (pause/retreat/speed controls, `playerAct`,
  death resolution) unmodified.
- `adventureTick`'s all-enemies-dead branch checks `ADV.isArena` before
  the normal `wasBoss` branch: grants `grantArenaReward` (gold +
  `makeRune` at a tier keyed to which comp was fought —
  `ARENA_RUNE_SOURCE = {mb_epic:'miniboss', epics3:'epic',
  rares6:'rare'}`, gold reward decision was explicitly "guaranteed Rune,
  not item") and calls `retreat('arena_won')`.
- `retreat()` now snapshots `run.isArena = !!ADV.isArena` up front and
  branches the `reason === 'defeated'` progress-wipe: normal defeats
  still reset `G.progress[level]` to 0 as before, but an Arena defeat
  sets `G.arenaResult[level] = 'lost'` instead and leaves story progress
  completely untouched (Arena kills never touched it in the first
  place). `reason === 'arena_won'` sets `G.arenaResult[level] = 'won'`.
- `UI.showResults` (ui.js): new `arena_won` outcome text + a dedicated
  "🏛️ Arena Reward" box (gold + rune) with the requested Arena Master
  flavor line ("You won this city's challenge to the arena — try your
  luck in the next city!"); Arena defeats get their own outcome text
  (no "the level resets" — that's not true for Arena losses). Both
  Arena outcomes fall through the existing non-boss button branch
  (`isBoss` stays scoped to `outcome === 'boss'` only) so they're a
  normal closable modal, unlike the boss-victory modal.
- Per explicit request, the Arena's City sub-tab does **not** get the
  `.tab-notify` breathing highlight the Tavern's ready-quest state uses
  — tried it, asked to remove it, reverted.
- Verified via a headless-Chromium (Playwright) pass: the Arena panel
  renders the right flavor/location text and gates correctly across all
  three states (available/won/lost) plus the "quest already cleared"
  state; entering the Arena builds a real fight (confirmed comp,
  forced-affix count, `isEscort`, HP values) and jumps straight to the
  Battle Arena panel; forcing a win via zeroed enemy HP produced the
  correct `G.arenaResult`, gold, and rune, closed `ADV`, and rendered
  the Arena Reward box with the Arena Master line; per-kill loot from
  the 3 escort-flagged epics still rolled normally on top of the
  guaranteed reward. No console errors.

## 1.5.0 (minor)

Large batch: a new city shop, 20 new quest types, a quest-board bug fix, a
gauge-fill animation, a skill next-rank preview, three balance reworks, and
Reflective -> Charm. See CLAUDE.md for the fuller per-feature writeup where
noted below; summary:

- **The Enchanter** (new city sub-tab, `UI.renderEnchanter`/`activeCitySub
  === 'enchanter'`, ui.js): two views toggled like the Tavern's Board/Gamble
  pattern (`enchanterView`, default `'table'`).
  - **Enchantment Table** — `reenchantItem(itemUid, runeUid)` (game.js):
    bumps `item.ilvl` to `G.area`, rerolls the item's base stat (dmg/armor/
    potionCap, via a new `baseStatsFor(it)` slot->base lookup) and every
    existing affix's *value* at the new ilvl while keeping the same affix
    ids (`rerollAffixValues`, new helper) — "same stats, new numbers", not a
    re-roll of which stats you have. Rune requirement is exact-match, not a
    floor: `ENCHANT_RUNE_TIER = { magical:1, rare:2, epic:4, legendary:5 }`
    against a new `runeTier(rune)` helper (bonus count, except Mythic Runes
    which are hard-coded to 5 despite carrying 4 bonuses — treated as
    top-tier since they're the rarest rune in the game). Consumes the rune;
    no gold cost — not specified by the request, so the literal "give an
    item and a rune" was implemented as free. Item name is left unchanged
    (only value/ilvl/stats update) — renaming a player's owned gear on
    reforge felt like an unwanted side effect, not requested.
  - **Rune Forge** — `forgeRunes(uids)` (game.js): requires exactly 3 runes
    of the *same* tier (explicit user choice over "any 3, uses highest").
    Tiers 1-4: 50% chance all 3 are destroyed with nothing gained; tier 5
    (legendary-colored Elder Rune, Mythic included): always succeeds,
    reforging into a fresh non-Mythic tier-5 rune at current ilvl — Mythic
    itself is never a forge output, it stays an independent, much rarer
    roll. `makeRune` was refactored to extract a shared `buildRune(n, ilvl,
    tierOverride)` so the Forge's forced-tier path and the normal
    source-tier-random path share the same naming/construction logic.
- **Quest board bug fix**: `acceptQuest` (game.js) spliced the accepted
  quest out of `G.tavern.board` but never backfilled it, so the board sat
  at 6-7 visible offers (instead of the intended constant 8) until the next
  `retreat()` fully regenerated it. Fixed by pushing one fresh,
  non-duplicate-type quest into the board immediately after every accept.
- **20 new quest types** appended to `genQuest`'s `makers` array (game.js,
  now 31 total): rune socketing, item selling (single + bulk), a
  chapter-boss bounty, Epic+ item finds, gold-from-selling, ten
  specialty-targeted kill quests (Poisonous/Frozen/Burning/Vampiric/
  Explosive/Golem/Charm/Regen/Berserk/Spectral) plus a catch-all "any
  specialty" bounty, Enchanter Table/Rune Forge usage, skill casts, and
  Sneaky Elf encounters. Wired via new one-line `questEvent(...)` calls at
  each action's existing site (`handleKill` now loops `e.affixes` firing
  one event per specialty + a `kill_abnormal` catch-all + `chapter_boss`;
  `sellItem`/`sellAllOf`; `socketRune`; `dropItem` for `item_epic`;
  `playerAct` for `skill_cast` when `skill.cat !== 'basic'`; the elf-
  encounter resolution branches). `sellAllOf` also picked up the
  `G.totals.itemsSold`/`goldFromSales` tracking it was previously missing
  (bulk-sell was silently not counting toward those totals — same class of
  gap as the 1.4.3 auto-sell fix, fixed opportunistically while wiring the
  new quest hook).
- **Gauge-fill animation** (`ui.js`, `style.css`): the arena previously
  re-rendered the gauge bar's final width every tick with no real
  animation (the `.bar > div { transition: width .25s }` rule never
  actually played, since `UI.refresh()` recreates the DOM node from scratch
  every tick rather than mutating an existing one's style). Replaced with a
  CSS `@keyframes` animation driven by `--from`/`--to`/`--gauge-dur` custom
  properties computed fresh each render: `--from` is the actual current
  gauge %, `--to` is a one-tick-ahead forecast (`d.speed`/
  `effectiveEnemySpd(e)`, same formulas `adventureTick` itself uses),
  `--gauge-dur` is `ADV.speedMs`. Because it's a real `animation` (not a
  `transition`), it replays correctly on every freshly-created node,
  and each tick's render always starts the animation from ground truth —
  no interpolation-across-a-gauge-wrap problem.
- **Skill next-rank preview** (`UI.renderSkills`, ui.js): for any skill
  with `0 < rank < MAX_RANK`, shows `s.desc(min(eff+1, MAX_RANK*2))` under
  the current description — reuses each skill's own pure `desc(r)`
  function, no new data needed.
- **Healing Light** (`data.js`): `healPct` changed from `0.16 + 0.03*r`
  (19%@r1 -> 46%@r10) to `0.30 + (r-1)*(0.20/9)` (30%@r1 -> exactly
  50%@r10). The request's "+2%/level" and "50% by level 10" starting from
  30% don't reconcile exactly (30 + 2*9 = 48, not 50) — resolved by hitting
  the two stated endpoints exactly via linear interpolation (~2.22%/rank
  in practice) rather than the stated per-rank step, since the endpoints
  read as the harder constraint.
- **Minnie's ward** (`m_p_radiant_pass1` "Sacred Vigil", data.js): per
  clarifying-question answer, repurposed this existing Radiant-path passive
  (still costs a skill point, still gated behind the Radiant Advanced Class
  path at level 25) rather than adding a new innate passive. `dr` changed
  from `0.01*r` (1%@r1 -> 10%@r10) to `0.10 + (r-1)*(0.30/9)` (10%@r1 ->
  exactly 40%@r10) — same endpoint-matching resolution as Healing Light.
  hpPct/hpRegen on the same passive are untouched.
- **Minnie's weapon skills** (`makeItem`, game.js): per clarifying-question
  answer, base weapon/offhand damage was explicitly left unchanged. New
  `rollMinnieWeaponSkills(ilvl)`/`minnieWeaponSkillCount(ilvl)` gate on
  legendary-rarity, single-class (`classes.length===1 && classes[0]===
  'mage'`) weapon/offhand items (Arcane Staff/Wand/Scepter/Orb/Tome are the
  only bases meeting that), adding 1-3 *additional* `{id:'skill', v:
  rint(1,3), skillId, skillName}` entries on top of the item's normal
  affix roll — reuses the existing generic 'skill' affix shape/rendering
  as-is, no new UI needed. Distinct skill ids enforced via a `used` Set.
  Count distribution linearly interpolates 90/9/1% (1/2/3 skills) at ilvl 1
  to 50/30/20% at ilvl 100 by `t = (ilvl-1)/99`. Gated to legendary rarity
  specifically because "ultra rare" (the request's own description of
  these skills) matches this game's existing convention for its rarest
  affixes (critStrike/doubleStrike/spellstrike are all `minRarity:
  'legendary'` too) — not stated explicitly, called out as an assumption.
- **Regenerating cap** (`data.js`/`game.js`): new `regenTotal` field on
  every creature (`makeCreature`), incremented by each regen tick and
  capped so total lifetime regen healing can't exceed the creature's own
  `maxHp` — once hit, `hasAffix(e,'regen')` checks are gated by `regenTotal
  < maxHp` and simply stop firing.
- **Reflective -> Charm**: removed `DATA.SPECIALTIES.reflective` and its
  on-hit reflect-damage branch in `playerHit` (game.js) entirely, including
  all 10 story-boss `specialties: [...]` arrays that referenced it
  (data.js, swapped to `'charm'`). Added `DATA.SPECIALTIES.charm` +
  a gate at the very top of `playerAct` (game.js): if any live enemy has
  the `charm` affix, a 50% chance rolled once per player turn (not per
  swing/multi-attack) skips the entire turn with no mana/cooldown spent —
  modeled after the existing enemy-side `stunned` skip-turn pattern, since
  there was no prior player-side "skip this turn" gate anywhere in the
  codebase. `WARD_TIER_MULT`/`levelDifficulty` are untouched (Explosive
  still uses them); only Reflective's own consumer was removed.

## 1.4.3 (fix)

Bug batch — see CLAUDE.md "Bug batch: results modal, auto-sell gaps, tier
ordering, decimals" for full implementation detail. Summary:

- Results modal (`UI.showResults`): loot rows no longer clickable, a new
  "Auto-sold" summary section (`run.autoSold`, game.js), and the
  boss-victory case is no longer closable via X/backdrop
  (`UI.modal(html, closable)` new 2nd param, ui.js).
- Fixed an auto-sell gap: `claimQuestReward` and `grantPartClearReward`
  now check `shouldAutoSell` before pushing to inventory, same as
  in-combat drops already did — `buyShopItem` intentionally still doesn't.
- `AUTO_USE_TIERS` (game.js) and Combat Options' `tiers` array (ui.js)
  reordered to Legendary, Miniboss, Epic, Rare, Normal/Abnormal.
- Blacksmith's restock button: 30px `.btn-sq` → 42px `.restock-btn`, cost
  moved from tooltip-only to a visible `.restock-cost` caption underneath.
- Combat Arena Help modal absorbed the potion-cooldown/skill-cast caption
  that used to sit inline under the action row (`.hint-inline` CSS
  removed, now dead).
- `formatK(n, keepDecimals)` rounds sub-1000 numbers to whole by default;
  HP/Mana Regen and `fmtDelta` (equip-comparison deltas) opt back into
  decimal precision via the new 2nd param.

## 1.4.2 (fix)

- **Dice gambling is now 2 dice per side**: `resolveDice(bet)` (game.js)
  rolls `you = [rint(1,6), rint(1,6)]` and `house = [rint(1,6),
  rint(1,6)]`, compares `youSum`/`houseSum` instead of single die
  values — same win/lose/tie -> `+bet`/`-bet`/no-op logic, still true
  50/50 with no house edge (the extra die just widens the outcome
  distribution 2-12 and shrinks the tie chance vs a single d6). Return
  shape grew from `{you, house, result, bet}` to `{you: [a,b], house:
  [a,b], youSum, houseSum, result, bet}`.
  `UI.playDice`/`UI.renderTavern` (ui.js) updated to 4 dice DOM nodes
  (`dice-you-1/2`, `dice-house-1/2`) in a `.dice-pair` per side plus a
  bold running sum (`dice-you-sum`/`dice-house-sum`), animation spins
  all four during the roll. `.dice-face` shrunk 64px->50px so a pair
  fits comfortably per side.
  Verified via headless-Chromium: mid-roll all 4 dice show independent
  random faces; after settling both dice per side show the actual
  rolled values, the sums are correct, and gold moved by exactly the
  bet amount on a loss (2+2=4 vs 6+3=9).

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
