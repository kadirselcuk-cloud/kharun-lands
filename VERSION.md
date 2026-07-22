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

## 1.14.0 (minor)

Balance rework of resistance/attack-speed progression plus a Shield mechanic
fix, from one request with 4 clarifying-question answers resolving the
ambiguous parts (there was no existing "resistant/not-resistant/vulnerable"
per-type tagging on creatures to build from).

- **Player resistance cap 75% -> 96%** (`derive()` in game.js, the 3
  `d.res.<type> = Math.min(...)` clamps at the end of the function).
- **Creature resistance now scales with story progress, per damage type.**
  Per explicit answer, categorization is derived from each creature's own
  `atkType`: its own attack type is "resistant" (95% cap), the other two
  damage types are "not-resistant" (90% cap) — there's no third
  "vulnerable"/80% tier in practice, since a type is always either the
  creature's own atkType or one of the other two.
  - New `resTypeCap(type, atkType)` (game.js, right after `TIER_CONF`)
    returns 95/90 accordingly.
  - New `scaleResToCap(baseVal, level, cap)` linearly interpolates each
    species' existing hand-authored `res` number (data.js) toward that cap
    as `level` goes 1 -> 100 (`t = (level-1)/99`) — per explicit answer,
    this *stretches* the existing numbers rather than discarding them, so
    early-game relative differences between species are preserved and the
    cap is hit exactly at level 100 (Chapter 10 Area 10). Applied in
    `makeCreature` right after `c.res` is initialized from `base.res`.
  - The old flat caps on top of the base curve — the tier resistance bump
    (rare +5/epic +10/miniboss +12/legendary +15, previously capped at
    70%) and the `resistant` specialty affix (+20%, previously capped at
    85%) — now clamp to `resTypeCap(k, c.atkType)` instead of a fixed
    70/85, per explicit answer ("drop the flat tier/affix caps").
  - `playerHit`'s own enemy-resistance clamp (previously a flat
    `Math.min(75, res)` when the player deals magic/phys damage) now uses
    the same `resTypeCap(resKey, enemy.atkType)` — otherwise a boss with a
    95%-resistant type would still only mitigate up to 75% of the
    player's damage against it, undermining the whole point of the higher
    ceiling.
- **Creature attack speed scales up to 5x by Chapter 10.** New
  `chapterSpdMult(level) = 1 + (chapterNumOf(level)-1) * (4/9)` (1x at
  Chapter 1, 5x at Chapter 10, linear per chapter) stacks as an extra
  multiplier on `makeCreature`'s existing `spd` formula, per explicit
  answer — today's per-tier/species/level speed variance is untouched,
  just uniformly scaled up as chapters progress.
- **Shield "Half Damage" protections fixed to actually reduce damage, not
  add resistance.** Previously `resPhysHalf`/`resMagicHalf`/
  `resPoisonHalf` (`derive()`, game.js) added +50 straight into
  `d.res.<type>` — inflating the displayed/capped resistance number and
  getting *diminishing* returns the higher a player's resistance already
  was (its value shrinks as `(1 - res/100)` approaches 0), the opposite of
  "half damage." Replaced with a new `d.dmgHalf = {phys,magic,poison}`
  boolean flag set per protection; `enemyHit` now multiplies the final
  damage of that type by 0.5 as the very last step (after resistance,
  armor, DR, buffs, and the Magical-affix bonus), so it's a flat 50% cut
  applied post-mitigation regardless of how much resistance the player
  already has. `DATA.SHIELD_PROTECTIONS`' `fmt()` text (data.js) updated
  from "+50% Physical/Magic/Poison Resistance" to "Reduces
  physical/magic/poison damage by 50%" to describe the corrected mechanic
  accurately.
- Verified via a Node `vm` sandbox (shared-context load of `data.js`/
  `game.js`, no DOM needed for these code paths): `makeCreature(100, ...)`
  produces exactly `{phys:90, magic:95, poison:90}` for a magic-atkType
  creature (95% on its own type, 90% on the others) and `chapterSpdMult`
  hits exactly 1/1.44/3.22/5 at levels 1/20/55/100; a synthetic
  `G.char.equip.offhand` with `protections: ['resPhysHalf']` produces
  `d.res.phys === 0` (no resistance inflation) and `d.dmgHalf.phys ===
  true`; stacking three `+200` `resPhys/resMagic/resPoison` affixes caps
  `d.res` at exactly 96 for all three types.

---

## 1.13.1 (fix)

Correction to 1.13.0. The user's original "make it rare" instruction for
Critical Strike/Double Strike/Poison Weapon was misread as `minRarity`
(the item-rarity-tier gate: Normal/Magical/Rare/Epic/Legendary) when it
actually meant the affix's own **drop rarity** — i.e. `w`, the roll-weight
field that governs how often an affix is picked among its eligible pool,
a completely separate axis from item tier. Caught immediately by the user
before this shipped further; fixed same-session.

- **Reverted** `critStrike`/`doubleStrike`'s `minRarity` back to
  `legendary` (undoing the 1.13.0 change) — both were already sitting at
  `w: 1`, the pool's rarest weight, before any of this work started, so
  no weight change was needed for either; they were already exactly as
  rare (drop-frequency-wise) as this codebase's rarity system allows.
  1.13.0's actual curve rework (chance/damage scaling with ilvl for both)
  is untouched — only the tier-gate part of that update was wrong.
- **`poisonWeapon`'s `w` lowered `3 -> 1`**, joining the same rarest-weight
  tier as Vampiric/Mana Steal/Critical Strike/Double Strike/Spellstrike/
  Blessing/All Skills. Its `minRarity: 'rare'` was untouched (it was
  already `rare`, correctly, before 1.13.0 ever touched this file) —
  1.12.5/1.13.0 already established the *item*-tier gate was fine; only
  the *affix*-tier (weight) needed the "make it rare" treatment applied
  to it, per the clarification.
- Reverted a stale comment above `minnieWeaponSkillCount` (`game.js`) back
  to its pre-1.13.0 wording, since it's accurate again now that
  critStrike/doubleStrike are legendary-only.
- Left `slowWeapon` (poisonWeapon's structural twin — same `weaponOnly`/
  `minRarity: 'rare'`/compound-value shape) at its existing `w: 3`
  untouched — the user's request named Critical Strike, Double Strike, and
  Poison Weapon specifically; Weapon Slow wasn't mentioned and extrapolating
  the same "make it rare" treatment onto it would be guessing again, the
  exact mistake this version exists to correct.
- Verified via a Node `vm` sandbox: confirmed `critStrike`/`doubleStrike`/
  `poisonWeapon`'s `w`/`minRarity` fields read back as
  `{w:1,minRarity:legendary}` / `{w:1,minRarity:legendary}` /
  `{w:1,minRarity:rare}`; force-rolled 30,000 Rare-tier weapons (zero
  critStrike/doubleStrike hits, confirming the revert) against 30,000
  Legendary-tier weapons (thousands of hits, confirming they still work
  there).
- Process note for next time: recorded to memory (this assistant's
  persistent cross-session notes, not part of this repo) that "rare" is
  ambiguous in this specific codebase between `minRarity` and `w`, and
  that ambiguous terms should be asked about before writing code rather
  than resolved by guessing — this was a repeat of the same mistake class
  as 1.12.2's stat-range overreach, same day, same session.

## 1.13.0 (minor)

Direct request: rework Critical Strike, Double Strike, and Poison Weapon's
curves and drop Critical/Double Strike's rarity floor.

- **`minRarity` lowered `legendary` -> `rare`** for `critStrike`/
  `doubleStrike` (`DATA.AFFIXES`, `data.js`) — still `w: 1` (rarest weight
  in the pool), so the affix itself is just as hard to roll as before, only
  now reachable on Rare/Epic gear too instead of exclusively Legendary.
  This lands right on top of 1.12.5's fix, which is what makes it actually
  matter: before that fix these two couldn't roll on a real weapon at all
  (jewelry-only), so lowering the floor here would have been silently
  inert had it landed first.
- **Critical Strike's `roll()` now returns a compound `{chance, bonus}`**
  (previously a bare chance number with the +100% damage hardcoded at the
  consumer). Both sides scale with ilvl from `t = (ilvl-1)/99`: chance
  `rint(10+10t, 20+10t)` (10-20% at ilvl 1 -> 20-30% at ilvl 100), bonus
  `rint(100+80t, 100+100t)` (fixed exactly 100% at ilvl 1, since lo=hi
  there -> 180-200% at ilvl 100).
- **Double Strike's `roll()`** — same shape, chance only (no damage
  component; a double strike is a full extra attack, not a multiplier, so
  there's nothing else to scale): `rint(10+30t, 20+30t)` (10-20% at ilvl 1
  -> 40-50% at ilvl 100, replacing the old `Math.min(20, 3 +
  floor(ilvl/12) + rint(0,4))` curve, which only ever reached ~15% in
  practice despite its nominal 20 cap).
- **`derive()` (`game.js`)** — `d.critStrike`'s gear-loop case now reads
  `a.v.chance`/`a.v.bonus` instead of a bare number, still summing chance
  across every source (gear affixes AND the pre-existing class passives
  that grant flat `critStrike` — Rogue/Warrior/Mage passives at
  `data.js` ~1756/1808/1822/1880 — untouched, they only ever defined a
  chance number, never a damage component) exactly as before. The new
  `d.critBonus` field (default `100`, so passive-only crit sources still
  deal the old flat +100% if no gear affix is present) takes **the last
  qualifying item's bonus value, not a sum** — there's no existing
  precedent anywhere in this codebase for stacking a bonus-damage%
  multiplicatively or additively across multiple items (the closest
  analogues, `weaponPoison`/`weaponSlow`, already use last-wins overwrite
  for their compound values), so this follows that same convention rather
  than inventing a new stacking rule. Flagged as an assumption, not
  confirmed with the user — worth revisiting if a player ends up
  double-dipping two `critStrike`-rolled items and finds the result
  surprising.
- `d.doubleStrike`'s cap raised `40 -> 50` (`derive()`'s caps block) to
  match the new roll ceiling — the old cap would have silently clipped the
  requested 50% endgame value down to 40%. Added a matching `d.critBonus =
  Math.min(200, ...)` cap alongside it (not strictly load-bearing since the
  roll formula already tops out at 200, but every sibling stat in that
  block has an explicit ceiling, so added one here too for consistency and
  as insurance against a future curve change quietly exceeding it).
- The actual damage consumer (`enemyHit`-adjacent code in `game.js`, the
  crit branch right after the execute-bonus line) changed from a hardcoded
  `dmg *= 2` to `dmg = Math.round(dmg * (1 + d.critBonus / 100))`.
- **Poison Weapon**: direct "+50% poison damage" follow-up. `pct`'s curve
  scaled up 50% end-to-end — `0.02 + t*0.03` (2%->5%) became `0.03 +
  t*0.045` (3%->7.5%). `rounds` and the affix's own `minRarity: 'rare'`
  were already correct/unchanged and untouched by this request.
- A stale comment in `game.js` (above `minnieWeaponSkillCount`) cited
  critStrike/doubleStrike alongside Spellstrike/Blessing as precedent for
  "legendary-only ultra-rare" gating on Minnie's weapon-exclusive skills —
  updated to note they moved to rare+ in this version, since that
  precedent no longer holds for those two (Minnie's own gate is a separate,
  hardcoded `it.rarity === 'legendary'` check unaffected by this change).
- Verified via a Node `vm` sandbox: sampled `critStrike`/`doubleStrike`/
  `poisonWeapon`'s `roll()` 5,000x each at ilvl 1 and ilvl 100 and confirmed
  the exact requested endpoints (chance/bonus/pct all landed precisely on
  the specified ranges, including poisonWeapon's now-deterministic 3%/7.5%
  since its formula has no jitter); force-rolled 30,000 Rare weapons and
  confirmed critStrike/doubleStrike now actually appear on them (impossible
  before this version); constructed a synthetic character equipping a
  weapon with a `{chance:30, bonus:200}` critStrike affix and confirmed
  `derive()` produces exactly `d.critStrike=30, d.critBonus=200`, correctly
  respecting both new caps.

## 1.12.5 (fix)

Found while answering a question about why the "+All Skills" affix hadn't
been seen in a long time — turned out its true chance on the slots it was
meant for was exactly 0%, not just low.

- **Root cause**: `rollAffixes`'s pool filter (`game.js`) gated `weaponOnly`
  and `slots`-restricted affixes with `if (a.weaponOnly && !bypassSlot)
  return false;` / `if (a.slots && !bypassSlot) return false;` — neither
  condition ever checked whether the item's own slot actually matched.
  `bypassSlot` is only ever true for jewelry/runes ("jewelry can get
  everything"), so in practice this excluded every `weaponOnly` or
  `slots`-restricted affix from **every non-jewelry, non-rune item,
  including the exact slot(s) each one was written for** — the only place
  they could ever land was jewelry, via the bypass path.
- Confirmed empirically before touching anything: 20,000 forced-legendary
  weapons and 20,000 forced-legendary armor pieces in a Node `vm` sandbox
  produced zero instances of any `slots`-gated affix (Speed, Evasion,
  +Weapon Damage flat/%, +Armor, Damage Reduction, all 3 Resistances,
  Enemy Resist Shred, +Skill, +All Skills, Pain Reflection, Gold/Magic
  Find) and zero instances of any `weaponOnly` affix (Vampiric/Life Steal,
  Mana Steal, Poison Weapon, Weapon Slow, Execute, Critical Strike, Double
  Strike, Spellstrike, Blessing) on weapons/armor — all of them showed up
  fine on rings in the same run.
- **Fix**: both checks now also require the item's slot to actually match —
  `item.slot !== 'weapon'` for `weaponOnly`, `!a.slots.includes(item.slot)`
  for `slots` — while still leaving the jewelry/rune bypass (`bypassSlot`)
  untouched, so jewelry keeps being able to roll anything, exactly as the
  surrounding comments already documented as intended. `minRarity` gating
  was never affected by this bug and is untouched.
- Re-ran the same 20k-sample sweep post-fix: weapons now correctly roll
  dmgFlat/dmgPct/enemyResDown/skill/allSkills/all 9 weaponOnly affixes (and
  correctly never roll Speed/Evasion/Armor/DR/Resistances/PainReflect/
  Gold-Magic Find, none of which list `weapon` in their `slots`); armor
  pieces correctly roll dmgFlat/dmgPct/armor/dr/resistances/skill/
  allSkills/painReflect; a targeted 20k-shield sweep (forced offhand,
  filtered to `isShieldItem`) confirmed shields now roll Armor,
  Physical/Magic/Poison Resistance, and Pain Reflection (all list
  `offhand`) and correctly never roll dmgFlat/dmgPct/skill/allSkills
  (none list `offhand`). Rings were re-checked to confirm they still get
  every affix as before — this fix only added eligibility, it didn't
  remove any.
- Scope check: only `rollAffixes`'s pool filter changed. `RANGE_DOUBLE_IDS`,
  rarity's `[min,max]` affix-count roll, rune generation (`isRune` already
  bypassed correctly before and after), and Minnie's weapon-skill roll are
  all untouched by this fix.

## 1.12.4 (fix)

Direct request: "keep speed and monster count settings" when starting an
adventure. `startAdventure()` (`game.js`) previously reset
`G.settings.packSize`/`G.settings.advSpeed` back to their defaults (1
enemy / 1200ms) whenever `G.settings.lastAdvLevel !== G.area` — i.e. every
time you adventured on a level you hadn't just come from, your Speed and
Enemies-at-once choices silently reverted, even though the settings
persisted fine for repeat runs of the *same* level.

- Removed the level-based reset block entirely, along with the
  now-unused `lastAdvLevel` field it depended on (`defaultSettings()`,
  `ensureSettings()`'s backfill list, and the reset block itself) — Speed
  and Enemies-at-once now simply carry over from whatever they were last
  set to, regardless of which level you start on next.
- Verified in a Node `vm` sandbox: set pack size to 4 and speed to 400ms
  mid-adventure, left that adventure, started a new one on a completely
  different level, and confirmed both settings (and `ADV.speedMs` itself)
  carried over instead of resetting to the 1/1200ms defaults.

## 1.12.3 (fix)

Direct request: the shield item-tooltip line added in 1.12.0
("Grants a chance to block incoming damage entirely (scales with your
progress, 20%–40%)") should just state the actual percentage.

- `ui.js` (`UI.itemStatsHtml`): replaced the static description with
  `🛡️ ${Math.round(shieldBlockChance(G.area) * 100)}% Block Chance`,
  computed live from the player's current `G.area` — same source the
  Character tab's own Block Chance stat row already uses, so the two
  numbers always agree instead of the tooltip citing a vague 20-40% range.
- Verified via `node --check`.

## 1.12.2 (fix)

Direct correction after user review of 1.12.0: "increase the stat bonus
range by 100%" was meant to apply only to Str/Dex/Int, not every magnitude
affix. My original read of "any stat" in the request was too broad and
doubled HP/Mana/Speed/HP Regen/Mana Regen/Evasion/Weapon Damage (flat &
%)/Armor/Damage Reduction/all three resistances/Enemy Resist Shred/+skill/
All Skills/Pain Reflection/Gold Find/Magic Find as well.

- `game.js`: `RANGE_DOUBLE_EXCLUDE` (an exclude-list approach — double
  everything except a named few) replaced with `RANGE_DOUBLE_IDS`, an
  include-list containing only `str`/`dex`/`int`/`allStats`. `allStats`
  (the rare "+X to All Stats" affix, which grants all three at once) was
  a explicit follow-up clarifying question — kept doubled since it's
  functionally a Str/Dex/Int roll, per the user's answer. Every other
  affix id, including the ones already excluded from doubling in 1.12.0
  (the capped procs) and the ones that were wrongly included, now goes
  through `rollAffixValue` unmodified. Both `rollAffixes` (fresh rolls,
  items and runes) and `rerollAffixValues` (Enchantment Table re-enchant)
  still share this one function, so the fix applies everywhere the 1.12.0
  bug did.
- User feedback for future sessions: ask before implementing anything
  not explicitly confirmed, rather than picking a reasonable-sounding
  default and documenting the assumption after the fact — recorded to
  memory.
- Verified via `node --check` and a Node `vm` sandbox sampling all 22
  previously-affected affix ids at ilvl 50: `str`/`dex`/`int`/`allStats`
  show roughly double their raw `roll()` output through `rollAffixValue`,
  every other id (hp, mana, speed, hpRegen, manaRegen, evasion, dmgFlat,
  dmgPct, armor, dr, resPhys, resMagic, resPoison, enemyResDown, skill,
  allSkills, painReflect, goldFind, magicFind) comes back unmodified.

## 1.12.1 (fix)

Reworked the version-migration item reroll (`runVersionMigration`,
`game.js`, introduced in 1.10.0) after direct feedback that it was doing
too much: it previously rebuilt every equipped/inventory item from scratch
via `makeItem(it.ilvl, it.rarity, cls, it.slot)`, which re-rolled which
affixes an item had (not just their values), rolled a brand-new socket
count independent of the old one, and truncated/overflowed any runes that
no longer fit the new socket count into loose inventory runes.

- `rerollItemWithRunes` no longer calls `makeItem` at all. It now mutates
  the existing item in place, mirroring the Enchantment Table's own
  `reenchantItem`/`rerollAffixValues` (`game.js`, the Enchanter section):
  base stats (`dmgMin`/`dmgMax`/`armor`/`potionCap`) are recomputed from
  `baseStatsFor(it)` at the item's own existing `ilvl` (not bumped to
  `G.area` the way an actual Enchantment Table use does — this is a
  balance refresh, not a power-up), and `item.affixes` goes through the
  same `rerollAffixValues` that keeps each affix's `id` (and, for the
  `'skill'` affix, its granted `skillId`/`skillName`) and only re-rolls
  the numeric `v`. `item.sockets` is left completely untouched, and
  `item.runes` is re-rolled in place (same array, same length, same
  `bonuses` ids per rune) via a new local `rerollRune` that calls
  `rerollAffixValues` on `r.bonuses` instead of `buildRune`'s from-scratch
  path — so a rune keeps exactly which properties it has, just with fresh
  values. Loose standalone runes in inventory go through the same
  `rerollRune`. `item.name`/`slot`/`base`/`rarity`/`uid` are never touched,
  same as `reenchantItem` already left an item's name alone on purpose.
- The now-dead overflow-runes bookkeeping (runes that no longer fit a
  freshly-rolled socket count) was removed along with it — there's nothing
  to overflow anymore since sockets never change.
- Verified in a Node `vm` sandbox (shared-context load of `data.js`/
  `game.js`, same relationship as the real `<script>` tags): built a
  synthetic legendary weapon with 2 sockets/2 socketed runes plus 1 loose
  inventory rune, forced a version mismatch, and confirmed after
  `runVersionMigration()` the weapon's affix ids, socket count, socketed-
  rune bonus ids, name, slot, base, and rarity were all bit-for-bit
  unchanged while the affix/rune *values* differed; loose rune count in
  inventory was also unchanged (no overflow bucket needed anymore).

## 1.12.0 (minor)

One large request bundling shield rework, a rune-affix-pool bugfix, a
gear-magnitude balance pass, Enchanter UX additions, a mage equip
restriction, an HP Regen buff, a skill-duration rework, and two loot/shop
rarity-curve tweaks. Three points were ambiguous enough to ask about first
(stat-range-doubling scope, HP Regen buff size, and what "Minnie cannot use
two weapons" actually meant — my own testing showed mage dual-wielding a
wand+wand already worked mechanically, so I asked rather than assume; the
answer was that it should be *blocked*, the opposite of what I'd guessed).

- **Shields** (`game.js`/`data.js`/`ui.js`): three independent buffs to the
  three defensive offhand bases (buckler/kiteshield/towershield — the
  mage's orb/tome offhands are untouched, they're weapon-like, not shields;
  see the new `isShieldItem`/`SHIELD_BASE_IDS`).
  - **Block chance**: `shieldBlockChance(level)` returns 20% at area 1
    ramping linearly to 40% at area 100 (same `t = (level-1)/(MAX-1)` ramp
    used elsewhere in the codebase), computed in `derive()` as `d.blockChance`
    whenever a shield is equipped in the offhand slot, and rolled in
    `enemyHit()` right after the evasion check — a block fully negates the
    hit (`{dodged:false, blocked:true, dmg:0}`), regardless of attack type,
    distinct from evasion (miss) and DR (reduce). `enemyAct` gets a
    dedicated "🛡️ You block ..." log line/`lastAction` so it doesn't read
    as a dodge. Shown on the Character tab (`🛡️ Block Chance`, only when
    nonzero) and as a static note on shield item tooltips (the actual %
    isn't stored per-item, since it's level-scaled, not gear-scaled).
  - **Sockets**: shields get their own `rollShieldSockets()` — flat 25%
    each for 0/1/2/3 — instead of the shared `rollSockets()` 60/25/10/5%
    every other socketable slot still uses.
  - **Protections**: new `DATA.SHIELD_PROTECTIONS` (6 entries: Immune to
    Slow/Charm/Necrotic, Half Damage from Physical/Magic/Poison) rolled by
    `rollShieldProtections()` — 50/25/15/10% for 0/1/2/3, drawn without
    replacement — and stored as `it.protections` (array of ids), separate
    from the normal numeric `DATA.AFFIXES` pool since these are flags, not
    rolled magnitudes. Wired into `derive()` (sets `d.immuneSlow`/
    `d.immuneCharm`/`d.immuneNecrotic`, or adds +50 to the matching
    `d.res.*`) and consumed at each effect's own site: the Frozen
    specialty's slow roll (`enemyHit`), the Charm specialty's turn-skip
    gate (`playerAct`), and `necroticActive()` (short-circuits to `false`
    when immune, so every existing call site — potion heals, skill heals —
    respects it for free). Shown on item tooltips as `🛡️`-prefixed lines.
- **Rune affix pool bugfix** (`game.js`): root cause of "runes only ever
  get HP/Mana/stats" — `rollAffixes`'s pool filter rejected every
  `weaponOnly`/`minRarity`/`slots`-gated affix whenever it was called
  without an `item` (which is exactly how runes have always rolled,
  `rollAffixes(n, ilvl)` with no 3rd/4th arg), regardless of the rune's own
  tier. Only the 7 completely ungated affixes (str/dex/int/hp/mana/
  hpRegen/manaRegen) could ever pass. Fixed by giving `rollAffixes` a 5th
  `runeRarity` param: `weaponOnly`/`slots` now bypass the same way jewelry
  already does ("jewelry can get everything") whenever there's no `item`
  (i.e. it's a rune roll), and `minRarity` is checked against `runeRarity`
  instead of unconditionally failing. `buildRune` passes its own
  `tier.rarity` through, so a tier-5 (Elder Rune legendary/Mythic) rune can
  now roll literally anything up to and including Crit Strike/Life Steal/
  Spellstrike, while a tier-1 (Faded) rune still can't roll anything
  minRarity-gated — the tier ladder now actually matters for rune quality,
  not just bonus count.
- **Stat-range doubling** (`game.js`): per the clarifying answer, scoped to
  plain magnitude stats only. New `rollAffixValue(def, ilvl)` wraps
  `def.roll(ilvl)` and doubles the numeric result unless the affix id is in
  `RANGE_DOUBLE_EXCLUDE` (lifesteal, manasteal, poisonWeapon, slowWeapon,
  execute, critStrike, doubleStrike, procOffense, procSupport — the
  deliberately-capped "ultra-rare" combat procs, which keep their existing
  tuned ranges). Both `rollAffixes` (fresh rolls, items and runes alike)
  and `rerollAffixValues` (the Enchantment Table's re-enchant reroll) now
  go through this shared helper, so re-enchanting an old item also picks
  up the new range instead of only fresh drops.
- **Enchanter UX** (`ui.js`/`style.css`): all three sub-panels (Table/
  Carver/Forge) now render each rune's actual `bonuses` underneath its
  name/tier via a shared `runeBonusesHtml(r)` helper (`.rune-bonuses`/
  `.affix-tiny` CSS), not just the bonus *count*. New `mergeAllRunes()`
  (game.js) drives the Rune Carver's new "⚡ Merge All" button: loops
  tiers 1→4 ascending, repeatedly carving every group of 3 same-tier runes
  it can find via the existing `carveRunes`, re-reading the inventory pool
  after each carve. Processing tiers in ascending order means a
  successful carve's output (one tier higher) is picked up automatically
  once that tier's own pass starts — no separate cascade/re-pass logic
  needed. Deliberately stops at tier 4→5 (leaves legendary-tier runes
  alone even if 3+ are on hand) since merging 3 legendaries only re-rolls
  a 4th with no tier to climb to, and "merge up to legendary" read as a
  ceiling to reach, not something to keep spending into once reached.
- **Minnie dual-wield restriction** (`game.js`/`ui.js`): direct request,
  the opposite of what I'd initially assumed from the one-line ask (I'd
  verified mage-dual-wielding-a-wand already worked mechanically and
  guessed that meant it needed *fixing*; the clarifying answer said it
  should be blocked instead). `equipItem` now returns early when
  `it.slot === 'weapon' && targetSlot === 'offhand' && G.char.cls ===
  'mage'` — mirrors the existing two-handed-weapon-into-offhand guard
  right above it. The "Equip Off Hand"/"Buy & Equip Off Hand" buttons for
  a 1-handed weapon (`UI.showItem`/`UI.showShopItem`) are hidden for mage
  specifically so there's no dead button to click. Warrior/Rogue are
  unaffected — they could never do this anyway (no non-shield 1h item
  exists for their offhand slot in `DATA.OFFHAND_BASES`), so this only
  ever bound for mage's wand/scepter.
- **HP Regen passives doubled** (`data.js`), per the clarifying answer
  ("double the coefficient"): Toughness (`w_pass1`) 0.45/rank → 0.9/rank,
  Shadow Dance (`r_pass2`) and Sacred Vigil (`m_p_radiant_pass1`) both
  0.3/rank → 0.6/rank. The Knight path's Divine Protection *buff* (not a
  passive) was left alone — the request and its own clarifying question
  both specifically named "passives".
- **Skill duration rework** (`data.js`): `skillRounds(base, r)` (base +1
  round every 3 ranks, capped at +3) replaced with `skillRounds(r)` = `6 +
  (r - 1)` — every buff/debuff/poisonDot skill across all 3 classes and
  their Advanced Class paths now starts at 6 rounds and gains exactly 1
  round per rank, uncapped (r can reach 20 via gear). All ~30 call sites
  updated to drop the now-unused `base` argument rather than leaving a
  dead parameter that looks meaningful but isn't. `poisonWeapon`'s own
  ilvl-scaled duration (unrelated, item-affix-only) is untouched.
- **Blacksmith weapon overrepresentation, confirmed and fixed**
  (`game.js`): `genShopStock` called `makeItem(...)` with no `forceSlot`,
  so stock rolled through `makeItem`'s own unforced category odds (30%
  weapon / 12% offhand / 38% armor split across 5 slots ≈7.6% each / 20%
  jewelry split across 4 ≈5% each, ring double-weighted to ≈8%) — meaning
  a weapon really was several times more likely to appear than any single
  armor piece or jewelry type, confirmed by reading the roll thresholds
  rather than guessing. Fixed by having `genShopStock` pick uniformly from
  a new `SHOP_SLOT_KINDS` (all 11 forceable slot kinds) and pass it as
  `makeItem`'s `forceSlot`, so every slot kind gets an even ~9% shot —
  `makeItem`'s existing forceSlot class-biasing (1h weapons preferred,
  matching armor weight, etc.) applies for free.
- **Legendary-chance level scaling** (`game.js`), per direct request
  ("start with current settings, increase legendary chance up to 30% by
  level 100 — same for legendary drops"):
  - `shopRollRarity()`: legendary climbs 2% → 30% linearly with
    `shopIlvl()` (`G.unlocked`); the other 4 buckets (epic/rare/magical/
    normal, originally 13/20/30/35) shrink by a shared `restScale` factor
    so their *relative* proportions to each other stay identical while
    making room for the bigger legendary slice.
  - `rollItemRarity('legendary', ...)`: the legendary-tier creature's own
    legendary-item roll climbs 25% → 30% linearly with the creature's
    `lvl` (new 3rd param, threaded through all 3 `rollLoot` call sites);
    epic/rare keep their original 25-point-wide bands, so the extra 5
    points come entirely out of the bottom (magical) bucket, unchanged
    for miniboss/epic/rare tiers.
- Verified via `node --check` on all three script files, a Node `vm`
  sandbox pass (shield socket/protection-count distributions, block chance
  at area 1/50/100, `derive()` wiring for all 3 immunity flags and both
  half-damage resistances, tier-5 vs. tier-1 rune affix pools, doubled vs.
  excluded roll ranges, `mergeAllRunes` consuming exactly 3-per-attempt,
  Minnie-blocked/Warrior-still-allowed dual-wield, all 3 HP Regen passive
  values, `skillRounds` at r=1/10/20, shop slot-kind distribution, and both
  legendary-chance curves sampled at 20k iterations each), and a headless-
  Chromium (Playwright) pass against the real `node server.js` — this
  caught one real bug the `vm` logic-checks alone hadn't exercised yet:
  `buildRune`'s naming code indexed `DATA.NAME_PARTS[affixId]` with no
  fallback, and `lifesteal` had no entry there (harmless before this
  update, since its `minRarity: 'epic'` gate meant it could never reach
  the one item-naming code path — `magical`/non-weapon-`rare` — that also
  lacked a fallback; now reachable on tier-5 runes for the first time).
  Fixed by adding the missing `NAME_PARTS.lifesteal` entry. After that fix,
  a real page load, seeding a mage character via the console with a
  forced 3-protection legendary shield and a spread of runes, then
  rendering the Character tab, the shield's item modal, all 3 Enchanter
  sub-views, and the inventory item modal for a 2nd wand all showed the
  expected content with zero console errors; a real `startAdventure()` +
  `adventureTick()` combat loop (not a synthetic hit) produced an actual
  "🛡️ You block ..." log line within a few ticks; and a warrior dual-
  wielding two maces confirmed the offhand-weapon restriction is
  mage-only, not global.

## 1.11.2 (fix)

Direct follow-up on 1.11.1, from the same user testing pass: "the successor
skill should not require predecessor. Also if predecessor is required by
another skill, now, successor should be required. If predecessor requires
any skill, successor should require it." Three explicit rules, the first
two already true as of 1.11.1, the third genuinely new.

- **Rule 1 — "successor should not require predecessor"**: already held as
  of 1.11.1's `effectiveReqSkill` self-reference guard (a path skill whose
  own `req` names the exact base skill it replaces resolves to nothing).
  No change needed, confirmed still holds.
- **Rule 2 — "if predecessor is required by another skill, successor should
  be required"**: already held too — this is exactly what 1.11.1's dynamic
  `classSkillFor(reqBase.cat)` resolution does for a *different* skill's req
  (e.g. Avatar of War's req on Berserk resolves to Aegis of the Paladin once
  a Knight is chosen). Confirmed still holds, unchanged.
- **Rule 3 — "if predecessor requires any skill, successor should require
  it" — the actual gap**: `effectiveReqSkill`'s self-reference branch
  previously just returned `null` (no requirement at all) once it detected
  a successor naming its own predecessor. That's correct when the
  predecessor itself had no `req` (Intimidate and Battle Shout, both
  `req: undefined`, which is why Crippling Blow and Divine Protection
  correctly show no requirement) — but wrong for the two predecessors that
  *do* have their own `req`: Eviscerate (`req: 'r_atk1'`, Backstab) and
  Pyroblast (`req: 'm_atk1'`, Fireball). Venomous Strike and Kill Shot (both
  replace Eviscerate, on the Assassin and Hunter paths respectively) were
  silently dropping the Backstab requirement entirely — learnable at level
  25 with zero attack-line investment. Same gap for Disintegrate (replaces
  Pyroblast, Sorcerer path) and Fireball.
- **Fix**: the self-reference branch now recurses —
  `effectiveReqSkill(reqBase)` instead of `null` — asking "what did the
  predecessor itself require?" one level up, using the exact same
  resolution logic. Since Backstab/Fireball are ordinary base skills in
  their own untouched cats (`attack`, never replaced by any path), that
  recursive call hits the non-self-referential branch immediately and
  returns them directly — no risk of runaway recursion, and no risk of the
  Rule-1 case (Intimidate/Battle Shout, no req at all) picking up a
  spurious requirement, since `effectiveReqSkill` on a `req: undefined`
  skill still returns `null` at the base case.
- **Verified**: `node`+`vm` harness — Venomous Strike and Kill Shot's
  effective req both resolve to Backstab (not Eviscerate); Disintegrate's
  resolves to Fireball; Crippling Blow and Divine Protection still resolve
  to `null`; Avatar of War's Rule-2 resolution (Berserk → whichever path
  ult is active) is unaffected. Live in the browser: promoted a fresh rogue
  to Assassin with zero prior Backstab investment, confirmed the Skills tab
  showed "Req: level 25 + Backstab" under Venomous Strike with its action
  button reading "Requires Backstab", then confirmed learning Backstab
  through the real `learnSkill` flow flipped the button to "Learn" — full
  UI-to-engine round trip, not just the underlying function calls. No
  console errors. `node --check` clean on all three script files.

## 1.11.1 (fix)

Follow-up bug report on 1.10.0's promotion fix, filed by the user after
testing it live: "Previous skill should be gone, the replacement skill,
whatever it is should get all its skill points" (confirming the intended
behavior — not a new ask) plus "Knight gets another skill instead of
intimidate. But still one of the ultis require intimidate" — which turned
out to describe a regression in the *Mercenary* path specifically (the
report conflated path names, but the underlying symptom pinpointed exactly
one bug class once traced through the data).

- **Root cause**: every Advanced Class path's `active`/`ult` skill has a
  `req` field naming the *exact* base skill it replaces — e.g. `w_p_merc_active`
  ("Crippling Blow", cat `debuff`) has `req: 'w_debuff'` (Intimidate, the
  same-cat base skill it replaces); `w_p_knight_active` ("Divine
  Protection") has `req: 'w_buff'` (Battle Shout); all 6 path `ult`s have
  `req` naming the base `ult` they replace. 1.10.0's
  `migrateAdvancedClassRanks()` deletes that base skill's `c.skills` entry
  once its rank has been migrated into the replacement (per the explicit
  "previous skill should be gone" requirement) — so every one of these
  `req` checks started evaluating `c.skills[undefined-now] > 0`, which is
  always false. Two concrete failure modes fell out of this: **(1)** a path
  skill that migrated in with real rank (e.g. Crippling Blow inheriting
  Intimidate's rank 5) could never be ranked up again — `canLearn` re-checks
  `req` on every attempt, migrated rank or not. **(2)** a path skill picked
  by a character with *zero* prior investment in the base skill it replaces
  (e.g. choosing Knight without ever having put a point in Battle Shout)
  could never learn even Rank 1 of its replacement — a permanent dead slot
  for the rest of the game, since the base skill itself is simultaneously
  locked out the moment the path is chosen (`classSkillFor`) with no way to
  ever satisfy the `req` after the fact. A third, unrelated failure mode
  shared the same root cause: `w_ult2`/`r_ult2`/`m_ult2` ("Avatar of War" /
  "Thousand Cuts" / "Apocalypse") are ordinary *non-path* skills in their
  own `ult2` cat whose `req` names the base `ult` skill (Berserk / Death
  Mark / Elemental Fury) — once *any* Advanced Class path is chosen and that
  base `ult`'s rank migrates away, these completely unrelated Tier-2
  ultimates lost their `req` target too, even though nothing about them was
  ever meant to change.
- **Fix — `effectiveReqSkill(skill)`** (game.js, new, used by both
  `canLearn` and `ui.js`'s Skills-tab requirement caption): resolves a
  skill's `req` id through `classSkillFor(reqBase.cat)` instead of trusting
  the literal id, so the check always follows wherever that cat's rank
  currently lives for this character. This alone fixes failure mode (3) —
  `w_ult2`'s req now resolves to whichever skill occupies `cat: 'ult'`
  (Berserk if no path chosen, or the path's own `ult` replacement
  otherwise) and checks *that* skill's rank. For failure modes (1) and (2),
  `effectiveReqSkill` special-cases the situation where resolving the req
  lands back on the skill being checked itself — i.e. a path skill whose
  own `req` names the exact base skill it just replaced — and returns
  `null` (requirement trivially satisfied) instead of asking a skill to
  already have rank in itself, which is either redundant (rank came from
  migration) or a permanent deadlock (rank is 0, and 0 can never be > 0).
  No `req` fields were removed from `DATA.SKILLS` — the dynamic resolution
  handles every case without touching the data, including any skill added
  later that follows the same "path skill's req names its own predecessor"
  pattern.
- **`ui.js`'s Skills-tab requirement caption** ("Req: level 25 + X") now
  calls `effectiveReqSkill` too rather than reading `skill.req` raw and
  looking its name up directly — otherwise a promoted Mercenary would keep
  seeing "+ Intimidate" under Crippling Blow forever, even though Intimidate
  no longer exists on their character and the requirement is now a no-op.
- **Verified** via the same `node`+`vm` harness as 1.10.0: (a) gave a
  level-25 warrior Intimidate rank 5, promoted to Mercenary, confirmed
  Crippling Blow inherited rank 5 *and* could be ranked up to 6 afterward
  (previously blocked); (b) promoted a fresh level-25 warrior straight to
  Knight with zero Battle Shout investment, confirmed Divine Protection was
  immediately learnable from rank 0 (previously a permanent dead slot); (c)
  gave a level-50 warrior Berserk rank 3, confirmed Avatar of War was
  learnable, then promoted to Knight (migrating Berserk's rank 3 into Aegis
  of the Paladin and deleting the `w_ult` entry) and confirmed Avatar of War
  remained learnable afterward, now resolving its req through Aegis of the
  Paladin instead; (d) confirmed the pre-existing, unrelated req chain
  (Eviscerate requiring Backstab on a character with no Advanced Class
  chosen at all) still behaves exactly as before — fails at 0 investment,
  passes at rank 1 — as a regression check that the dynamic resolution
  doesn't change behavior for the common case. `node --check` clean on all
  three script files. No browser/Playwright pass this round beyond a smoke
  check that the app still loads — the logic changes are fully covered by
  the harness above.

## 1.11.0 (minor)

Explicit request: remove the Explosive specialty, replace it with a new
Healing specialty.

- **`DATA.SPECIALTIES.explosive` removed, `DATA.SPECIALTIES.healing` added**
  (data.js). Since `AFFIX_IDS` (game.js, `rollAffixes`'s pool) is derived via
  `Object.keys(DATA.SPECIALTIES)` rather than a separately maintained list,
  swapping the key was sufficient to wire Healing into the normal per-tier
  specialty roll (`AFFIX_CHANCE`) with no other roll-table changes needed.
- **Explosive's on-death damage branch removed** from the death-resolution
  loop in `adventureTick` (game.js) — along with its sole remaining
  consumers, `levelDifficulty(level)` and `WARD_TIER_MULT`, both now dead
  code (Reflective, the only other consumer, was already removed in 1.5.0).
- **Healing implemented as a per-turn choice in `enemyAct`** (game.js), not
  as a passive tick like the existing Regenerating specialty: before rolling
  its normal attack, a creature with the `healing` affix and fewer than 10
  prior heals this fight checks for any living ally (itself included) below
  max HP. If one exists, a 50% roll heals a randomly-picked injured ally
  (`pick(injured)`) for `round(target.maxHp * 0.2)`, clamped to the missing
  HP, instead of attacking that turn; `e.healCount` (new field on every
  creature, alongside the existing `regenTotal`) tracks uses toward the cap
  of 10. If there's no injured target, the creature just attacks as normal
  (a "heal" that has nothing to heal isn't a real choice) — the 50/50 only
  applies when there's an actual target.
- **Tavern quest**: `kill_explosive` ("Powder Keg") swapped for
  `kill_healing` ("Mender's End") in `genQuest`'s `makers` array (game.js) —
  same reward shape, just a new type string/name/flavor text. This changes
  the accepted-quest `type` value; an in-flight "Powder Keg" quest a player
  already accepted before this update would no longer match any specialty a
  creature can roll (not treated as a save-migration case, same as any other
  quest-board regeneration on return-home already replaces stale board
  entries).
- **The 6 story bosses that had Explosive** (`data.js`, one per chapter:
  Taint-Born Swarm Mother, Glass-Skitter Broodmother, Lecture-Bound Horror,
  Perimeter Wretch, Collapse-Bound Horror, Residual Horror) had it swapped
  1:1 for `'healing'` in their `specialties` array, keeping each boss's
  other hand-picked specialty (Swift/Magical/Colossal) unchanged — not
  confirmed with the user which bosses "should" get Healing specifically,
  so the swap was kept mechanical or a 1:1 like-for-like rather than
  reassigning specialties across bosses.
- Comments elsewhere referencing Explosive as an example specialty (the
  Abnormal-encounter-kind explanation, the `killedBy`/`lastHit` doc comment)
  were updated to reference Healing or dropped where they no longer applied
  (Explosive was the only on-death effect, so "on-death effects like
  Explosive still fire" no longer has a live example).
- Verified with `node --check` on all three script files, then a Node `vm`
  sandbox pass (`data.js`/`game.js`/`ui.js` loaded into one shared context,
  same relationship as the real `<script>` tags): confirmed `AFFIX_IDS`
  includes `healing` and not `explosive`; forced a synthetic fight with a
  `healing`-tagged creature at partial HP alongside an injured ally and
  confirmed `enemyAct` alternates between heal and attack roughly half the
  time, heals for exactly 20% of the target's max HP (clamped near full
  HP), and stops healing entirely once `healCount` reaches 10; confirmed a
  `healing` creature with no injured ally always attacks; confirmed a
  killed `healing`-tagged creature deals no on-death damage (the old
  Explosive branch is gone) and that `handleKill`'s `kill_healing` quest
  event fires from its `affixes` loop like every other specialty.

## 1.10.0 (minor)

Bug report: Advanced Class promotion showed two overlapping icons for the
replaced skill and reset that skill's rank to 0 (a maxed 10/10 Eviscerate
becoming Venomous Strike at rank 0). Also reported: multiple skills within
the same class sharing an icon. Bundled with two explicitly requested new
features: a character-version stamp checked on Continue that re-rolls a
returning character's gear, and a Sell Runes bulk-sell button.

- **Root cause of the "two icons," found in `data.js`**: every Advanced
  Class path's `active`/`ult` skill (and a few `passive3`/`passive4`s) had a
  literal 2-emoji `icon` string (e.g. `'🗡️☠️'`, `'🏹🎯'`, `'☄️💀'`) — every
  render site (`UI.renderSkills`'s `.skill-icon` div, `UI.controlsHtml`'s
  action-bar buttons) just interpolates `${s.icon}` directly, so a 2-glyph
  string always rendered as two icons side by side. Fixed by giving all 24
  path skills (8 per class × 3 classes) single-glyph icons.
- **Same pass fixed real same-class duplicates**, not just the compound
  strings: several single-glyph path-skill icons collided with a base skill
  or another path skill in the *same* class (e.g. rogue's Assassin-path
  "Exotic Mastery" reused Backstab's 🔪; rogue's own base debuff "Expose
  Weakness" reused Fan of Knives' 🎯; mage's Sorcerer-path "Overload" reused
  Spellweaver's 🌟; mage's Radiant-path "Sacred Vigil" reused Curse of
  Weakness' 🕯️). All 20 skills belonging to each class (12 base + 4 per
  Advanced Class path × 2 paths) now use a distinct icon within that class —
  verified programmatically (`node` + `vm`, loading `data.js` and checking
  `Object.values(DATA.SKILLS[cls])` for icon collisions per class), not just
  by eyeballing the list. Icons are *not* guaranteed globally unique across
  the 3 classes (e.g. warrior/rogue both keep 🗡️ on their basic attack) —
  cross-class collisions are invisible to any one character and weren't
  part of the report.
- **Root cause of the lost rank, found in `game.js`**: `c.skills` is keyed
  by skill *id*, and a path skill (`r_p_assassin_active`) has a different id
  than the base skill it replaces (`r_atk2`). `chooseAdvancedClass` (the
  path-pick handler, formerly inlined in `ui.js`'s `UI.showPathSelect` as a
  bare `G.char.advancedClass = ...; saveGame();`) never copied the old rank
  across, so the new skill always started at `c.skills[newId] || 0 = 0`,
  and `canLearn` permanently locks the old id out the moment a path is
  chosen (`classSkillFor` no longer resolves to it) — so that rank became
  permanently unreachable, not merely reset to invisible-but-recoverable.
  Fixed with a new `migrateAdvancedClassRanks()` (game.js): for every path
  skill sharing a `cat` with a base (non-path) skill — i.e. every skill that
  actually *replaces* one (`attack2`/`buff`/`debuff`/`ult`), not the brand-
  new `passive3`/`passive4` slots which have no base equivalent to inherit
  from — copies `c.skills[baseId]` into `c.skills[newId]` (capped at
  `MAX_RANK`) and deletes the now-orphaned base entry. Guarded with
  `!(c.skills[s.id] > 0)` so a second call can't clobber rank the player has
  since organically earned in the replacement (relevant once this same
  function is reused by the version-migration path below, which may re-run
  it against saves that already migrated correctly under this fix).
  `chooseAdvancedClass(pathId)` wraps `advancedClass` assignment +
  `migrateAdvancedClassRanks()` + `saveGame()` as one call; `ui.js`'s pick
  handler now just calls it instead of inlining the assignment.
- **Character version stamp + migration on Continue**, an explicit request.
  `G.char.version` is set to `DATA.VERSION` in `newGame` and re-stamped at
  the end of a new `runVersionMigration()` (game.js). The Title screen's
  Continue button is the *only* call site of `loadGame(slotIdx)` in the
  codebase, so the migration is invoked from inside `loadGame` itself
  (right before it returns) rather than duplicating a second hook at the
  UI call site — an old save with no `version` field reads as `undefined
  !== DATA.VERSION` and migrates same as any other mismatch, so this also
  covers every pre-existing save with no extra special-casing. Resolved via
  a clarifying question (reroll scope / rune scope / mismatch threshold)
  rather than guessed: **(1)** items are re-rolled at their own existing
  slot/rarity/ilvl via the same `makeItem(it.ilvl, it.rarity, c.cls,
  it.slot)` normal drops use — new random affixes/name/value, same power
  tier, not re-leveled to current progress. **(2)** Runes are re-rolled too
  (not left alone) — loose runes via `buildRune(bonusCount, ilvl)` (or the
  Mythic-tier override for a Mythic Rune), same tier/ilvl, fresh bonuses.
  Runes socketed into a re-rolled item are re-rolled the same way and
  re-socketed up to that item's *freshly rolled* socket count (independent
  of its old count) — any that no longer fit are kept as loose (already
  re-rolled) runes in inventory rather than discarded, tracked via a
  per-migration `overflowRunes` accumulator pushed onto `G.inventory` once
  at the end. **(3)** Any version mismatch triggers migration, including a
  FIX-only bump — matches the literal request over gating it to MINOR/MAJOR
  only. Skill-side migration: drops any learned skill id no longer present
  in `DATA.SKILLS[cls]` (future-proofing for a renamed/removed skill),
  reclamps any rank above a since-lowered `MAX_RANK`, then re-runs
  `migrateAdvancedClassRanks()` defensively (recovers a still-orphaned base
  rank on any save that predates the promotion fix above, including one
  that already hit the bug — the base skill's rank is still sitting under
  its old id since nothing before this fix ever deleted it). `clampVitals()`
  runs last, since re-rolled gear can change `maxHp`/`maxMana`.
- **Sell Runes button**, an explicit request. `sellMatches(kind)` (game.js)
  gained a `'runes'` kind returning every loose (`type === 'rune'`)
  inventory entry — the existing bulk-sell kinds all explicitly excluded
  runes (`i.type !== 'item' → false`), so this is additive, not a loosened
  filter; a rune currently socketed into an item isn't its own
  `G.inventory` entry and so is untouched. `sellAllOf('runes')` needed no
  changes — it was already generic over whatever `sellMatches` returns.
  `ui.js`'s `.sell-row` gained one more `data-sell="runes"` button
  alongside the existing rarity/junk/unusable buttons, reusing the same
  generic click handler (confirm dialog + toast) as every other bulk-sell
  button — no new UI logic needed.
- **Verified** via a `node`+`vm` harness (same technique the 1.9.0 session
  used when no browser was available) loading `data.js`/`game.js` into one
  sandboxed context: confirmed all 3 classes' 20 skills are icon-unique;
  drove a live `chooseAdvancedClass('assassin')` against a synthetic
  level-25 rogue with a maxed rank-10 Eviscerate and confirmed the new
  Venomous Strike inherited rank 10 while the old id's entry was gone;
  forced a version mismatch and confirmed `runVersionMigration()` re-rolled
  the equipped weapon (new uid, new name, same slot/rarity/ilvl), rerolled
  a loose ring and a loose rune (new uids), and re-stamped `char.version`;
  confirmed `sellMatches('runes')`/`sellAllOf('runes')` sell only rune-type
  entries and leave items untouched. `node --check` clean on all three
  script files. No browser/Playwright pass this round — worth a real
  rendered-pixels check next time one's available, same caveat as 1.9.0.

## 1.9.1 (fix)

Site-wide spacing/mobile-friendliness pass, prompted by "check the spacing
in all pages" + "everything should also be mobile friendly." Audited every
`UI.render*`/`UI.show*` screen (all ~36 of them) against `style.css`'s
existing breakpoints (`860px` for layout, `480px` for narrow-phone
tightening) before touching anything, then verified with a real headless
Chromium pass rather than logic-only checks (see Testing note below).

- **Real overflow bug fixed: `.subtabs`.** City hub's 4-button row
  (Blacksmith/Tavern/Enchanter/Arena) has no `flex:1`/shrink behavior
  (unlike the top-level `.tabs`), so at narrow widths it doesn't wrap or
  shrink — it just overflows. Measured 41px of horizontal page overflow at
  a 320px viewport and 1px at 360px, with "Arena" visibly clipped past the
  right edge. `.subtabs` (style.css) gained `flex-wrap: wrap` as the actual
  fix (guarantees no overflow at any width, wraps to a 2nd row instead) plus
  a `@media (max-width: 480px)` padding/font trim so it still fits on one
  row at 320px+ in practice. Same class is shared by the Tavern's Board/
  Gamble toggle and the Enchanter's 3-view toggle, both already narrow
  enough to never have hit this.
- **Preemptive overflow guards** (found by inspecting fixed-pixel-width
  layouts, then confirmed with the same browser pass) — neither of these
  showed up as *measured* overflow at the widths tested, but both sat close
  enough to the edge (worked out on paper to ~284px/~286px minimum content
  width against ~256px available at a 320px viewport) that a slightly
  longer name/number could tip them over:
  - **Battle arena `.player-row`**: `.next-action-box` (52px) +
    `.effects-grid` (72px) are both non-shrinking (`flex: 0 0 <px>`), and
    `.hero-card`'s HP/Mana/gauge bars all inherit `.bar`'s 120px
    `min-width` floor — stacked with `.player-row`'s 8px gaps, that's a
    ~284px hard minimum. New `@media (max-width: 480px)` block (style.css,
    right after `.effect-icon`) trims `.next-action-box` to 44px,
    `.effects-grid` to 60px (icons 34px->28px), `.player-row` gap to 6px,
    and specifically `.hero-card .bar`'s min-width to 90px — ~50px of
    slack, comfortably inside a 320px phone. Desktop is untouched; the
    effects-grid's 72px/34px sizing itself (a deliberate 1.7.0 legibility
    bump per CLAUDE.md) is unchanged above this breakpoint.
  - **Tavern `.dice-arena`**: two `.dice-pair`s (2x 50px dice + 6px gap
    each) plus the "vs" label and 22px gaps add up similarly. Added
    `flex-wrap: wrap` on `.dice-arena` as a guaranteed fallback, plus a
    `@media (max-width: 480px)` trim (dice 50px->40px, gaps tightened) so
    wrapping is very unlikely to actually trigger on real phones.
- **`.tabs` (main nav) had zero mobile handling** despite being the single
  most-used element in the game — 4 buttons each carrying an emoji + a full
  word ("🗺️ Adventure") at desktop padding/font-size. `flex:1` already
  keeps them equal-width and text already wraps gracefully (no
  `white-space:nowrap` was ever set), so nothing was actually broken, but
  at common phone widths the longer labels ("Adventure", "Character") were
  wrapping to 2 lines by default. New `@media (max-width:480px)` shrinks
  padding/font (style.css) so all 4 fit on one line down to ~375px, and
  degrade to a slightly taller (not broken) 2-line row only on the very
  narrowest phones instead of doing that everywhere.
- **`.results-grid` (post-battle results modal — "Battle report"/
  "Creatures slain") was a fixed 4 columns with no mobile override** —
  multi-word labels like "damage dealt" were squeezed into ~70px cells on
  a phone-width modal. New `@media (max-width:480px)` collapses it to 2
  columns (style.css), reusing the same column count `.results-grid-2`
  already uses elsewhere for a different results section.
- **Global `.hint` had no `margin-bottom`** (only `margin-top: 8px`) — any
  panel with an unconditional explanatory hint sitting directly above a
  grid/list (the Shop's wares blurb above `.inv-grid`, the Tavern's intro
  blurb above its Board/Gamble `.subtabs`, etc.) read as visually flush/
  cramped between the two, the same root cause the Enchanter panel got a
  one-off scoped fix for in 1.9.0. Generalized by changing `.hint` itself
  to `margin: 8px 0` (style.css) so every panel using it gets the same
  breathing room for free, instead of hunting down and scoping a fix to
  each panel individually. The Enchanter's own `.enchanter-panel .hint`
  override (`margin-bottom: 12px`) still applies on top where it's larger.
- **Explicitly checked and left alone**: `.two-col` already collapses to 1
  column via its existing `@media (max-width:860px)` rule, so every modal/
  panel using it (including `UI.showPlayerStats`, which forces 2 real
  columns inside a 560px-max modal on wide desktop viewports — a possible
  desktop-only tightness, not a mobile one) already stacks correctly on
  any actual phone viewport; `.class-cards`/`.slot-grid`/`.quest-board` all
  use `repeat(auto-fit, minmax(...))` and were already fully responsive
  with no changes needed; `.equip-grid`'s fixed 2 columns, `.skill-row`'s
  flex layout, and `.enemy-cards`' fixed 2x3 grid (intentionally fixed-size
  per the 1.0.0 story-rework CLAUDE.md note, so the arena never shifts
  mid-fight) were all inspected and found to already reflow their *text*
  content fine at narrow widths without any structural overflow risk.
- **Testing**: `npx playwright` in this environment resolved (network
  access is available), but the system's active Node (14.17.1 via nvm) is
  below Playwright's current minimum (18+) and switching the system's
  active Node version was out of scope for a spacing fix — installed
  `playwright@1.29.2` instead (last version supporting Node 14) scoped to
  a scratch directory only, not the repo. Ran a real headless-Chromium
  pass against `node server.js`: seeded a live character via the browser
  console (gold, inventory items/runes including 5 forced legendary-tier
  runes, an active Tavern board+quests, a started adventure) the same way
  prior CLAUDE.md-documented passes have, then swept 10 viewport widths
  (320 through 1280px) across 17 distinct screens/modals (every tab, every
  City/Enchanter/Tavern sub-view, and several modals including the results
  screen), asserting `document.documentElement.scrollWidth <=
  clientWidth` at each — 170 checks, all clean after the fixes above (the
  `.subtabs` bug was caught this way before being fixed; a first pass
  before wiring `UI.showGame()` correctly into the test harness had
  produced a false negative by silently rendering nothing, worth noting
  for next time this harness gets reused). Also visually reviewed
  screenshots at 320/375px for the battle arena, Tavern gambling den,
  Enchanter's Rune Forge, and the results modal.

## 1.9.0 (minor)

A batch of fixes/tweaks to the Enchanter, plus a new feature: the Rune
Forge. One request covering several related things in the same city
sub-tab.

- **Bugfix — Rune Carver crash after a successful forge**: `UI.doForgeRunes`
  (now `UI.doCarveRunes`, ui.js) called `forgeRunes(forgeSelected)` (now
  `carveRunes(carverSelected)`, game.js) *before* clearing the selection
  array. `carveRunes`/`forgeRunes` already ends with its own
  `saveGame(); UI.refresh()` — so that internal refresh re-rendered
  `UI.renderEnchanter` while `carverSelected` still held the uids of the 3
  runes that had just been spliced out of `G.inventory`. `renderEnchanter`
  computed `selTiers` via `runeTier(G.inventory.find(...))`, and
  `G.inventory.find` now returned `undefined` for each consumed uid —
  `runeTier(undefined)` throws, which broke `UI.refresh()` mid-render and
  left the Enchanter tab blank (only fixed by switching tabs, which forced
  a fresh, no-longer-poisoned render). Fixed by ensuring the selection
  array can no longer reference already-consumed uids by the time any
  render runs — `UI.doCarveRunes` reads the result before clearing state,
  same shape as the new Rune Forge actions below.
- **Renamed "Rune Forge" (the 3-rune merge feature) to "Rune Carver"** to
  free up the "Rune Forge" name for the new feature below. `ui.js`:
  `forgeSelected` -> `carverSelected`, `UI.toggleForgeRune` ->
  `UI.toggleCarverRune`, `UI.doForgeRunes` -> `UI.doCarveRunes`,
  `enchanterView` gained a third state (`'table' | 'carver' | 'forge'`,
  was `'table' | 'forge'`). `game.js`: `forgeRunes` -> `carveRunes`. The
  quest-progress event id emitted on a successful carve is still the
  literal string `'forge_rune'` (unchanged) — accepted "Rune Smith" Tavern
  quests store that type string in save data, so renaming the emitted
  event would have silently broken progress on any quest a player already
  had active. Only the quest's own flavor text was updated to say "Rune
  Carver" instead of "Rune Forge".
- **New: the Rune Forge** (game.js) — spend exactly 5 Elder Rune
  (legendary-tier, Mythic included since `runeTier()` already treats it as
  tier 5) runes on an item to either:
  - `forgeAddSockets(itemUid, runeUids)` — roll fresh sockets onto an item
    that has none. Eligible items are the same slot types that can ever
    roll sockets at all (`SOCKETABLE_SLOTS = ['weapon','offhand','helmet',
    'armor']`, mirroring `makeItem`'s own `rollSockets()` call sites) with
    `sockets === 0`. The count rolled is never 0 — `rollForgedSocketCount()`
    reuses `rollSockets()`'s own 60/25/10/5% (0/1/2/3) curve renormalized
    to exclude 0 (62.5/25/12.5% for 1/2/3), per an explicit answer to a
    clarifying question (guaranteed-at-least-1, weighted like natural
    drops, over a flat guaranteed-1 or a uniform 1-3 roll).
  - `forgeDestroySockets(itemUid, runeUids)` — wipes `item.runes` back to
    `[]` on an item that currently has 1+ runes socketed. Per an explicit
    answer to a clarifying question, this does NOT reduce `item.sockets`
    at all (despite "remove and destroy the sockets" reading literally
    like it should) — the sockets stay, now empty, ready to be resocketed
    differently; only the runes that were plugged into them are destroyed.
  - Both share `forgeableItems()` (equipped + inventory items, same
    `[...equippedItems(), ...G.inventory.filter(i => i.type === 'item')]`
    pool `reenchantItem`/`socketRune` already use) and
    `takeLegendaryRunePayment(uids)`, which validates exactly
    `RUNE_FORGE_COST` (5) distinct in-inventory runes all at `runeTier()
    === 5` before either action consumes them.
  - `ui.js`: new module vars `forgeItem` (selected target item uid) and
    `forgeRuneSel` (up to 5 selected payment rune uids, reusing the name
    `UI.toggleForgeRune` now that it's free), `UI.selectForgeItem`,
    `UI.doForgeAddSockets`/`UI.doForgeDestroySockets`. The Rune Forge's own
    sub-panel lists every item eligible for *either* action in one grid
    (`[...unsocketedForgeItems(), ...socketedForgeItems()]` — mutually
    exclusive by construction, no dedup needed) with a subtitle showing
    current socket state, then a second grid of only tier-5 runes to pick
    the 5-rune payment from, then both action buttons — each individually
    enabled only when the selected item and payment actually satisfy that
    specific action's preconditions.
- **Rune tier colors reworked** (`ui.js`): previously a rune's `.rarity`
  field (which still just borrows the item-rarity keys
  normal/magical/rare/epic/legendary 1:1 with its 1-5 bonus-count tier, for
  sorting purposes — see `byRarity` in `UI.renderInventory`) was rendered
  with the *item*-rarity color table directly, so Faded Runes read as flat
  grey. New `RUNE_TIER_COLOR`/`RUNE_TIER_CLASS` maps (tier -> color/
  border-class) give runes their own ladder instead: 1 (Faded) blue, 2
  (Rune) yellow, 3 (Elder Rune rare) epic purple, 4-5 (Elder Rune epic/
  legendary, Mythic included) legendary orange — the resolved reading of a
  4-color request against a 5-tier ladder was to keep the two lowest tiers
  distinct (they're the most commonly seen) and merge only the top two,
  mirroring the existing precedent that Mythic Runes already borrow
  Legendary's color rather than getting a distinct one of their own. New
  `itemColor(it)`/`itemBorderClass(it)` helpers branch on `it.type ===
  'rune'` and are now used at every call site that displays a rune's
  color/border — Inventory tab, Shop tab, `UI.showItem`/`UI.showShopItem`
  headers, the Enchantment Table's target-picker modal, the Tavern's quest
  reward-line preview, and the boss/arena results modal's reward + loot
  lists — not just the Enchanter's own grids. Items are unaffected
  (`itemColor`/`itemBorderClass` fall through to the existing
  `DATA.RARITIES`/`rar-<rarity>` behavior for `type !== 'rune'`).
- **Enchanter panel spacing + help modal** (`style.css`/`ui.js`): the
  in-page `<p class="hint">` explanatory paragraphs on the Enchantment
  Table/Rune Carver panels felt cramped once the panel started holding 3
  sub-tabs plus (for the new Rune Forge) a 2-step item+rune-payment flow —
  removed entirely and moved into a new `UI.showEnchanterHelp()` ❓ modal
  (same pattern as `UI.showAdventureHelp`/`UI.showCombatHelp`), one `<h4>`
  section per feature (Enchantment Table / Rune Carver / Rune Forge).
  New CSS scoped to `.enchanter-panel` only (the shared `.inv-grid`/
  `.inv-item`/`.forge-selected`/`.subtabs` rules are reused as-is by the
  Inventory tab and Shop, which weren't part of the complaint and were
  left untouched): more margin under `.subtabs`/`.hint`, more `.inv-grid`
  gap and `.inv-item` padding, a new `.enchanter-step` h4 style for the
  Rune Forge's "1. Choose an item" / "2. Pay 5 runes" step headers, and
  `.forge-actions` for its two action buttons.

## 1.8.0 (minor)

Hidden developer/debug console. Per the request that created it, the trigger
gesture and the actual command syntax are intentionally NOT written down
anywhere (not here, not in the in-game Changelog/help) — this entry only
notes where the plumbing lives so a future session doesn't reinvent it.

- Tab-click gesture tracked in `ui.js` (`cheatSeq` module var,
  `UI.trackCheatSequence`, wired into the `#tabs button` `onclick` in
  `UI.showGame`) opens `UI.showCheatDialog()` — a plain modal with one
  text input, submitted via `UI.submitCheatCode()` (Enter key or the
  Submit button).
- Commands are matched by regex in `submitCheatCode` and dispatch to four
  new functions at the end of `game.js`: `cheatGiveXpToLevel(target)`
  (uses the existing `gainXp`/`xpForLevel` so stat/skill points award
  normally), `cheatGoToArea(target)` (bumps `G.unlocked`/`G.area`,
  blocked while `ADV` is active, same guard the ◀/▶ level picker uses),
  `cheatFillLegendaryGear()`, and `cheatGiveRunes(count)`.
- `cheatFillLegendaryGear` needed `makeItem` (game.js) to be able to
  target a specific slot instead of always rolling one via its internal
  `roll < 0.30/0.42/0.80` thresholds — added an optional 4th `forceSlot`
  param. Every existing call site passes only 3 args, so the random-roll
  behavior for normal drops/shop stock/quest rewards is untouched; when
  forced to `'weapon'` it additionally filters to the class's 1-handed
  bases (falling back to any class-appropriate base, then any base) so
  the offhand slot stays fillable instead of landing a 2-hander that
  would preclude it. Old equipment displaced by the fill is pushed back
  into `G.inventory` rather than deleted.
- Verified via `node --check` on all three script files, then in the
  browser: performed the gesture, submitted one of each command, and
  confirmed the character sheet/inventory/journal reflected the expected
  level/area/gear/rune-count changes with no console errors.

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
