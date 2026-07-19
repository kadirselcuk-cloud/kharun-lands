// ============================================================
// KHARUN LANDS — Game Data
// ============================================================
'use strict';

const DATA = {};

DATA.VERSION = '1.10.0';

// Changelog — newest first. FIX versions = bug fixes/design-only changes,
// MINOR versions = gameplay changes, MAJOR only bumped on explicit request.
// See VERSION.md for the full dev-facing record.
DATA.CHANGELOG = [
  { v: '1.10.0', notes: [
    'Fixed Advanced Class promotion: a promoted skill (e.g. Eviscerate becoming Venomous Strike) no longer resets to rank 0 — every rank you already invested carries over to the new skill.',
    'Fixed several skill icons showing as two overlapping icons at once, and several different skills within the same class sharing the same icon — every skill your character can learn now has its own unique icon.',
    'Your character now remembers which update they last played on. If you Continue on an older character after an update, their stats and skills are re-checked and every piece of gear and every rune (worn and in your bag) is freshly re-rolled to reflect the current balance.',
    'New "Sell Runes" button in the Inventory tab, to bulk-sell every loose rune in your bag at once.',
  ] },
  { v: '1.9.1', notes: [
    'Spacing pass across every screen, with an emphasis on phones: fixed a real overflow bug where the City tab\'s Blacksmith/Tavern/Enchanter/Arena row could get cut off on narrow phones, tightened up the battle arena and the Tavern\'s dice game so they never overflow on small screens either, made the main tab bar and the post-battle results screen easier to read on mobile, and gave a few panels (the Shop among them) the same breathing room the Enchanter got last update.',
  ] },
  { v: '1.9.0', notes: [
    'New Enchanter feature: the Rune Forge. Spend 5 Elder Rune (legendary) runes on an eligible weapon/offhand/helmet/armor piece to either roll it 1-3 fresh sockets (if it has none), or destroy whatever\'s currently socketed into it so you can resocket it differently.',
    'The old "Rune Forge" (merge 3 same-tier runes into a better one) is now called the Rune Carver, to make room for the name above — nothing about how it works changed.',
    'Fixed: forging with the Rune Carver right after selecting runes could leave the Enchanter tab blank until you switched tabs and back.',
    'Rune colors now follow their own tier ladder instead of borrowing item-rarity colors: Faded Rune (blue), Rune (yellow), Elder Rune rare-tier (epic purple), Elder Rune epic/legendary-tier (legendary orange).',
    'More breathing room in the Enchanter\'s item/rune grids, and moved its explanatory text out of the page and into a new ❓ Help popup, one section per feature.',
  ] },
  { v: '1.8.0', notes: [
    'Some behind-the-scenes developer tooling — nothing player-facing.',
  ] },
  { v: '1.7.0', notes: [
    'Buff/debuff/poison skills now last longer as you rank them up, not just hit harder.',
    'Reworked Poison Weapon: both its damage and duration now scale with item level, from 2% max HP/round for 2 rounds up to 5% max HP/round for 8 rounds — a much better item level means a genuinely stronger poison, not just a slightly bigger number.',
    'The active buff/debuff icons above your hero are bigger and their round-counter is easier to read.',
    'Fixed the game title and the Prologue/Epilogue Skip/Back/Continue buttons overlapping or wrapping badly on mobile.',
  ] },
  { v: '1.6.0', notes: [
    'New city location: The Arena. Once per quest level (until you clear that quest or take on its Arena), a captured, empowered group of the level\'s own beasts awaits — either a Miniboss+Epic pair, three Epics, or six Rares, all with 50% more HP and 2 of them forced dangerous (a specialty affix). Win for gold plus a rune; lose and that level\'s Arena is gone for good, so it\'s one shot.',
  ] },
  { v: '1.5.0', notes: [
    'New city shop: the Enchanter. The Enchantment Table re-forges an item to your current level (give it a matching rune — Faded Rune for Magical, Rune for Rare, a 4-bonus Elder Rune for Epic, a 5-bonus Elder Rune for Legendary — and the rune is consumed). The Rune Forge merges 3 same-tier runes into one better rune at your current level — Tiers 1-4 have a 50% chance the runes shatter instead, but Legendary-tier runes always succeed.',
    'Tavern quest board: fixed a bug where accepting a quest would leave the board stuck below its full 8 offers until your next trip home — it now always backfills to 8.',
    '20 new Tavern quest types: socket runes, sell items, fell a chapter boss, find Epic+ items, earn gold selling, hunt specific specialty creatures (Poisonous/Frozen/Burning/Vampiric/Explosive/Golem/Charming/Regenerating/Berserk/Spectral/any Abnormal), enchant items, forge runes, cast skills, and best Sneaky Elves.',
    'Attack and enemy gauges now visibly fill toward the next round instead of snapping forward each tick.',
    'The Skills screen shows a preview of your next rank\'s effect for any skill you\'ve already learned.',
    'Healing Light now recovers 30% of Max HP at Rank 1, scaling up to 50% at Rank 10 (up from 19%-46%).',
    'Minnie\'s Sacred Vigil ward now reduces damage taken by 10% at Rank 1, scaling up to 40% at Rank 10 (up from 1%-10%).',
    'Minnie\'s class-exclusive Legendary weapons and offhands (Arcane Staff/Wand/Scepter, Arcane Orb, Spell Tome) can now roll 1-3 different bonus skill ranks (+1 to +3 each) — rarer at low levels, more common by the end of Chapter 10.',
    'Regenerating creatures can no longer heal forever — once they\'ve regenerated their own max HP worth of damage in a fight, the regeneration stops.',
    'Removed the Reflective ward. Replaced with Charming: a 50% chance each round that a charming enemy stops you from attacking or casting on your turn.',
  ] },
  { v: '1.4.3', notes: [
    'Victory/defeat results screen: items are no longer clickable, auto-sold items now show as their own "Auto-sold" summary, and the victory screen can only be dismissed with Continue (no more accidental X/backdrop closes).',
    'Fixed: items that are unusable by your class/weight sometimes weren\'t auto-sold — Tavern quest rewards and guaranteed quest-clear rewards now respect your auto-sell settings too, not just items found while adventuring.',
    'Combat Options and Auto-Use tier settings reordered to Legendary, Miniboss, Epic, Rare, Normal — most dangerous first.',
    'Blacksmith\'s restock button is bigger and now shows its gold cost right underneath instead of only in a tooltip.',
    'Moved the "potions: cooldown / skills: click to cast" reminder out of the battle arena and into the Combat Arena Help screen.',
    'Numbers under 1000 no longer show stray decimals (gold, damage, XP, counts) — only K/M/B numbers and rate stats like HP/Mana Regen keep decimal precision.',
  ] },
  { v: '1.4.2', notes: [
    'Gambling Den dice roll is now 2 dice per side instead of 1 — you roll a pair against the house\'s pair, higher total wins. Still true 50/50 odds, no house edge.',
  ] },
  { v: '1.4.1', notes: [
    'Tavern now has Board/Gamble buttons — Board (quests) shows by default, Gamble opens the Gambling Den separately instead of both sharing one long page.',
    'Dice rolls are now animated: both your die and the house\'s spin through random faces before landing on the actual result.',
  ] },
  { v: '1.4.0', notes: [
    'New Tavern Gambling Den: bet gold on a dice roll-off against the house — roll higher to double your stake, lower and lose it, tie and it\'s returned. True 50/50 odds, no house edge.',
    'Tavern quest board expanded from 6 to 8 quests at a time.',
    'Tavern rewards buffed across the board — gold and XP payouts roughly doubled.',
    'Crownsnatcher (slay a Mini Boss) and Head of the Beast (slay a Legendary) quests now reward a Rune instead of a plain item — Crownsnatcher guarantees at least a Rune, Head of the Beast guarantees at least an Elder Rune.',
    'Tavern item rewards never roll below Rare anymore, and have a growing chance to climb toward Epic/Legendary the further into the game you are.',
  ] },
  { v: '1.3.1', notes: [
    'City hub\'s Shop sub-tab is now labeled Blacksmith.',
  ] },
  { v: '1.3.0', notes: [
    'Advanced Classes: at level 25, choose one of two paths per class (e.g. Warrior -> Knight or Mercenary), each unlocking a new active + passive skill; at level 50 your path automatically evolves to its final form, unlocking a second passive and a stronger Ultimate.',
    'Major combat rebalance: fixed an armor-mitigation bug that let physical damage taken trend toward zero at higher levels; monster HP/damage and weapon damage now scale together so difficulty stays consistent through the whole game instead of trailing off.',
    'Mage reworked toward a "cast often" playstyle — lower cooldowns and mana costs across her kit.',
    'Rogue attack speed trimmed slightly; Warrior armor scaling reworked to be tanky without becoming unkillable.',
    'Tavern expanded: 6 quests on the board (was 3), up to 2 active at once (was 1), 3 new quest types, better rewards.',
    'Gold rewards from tougher enemies no longer scale in steep jumps between tiers.',
    'Poison-damage effects (Venomous Strike, Shadow Execution, poisoned weapons) now scale with the target\'s Max HP instead of a flat number, so they stay meaningful at any level.',
    'All large numbers in the UI (damage, HP, gold, etc.) now display compactly as K/M/B.',
  ] },
  { v: '1.2.3', notes: [
    'Fixed the Tavern quest progress bar, which was invisible — a column-flex layout bug (the same class of bug already fixed twice before on other bars) was collapsing it to 2px.',
    'City tab and its Tavern sub-tab now breathe (dark green highlight) whenever a Tavern quest is ready to claim.',
  ] },
  { v: '1.2.2', notes: [
    'Top bar redesigned for mobile: hero name/XP/HP/Mana now group into one box, with Gold and your inventory item count beside it.',
    'Removed the Save and Reset buttons from the top bar entirely (progress already auto-saves; delete a hero from its slot on the title screen instead) and right-aligned the remaining Help button.',
    'Removed the "+N stat"/"+N skill" text from the top bar — the Character tab\'s breathing highlight already signals unspent points.',
    'The tab breathing highlight is now dark green instead of the same gold as the active tab (easy to confuse the two before), and now breathes the tab\'s background color too, not just its text.',
  ] },
  { v: '1.2.1', notes: [
    'Unspent stat/skill points no longer show as a ⬆ icon badge next to the Character tab — the tab text now gently pulses (breathing highlight) instead.',
    'Replaced the Character tab\'s 🧍 icon with 🛡️.',
  ] },
  { v: '1.2.0', notes: [
    'Up to 5 heroes at once: the title screen is now a slot grid — Continue, 📤 Export (download as a file) or 🗑️ Delete any saved hero, and start a new one in any empty slot.',
    '📥 Import loads a previously exported character file into a free slot — handy for backing up a hero or moving them to another browser/device.',
    'Adventure page: "Local threats" moved entirely into the Bestiary, which now has a parchment/book-page look.',
    'Bestiary button now sits next to Settings/Help on the Adventure page instead of its own row.',
    'Settings/Help/Bestiary/Combat Options/Auto-Use buttons (Adventure page, Battle Arena, top bar) are now icon-only square buttons with a hover tooltip instead of icon+label.',
    'Combat Options is now a per-tier dropdown card instead of stacked radio buttons — much easier to use on mobile; Auto-Use\'s checkboxes and selects also got bigger touch targets.',
  ] },
  { v: '1.1.1', notes: [
    'Quest-start screen no longer shows "Quest N:"/"Location:" labels, just the quest name and location (icons kept) — matching the same cleanup already done in the Journal and quest-end screens.',
  ] },
  { v: '1.1.0', notes: [
    'Sneaky Elf now comes in three types — Golden (common, baseline HP/drops), Emerald and Diamond (rarer, tougher, noticeably better loot odds on both the bag-shake and kill drops).',
    'Mini Bosses now start appearing from Chapter 1\'s 3rd quest (previously the 5th); every later chapter can roll one from its very first quest.',
    'Journal and quest-end/victory text no longer show "Quest N" numbering, just the quest name; the "Sets up Quest N" hook now shows only its scene-setting sentence, capitalized.',
    'Removed the player\'s class icon from the Battle Arena hero card.',
    'Fixed Epic/Miniboss/Legendary/Elf enemy cards: their HP and attack-gauge bars were silently collapsing to the wrong size because of the same column-flex/flex:1 issue previously fixed on the hero card — heights now render correctly (thicker HP bar, thinner gauge on Epic).',
  ] },
  { v: '1.0.1', notes: [
    'Epilogue is now paged like the Prologue, with a page counter and a Skip button on its first page; Back/Continue are now the same size everywhere.',
    'The version tag is now clickable (opens the Changelog) on every pre-game screen, not just a few.',
    'Unified icons: 📖 Chapters, 🧭 Quests, 🗺️ Locations, used consistently everywhere instead of a different icon per chapter.',
    'Adventure page simplified: just the quest name (no "Quest 1:"), no more "Level X/100", clickable quest/location, and the inline help text moved into new ❓ Help buttons (Adventure page + Combat Arena).',
    '"Enemies at once" moved into a new ⚙️ Adventure Settings modal.',
    'New 🐾 Bestiary: browse a quest\'s local threats (with Rare/Epic/Miniboss stats), the wandering Sneaky Elf, and the quest boss — accessible from the Adventure page and from "The pack that got you" on defeat.',
    'New ❓ Help button (top bar) explaining the game, tabs, and Chapter/Quest/Location structure.',
    'Opening the Adventure tab now scrolls to the Battle Arena.',
    'Mobile-friendliness pass across the top bar, modals, and Combat Options/Auto-Use screens.',
  ] },
  { v: '1.0.0', notes: [
    'THE KHARUN LANDS STORY UPDATE: the entire game now follows the ten-chapter story — Prologue, Chapters 1-10 with ten Quests each, and an Epilogue. Biomes and Parts are gone; every level is now a story Quest tied 1:1 to a Location.',
    'New paged Prologue ("The Last Ward") before character selection, and all-new hero backstories for Kharun, Pars and Minnie on the character select screen.',
    'Each quest opens with its own intro + objective screen, plays out at its story location, and ends (after the boss falls) with the quest\'s closing story and a "Sets up the next quest" hook. Chapter endings and the next chapter\'s opening connect the chapters.',
    'The Journal now lists Quests: each shows its Location, the objective while in progress, and the full resolution once cleared.',
    'All monsters replaced: every quest has its own roster of story-fitting creatures, and every quest\'s final boss is the named creature from the story (Marsh Stalker, Blightwood Sentinel, the First Herald… all the way to Vorrhak itself). Boss specialties are hand-picked to match each creature.',
    'Chapter bosses (the 10th quest of each chapter) now show in dark blood-red instead of the standard Legendary color; Mini Bosses show in a lighter pinkish red. Both get a tense pulsing battle-card animation.',
  ] },
  { v: '0.9.0', notes: [
    'Journal: redesigned as one page at a time (Prologue / a chapter / Epilogue) navigated with ◀/▶, instead of one long scrolling list. Parts within a chapter are still open-close menus. Epilogue only appears once Chapter 10 is cleared (story not written yet).',
  ] },
  { v: '0.8.0', notes: [
    'Shop: added "Buy & Equip" next to Buy on any usable item — for rings this is "Buy & Equip Left"/"Buy & Equip Right", for one-handed weapons "Buy & Equip Main Hand"/"Buy & Equip Off Hand".',
  ] },
  { v: '0.7.0', notes: [
    'Battle Arena action bar: on mobile, the icon buttons no longer stretch oversized when only a few are active — capped to a consistent size, matching desktop.',
    '"Enemies at once" now goes up to 6.',
    'Mini Boss encounter chance doubled (1.5% → 3%) on the 10th part of each chapter (the boss level).',
    'The Sneaky Elf (the bag-carrying bonus encounter) has +100% HP.',
  ] },
  { v: '0.6.0', notes: [
    'Battle Arena: fixed the hero\'s HP/Mana/attack-gauge bars, which were rendering as an invisible sliver instead of a real bar.',
    'Battle Arena: potions and skills are now one row of square icon buttons above the arena instead of two separate rows below it. Each button shows its cooldown as a faded number over the icon, a caption underneath (stock count for potions, mana cost for skills), and a keyboard shortcut badge on desktop (Q/W for potions, 1-9/0 for skills).',
    'The topbar no longer stays pinned while scrolling — HP/Mana are already shown in the battle arena.',
    'Results screen: falling in battle now shows the specific hit that killed you and full stat cards (HP, damage, resistances, specialties) for every creature in that final encounter, not just names.',
    'Combat Options: "Abnormal" (any creature that independently rolled a specialty like Vampiric/Explosive) and "Miniboss" (the tier itself) are now separate, independently configurable options — they used to incorrectly share one setting.',
    'Rebalanced Explosive and Reflective, which could deal absurd damage at higher levels by scaling off the creature\'s own HP or your own damage output. Both now scale off the dungeon level\'s difficulty instead, multiplied by 1.5x/1.75x/2x for Rare/Epic/Legendary (Miniboss included in the 2x).',
    'Leveling curve overhauled again: Level 1 costs 100 XP, Level 2 costs 200 XP, and every level after that costs 60% of the sum of the previous two levels\' requirements, plus 1000.',
    'Starting the next part or chapter from the boss-victory screen now switches the Adventure tab to that level, instead of leaving you on whichever level you\'d last selected.',
  ] },
  { v: '0.5.0', notes: [
    'Creatures with a specialty (Vampiric, Explosive, etc.) now give +20% XP per specialty when killed, and roll one extra independent item-drop chance per specialty on top of their normal loot roll — a creature with 2 specialties can drop up to 3 items.',
  ] },
  { v: '0.4.0', notes: [
    'Battle Arena: replaced the two text lines under the hero (power-scroll and queued-skill indicators) with a next-action box to the hero\'s left showing what the hero will actually do next, and a buffs/debuffs icon grid to the hero\'s right (4 rows tall, adding a new column every 4 effects) with the remaining-round count overlaid on each icon.',
  ] },
  { v: '0.3.0', notes: [
    'Bugfix: Epic and Legendary encounters (and to a lesser extent Mini Bosses) could get skipped entirely on a level, because escort-pack kills were advancing the level\'s 1111-pattern position past the exact checkpoint that triggers them. Only the featured creature of a pack now advances that position — escorts are bonus kills only.',
    'Bugfix: Combat Options\' and Auto-Use\'s "Abnormal" category now also matches any regular creature that rolled a specialty (e.g. a Normal-rarity Explosive), not just true Mini Bosses.',
  ] },
  { v: '0.2.0', notes: [
    'Tavern: quest progress is now shown live, but the reward is no longer granted automatically — finish the task, then hit "Claim Reward" yourself.',
    'Tavern quest gold/XP rewards are now valued against your CURRENT chapter & part (locked in the moment the quest becomes ready), not whatever level you were on when you picked it up.',
    'Leveling curve overhauled: Level 1 costs 100 XP, Level 2 costs 300 XP, and every level after that costs 150% of the previous level\'s requirement plus 150×that level.',
  ] },
  { v: '0.1.0', notes: [
    'Inventory: added a Settings panel with per-rarity auto-sell rules (Normal/Magical/Rare/Epic/Legendary/Unusable/Everything) — matching drops are sold on the spot instead of filling your bag. Runes are never auto-sold.',
    'Runes: added Rare Rune (3 bonuses), Epic Rune (4), and Legendary Rune (5) tiers above Faded Rune/Rune, plus an ultra-rare Mythic Rune (6) as the ultimate tier.',
    '+X All Skills is now a very rare item property, as rare as Vampiric.',
    'Item comparison now works both ways: the item you’d replace shows its own better/worse stats too, plus a new "Equipping changes:" summary of the net difference.',
    'Added Combat Options: choose Pause / 1x Speed / Continue Normally for how the game reacts when a Legendary, Epic, Rare, or Abnormal (Miniboss) encounter appears.',
    'Added Auto-Use Settings: automatic health/mana potions, heal/buff/debuff/ultimate/damage skills, gated by HP or mana thresholds and (for debuff/ultimate/damage) which monster tiers are present.',
    'Added this changelog, viewable from the footer.',
  ] },
];

// ------------------------------------------------------------
// Classes
// ------------------------------------------------------------
DATA.CLASSES = {
  warrior: {
    id: 'warrior', name: 'Warrior', heroName: 'Kharun', icon: '⚔️',
    desc: 'A front-line bruiser. High Strength and Dexterity make him a wall of HP that hits like a falling tower.',
    story: 'Kharun carries the old king\'s name because his father insisted on it, the way a family keeps a promise it no longer remembers making. He knew only that his father wept when he named him, and that an unused sword hung untouched near a hearth no one spoke of. He became a soldier because it was expected of a name like his, an officer because he was good at it, and a broken man the night the friend who\'d marched at his side for a decade — a man who had saved his life twice — sold his unit to slaughter for reasons Kharun never got to ask. Kharun survived. His men did not. He deserted before dawn and has spent every year since selling his sword to whoever pays, drinking to forget a face he still sees when it rains. He does not know that the betrayal which broke him wears the same shape as the one that broke a king three centuries before him — down to the trusted hand that swung the blade. He only knows the old family name has always felt heavier than a name should.',
    playstyle: 'Play Kharun if you want to survive mistakes: the deepest HP pool, heavy armor, stuns, and damage reduction. He grinds through packs slowly but almost never dies.',
    baseStats: { str: 11, dex: 9, int: 5 },   // total 25, min 5
    mainStat: 'str',
    armorWeights: ['heavy', 'medium', 'light'],
  },
  rogue: {
    id: 'rogue', name: 'Rogue', heroName: 'Pars', icon: '🗡️',
    desc: 'A blur of blades. Highest Dexterity, solid Strength — strikes fast, dodges often, and bleeds enemies dry.',
    story: 'Pars grew up with no name until an orphanage gave him one. He never knew he had been carried there as an infant, wrapped in a cloak too fine for a foundling, by people who vanished into the night and never came back for him. The streets raised him properly cruel; the thieves\' guild found him young and useful. Clever, fast, expendable — which is exactly why they kept handing him the jobs no one returns from. Six times he was sent to die. Six times he came back. The seventh time, his masters stopped calling it bad luck and put a knife to his throat instead. He ran with three inches of steel-scar to prove it and hasn\'t stopped running since. He does not know why the guild wanted him dead so patiently, across six separate impossible missions, instead of simply killing him in his sleep. He does not know what runs in his veins that they were so carefully trying to spill.',
    playstyle: 'Play Pars if you want tempo: the highest Speed means extra actions every round, high Evasion turns hits into misses, and resistance-piercing strikes shred tough enemies. Fast, slippery, and lethal — but thinner armor punishes bad odds.',
    baseStats: { str: 8, dex: 12, int: 5 },
    mainStat: 'dex',
    armorWeights: ['medium', 'light'],
  },
  mage: {
    id: 'mage', name: 'Mage', heroName: 'Minnie', icon: '🔮',
    desc: 'A glass cannon of raw Intelligence. Fragile, but with a deep pool of mana and devastating spells.',
    story: 'Minnie trained at the Academy of Aldergate from the age of nine, raised on the promise that magic was a ladder out of a hard childhood into something that mattered. It mattered more than she ever wanted it to. One of her own masters — trusted, senior, beloved — had been cultivating a bargain for years, and the night it came due, he opened a door beneath the academy that should have stayed shut until the end of the world. The masters who caught the mistake in time did the only thing left to them: sealed the lower halls with themselves inside, buying everyone above ground time by spending their own lives against it. Minnie was topside gathering components when the wards slammed shut. She has spent the months since alone, half-trained, hunting for anyone desperate or skilled enough to help her break back in and finish what her masters started — kill the thing they died to contain, or reach them before there\'s nothing left to reach.',
    playstyle: 'Play Minnie if you want raw power: the biggest hits in the game, huge mana reserves, the strongest heal, and area spells that erase whole packs. Magic damage ignores armor entirely — but her low HP means the best defense is a dead enemy.',
    baseStats: { str: 5, dex: 7, int: 13 },
    mainStat: 'int',
    armorWeights: ['light'],
  },
};

// ------------------------------------------------------------
// Advanced Classes — at level 25 the player picks one of two paths per
// base class; at level 50 that path automatically evolves to its tier-3
// name (see className() in game.js — tier-3 is a pure function of
// (advancedClass, level), no extra saved field). Each path unlocks 4 new
// skills (see DATA.SKILLS' path-tagged entries): a level-25 active +
// passive, and a level-50 passive + Ultimate.
// ------------------------------------------------------------
DATA.ADVANCED_PATHS = {
  warrior: [
    { id: 'knight', tier2Name: 'Knight', tier3Name: 'Paladin', icon: '🛡️',
      focus: 'Protection & Armor',
      desc: 'Sworn to protect: heavier armor, damage reduction, and self-healing wards make you almost impossible to bring down.' },
    { id: 'mercenary', tier2Name: 'Mercenary', tier3Name: 'Warlord', icon: '⚔️',
      focus: 'Damage & Disability',
      desc: 'A brutal battlefield controller: crippling strikes, crowd control, and rising damage against wounded prey.' },
  ],
  rogue: [
    { id: 'assassin', tier2Name: 'Assassin', tier3Name: 'Ninja', icon: '🥷',
      focus: 'Dagger, Exotic Weapons & Poison',
      desc: 'A master of exotic blades and toxins: every strike can crit, double, and poison whatever it touches.' },
    { id: 'hunter', tier2Name: 'Hunter', tier3Name: 'Sniper', icon: '🏹',
      focus: 'Bows, Crossbows & Ranged Damage',
      desc: 'A precision marksman: devastating critical shots from range, with the speed and evasion to stay untouched.' },
  ],
  mage: [
    { id: 'sorcerer', tier2Name: 'Sorcerer', tier3Name: 'Archmage', icon: '☄️',
      focus: 'Magic Damage',
      desc: 'Raw arcane power distilled into ever-larger spells that shred through magic resistance.' },
    { id: 'radiant', tier2Name: 'Radiant', tier3Name: 'Archon', icon: '🌟',
      focus: 'Protection, Healing, Crowd Control & AOE',
      desc: 'A holy caster: radiant wards, weakening light, and area magic that protects as much as it destroys.' },
  ],
};

// Opening-screen prologue, shown once before the hero is chosen.
// Paged: each page is one context-block of the story, stepped through
// with a Continue button. The Journal's Prologue page shows all pages.
DATA.PRELUDE = {
  title: 'The Last Ward',
  pages: [
    { title: 'The Builder of Borders', paragraphs: [
      'They called him a builder of borders, back when the lands had none worth the name.',
      'Before Kharun the First, there was no Kharun-lands — only a scattering of river-holds and hill-clans who raided each other over grazing rights while worse things watched from the dark places between their villages. Kharun was born to a minor hill-lord, not a king, and it was said he first picked up a blade not to conquer but to end a blood-feud that had cost his village three winters running. He was seventeen when he ended it without killing the men who started it — a mercy that earned him more loyalty than any victory could have.',
      'That was the shape of him for the whole of his rise. He did not unite the lands by breaking the clans beneath him. He did it by standing between them and the things that preyed on all of them equally — beasts out of the deep marsh, raiders from the cold coast, and worse, half-remembered horrors that older folk still warned their children about after dark. Village by village, hold by hold, he gave people a reason to stand together instead of alone, and in the standing together they stopped being river-holds and hill-clans and started being something that needed a name. They gave it his. Not because he demanded it — by every account he refused it twice — but because there was no other name that fit what he\'d built.',
      'For thirty years the Kharun-lands knew a peace that older generations swore couldn\'t last, the kind of peace that lets people forget why they needed a king who could fight at all. Cities grew where there had been camps. Roads connected holds that used to send raiding parties instead of trade caravans. And Kharun, gray now and slower with old wounds, spent less time on the border and more time in a capital built on the promise that the border would hold without him standing on it personally.',
    ] },
    { title: 'The Friend at Court', paragraphs: [
      'That was the mistake. Not weakness — trust.',
      'It came to him wearing a friend\'s face, because that is how it always comes. A voice at court that had been at his side since before either of them commanded anything larger than a village guard, a man who had bled beside him on three separate battlefields and never once asked for more reward than the king\'s company. That man had found older rites in older ruins than either of them knew existed, and had been feeding something in the dark for years before Kharun ever noticed the taste in the air had changed.',
      'By the time the king understood what Vorrhak was, it already wore half his court like a second skin.',
      'He learned it too late to stop it, and almost too late to answer it.',
      'It was the mages first — three of the seven who sat his council, found one gray dawn arranging candles in patterns that hadn\'t been drawn on Kharun-lands soil in centuries. Then it was a garrison commander on the eastern border, found standing over his own men with a blade still wet and no memory of the hour before, weeping that his hands had moved without him. Kharun purged what he could find and knew, even as he did it, that he was cutting at smoke — that whatever this was had roots he couldn\'t see, wearing faces he trusted too much to suspect.',
      'He was right not to trust his own judgment. He simply didn\'t know how right.',
    ] },
    { title: 'The Last Ward', paragraphs: [
      'The man who had stood at his shoulder since they were boys — who had carried him bleeding off two battlefields, who had turned down titles and lands a dozen times because he said serving beside Kharun was reward enough — had been Vorrhak\'s first and deepest foothold, longer than either of them had been men grown. Not corrupted in a season. Cultivated across a lifetime, patient the way only something that has waited in the dark for centuries can be patient, until the day it needed a hand close enough to the king\'s own back to make sure the killing stroke would land.',
      'It came on the night the border-forts were meant to seal — a working thirty years in the planning, meant to draw a line of warded stone the length of the kingdom and shut every crack Vorrhak might still be using to breathe into the world. Kharun stood at the center of it, because the rite needed a king\'s blood freely given to anchor a working that size, a small cut and a small price for a wall that would hold for generations.',
      'He never finished giving it willingly. The knife came from behind, from the one place he\'d never thought to guard, and it did not kill him — it was never meant to. It was meant to spill his blood wrong, unwilling, corrupted at the moment of the working, so that the wall he was building would open a door instead of closing one.',
      'It very nearly worked.',
      'What saved the world that night was not strength. It was that Kharun, dying, understood in the last seconds what was happening to his own working, and instead of fighting to close the wall as planned, he tore the rite open and rebuilt it around himself in the space of a breath — no longer a border thirty miles long, but a single point, a single seal, small enough to hold with what little of him was left. He gave the rite everything a dying man had to give. The border-wall never rose. But Vorrhak, a heartbeat from walking whole into the world through a king\'s own blood, was instead slammed back into the dark it came from, sealed behind a door with no lock but a dead man\'s will.',
      'The friend who\'d held the knife was found at dawn with no memory of the night, weeping over the body, and no one — not the court, not the histories, not even the man himself — ever fully agreed on whether he had been himself when he did it, or whether that mercy was the last cruelty Vorrhak left behind on its way back into the dark.',
      'The lands kept the name Kharun. The throne stood empty in ceremony for a year before a regent was found. And three hundred years of kings, wars, and quiet peacetime later, no living soul remembered that the name was also a wound that had never fully closed — only thinned, year over year, waiting.',
    ] },
    { title: 'Three Roads to Reedmarsh', paragraphs: [
      'None of that history means anything yet to the three people about to meet in a border village called Reedmarsh. Not to Kharun, deserter and mercenary, who carries the old king\'s name like a weight he was never told the shape of. Not to Pars, thief in hiding, who doesn\'t know why a guild patient enough to try killing him six separate ways wanted his blood so badly. And not to Minnie, mage and last of her order still free, who only knows that something ancient is loose again and that her masters bought her time to stop it with their own lives, the same way a king bought the world time with his three hundred years before.',
      'They arrive at Reedmarsh from three different roads, for three different reasons, on the same gray afternoon — drawn, though none of them would call it that, toward the same unfinished debt.',
      'None of the three know each other\'s names yet. They will, by nightfall, in a border village called Reedmarsh, where something with too many joints has been dragging itself out of the marsh at the edge of town, and the local militia has been dead for three days.',
    ] },
  ],
};

// Epilogue — shown as a full-screen page after Chapter 10's ending, and
// as the Journal's final page once level 100 is cleared. `sections` are
// short titled blocks ("What Came After" for each hero).
DATA.EPILOGUE = {
  title: 'What Came After',
  sections: [
    { h: 'Kharun', paragraphs: [
      'He didn\'t take the throne. No one expected him to, least of all himself — three hundred years is too long a gap for a crown to mean anything but a target on his back, and he\'d spent his whole life running from responsibility he didn\'t ask for. But he didn\'t vanish back into mercenary work either. He went to Fallcrest first, of all places, and with what little coin and reputation the journey had earned him, began rebuilding it — not as a fortress, but as a waystation, open to travelers, garrisoned by volunteers instead of bound soldiers. He hung Aldric\'s old journal on the wall of the rebuilt commander\'s quarters, not as a monument to betrayal, but as a reminder that even the worst debts can end in mercy. He still drinks sometimes when it rains. But the face he sees now isn\'t Aldric\'s anymore. It\'s just rain.',
    ] },
    { h: 'Pars', paragraphs: [
      'He went looking for what was left of his family — the ones who saved him once by giving him away — and found less than he hoped and more than he feared: a branch of the old noble line, thinned and quiet, living under a different name in a farming town two weeks from the old capital. They didn\'t know what to make of a grown man with a thief\'s calluses and a king\'s blood showing up at their door. It took months before anyone called him family instead of "the visitor." He didn\'t stay — old habits and a restless conscience pulled him back to the road — but he goes back every year now, same season, and the visits get a little longer each time. He never rejoined a guild. He started training strays instead — orphans, mostly, the way he wished someone had trained him before the guild found him first.',
    ] },
    { h: 'Minnie', paragraphs: [
      'She stayed at Aldergate through the long, slow work of rebuilding — new wards to replace the failed ones, new students to replace the empty halls, and a faculty of six tired, grateful masters who insisted, over her every objection, on calling her the academy\'s youngest instructor before she felt remotely ready for the title. Corwin retired within the year, worn thin by decades he\'d rather not have survived, but he lived to see the first new class of students walk through gates that no longer hummed with anything but ordinary magic. Minnie kept the scrying-focus from the lighthouse in Vesk on her desk, not as a trophy, but as a reminder of how close everything came to being lost — and how much luck, as much as skill, had carried three strangers through it.',
    ] },
    { h: 'Kage, Xazel, J.R., and Begum', paragraphs: [
      'J.R.\'s ballad about the fall of Fallcrest Keep spread faster and further than any of them expected — bards in three different cities were performing versions of it within the year, most of them wildly, gloriously exaggerated. Kage used the coin from it to found a small mercenary company of his own, more disciplined and considerably less reckless than the one that nearly got him crushed under a collapsing tower. Xazel returned to healing work in earnest, quietly becoming known across several provinces as the cleric who never turns away a patient who can\'t pay. Begum never did stop scouting horizons — she still sends word, occasionally, whenever a job takes her near enough to Fallcrest to swing by and needle Kharun about the state of his gate defenses.',
    ] },
    { h: 'The Kharun-Lands', paragraphs: [
      'The old capital was never fully rebuilt, but it was no longer avoided, either — scholars and pilgrims began making the journey, drawn by Minnie\'s academy records and the slowly spreading story of what happened in that crypt. No one crowned a new king. There wasn\'t one to crown, and by unspoken agreement among the three who closed the debt, that seemed right. Some things are better left as history than inherited as burden.',
      'The wound the old king died to close is finally, fully healed. What grew in its place — three unlikely companions who arrived as strangers and left as something closer to family — was never part of any prophecy. It was just what happened when a debt three centuries old finally, properly, came due.',
    ] },
  ],
};

// The game's 10 story chapters, one per 10 levels. A level IS a quest:
// level 1 = Chapter 1 Quest 1, level 100 = Chapter 10 Quest 10. Each
// quest is tied 1:1 to a Location, carries its own creature roster,
// and ends with a Legendary boss named after the story's creature for
// that quest. Quest text fields:
//   intro    — paragraphs shown when the quest starts (before the objective)
//   objective— one sentence, shown while the quest is in progress
//   outro    — paragraphs revealed only after the quest is cleared
//   setup    — the "Sets up Quest N: …" hook, shown as its own final
//              paragraph after clearing (null on a chapter's 10th quest —
//              the chapter `ending` takes over there)
DATA.CHAPTERS = [
{ // ================= CHAPTER 1 =================
  num: 1, title: 'Chapter 1: Reedmarsh Outskirts', icon: '🐸', shopName: 'Reedmarsh Village Market',
  headline: 'Something with too many joints has been dragging itself out of the marsh, and the militia has been dead for three days.',
  story: [
    'The road into Reedmarsh is lined with empty fence-posts and fields gone to seed, the kind of quiet that isn\'t peace but absence. Kharun arrives first, drawn by a mercenary contract nailed to a tavern board three towns back — coin for monster-work, ask for the headman. Pars slips in an hour behind him, using the chaos of a frightened village to vanish from the guild scouts one day behind on his trail. Minnie arrives last, on foot, having heard from a passing trader that something crawling out of Reedmarsh\'s marshes matched descriptions in her master\'s old bestiary notes — something that shouldn\'t exist anymore.',
    'The headman is too relieved to question three armed strangers arriving the same day. He tells them straight: the marsh has always had its stories, but three days ago something answered them. The militia went in. Nothing came out but their weapons, floating.',
  ],
  ending: [
    'With the Regent dead, the marsh\'s taint recedes for the first time in living memory — the village will heal. But the three of them stand over a drowned crown far too old to belong to any local lord, and Minnie is the one who finally says what all three have been circling: this isn\'t a haunted marsh. This was an outpost. A guard-post on a border that hasn\'t existed in three centuries, maintained — badly, and failing — against something that was never fully destroyed.',
    'Pars, searching the Regent\'s remains for anything sellable out of old habit, instead finds a signet ring that makes his blood run cold for reasons he can\'t explain. Kharun recognizes the crest on it immediately: it\'s his own family\'s mark, older and cruder than the version worn on his father\'s ring at home.',
    'Before anyone can ask the obvious question, hoofbeats and shouting rise from the village behind them — armed riders in unfamiliar colors, asking specifically for a thief matching Pars\'s description, last seen in these parts.',
    'The Reedmarsh chapter closes not with rest, but with all three of them realizing, in the same breath, that they need to run — into the one place riders like these won\'t easily follow: the smugglers\' dark of Blackthorn Forest.',
  ],
  rareA: ['Marsh', 'Silt', 'Reed', 'Bog', 'Rot', 'Ward', 'Drowned', 'Mire'],
  rareB: ['Stalker', 'Creeper', 'Gnawer', 'Lurker', 'Whisperer', 'Feeder', 'Crawler', 'Watcher'],
  eliteTitles: ['the Marsh-Woken', 'the Seal-Breaker', 'the Silt Horror', 'the Drowned Terror',
                'the Ward-Eater', 'the Reed Shadow', 'the Black-Blooded', 'the Threshold Haunt'],
  quests: [
    { name: 'What the Marsh Woke', location: 'The Sunken Path',
      intro: ['The group is asked to find the militia\'s last patrol route and learn what killed them before it reaches the village proper. Following boot-prints that turn to drag-marks, they find the trail ends at a bloated, many-jointed Marsh Stalker nesting in the reeds — bigger than any natural thing should grow, its joints clicking wrong.'],
      objective: 'Track the patrol route and kill whatever ended it.',
      outro: ['When it dies, its blood smokes black and wrong, and beneath its nest they find a broken militia sigil scratched with symbols none of them recognize — except Minnie, whose face goes pale.'],
      setup: 'Sets up Quest 2: the symbol matches something in the academy\'s forbidden texts.',
      boss: { name: 'Marsh Stalker', attack: 'Jointed Lunge', atkType: 'poison', res: { phys: 25, magic: 10, poison: 50 }, hp: 1.2, dmg: 1.2, spd: 1.2, specialties: ['poisonous', 'swift'] },
      creatures: [
        { name: 'Reed Skulker', attack: 'Raking Claws', atkType: 'phys', res: { phys: 10, magic: 0, poison: 20 }, hp: 0.9, dmg: 1.1, spd: 1.2 },
        { name: 'Bloated Silt-Leech', attack: 'Blood Drain', atkType: 'poison', res: { phys: 5, magic: 0, poison: 55 }, hp: 1.2, dmg: 0.9, spd: 0.8 },
        { name: 'Drowned Militiaman', attack: 'Waterlogged Blade', atkType: 'phys', res: { phys: 30, magic: 5, poison: 60 }, hp: 1.3, dmg: 1.0, spd: 0.7 },
      ] },
    { name: 'The Old Marker', location: 'The Boundary Stones',
      intro: ['Minnie recognizes the scratched symbol as a ward-glyph — old, degraded, meant to keep something in, not out. She says there should be more, forming a perimeter.'],
      objective: 'Locate and inspect the boundary stones ringing the marsh before whatever broke the first one reaches another.',
      outro: ['They find three more stones, two cracked, one shattered entirely, guarded by a corrupted Bogwretch feeding on the leaking magic. Killing it stabilizes the nearest stone, but not before they see it happening — the crack isn\'t age. Something is deliberately breaking them from below.'],
      setup: 'Sets up Quest 3: something is doing this on purpose, and it\'s still down there.',
      boss: { name: 'Bogwretch', attack: 'Glyph-Fed Slam', atkType: 'magic', res: { phys: 20, magic: 40, poison: 50 }, hp: 1.3, dmg: 1.1, spd: 0.9, specialties: ['magical', 'regen'] },
      creatures: [
        { name: 'Ward-Gnawer', attack: 'Stone-Cracking Bite', atkType: 'phys', res: { phys: 25, magic: 10, poison: 30 }, hp: 1.0, dmg: 1.0, spd: 1.0 },
        { name: 'Leak-Drawn Wisp', attack: 'Magic Discharge', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
        { name: 'Mire Creeper', attack: 'Dragging Tendrils', atkType: 'phys', res: { phys: 15, magic: 5, poison: 40 }, hp: 1.1, dmg: 1.0, spd: 0.9 },
      ] },
    { name: 'Voice in the Silt', location: 'The Drowned Shrine',
      intro: ['A half-submerged shrine at the marsh\'s center, older than the village itself, is the source of the corruption. Villagers avoid it out of superstition; the group now knows the superstition was a warning.'],
      objective: 'Reach the shrine and confront whatever is animating the corruption from within.',
      outro: ['Inside, they find no demon — only a Silt-Bound Wraith, a militia captain\'s soul twisted by whatever the stalker\'s bite carried, still trying to warn them in a voice made of bubbles and rot before it attacks out of pure agony. Killing it is a mercy. It gestures, dying, toward deeper water.'],
      setup: 'Sets up Quest 4: something worse lives deeper in the marsh than the shrine.',
      boss: { name: 'Silt-Bound Wraith', attack: 'Wail of Bubbles and Rot', atkType: 'magic', res: { phys: 50, magic: 30, poison: 70 }, hp: 1.0, dmg: 1.3, spd: 1.1, specialties: ['spectral', 'cursed'] },
      creatures: [
        { name: 'Shrine Haunt', attack: 'Chill Grasp', atkType: 'magic', res: { phys: 50, magic: 25, poison: 70 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
        { name: 'Silt Grasper', attack: 'Choking Pull', atkType: 'phys', res: { phys: 20, magic: 5, poison: 45 }, hp: 1.1, dmg: 1.1, spd: 0.8 },
        { name: 'Rot-Bubble Sprite', attack: 'Fetid Burst', atkType: 'poison', res: { phys: 5, magic: 15, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
      ] },
    { name: 'The Deep Current', location: 'Blackwater Channel',
      intro: ['Following the wraith\'s last gesture, the group finds a channel too deep and too still for a marsh this shallow — clearly unnatural.'],
      objective: 'Navigate the channel and identify what\'s using it as a lair.',
      outro: ['A Channel-Eel Broodmother, swollen unnaturally large, has been laying corrupted spawn in the old rite-water. Killing her and burning the nest buys the village real safety for the first time in days — but reveals, beneath her lair, an old submerged stairway leading down, older than the marsh, older than the village.'],
      setup: 'Sets up Quest 5: someone built something down there, long before Reedmarsh existed.',
      boss: { name: 'Channel-Eel Broodmother', attack: 'Tail Sweep', atkType: 'phys', res: { phys: 30, magic: 15, poison: 45 }, hp: 1.5, dmg: 1.1, spd: 0.8, specialties: ['colossal', 'regen'] },
      creatures: [
        { name: 'Corrupted Eel-Spawn', attack: 'Needle Fangs', atkType: 'phys', res: { phys: 10, magic: 5, poison: 35 }, hp: 0.7, dmg: 1.1, spd: 1.4 },
        { name: 'Blackwater Snapper', attack: 'Crushing Jaws', atkType: 'phys', res: { phys: 30, magic: 0, poison: 25 }, hp: 1.3, dmg: 1.2, spd: 0.7 },
        { name: 'Depth Light', attack: 'Luring Flash', atkType: 'magic', res: { phys: 35, magic: 30, poison: 55 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
      ] },
    { name: 'The Sunken Threshold', location: 'The Buried Stair',
      intro: ['The stairway leads to a flooded antechamber, clearly pre-dating any local architecture — old Kharun-era stonework, cracked and drowned.'],
      objective: 'Clear the antechamber of whatever has nested in it and reach the sealed door beyond.',
      outro: ['A Stone-Warped Ooze, born from centuries of leaking corrupt magic fusing with mineral and moss, blocks the only dry ground. Defeating it lets them reach the door — sealed with the same ward-glyphs as the boundary stones, this time whole, and unmistakably royal in make.'],
      setup: 'Sets up Quest 6: this isn\'t just a haunted marsh — it\'s a threshold someone built on purpose, and it\'s old Kharun work.',
      boss: { name: 'Stone-Warped Ooze', attack: 'Corroding Crush', atkType: 'poison', res: { phys: 40, magic: 20, poison: 70 }, hp: 1.5, dmg: 1.0, spd: 0.6, specialties: ['golem', 'corrosive'] },
      creatures: [
        { name: 'Moss-Fused Crab', attack: 'Stone Pincers', atkType: 'phys', res: { phys: 45, magic: 5, poison: 60 }, hp: 1.4, dmg: 0.9, spd: 0.6 },
        { name: 'Stairwell Slime', attack: 'Acid Splash', atkType: 'poison', res: { phys: 20, magic: 25, poison: 70 }, hp: 1.1, dmg: 1.0, spd: 0.7 },
        { name: 'Drowned Rat Pack', attack: 'Frenzied Bites', atkType: 'phys', res: { phys: 5, magic: 0, poison: 30 }, hp: 0.7, dmg: 1.0, spd: 1.4 },
      ] },
    { name: 'What the Wards Held', location: 'The Antechamber Vault',
      intro: ['Minnie identifies the door\'s warding as pre-Kharun consolidation — meaning someone sealed something here before the kingdom even had that name.'],
      objective: 'Force the vault door and deal with whatever the seal was built to contain, now weakening.',
      outro: ['Inside, a Warded Husk — the animated, rotted remains of whatever creature was originally imprisoned here, now half-freed by three hundred years of neglect — attacks the instant the door breaks. It\'s the hardest fight yet. Its death releases a final pulse of old magic, and for the first time, all three of them feel it: recognition, low and cold, like something enormous noticing they exist.'],
      setup: 'Sets up Quest 7: they are no longer investigating a local haunting. Something is aware of them now.',
      boss: { name: 'Warded Husk', attack: 'Three-Century Grip', atkType: 'phys', res: { phys: 40, magic: 30, poison: 70 }, hp: 1.4, dmg: 1.2, spd: 0.9, specialties: ['resistant', 'necrotic'] },
      creatures: [
        { name: 'Vault Mite', attack: 'Chitin Snip', atkType: 'phys', res: { phys: 25, magic: 10, poison: 40 }, hp: 0.8, dmg: 1.0, spd: 1.2 },
        { name: 'Seal-Leech Wisp', attack: 'Ward-Drain', atkType: 'magic', res: { phys: 45, magic: 35, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
        { name: 'Rotted Guardling', attack: 'Ancient Halberd', atkType: 'phys', res: { phys: 35, magic: 15, poison: 65 }, hp: 1.3, dmg: 1.1, spd: 0.7 },
      ] },
    { name: 'Marked', location: 'The Reed Flats',
      intro: ['Whatever noticed them in the vault has sent something to look closer.'],
      objective: 'Survive and repel the first direct hunter sent after the group, out in the open flats where there\'s nowhere to hide.',
      outro: ['A Hollow Seeker — fast, humanoid, wrong in the joints like the marsh stalker but purposeful instead of feral — nearly kills Pars before the group brings it down together for the first time as something like a team. Its corpse dissolves before they can question it, but not before Kharun notices its blade bears a smith-mark he hasn\'t seen since his old unit.'],
      setup: 'Sets up Quest 8: this connects to Kharun\'s past, not just the ruins.',
      boss: { name: 'Hollow Seeker', attack: 'Wrong-Jointed Blade', atkType: 'phys', res: { phys: 25, magic: 25, poison: 40 }, hp: 1.1, dmg: 1.3, spd: 1.4, specialties: ['swift', 'evasive'] },
      creatures: [
        { name: 'Flats Prowler', attack: 'Low Lunge', atkType: 'phys', res: { phys: 10, magic: 5, poison: 15 }, hp: 0.9, dmg: 1.1, spd: 1.3 },
        { name: 'Carrion Crow Swarm', attack: 'Pecking Cloud', atkType: 'phys', res: { phys: 0, magic: 10, poison: 20 }, hp: 0.6, dmg: 1.0, spd: 1.5 },
        { name: 'Reed-Blind Hound', attack: 'Scenting Bite', atkType: 'phys', res: { phys: 15, magic: 0, poison: 10 }, hp: 1.0, dmg: 1.2, spd: 1.2 },
      ] },
    { name: 'The Smith-Mark', location: 'The Abandoned Forge Camp',
      intro: ['The smith-mark leads to a burned-out mercenary way-camp nearby — one Kharun half-recognizes from his deserting years.'],
      objective: 'Search the camp for answers about who\'s been arming these hunters, and clear whatever\'s denned there now.',
      outro: ['They find a nest of Corrupted Camp-Wolves, once ordinary scavengers twisted by lingering taint, guarding a chest of matching weapons — clearly a supply cache, recently used, recently abandoned in a hurry. A ledger inside names no one, but the handwriting means something to Kharun. It\'s a hand he hasn\'t seen in twenty years.'],
      setup: 'Sets up Quest 9: someone from Kharun\'s old life is closer than he thought.',
      boss: { name: 'Corrupted Camp-Wolf Alpha', attack: 'Pack-Leader\'s Maul', atkType: 'phys', res: { phys: 20, magic: 10, poison: 30 }, hp: 1.2, dmg: 1.3, spd: 1.2, specialties: ['enraged', 'swift'] },
      creatures: [
        { name: 'Camp-Wolf', attack: 'Savage Bite', atkType: 'phys', res: { phys: 10, magic: 0, poison: 10 }, hp: 0.9, dmg: 1.1, spd: 1.2 },
        { name: 'Taint-Rat Scavenger', attack: 'Diseased Nip', atkType: 'poison', res: { phys: 5, magic: 0, poison: 50 }, hp: 0.7, dmg: 1.0, spd: 1.3 },
        { name: 'Cinder-Haunt', attack: 'Ashen Grasp', atkType: 'magic', res: { phys: 40, magic: 25, poison: 55 }, hp: 0.8, dmg: 1.2, spd: 1.0 },
      ] },
    { name: 'The Watcher on the Ridge', location: 'Reedmarsh Ridge',
      intro: ['A silhouette has been seen on the high ridge above the village for two nights running, watching, not approaching.'],
      objective: 'Climb the ridge and confront whoever — or whatever — has been observing the group\'s every move since the vault.',
      outro: ['It\'s not a person. It\'s a Ridgeborn Sentinel, a construct-creature grown from the same corruption as everything below, built and tasked specifically to watch and report. Destroying it triggers a final psychic backlash — a vision, brief and shared by all three, of a marsh three hundred years younger, a king\'s border-wall, and a knife in the dark.'],
      setup: 'Sets up Quest 10: the chapter\'s true threat reveals itself, drawn by the sentinel\'s destruction.',
      boss: { name: 'Ridgeborn Sentinel', attack: 'Reporting Pulse', atkType: 'magic', res: { phys: 45, magic: 35, poison: 70 }, hp: 1.4, dmg: 1.2, spd: 0.9, specialties: ['golem', 'charm'] },
      creatures: [
        { name: 'Ridge Creeper', attack: 'Scuttling Slash', atkType: 'phys', res: { phys: 20, magic: 10, poison: 35 }, hp: 1.0, dmg: 1.0, spd: 1.1 },
        { name: 'Watching Eye', attack: 'Focused Beam', atkType: 'magic', res: { phys: 30, magic: 40, poison: 50 }, hp: 0.8, dmg: 1.3, spd: 1.0 },
        { name: 'Scree Hound', attack: 'Rockfall Pounce', atkType: 'phys', res: { phys: 25, magic: 5, poison: 20 }, hp: 1.1, dmg: 1.1, spd: 1.1 },
      ] },
    { name: 'What the Marsh Remembers', location: 'The Heart-Marsh',
      intro: ['Destroying the sentinel wakes the thing that built it: the true source of Reedmarsh\'s corruption, an ancient guardian-turned-abomination that has festered at the marsh\'s deepest point since the original seal first cracked — the Marshbound Regent, a bloated, crowned horror wearing the drowned rot of old ceremonial armor, still standing sentinel over a threshold it no longer understands it\'s failing to guard.'],
      objective: 'Descend to the Heart-Marsh and destroy the Regent before it fully breaks the last seal beneath Reedmarsh.',
      outro: ['The fight is brutal, unlike anything before it in this chapter — the Regent commands the corrupted marsh itself, flooding the fight with lesser horrors even as it\'s cut down. In its dying moments, it speaks — not madness, but a fragment of memory not its own: "...my king... I couldn\'t stop the blood..." — and collapses into rot, its crown rolling free to reveal make and craft three hundred years old.'],
      setup: null,
      boss: { name: 'Marshbound Regent', attack: 'Command the Rot-Tide', atkType: 'magic', res: { phys: 35, magic: 35, poison: 60 }, hp: 1.6, dmg: 1.3, spd: 0.8, specialties: ['colossal', 'necrotic'] },
      creatures: [
        { name: 'Heart-Marsh Horror', attack: 'Drowning Grasp', atkType: 'phys', res: { phys: 25, magic: 15, poison: 50 }, hp: 1.2, dmg: 1.1, spd: 0.9 },
        { name: 'Crowned Drownling', attack: 'Rusted Ceremonial Blade', atkType: 'phys', res: { phys: 35, magic: 10, poison: 60 }, hp: 1.1, dmg: 1.2, spd: 0.8 },
        { name: 'Rot-Tide Spawn', attack: 'Corrupted Surge', atkType: 'poison', res: { phys: 10, magic: 20, poison: 65 }, hp: 0.8, dmg: 1.1, spd: 1.3 },
      ] },
  ],
}, // ===== end Chapter 1 =====
{ // ================= CHAPTER 2 =================
  num: 2, title: 'Chapter 2: Blackthorn Forest', icon: '🌲', shopName: 'Blackthorn Smugglers\' Cache',
  headline: 'The smugglers\' dark of Blackthorn — the one place the riders won\'t easily follow.',
  story: [
    'They run before dawn, cutting off the main road into the black tangle of old-growth pine and bramble known to smugglers as Blackthorn — a forest with no clean paths and no families living inside it, which is exactly why Pars knows it. He led supply runs through here for the guild, back before the guild decided he was worth more dead than useful. He still remembers half the safe routes. He does not know how many of them the guild has since changed, specifically because of him.',
    'The riders don\'t follow past the treeline — not because they can\'t, but because Blackthorn has its own reputation for eating people who enter uninvited. That reputation, the group quickly learns, has gotten worse. The corruption bleeding out of Reedmarsh\'s marsh wasn\'t contained to the marsh. It runs through root and soil, and Blackthorn has been drinking it for longer than anyone realized.',
  ],
  ending: [
    'The strongroom records are damning and precise: years of "special deliveries" logged not by name but by bloodline, cross-referenced against old noble houses — including, Kharun realizes with his stomach turning over, his own family\'s line, flagged as "active, monitor only, do not collect — insufficient purity." Pars\'s own intake entry sits nearby, flagged very differently: "collect — confirmed lineage — Patient Client priority."',
    'Minnie, cross-referencing the ledger\'s strange sigil-notation against her own academy training, goes pale in a way she hasn\'t yet in this whole journey. The notation isn\'t guild cipher. It\'s old academy notation — the same style her own masters used, the same style belonging to the very demon-summoning rite that sealed them below Aldergate.',
    'Three separate threads — a guild that hunts royal blood, a masterless mage whose academy fell to the same kind of blood-cult, and a mercenary carrying a name three centuries too old for comfort — have just tied themselves into a single knot, in a burned-out amphitheater in the middle of nowhere.',
    'There\'s no more room for coincidence, and no more time to process it quietly: guild reinforcements, alerted by the amphitheater\'s collapse, are already closing in from the east — from the direction of a decaying port city called Vesk, where, the ledgers suggest, the Patient Client\'s actual operations are based.',
    'The Blackthorn chapter ends with the group moving to Vesk, not chased this time, but hunting.',
  ],
  rareA: ['Blight', 'Thorn', 'Bramble', 'Root', 'Guild', 'Taint', 'Bark', 'Shadow'],
  rareB: ['Stalker', 'Runner', 'Strangler', 'Watcher', 'Cutter', 'Prowler', 'Weaver', 'Snapper'],
  eliteTitles: ['the Trail-Claimer', 'the Thorn Tyrant', 'the Guild\'s Fang', 'the Taint-Bred',
                'the Old-Growth Horror', 'the Ward-Carver', 'the Cargo-Eater', 'the Amphitheater\'s Voice'],
  quests: [
    { name: 'The Guild\'s Welcome', location: 'The Old Supply Trail',
      intro: ['Pars recognizes the first trail marker as one he carved himself years ago — and finds it defaced, re-cut with a guild kill-mark instead.'],
      objective: 'Scout the old supply trail and deal with whatever\'s been left to guard it.',
      outro: ['A pack of Blight-Fur Stalkers, forest wolves warped lean and hairless by tainted groundwater, has denned along the trail specifically because it\'s a chokepoint humans still use. Clearing them confirms the trail is still active — someone\'s still moving guild cargo through here, recently.'],
      setup: 'Sets up Quest 2: if the trail\'s active, someone\'s using it nearby, right now.',
      boss: { name: 'Blight-Fur Stalker', attack: 'Hairless Pounce', atkType: 'phys', res: { phys: 15, magic: 10, poison: 40 }, hp: 1.1, dmg: 1.2, spd: 1.3, specialties: ['swift', 'vampiric'] },
      creatures: [
        { name: 'Blight-Fur Whelp', attack: 'Nipping Rush', atkType: 'phys', res: { phys: 10, magic: 5, poison: 30 }, hp: 0.7, dmg: 1.0, spd: 1.4 },
        { name: 'Bramble Viper', attack: 'Thorn-Hidden Strike', atkType: 'poison', res: { phys: 5, magic: 5, poison: 50 }, hp: 0.8, dmg: 1.2, spd: 1.2 },
        { name: 'Tainted Root-Sprite', attack: 'Sap Burst', atkType: 'magic', res: { phys: 10, magic: 35, poison: 45 }, hp: 0.8, dmg: 1.2, spd: 1.0 },
      ] },
    { name: 'Fresh Tracks', location: 'The Bramble Maze',
      intro: ['Cart-ruts branch off the main trail into a maze of bramble corridors too deliberate to be natural — guild-cut, guild-maintained.'],
      objective: 'Follow the fresh tracks through the maze without losing them, and clear whatever\'s nesting in the thorns.',
      outro: ['A territorial Thornback Matron, a massive corrupted boar grown fat on tainted roots, has claimed the maze\'s center and nearly gores Kharun before they bring it down. Past her lair, the tracks lead to a fortified guild waystation — bigger than Pars expected.'],
      setup: 'Sets up Quest 3: the waystation is a real target, not a rumor.',
      boss: { name: 'Thornback Matron', attack: 'Goring Charge', atkType: 'phys', res: { phys: 35, magic: 5, poison: 45 }, hp: 1.5, dmg: 1.2, spd: 0.8, specialties: ['colossal', 'enraged'] },
      creatures: [
        { name: 'Thornback Piglet', attack: 'Tusk Jab', atkType: 'phys', res: { phys: 20, magic: 0, poison: 30 }, hp: 0.9, dmg: 1.0, spd: 1.0 },
        { name: 'Maze Creeper', attack: 'Bramble Lash', atkType: 'phys', res: { phys: 15, magic: 10, poison: 55 }, hp: 1.1, dmg: 1.0, spd: 0.8 },
        { name: 'Briar-Wasp Swarm', attack: 'Stinging Cloud', atkType: 'poison', res: { phys: 0, magic: 10, poison: 45 }, hp: 0.6, dmg: 1.1, spd: 1.5 },
      ] },
    { name: 'The Waystation Wall', location: 'Guild Waystation Perimeter',
      intro: ['Before they can move on the waystation itself, they need to deal with its outer watch — including, Pars realizes with a cold jolt, at least one guard he trained personally.'],
      objective: 'Clear the waystation\'s perimeter watch to open a way inside.',
      outro: ['The fight against corrupted Watch-Hounds — bred, not born wrong; the guild is deliberately exposing animals to the taint now — is hard-won, and it\'s here Pars admits out loud, for the first time, why the guild wants him dead badly enough to chase him this far: not disloyalty. Something about his blood.'],
      setup: 'Sets up Quest 4: the waystation holds the men who signed his death warrants.',
      boss: { name: 'Corrupted Watch-Hound', attack: 'Trained Takedown', atkType: 'phys', res: { phys: 20, magic: 10, poison: 35 }, hp: 1.2, dmg: 1.3, spd: 1.3, specialties: ['swift', 'poisonous'] },
      creatures: [
        { name: 'Perimeter Guard', attack: 'Guild Shortblade', atkType: 'phys', res: { phys: 20, magic: 10, poison: 15 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
        { name: 'Kennel Runt', attack: 'Desperate Bite', atkType: 'phys', res: { phys: 10, magic: 0, poison: 25 }, hp: 0.7, dmg: 1.0, spd: 1.4 },
        { name: 'Watch-Post Archer', attack: 'Signal Shot', atkType: 'phys', res: { phys: 10, magic: 15, poison: 10 }, hp: 0.8, dmg: 1.3, spd: 1.1 },
      ] },
    { name: 'Pars\'s Revenge: The Waystation', location: 'Guild Waystation Interior',
      intro: ['Inside, Pars finds exactly who he hoped and feared he would: two of the three guild superiors who sent him on his six suicide missions, holed up here overseeing the cargo route personally.'],
      objective: 'Confront the guild officers responsible for Pars\'s death sentences.',
      outro: ['The fight against the Guild Enforcer Captain and his corrupted honor-guard is personal in a way none of the group\'s fights have been yet — Pars fights with a fury that worries even Kharun. When the captain finally falls, dying, he laughs and tells Pars the truth plainly, almost gleefully: "You were never punished for failing, boy. You were sent to die because your blood is worth more spilled than spent. Ask your parents — oh, wait." He dies before Pars can get more than that. Minnie, searching the captain\'s effects, finds a ledger entry confirming a standing contract between the guild and something called only "the Patient Client."'],
      setup: 'Sets up Quest 5: they now know the guild answers to something else — someone paying for royal blood specifically.',
      boss: { name: 'Guild Enforcer Captain', attack: 'Executioner\'s Cut', atkType: 'phys', res: { phys: 30, magic: 20, poison: 30 }, hp: 1.3, dmg: 1.3, spd: 1.1, specialties: ['berserk', 'resistant'] },
      creatures: [
        { name: 'Honor-Guard Blade', attack: 'Drilled Thrust', atkType: 'phys', res: { phys: 25, magic: 10, poison: 20 }, hp: 1.1, dmg: 1.1, spd: 1.0 },
        { name: 'Guild Crossbowman', attack: 'Point-Blank Bolt', atkType: 'phys', res: { phys: 10, magic: 10, poison: 10 }, hp: 0.8, dmg: 1.3, spd: 1.1 },
        { name: 'Corrupted Quartermaster', attack: 'Taint-Slick Cleaver', atkType: 'poison', res: { phys: 20, magic: 15, poison: 50 }, hp: 1.2, dmg: 1.1, spd: 0.8 },
      ] },
    { name: 'The Patient Client\'s Ledger', location: 'The Cargo Depot',
      intro: ['The ledger references a second, larger depot deeper in the forest where "special deliveries" are processed.'],
      objective: 'Reach the cargo depot and find out what the guild has actually been shipping.',
      outro: ['Corrupted Depot Wardens — once guild muscle, now barely held together by the same taint infesting the forest — guard crates that turn out to be empty of goods and full instead of the same ward-glyphs from Reedmarsh\'s boundary stones, freshly carved, clearly being mass-produced and shipped out.'],
      setup: 'Sets up Quest 6: someone is spreading corrupted wards deliberately, on purpose, at scale.',
      boss: { name: 'Corrupted Depot Warden', attack: 'Taint-Held Fists', atkType: 'phys', res: { phys: 35, magic: 15, poison: 55 }, hp: 1.4, dmg: 1.1, spd: 0.8, specialties: ['necrotic', 'resilient'] },
      creatures: [
        { name: 'Depot Loader', attack: 'Crate-Heaver\'s Swing', atkType: 'phys', res: { phys: 30, magic: 5, poison: 35 }, hp: 1.3, dmg: 1.0, spd: 0.7 },
        { name: 'Glyph-Sick Porter', attack: 'Feverish Clawing', atkType: 'poison', res: { phys: 15, magic: 10, poison: 50 }, hp: 1.0, dmg: 1.0, spd: 1.0 },
        { name: 'Ward-Crate Haunt', attack: 'Carved-Glyph Flare', atkType: 'magic', res: { phys: 35, magic: 35, poison: 55 }, hp: 0.8, dmg: 1.3, spd: 1.0 },
      ] },
    { name: 'Where the Wards Go', location: 'The Shipping Clearing',
      intro: ['A recently used clearing shows wagon-ruts heading toward multiple destinations — this operation is bigger than one forest.'],
      objective: 'Intercept the next shipment before it leaves and learn its destination.',
      outro: ['A corrupted Cart-Bound Colossus — several dead draft horses and their cart fused into one lumbering horror by prolonged taint exposure — is the last thing anyone expected to be pulling cargo, and the fight to stop it doubles as the group\'s first real look at how fast the corruption is accelerating. The surviving wagon manifest names a single recurring destination: a "collection point" deep in the forest\'s oldest section.'],
      setup: 'Sets up Quest 7: there\'s a central node behind all of this, right here in Blackthorn.',
      boss: { name: 'Cart-Bound Colossus', attack: 'Wagon-Wheel Crush', atkType: 'phys', res: { phys: 45, magic: 10, poison: 60 }, hp: 1.7, dmg: 1.2, spd: 0.5, specialties: ['colossal', 'golem'] },
      creatures: [
        { name: 'Fused Draft-Horse', attack: 'Trampling Panic', atkType: 'phys', res: { phys: 25, magic: 10, poison: 45 }, hp: 1.2, dmg: 1.1, spd: 1.0 },
        { name: 'Wagon Outrider', attack: 'Riding Slash', atkType: 'phys', res: { phys: 20, magic: 5, poison: 15 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
        { name: 'Clearing Scavenger', attack: 'Opportunist\'s Bite', atkType: 'poison', res: { phys: 10, magic: 5, poison: 40 }, hp: 0.8, dmg: 1.0, spd: 1.2 },
      ] },
    { name: 'The Old-Growth Line', location: 'The Ancient Treeline',
      intro: ['Beyond the maintained trails lies forest untouched even by the smugglers — trees old enough to predate the Kharun-lands themselves.'],
      objective: 'Push into the ancient treeline and deal with whatever\'s been drawn there by the corruption\'s source.',
      outro: ['A Root-Bound Horror, an ancient tree twisted inside-out by centuries of dormant taint finally reactivated, animates and nearly buries the group under its own corrupted canopy before falling. Beneath its roots, they find worked stone — another old boundary marker, this one intact, still faintly glowing.'],
      setup: 'Sets up Quest 8: the boundary markers form a real, deliberate perimeter, and Blackthorn was always part of it.',
      boss: { name: 'Root-Bound Horror', attack: 'Canopy Collapse', atkType: 'phys', res: { phys: 40, magic: 15, poison: 65 }, hp: 1.6, dmg: 1.1, spd: 0.6, specialties: ['regen', 'colossal'] },
      creatures: [
        { name: 'Old-Growth Treantling', attack: 'Branch Swat', atkType: 'phys', res: { phys: 35, magic: 5, poison: 50 }, hp: 1.4, dmg: 0.9, spd: 0.6 },
        { name: 'Deep-Moss Shambler', attack: 'Smothering Embrace', atkType: 'poison', res: { phys: 25, magic: 15, poison: 60 }, hp: 1.2, dmg: 1.0, spd: 0.7 },
        { name: 'Canopy Shrieker', attack: 'Diving Shriek', atkType: 'magic', res: { phys: 10, magic: 30, poison: 20 }, hp: 0.7, dmg: 1.3, spd: 1.4 },
      ] },
    { name: 'The Second Marker', location: 'The Marker Clearing',
      intro: ['Minnie confirms it: this stone is twin to the ones at Reedmarsh, meaning the old border-ward network extends much further than one village ever knew.'],
      objective: 'Protect the marker while Minnie attempts to read its remaining ward-charge, and repel whatever the disturbance draws in.',
      outro: ['A swarm of Taint-Born Swarmlings, drawn by the marker\'s disturbed magic like moths to flame, attacks in overwhelming numbers rather than raw strength — the group\'s first true endurance fight. Minnie succeeds: the marker\'s charge reveals a map-fragment of sorts, a ring of similar stones circling something much larger, much further east.'],
      setup: 'Sets up Quest 9: the true scale of the old ward-network — and what it was protecting — starts to become clear.',
      boss: { name: 'Taint-Born Swarm Mother', attack: 'Spawning Frenzy', atkType: 'poison', res: { phys: 15, magic: 25, poison: 60 }, hp: 1.2, dmg: 1.1, spd: 1.3, specialties: ['swift', 'explosive'] },
      creatures: [
        { name: 'Taint-Born Swarmling', attack: 'Numberless Bites', atkType: 'poison', res: { phys: 5, magic: 10, poison: 50 }, hp: 0.6, dmg: 1.0, spd: 1.5 },
        { name: 'Marker Moth', attack: 'Charge-Dust Wings', atkType: 'magic', res: { phys: 10, magic: 35, poison: 30 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
        { name: 'Charge-Drunk Beetle', attack: 'Crackling Mandibles', atkType: 'phys', res: { phys: 40, magic: 20, poison: 45 }, hp: 1.2, dmg: 1.0, spd: 0.8 },
      ] },
    { name: 'The Collection Point', location: 'The Hollow Amphitheater',
      intro: ['Following both the wagon manifests and the marker\'s revealed direction, they find the "collection point" — a natural stone amphitheater deep in the old growth, clearly repurposed as a ritual site.'],
      objective: 'Infiltrate the collection point and confront whoever, or whatever, is coordinating the guild\'s ward-shipments and blood-collection.',
      outro: ['They find no ritualist waiting, only its guardian: a Bound Ritekeeper, a corrupted guild mage-priest, fused disturbingly with the very wards it was meant to protect, more machine of magic now than person. Killing it is hard, and its death sends a shockwave through the amphitheater\'s central stone — waking something far larger buried beneath it.'],
      setup: 'Sets up Quest 10: the chapter\'s true threat, dormant until now, is finally disturbed.',
      boss: { name: 'Bound Ritekeeper', attack: 'Ward-Fused Barrage', atkType: 'magic', res: { phys: 30, magic: 45, poison: 55 }, hp: 1.3, dmg: 1.4, spd: 0.9, specialties: ['magical', 'cursed'] },
      creatures: [
        { name: 'Rite-Circle Acolyte', attack: 'Blood-Chalk Hex', atkType: 'magic', res: { phys: 10, magic: 35, poison: 25 }, hp: 0.8, dmg: 1.3, spd: 1.0 },
        { name: 'Amphitheater Gargoyle', attack: 'Stone-Wing Slam', atkType: 'phys', res: { phys: 45, magic: 15, poison: 65 }, hp: 1.4, dmg: 1.0, spd: 0.7 },
        { name: 'Blood-Ward Wisp', attack: 'Siphoning Spark', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
      ] },
    { name: 'The Amphitheater Depths', location: 'Beneath the Hollow Amphitheater',
      intro: ['The ground splits, and what rises isn\'t guild, corruption-beast, or construct — it\'s older than all of it: a Blightwood Sentinel, a colossal guardian-construct grown from the same original ward-network as the boundary stones, twisted after three centuries of neglect from protector into something that now attacks anything living out of pure corrupted instinct.'],
      objective: 'Bring down the Blightwood Sentinel before it destroys the amphitheater and everything the marker network still protects.',
      outro: ['It\'s the hardest fight yet by far, tearing through the ancient treeline itself as it fights, forcing the group to use the terrain, the marker\'s lingering charge, and every trick learned this chapter together. When it finally falls, its shattering reveals a chamber beneath the amphitheater floor — a real guild strongroom, untouched by the fighting above, holding shipping records going back years.'],
      setup: null,
      boss: { name: 'Blightwood Sentinel', attack: 'Treeline-Splitting Swing', atkType: 'phys', res: { phys: 45, magic: 30, poison: 70 }, hp: 1.7, dmg: 1.3, spd: 0.6, specialties: ['golem', 'colossal'] },
      creatures: [
        { name: 'Splintered Wardling', attack: 'Shard Jab', atkType: 'phys', res: { phys: 35, magic: 20, poison: 60 }, hp: 1.0, dmg: 1.0, spd: 0.9 },
        { name: 'Depth-Woken Burrower', attack: 'Undermining Snap', atkType: 'phys', res: { phys: 30, magic: 10, poison: 40 }, hp: 1.2, dmg: 1.1, spd: 0.8 },
        { name: 'Blightwood Shard-Swarm', attack: 'Splinter Storm', atkType: 'magic', res: { phys: 20, magic: 30, poison: 50 }, hp: 0.7, dmg: 1.3, spd: 1.4 },
      ] },
  ],
}, // ===== end Chapter 2 =====
{ // ================= CHAPTER 3 =================
  num: 3, title: 'Chapter 3: Sunken Docks of Vesk', icon: '⚓', shopName: 'Vesk Harbor Black Market',
  headline: 'Half a city underwater, and the guild answers to something above even itself.',
  story: [
    'Vesk was a proper city once — a trade port that fed half the old kingdom. Now half of it is underwater, swallowed slow by a tide that started rising strangely after the old rites started failing, and the other half is guild territory in everything but name, propped up by smuggling and worse. The strongroom ledgers pointed here for a reason: this is where the Patient Client\'s actual dealings happen, where guild leadership answers to something above even themselves.',
    'Pars knows this too, and it\'s why he goes quiet the moment the group sees Vesk\'s skyline. Somewhere in that half-drowned mess of a city is the guild\'s regional master — the man who first signed off on sending an orphan boy to die six separate times. Pars didn\'t come here hunting the Patient Client. He came here for something older and simpler than that.',
  ],
  ending: [
    'In the wreckage at the lighthouse\'s peak, they find the Herald\'s anchor-point — a crude but functional scrying-focus, still faintly active, showing fragments of a vast dark space deep underground, chains, and a shape too large to look at directly. Minnie recognizes the location instantly, with cold certainty: it\'s not just Vorrhak\'s prison. Structurally, magically, it\'s built exactly like the sealed lower halls of her own academy.',
    'For the first time, all three understand the shape of what they\'re actually inside: a demon three centuries contained, its influence spreading through borderlands, guild, and academy alike, all converging on the same handful of bloodlines — Kharun\'s, Pars\'s, and by extension every soul who ever stood against it, including Minnie\'s trapped masters.',
    'Pars, still holding the vault records naming him the guild\'s real prize, finally says what he\'s been avoiding since Halewick\'s last words: if his blood is what the demon wants, then somewhere in his family, in whatever house gave him up to that orphanage, is the second half of a story neither he nor Kharun have pieced together yet.',
    'Before the thought can fully land, Minnie\'s scrying-focus flares — old academy alarm-wards, still barely active, pulsing from somewhere far to the east, toward the open wastes where the original border-war was fought three centuries ago.',
    'The Vesk chapter ends with the three of them changing course again — not fleeing, not hunting a lead, but walking, deliberately now, toward the Ashen Steppe, where the old king made his stand, and where the ground itself still remembers the war that started all of this.',
  ],
  rareA: ['Tide', 'Brack', 'Harbor', 'Drowned', 'Salt', 'Bloat', 'Hull', 'Fog'],
  rareB: ['Crawler', 'Hauler', 'Lurker', 'Drifter', 'Snapper', 'Feeder', 'Wader', 'Clinger'],
  eliteTitles: ['the Harbor Terror', 'the Tide-Swollen', 'the Cargo-Drowner', 'the Salt-Rotted',
                'the Voice\'s Hand', 'the Customs Horror', 'the Drowned Warden', 'the Lighthouse Shadow'],
  quests: [
    { name: 'The Flooded Quarter', location: 'The Low Streets',
      intro: ['The lower half of Vesk is knee-deep in brackish water even at low tide, and something\'s using the flooding as cover.'],
      objective: 'Navigate the flooded quarter and clear the path toward guild-held ground.',
      outro: ['A pack of Bloatfin Crawlers, fish-things dragged from the deep by the same taint that\'s rotting everything else, ambush from the flooded streets. Clearing them opens a route inland — and reveals guild patrol boats moving cargo with unusual urgency.'],
      setup: 'Sets up Quest 2: something has the guild rattled here, and it\'s not the group\'s arrival yet.',
      boss: { name: 'Bloatfin Crawler', attack: 'Gill-Rot Bite', atkType: 'poison', res: { phys: 20, magic: 10, poison: 50 }, hp: 1.1, dmg: 1.1, spd: 1.2, specialties: ['poisonous', 'swift'] },
      creatures: [
        { name: 'Brack-Water Nipper', attack: 'Darting Bite', atkType: 'phys', res: { phys: 5, magic: 5, poison: 35 }, hp: 0.7, dmg: 1.0, spd: 1.4 },
        { name: 'Street Eel', attack: 'Ankle-Deep Strike', atkType: 'phys', res: { phys: 15, magic: 10, poison: 40 }, hp: 0.9, dmg: 1.2, spd: 1.1 },
        { name: 'Tide-Rot Shambler', attack: 'Sodden Slam', atkType: 'poison', res: { phys: 25, magic: 10, poison: 55 }, hp: 1.3, dmg: 1.0, spd: 0.7 },
      ] },
    { name: 'Cargo Under Water', location: 'The Sunken Warehouse District',
      intro: ['Following the patrol boats leads to a district of warehouses flooded to their second floors, still in active use despite the water.'],
      objective: 'Intercept a guild cargo run and learn what\'s got them moving so fast.',
      outro: ['A Drowned Hauler, once a guild dockhand, now a bloated water-logged horror animated by prolonged taint exposure, guards the cargo — more ward-glyph shipments, and manifests referencing a "final collection" deadline. Pars recognizes the deadline format. It\'s the same countdown structure used for his own sixth mission.'],
      setup: 'Sets up Quest 3: the guild is running out of time on something, and Pars knows exactly what that pressure feels like.',
      boss: { name: 'Drowned Hauler', attack: 'Waterlogged Haymaker', atkType: 'phys', res: { phys: 35, magic: 10, poison: 60 }, hp: 1.5, dmg: 1.2, spd: 0.7, specialties: ['colossal', 'necrotic'] },
      creatures: [
        { name: 'Warehouse Lurker', attack: 'Second-Floor Ambush', atkType: 'phys', res: { phys: 20, magic: 10, poison: 30 }, hp: 1.0, dmg: 1.2, spd: 1.1 },
        { name: 'Sodden Crate-Mimic', attack: 'Splintered Snap', atkType: 'phys', res: { phys: 40, magic: 5, poison: 50 }, hp: 1.3, dmg: 1.0, spd: 0.6 },
        { name: 'Harbor Wisp', attack: 'Fog-Light Shock', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
      ] },
    { name: 'The Harbor Office', location: 'Guild Harbor Office',
      intro: ['Cargo manifests point to a harbor office as the local coordination point — low-level, but a thread to pull.'],
      objective: 'Raid the harbor office and identify who\'s giving the "final collection" orders.',
      outro: ['Corrupted Harbor Enforcers, guild muscle exposed deliberately to taint like the watch-hounds at Blackthorn, put up a hard fight before the group secures the office\'s records. The trail leads directly to the guild\'s regional headquarters — an old customs house turned fortress, and the name on the standing orders is one Pars has hated for years.'],
      setup: 'Sets up Quest 4: the headquarters is the target, and Pars finally says the name out loud.',
      boss: { name: 'Corrupted Harbor Enforcer', attack: 'Taint-Fed Bludgeon', atkType: 'phys', res: { phys: 30, magic: 15, poison: 40 }, hp: 1.3, dmg: 1.3, spd: 1.0, specialties: ['berserk', 'resistant'] },
      creatures: [
        { name: 'Office Clerk-Husk', attack: 'Quill-Hand Claw', atkType: 'phys', res: { phys: 10, magic: 15, poison: 45 }, hp: 0.8, dmg: 1.0, spd: 1.0 },
        { name: 'Dock Tough', attack: 'Hook and Fist', atkType: 'phys', res: { phys: 25, magic: 5, poison: 15 }, hp: 1.1, dmg: 1.2, spd: 0.9 },
        { name: 'Ledger Wisp', attack: 'Ink-Number Hex', atkType: 'magic', res: { phys: 35, magic: 30, poison: 55 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
      ] },
    { name: 'The Customs House Approach', location: 'Old Customs House Grounds',
      intro: ['Before they can reach the guild master himself, they need through the grounds — heavily patrolled, heavily warned by the office raid.'],
      objective: 'Fight through the customs house perimeter to reach its interior.',
      outro: ['A corrupted Tideguard Behemoth, a customs-house watch-beast bloated by the same rot infecting the harbor, nearly crushes Kharun before falling. Past it, the doors to the customs house stand open. Pars doesn\'t wait for the others before walking through.'],
      setup: 'Sets up Quest 5: the man responsible is inside, waiting.',
      boss: { name: 'Tideguard Behemoth', attack: 'Crushing Bulk', atkType: 'phys', res: { phys: 45, magic: 15, poison: 55 }, hp: 1.7, dmg: 1.2, spd: 0.5, specialties: ['colossal', 'resilient'] },
      creatures: [
        { name: 'Grounds Patrolman', attack: 'Halberd Sweep', atkType: 'phys', res: { phys: 25, magic: 10, poison: 20 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
        { name: 'Chained Watch-Beast', attack: 'Chain-Length Lunge', atkType: 'phys', res: { phys: 30, magic: 5, poison: 35 }, hp: 1.2, dmg: 1.2, spd: 0.9 },
        { name: 'Customs Wall-Archer', attack: 'Murder-Hole Shot', atkType: 'phys', res: { phys: 10, magic: 15, poison: 10 }, hp: 0.8, dmg: 1.3, spd: 1.1 },
      ] },
    { name: 'Pars\'s Revenge: The Regional Master', location: 'Customs House Interior',
      intro: ['The guild\'s regional master, a cold, patient man named Halewick, doesn\'t look surprised to see Pars alive. He looks satisfied, like a man whose experiment finally reached its logical conclusion.'],
      objective: 'Confront and defeat Halewick, the man who ordered all six of Pars\'s death-missions.',
      outro: ['Halewick fights with corrupted guild elites, and Pars fights him like a man finishing something instead of starting it — no fury this time, just precision. Dying, Halewick tells him the truth without needing to be asked, almost proud of it: "You\'re the last direct line, boy. The old king\'s blood doesn\'t run thin in you the way it does in scattered nobles. The Client\'s wanted you since you were an infant — we just needed you old enough to bleed properly for the rite." He names the "Patient Client" for the first time as something not human at all — a debt-holder from before the guild itself existed. Then he dies, and Pars stands over him feeling nothing like the relief he expected.'],
      setup: 'Sets up Quest 6: the true nature of the Patient Client is now unavoidable, and it isn\'t a person.',
      boss: { name: 'Halewick, the Regional Master', attack: 'Cold Precision', atkType: 'phys', res: { phys: 25, magic: 30, poison: 35 }, hp: 1.2, dmg: 1.4, spd: 1.2, specialties: ['evasive', 'cursed'] },
      creatures: [
        { name: 'Guild Elite Duelist', attack: 'Practiced Riposte', atkType: 'phys', res: { phys: 25, magic: 15, poison: 20 }, hp: 1.0, dmg: 1.2, spd: 1.2 },
        { name: 'Master\'s Bodyguard', attack: 'Shield-Break Charge', atkType: 'phys', res: { phys: 35, magic: 10, poison: 25 }, hp: 1.3, dmg: 1.1, spd: 0.8 },
        { name: 'Corrupted Hall Sentry', attack: 'Taint-Edged Pike', atkType: 'poison', res: { phys: 20, magic: 15, poison: 45 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
      ] },
    { name: 'What Halewick Kept', location: 'The Master\'s Vault',
      intro: ['Halewick\'s private vault, sealed behind the customs house\'s oldest wall, holds records predating even the guild itself.'],
      objective: 'Breach the master\'s vault and secure whatever he was protecting.',
      outro: ['A Vault Warden, an ancient construct clearly older than the guild that inherited it, activates to defend records that were never guild property to begin with. Inside: original correspondence — not with a client, but with something calling itself Vorrhak\'s Voice, a servant-intelligence acting on behalf of a demon the records finally name outright.'],
      setup: 'Sets up Quest 7: the group now has the demon\'s name, and it changes everything Minnie thought she knew.',
      boss: { name: 'Vault Warden', attack: 'Ancient Ward-Fist', atkType: 'phys', res: { phys: 50, magic: 35, poison: 70 }, hp: 1.5, dmg: 1.1, spd: 0.7, specialties: ['golem', 'charm'] },
      creatures: [
        { name: 'Vault Skitterling', attack: 'Lock-Pick Claws', atkType: 'phys', res: { phys: 25, magic: 15, poison: 40 }, hp: 0.8, dmg: 1.0, spd: 1.3 },
        { name: 'Record-Moth Swarm', attack: 'Paper-Dust Cloud', atkType: 'poison', res: { phys: 5, magic: 20, poison: 50 }, hp: 0.6, dmg: 1.1, spd: 1.5 },
        { name: 'Old-Wall Haunt', attack: 'Masonry Grasp', atkType: 'magic', res: { phys: 45, magic: 25, poison: 65 }, hp: 1.0, dmg: 1.2, spd: 0.8 },
      ] },
    { name: 'Minnie\'s Reckoning', location: 'The Old Archive Room',
      intro: ['Minnie recognizes the name Vorrhak instantly — it\'s in her academy\'s forbidden texts, the same demon her masters\' rite was meant to summon-and-contain, not create.'],
      objective: 'Search the archive room for anything connecting Vorrhak to the academy\'s fall, while holding off whatever\'s been drawn by the vault\'s disturbance.',
      outro: ['A swarm of Ink-Bound Wraiths, papers and old bindings animated by leaking taint, attacks in a chaotic, disorienting fight through collapsing shelving. Among the salvaged pages: proof that the academy master who opened the door beneath Aldergate wasn\'t tricked at all — he was guided, across years, by the same "Voice" that corresponded with Halewick.'],
      setup: 'Sets up Quest 8: the academy\'s betrayal and the guild\'s betrayal share a single architect.',
      boss: { name: 'Ink-Bound Wraith', attack: 'Paper-Storm Slash', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 1.0, dmg: 1.3, spd: 1.3, specialties: ['spectral', 'swift'] },
      creatures: [
        { name: 'Animated Binding', attack: 'Spine-Snap Bite', atkType: 'phys', res: { phys: 20, magic: 25, poison: 55 }, hp: 0.9, dmg: 1.1, spd: 1.0 },
        { name: 'Ink Blot-Fiend', attack: 'Blinding Splatter', atkType: 'magic', res: { phys: 35, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
        { name: 'Shelf-Collapse Poltergeist', attack: 'Hurled Archive', atkType: 'phys', res: { phys: 50, magic: 25, poison: 70 }, hp: 0.9, dmg: 1.3, spd: 0.9 },
      ] },
    { name: 'The Drowned Chapel', location: 'Sunken Chapel of Vesk',
      intro: ['Records point to a chapel, now half-submerged, once used for the old boundary-ward rites and later corrupted into a shrine for Vorrhak\'s Voice.'],
      objective: 'Reach the drowned chapel and confront whatever\'s using it as a foothold in Vesk.',
      outro: ['A Chapel-Bound Revenant, the corrupted remains of a priest who once tended the real wards here before the Voice turned him, guards an altar actively channeling power somewhere else — toward a larger working, elsewhere in the city.'],
      setup: 'Sets up Quest 9: the Voice is actively working something big, right now, nearby.',
      boss: { name: 'Chapel-Bound Revenant', attack: 'Turned Benediction', atkType: 'magic', res: { phys: 35, magic: 40, poison: 65 }, hp: 1.3, dmg: 1.3, spd: 0.9, specialties: ['necrotic', 'magical'] },
      creatures: [
        { name: 'Drowned Congregant', attack: 'Clutching Prayer', atkType: 'phys', res: { phys: 25, magic: 15, poison: 55 }, hp: 1.1, dmg: 1.0, spd: 0.8 },
        { name: 'Altar Wisp', attack: 'Stolen-Faith Spark', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
        { name: 'Chapel Eel', attack: 'Pew-Shadow Strike', atkType: 'phys', res: { phys: 15, magic: 10, poison: 40 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
      ] },
    { name: 'The Rising Tide', location: 'The Old Lighthouse',
      intro: ['The chapel\'s altar traces to Vesk\'s abandoned lighthouse, the highest point in the drowning city — and the last dry ground the Voice needs to finish whatever it\'s building.'],
      objective: 'Reach the lighthouse and stop the working before it completes.',
      outro: ['A Voice-Touched Harbor Master, once the city\'s real harbor authority, now a puppet for Vorrhak\'s Voice itself, fights with unsettling intelligence and speaks with a second voice layered under his own — mocking, patient, ancient. Defeating him doesn\'t destroy the Voice, only the vessel; something intangible flees upward, toward the lighthouse\'s very top, and the whole structure begins to groan and shift, corruption finally given a focal point to fully manifest.'],
      setup: 'Sets up Quest 10: the chapter\'s true threat has nowhere left to hide, and it\'s cornered itself at the top of the only dry ground in Vesk.',
      boss: { name: 'Voice-Touched Harbor Master', attack: 'Two-Voiced Command', atkType: 'magic', res: { phys: 30, magic: 40, poison: 45 }, hp: 1.3, dmg: 1.4, spd: 1.0, specialties: ['cursed', 'magical'] },
      creatures: [
        { name: 'Lighthouse Stair Lurker', attack: 'Rail-Swung Kick', atkType: 'phys', res: { phys: 20, magic: 10, poison: 25 }, hp: 1.0, dmg: 1.1, spd: 1.1 },
        { name: 'Puppet Dockhand', attack: 'Strung-Limb Flail', atkType: 'phys', res: { phys: 25, magic: 20, poison: 50 }, hp: 1.1, dmg: 1.1, spd: 0.9 },
        { name: 'Voice-Echo Wisp', attack: 'Layered Whisper', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
      ] },
    { name: 'The Lighthouse Manifestation', location: 'The Lighthouse Peak',
      intro: ['At the top, Vorrhak\'s Voice finally manifests fully — not the demon itself, but its First Herald, a towering, half-formed avatar built from centuries of collected corruption and stolen faith, given true shape at last by proximity to two of Vorrhak\'s own bloodline debts standing in the same room.'],
      objective: 'Destroy the First Herald before it can open a true channel to Vorrhak itself.',
      outro: ['The hardest fight of the chapter by a wide margin — the Herald shifts forms mid-fight, drawing on both Kharun\'s and Pars\'s blood-debt to grow stronger the longer it survives, forcing the group into their most desperate teamwork yet. When it finally breaks, it doesn\'t die quietly — it speaks with something almost like respect, aimed squarely at Pars and Kharun both: "Two debts in one room. Vorrhak will be so pleased to finally collect." Then it collapses into ash and rot, and the lighthouse falls silent for the first time in years.'],
      setup: null,
      boss: { name: 'The First Herald', attack: 'Blood-Debt Surge', atkType: 'magic', res: { phys: 35, magic: 45, poison: 60 }, hp: 1.6, dmg: 1.4, spd: 1.0, specialties: ['vampiric', 'enraged'] },
      creatures: [
        { name: 'Half-Formed Horror', attack: 'Unfinished Limbs', atkType: 'phys', res: { phys: 25, magic: 25, poison: 50 }, hp: 1.1, dmg: 1.1, spd: 1.0 },
        { name: 'Stolen-Faith Shade', attack: 'Borrowed Litany', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.8, dmg: 1.3, spd: 1.1 },
        { name: 'Corruption Tendril', attack: 'Peak-Splitting Whip', atkType: 'phys', res: { phys: 30, magic: 20, poison: 55 }, hp: 1.2, dmg: 1.2, spd: 0.8 },
      ] },
  ],
}, // ===== end Chapter 3 =====
{ // ================= CHAPTER 4 =================
  num: 4, title: 'Chapter 4: The Ashen Steppe', icon: '🏜️', shopName: 'Steppe Relic Traders',
  headline: 'Where the old king made his stand, the ground itself still remembers the war.',
  story: [
    'The Steppe was a battlefield once, three hundred years gone, and it has never quite let go of that fact. Nothing grows right here — the grass is the color of old ash, the soil cracks in patterns too regular to be natural, and the wind carries a taste that Minnie\'s old texts describe as the residue of large-scale warding magic, still bleeding out centuries later. This is where King Kharun\'s armies held the line before the Ward-Sealing. It\'s also, the group realizes fast, still an active fault-line in whatever\'s left of the old border-network — and Vorrhak\'s influence has been seeping through it for longer than anywhere they\'ve been yet.',
    'Kharun feels it before anyone says a word — a heaviness in the name he carries, standing on ground his ancestor bled across. He doesn\'t know yet how literal that inheritance is about to become.',
  ],
  ending: [
    'The ash finally settles into something like stillness, and for the first time since Reedmarsh, the group has more than fragments — they have the actual, if incomplete, Ward-Sealing rite, a name and shape for what freed the Betrayer, and undeniable proof that Vorrhak has been tracking their bloodlines specifically, patiently, for three hundred years.',
    'Kharun stands over the place where his ancestor died and his ancestor\'s closest friend was condemned to march for three centuries, and says, quietly, the thing none of them have said aloud yet: this was never a haunted marsh, a guild conspiracy, or a drowned city\'s problem. It was always about finishing what the old king started, and it was always going to come back to blood.',
    'Minnie, studying the rite-fragment against her own academy training, realizes something that changes the shape of everything ahead: the rite needs more than willingness now — it needs both bloodline debts closed, Kharun\'s and Pars\'s, before it can be completed at full strength. Which means Pars\'s own unfinished business — the family that gave him up, the truth Halewick dangled and never explained — isn\'t a side note anymore. It\'s half the ritual.',
    'As if in answer, a chill wind carries something new across the ash — distant, sharp, mountain-cold, entirely unlike the dry heat of the Steppe. Minnie recognizes it as high-altitude ward-residue, the same signature as old academy travel-wards her masters used to mark safe passage.',
    'The Ashen Steppe chapter ends with the group turning north, toward the jagged, unforgiving climb of the Sable Peaks — the last dry ground between them and whatever\'s left of the world Minnie\'s masters sealed themselves inside to protect.',
  ],
  rareA: ['Ash', 'Cinder', 'Bone', 'War', 'Grave', 'Ember', 'Dust', 'Scar'],
  rareB: ['Wraith', 'Walker', 'Bearer', 'Marcher', 'Screamer', 'Render', 'Mourner', 'Burner'],
  eliteTitles: ['the Battlefield\'s Echo', 'the Ash-Risen', 'the Standard-Eater', 'the Unburied',
                'the Line-Breaker', 'the March Eternal', 'the Scar-Born', 'the Wall\'s Shadow'],
  quests: [
    { name: 'The Ash Line', location: 'The Old Front Line',
      intro: ['A visible scar runs across the Steppe, a line of permanently blackened earth marking where the original battle\'s worst fighting happened.'],
      objective: 'Investigate the ash line and clear whatever\'s been drawn to its lingering power.',
      outro: ['A pack of Cinder-Wraiths, ash and old bone animated by residual battle-magic gone sour, rise straight out of the scarred ground. Clearing them exposes old weapons and armor fragments — three-hundred-year-old make, remarkably preserved, bearing a crest identical to the one on Pars\'s signet ring from Reedmarsh.'],
      setup: 'Sets up Quest 2: the ring connects directly to this battlefield, not just to Kharun\'s family generally.',
      boss: { name: 'Cinder-Wraith', attack: 'Soured Battle-Magic', atkType: 'magic', res: { phys: 50, magic: 30, poison: 70 }, hp: 1.0, dmg: 1.3, spd: 1.2, specialties: ['burning', 'spectral'] },
      creatures: [
        { name: 'Ash-Bone Riser', attack: 'Grave-Dust Claw', atkType: 'phys', res: { phys: 30, magic: 15, poison: 65 }, hp: 1.0, dmg: 1.0, spd: 0.9 },
        { name: 'Scar-Line Hound', attack: 'Cinder-Hot Bite', atkType: 'phys', res: { phys: 15, magic: 20, poison: 30 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
        { name: 'Ember Mote-Swarm', attack: 'Searing Drift', atkType: 'magic', res: { phys: 45, magic: 25, poison: 60 }, hp: 0.6, dmg: 1.2, spd: 1.4 },
      ] },
    { name: 'The Standard-Bearer\'s Rest', location: 'The Fallen Standard Field',
      intro: ['Following the ash line leads to a field where dozens of old standard-poles still stand, rotted but upright, marking where whole units made their final stand.'],
      objective: 'Search the standard field for records of the battle\'s actual command structure.',
      outro: ['A Standard-Bound Husk, the corrupted remains of a soldier who died guarding his unit\'s banner and never stopped, attacks anyone who approaches its post. Its fall reveals a preserved command banner — the personal standard of the old king\'s closest general, the very man history barely remembers as "the Betrayer."'],
      setup: 'Sets up Quest 3: Kharun\'s own ancestral connection to this war is about to stop being abstract.',
      boss: { name: 'Standard-Bound Husk', attack: 'Banner-Pole Impale', atkType: 'phys', res: { phys: 40, magic: 20, poison: 70 }, hp: 1.4, dmg: 1.2, spd: 0.8, specialties: ['resilient', 'necrotic'] },
      creatures: [
        { name: 'Fallen Bannerman', attack: 'Rotted Spear-Thrust', atkType: 'phys', res: { phys: 30, magic: 10, poison: 60 }, hp: 1.1, dmg: 1.1, spd: 0.8 },
        { name: 'Field Carrion-Bird', attack: 'Bone-Picking Dive', atkType: 'phys', res: { phys: 5, magic: 10, poison: 25 }, hp: 0.7, dmg: 1.2, spd: 1.4 },
        { name: 'Oath-Echo Shade', attack: 'Final-Order Wail', atkType: 'magic', res: { phys: 50, magic: 30, poison: 70 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
      ] },
    { name: 'The General\'s Trail', location: 'The Betrayer\'s Retreat Path',
      intro: ['The banner\'s position marks where the Betrayer\'s forces fell back after the king\'s death — a retreat that history recorded as chaotic, but the ground tells a stranger story.'],
      objective: 'Follow the retreat path and learn what actually happened to the Betrayer\'s forces after the king fell.',
      outro: ['A Retreat-Bound Specter, an officer\'s ghost still fighting a battle that ended three centuries ago, blocks the path until defeated, and in death whispers a fragment that stops Kharun cold: "He didn\'t run. He was taken. Something walked him east, still standing, already gone." The path continues toward a distant, half-buried structure on the horizon.'],
      setup: 'Sets up Quest 4: the Betrayer didn\'t simply flee — he was led somewhere, and that somewhere still exists.',
      boss: { name: 'Retreat-Bound Specter', attack: 'Officer\'s Last Command', atkType: 'magic', res: { phys: 55, magic: 30, poison: 70 }, hp: 1.0, dmg: 1.3, spd: 1.2, specialties: ['spectral', 'evasive'] },
      creatures: [
        { name: 'Routed Soldier-Shade', attack: 'Panicked Slash', atkType: 'phys', res: { phys: 35, magic: 20, poison: 65 }, hp: 0.9, dmg: 1.1, spd: 1.1 },
        { name: 'Path-Dust Devil', attack: 'Choking Spiral', atkType: 'magic', res: { phys: 45, magic: 25, poison: 60 }, hp: 0.8, dmg: 1.1, spd: 1.3 },
        { name: 'Retreat-Line Scavenger', attack: 'Relic-Snatching Bite', atkType: 'phys', res: { phys: 15, magic: 5, poison: 35 }, hp: 0.9, dmg: 1.0, spd: 1.2 },
      ] },
    { name: 'The Buried Waystation', location: 'The Half-Sunken Garrison',
      intro: ['The structure turns out to be an old garrison outpost, swallowed by three centuries of ash-fall and dust, its lower levels still intact beneath the surface.'],
      objective: 'Excavate an entry into the buried garrison and clear whatever\'s nested inside.',
      outro: ['Corrupted Garrison Wraiths, the preserved remains of soldiers stationed here when the corruption first spread outward from the king\'s death, guard passages still eerily intact below the ash. Deep inside, they find a command room, undisturbed for centuries — and a private journal, remarkably preserved by the dry ash, belonging to the Betrayer himself.'],
      setup: 'Sets up Quest 5: the Betrayer\'s own words are about to reveal something none of them expected.',
      boss: { name: 'Corrupted Garrison Wraith', attack: 'Post-Abandoned Grip', atkType: 'magic', res: { phys: 50, magic: 30, poison: 70 }, hp: 1.2, dmg: 1.3, spd: 1.0, specialties: ['spectral', 'cursed'] },
      creatures: [
        { name: 'Ash-Choked Sentry', attack: 'Dust-Blind Swing', atkType: 'phys', res: { phys: 35, magic: 15, poison: 60 }, hp: 1.1, dmg: 1.1, spd: 0.8 },
        { name: 'Garrison Rat-Thing', attack: 'Centuries-Starved Bite', atkType: 'poison', res: { phys: 10, magic: 5, poison: 50 }, hp: 0.7, dmg: 1.0, spd: 1.4 },
        { name: 'Buried-Hall Haunt', attack: 'Collapsed-Ceiling Slam', atkType: 'phys', res: { phys: 45, magic: 25, poison: 70 }, hp: 1.3, dmg: 1.1, spd: 0.7 },
      ] },
    { name: 'The Betrayer\'s Journal', location: 'The Garrison Command Room',
      intro: ['Minnie translates the journal\'s later entries, written in a hand that visibly deteriorates page by page.'],
      objective: 'Secure the journal and defend the command room while Minnie finishes deciphering it.',
      outro: ['A Journal-Bound Wraith, the Betrayer\'s own guilt and memory given corrupted form, manifests to stop them from reading further — as though some part of him, even now, doesn\'t want the truth known. Once defeated, the final entries are clear: the Betrayer wasn\'t destroyed after the killing blow. Vorrhak\'s Voice kept him — walking, aware, imprisoned inside his own body — as a living vessel, marched east under compulsion, never allowed the mercy of dying.'],
      setup: 'Sets up Quest 6: the Betrayer is not a memory. He may still be out there, three hundred years later, still walking.',
      boss: { name: 'Journal-Bound Wraith', attack: 'Guilt Given Form', atkType: 'magic', res: { phys: 45, magic: 35, poison: 70 }, hp: 1.1, dmg: 1.4, spd: 1.1, specialties: ['cursed', 'magical'] },
      creatures: [
        { name: 'Ink-Memory Shade', attack: 'Deteriorating Hand', atkType: 'magic', res: { phys: 40, magic: 30, poison: 65 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
        { name: 'Command-Room Crawler', attack: 'Map-Table Ambush', atkType: 'phys', res: { phys: 25, magic: 10, poison: 45 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
        { name: 'Regret Mote-Cloud', attack: 'Smothering Sorrow', atkType: 'magic', res: { phys: 50, magic: 25, poison: 70 }, hp: 0.6, dmg: 1.2, spd: 1.3 },
      ] },
    { name: 'Kharun\'s Revenge, Part One: The Marching Dead', location: 'The Eastern Ash Flats',
      intro: ['The journal\'s final entry gives a direction, and following it, the group finds tracks — impossibly old, impossibly fresh, as though something has been walking the same path in a loop for three hundred years.'],
      objective: 'Follow the tracks across the ash flats and confront whatever has been walking this path since the king\'s death.',
      outro: ['They find him: the Betrayer\'s Husk, barely recognizable as a man anymore, animated purely by Vorrhak\'s binding, still wearing rotted command armor, still marching an order given three centuries ago that never ended. It doesn\'t fight like a mindless monster — it fights with the ghost of real skill, real training, buried under centuries of horror. When it finally falls, it doesn\'t die easy — the compulsion breaks a moment before the body does, and for one instant, something human looks out of that ruined face at Kharun and finds enough will left to whisper a single, broken apology before finally, mercifully, stopping.'],
      setup: 'Sets up Quest 7: freeing the Betrayer\'s soul draws direct attention — Vorrhak notices a debt three centuries old finally closing.',
      boss: { name: 'The Betrayer\'s Husk', attack: 'Three-Century March', atkType: 'phys', res: { phys: 45, magic: 25, poison: 70 }, hp: 1.5, dmg: 1.3, spd: 0.9, specialties: ['resilient', 'berserk'] },
      creatures: [
        { name: 'Loop-Walker Shade', attack: 'Repeating Strike', atkType: 'phys', res: { phys: 30, magic: 20, poison: 60 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
        { name: 'Compulsion Wisp', attack: 'Binding Lash', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
        { name: 'Flats Bone-Roller', attack: 'Tumbling Crush', atkType: 'phys', res: { phys: 40, magic: 10, poison: 65 }, hp: 1.3, dmg: 1.0, spd: 0.7 },
      ] },
    { name: 'The Backlash', location: 'The Scar\'s Heart',
      intro: ['The Betrayer\'s release sends a shockwave of freed, furious energy through the old ash line, and something answers it immediately, violently.'],
      objective: 'Survive the corrupted backlash unleashed by the Betrayer\'s death before it destabilizes further.',
      outro: ['A Ravening Ash-Storm, a living weather-horror made of centuries of compressed battle-death and rage, tears across the flats, and the fight becomes as much about endurance and positioning as damage. When it finally disperses, the ash briefly clears enough to reveal, half-buried nearby, an intact section of the original border-wall — never finished, exactly as history said, but far larger than anyone expected.'],
      setup: 'Sets up Quest 8: the unfinished border-wall is still here, and still, somehow, partially active.',
      boss: { name: 'Ravening Ash-Storm', attack: 'Compressed Rage', atkType: 'magic', res: { phys: 60, magic: 30, poison: 70 }, hp: 1.3, dmg: 1.4, spd: 1.3, specialties: ['swift', 'burning'] },
      creatures: [
        { name: 'Storm-Rider Cinder', attack: 'Gale-Flung Ember', atkType: 'magic', res: { phys: 40, magic: 25, poison: 55 }, hp: 0.7, dmg: 1.2, spd: 1.4 },
        { name: 'Backlash Elemental', attack: 'Freed-Fury Burst', atkType: 'magic', res: { phys: 35, magic: 35, poison: 60 }, hp: 1.0, dmg: 1.3, spd: 1.0 },
        { name: 'Ash-Blind Charger', attack: 'Heedless Trample', atkType: 'phys', res: { phys: 30, magic: 10, poison: 40 }, hp: 1.2, dmg: 1.2, spd: 1.0 },
      ] },
    { name: 'The Unfinished Wall', location: 'The Border-Wall Ruins',
      intro: ['The wall the old king died trying to complete stretches further than any of them expected, still humming faintly with degraded warding magic after three hundred years.'],
      objective: 'Investigate the wall ruins and clear whatever\'s using its broken sections as a nest.',
      outro: ['A Wall-Bound Aberration, a horror born from centuries of leaking, unstable ward-magic pooling in the wall\'s cracks, attacks from inside the stone itself. Its death stabilizes a long stretch of the wall, and in the newly-quiet section, they find a sealed alcove — untouched, clearly built for one purpose: to hold something safe until a specific bloodline came looking for it.'],
      setup: 'Sets up Quest 9: the wall was built with contingencies, and one of them was meant for exactly this moment.',
      boss: { name: 'Wall-Bound Aberration', attack: 'Strike From the Stone', atkType: 'magic', res: { phys: 50, magic: 40, poison: 70 }, hp: 1.4, dmg: 1.3, spd: 0.8, specialties: ['golem', 'charm'] },
      creatures: [
        { name: 'Crack-Dweller Skitterer', attack: 'Mortar-Dust Bite', atkType: 'phys', res: { phys: 35, magic: 15, poison: 50 }, hp: 0.9, dmg: 1.0, spd: 1.2 },
        { name: 'Ward-Leak Wisp', attack: 'Unstable Discharge', atkType: 'magic', res: { phys: 45, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
        { name: 'Rubble Hulk', attack: 'Fallen-Block Swing', atkType: 'phys', res: { phys: 50, magic: 10, poison: 70 }, hp: 1.5, dmg: 1.0, spd: 0.6 },
      ] },
    { name: 'The King\'s Contingency', location: 'The Sealed Alcove',
      intro: ['The alcove\'s seal responds to royal blood, and Kharun — reluctant, aware of what it might mean — opens it.'],
      objective: 'Unseal the alcove and defend it while retrieving whatever the old king hid there for his descendants.',
      outro: ['A final guardian construct, the Last Loyal Ward, activates specifically to test whoever opens the seal, attacking not to kill but to prove worth — the fight ends the moment the group demonstrates they can actually win it, the construct standing down mid-battle once satisfied. Inside: the old king\'s actual final orders, a fragment of the true Ward-Sealing rite, and confirmation, in the king\'s own hand, that the working was never meant to be permanent — only to buy time for a bloodline strong enough, someday, to finish it properly.'],
      setup: 'Sets up Quest 10: the chapter\'s true threat converges here, drawn by the alcove\'s unsealing.',
      boss: { name: 'The Last Loyal Ward', attack: 'Proving Strike', atkType: 'phys', res: { phys: 50, magic: 35, poison: 70 }, hp: 1.5, dmg: 1.2, spd: 0.8, specialties: ['golem', 'resistant'] },
      creatures: [
        { name: 'Alcove Test-Wisp', attack: 'Measuring Bolt', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.8, dmg: 1.2, spd: 1.2 },
        { name: 'Seal-Spark Elemental', attack: 'Royal-Ward Flare', atkType: 'magic', res: { phys: 35, magic: 35, poison: 65 }, hp: 0.9, dmg: 1.2, spd: 1.0 },
        { name: 'Contingency Guardling', attack: 'Drilled Parry-Strike', atkType: 'phys', res: { phys: 40, magic: 20, poison: 60 }, hp: 1.2, dmg: 1.1, spd: 0.9 },
      ] },
    { name: 'What the Ash Remembers', location: 'The Ash Line\'s Origin Point',
      intro: ['Unsealing the king\'s final contingency is a signal Vorrhak cannot ignore — the exact spot where the original Ward-Sealing rite tore into the earth erupts, and from it rises the Ashbound Herald, a second, far stronger avatar than Vesk\'s Herald, built directly from the compressed grief and rage of an entire battlefield, given purpose now by the demon\'s growing awareness of its converging debts.'],
      objective: 'Destroy the Ashbound Herald and prevent it from destroying the alcove\'s recovered rite-fragment.',
      outro: ['The fight is the group\'s hardest yet, ranging across the ash line itself, the Herald tearing up preserved battlefield relics and hurling them as weapons, forcing constant movement and adaptation. When it finally falls, it doesn\'t taunt them the way Vesk\'s Herald did — it simply says, almost sorrowful in its ancient, layered voice: "Three hundred years, and still you come. Fine. Come further, then, and see what waits."'],
      setup: null,
      boss: { name: 'Ashbound Herald', attack: 'Battlefield\'s Grief', atkType: 'magic', res: { phys: 40, magic: 45, poison: 65 }, hp: 1.7, dmg: 1.4, spd: 0.9, specialties: ['burning', 'enraged'] },
      creatures: [
        { name: 'Grief-Ash Revenant', attack: 'Relic-Hurl', atkType: 'phys', res: { phys: 35, magic: 25, poison: 60 }, hp: 1.1, dmg: 1.2, spd: 0.9 },
        { name: 'Origin-Point Flame', attack: 'Rite-Scar Fire', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 0.8, dmg: 1.3, spd: 1.2 },
        { name: 'Compacted Bone-Golem', attack: 'Battlefield Fist', atkType: 'phys', res: { phys: 50, magic: 15, poison: 70 }, hp: 1.4, dmg: 1.1, spd: 0.6 },
      ] },
  ],
}, // ===== end Chapter 4 =====
{ // ================= CHAPTER 5 =================
  num: 5, title: 'Chapter 5: The Sable Peaks', icon: '⛰️', shopName: 'High Pass Provisioners',
  headline: 'A watched corridor, a name from Kharun\'s past, and a keep waiting at the top of the climb.',
  story: [
    'The climb into the Sable Peaks starts easy and turns vicious fast — thin air, black rock, and switchback trails that predate any road on a map. Minnie\'s borrowed travel-ward reads stronger the higher they climb, confirming what she suspected: her masters marked a route through here once, likely more than once, for reasons the academy never fully explained to junior mages. She\'s beginning to understand why.',
    'The peaks aren\'t just a mountain range between them and the academy. Old habitation signs — cairns, way-shelters, a few worn shrine-alcoves — suggest this was a monitored corridor once, watched deliberately. And carved faintly into one weathered way-shelter wall, half-erased by centuries of wind, is a family crest neither Kharun nor Pars have seen before, but one that makes both of them stop walking.',
  ],
  ending: [
    'The voice belongs to Aldric, Kharun\'s old comrade — the man who saved his life twice, then sold his unit to slaughter one night twenty years ago. He sounds exactly as Kharun remembers him. That, more than anything, is what unsettles Minnie, watching from behind: whatever\'s inside Aldric has had twenty years to wear him perfectly, patiently, the same way it wore the Betrayer three centuries before.',
    'Pars, still processing everything Halewick and the vault records revealed about his own bloodline, quietly tells Kharun something he\'s been holding back since the Ashen Steppe: if the completed rite truly needs both their bloodline-debts closed, then whatever waits inside Fallcrest isn\'t just Kharun\'s reckoning. It\'s a test of whether either of them can actually go through with what the ending demands — killing someone who still, on some level, might be a person underneath the thing wearing him.',
    'Kharun doesn\'t answer. He just draws his blade and walks toward the open gate, toward the man who broke him twenty years ago, finally close enough to ask the only question that\'s mattered since that night: why.',
    'The Sable Peaks chapter ends at the threshold of Fallcrest Keep, gates open, Aldric waiting inside — and Chapter 6 begins the moment Kharun steps through.',
  ],
  rareA: ['Crag', 'Frost', 'Peak', 'Storm', 'Ledge', 'Snow', 'Black-Rock', 'Col'],
  rareB: ['Fang', 'Lurker', 'Climber', 'Screamer', 'Stalker', 'Runner', 'Roost-Robber', 'Watcher'],
  eliteTitles: ['the Switchback Terror', 'the Frost-Warped', 'the High Road\'s Toll', 'the Avalanche-Woken',
                'the Shrine-Feeder', 'the Storm-Riding', 'the Corridor\'s Warden', 'the Gate\'s Shadow'],
  quests: [
    { name: 'The Switchback Ambush', location: 'The Lower Switchbacks',
      intro: ['The trail\'s first real test comes before the cold does — something\'s been using the narrow switchbacks to pick off solitary travelers for longer than the group realizes.'],
      objective: 'Clear the lower switchbacks of whatever\'s denned in the rockface above the trail.',
      outro: ['A pack of Crag-Fangs, mountain predators warped lean and pale by thin, taint-touched air drifting down from higher elevations, drop from ledges in coordinated ambush. Clearing them reveals claw-marks scoring an old way-marker post — deliberately defaced, the same way Blackthorn\'s trail-markers were.'],
      setup: 'Sets up Quest 2: someone\'s been sabotaging safe passage through here on purpose, recently.',
      boss: { name: 'Crag-Fang', attack: 'Ledge-Drop Ambush', atkType: 'phys', res: { phys: 20, magic: 15, poison: 30 }, hp: 1.1, dmg: 1.2, spd: 1.4, specialties: ['swift', 'evasive'] },
      creatures: [
        { name: 'Crag-Fang Whelp', attack: 'Pale Bite', atkType: 'phys', res: { phys: 10, magic: 10, poison: 20 }, hp: 0.7, dmg: 1.0, spd: 1.4 },
        { name: 'Switchback Raptor', attack: 'Talon Rake', atkType: 'phys', res: { phys: 5, magic: 15, poison: 15 }, hp: 0.8, dmg: 1.3, spd: 1.3 },
        { name: 'Thin-Air Wisp', attack: 'Breath-Stealing Chill', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
      ] },
    { name: 'The Sabotaged Waypost', location: 'Frostline Waypost',
      intro: ['The defaced marker leads to a proper waypost, clearly maintained once, now half-collapsed and stripped of anything useful.'],
      objective: 'Investigate the ruined waypost and clear whatever\'s using its shelter now.',
      outro: ['A Frost-Warped Lurker, once a mountain hermit or guide, twisted by prolonged taint exposure into something barely upright, has been luring travelers into the collapsed shelter to die. Searching its lair turns up scavenged supplies — including, unmistakably, guild-marked crates. The guild has a presence up here too.'],
      setup: 'Sets up Quest 3: the guild\'s reach extends into the peaks, meaning this corridor matters to more than just the academy.',
      boss: { name: 'Frost-Warped Lurker', attack: 'Shelter-Trap Grasp', atkType: 'phys', res: { phys: 25, magic: 30, poison: 45 }, hp: 1.3, dmg: 1.2, spd: 0.9, specialties: ['frozen', 'vampiric'] },
      creatures: [
        { name: 'Waypost Scavenger', attack: 'Desperate Claw', atkType: 'phys', res: { phys: 15, magic: 10, poison: 30 }, hp: 0.9, dmg: 1.0, spd: 1.1 },
        { name: 'Frostline Bat', attack: 'Ice-Wing Cut', atkType: 'phys', res: { phys: 5, magic: 25, poison: 20 }, hp: 0.6, dmg: 1.1, spd: 1.5 },
        { name: 'Collapsed-Roof Haunt', attack: 'Beam-Fall Slam', atkType: 'magic', res: { phys: 45, magic: 25, poison: 65 }, hp: 1.0, dmg: 1.2, spd: 0.8 },
      ] },
    { name: 'The Guild\'s High Road', location: 'The Smuggler\'s Cut',
      intro: ['A narrow secondary path, clearly guild-maintained despite the altitude, cuts across the main trail — a deliberate bypass around the more visible route.'],
      objective: 'Follow the smuggler\'s cut and determine what the guild\'s been moving through the high peaks.',
      outro: ['Corrupted Cut-Runners, guild couriers exposed to taint on repeated trips through this route, ambush the group with practiced, professional violence rather than mindless aggression. Their cargo, once again, is ward-glyph shipments — but this time addressed to a destination the group hasn\'t heard yet: Fallcrest Keep.'],
      setup: 'Sets up Quest 4: a name surfaces — Fallcrest Keep — and Kharun reacts to it before anyone explains why.',
      boss: { name: 'Corrupted Cut-Runner', attack: 'Courier\'s Knife-Work', atkType: 'phys', res: { phys: 20, magic: 15, poison: 35 }, hp: 1.1, dmg: 1.3, spd: 1.3, specialties: ['swift', 'berserk'] },
      creatures: [
        { name: 'High-Road Porter', attack: 'Pack-Frame Swing', atkType: 'phys', res: { phys: 25, magic: 5, poison: 25 }, hp: 1.1, dmg: 1.0, spd: 0.9 },
        { name: 'Cut-Path Lookout', attack: 'Sling-Stone Shot', atkType: 'phys', res: { phys: 10, magic: 10, poison: 15 }, hp: 0.8, dmg: 1.2, spd: 1.2 },
        { name: 'Glyph-Crate Wisp', attack: 'Leaking Ward-Spark', atkType: 'magic', res: { phys: 35, magic: 30, poison: 55 }, hp: 0.7, dmg: 1.3, spd: 1.1 },
      ] },
    { name: 'The Name on the Manifest', location: 'The Overlook Ruins',
      intro: ['Kharun goes quiet the moment he reads "Fallcrest" on the manifest — it\'s a name from his own service record, an old fortress his deserted unit was garrisoned near the season everything fell apart.'],
      objective: 'Search the overlook ruins above the smuggler\'s cut for anything confirming the Fallcrest connection.',
      outro: ['A Watchpost Revenant, the corrupted remains of whoever manned this overlook last, guards old survey documents confirming Fallcrest Keep\'s location — and noting, in a hand Kharun recognizes immediately, that it was garrisoned by his own former unit\'s remnants after his desertion. Someone he served under is still connected to that keep.'],
      setup: 'Sets up Quest 5: Kharun\'s past and the guild\'s current operations are converging on the same fortress.',
      boss: { name: 'Watchpost Revenant', attack: 'Last Watch Kept', atkType: 'magic', res: { phys: 45, magic: 30, poison: 70 }, hp: 1.2, dmg: 1.3, spd: 1.0, specialties: ['spectral', 'cursed'] },
      creatures: [
        { name: 'Overlook Shade', attack: 'Long-Vigil Grasp', atkType: 'magic', res: { phys: 40, magic: 25, poison: 65 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
        { name: 'Ruin-Nesting Roc-Chick', attack: 'Hungry Peck', atkType: 'phys', res: { phys: 10, magic: 10, poison: 20 }, hp: 0.9, dmg: 1.1, spd: 1.3 },
        { name: 'Survey-Stone Golem', attack: 'Boundary-Marker Slam', atkType: 'phys', res: { phys: 50, magic: 10, poison: 70 }, hp: 1.4, dmg: 1.0, spd: 0.6 },
      ] },
    { name: 'What the Snow Buried', location: 'The Avalanche Field',
      intro: ['An old avalanche has buried a stretch of trail entirely, and something valuable is entombed beneath it — guild cargo lost mid-transport, judging by exposed crate corners.'],
      objective: 'Excavate the avalanche field and clear whatever\'s claimed the buried cargo as a den.',
      outro: ['An Ice-Bound Horror, a corrupted creature frozen mid-transformation when the avalanche struck years ago, thaws and attacks the moment its icy prison is disturbed. Beneath it, recovered cargo includes personnel records — and one name, flagged as "Keep Commander, compromised, monitor," stops Kharun cold. It\'s the officer who once saved his life on the same battlefield where his unit was later slaughtered.'],
      setup: 'Sets up Quest 6: the man Kharun trusted enough to follow into war is alive, compromised, and waiting at Fallcrest.',
      boss: { name: 'Ice-Bound Horror', attack: 'Mid-Thaw Frenzy', atkType: 'phys', res: { phys: 40, magic: 30, poison: 60 }, hp: 1.5, dmg: 1.2, spd: 0.7, specialties: ['frozen', 'colossal'] },
      creatures: [
        { name: 'Snow-Burrow Weasel', attack: 'Tunnel Strike', atkType: 'phys', res: { phys: 10, magic: 15, poison: 25 }, hp: 0.7, dmg: 1.1, spd: 1.4 },
        { name: 'Avalanche Remnant', attack: 'Packed-Ice Fist', atkType: 'phys', res: { phys: 45, magic: 20, poison: 65 }, hp: 1.3, dmg: 1.0, spd: 0.6 },
        { name: 'Cold-Snap Wisp', attack: 'Flash-Freeze Pulse', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
      ] },
    { name: 'The High Shrine', location: 'Sable Peak Shrine',
      intro: ['A small, ancient shrine near the range\'s midpoint shows signs of recent, deliberate visitation — candles, offerings, and wards not unlike the academy\'s own protective glyphs, badly weathering the climb.'],
      objective: 'Reach the high shrine and defend it while Minnie determines who\'s been maintaining it.',
      outro: ['A Shrine-Bound Wisp Swarm, remnant academy ward-spirits gone feral from decades of neglect and nearby taint, attacks anything that approaches without proper credentials — recognizing Minnie\'s academy training just barely enough to hold back from killing her outright. She confirms it: this shrine was an academy waypoint, part of the same corridor system as her travel-ward, meaning her masters passed through here themselves, more than once, likely tracking the very fortress the group is now headed toward.'],
      setup: 'Sets up Quest 7: the academy already knew about Fallcrest Keep, long before any of this started.',
      boss: { name: 'Shrine-Bound Wisp Swarm', attack: 'Feral Ward-Storm', atkType: 'magic', res: { phys: 50, magic: 35, poison: 70 }, hp: 1.0, dmg: 1.4, spd: 1.3, specialties: ['magical', 'evasive'] },
      creatures: [
        { name: 'Feral Ward-Spirit', attack: 'Credential Challenge', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
        { name: 'Offering-Thief Marten', attack: 'Candle-Dark Snatch', atkType: 'phys', res: { phys: 10, magic: 10, poison: 20 }, hp: 0.7, dmg: 1.0, spd: 1.5 },
        { name: 'Weathered Glyph-Guard', attack: 'Eroded Ward-Pulse', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 1.1, dmg: 1.1, spd: 0.8 },
      ] },
    { name: 'The Frozen Cache', location: 'The Hidden Ledge',
      intro: ['The shrine\'s wards, once fully read, point toward a hidden ledge cache — an academy dead-drop, clearly meant for traveling masters to leave and retrieve materials securely.'],
      objective: 'Reach the hidden ledge and secure the academy cache, defending it from whatever\'s been drawn to its lingering magic.',
      outro: ['A Ledge-Bound Chimera, a corrupted mountain predator fused disturbingly with leaked academy warding energy, guards the ledge with genuinely dangerous elemental attacks. Inside the cache: academy field notes, years old, naming Fallcrest Keep\'s commander explicitly as a person of concern — flagged for behavior consistent with slow, low-grade possession.'],
      setup: 'Sets up Quest 8: the academy suspected Kharun\'s old commander was compromised years before the group ever got here.',
      boss: { name: 'Ledge-Bound Chimera', attack: 'Ward-Fused Elements', atkType: 'magic', res: { phys: 30, magic: 40, poison: 50 }, hp: 1.4, dmg: 1.4, spd: 1.0, specialties: ['magical', 'enraged'] },
      creatures: [
        { name: 'Cache-Drawn Stalker', attack: 'Magic-Scent Pounce', atkType: 'phys', res: { phys: 20, magic: 20, poison: 30 }, hp: 1.0, dmg: 1.2, spd: 1.2 },
        { name: 'Dead-Drop Wisp', attack: 'Lingering Ward-Arc', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
        { name: 'Ledge-Edge Crawler', attack: 'Sheer-Drop Shove', atkType: 'phys', res: { phys: 30, magic: 15, poison: 40 }, hp: 1.1, dmg: 1.1, spd: 0.9 },
      ] },
    { name: 'The Storm Pass', location: 'The Screaming Col',
      intro: ['The final approach toward Fallcrest requires crossing an infamous mountain pass, made worse by an unnatural storm that seems to intensify the closer the group gets.'],
      objective: 'Cross the storm pass and survive whatever the unnatural weather has stirred up.',
      outro: ['A Storm-Touched Roc, an apex mountain predator warped massive and vicious by the same taint thickening the air here, attacks mid-crossing in brutal, weather-lashed combat. Surviving the crossing, the group finally gets a clear view through breaking clouds: Fallcrest Keep itself, brooding on a black cliff ahead, banners flying in colors Kharun hasn\'t seen in twenty years.'],
      setup: 'Sets up Quest 9: the keep is finally, visibly in reach, and Kharun has to reckon with what waits inside it.',
      boss: { name: 'Storm-Touched Roc', attack: 'Weather-Lashed Dive', atkType: 'phys', res: { phys: 25, magic: 35, poison: 40 }, hp: 1.4, dmg: 1.4, spd: 1.3, specialties: ['swift', 'frozen'] },
      creatures: [
        { name: 'Col-Wind Harrier', attack: 'Gust-Riding Talons', atkType: 'phys', res: { phys: 5, magic: 20, poison: 15 }, hp: 0.8, dmg: 1.2, spd: 1.4 },
        { name: 'Screaming Gale-Wisp', attack: 'Deafening Shear', atkType: 'magic', res: { phys: 45, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
        { name: 'Storm-Grounded Yak', attack: 'Panicked Gore', atkType: 'phys', res: { phys: 30, magic: 10, poison: 30 }, hp: 1.3, dmg: 1.1, spd: 0.8 },
      ] },
    { name: 'The Approach Road', location: 'Fallcrest Approach',
      intro: ['The last stretch before the keep\'s gates is patrolled, heavily, by soldiers wearing Kharun\'s old unit\'s colors — men who should not still be garrisoned here, twenty years on, unaged in ways that make Kharun\'s skin crawl.'],
      objective: 'Fight through the approach road\'s patrol without giving away the group\'s full strength before reaching the gates.',
      outro: ['A unit of Bound Garrison Soldiers, kept animate and loyal far past any natural service length by the same corruption infecting their commander, fight with drilled, disciplined precision rather than mindless aggression — the closest thing to a real military engagement the group has faced. Breaking through, they reach Fallcrest\'s gates standing open, unguarded, clearly expecting them.'],
      setup: 'Sets up Quest 10: the true reckoning is inside — but first, the keep itself resists.',
      boss: { name: 'Bound Garrison Soldier', attack: 'Drilled Formation Strike', atkType: 'phys', res: { phys: 40, magic: 20, poison: 55 }, hp: 1.3, dmg: 1.2, spd: 1.0, specialties: ['resistant', 'resilient'] },
      creatures: [
        { name: 'Unaged Pikeman', attack: 'Twenty-Year Thrust', atkType: 'phys', res: { phys: 35, magic: 15, poison: 50 }, hp: 1.1, dmg: 1.1, spd: 0.9 },
        { name: 'Patrol Signal-Horn', attack: 'Rallying Blast', atkType: 'magic', res: { phys: 30, magic: 25, poison: 55 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
        { name: 'Approach-Road Hound', attack: 'Disciplined Takedown', atkType: 'phys', res: { phys: 20, magic: 10, poison: 30 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
      ] },
    { name: 'The Gatehouse Guardian', location: 'Fallcrest Gatehouse',
      intro: ['Before the group can enter the keep proper, its gatehouse itself resists them — animated by decades of accumulated corruption into the Gatehouse Colossus, a fusion of stone, old iron portcullis, and the calcified remains of whatever garrison once manned it, all bound together and set as a final filter to test anyone approaching the commander uninvited.'],
      objective: 'Destroy the Gatehouse Colossus and force entry into Fallcrest Keep.',
      outro: ['The fight is grueling and mechanical, the Colossus using the gatehouse\'s own architecture — crushing gates, falling debris, arrow-slit barrages from long-dead archers still animated at their posts — as weapons. When it finally collapses, the gates beyond stand fully open, and a voice Kharun hasn\'t heard in twenty years calls out from the darkness inside, warm and familiar in exactly the wrong way: "Kharun. You always did find your way back to me eventually."'],
      setup: null,
      boss: { name: 'Gatehouse Colossus', attack: 'Portcullis Guillotine', atkType: 'phys', res: { phys: 55, magic: 25, poison: 70 }, hp: 1.7, dmg: 1.3, spd: 0.5, specialties: ['golem', 'colossal'] },
      creatures: [
        { name: 'Calcified Archer', attack: 'Arrow-Slit Barrage', atkType: 'phys', res: { phys: 40, magic: 15, poison: 65 }, hp: 0.9, dmg: 1.3, spd: 1.0 },
        { name: 'Gate-Stone Shard', attack: 'Debris Fall', atkType: 'phys', res: { phys: 50, magic: 10, poison: 70 }, hp: 1.2, dmg: 1.0, spd: 0.7 },
        { name: 'Murder-Hole Wisp', attack: 'Boiling Ward-Spit', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
      ] },
  ],
}, // ===== end Chapter 5 =====
{ // ================= CHAPTER 6 =================
  num: 6, title: 'Chapter 6: Fallcrest Keep', icon: '🏰', shopName: 'Fallcrest Quartermaster',
  headline: 'Twenty years of running end at an open gate, with Aldric waiting inside.',
  story: [
    'Aldric\'s voice carries out from the dark of the gatehouse tunnel, warm as it always was, wrong in every way that matters. Kharun walks through anyway, sword drawn, because twenty years of running from this exact moment has to end somewhere, and it might as well end here.',
    'He doesn\'t get three steps into the courtyard before the fighting starts — not from Aldric, not yet, but from something else entirely: four strangers, badly outnumbered, backed against a collapsed stable wall by a pack of corrupted keep-hounds twice the size they should be.',
  ],
  ending: [
    'They dig each other out of the rubble in the gray light after, bruised, singed, and alive only because two groups of strangers happened to need the same keep on the same day. Kage grins through a split lip and says it\'s the best story he\'s had in years; J.R. is already composing, muttering rhymes under his breath about falling towers and last-second saves. Xazel presses a final round of field-healing into all three of the group\'s worst wounds, refusing payment, insisting the debt runs the other way after Quest 1. Begum simply nods once at Kharun — professional respect, nothing more needed.',
    'Their business here is done; the records Kage\'s party found in the office confirm no further threat remains in Fallcrest worth their contract, and they have their own road to walk. They part at the broken gate with easy, genuine farewells, Kage clasping arms with Kharun, J.R. promising the ballad will do them all justice, Begum already scouting the horizon for her party\'s next job. It\'s the kind of goodbye that doesn\'t need to be permanent to matter.',
    'Alone again, the three of them stand over Fallcrest\'s ruin, one debt finally, truly closed. Kharun feels lighter than he has in twenty years and heavier than he\'s ever felt in his life, both at once. Minnie, examining the scattered remains of the Unbound Herald\'s essence, finds something troubling in its dispersal pattern — it didn\'t simply die. It fled, fast, retreating toward the one place old academy scrying-work always seems to point: deep beneath the earth, toward wherever the true seal is thinnest.',
    'Pars, quiet through most of the aftermath, finally voices what\'s been sitting with him since Vesk: with Kharun\'s debt closed, the rite fragment says the next piece has to be his — his bloodline, his unfinished truth, waiting somewhere his own family tried to bury him away from twenty years ago.',
    'The Fallcrest Keep chapter ends with the group turning away from mountains and toward stone — deep, ancient, magically scarred stone — as Minnie\'s scrying leads them down into the Glass Caverns, the last approach before the sealed halls of her own academy.',
  ],
  rareA: ['Keep', 'Kennel', 'Barracks', 'Rampart', 'Tower', 'Courtyard', 'Bound', 'Grief'],
  rareB: ['Hound', 'Husk', 'Sentinel', 'Warden', 'Wraith', 'Guard', 'Crawler', 'Keeper'],
  eliteTitles: ['the Kennel-Master', 'the Garrison\'s Silence', 'the Armory Horror', 'the Crossing\'s Toll',
                'the Stair-Warden', 'the Commander\'s Shadow', 'the Door\'s Sworn', 'the Tower-Breaker'],
  quests: [
    { name: 'Strangers at the Wall', location: 'The Inner Courtyard',
      intro: ['A fighter built like a door, a cleric holding a line of failing light, a bard doing something with his voice that\'s actively confusing the hounds, and an archer methodically thinning the pack from a broken rampart — four adventurers, clearly skilled, clearly losing.'],
      objective: 'Aid the strangers and clear the corrupted hound pack before it overwhelms them.',
      outro: ['Together, the group and the four strangers put down the Kennel-Bound Pack in short, brutal work — five fighters is simply more than the hounds\' twisted instincts know how to handle. Introductions come after, breathless: Kage the fighter, blunt and grateful; Xazel the cleric, already assessing everyone\'s wounds out of habit; J.R. the bard, delighted to have a story worth telling later; and Begum the archer, quiet, already scanning the next rampart for trouble. They\'re here on a monster-hunting contract of their own — the keep\'s garrison hasn\'t sent word out in months, and someone finally got paid to find out why.'],
      setup: 'Sets up Quest 2: two groups, one keep, overlapping reasons to go deeper.',
      boss: { name: 'Kennel-Bound Alpha', attack: 'Double-Sized Maul', atkType: 'phys', res: { phys: 25, magic: 10, poison: 35 }, hp: 1.3, dmg: 1.3, spd: 1.2, specialties: ['swift', 'vampiric'] },
      creatures: [
        { name: 'Kennel-Bound Hound', attack: 'Twisted-Instinct Bite', atkType: 'phys', res: { phys: 15, magic: 5, poison: 30 }, hp: 0.9, dmg: 1.1, spd: 1.3 },
        { name: 'Stable-Wall Rat', attack: 'Rubble-Dart Nip', atkType: 'poison', res: { phys: 5, magic: 0, poison: 45 }, hp: 0.6, dmg: 1.0, spd: 1.5 },
        { name: 'Courtyard Carrion-Crow', attack: 'Opportunist Dive', atkType: 'phys', res: { phys: 5, magic: 10, poison: 20 }, hp: 0.7, dmg: 1.1, spd: 1.4 },
      ] },
    { name: 'The Garrison\'s Silence', location: 'The Barracks Hall',
      intro: ['The two parties agree, loosely, to push toward the keep\'s central hall together — safer in numbers, faster than splitting up blind.'],
      objective: 'Clear the barracks hall of whatever silenced the garrison, alongside Kage\'s party.',
      outro: ['A cluster of Bound Garrison Wraiths, more of the same unnaturally preserved soldiers from the approach road, attack in disciplined formation. The fight goes easier with eight blades instead of three, and Xazel\'s battlefield healing keeps the whole group standing through it. Past the barracks, a locked armory door bears fresh scratch-marks — something\'s been trying to get out, not in.'],
      setup: 'Sets up Quest 3: something is caged inside the keep, and it isn\'t happy about it.',
      boss: { name: 'Bound Garrison Wraith', attack: 'Formation Phalanx', atkType: 'magic', res: { phys: 50, magic: 30, poison: 70 }, hp: 1.2, dmg: 1.3, spd: 1.0, specialties: ['spectral', 'resistant'] },
      creatures: [
        { name: 'Bunk-Row Shade', attack: 'Sleepless Grasp', atkType: 'magic', res: { phys: 45, magic: 25, poison: 65 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
        { name: 'Mess-Hall Ghoul', attack: 'Ration-Starved Claw', atkType: 'poison', res: { phys: 20, magic: 10, poison: 55 }, hp: 1.1, dmg: 1.1, spd: 0.9 },
        { name: 'Drill-Yard Echo', attack: 'Phantom Volley', atkType: 'phys', res: { phys: 35, magic: 20, poison: 60 }, hp: 0.9, dmg: 1.2, spd: 1.0 },
      ] },
    { name: 'What the Armory Held', location: 'The Sealed Armory',
      intro: ['Begum\'s practiced eye reads the scratch marks as claw-work, recent, frantic.'],
      objective: 'Breach the armory and deal with whatever\'s been trapped inside.',
      outro: ['A Cage-Bound Fleshwarp, a keep soldier fused disturbingly with his own armor by prolonged corrupted exposure, bursts out starving and feral the moment the door gives. The combined group brings it down fast, and Kage claps Kharun on the shoulder afterward with the easy camaraderie of someone who doesn\'t yet know why Kharun\'s jaw is tight every time this keep\'s name comes up.'],
      setup: 'Sets up Quest 4: the two parties split here, their goals finally diverging.',
      boss: { name: 'Cage-Bound Fleshwarp', attack: 'Armor-Fused Frenzy', atkType: 'phys', res: { phys: 45, magic: 15, poison: 60 }, hp: 1.4, dmg: 1.3, spd: 1.0, specialties: ['berserk', 'enraged'] },
      creatures: [
        { name: 'Armory Rust-Mite', attack: 'Metal-Eating Gnaw', atkType: 'poison', res: { phys: 30, magic: 10, poison: 50 }, hp: 0.7, dmg: 1.0, spd: 1.3 },
        { name: 'Rack-Fallen Blade', attack: 'Masterless Swing', atkType: 'phys', res: { phys: 40, magic: 20, poison: 70 }, hp: 0.9, dmg: 1.3, spd: 1.0 },
        { name: 'Powder-Store Wisp', attack: 'Spark-Risk Flare', atkType: 'magic', res: { phys: 35, magic: 30, poison: 55 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
      ] },
    { name: 'The Parting of Ways', location: 'The Central Crossing',
      intro: ['At the hall\'s central crossing, the paths diverge — one route toward the keep\'s records office, where Kage\'s party means to find out who\'s actually been paying to keep this place quiet; the other toward the commander\'s tower, where Kharun\'s group needs to go.'],
      objective: 'Clear the crossing\'s guardian so both parties can move on safely.',
      outro: ['A Crossing Sentinel, an animated suit of old ceremonial armor bound by lingering corruption, tests both parties at once in a chaotic, multi-front fight before finally falling. Kage\'s party heads for the records office with a promise, half-joking, half-not, to come running if things get loud. Minnie\'s group heads for the tower.'],
      setup: 'Sets up Quest 5: alone again, the real weight of Fallcrest settles back onto Kharun\'s shoulders.',
      boss: { name: 'Crossing Sentinel', attack: 'Ceremonial Halberd Arc', atkType: 'phys', res: { phys: 50, magic: 30, poison: 70 }, hp: 1.4, dmg: 1.2, spd: 0.8, specialties: ['golem', 'charm'] },
      creatures: [
        { name: 'Animated Gauntlet', attack: 'Disembodied Grip', atkType: 'phys', res: { phys: 45, magic: 20, poison: 70 }, hp: 0.8, dmg: 1.1, spd: 1.2 },
        { name: 'Banner-Cloth Phantom', attack: 'Smothering Drape', atkType: 'magic', res: { phys: 50, magic: 25, poison: 65 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
        { name: 'Crossing-Flag Golemite', attack: 'Standard-Base Slam', atkType: 'phys', res: { phys: 45, magic: 15, poison: 70 }, hp: 1.2, dmg: 1.0, spd: 0.7 },
      ] },
    { name: 'The Tower Stair', location: 'The Commander\'s Tower Stair',
      intro: ['The stairwell up to Aldric\'s quarters is lined with portraits, old unit banners, and — impossibly — fresh flowers, tended recently, absurdly domestic against everything else in this ruin.'],
      objective: 'Climb the tower stair and clear whatever guards Aldric\'s private approach.',
      outro: ['A Loyal Husk, once Aldric\'s personal aide, kept animate and devoted long past death by the commander\'s own bleeding corruption, fights with tragic, desperate loyalty until it\'s put down. A locked personal journal on its body, once forced open, contains twenty years of Aldric\'s own handwriting — slowly, entry by entry, losing itself.'],
      setup: 'Sets up Quest 6: Kharun reads the journal, and it changes what he thought he came here for.',
      boss: { name: 'Loyal Husk', attack: 'Devoted Last Stand', atkType: 'phys', res: { phys: 40, magic: 20, poison: 65 }, hp: 1.4, dmg: 1.2, spd: 0.9, specialties: ['resilient', 'cursed'] },
      creatures: [
        { name: 'Portrait-Eye Watcher', attack: 'Painted Stare', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.1 },
        { name: 'Stair-Sweep Servant', attack: 'Broom-Handle Crack', atkType: 'phys', res: { phys: 25, magic: 10, poison: 50 }, hp: 1.0, dmg: 1.0, spd: 1.0 },
        { name: 'Fresh-Flower Sprite', attack: 'Absurd Bloom-Burst', atkType: 'magic', res: { phys: 20, magic: 30, poison: 45 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
      ] },
    { name: 'The Commander\'s Journal', location: 'The Tower Landing',
      intro: ['Minnie and Pars stand guard while Kharun reads, and the journal is worse than any of them expected — Aldric fighting the thing inside him for years, entry after entry begging whoever eventually came looking to end him properly instead of trying to save him.'],
      objective: 'Defend the tower landing while Kharun finishes the journal, against whatever the reading disturbs.',
      outro: ['A Grief-Bound Wraith, manifesting from the sheer weight of Aldric\'s own recorded despair, attacks almost mournfully, as though even it doesn\'t want to be doing this. Once defeated, Kharun closes the journal with steady hands and a face that isn\'t steady at all. He knows now what he has to do. He still doesn\'t know if he can.'],
      setup: 'Sets up Quest 7: the door to Aldric\'s chambers is the last thing left between Kharun and the answer he\'s chased for twenty years.',
      boss: { name: 'Grief-Bound Wraith', attack: 'Weight of Despair', atkType: 'magic', res: { phys: 50, magic: 35, poison: 70 }, hp: 1.2, dmg: 1.3, spd: 1.0, specialties: ['spectral', 'necrotic'] },
      creatures: [
        { name: 'Despair Mote', attack: 'Sinking Heaviness', atkType: 'magic', res: { phys: 45, magic: 25, poison: 65 }, hp: 0.6, dmg: 1.2, spd: 1.3 },
        { name: 'Landing-Shadow Creep', attack: 'Underfoot Grasp', atkType: 'phys', res: { phys: 30, magic: 20, poison: 55 }, hp: 0.9, dmg: 1.1, spd: 1.0 },
        { name: 'Torn-Page Flock', attack: 'Paper-Edge Storm', atkType: 'phys', res: { phys: 25, magic: 25, poison: 50 }, hp: 0.7, dmg: 1.2, spd: 1.4 },
      ] },
    { name: 'The Chamber Door', location: 'Outside Aldric\'s Chambers',
      intro: ['The door itself resists opening, warded from the inside by whatever\'s wearing Aldric now, unwilling to be interrupted before it\'s ready.'],
      objective: 'Force the chamber door and push through its final ward before facing Aldric directly.',
      outro: ['A Door-Bound Guardian, a construct woven from the same corrupted ward-magic seen throughout the keep, defends the threshold with genuine, dangerous strength — the hardest fight of the chapter so far. When it finally shatters, the door swings open on its own, and Aldric\'s voice calls out again, closer now, almost gentle: "Come in, then. Let\'s finish this properly."'],
      setup: 'Sets up Quest 8: the confrontation Kharun has waited twenty years for.',
      boss: { name: 'Door-Bound Guardian', attack: 'Threshold Denial', atkType: 'magic', res: { phys: 50, magic: 40, poison: 70 }, hp: 1.5, dmg: 1.3, spd: 0.8, specialties: ['golem', 'resistant'] },
      creatures: [
        { name: 'Ward-Thread Weaver', attack: 'Binding Filament', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.8, dmg: 1.2, spd: 1.2 },
        { name: 'Hinge-Iron Imp', attack: 'Slamming Jamb', atkType: 'phys', res: { phys: 45, magic: 15, poison: 65 }, hp: 0.9, dmg: 1.1, spd: 1.1 },
        { name: 'Lock-Tumbler Golemite', attack: 'Bolt-Throw Punch', atkType: 'phys', res: { phys: 50, magic: 20, poison: 70 }, hp: 1.2, dmg: 1.0, spd: 0.7 },
      ] },
    { name: 'Kharun\'s Revenge: The Commander\'s Chamber', location: 'Aldric\'s Private Chamber',
      intro: ['Aldric sits by a cold hearth, looking exactly as Kharun remembers him — older, tired, still recognizably the man who saved his life twice.'],
      objective: 'Confront Aldric and end what the demon started twenty years ago.',
      outro: ['He doesn\'t fight at first. He talks — apologizes, in a voice that\'s entirely his own, for a betrayal he remembers every second of and was never able to stop from the inside. Then something underneath him smiles with his mouth, and the real fight begins: the Bound Commander, Aldric\'s body driven by a servant of Vorrhak given twenty years to root in deep, fights with brutal skill honed from decades of real command experience twisted toward violence. Kharun ends it, finally — a clean strike, not out of fury but out of mercy, and in the half-second before the corruption fully releases its hold, Aldric\'s own eyes clear one last time, and he manages three words: "Thank you. Finally." Then he\'s gone, and something dark tears free of his collapsing body, refusing to simply die with him.'],
      setup: 'Sets up Quest 9: the servant that wore Aldric for twenty years won\'t go quietly, and it\'s stronger unbound than it ever was contained.',
      boss: { name: 'The Bound Commander', attack: 'Twenty Years of Command', atkType: 'phys', res: { phys: 40, magic: 30, poison: 55 }, hp: 1.5, dmg: 1.4, spd: 1.1, specialties: ['berserk', 'cursed'] },
      creatures: [
        { name: 'Hearth-Shadow Servant', attack: 'Cold-Ash Fling', atkType: 'magic', res: { phys: 35, magic: 25, poison: 55 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
        { name: 'Chamber Guard-Echo', attack: 'Remembered Drill', atkType: 'phys', res: { phys: 40, magic: 20, poison: 60 }, hp: 1.1, dmg: 1.2, spd: 0.9 },
        { name: 'Root-Deep Tendril', attack: 'Twenty-Year Grip', atkType: 'poison', res: { phys: 25, magic: 20, poison: 60 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
      ] },
    { name: 'What Tears Free', location: 'The Chamber\'s Collapse',
      intro: ['The freed servant-spirit, no longer needing Aldric\'s body, begins pulling raw corruption from the entire keep into itself, and the chamber starts to come apart around the fight.'],
      objective: 'Prevent the freed servant from fully manifesting before the tower collapses.',
      outro: ['The Unbound Herald, faster and more vicious than either previous Herald encountered, fights without a body\'s limits, forcing the group through a running battle down the collapsing tower stair itself. It\'s a fight the group is, for the first time, genuinely losing — outmatched by something no longer tethered to a mortal shell, the tower crumbling faster than they can retreat.'],
      setup: 'Sets up Quest 10: the chapter\'s true climax, at the very edge of defeat.',
      boss: { name: 'The Unbound Herald', attack: 'Bodiless Fury', atkType: 'magic', res: { phys: 55, magic: 35, poison: 70 }, hp: 1.4, dmg: 1.4, spd: 1.3, specialties: ['swift', 'spectral'] },
      creatures: [
        { name: 'Corruption Draw-Wisp', attack: 'Siphoned Keep-Rot', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
        { name: 'Falling-Stone Haunt', attack: 'Collapse Shove', atkType: 'phys', res: { phys: 50, magic: 15, poison: 70 }, hp: 1.1, dmg: 1.2, spd: 0.8 },
        { name: 'Stair-Split Shade', attack: 'Tripping Dark', atkType: 'magic', res: { phys: 40, magic: 25, poison: 60 }, hp: 0.8, dmg: 1.1, spd: 1.2 },
      ] },
    { name: 'The Falling Tower', location: 'Fallcrest Tower Base',
      intro: ['Cornered at the tower\'s collapsing base, the group makes their stand against the Unbound Herald at full strength — the hardest, most desperate fight of the story so far, Minnie\'s spells running thin, Pars bleeding from a dozen cuts, Kharun standing his ground purely on stubbornness.'],
      objective: 'Survive and destroy the Unbound Herald before the tower buries all three of them.',
      outro: ['Just as the Herald raises a final blow that would end the fight for good, Kage crashes through the rubble from the side, shield raised, taking the strike meant for Kharun; Begum\'s arrows pin the Herald\'s attention long enough for Xazel to throw a barrier around the group\'s collapsing flank; J.R.\'s voice cuts through the chaos with something that isn\'t just a song — a genuine, desperate working that steadies every failing nerve in the room. Between both parties fighting as one for the first and only time, the Unbound Herald finally shatters, its corrupted essence scattering into the collapsing stone as the tower comes down around all seven of them.'],
      setup: null,
      boss: { name: 'The Unbound Herald Ascendant', attack: 'Tower-Felling Blow', atkType: 'magic', res: { phys: 50, magic: 40, poison: 70 }, hp: 1.7, dmg: 1.4, spd: 1.2, specialties: ['enraged', 'vampiric'] },
      creatures: [
        { name: 'Essence-Storm Fragment', attack: 'Scattering Lash', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.8, dmg: 1.3, spd: 1.3 },
        { name: 'Tower-Base Crusher', attack: 'Foundation Slam', atkType: 'phys', res: { phys: 55, magic: 15, poison: 70 }, hp: 1.4, dmg: 1.1, spd: 0.6 },
        { name: 'Last-Stand Shade', attack: 'Desperation\'s Edge', atkType: 'phys', res: { phys: 35, magic: 25, poison: 55 }, hp: 1.0, dmg: 1.2, spd: 1.1 },
      ] },
  ],
}, // ===== end Chapter 6 =====
{ // ================= CHAPTER 7 =================
  num: 7, title: 'Chapter 7: The Glass Caverns', icon: '💎', shopName: 'Glasslight Exchange',
  headline: 'The academy\'s old approach — warded, broken, and worse than anyone remembered.',
  story: [
    'The entrance to the Glass Caverns doesn\'t look like much — a crack in a hillside, easy to miss if Minnie\'s scrying-focus weren\'t practically dragging them toward it. Inside, the rock changes fast: natural stone giving way to smooth, glassy walls, fused centuries ago by heat and magic no one alive remembers casting. This is the academy\'s old approach, Minnie explains — a route so dangerous and disorienting that only trained masters ever used it, warded and re-warded over generations to keep the wrong things from finding the same shortcut.',
    'Most of those wards have failed. What\'s replaced them is worse.',
  ],
  ending: [
    'They stand before the academy\'s sealed gates in silence, the weight of everything that led here finally, fully real. Minnie presses her palm to stone she hasn\'t touched in months, and for the first time since Reedmarsh, her composure cracks — not fear, but grief, held back this whole journey by necessity and now impossible to keep down any longer. Somewhere behind these gates are the masters who raised her, who chose to die slowly so the world outside could live, and she has no idea if any of them are still alive to be saved at all.',
    'Pars, studying the gate\'s seal-work with a thief\'s practiced eye, notices something odd: the wards aren\'t uniform. Most are old, exactly as old as Minnie says they should be — but one section, small and easy to miss, is newer. Recent. Reinforced from the inside, deliberately, sometime after the initial sealing.',
    'Someone in there is still alive, and still fighting.',
    'Kharun says what needs saying, quiet and certain: two debts have already been closed, at Fallcrest and long before it. Whatever\'s behind this gate is the third, and it might be the hardest one yet — not vengeance this time, but rescue, against a demon patient enough to wait three hundred years and thorough enough to hunt bloodlines across an entire kingdom to get here.',
    'Minnie steadies herself, wipes her face, and begins the working to open the gate.',
    'The Glass Caverns chapter ends on the threshold of Aldergate itself, gates groaning open into darkness, as Chapter 8 begins with the group finally stepping inside the academy Minnie never expected to see again.',
  ],
  rareA: ['Glass', 'Shard', 'Crystal', 'Echo', 'Frost', 'Smoke', 'Mirror', 'Deep'],
  rareB: ['Skitter', 'Stalker', 'Singer', 'Crawler', 'Wraith', 'Watcher', 'Splitter', 'Gleamer'],
  eliteTitles: ['the Fissure-Born', 'the Resonant', 'the Mirror\'s Twin', 'the Expedition\'s End',
                'the Smoke-Walker', 'the Hollow\'s Pressure', 'the Cold Descent', 'the Cavern\'s Claim'],
  quests: [
    { name: 'The Cracked Threshold', location: 'The Entry Fissure',
      intro: ['The cavern\'s mouth alone is enough to tell the group how bad things have gotten — glass walls fractured in spider-web patterns, humming faintly with unstable residual magic.'],
      objective: 'Navigate the entry fissure and clear whatever\'s nesting in the unstable glass.',
      outro: ['A brood of Glass-Skitters, insectile horrors that have adapted to feed on leaking magical energy, swarm from cracks in the walls. Clearing them stabilizes the entry enough to proceed, but the fractured glass all around shows fresh damage — recent, deliberate, not centuries old like the rest.'],
      setup: 'Sets up Quest 2: something has been actively breaking this place further, recently.',
      boss: { name: 'Glass-Skitter Broodmother', attack: 'Shard-Leg Flurry', atkType: 'phys', res: { phys: 30, magic: 30, poison: 50 }, hp: 1.2, dmg: 1.2, spd: 1.3, specialties: ['swift', 'explosive'] },
      creatures: [
        { name: 'Glass-Skitter', attack: 'Crack-Born Snip', atkType: 'phys', res: { phys: 25, magic: 25, poison: 45 }, hp: 0.7, dmg: 1.0, spd: 1.4 },
        { name: 'Residue Feeder-Wisp', attack: 'Leaked-Magic Zap', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
        { name: 'Fissure-Mouth Lurker', attack: 'Entry Ambush', atkType: 'phys', res: { phys: 30, magic: 15, poison: 40 }, hp: 1.1, dmg: 1.2, spd: 0.9 },
      ] },
    { name: 'The Resonance Chamber', location: 'The First Chamber',
      intro: ['Deeper in, the glass walls form a natural amphitheater that hums audibly, a resonance the group can feel in their teeth.'],
      objective: 'Cross the resonance chamber and silence whatever\'s amplifying the disturbance.',
      outro: ['A Resonant Horror, a corrupted crystalline creature that feeds on and amplifies magical vibration, nearly deafens the group before falling. Its death quiets the chamber enough for Minnie to notice something structural: the resonance wasn\'t natural. It was a ward-network, deliberately tuned to detect intruders, and it\'s been reporting the group\'s presence deeper into the caverns since they arrived.'],
      setup: 'Sets up Quest 3: whatever\'s deeper in already knows they\'re coming.',
      boss: { name: 'Resonant Horror', attack: 'Deafening Harmonic', atkType: 'magic', res: { phys: 45, magic: 40, poison: 65 }, hp: 1.3, dmg: 1.3, spd: 0.9, specialties: ['magical', 'charm'] },
      creatures: [
        { name: 'Hum-Tuned Crystalline', attack: 'Vibration Pulse', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.9, dmg: 1.2, spd: 1.0 },
        { name: 'Chamber-Floor Creeper', attack: 'Tooth-Rattle Bite', atkType: 'phys', res: { phys: 30, magic: 20, poison: 45 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
        { name: 'Amplifier Mote', attack: 'Feedback Shriek', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.6, dmg: 1.3, spd: 1.4 },
      ] },
    { name: 'The Watching Glass', location: 'The Mirror Gallery',
      intro: ['A stretch of tunnel lined floor-to-ceiling with polished glass, reflecting the group\'s own party back at them from a hundred angles — until some of the reflections stop moving in sync.'],
      objective: 'Clear the mirror gallery of whatever\'s using the reflective glass to hide.',
      outro: ['A Mirror-Bound Stalker, a creature that has learned to move between reflections, ambushes from unexpected angles throughout the fight, using the gallery itself as a weapon. Beyond the gallery, a collapsed section of tunnel reveals old academy equipment — expedition gear, decades old, abandoned mid-use.'],
      setup: 'Sets up Quest 4: someone from the academy came this way before and didn\'t finish the trip.',
      boss: { name: 'Mirror-Bound Stalker', attack: 'Reflection Strike', atkType: 'phys', res: { phys: 35, magic: 35, poison: 50 }, hp: 1.2, dmg: 1.3, spd: 1.3, specialties: ['evasive', 'spectral'] },
      creatures: [
        { name: 'Out-of-Sync Reflection', attack: 'Copied Swing', atkType: 'phys', res: { phys: 30, magic: 30, poison: 50 }, hp: 0.9, dmg: 1.2, spd: 1.1 },
        { name: 'Gallery-Glass Shardling', attack: 'Splinter Spray', atkType: 'phys', res: { phys: 25, magic: 25, poison: 55 }, hp: 0.7, dmg: 1.1, spd: 1.3 },
        { name: 'Polish-Sheen Wisp', attack: 'Blinding Glare', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
      ] },
    { name: 'The Abandoned Expedition', location: 'The Collapsed Passage',
      intro: ['The gear belongs to a documented academy survey team, according to markings Minnie recognizes — sent down years before the sealing, never fully accounted for in official records.'],
      objective: 'Excavate the collapsed passage and learn what happened to the missing expedition.',
      outro: ['A Passage-Bound Wretch, the corrupted remains of one of the expedition\'s own mages, still clutching a research satchel, attacks with fragments of real academy combat-magic turned wrong. Inside the satchel: field notes confirming the survey team found something they weren\'t supposed to — an active channel of corruption reaching up from far below, years before anyone thought Vorrhak\'s influence had spread this far.'],
      setup: 'Sets up Quest 5: the academy knew about deep corruption in these caverns long before the sealing rite ever happened.',
      boss: { name: 'Passage-Bound Wretch', attack: 'Turned Combat-Magic', atkType: 'magic', res: { phys: 35, magic: 40, poison: 55 }, hp: 1.2, dmg: 1.4, spd: 1.0, specialties: ['magical', 'cursed'] },
      creatures: [
        { name: 'Rubble-Pinned Shade', attack: 'Trapped Thrashing', atkType: 'phys', res: { phys: 40, magic: 20, poison: 60 }, hp: 1.0, dmg: 1.1, spd: 0.8 },
        { name: 'Satchel-Moth Swarm', attack: 'Note-Eating Cloud', atkType: 'poison', res: { phys: 10, magic: 25, poison: 50 }, hp: 0.6, dmg: 1.1, spd: 1.5 },
        { name: 'Survey-Lamp Wisp', attack: 'Dead-Light Flicker', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
      ] },
    { name: 'What They Found', location: 'The Deep Survey Site',
      intro: ['The notes lead to the actual site the expedition was investigating — a chamber where the glass walls turn dark, almost smoked, as though scorched from within.'],
      objective: 'Reach the deep survey site and clear whatever\'s since claimed it.',
      outro: ['A Smoke-Glass Aberration, born from whatever the original expedition disturbed and never properly contained, attacks in a disorienting fight amid drifting, near-opaque haze. Past it, scorched into the chamber\'s far wall, is a warning carved by the expedition\'s own hand, urgent and unfinished — cut off mid-sentence, as though something interrupted them permanently.'],
      setup: 'Sets up Quest 6: whatever stopped the expedition from finishing their warning is still down here.',
      boss: { name: 'Smoke-Glass Aberration', attack: 'Opaque-Haze Strike', atkType: 'magic', res: { phys: 40, magic: 40, poison: 60 }, hp: 1.3, dmg: 1.3, spd: 1.1, specialties: ['evasive', 'magical'] },
      creatures: [
        { name: 'Haze-Drifting Feeder', attack: 'Smoke-Cover Bite', atkType: 'phys', res: { phys: 30, magic: 25, poison: 50 }, hp: 0.9, dmg: 1.1, spd: 1.2 },
        { name: 'Scorch-Wall Imp', attack: 'Char-Glass Fling', atkType: 'magic', res: { phys: 35, magic: 30, poison: 55 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
        { name: 'Dark-Pane Crawler', attack: 'Smoked-Glass Scrape', atkType: 'phys', res: { phys: 40, magic: 20, poison: 55 }, hp: 1.1, dmg: 1.0, spd: 0.9 },
      ] },
    { name: 'The Unfinished Warning', location: 'The Scorched Hollow',
      intro: ['Following the direction the carved warning was facing when it stopped, the group finds a hollow chamber, glass walls bulging outward unnaturally, like something enormous pressed against them from behind for a very long time.'],
      objective: 'Investigate the scorched hollow and deal with whatever\'s been pressing against its walls.',
      outro: ['A Hollow-Bound Colossus, an ancient guardian construct — academy-made, older even than the sealing, clearly meant to contain something specific here — has been slowly corrupted by centuries of proximity to whatever it guards, and now attacks indiscriminately. Its destruction cracks the bulging wall fully open, revealing a passage down that radiates cold, old magic, entirely unlike anything else in the caverns.'],
      setup: 'Sets up Quest 7: the caverns are hiding something the academy built specifically to guard, separate from the sealing itself.',
      boss: { name: 'Hollow-Bound Colossus', attack: 'Wall-Bulging Press', atkType: 'phys', res: { phys: 55, magic: 30, poison: 70 }, hp: 1.7, dmg: 1.2, spd: 0.5, specialties: ['golem', 'colossal'] },
      creatures: [
        { name: 'Pressure-Crack Skitterer', attack: 'Bulge-Line Dash', atkType: 'phys', res: { phys: 35, magic: 20, poison: 50 }, hp: 0.8, dmg: 1.1, spd: 1.3 },
        { name: 'Scorched-Glass Golemite', attack: 'Heat-Fused Fist', atkType: 'phys', res: { phys: 50, magic: 25, poison: 70 }, hp: 1.3, dmg: 1.0, spd: 0.6 },
        { name: 'Old-Ward Remnant', attack: 'Guardian\'s Echo', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.9, dmg: 1.2, spd: 1.0 },
      ] },
    { name: 'The Cold Passage', location: 'The Descending Corridor',
      intro: ['The passage beyond the shattered wall slopes down sharply, air growing colder with every step, glass here darker, almost black, humming with a deeper resonance than anything above.'],
      objective: 'Descend the cold passage and clear whatever\'s adapted to survive in it.',
      outro: ['A pack of Frostglass Wraiths, spirits of long-dead academy guardians fused with the corrupted cold magic saturating this depth, attack in coordinated, eerie silence. At the passage\'s end, the group finds a heavy door, unmistakably academy-make, sealed with wards Minnie recognizes instantly as her own masters\' personal work.'],
      setup: 'Sets up Quest 8: this door was sealed by the very masters trapped below, meaning the group is closer to the true sealed halls than they realized.',
      boss: { name: 'Frostglass Wraith', attack: 'Silent Cold-Fusion', atkType: 'magic', res: { phys: 50, magic: 35, poison: 70 }, hp: 1.2, dmg: 1.3, spd: 1.1, specialties: ['frozen', 'spectral'] },
      creatures: [
        { name: 'Black-Glass Prowler', attack: 'Dark-Pane Pounce', atkType: 'phys', res: { phys: 35, magic: 25, poison: 50 }, hp: 1.0, dmg: 1.2, spd: 1.1 },
        { name: 'Cold-Hum Mote', attack: 'Deep-Resonance Chill', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.6, dmg: 1.2, spd: 1.4 },
        { name: 'Descent-Guard Echo', attack: 'Frozen Vigil Strike', atkType: 'phys', res: { phys: 40, magic: 30, poison: 60 }, hp: 1.1, dmg: 1.1, spd: 0.8 },
      ] },
    { name: 'The Masters\' Door', location: 'The Sealed Threshold',
      intro: ['Minnie\'s hands shake reading the ward-signatures — she recognizes individual masters\' work in the seal, meaning they came down here personally to reinforce this specific point, likely in the chaos right before the final sealing.'],
      objective: 'Force the masters\' door and defend Minnie while she works to unlock it without destroying the ward-work entirely.',
      outro: ['A Threshold Sentinel, a construct keyed specifically to test academy-trained mages before allowing passage, attacks Minnie directly the moment she begins the unlocking working, forcing Kharun and Pars to hold the line around her. When the door finally gives, it doesn\'t lead further down — it opens onto a ledge overlooking a vast cavern below, and at the bottom of that cavern, unmistakable even from this height, are the sealed gates of the Academy of Aldergate itself.'],
      setup: 'Sets up Quest 9: the academy is finally, visibly in sight, and something is waiting between the group and the descent.',
      boss: { name: 'Threshold Sentinel', attack: 'Mage-Keyed Counterstrike', atkType: 'magic', res: { phys: 45, magic: 40, poison: 70 }, hp: 1.4, dmg: 1.3, spd: 0.9, specialties: ['charm', 'resistant'] },
      creatures: [
        { name: 'Ward-Signature Wisp', attack: 'Authorship Test', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
        { name: 'Seal-Line Crawler', attack: 'Boundary Snap', atkType: 'phys', res: { phys: 35, magic: 25, poison: 55 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
        { name: 'Door-Frame Golemite', attack: 'Lintel Drop', atkType: 'phys', res: { phys: 50, magic: 20, poison: 70 }, hp: 1.2, dmg: 1.0, spd: 0.7 },
      ] },
    { name: 'The Long Descent', location: 'The Overlook Cavern',
      intro: ['The path down to the academy gates spirals along the cavern wall, exposed and precarious, and something has been using the height advantage to watch for exactly this approach.'],
      objective: 'Descend the overlook cavern safely, clearing whatever\'s using the height to ambush anyone heading for the academy.',
      outro: ['A Cavern-Bound Roc, a massive glass-scaled predator that has claimed the open cavern airspace for itself, dives repeatedly during the descent, forcing the group to fight while exposed on narrow ledges. Defeating it clears the way, but the fight\'s noise and violence doesn\'t go unnoticed — something ancient, coiled at the cavern\'s deepest point, finally stirs.'],
      setup: 'Sets up Quest 10: the chapter\'s true guardian, roused by the fighting above, blocks the final approach to the academy gates.',
      boss: { name: 'Cavern-Bound Roc', attack: 'Glass-Scale Dive', atkType: 'phys', res: { phys: 30, magic: 30, poison: 45 }, hp: 1.4, dmg: 1.4, spd: 1.3, specialties: ['swift', 'enraged'] },
      creatures: [
        { name: 'Ledge-Nest Fledgling', attack: 'Practice Dive', atkType: 'phys', res: { phys: 15, magic: 20, poison: 25 }, hp: 0.8, dmg: 1.1, spd: 1.4 },
        { name: 'Spiral-Path Clinger', attack: 'Ankle-Grab Yank', atkType: 'phys', res: { phys: 35, magic: 15, poison: 50 }, hp: 1.0, dmg: 1.1, spd: 0.9 },
        { name: 'Updraft Wisp', attack: 'Footing-Stealing Gust', atkType: 'magic', res: { phys: 45, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
      ] },
    { name: 'The Deep Warden', location: 'The Cavern Floor',
      intro: ['At the base of the cavern, standing directly between the group and the academy\'s sealed gates, waits the Deep Warden — an ancient guardian construct, older than the current masters, older perhaps than the academy itself, built to ensure nothing corrupted ever reaches Aldergate\'s doors, now half-corrupted itself from centuries of standing watch this close to a leaking seal.'],
      objective: 'Defeat the Deep Warden to finally reach the academy gates.',
      outro: ['The fight is punishing and relentless, the Warden drawing on both raw physical power and fragments of genuine ancient ward-magic, forcing the group to use everything they\'ve learned across six chapters just to survive it. When it finally falls, it doesn\'t dissolve into rot like the corrupted horrors before it — it simply goes still, ancient purpose finally, quietly fulfilled, and its collapse reveals the truth Minnie has feared since Vesk: the gates beyond are still sealed, but the corruption inside has grown loud enough now to be heard even from here — a slow, vast, patient sound, like breathing.'],
      setup: null,
      boss: { name: 'The Deep Warden', attack: 'Ancient Ward-Barrage', atkType: 'magic', res: { phys: 50, magic: 40, poison: 70 }, hp: 1.7, dmg: 1.3, spd: 0.8, specialties: ['golem', 'resistant'] },
      creatures: [
        { name: 'Warden-Shard Satellite', attack: 'Orbiting Cut', atkType: 'phys', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.8, dmg: 1.2, spd: 1.3 },
        { name: 'Floor-Glass Riser', attack: 'Erupting Spike', atkType: 'phys', res: { phys: 45, magic: 25, poison: 65 }, hp: 1.1, dmg: 1.1, spd: 0.8 },
        { name: 'Gate-Watch Echo', attack: 'Vigil\'s Weight', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 0.9, dmg: 1.2, spd: 1.0 },
      ] },
  ],
}, // ===== end Chapter 7 =====
{ // ================= CHAPTER 8 =================
  num: 8, title: 'Chapter 8: Sanctum of Aldergate — The Outer Halls', icon: '🏛️', shopName: 'Aldergate Supply Stores',
  headline: 'The gates of Aldergate open on a place that has been holding its breath for months.',
  story: [
    'The gate swallows them into a darkness that isn\'t empty — it\'s occupied, thick with the particular quiet of a place that\'s been holding its breath for months. Minnie\'s academy-light spell gutters weakly to life, barely pushing back shadows that seem to lean in rather than retreat. This was never meant to be a tomb. The corridors ahead were built for teaching, for living, for the ordinary business of a working academy — and every hallway now bears the same scarring: scorch marks, collapsed archways, old wards flickering on their last reserves like candles burned to the wick.',
    'Minnie knows this place better than anyone alive who isn\'t already sealed inside it. That knowledge is about to become the only thing keeping all three of them alive.',
  ],
  ending: [
    'The door stands open. Beyond it, faint light flickers from a huddle of exhausted, ragged figures — the surviving masters of Aldergate, thinner and grayer than Minnie remembers, but alive. She doesn\'t run to them yet. She can\'t quite make her legs move, caught between months of grief and the sudden, terrifying possibility that it might not have all been for nothing.',
    'Kharun and Pars hold the threshold behind her, and it\'s Pars, oddly, who says what needs saying — quiet, steady, the voice of someone who\'s learned exactly what it costs to hope for a family and lose it anyway: "Go on. We\'ve got the door."',
    'Minnie steps through.',
    'What she finds waiting for her, and what it will cost to actually get her masters out and finish what they started, is the whole of the next chapter — because the masters, when she finally reaches them, deliver news that changes everything: they aren\'t merely trapped. They\'ve been holding a second seal shut with the last of their combined strength, one that Vorrhak has been testing, relentlessly, every single day since the sealing began. And they don\'t have much strength left to hold it much longer.',
    'The Sanctum of Aldergate\'s outer halls close behind the group as Chapter 9 begins on the other side of that threshold — the true rescue, and the true cost of it, still ahead.',
  ],
  rareA: ['Atrium', 'Sigil', 'Lecture', 'Garden', 'Tower', 'Sanctum', 'Ward', 'Corridor'],
  rareB: ['Wraith', 'Fleshwarp', 'Horror', 'Echo', 'Sentinel', 'Spawn', 'Feeder', 'Haunt'],
  eliteTitles: ['the Sealing\'s Echo', 'the Hall-Warden', 'the Panic Preserved', 'the Hedge-Twisted',
                'the Tower\'s Loyal', 'the Signal-Severer', 'the Breach-Born', 'the Ward-Starved'],
  quests: [
    { name: 'The Entry Hall', location: 'The Shattered Atrium',
      intro: ['The academy\'s grand entry hall, once meant to awe new students, is a ruin of fallen statuary and cracked skylights letting in thin, sourceless glow.'],
      objective: 'Clear the shattered atrium and establish a safe path deeper into the academy.',
      outro: ['A cluster of Atrium Wraiths, the lingering, corrupted echoes of students or staff caught here when the sealing happened, attack out of confusion and pain more than malice. Putting them to rest is grim, quiet work. Beyond the atrium, a corridor branches three ways, each marked faintly with a different master\'s personal sigil.'],
      setup: 'Sets up Quest 2: the sealed masters left a trail, deliberately, for someone who might come looking.',
      boss: { name: 'Atrium Wraith', attack: 'Confused Anguish', atkType: 'magic', res: { phys: 50, magic: 30, poison: 70 }, hp: 1.1, dmg: 1.2, spd: 1.1, specialties: ['spectral', 'cursed'] },
      creatures: [
        { name: 'Statuary Fragment', attack: 'Broken-Marble Fist', atkType: 'phys', res: { phys: 50, magic: 15, poison: 70 }, hp: 1.2, dmg: 1.0, spd: 0.7 },
        { name: 'Student-Echo Shade', attack: 'Half-Learned Bolt', atkType: 'magic', res: { phys: 40, magic: 25, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
        { name: 'Skylight Glimmer-Fiend', attack: 'Sourceless-Glow Lash', atkType: 'magic', res: { phys: 35, magic: 30, poison: 55 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
      ] },
    { name: 'The Sigil Trail', location: 'The Branching Corridor',
      intro: ['Minnie recognizes all three sigils — teachers she knew personally, now scattered across different wings, each mark glowing faintly with just enough active ward-charge to mean alive, or recently was.'],
      objective: 'Follow the strongest sigil trail and clear whatever\'s blocking that wing.',
      outro: ['A Corridor-Bound Fleshwarp, a corrupted staff member fused with collapsed architecture, blocks the strongest-charged path with desperate, twisted strength. Past it, the trail leads toward the academy\'s old lecture wing — and the sound Minnie\'s been dreading since the Glass Caverns grows audible again, closer now: that slow, vast breathing.'],
      setup: 'Sets up Quest 3: the demon\'s presence is no longer distant. It can be heard from here.',
      boss: { name: 'Corridor-Bound Fleshwarp', attack: 'Architecture-Fused Crush', atkType: 'phys', res: { phys: 45, magic: 20, poison: 65 }, hp: 1.5, dmg: 1.2, spd: 0.7, specialties: ['colossal', 'berserk'] },
      creatures: [
        { name: 'Collapsed-Arch Crawler', attack: 'Keystone Drop', atkType: 'phys', res: { phys: 45, magic: 15, poison: 60 }, hp: 1.1, dmg: 1.1, spd: 0.8 },
        { name: 'Sigil-Drawn Moth', attack: 'Charge-Sipping Flutter', atkType: 'magic', res: { phys: 20, magic: 30, poison: 40 }, hp: 0.6, dmg: 1.1, spd: 1.5 },
        { name: 'Wing-Guard Husk', attack: 'Staff-Hand Block', atkType: 'phys', res: { phys: 35, magic: 25, poison: 60 }, hp: 1.1, dmg: 1.1, spd: 0.9 },
      ] },
    { name: 'The Lecture Wing', location: 'The Collapsed Lecture Hall',
      intro: ['Rows of academy desks sit frozen mid-lesson, chalk dust and old parchment scattered as though class ended mid-sentence and never resumed.'],
      objective: 'Search the lecture wing for the master matching the strongest sigil, clearing whatever\'s nested here.',
      outro: ['A Lecture-Bound Horror, born from the corrupted residue of whatever panic swept this room the night of the sealing, attacks with chaotic, unpredictable bursts of warped academy magic. In the wreckage of the master\'s desk, they find a hastily scrawled note in a trembling but familiar hand — not a master\'s final words, but instructions, addressed to anyone still free: the wards hold longest near the old scrying tower; go there first.'],
      setup: 'Sets up Quest 4: there\'s a plan, left behind on purpose, and it points them somewhere specific.',
      boss: { name: 'Lecture-Bound Horror', attack: 'Panic-Residue Burst', atkType: 'magic', res: { phys: 35, magic: 40, poison: 60 }, hp: 1.2, dmg: 1.4, spd: 1.1, specialties: ['magical', 'explosive'] },
      creatures: [
        { name: 'Frozen-Lesson Echo', attack: 'Mid-Sentence Snap', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
        { name: 'Desk-Row Skitterer', attack: 'Aisle-Dash Bite', atkType: 'phys', res: { phys: 25, magic: 15, poison: 45 }, hp: 0.9, dmg: 1.1, spd: 1.3 },
        { name: 'Chalk-Dust Devil', attack: 'Blinding Eraser-Cloud', atkType: 'poison', res: { phys: 30, magic: 25, poison: 55 }, hp: 0.7, dmg: 1.1, spd: 1.3 },
      ] },
    { name: 'The Scrying Tower Approach', location: 'The Inner Courtyard Ruins',
      intro: ['The academy\'s inner courtyard, once a quiet garden between wings, is now a debris field between the group and the scrying tower rising, cracked but standing, at its center.'],
      objective: 'Cross the courtyard ruins and clear whatever\'s claimed it as territory.',
      outro: ['A pack of Garden-Bound Horrors, corrupted remnants of the academy\'s living hedge-wards, animated and twisted by prolonged taint exposure, swarm from the wreckage. Clearing them opens the tower\'s base door, still faintly warm with active protective magic — someone maintained this ward recently, and well.'],
      setup: 'Sets up Quest 5: whoever\'s still alive down here has been working hard, and carefully, to survive.',
      boss: { name: 'Garden-Bound Horror', attack: 'Hedge-Ward Strangle', atkType: 'phys', res: { phys: 30, magic: 25, poison: 60 }, hp: 1.3, dmg: 1.2, spd: 0.9, specialties: ['regen', 'poisonous'] },
      creatures: [
        { name: 'Twisted Hedge-Ward', attack: 'Thorn-Wall Lash', atkType: 'phys', res: { phys: 25, magic: 20, poison: 55 }, hp: 1.1, dmg: 1.0, spd: 0.9 },
        { name: 'Debris-Field Lurker', attack: 'Wreckage Ambush', atkType: 'phys', res: { phys: 35, magic: 10, poison: 45 }, hp: 1.0, dmg: 1.2, spd: 1.0 },
        { name: 'Garden-Rot Sprite', attack: 'Compost Burst', atkType: 'poison', res: { phys: 10, magic: 25, poison: 60 }, hp: 0.7, dmg: 1.1, spd: 1.3 },
      ] },
    { name: 'The Scrying Tower', location: 'The Tower Interior',
      intro: ['Inside, the tower is in far better condition than anything else they\'ve seen — deliberately preserved, clearly a refuge.'],
      objective: 'Climb the scrying tower and clear whatever\'s guarding its upper chamber.',
      outro: ['A Tower-Bound Sentinel, one of the academy\'s own defense constructs, still loyally active after months of isolation, initially attacks them on sight before Minnie manages to shout a master-level command phrase that makes it hesitate, then stand down entirely, recognizing her authority. At the top, they find a working scrying station, recently used, tuned to a very specific frequency — one Minnie recognizes as her own former mentor\'s personal signature.'],
      setup: 'Sets up Quest 6: Minnie\'s own mentor is close, possibly still alive, actively working against the demon from wherever they\'ve holed up.',
      boss: { name: 'Tower-Bound Sentinel', attack: 'Loyal Defense Protocol', atkType: 'phys', res: { phys: 50, magic: 35, poison: 70 }, hp: 1.5, dmg: 1.2, spd: 0.8, specialties: ['golem', 'charm'] },
      creatures: [
        { name: 'Stair-Guard Construct', attack: 'Step-Denial Sweep', atkType: 'phys', res: { phys: 45, magic: 25, poison: 65 }, hp: 1.1, dmg: 1.1, spd: 0.8 },
        { name: 'Preserved-Hall Wisp', attack: 'Refuge-Ward Snap', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
        { name: 'Isolation Echo', attack: 'Months-Alone Moan', atkType: 'magic', res: { phys: 45, magic: 25, poison: 65 }, hp: 0.8, dmg: 1.2, spd: 1.0 },
      ] },
    { name: 'The Mentor\'s Signal', location: 'The Tower Scrying Chamber',
      intro: ['Minnie attunes to the signature and gets a fractured but real response — a voice, faint and exhausted, confirming several masters survived by retreating deeper, sealing themselves into an inner sanctum separate from the demon\'s actual prison.'],
      objective: 'Stabilize the scrying connection long enough to get a clear location, while defending the chamber from whatever the demon sends to sever it.',
      outro: ['A Voice-Severing Wraith, sent specifically by something below that clearly doesn\'t want this contact maintained, attacks the working itself as much as the group, forcing a fight that\'s as much about protecting Minnie\'s concentration as dealing damage. They succeed just barely — the mentor\'s voice gives them a location, and a warning: "Don\'t come through the main sanctum door. It\'s not sealed anymore. Something\'s using it."'],
      setup: 'Sets up Quest 7: the main door to the masters\' sanctum has already been breached from below.',
      boss: { name: 'Voice-Severing Wraith', attack: 'Connection-Cutting Shriek', atkType: 'magic', res: { phys: 50, magic: 35, poison: 70 }, hp: 1.2, dmg: 1.4, spd: 1.2, specialties: ['spectral', 'swift'] },
      creatures: [
        { name: 'Static-Fog Mote', attack: 'Signal-Noise Crackle', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.6, dmg: 1.2, spd: 1.4 },
        { name: 'Frequency Leech', attack: 'Attunement Drain', atkType: 'poison', res: { phys: 20, magic: 30, poison: 55 }, hp: 0.9, dmg: 1.1, spd: 1.1 },
        { name: 'Chamber-Glass Haunt', attack: 'Scrying-Lens Shatter', atkType: 'phys', res: { phys: 35, magic: 25, poison: 55 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
      ] },
    { name: 'The Breached Threshold', location: 'The Sanctum Approach',
      intro: ['Following the mentor\'s directions leads away from the main sanctum door entirely, toward a service passage the masters apparently kept secret for exactly this contingency.'],
      objective: 'Reach the alternate passage while clearing whatever\'s spilled out from the breached main door nearby.',
      outro: ['A brood of Sanctum-Spawned Horrors, clearly recent arrivals, fresh and strong compared to the older corrupted things upstairs, pour from the direction of the breached door, forcing a hard fighting retreat toward the service passage. They make it through, sealing the passage behind them, but the fight confirms the worst: Vorrhak\'s influence is no longer contained even to the deepest halls. It\'s actively pushing outward, and it\'s getting stronger by the day.'],
      setup: 'Sets up Quest 8: time is now a real, explicit pressure — the seal is failing faster than anyone feared.',
      boss: { name: 'Sanctum-Spawned Horror', attack: 'Fresh-Made Fury', atkType: 'phys', res: { phys: 35, magic: 30, poison: 55 }, hp: 1.3, dmg: 1.4, spd: 1.2, specialties: ['enraged', 'vampiric'] },
      creatures: [
        { name: 'Breach-Fresh Spawnling', attack: 'New-Born Claw', atkType: 'phys', res: { phys: 25, magic: 20, poison: 45 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
        { name: 'Door-Spill Ooze', attack: 'Seeping Corrosion', atkType: 'poison', res: { phys: 35, magic: 20, poison: 65 }, hp: 1.1, dmg: 1.0, spd: 0.7 },
        { name: 'Outward-Push Wisp', attack: 'Influence Probe', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
      ] },
    { name: 'The Service Passage', location: 'The Hidden Corridor',
      intro: ['The secret passage is narrow, clearly built for emergency use only, and shows signs of very recent traffic — someone\'s been using this route to move supplies to the masters\' hiding place.'],
      objective: 'Navigate the hidden corridor and clear whatever\'s been drawn to the recent activity.',
      outro: ['A Passage-Bound Aberration, something that slipped through the breached main door and found this hidden route by scent or instinct, ambushes in the tight confines, forcing careful, controlled combat with little room to maneuver. Beyond it, the passage opens into a final antechamber, warded heavily, clearly the last line of defense before the masters\' inner sanctum.'],
      setup: 'Sets up Quest 9: the antechamber is the last obstacle before actual contact with the surviving masters.',
      boss: { name: 'Passage-Bound Aberration', attack: 'Tight-Confines Ambush', atkType: 'phys', res: { phys: 35, magic: 30, poison: 55 }, hp: 1.3, dmg: 1.3, spd: 1.1, specialties: ['evasive', 'poisonous'] },
      creatures: [
        { name: 'Supply-Trail Sniffer', attack: 'Scent-Led Snap', atkType: 'phys', res: { phys: 20, magic: 15, poison: 40 }, hp: 0.9, dmg: 1.1, spd: 1.2 },
        { name: 'Narrow-Wall Clinger', attack: 'Ceiling-Drop Strike', atkType: 'phys', res: { phys: 35, magic: 20, poison: 55 }, hp: 1.0, dmg: 1.2, spd: 1.0 },
        { name: 'Emergency-Lamp Wisp', attack: 'Guttering Flare', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.6, dmg: 1.2, spd: 1.3 },
      ] },
    { name: 'The Antechamber Ward', location: 'The Final Antechamber',
      intro: ['The antechamber\'s wards are exhausted, flickering, barely holding — clearly the masters inside have been pouring everything they have left into maintaining this one point.'],
      objective: 'Reinforce the failing antechamber ward long enough to safely open the way to the masters beyond, defending Minnie as she channels her own strength into the working.',
      outro: ['A Ward-Feeding Horror, drawn specifically to the antechamber\'s weakening magic like a predator to a wounded animal, attacks relentlessly, trying to break the ward before Minnie can stabilize it. It\'s close — the hardest fight yet at this point in the academy, Kharun and Pars holding a collapsing line while Minnie pours herself into the working. When it finally breaks, the ward flares once, stable, and the door beyond creaks open on its own for the first time in months.'],
      setup: 'Sets up Quest 10: something has noticed the antechamber\'s disturbance, and it isn\'t willing to let the masters be reached without one final test.',
      boss: { name: 'Ward-Feeding Horror', attack: 'Weakness-Scenting Maw', atkType: 'magic', res: { phys: 40, magic: 40, poison: 60 }, hp: 1.4, dmg: 1.4, spd: 1.1, specialties: ['magical', 'vampiric'] },
      creatures: [
        { name: 'Flicker-Ward Leech', attack: 'Reserve Drain', atkType: 'poison', res: { phys: 25, magic: 30, poison: 55 }, hp: 0.9, dmg: 1.1, spd: 1.1 },
        { name: 'Exhaustion Shade', attack: 'Last-Strength Sap', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
        { name: 'Antechamber Prowler', attack: 'Line-Testing Lunge', atkType: 'phys', res: { phys: 30, magic: 20, poison: 45 }, hp: 1.1, dmg: 1.2, spd: 1.0 },
      ] },
    { name: 'The Threshold Made Flesh', location: 'The Sanctum Doorway',
      intro: ['As the antechamber door opens, the corruption that\'s been steadily pushing outward through the academy finally coalesces into direct opposition: the Doorward Abomination, a horror grown from months of the demon\'s leaking influence specifically shaped, almost intelligently, to block this one exact threshold — the last thing standing between the group and Minnie\'s masters.'],
      objective: 'Destroy the Doorward Abomination before it can collapse the passage and seal the masters in permanently.',
      outro: ['The fight is the group\'s most desperate yet, the Abomination shifting and adapting mid-battle, clearly guided by something with real cunning behind it rather than mindless hunger. When it finally falls, dissolving into the same black rot as every Herald before it, a voice — layered, ancient, unmistakably Vorrhak\'s own influence rather than a mere servant\'s — murmurs through the collapsing corridor, almost amused: "Persistent little debts. Come see, then, what\'s left to save."'],
      setup: null,
      boss: { name: 'Doorward Abomination', attack: 'Adaptive Blockade', atkType: 'phys', res: { phys: 45, magic: 40, poison: 65 }, hp: 1.7, dmg: 1.4, spd: 1.0, specialties: ['necrotic', 'enraged'] },
      creatures: [
        { name: 'Coalesced Rot-Limb', attack: 'Threshold Sweep', atkType: 'phys', res: { phys: 40, magic: 25, poison: 60 }, hp: 1.1, dmg: 1.2, spd: 0.9 },
        { name: 'Cunning-Guided Mote', attack: 'Directed Malice', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
        { name: 'Passage-Collapse Fiend', attack: 'Ceiling-Pull Crush', atkType: 'phys', res: { phys: 50, magic: 20, poison: 70 }, hp: 1.3, dmg: 1.1, spd: 0.7 },
      ] },
  ],
}, // ===== end Chapter 8 =====
{ // ================= CHAPTER 9 =================
  num: 9, title: 'Chapter 9: The Inner Sanctum', icon: '🕯️', shopName: 'The Masters\' Stockroom',
  headline: 'Six masters, one failing seal, and no time left to hold it.',
  story: [
    'The masters look like survivors of a siege, because that\'s exactly what they are — six of them left from an original faculty of nearly twenty, sitting in a rough circle around a working that hasn\'t stopped in months, sustained on rotating shifts of failing strength. Minnie\'s old mentor, Master Corwin, is the one who finally speaks the truth plainly, too exhausted for anything else: the sealing never fully worked. Vorrhak is bound, but not blind, not powerless — and for months it has been probing a second, weaker seal the masters have been forced to maintain personally, one that if it fails, undoes everything the original sealing bought.',
    'They don\'t need rescue in the way Minnie imagined. They need reinforcements — and someone strong enough to take the burden of the second seal off their hands entirely, permanently, so they can finally stop dying by inches to hold a line that was only ever meant to last a little while longer.',
  ],
  ending: [
    'Silence, real silence, settles over the well chamber for the first time since any of them arrived. The seal holds — truly holds now, reinforced by willing blood and three hundred years of unfinished debt finally paid. The surviving masters collapse where they stand, not in defeat but in release, decades of stolen strength finally their own again. Corwin manages a tired, genuine smile at Minnie before his knees give out and field instincts have Minnie catching him before he hits the ground.',
    'But the relief lasts only as long as it takes Minnie to check the well itself, and her face falls the moment she does. The seal held — but it wasn\'t Vorrhak that got dragged back through it. The Colossus was a fragment, expendable, thrown forward specifically to be sacrificed if it meant something else could slip out unnoticed in the chaos.',
    'Vorrhak itself is gone. Not sealed. Not destroyed. Loose in the world for the first time in three centuries, having used its own doomed fragment as a distraction to finally, fully escape the prison a king died to build.',
    'The masters, weeping with relief and horror in the same breath, tell the group the last thing any of them wanted to hear: Vorrhak, weakened by centuries of imprisonment and the fresh violence of its escape, cannot simply vanish — its scent, its trail, is followable for a short time only, by those whose blood it spent three hundred years hunting.',
    'Kharun and Pars look at each other, and then at Minnie, and understand: the debt isn\'t paid. It\'s just entered its final chapter.',
    'The Inner Sanctum falls quiet behind them as the group turns, exhausted but unwilling to stop now, toward the last hunt — chasing something ancient and wounded through whatever tear in the world it\'s fled into, as Chapter 10 begins: the chase for Vorrhak itself.',
  ],
  rareA: ['Well', 'Circle', 'Rite', 'Seal', 'Archive', 'Binding', 'Backlash', 'Perimeter'],
  rareB: ['Wretch', 'Horror', 'Feeder', 'Breaker', 'Wraith', 'Construct', 'Spawn', 'Aberration'],
  eliteTitles: ['the Circle-Starver', 'the Well-Slipped', 'the Text-Jealous', 'the Rite-Drawn',
                'the Preparation\'s Bane', 'the Probing Reach', 'the Collapse-Born', 'the Horde\'s Herald'],
  quests: [
    { name: 'The Failing Circle', location: 'The Masters\' Ritual Chamber',
      intro: ['The masters\' working chamber is a mess of exhausted ward-lines and flickering protective sigils, barely holding against something pressing steadily from below.'],
      objective: 'Reinforce the ritual chamber\'s outer wards while the masters explain the second seal, clearing whatever the disturbance draws in.',
      outro: ['A Circle-Feeding Wretch, drawn by the chamber\'s leaking magic like every corrupted thing before it, attacks mid-explanation, forcing the group to fight even as Corwin talks. Once dealt with, the masters finally show them the second seal directly: a deep well at the chamber\'s heart, glowing faint and unstable, Vorrhak\'s true prison, thinner now than it\'s ever been.'],
      setup: 'Sets up Quest 2: the group sees the true seal for the first time, and understands exactly how close it is to failing.',
      boss: { name: 'Circle-Feeding Wretch', attack: 'Ward-Line Gnaw', atkType: 'magic', res: { phys: 35, magic: 35, poison: 60 }, hp: 1.2, dmg: 1.3, spd: 1.1, specialties: ['vampiric', 'magical'] },
      creatures: [
        { name: 'Sigil-Flicker Imp', attack: 'Guttering Snuff', atkType: 'magic', res: { phys: 35, magic: 30, poison: 55 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
        { name: 'Chamber-Edge Prowler', attack: 'Circle-Testing Claw', atkType: 'phys', res: { phys: 30, magic: 20, poison: 45 }, hp: 1.0, dmg: 1.1, spd: 1.1 },
        { name: 'Exhaustion-Fed Mote', attack: 'Strength-Sip', atkType: 'poison', res: { phys: 25, magic: 30, poison: 55 }, hp: 0.8, dmg: 1.1, spd: 1.2 },
      ] },
    { name: 'The Well\'s Edge', location: 'The Sealing Well',
      intro: ['Up close, the well isn\'t just failing — it\'s actively being worked against from the other side, small fractures spreading visibly even as the masters watch.'],
      objective: 'Stabilize the well\'s edge long enough to buy time, defending the masters as they pour remaining strength into a temporary patch.',
      outro: ['A Well-Bound Horror, something that\'s slipped partway through one of the fractures already, half-formed and desperate, attacks with genuine ferocity until destroyed. The patch holds, barely — Corwin, gray-faced, admits it won\'t hold more than a day or two more. Whatever they\'re going to do, it needs to happen fast.'],
      setup: 'Sets up Quest 3: real time pressure, explicit and immediate, drives the rest of the chapter.',
      boss: { name: 'Well-Bound Horror', attack: 'Half-Through Thrash', atkType: 'phys', res: { phys: 40, magic: 35, poison: 60 }, hp: 1.4, dmg: 1.4, spd: 1.0, specialties: ['berserk', 'necrotic'] },
      creatures: [
        { name: 'Fracture-Slip Spawnling', attack: 'Crack-Born Snap', atkType: 'phys', res: { phys: 30, magic: 25, poison: 50 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
        { name: 'Well-Glow Wisp', attack: 'Unstable Shine', atkType: 'magic', res: { phys: 45, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
        { name: 'Edge-Crumble Crawler', attack: 'Footing Collapse', atkType: 'phys', res: { phys: 40, magic: 20, poison: 55 }, hp: 1.1, dmg: 1.1, spd: 0.9 },
      ] },
    { name: 'The Old Rite', location: 'The Archive Alcove',
      intro: ['The masters direct Minnie to a hidden archive alcove holding the academy\'s oldest, most dangerous texts — the same family of rite that sealed Vorrhak three centuries ago, refined and reinforced by generations of masters since.'],
      objective: 'Retrieve the true sealing rite from the archive, clearing whatever\'s nested in its long-undisturbed shelves.',
      outro: ['An Archive-Bound Wraith, animated by centuries of accumulated, jealously-guarded magic reacting badly to disturbance, attacks to protect the texts from what it perceives as theft. Securing the rite, Minnie realizes with a cold jolt: it\'s the completed version of the fragment recovered at the Ashen Steppe. Both pieces now exist in the same room for the first time in three hundred years.'],
      setup: 'Sets up Quest 4: the full rite exists now, but completing it requires more than just the text.',
      boss: { name: 'Archive-Bound Wraith', attack: 'Jealous Guardianship', atkType: 'magic', res: { phys: 50, magic: 35, poison: 70 }, hp: 1.2, dmg: 1.3, spd: 1.1, specialties: ['spectral', 'cursed'] },
      creatures: [
        { name: 'Shelf-Dust Haunt', attack: 'Centuries-Settled Choke', atkType: 'poison', res: { phys: 30, magic: 25, poison: 60 }, hp: 0.8, dmg: 1.1, spd: 1.1 },
        { name: 'Text-Ward Glimmer', attack: 'Page-Guard Zap', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
        { name: 'Alcove-Dark Lurker', attack: 'Unlit-Corner Grab', atkType: 'phys', res: { phys: 35, magic: 20, poison: 50 }, hp: 1.0, dmg: 1.2, spd: 1.0 },
      ] },
    { name: 'What the Rite Demands', location: 'The Reading Chamber',
      intro: ['Piecing together the fragment and the archive text, Minnie and Corwin confirm the rite\'s true requirements — not just both bloodline debts closed, which is already done, but a willing binding, cast at the seal itself, by descendants of the original bloodline standing together.'],
      objective: 'Defend the reading chamber while the masters finalize their interpretation of the completed rite, against increasingly aggressive incursions from the weakening well.',
      outro: ['A Rite-Hungry Aberration, drawn specifically by the completed rite\'s power the moment it\'s assembled, attacks with unsettling purpose, clearly guided by something intelligent testing the group\'s readiness. Surviving it, the masters confirm the plan: Kharun and Pars, together, at the well, with Minnie channeling the masters\' remaining strength through them.'],
      setup: 'Sets up Quest 5: preparing the ritual site itself becomes the next task, and it\'s not simple.',
      boss: { name: 'Rite-Hungry Aberration', attack: 'Purpose-Driven Rend', atkType: 'magic', res: { phys: 40, magic: 40, poison: 60 }, hp: 1.3, dmg: 1.4, spd: 1.1, specialties: ['magical', 'enraged'] },
      creatures: [
        { name: 'Incursion Spawnling', attack: 'Probing Claw', atkType: 'phys', res: { phys: 30, magic: 25, poison: 50 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
        { name: 'Reading-Lamp Fiend', attack: 'Light-Snuffing Swipe', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
        { name: 'Interpretation Echo', attack: 'Misread Backfire', atkType: 'magic', res: { phys: 35, magic: 35, poison: 55 }, hp: 0.9, dmg: 1.2, spd: 1.0 },
      ] },
    { name: 'Preparing the Ground', location: 'The Well Perimeter',
      intro: ['The well\'s perimeter needs to be cleared and re-warded properly before the rite can be attempted — sloppy preparation here could kill everyone involved the instant the working begins.'],
      objective: 'Clear and stabilize the well\'s perimeter, defending the masters as they lay the final ward-lines.',
      outro: ['A pack of Perimeter Wretches, sensing the coming working and trying desperately to disrupt preparation, attack in a grueling, multi-wave fight testing endurance more than raw skill. The perimeter holds. Corwin, sweat-soaked and shaking, tells them plainly: the working can begin at dawn. Vorrhak, on the other side, has clearly heard every word.'],
      setup: 'Sets up Quest 6: the demon responds directly for the first time, no longer content to send servants.',
      boss: { name: 'Perimeter Wretch', attack: 'Preparation-Breaking Rush', atkType: 'phys', res: { phys: 35, magic: 30, poison: 55 }, hp: 1.2, dmg: 1.3, spd: 1.3, specialties: ['swift', 'explosive'] },
      creatures: [
        { name: 'Wave-Rush Spawnling', attack: 'Numbers-Over-Skill Swarm', atkType: 'phys', res: { phys: 25, magic: 20, poison: 45 }, hp: 0.8, dmg: 1.1, spd: 1.3 },
        { name: 'Ward-Line Scratcher', attack: 'Fresh-Chalk Smear', atkType: 'phys', res: { phys: 30, magic: 25, poison: 50 }, hp: 0.9, dmg: 1.1, spd: 1.2 },
        { name: 'Disruption Mote', attack: 'Working-Jam Pulse', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
      ] },
    { name: 'The First Direct Reach', location: 'The Well\'s Threshold',
      intro: ['As night falls before the ritual, the well\'s surface ripples — not a servant this time, but something reaching through personally, testing the barrier\'s remaining strength against the group specifically.'],
      objective: 'Repel Vorrhak\'s direct probing reach before it can widen the fracture further.',
      outro: ['A Vorrhak-Touched Manifestation, not the demon itself but an extension of its will given brief, terrible shape by the thinning seal, attacks with an intelligence and malice unlike anything faced before, speaking in fragments through the fight — mocking Kharun\'s name, Pars\'s blood, Minnie\'s grief, each in turn. Destroying the manifestation costs dearly in exhaustion, but proves the barrier can still hold, for now.'],
      setup: 'Sets up Quest 7: with the direct reach repelled, the masters push forward the timeline — they can\'t survive another test like that.',
      boss: { name: 'Vorrhak-Touched Manifestation', attack: 'Personal Malice', atkType: 'magic', res: { phys: 45, magic: 45, poison: 65 }, hp: 1.5, dmg: 1.4, spd: 1.1, specialties: ['cursed', 'necrotic'] },
      creatures: [
        { name: 'Will-Extension Tendril', attack: 'Reaching Grasp', atkType: 'phys', res: { phys: 35, magic: 30, poison: 55 }, hp: 1.0, dmg: 1.2, spd: 1.0 },
        { name: 'Mockery Echo', attack: 'Name-Twisting Taunt', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
        { name: 'Ripple-Born Fragment', attack: 'Surface-Break Splash', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
      ] },
    { name: 'The Gathering Storm', location: 'The Sanctum\'s Lower Halls',
      intro: ['Word spreads fast among the surviving masters that the working must happen now, not at dawn — and the lower halls, already unstable, begin actively destabilizing as Vorrhak throws everything it has left at delaying the inevitable.'],
      objective: 'Fight through the destabilizing lower halls to reach the well before structural collapse seals the group out entirely.',
      outro: ['A Collapse-Bound Horror, born from the sheer violence of the sanctum\'s own structure failing under magical strain, attacks amid falling stone and cracking glass-work, forcing constant movement through genuine environmental danger. Reaching the well ahead of full collapse is a near thing, but they make it, masters and group both, breathless and battered.'],
      setup: 'Sets up Quest 8: everyone is in position, exhausted, with no more room for delay.',
      boss: { name: 'Collapse-Bound Horror', attack: 'Falling-Stone Embrace', atkType: 'phys', res: { phys: 50, magic: 25, poison: 65 }, hp: 1.5, dmg: 1.3, spd: 0.8, specialties: ['colossal', 'explosive'] },
      creatures: [
        { name: 'Strain-Crack Skitterer', attack: 'Fault-Line Dash', atkType: 'phys', res: { phys: 35, magic: 20, poison: 50 }, hp: 0.9, dmg: 1.1, spd: 1.3 },
        { name: 'Falling-Glass Shard-Cloud', attack: 'Raining Edges', atkType: 'phys', res: { phys: 25, magic: 30, poison: 55 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
        { name: 'Destabilized Ward-Ghost', attack: 'Failing-Magic Arc', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
      ] },
    { name: 'The Final Guardian', location: 'The Well Chamber',
      intro: ['Before the rite can begin, one last thing blocks it — not sent by Vorrhak this time, but summoned by the masters\' own desperate final working gone slightly wrong: a Backlash Construct, born from the accumulated strain of everything the masters have poured into holding this seal for months, finally given form and turned hostile by pure exhausted magical overflow.'],
      objective: 'Destroy the Backlash Construct without disrupting the masters\' fragile remaining strength.',
      outro: ['It\'s a delicate, dangerous fight — every stray spell risks destabilizing the well further, forcing careful, precise combat instead of raw power. When it finally falls, silence settles over the chamber. Corwin, barely standing, gives the signal: it\'s time.'],
      setup: 'Sets up Quest 9: the ritual begins, and Vorrhak makes its true, final effort to stop it.',
      boss: { name: 'Backlash Construct', attack: 'Overflow Discharge', atkType: 'magic', res: { phys: 45, magic: 40, poison: 70 }, hp: 1.5, dmg: 1.3, spd: 0.9, specialties: ['charm', 'golem'] },
      creatures: [
        { name: 'Overflow Sparkling', attack: 'Stray-Magic Arc', atkType: 'magic', res: { phys: 35, magic: 35, poison: 60 }, hp: 0.7, dmg: 1.2, spd: 1.3 },
        { name: 'Strain-Given Form', attack: 'Months-of-Effort Slam', atkType: 'phys', res: { phys: 45, magic: 25, poison: 60 }, hp: 1.2, dmg: 1.1, spd: 0.8 },
        { name: 'Fragile-Ground Creeper', attack: 'Careful-Step Punish', atkType: 'phys', res: { phys: 35, magic: 25, poison: 55 }, hp: 1.0, dmg: 1.2, spd: 1.0 },
      ] },
    { name: 'The Binding Begins', location: 'The Sealing Well, Ritual Stage',
      intro: ['Kharun and Pars take their places at the well\'s edge, blood-debt and bloodline both finally, physically present at the seal for the first time in three hundred years; Minnie channels the masters\' combined remaining strength between them.'],
      objective: 'Hold the ritual site and protect Kharun, Pars, and Minnie as the binding takes hold, against Vorrhak\'s last, most desperate assault.',
      outro: ['The Sealbreaker Horde, everything left of Vorrhak\'s influence within reach, thrown at the chamber all at once in a final, overwhelming wave, attacks from every direction as the ritual builds toward completion. It\'s the group\'s hardest defensive fight yet — no room to retreat, only to hold, while the working slowly, agonizingly strengthens around the well. The horde breaks at last, moments before the ritual reaches its final stage.'],
      setup: 'Sets up Quest 10: the ritual\'s final moment, and Vorrhak\'s true response to being bound properly for the first time in three centuries.',
      boss: { name: 'Sealbreaker Vanguard', attack: 'Horde-Front Crash', atkType: 'phys', res: { phys: 40, magic: 35, poison: 60 }, hp: 1.4, dmg: 1.4, spd: 1.2, specialties: ['swift', 'enraged'] },
      creatures: [
        { name: 'Horde Spawnling', attack: 'Every-Direction Bite', atkType: 'phys', res: { phys: 25, magic: 20, poison: 45 }, hp: 0.8, dmg: 1.1, spd: 1.3 },
        { name: 'Wave-Break Brute', attack: 'Line-Crushing Charge', atkType: 'phys', res: { phys: 40, magic: 20, poison: 55 }, hp: 1.3, dmg: 1.2, spd: 0.8 },
        { name: 'Last-Influence Wisp', attack: 'Spent-Power Flare', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
      ] },
    { name: 'What Rises to Stop It', location: 'The Sealing Well\'s Depths',
      intro: ['As the binding nears completion, Vorrhak makes one last, desperate push — not a servant, not a Herald, but a true fragment of itself forced up through the narrowing seal in a final bid to shatter the working before it locks: the Vorrhak-Spawned Colossus, a horror built from raw demonic essence given brief, unstable physical form, more powerful than anything the group has faced across the entire journey.'],
      objective: 'Hold the ritual line and destroy the Colossus before the binding completes.',
      outro: ['The fight is the story\'s most brutal yet — Minnie unable to fully assist while channeling the working, Kharun and Pars carrying the fight almost entirely alone against something that outmatches them individually, forced to fight as one unit born from every battle since Reedmarsh. In the final seconds, as the ritual locks into place, the Colossus lets out a sound that isn\'t pain so much as fury — cheated, not defeated — and is dragged backward through the collapsing seal as it slams fully, properly shut for the first time in three hundred years.'],
      setup: null,
      boss: { name: 'Vorrhak-Spawned Colossus', attack: 'Raw Demonic Essence', atkType: 'magic', res: { phys: 50, magic: 45, poison: 70 }, hp: 1.8, dmg: 1.5, spd: 0.9, specialties: ['colossal', 'berserk'] },
      creatures: [
        { name: 'Essence-Drip Spawn', attack: 'Unstable-Form Lash', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
        { name: 'Seal-Strain Horror', attack: 'Narrowing-Gap Claw', atkType: 'phys', res: { phys: 45, magic: 25, poison: 60 }, hp: 1.2, dmg: 1.2, spd: 0.9 },
        { name: 'Fury-Fragment Mote', attack: 'Cheated Shriek', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
      ] },
  ],
}, // ===== end Chapter 9 =====
{ // ================= CHAPTER 10 =================
  num: 10, title: 'Chapter 10: The Rift of the First King', icon: '👑', shopName: 'The Last Camp Trader',
  headline: 'Vorrhak is going home — to the exact spot where it was first bound.',
  story: [
    'Vorrhak\'s trail doesn\'t run like any hunt they\'ve done before — it burns, faint and hot, straight through Kharun\'s and Pars\'s blood like a compass needle that only they can feel. It pulls them away from Aldergate, away from mountains and marsh and ash, back toward a place none of them have been yet but all three somehow recognize from the old king\'s final journal: the capital that once stood at the heart of the original Kharun-lands, abandoned and swallowed by wilderness centuries ago after the throne went cold.',
    'Vorrhak is going home — to the exact spot where it was first bound, where the tear it originally crawled through has never fully closed, only scarred over. Wounded, ancient, and finally cornered by its own patience running out, it means to tear that old wound open one last time and finish what a king\'s sacrifice interrupted three hundred years ago.',
  ],
  ending: [
    'The crypt goes quiet in a way the world hasn\'t been quiet in three hundred years. The tear seals, the pressure lifts, and for a long moment none of the three of them move, as though afraid the stillness is temporary.',
    'It isn\'t. Vorrhak is gone. Truly, finally gone.',
    'Kharun stands in the tomb of his own bloodline, the old king\'s echo faded now but its final debt paid in full, and finds himself, for the first time in twenty years, without a ghost left to chase. Pars kneels at the edge of the closed tear, the weight of a lifetime spent running from something he never understood finally set down, and allows himself, for the first time since the orphanage, to simply exist without looking over his shoulder. Minnie presses a hand to the cold stone and thinks of Corwin and the others, alive above ground, free of a burden they carried far longer than anyone should have had to.',
    'They climb out of the crypt together, into a capital that hasn\'t seen real daylight fall on living heirs of its old king in three hundred years, and the ruins around them, for just a moment, don\'t look like a graveyard. They look like something that could, someday, be rebuilt.',
    'None of them say much on the walk back out through the throne road. There isn\'t much left to say. The debt that started with a king\'s trust and a friend\'s betrayal, that spread through a guild\'s greed and an academy\'s grief, that chased a deserter, a thief, and a mage across ten hard-won battles and half a broken kingdom — it\'s finished.',
    'What they do next — whether Kharun ever claims the name he was given, whether Pars finds anything left of the family that saved him once by giving him away, whether Minnie rebuilds what her masters spent themselves protecting — is a different story.',
    'But it\'s theirs to write now, freely, for the first time.',
  ],
  rareA: ['Crypt', 'Throne', 'Wound', 'Rift', 'Royal', 'Tear', 'Ancestor', 'Capital'],
  rareB: ['Feral', 'Horror', 'Wraith', 'Guardian', 'Abomination', 'Echo', 'Walker', 'Remnant'],
  eliteTitles: ['the Gate-Waker', 'the Processional Dread', 'the Throne\'s Memory', 'the Crypt-Roused',
                'the Tomb-Disturbed', 'the Trail-Shed', 'the Tear-Sworn', 'the Last Servant'],
  quests: [
    { name: 'The Dead Capital\'s Gate', location: 'The Ruined Capital Approach',
      intro: ['The old capital\'s outer walls still stand, barely, swallowed in three centuries of forest growth, and something has been moving through the ruins recently, violently.'],
      objective: 'Fight through the capital\'s ruined gate and confirm Vorrhak\'s passage.',
      outro: ['A pack of Wound-Touched Ferals, ordinary wildlife twisted instantly and severely by Vorrhak\'s raw, unshielded presence passing through mere hours ago, attack with a virulence unlike any corrupted creature faced before. Clearing them confirms it beyond doubt — the trail is fresh, and Vorrhak is weaker than legend suggested, but still leaving devastation in its wake.'],
      setup: 'Sets up Quest 2: the capital itself holds worse, disturbed awake by the demon\'s passing.',
      boss: { name: 'Wound-Touched Feral', attack: 'Virulent Frenzy', atkType: 'phys', res: { phys: 25, magic: 25, poison: 45 }, hp: 1.2, dmg: 1.4, spd: 1.3, specialties: ['swift', 'berserk'] },
      creatures: [
        { name: 'Twisted Forest-Cat', attack: 'Hours-Old Corruption', atkType: 'phys', res: { phys: 15, magic: 20, poison: 35 }, hp: 0.9, dmg: 1.2, spd: 1.3 },
        { name: 'Gate-Vine Strangler', attack: 'Overgrowth Coil', atkType: 'phys', res: { phys: 30, magic: 15, poison: 55 }, hp: 1.1, dmg: 1.0, spd: 0.8 },
        { name: 'Passage-Scorch Wisp', attack: 'Trail-Heat Flare', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.7, dmg: 1.3, spd: 1.2 },
      ] },
    { name: 'The Throne Road', location: 'The Processional Way',
      intro: ['The old road to the throne room, once lined with statues of the first king\'s generals, is now a gauntlet of toppled stone and things that shouldn\'t move.'],
      objective: 'Advance up the throne road and clear whatever Vorrhak\'s passage has stirred from centuries of dormancy.',
      outro: ['A Processional Horror, animated wreckage of the very statues meant to honor the king\'s fallen companions, now twisted by residual dark energy bleeding off Vorrhak\'s trail, blocks the way with surprising, coordinated strength. Beyond it, the road opens onto the ruined throne room itself — empty, the throne cracked in two, exactly as history said it was left.'],
      setup: 'Sets up Quest 3: the throne room holds a clue neither the histories nor the journal mentioned.',
      boss: { name: 'Processional Horror', attack: 'Honor-Guard Wreckage', atkType: 'phys', res: { phys: 50, magic: 25, poison: 70 }, hp: 1.5, dmg: 1.2, spd: 0.7, specialties: ['golem', 'colossal'] },
      creatures: [
        { name: 'Toppled General-Statue', attack: 'Stone-Sword Fall', atkType: 'phys', res: { phys: 50, magic: 15, poison: 70 }, hp: 1.3, dmg: 1.1, spd: 0.6 },
        { name: 'Gauntlet-Rubble Crawler', attack: 'Roadblock Lunge', atkType: 'phys', res: { phys: 40, magic: 20, poison: 60 }, hp: 1.0, dmg: 1.1, spd: 0.9 },
        { name: 'Residual-Dark Mote', attack: 'Trail-Bled Shadow', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
      ] },
    { name: 'The Cracked Throne', location: 'The Throne Room',
      intro: ['Kharun stands before the seat his ancestor never sat in again after the night he died, and something in the cracked stone catches Minnie\'s eye — old ward-work, deliberately carved into the throne\'s base, still faintly active.'],
      objective: 'Investigate the throne\'s hidden ward-work while defending against whatever Vorrhak\'s presence has drawn into the throne room.',
      outro: ['A Throne-Bound Wraith, the lingering echo of the very ward-magic the old king wove into his own seat of power as a last contingency, misidentifies the group as threats and attacks before Minnie manages to calm it with the right phrase. Once pacified, it shows them the truth: the king left a final message, keyed to activate only when his bloodline and the demon\'s trail were both present in this room at once. That moment is now.'],
      setup: 'Sets up Quest 4: the old king speaks, in echo, for the first time in three centuries.',
      boss: { name: 'Throne-Bound Wraith', attack: 'Contingency Ward-Lash', atkType: 'magic', res: { phys: 55, magic: 35, poison: 70 }, hp: 1.3, dmg: 1.3, spd: 1.1, specialties: ['spectral', 'charm'] },
      creatures: [
        { name: 'Seat-of-Power Echo', attack: 'Royal Ward-Snap', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
        { name: 'Cracked-Dais Skitterer', attack: 'Throne-Split Dart', atkType: 'phys', res: { phys: 35, magic: 20, poison: 50 }, hp: 0.9, dmg: 1.1, spd: 1.2 },
        { name: 'Hall-Column Haunt', attack: 'Pillar-Shadow Crush', atkType: 'phys', res: { phys: 45, magic: 25, poison: 65 }, hp: 1.2, dmg: 1.1, spd: 0.8 },
      ] },
    { name: 'The King\'s Echo', location: 'The Royal Antechamber',
      intro: ['The activated ward projects a faded, fragmentary echo of the old king himself — not a ghost, just residual will and memory, enough to deliver one final piece of guidance.'],
      objective: 'Protect the antechamber long enough for the echo to finish its message, against a final surge of residual corruption reacting violently to the king\'s own preserved will.',
      outro: ['A Residual Horror, corrupted energy specifically opposed to the king\'s lingering ward-signature, attacks to silence the echo before it finishes speaking. They hold the line, and the echo delivers its message: Vorrhak cannot be destroyed by force alone, not fully — it can only be driven back through the same tear it first came from, and that tear lies beneath the old capital, at the heart of what used to be the royal crypt.'],
      setup: 'Sets up Quest 5: the true final battlefield is revealed — the crypt beneath the capital.',
      boss: { name: 'Residual Horror', attack: 'Echo-Silencing Surge', atkType: 'magic', res: { phys: 40, magic: 40, poison: 60 }, hp: 1.4, dmg: 1.4, spd: 1.0, specialties: ['magical', 'explosive'] },
      creatures: [
        { name: 'Anti-Ward Fragment', attack: 'Signature-Hate Burst', atkType: 'magic', res: { phys: 40, magic: 30, poison: 60 }, hp: 0.8, dmg: 1.2, spd: 1.2 },
        { name: 'Antechamber Creep', attack: 'Message-Drowning Wail', atkType: 'magic', res: { phys: 35, magic: 30, poison: 55 }, hp: 0.9, dmg: 1.2, spd: 1.1 },
        { name: 'Memory-Static Wisp', attack: 'Fragment-Scatter Zap', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 0.7, dmg: 1.3, spd: 1.3 },
      ] },
    { name: 'The Crypt Descent', location: 'The Royal Crypt Stair',
      intro: ['The stairway down to the crypts is choked with centuries of rubble, recently, violently cleared by something forcing its own way through.'],
      objective: 'Descend the crypt stair and clear whatever\'s guarding the forced passage.',
      outro: ['A Crypt-Bound Abomination, the corrupted remains of ancient royal guardians roused and twisted by Vorrhak\'s passage moments before, attacks with the ferocity of something that\'s waited three hundred years for exactly this kind of intrusion. Descending past it, the air grows heavy, wrong, saturated with a presence far stronger than anything felt since Vesk\'s lighthouse.'],
      setup: 'Sets up Quest 6: they are close now, close enough to feel Vorrhak directly for the first time.',
      boss: { name: 'Crypt-Bound Abomination', attack: 'Three-Century Vigil', atkType: 'phys', res: { phys: 45, magic: 30, poison: 70 }, hp: 1.5, dmg: 1.3, spd: 0.9, specialties: ['necrotic', 'resilient'] },
      creatures: [
        { name: 'Roused Guard-Remains', attack: 'Rusted Crypt-Blade', atkType: 'phys', res: { phys: 40, magic: 20, poison: 65 }, hp: 1.1, dmg: 1.1, spd: 0.8 },
        { name: 'Stair-Choke Crawler', attack: 'Rubble-Gap Strike', atkType: 'phys', res: { phys: 35, magic: 15, poison: 55 }, hp: 1.0, dmg: 1.1, spd: 1.0 },
        { name: 'Descent-Dark Shade', attack: 'Heavying Air', atkType: 'magic', res: { phys: 50, magic: 30, poison: 70 }, hp: 0.8, dmg: 1.2, spd: 1.1 },
      ] },
    { name: 'The Ancestors\' Rest', location: 'The Royal Tombs',
      intro: ['The crypt\'s main chamber holds generations of the old bloodline\'s dead, tombs cracked open by Vorrhak\'s passing, disturbed remains animated by proximity to raw demonic presence.'],
      objective: 'Clear the royal tombs of the disturbed dead before pressing toward the crypt\'s heart.',
      outro: ['A gathering of Ancestor Wraiths, tragic and furious in equal measure, former kings and nobles of the old bloodline twisted briefly into hostile shapes by Vorrhak\'s passing touch, attack before finally being put to rest properly, this time for good. In the chamber\'s stillness afterward, Kharun feels something settle in his chest — not triumph, but a strange, quiet kinship with every name in this room.'],
      setup: 'Sets up Quest 7: the deepest part of the crypt lies just ahead, and Vorrhak knows they\'re coming.',
      boss: { name: 'Ancestor Wraith', attack: 'Bloodline\'s Fury', atkType: 'magic', res: { phys: 55, magic: 35, poison: 70 }, hp: 1.3, dmg: 1.3, spd: 1.1, specialties: ['spectral', 'cursed'] },
      creatures: [
        { name: 'Disturbed King-Shade', attack: 'Crown-Weight Blow', atkType: 'magic', res: { phys: 50, magic: 30, poison: 70 }, hp: 1.0, dmg: 1.2, spd: 1.0 },
        { name: 'Cracked-Tomb Riser', attack: 'Grave-Dust Grip', atkType: 'phys', res: { phys: 40, magic: 20, poison: 65 }, hp: 1.1, dmg: 1.1, spd: 0.8 },
        { name: 'Noble-Bone Fragment', attack: 'Scattered-Rest Cut', atkType: 'phys', res: { phys: 35, magic: 25, poison: 60 }, hp: 0.8, dmg: 1.2, spd: 1.2 },
      ] },
    { name: 'The Narrowing Dark', location: 'The Crypt\'s Lower Passage',
      intro: ['The passage narrows and darkens further, walls sweating with condensation that shouldn\'t exist underground, air thick with the specific, wrong pressure of something ancient nearby.'],
      objective: 'Push through the narrowing passage and survive whatever Vorrhak has left in its wake to slow pursuit.',
      outro: ['A Trailing Horror, a piece of Vorrhak\'s own shed corruption given brief hostile life specifically to buy the demon more time, attacks with desperate, thrashing violence. Destroying it, the group finally sees light ahead — not natural light, but the pale, wrong glow of an open tear in reality itself.'],
      setup: 'Sets up Quest 8: the tear is finally in sight, and Vorrhak is cornered.',
      boss: { name: 'Trailing Horror', attack: 'Shed-Corruption Thrash', atkType: 'phys', res: { phys: 40, magic: 35, poison: 60 }, hp: 1.4, dmg: 1.4, spd: 1.2, specialties: ['berserk', 'swift'] },
      creatures: [
        { name: 'Wake-Left Fragment', attack: 'Time-Buying Bite', atkType: 'phys', res: { phys: 30, magic: 25, poison: 50 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
        { name: 'Condensation Wraithlet', attack: 'Wrong-Damp Chill', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 0.7, dmg: 1.2, spd: 1.2 },
        { name: 'Pressure-Thick Shade', attack: 'Ancient-Nearness Crush', atkType: 'magic', res: { phys: 45, magic: 30, poison: 65 }, hp: 1.0, dmg: 1.2, spd: 0.9 },
      ] },
    { name: 'The Threshold of the Tear', location: 'The Crypt\'s Heart',
      intro: ['The tear pulses at the chamber\'s center, exactly as the old journal described three centuries ago — smaller now, weaker, but still a wound in the world that shouldn\'t exist.'],
      objective: 'Hold the threshold and prevent Vorrhak\'s remaining servants from widening the tear before the group can reach the demon itself.',
      outro: ['A Tear-Bound Guardian, the last true servant Vorrhak has left, thrown into the fight with everything it has to buy its master time to fully recover from the escape, fights with genuine desperation rather than confidence — the tide has turned, and even it seems to know it. Its defeat leaves the tear undefended, and beyond it, weakened, cornered, furious, waits Vorrhak itself.'],
      setup: 'Sets up Quest 9: the final confrontation is at hand, but Vorrhak gets one last word before the fighting starts.',
      boss: { name: 'Tear-Bound Guardian', attack: 'Master\'s Last Defense', atkType: 'magic', res: { phys: 45, magic: 40, poison: 65 }, hp: 1.5, dmg: 1.4, spd: 1.0, specialties: ['resistant', 'charm'] },
      creatures: [
        { name: 'Tear-Edge Widener', attack: 'Reality-Pick Scratch', atkType: 'magic', res: { phys: 40, magic: 35, poison: 60 }, hp: 0.8, dmg: 1.2, spd: 1.2 },
        { name: 'Desperation Spawnling', attack: 'Tide-Turned Snap', atkType: 'phys', res: { phys: 30, magic: 25, poison: 50 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
        { name: 'Pulse-Glow Horror', attack: 'Wrong-Light Sear', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 1.0, dmg: 1.3, spd: 1.0 },
      ] },
    { name: 'What Vorrhak Says', location: 'The Edge of the Tear',
      intro: ['Vorrhak, still recovering from three centuries of imprisonment and the raw violence of its own escape, is diminished but not weak — and it speaks, for the first time directly, to all three of them at once, in a voice that seems to come from everywhere and nowhere. It tells Kharun that his ancestor\'s mercy toward it, centuries ago, was the only reason it survived long enough to try again. It tells Pars that his bloodline was never punished, only harvested, patiently, the way a farmer waits for a crop to ripen. It tells Minnie that her masters didn\'t fail — they simply bought exactly as much time as anyone could have.'],
      objective: 'Resist Vorrhak\'s attempt to demoralize and divide the group before it can fully recover its strength.',
      outro: ['A brief, vicious clash against a Waning Aspect of Vorrhak\'s own power — not the demon at full strength, but enough of it lashing out to test their resolve — ends when the group, instead of breaking apart under its words, stands together. Vorrhak, denied the doubt it needed, finally reveals itself fully.'],
      setup: 'Sets up Quest 10: the true final battle, against Vorrhak at last, no servants, no Heralds, no more delays.',
      boss: { name: 'Waning Aspect of Vorrhak', attack: 'Doubt Made Blade', atkType: 'magic', res: { phys: 50, magic: 45, poison: 70 }, hp: 1.5, dmg: 1.4, spd: 1.1, specialties: ['cursed', 'spectral'] },
      creatures: [
        { name: 'Whispered-Mercy Echo', attack: 'Kharun\'s Doubt', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 0.9, dmg: 1.2, spd: 1.1 },
        { name: 'Harvest-Patience Shade', attack: 'Pars\'s Doubt', atkType: 'phys', res: { phys: 35, magic: 30, poison: 55 }, hp: 0.9, dmg: 1.2, spd: 1.2 },
        { name: 'Bought-Time Phantom', attack: 'Minnie\'s Doubt', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 0.9, dmg: 1.2, spd: 1.1 },
      ] },
    { name: 'Vorrhak Unbound', location: 'Within the Tear',
      intro: ['Vorrhak manifests at last in its true form — vast, ancient, wrong in ways that resist easy description, weakened by three centuries of imprisonment but still more powerful than everything the group has faced combined.'],
      objective: 'Destroy Vorrhak before it can fully recover its strength and either escape again or seal the tear from its own side, trapping the world with it forever.',
      outro: ['The battle is the culmination of everything — Kharun\'s blade, honed across a hundred fights since Reedmarsh; Pars\'s speed and cunning, finally turned against the very thing that hunted his bloodline from birth; Minnie\'s magic, channeling not just her own strength but the echo of every master, every king, every soul this demon has wronged across three hundred years. Vorrhak fights with the desperation of something that knows it\'s finally, truly cornered, shifting forms, hurling fragments of every horror the group has faced across the whole journey as one final gauntlet. But it is not enough. In the end, it is Kharun and Pars together, blood of the same broken line finally standing as one instead of two separate debts, who drive the final blow home, with Minnie\'s working behind it closing the tear even as the strike lands — Vorrhak unraveling not into rot or ash, but into silence, and then nothing at all, the ancient wound in the world sealing shut behind it forever.'],
      setup: null,
      boss: { name: 'Vorrhak', attack: 'The Unpaid Debt', atkType: 'magic', res: { phys: 50, magic: 50, poison: 70 }, hp: 2.0, dmg: 1.5, spd: 1.1, specialties: ['enraged', 'vampiric'] },
      creatures: [
        { name: 'Hurled Journey-Horror', attack: 'Remembered Gauntlet', atkType: 'phys', res: { phys: 40, magic: 30, poison: 60 }, hp: 1.1, dmg: 1.2, spd: 1.0 },
        { name: 'Form-Shift Fragment', attack: 'Shape-Losing Lash', atkType: 'magic', res: { phys: 45, magic: 35, poison: 65 }, hp: 0.9, dmg: 1.3, spd: 1.2 },
        { name: 'Cornered-Dark Spawn', attack: 'Desperate Unmaking', atkType: 'magic', res: { phys: 45, magic: 40, poison: 65 }, hp: 1.0, dmg: 1.3, spd: 1.1 },
      ] },
  ],
}, // ===== end Chapter 10 =====
];

// ------------------------------------------------------------
// Skills — 12 per class
// cat: basic | passive | passive2 | attack | attack2 | aoe | aoe2 |
//      heal | buff | debuff | ult | ult2
// All numeric params are functions of effective rank r (1..8).
// ------------------------------------------------------------
function mkSkills(list) { const o = {}; for (const s of list) o[s.id] = s; return o; }
// Buff/debuff/poison durations grow modestly as a skill develops — +1
// round every 3 ranks, capped at +3 so a heavily gear-boosted rank (r can
// exceed MAX_RANK via the allSkills/per-skill affixes) doesn't run away.
// Magnitude (damage%, stat bonus, resistance shred, poison %, etc.) already
// scaled with rank on every one of these; duration didn't, until now.
function skillRounds(base, r) { return base + Math.min(3, Math.floor((r - 1) / 3)); }

DATA.SKILLS = {
warrior: mkSkills([
  // Skill ranks: per-rank coefficients below are HALVED vs. the old
  // MAX_RANK=5 balance (see MAX_RANK in game.js, now 10) — rank 10 with no
  // gear bonus lands roughly where old rank 5 did, leaving headroom for
  // +skill/+All Skills gear to push ranks past 10 without exploding.
  { id: 'w_basic', cat: 'basic', name: 'Slash', icon: '🗡️', minLvl: 1,
    desc: r => `Free weapon attack for ${100 + 3 * r}% damage. Costs nothing.`,
    mult: r => 1.0 + 0.03 * r, cost: () => 0, cd: 0 },
  { id: 'w_pass1', cat: 'passive', name: 'Toughness', icon: '🛡️', minLvl: 2,
    desc: r => `Passive: +${4.5 * r}% Max HP, +${1.5 * r} Armor, +${(0.45 * r).toFixed(1)} HP Regen.`,
    passive: r => ({ hpPct: 0.045 * r, armor: 1.5 * r, hpRegen: 0.45 * r }) },
  { id: 'w_pass2', cat: 'passive2', name: 'Battle Hardened', icon: '⚙️', minLvl: 10, req: 'w_pass1',
    desc: r => `Passive: ${1.5 * r}% damage reduction, +${1.5 * r}% all resistances, +${2 * r}% damage.`,
    passive: r => ({ dr: 0.015 * r, resAll: 1.5 * r, dmgPct: 0.02 * r }) },
  { id: 'w_atk1', cat: 'attack', name: 'Heavy Strike', icon: '💥', minLvl: 2,
    desc: r => `A crushing blow for ${150 + 15 * r}% damage.`,
    mult: r => 1.5 + 0.15 * r, cost: () => 10, cd: 2 },
  { id: 'w_atk2', cat: 'attack2', name: 'Skull Crusher', icon: '🔨', minLvl: 8, req: 'w_atk1',
    desc: r => `${250 + 25 * r}% damage and stuns the enemy for 1 round.`,
    mult: r => 2.5 + 0.25 * r, cost: () => 22, cd: 4, stun: 1 },
  { id: 'w_aoe1', cat: 'aoe', name: 'Whirlwind', icon: '🌀', minLvl: 5,
    desc: r => `Spin and hit ALL enemies for ${90 + 9 * r}% damage.`,
    mult: r => 0.9 + 0.09 * r, cost: () => 16, cd: 3, aoe: true },
  { id: 'w_aoe2', cat: 'aoe2', name: 'Earthquake', icon: '🌋', minLvl: 12, req: 'w_aoe1',
    desc: r => `Shatter the ground: ${160 + 16 * r}% damage to ALL enemies.`,
    mult: r => 1.6 + 0.16 * r, cost: () => 32, cd: 5, aoe: true },
  { id: 'w_heal', cat: 'heal', name: 'Second Wind', icon: '💚', minLvl: 3,
    desc: r => `Recover ${14 + 2.5 * r}% of Max HP.`,
    healPct: r => 0.14 + 0.025 * r, cost: () => 14, cd: 4 },
  { id: 'w_buff', cat: 'buff', name: 'Battle Shout', icon: '📯', minLvl: 4,
    desc: r => `+${10 + 3 * r}% damage and +${1 * r} Strength for ${skillRounds(5, r)} rounds.`,
    buff: r => ({ dmgPct: 0.10 + 0.03 * r, str: 1 * r, rounds: skillRounds(5, r) }), cost: () => 15, cd: 6 },
  { id: 'w_debuff', cat: 'debuff', name: 'Intimidate', icon: '😤', minLvl: 6,
    desc: r => `Enemies deal ${10 + 2.5 * r}% less damage and lose ${2 * r}% resistances for ${skillRounds(4, r)} rounds.`,
    debuff: r => ({ dmgDown: 0.10 + 0.025 * r, resDown: 2 * r, rounds: skillRounds(4, r) }), cost: () => 12, cd: 5 },
  { id: 'w_ult', cat: 'ult', name: 'Berserk', icon: '🔥', minLvl: 15,
    desc: r => `ULTIMATE: +${25 + 6 * r}% damage and attack twice per round for ${skillRounds(6, r)} rounds.`,
    buff: r => ({ dmgPct: 0.25 + 0.06 * r, extraHit: 1, rounds: skillRounds(6, r) }), cost: () => 40, cd: 10 },
  { id: 'w_ult2', cat: 'ult2', name: 'Avatar of War', icon: '👹', minLvl: 25, req: 'w_ult',
    desc: r => `ULTIMATE: Become war itself — ${380 + 40 * r}% damage to ALL enemies, and +${15 + 2.5 * r}% damage for ${skillRounds(4, r)} rounds.`,
    mult: r => 3.8 + 0.4 * r, aoe: true, buff: r => ({ dmgPct: 0.15 + 0.025 * r, rounds: skillRounds(4, r) }), cost: () => 60, cd: 12 },

  // ===== Advanced Class — Knight -> Paladin (Protection & Armor) =====
  { id: 'w_p_knight_active', cat: 'buff', path: 'knight', name: 'Divine Protection', icon: '✨', minLvl: 25, req: 'w_buff',
    desc: r => `Channel divine protection: +${Math.round((0.03 + 0.02 * r) * 100)}% Damage Reduction, +${2 * r}% all resistances, +${(0.3 * r).toFixed(1)} HP Regen for ${skillRounds(6, r)} rounds.`,
    buff: r => ({ dr: 0.03 + 0.02 * r, resAll: 2 * r, hpRegen: 0.3 * r, rounds: skillRounds(6, r) }), cost: () => 20, cd: 6 },
  { id: 'w_p_knight_pass1', cat: 'passive3', path: 'knight', name: 'Aegis Training', icon: '⚜️', minLvl: 25,
    desc: r => `Passive: +${2.5 * r} Armor, +${2 * r}% Damage Reduction, +${3 * r}% Max HP.`,
    passive: r => ({ armor: 2.5 * r, dr: 0.02 * r, hpPct: 0.03 * r }) },
  { id: 'w_p_knight_pass2', cat: 'passive4', path: 'knight', name: 'Unbreakable Faith', icon: '🕊️', minLvl: 50, req: 'w_p_knight_pass1',
    desc: r => `Passive: +${2 * r}% Damage Reduction, reflect ${(1.5 * r).toFixed(1)}% of damage taken back at attackers, +${1.5 * r}% all resistances.`,
    passive: r => ({ dr: 0.02 * r, painReflect: 1.5 * r, resAll: 1.5 * r }) },
  { id: 'w_p_knight_ult', cat: 'ult', path: 'knight', name: 'Aegis of the Paladin', icon: '👼', minLvl: 50, req: 'w_ult',
    desc: r => `ULTIMATE: Smite ALL enemies for ${220 + 22 * r}% damage and shield yourself with +${Math.round((0.05 + 0.03 * r) * 100)}% Damage Reduction for ${skillRounds(4, r)} rounds.`,
    mult: r => 2.2 + 0.22 * r, aoe: true, buff: r => ({ dr: 0.05 + 0.03 * r, rounds: skillRounds(4, r) }), cost: () => 45, cd: 11 },

  // ===== Advanced Class — Mercenary -> Warlord (Damage & Disability) =====
  { id: 'w_p_merc_active', cat: 'debuff', path: 'mercenary', name: 'Crippling Blow', icon: '⛓️', minLvl: 25, req: 'w_debuff',
    desc: r => `Crush a foe for ${180 + 18 * r}% damage, crippling them: -${Math.round((0.15 + 0.025 * r) * 100)}% damage dealt and -${3 * r}% resistances for ${skillRounds(5, r)} rounds.`,
    mult: r => 1.8 + 0.18 * r, debuff: r => ({ dmgDown: 0.15 + 0.025 * r, resDown: 3 * r, rounds: skillRounds(5, r) }), cost: () => 22, cd: 5 },
  { id: 'w_p_merc_pass1', cat: 'passive3', path: 'mercenary', name: 'Bloodlust', icon: '🩸', minLvl: 25,
    desc: r => `Passive: +${1.5 * r}% Critical Strike chance (double damage), +${1.5 * r}% damage.`,
    passive: r => ({ critStrike: 1.5 * r, dmgPct: 0.015 * r }) },
  { id: 'w_p_merc_pass2', cat: 'passive4', path: 'mercenary', name: 'Warmonger', icon: '⚔️', minLvl: 50, req: 'w_p_merc_pass1',
    desc: r => `Passive: +${2 * r}% bonus damage against enemies below 25% HP, +${2 * r}% damage.`,
    passive: r => ({ execute: 2 * r, dmgPct: 0.02 * r }) },
  { id: 'w_p_merc_ult', cat: 'ult', path: 'mercenary', name: 'Reign of Terror', icon: '💀', minLvl: 50, req: 'w_ult',
    desc: r => `ULTIMATE: Terrorize the battlefield for ${250 + 25 * r}% damage to ALL enemies and stun them for 1 round.`,
    mult: r => 2.5 + 0.25 * r, aoe: true, stun: 1, cost: () => 48, cd: 11 },
]),
rogue: mkSkills([
  { id: 'r_basic', cat: 'basic', name: 'Quick Stab', icon: '🗡️', minLvl: 1,
    desc: r => `Free weapon attack for ${100 + 3 * r}% damage. Costs nothing.`,
    mult: r => 1.0 + 0.03 * r, cost: () => 0, cd: 0 },
  { id: 'r_pass1', cat: 'passive', name: 'Nimble', icon: '🪶', minLvl: 2,
    desc: r => `Passive: +${1.5 * r}% Evasion, +${2 * r} Speed, +${1.5 * r}% damage.`,
    passive: r => ({ evasion: 1.5 * r, speed: 2 * r, dmgPct: 0.015 * r }) },
  { id: 'r_pass2', cat: 'passive2', name: 'Shadow Dance', icon: '🌑', minLvl: 10, req: 'r_pass1',
    desc: r => `Passive: +${1.5 * r}% Evasion, +${3 * r}% damage, +${(0.3 * r).toFixed(1)} HP Regen.`,
    passive: r => ({ evasion: 1.5 * r, dmgPct: 0.03 * r, hpRegen: 0.3 * r }) },
  { id: 'r_atk1', cat: 'attack', name: 'Backstab', icon: '🔪', minLvl: 2,
    desc: r => `Strike a vital spot for ${150 + 16 * r}% damage.`,
    mult: r => 1.5 + 0.16 * r, cost: () => 10, cd: 2 },
  { id: 'r_atk2', cat: 'attack2', name: 'Eviscerate', icon: '🩸', minLvl: 8, req: 'r_atk1',
    desc: r => `${260 + 26 * r}% damage — ignores half the enemy's physical resistance.`,
    mult: r => 2.6 + 0.26 * r, cost: () => 22, cd: 4, pierce: 0.5 },
  { id: 'r_aoe1', cat: 'aoe', name: 'Fan of Knives', icon: '🎯', minLvl: 5,
    desc: r => `Throw blades at ALL enemies for ${85 + 9 * r}% damage.`,
    mult: r => 0.85 + 0.09 * r, cost: () => 16, cd: 3, aoe: true },
  { id: 'r_aoe2', cat: 'aoe2', name: 'Blade Storm', icon: '🌪️', minLvl: 12, req: 'r_aoe1',
    desc: r => `A whirl of steel: ${155 + 16 * r}% damage to ALL enemies.`,
    mult: r => 1.55 + 0.16 * r, cost: () => 32, cd: 5, aoe: true },
  { id: 'r_heal', cat: 'heal', name: 'Adrenaline Rush', icon: '💚', minLvl: 3,
    desc: r => `Surge of vigor: recover ${13 + 2.5 * r}% of Max HP.`,
    healPct: r => 0.13 + 0.025 * r, cost: () => 14, cd: 4 },
  { id: 'r_buff', cat: 'buff', name: 'Deadly Focus', icon: '👁️', minLvl: 4,
    desc: r => `+${12 + 3 * r}% damage and +${1 * r} Dexterity for ${skillRounds(5, r)} rounds.`,
    buff: r => ({ dmgPct: 0.12 + 0.03 * r, dex: 1 * r, rounds: skillRounds(5, r) }), cost: () => 15, cd: 6 },
  { id: 'r_debuff', cat: 'debuff', name: 'Expose Weakness', icon: '🔎', minLvl: 6,
    desc: r => `Enemies lose ${2.5 * r}% resistances and deal ${8 + 2 * r}% less damage for ${skillRounds(4, r)} rounds.`,
    debuff: r => ({ dmgDown: 0.08 + 0.02 * r, resDown: 2.5 * r, rounds: skillRounds(4, r) }), cost: () => 12, cd: 5 },
  { id: 'r_ult', cat: 'ult', name: 'Death Mark', icon: '💀', minLvl: 15,
    desc: r => `ULTIMATE: Mark all enemies for death — ${300 + 30 * r}% damage and they lose ${3 * r}% resistances for ${skillRounds(4, r)} rounds.`,
    mult: r => 3.0 + 0.3 * r, aoe: true, debuff: r => ({ resDown: 3 * r, dmgDown: 0, rounds: skillRounds(4, r) }), cost: () => 40, cd: 10 },
  { id: 'r_ult2', cat: 'ult2', name: 'Thousand Cuts', icon: '⚔️', minLvl: 25, req: 'r_ult',
    desc: r => `ULTIMATE: ${420 + 42.5 * r}% damage to ALL enemies and attack twice per round for ${skillRounds(4, r)} rounds.`,
    mult: r => 4.2 + 0.425 * r, aoe: true, buff: r => ({ extraHit: 1, rounds: skillRounds(4, r) }), cost: () => 60, cd: 12 },

  // ===== Advanced Class — Assassin -> Ninja (Dagger/Exotic Weapons, Poison) =====
  { id: 'r_p_assassin_active', cat: 'attack2', path: 'assassin', name: 'Venomous Strike', icon: '☠️', minLvl: 25, req: 'r_atk2',
    desc: r => `Strike with venom for ${280 + 28 * r}% damage, poisoning the target for ${(1 + r * 0.2).toFixed(1)}% of their max HP/round for ${skillRounds(3, r)} rounds.`,
    mult: r => 2.8 + 0.28 * r, pierce: 0.5, poisonDot: r => ({ pct: 0.01 + r * 0.002, rounds: skillRounds(3, r) }), cost: () => 24, cd: 4 },
  { id: 'r_p_assassin_pass1', cat: 'passive3', path: 'assassin', name: 'Exotic Mastery', icon: '🥷', minLvl: 25,
    desc: r => `Passive: +${2 * r}% Critical Strike chance, +${1 * r}% chance to strike twice.`,
    passive: r => ({ critStrike: 2 * r, doubleStrike: 1 * r }) },
  { id: 'r_p_assassin_pass2', cat: 'passive4', path: 'assassin', name: 'Toxin Adept', icon: '🧪', minLvl: 50, req: 'r_p_assassin_pass1',
    desc: r => `Passive: +${(0.5 * r).toFixed(1)}% Lifesteal, +${2 * r}% damage.`,
    passive: r => ({ lifesteal: 0.5 * r, dmgPct: 0.02 * r }) },
  { id: 'r_p_assassin_ult', cat: 'ult', path: 'assassin', name: 'Shadow Execution', icon: '⚰️', minLvl: 50, req: 'r_ult',
    desc: r => `ULTIMATE: Vanish and strike ALL enemies for ${320 + 32 * r}% damage, poisoning them for ${(1.5 + r * 0.3).toFixed(1)}% of their max HP/round for ${skillRounds(4, r)} rounds.`,
    mult: r => 3.2 + 0.32 * r, aoe: true, poisonDot: r => ({ pct: 0.015 + r * 0.003, rounds: skillRounds(4, r) }), cost: () => 50, cd: 11 },

  // ===== Advanced Class — Hunter -> Sniper (Bows/Crossbows, Ranged Damage) =====
  { id: 'r_p_hunter_active', cat: 'attack2', path: 'hunter', name: 'Kill Shot', icon: '🏹', minLvl: 25, req: 'r_atk2',
    desc: r => `A precise shot for ${320 + 32 * r}% damage, ignoring 60% of the enemy's resistance.`,
    mult: r => 3.2 + 0.32 * r, pierce: 0.6, cost: () => 24, cd: 4 },
  { id: 'r_p_hunter_pass1', cat: 'passive3', path: 'hunter', name: 'Deadeye', icon: '🔭', minLvl: 25,
    desc: r => `Passive: +${2.5 * r}% Critical Strike chance, +${1 * r} Speed.`,
    passive: r => ({ critStrike: 2.5 * r, speed: 1 * r }) },
  { id: 'r_p_hunter_pass2', cat: 'passive4', path: 'hunter', name: "Marksman's Focus", icon: '🦅', minLvl: 50, req: 'r_p_hunter_pass1',
    desc: r => `Passive: +${3 * r}% damage, +${1 * r}% Evasion.`,
    passive: r => ({ dmgPct: 0.03 * r, evasion: 1 * r }) },
  { id: 'r_p_hunter_ult', cat: 'ult', path: 'hunter', name: 'Dead Eye Barrage', icon: '🌧️', minLvl: 50, req: 'r_ult',
    desc: r => `ULTIMATE: Unleash a hail of arrows on ALL enemies for ${350 + 35 * r}% damage, ignoring half their resistance.`,
    mult: r => 3.5 + 0.35 * r, aoe: true, pierce: 0.5, cost: () => 50, cd: 11 },
]),
mage: mkSkills([
  { id: 'm_basic', cat: 'basic', name: 'Arcane Bolt', icon: '✨', minLvl: 1,
    desc: r => `Free magic attack for ${100 + 3.5 * r}% damage. Costs nothing.`,
    mult: r => 1.0 + 0.035 * r, cost: () => 0, cd: 0, magic: true },
  { id: 'm_pass1', cat: 'passive', name: 'Arcane Mind', icon: '🧠', minLvl: 2,
    desc: r => `Passive: +${6 * r}% Max Mana, +${(0.6 * r).toFixed(1)} Mana Regen, +${1.5 * r}% damage.`,
    passive: r => ({ manaPct: 0.06 * r, manaRegen: 0.6 * r, dmgPct: 0.015 * r }) },
  { id: 'm_pass2', cat: 'passive2', name: 'Spellweaver', icon: '🌟', minLvl: 10, req: 'm_pass1',
    desc: r => `Passive: +${3.5 * r}% damage, +${2 * r}% Max HP, +${1.5 * r}% all resistances.`,
    passive: r => ({ dmgPct: 0.035 * r, hpPct: 0.02 * r, resAll: 1.5 * r }) },
  // Cooldowns cut ~35-45% and mana costs brought down to Warrior/Rogue's
  // baseline (was a flat ~15-20% mage-only premium) — a deliberate class
  // identity shift toward "cast often" rather than "wait for a big hit".
  { id: 'm_atk1', cat: 'attack', name: 'Fireball', icon: '🔥', minLvl: 2,
    desc: r => `Hurl fire for ${160 + 17 * r}% damage.`,
    mult: r => 1.6 + 0.17 * r, cost: () => 10, cd: 1, magic: true },
  { id: 'm_atk2', cat: 'attack2', name: 'Pyroblast', icon: '☄️', minLvl: 8, req: 'm_atk1',
    desc: r => `${280 + 27.5 * r}% damage — ignores half the enemy's magic resistance.`,
    mult: r => 2.8 + 0.275 * r, cost: () => 22, cd: 3, magic: true, pierce: 0.5 },
  { id: 'm_aoe1', cat: 'aoe', name: 'Frost Nova', icon: '❄️', minLvl: 5,
    desc: r => `Freeze ALL enemies for ${95 + 10 * r}% damage.`,
    mult: r => 0.95 + 0.1 * r, cost: () => 16, cd: 2, aoe: true, magic: true },
  { id: 'm_aoe2', cat: 'aoe2', name: 'Meteor Storm', icon: '🌠', minLvl: 12, req: 'm_aoe1',
    desc: r => `Rain destruction: ${175 + 18 * r}% damage to ALL enemies.`,
    mult: r => 1.75 + 0.18 * r, cost: () => 32, cd: 3, aoe: true, magic: true },
  { id: 'm_heal', cat: 'heal', name: 'Healing Light', icon: '💚', minLvl: 3,
    desc: r => `Mend wounds: recover ${Math.round((0.30 + (r - 1) * (0.20 / 9)) * 100)}% of Max HP.`,
    healPct: r => 0.30 + (r - 1) * (0.20 / 9), cost: () => 14, cd: 3 },
  { id: 'm_buff', cat: 'buff', name: 'Arcane Power', icon: '🔮', minLvl: 4,
    desc: r => `+${14 + 3.5 * r}% damage, +${1 * r} Intelligence and a +${2 * r}% Damage Reduction ward for ${skillRounds(5, r)} rounds.`,
    buff: r => ({ dmgPct: 0.14 + 0.035 * r, int: 1 * r, dr: 0.02 * r, rounds: skillRounds(5, r) }), cost: () => 15, cd: 4 },
  { id: 'm_debuff', cat: 'debuff', name: 'Curse of Weakness', icon: '🕯️', minLvl: 6,
    desc: r => `Enemies deal ${12 + 2.5 * r}% less damage and lose ${2.5 * r}% resistances for ${skillRounds(4, r)} rounds.`,
    debuff: r => ({ dmgDown: 0.12 + 0.025 * r, resDown: 2.5 * r, rounds: skillRounds(4, r) }), cost: () => 12, cd: 3 },
  { id: 'm_ult', cat: 'ult', name: 'Elemental Fury', icon: '🌩️', minLvl: 15,
    desc: r => `ULTIMATE: ${340 + 32.5 * r}% damage to ALL enemies and +${20 + 4 * r}% damage for ${skillRounds(4, r)} rounds.`,
    mult: r => 3.4 + 0.325 * r, aoe: true, magic: true, buff: r => ({ dmgPct: 0.20 + 0.04 * r, rounds: skillRounds(4, r) }), cost: () => 40, cd: 6 },
  { id: 'm_ult2', cat: 'ult2', name: 'Apocalypse', icon: '☀️', minLvl: 25, req: 'm_ult',
    desc: r => `ULTIMATE: ${460 + 45 * r}% damage to ALL enemies, ignoring half their magic resistance.`,
    mult: r => 4.6 + 0.45 * r, aoe: true, magic: true, pierce: 0.5, cost: () => 60, cd: 8 },

  // ===== Advanced Class — Sorcerer -> Archmage (Magic Damage) =====
  { id: 'm_p_sorcerer_active', cat: 'attack2', path: 'sorcerer', name: 'Disintegrate', icon: '🌌', minLvl: 25, req: 'm_atk2', magic: true,
    desc: r => `Unleash pure arcane force for ${340 + 34 * r}% magic damage, ignoring 60% of the enemy's magic resistance.`,
    mult: r => 3.4 + 0.34 * r, pierce: 0.6, cost: () => 24, cd: 3 },
  { id: 'm_p_sorcerer_pass1', cat: 'passive3', path: 'sorcerer', name: 'Spell Mastery', icon: '📖', minLvl: 25,
    desc: r => `Passive: +${2 * r}% damage, +${3 * r}% Max Mana.`,
    passive: r => ({ dmgPct: 0.02 * r, manaPct: 0.03 * r }) },
  { id: 'm_p_sorcerer_pass2', cat: 'passive4', path: 'sorcerer', name: 'Overload', icon: '⚡', minLvl: 50, req: 'm_p_sorcerer_pass1',
    desc: r => `Passive: +${3 * r}% damage, +${1.5 * r}% Critical Strike chance.`,
    passive: r => ({ dmgPct: 0.03 * r, critStrike: 1.5 * r }) },
  { id: 'm_p_sorcerer_ult', cat: 'ult', path: 'sorcerer', name: 'Cataclysm', icon: '🌋', minLvl: 50, req: 'm_ult', magic: true,
    desc: r => `ULTIMATE: Rain pure destruction on ALL enemies for ${380 + 38 * r}% magic damage, ignoring 40% of their resistance.`,
    mult: r => 3.8 + 0.38 * r, aoe: true, pierce: 0.4, cost: () => 48, cd: 7 },

  // ===== Advanced Class — Radiant -> Archon (Protection, Healing, CC, AOE) =====
  { id: 'm_p_radiant_active', cat: 'debuff', path: 'radiant', name: 'Radiant Ward', icon: '🛡️', minLvl: 25, req: 'm_debuff', magic: true,
    desc: r => `Radiant light damages ALL enemies for ${160 + 16 * r}% magic damage and weakens them (-${Math.round((0.12 + 0.02 * r) * 100)}% damage, -${2 * r}% resistances) while shielding you with +${Math.round((0.02 + 0.015 * r) * 100)}% Damage Reduction, all for ${skillRounds(5, r)} rounds.`,
    mult: r => 1.6 + 0.16 * r, aoe: true, debuff: r => ({ dmgDown: 0.12 + 0.02 * r, resDown: 2 * r, rounds: skillRounds(5, r) }), buff: r => ({ dr: 0.02 + 0.015 * r, rounds: skillRounds(5, r) }), cost: () => 20, cd: 3 },
  { id: 'm_p_radiant_pass1', cat: 'passive3', path: 'radiant', name: 'Sacred Vigil', icon: '🙏', minLvl: 25,
    desc: r => `Passive: +${2 * r}% Max HP, +${Math.round((0.10 + (r - 1) * (0.30 / 9)) * 100)}% Damage Reduction (Minnie's ward), +${(0.3 * r).toFixed(1)} HP Regen.`,
    passive: r => ({ hpPct: 0.02 * r, dr: 0.10 + (r - 1) * (0.30 / 9), hpRegen: 0.3 * r }) },
  { id: 'm_p_radiant_pass2', cat: 'passive4', path: 'radiant', name: 'Divine Radiance', icon: '🌞', minLvl: 50, req: 'm_p_radiant_pass1',
    desc: r => `Passive: +${2 * r}% damage, +${1.5 * r}% all resistances, +${(0.3 * r).toFixed(1)} Mana Regen.`,
    passive: r => ({ dmgPct: 0.02 * r, resAll: 1.5 * r, manaRegen: 0.3 * r }) },
  { id: 'm_p_radiant_ult', cat: 'ult', path: 'radiant', name: 'Radiant Nova', icon: '💫', minLvl: 50, req: 'm_ult', magic: true,
    desc: r => `ULTIMATE: Unleash a nova of radiant energy on ALL enemies for ${300 + 30 * r}% magic damage and shield yourself with +${Math.round((0.05 + 0.025 * r) * 100)}% Damage Reduction for ${skillRounds(5, r)} rounds.`,
    mult: r => 3.0 + 0.3 * r, aoe: true, buff: r => ({ dr: 0.05 + 0.025 * r, rounds: skillRounds(5, r) }), cost: () => 48, cd: 7 },
]),
};

// passive3/passive4 are the Advanced Class path passives (level 25/50) —
// additive slots, always empty until a path is chosen (DATA.SKILLS[cls] has
// no entry for them until then, and UI.renderSkills/similar already
// tolerate a missing cat via .filter(Boolean)).
DATA.SKILL_ORDER = ['basic', 'passive', 'passive2', 'passive3', 'passive4', 'attack', 'attack2', 'aoe', 'aoe2', 'heal', 'buff', 'debuff', 'ult', 'ult2'];
DATA.CAT_LABEL = {
  basic: 'Main Attack', passive: 'Passive', passive2: 'Greater Passive',
  passive3: 'Advanced Passive', passive4: 'Mastery Passive',
  attack: 'Attack', attack2: 'Greater Attack', aoe: 'Area Attack', aoe2: 'Greater Area Attack',
  heal: 'Healing', buff: 'Buff', debuff: 'Debuff', ult: 'Ultimate', ult2: 'Greater Ultimate',
};

// ------------------------------------------------------------
// Monster specialties — rolled onto individual creatures. Not to be
// confused with DATA.AFFIXES below, which is the unrelated item-enchant
// pool. Odds per tier and stacking rules live in game.js (rollAffixes);
// this table is just name/icon/color/tooltip for display + lookup.
// ------------------------------------------------------------
DATA.SPECIALTIES = {
  regen:      { name: 'Regenerating', icon: '🌿', color: '#6ccb8f', desc: 'Regenerates 3% of max HP every round, up to 100% of its max HP total.' },
  vampiric:   { name: 'Vampiric',     icon: '🩸', color: '#c23d6b', desc: 'Heals itself for 25% of the damage it deals to you.' },
  resistant:  { name: 'Resistant',    icon: '🛡️', color: '#6c9bff', desc: '+20% resistance to all damage types.' },
  resilient:  { name: 'Resilient',    icon: '🦴', color: '#9aa0b5', desc: 'Takes 20% less damage from all sources.' },
  poisonous:  { name: 'Poisonous',    icon: '☠️', color: '#7a9a3d', desc: 'Attacks poison you, dealing damage over a few rounds.' },
  necrotic:   { name: 'Necrotic',     icon: '💀', color: '#7d3da8', desc: 'While alive, your healing is reduced by 75%.' },
  magical:    { name: 'Magical',      icon: '✨', color: '#c77dff', desc: 'Attacks deal random bonus magic damage.' },
  explosive:  { name: 'Explosive',    icon: '💥', color: '#ff6b3d', desc: 'Explodes on death, damaging you.' },
  frozen:     { name: 'Frozen',       icon: '❄️', color: '#6cd4ff', desc: '25% chance per attack to slow your attack gauge.' },
  burning:    { name: 'Burning',      icon: '🔥', color: '#ff8b3d', desc: '25% chance per attack to ignite you over time.' },
  evasive:    { name: 'Evasive',      icon: '💨', color: '#b9bdcc', desc: '25% chance to fully evade your attacks.' },
  charm:      { name: 'Charming',     icon: '💘', color: '#ff6bcb', desc: 'A 50% chance each round that its charm prevents you from attacking or casting.' },
  enraged:    { name: 'Enraged',      icon: '😡', color: '#ff4d4d', desc: 'Attacks faster and harder as its HP drops.' },
  berserk:    { name: 'Berserk',      icon: '🪓', color: '#d94f4f', desc: 'Deals more damage but takes more as its HP drops.' },
  cursed:     { name: 'Cursed',       icon: '🕯️', color: '#7a5cff', desc: 'Attacks weaken your damage output for a few rounds.' },
  golem:      { name: 'Golem',        icon: '🗿', color: '#8a7355', desc: 'Takes 80% less magic damage, but double physical damage.' },
  spectral:   { name: 'Spectral',     icon: '👻', color: '#a8c8ff', desc: 'Takes 80% less physical damage, but double magic damage.' },
  colossal:   { name: 'Colossal',     icon: '🏔️', color: '#8a6d3d', desc: '+50% max HP, -25% speed.' },
  swift:      { name: 'Swift',        icon: '🌀', color: '#4cd9d9', desc: '+40% speed.' },
  corrosive:  { name: 'Corrosive',    icon: '🧪', color: '#8fbf3d', desc: "Attacks temporarily corrode your armor." },
};

// Syllables for epic/legendary one-word names
DATA.NAME_SYL_A = ['Gor', 'Mor', 'Zar', 'Kra', 'Vex', 'Thul', 'Drak', 'Bal', 'Nag', 'Ur', 'Skar', 'Grim', 'Vor', 'Xal', 'Mal', 'Rag', 'Zug', 'Kel', 'Ash', 'Bruk'];
DATA.NAME_SYL_B = ['gath', 'mok', 'zul', 'thar', 'grim', 'nox', 'rok', 'dun', 'vash', 'gul', 'moth', 'rax', 'ghul', 'dor', 'blub', 'fang', 'maw', 'thorn', 'skul', 'doom'];
DATA.NAME_SYL_C = ['', '', '', 'us', 'ok', 'ar', 'oth', 'ix', 'esh', 'un'];

// ------------------------------------------------------------
// Items
// ------------------------------------------------------------
// affixes: [min, max] stat count. Rare/Epic/Legendary now roll a variable
// count within this range (see rollAffixCount in game.js) instead of a
// fixed number — min is the initial roll, max is the ceiling after
// repeated 50/50 "add another stat" flips.
DATA.RARITIES = {
  normal:    { name: 'Normal',    color: '#c8c8c8', affixes: [0, 0], mult: 1.0, value: 1 },
  magical:   { name: 'Magical',   color: '#6c9bff', affixes: [1, 2], mult: 1.15, value: 3 },
  rare:      { name: 'Rare',      color: '#ffd84d', affixes: [3, 6], mult: 1.3, value: 8 },
  epic:      { name: 'Epic',      color: '#c77dff', affixes: [4, 7], mult: 1.5, value: 20 },
  legendary: { name: 'Legendary', color: '#ff8b3d', affixes: [5, 10], mult: 1.75, value: 60 },
  // Mythic: not rolled for items — the Mythic Rune below reuses
  // Legendary's color instead of this entry (kept only for RARITY_ORDER).
  mythic:    { name: 'Mythic',    color: '#ff4d9e', affixes: [6, 6], mult: 2.0, value: 150 },
};

DATA.SLOTS = ['weapon', 'offhand', 'helmet', 'amulet', 'armor', 'cloak', 'belt', 'ring1', 'ring2', 'gloves', 'pants', 'boots'];
DATA.SLOT_LABEL = {
  weapon: 'Weapon', offhand: 'Off Hand / Shield', helmet: 'Helmet', amulet: 'Amulet', armor: 'Armor',
  cloak: 'Cloak', belt: 'Belt', ring1: 'Left Ring', ring2: 'Right Ring', gloves: 'Gloves', pants: 'Pants', boots: 'Footwear',
};

// Weapon bases. hands: 1|2. classes: which classes can use (null = all).
// atkSpd: attack interval multiplier — 0.5 = twice as fast, 1.5 = 50% slower.
// iconSize: em multiplier applied to the base emoji (see UI.weaponIcon in
// ui.js) — lets several weapons share one emoji (e.g. the sword family all
// use 🗡️) while still reading as distinct sizes instead of unrelated icons.
// Two-handed weapons carry +30% damage over one-handers of similar tier —
// a direct request to make going two-handed clearly worth the lost offhand.
DATA.WEAPON_BASES = [
  { id: 'greatsword', name: 'Greatsword', icon: '🗡️', iconSize: 1.4, hands: 2, classes: ['warrior'], dmg: [12, 18], atkSpd: 1.5 },
  { id: 'battleaxe', name: 'Battle Axe', icon: '🪓', iconSize: 1.15, hands: 2, classes: ['warrior'], dmg: [12, 17], atkSpd: 1.4 },
  { id: 'maul', name: 'Maul', icon: '🔨', iconSize: 1.4, hands: 2, classes: ['warrior'], dmg: [13, 19], atkSpd: 1.6 },
  { id: 'warhammer', name: 'War Hammer', icon: '🔨', iconSize: 1.15, hands: 1, classes: ['warrior'], dmg: [5, 8], atkSpd: 1.1 },
  { id: 'mace', name: 'Mace', icon: '🔨', hands: 1, classes: ['warrior'], dmg: [5, 8], atkSpd: 1.05 },
  { id: 'axe', name: 'Axe', icon: '🪓', iconSize: 0.85, hands: 1, classes: ['warrior'], dmg: [5, 8], atkSpd: 1.0 },
  { id: 'spear', name: 'Spear', icon: '🔱', hands: 2, classes: ['warrior'], dmg: [9, 14], atkSpd: 1.1 },
  { id: 'crossbow', name: 'Crossbow', icon: '🏹', hands: 2, classes: ['warrior', 'rogue'], dmg: [10, 17], atkSpd: 1.3 },
  { id: 'handcrossbow', name: 'Hand Crossbow', icon: '🏹', iconSize: 0.85, hands: 1, classes: ['rogue'], dmg: [4, 6], atkSpd: 0.75 },
  { id: 'longsword', name: 'Longsword', icon: '🗡️', iconSize: 1.15, hands: 1, classes: ['warrior', 'rogue'], dmg: [4, 7], atkSpd: 1.0 },
  { id: 'scimitar', name: 'Scimitar', icon: '🗡️', hands: 1, classes: ['rogue'], dmg: [4, 7], atkSpd: 0.8 },
  // atkSpd was 0.5 (double the attack frequency of the 1.0 baseline, and
  // 3x a Warrior's 1.5 greatsword) — the single biggest driver of Rogue
  // outperforming the other classes, independent of any stat or gear
  // difference. Brought in line with the rest of the fast-weapon tier.
  { id: 'dagger', name: 'Dagger', icon: '🗡️', iconSize: 0.85, hands: 1, classes: ['rogue'], dmg: [3, 5], atkSpd: 0.6 },
  { id: 'throwingknives', name: 'Throwing Knives', icon: '🥷', hands: 1, classes: ['rogue'], dmg: [3, 5], atkSpd: 0.6 },
  { id: 'bow', name: 'Hunting Bow', icon: '🏹', hands: 2, classes: ['rogue'], dmg: [8, 13], atkSpd: 1.0 },
  { id: 'twinblade', name: 'Twinblade', icon: '⚔️', hands: 2, classes: ['rogue'], dmg: [8, 13], atkSpd: 1.15 },
  { id: 'shortsword', name: 'Shortsword', icon: '🗡️', hands: 1, classes: null, dmg: [3, 6], atkSpd: 0.9 },
  { id: 'staff', name: 'Arcane Staff', icon: '🪄', hands: 2, classes: ['mage'], dmg: [9, 16], magic: true, atkSpd: 1.3 },
  { id: 'wand', name: 'Wand', icon: '🪄', hands: 1, classes: ['mage'], dmg: [3, 5], magic: true, atkSpd: 0.8 },
  { id: 'scepter', name: 'Scepter', icon: '🔱', hands: 1, classes: ['mage'], dmg: [4, 7], magic: true, atkSpd: 1.0 },
];

// Offhand bases. kind: shield | weapon-like offhand item
DATA.OFFHAND_BASES = [
  { id: 'buckler', name: 'Buckler', icon: '🛡️', classes: null, armor: 3, weight: 'medium' },
  { id: 'kiteshield', name: 'Kite Shield', icon: '🛡️', classes: ['warrior'], armor: 5, weight: 'heavy' },
  { id: 'towershield', name: 'Tower Shield', icon: '🛡️', classes: ['warrior'], armor: 8, weight: 'heavy' },
  { id: 'orb', name: 'Arcane Orb', icon: '🔮', classes: ['mage'], dmg: [2, 4], magic: true },
  { id: 'tome', name: 'Spell Tome', icon: '📖', classes: ['mage'], dmg: [1, 3], magic: true },
];

// Armor bases per slot & weight class.
DATA.ARMOR_BASES = {
  helmet: { heavy: { name: 'Great Helm', armor: 5 }, medium: { name: 'Leather Hood', armor: 3 }, light: { name: 'Cloth Cowl', armor: 2 } },
  armor:  { heavy: { name: 'Plate Armor', armor: 10 }, medium: { name: 'Leather Armor', armor: 6 }, light: { name: 'Robes', armor: 4 } },
  gloves: { heavy: { name: 'Gauntlets', armor: 3 }, medium: { name: 'Leather Gloves', armor: 2 }, light: { name: 'Cloth Wraps', armor: 1 } },
  pants:  { heavy: { name: 'Plate Greaves', armor: 5 }, medium: { name: 'Leather Pants', armor: 3 }, light: { name: 'Cloth Leggings', armor: 2 } },
  boots:  { heavy: { name: 'Plate Sabatons', armor: 4 }, medium: { name: 'Leather Boots', armor: 2 }, light: { name: 'Cloth Shoes', armor: 1 } },
};
DATA.ARMOR_ICONS = { helmet: '🪖', armor: '🎽', gloves: '🧤', pants: '👖', boots: '🥾' };

// Jewelry / misc bases (no weight class). amulet/ring/cloak are pure
// affix carriers, always at least magical. belt is the exception:
// not socketable, unrestricted by class/weight, and can be normal
// rarity — every belt (any rarity) carries potion capacity as its
// base stat (see beltPotionCap in game.js), with affixes on top once
// magical+.
DATA.JEWELRY_BASES = {
  amulet: { name: 'Amulet', icon: '📿' },
  ring: { name: 'Ring', icon: '💍' },
  cloak: { name: 'Cloak', icon: '🧣', armor: 2 },
  belt: { name: 'Belt', icon: '👝' },
};

// Affix pool: id, label(v), weight, roll(ilvl) -> value
// Magnitude stats (HP, mana, damage, armor, regen) grow exponentially
// with item level (+25%/level) to match monster scaling; percentage
// and capped stats stay on gentle linear growth.
// slots: an allowlist of non-jewelry slots this affix may roll on.
// Jewelry (ring/amulet/cloak/belt) always bypasses `slots` AND
// `weaponOnly` — "Jewelry can get everything" — see rollAffixes' pool
// filter (game.js) and isJewelrySlot.
DATA.AFFIXES = [
  { id: 'str', w: 10, roll: i => 1 + Math.floor(i / 8) + rint(0, 2), fmt: v => `+${v} Strength` },
  { id: 'dex', w: 10, roll: i => 1 + Math.floor(i / 8) + rint(0, 2), fmt: v => `+${v} Dexterity` },
  { id: 'int', w: 10, roll: i => 1 + Math.floor(i / 8) + rint(0, 2), fmt: v => `+${v} Intelligence` },
  // All Stats: rare bonus, slightly gentler per-stat than a dedicated
  // str/dex/int roll since it grants all three at once.
  { id: 'allStats', w: 3, minRarity: 'rare', roll: i => 1 + Math.floor(i / 10) + rint(0, 2), fmt: v => `+${v} to All Stats` },
  // dmgFlatScale (linear), not bigScale — a flat HP/Mana pool that grows
  // exponentially while everything that threatens it (monster damage) grows
  // near-linearly lets a single lucky roll trivialize survivability or
  // erase Mana as a resource entirely. Same reasoning as armor/dmgFlat.
  { id: 'hp', w: 10, roll: i => Math.round((12 + rint(0, 10)) * dmgFlatScale(i)), fmt: v => `+${v.toLocaleString()} Max HP` },
  { id: 'mana', w: 8, roll: i => Math.round((8 + rint(0, 6)) * dmgFlatScale(i)), fmt: v => `+${v.toLocaleString()} Max Mana` },
  // Speed: gloves & boots (+jewelry) — the "mobility" slots.
  { id: 'speed', w: 8, slots: ['gloves', 'boots'], roll: i => 2 + Math.floor(i / 5) + rint(0, 3), fmt: v => `+${v} Speed` },
  { id: 'hpRegen', w: 6, roll: i => Math.round((1 + rint(0, 1)) * dmgFlatScale(i) * 0.5), fmt: v => `+${v.toLocaleString()} HP Regen` },
  { id: 'manaRegen', w: 6, roll: i => Math.round((1 + rint(0, 1)) * dmgFlatScale(i) * 0.5), fmt: v => `+${v.toLocaleString()} Mana Regen` },
  // Evasion: gloves & boots (+jewelry) — same mobility grouping as Speed.
  { id: 'evasion', w: 6, slots: ['gloves', 'boots'], roll: i => 1 + Math.floor(i / 15) + rint(0, 2), fmt: v => `+${v}% Evasion` },
  // dmgFlat/dmgPct: weapon/gloves/armor (+jewelry) — "damage bonuses for
  // weapons, gloves, armor" per direct request. dmgFlat rides a linear
  // scale (dmgFlatScale) instead of the exponential dmgScale — that curve
  // was producing +800ish rolls by ilvl 10; linear caps it around +50.
  { id: 'dmgFlat', w: 10, slots: ['weapon', 'gloves', 'armor'], roll: i => Math.round((2 + rint(0, 3)) * dmgFlatScale(i)), fmt: v => `+${v.toLocaleString()} Weapon Damage` },
  { id: 'dmgPct', w: 8, slots: ['weapon', 'gloves', 'armor'], roll: i => 3 + Math.floor(i / 6) + rint(0, 4), fmt: v => `+${v}% Weapon Damage` },
  // Armor: any armor-wearing slot (+jewelry), not weapon.
  // dmgFlatScale (linear), not bigScale — see itemScale() in game.js for why.
  { id: 'armor', w: 9, slots: ['helmet', 'armor', 'gloves', 'pants', 'boots', 'offhand'], roll: i => Math.round((3 + rint(0, 3)) * dmgFlatScale(i) * 0.5), fmt: v => `+${v.toLocaleString()} Armor` },
  // Damage Reduction: armor only (+jewelry) per direct request.
  { id: 'dr', w: 4, slots: ['armor'], roll: i => 1 + Math.floor(i / 20) + rint(0, 2), fmt: v => `${v}% Damage Reduction` },
  // Resistances: bumped up and gated to rare+ per direct request, and
  // restricted to armor-wearing slots (+jewelry), not weapon.
  { id: 'resPhys', w: 6, minRarity: 'rare', slots: ['helmet', 'armor', 'gloves', 'pants', 'boots', 'offhand'], roll: i => 6 + Math.floor(i / 5) + rint(0, 6), fmt: v => `+${v}% Physical Resistance` },
  { id: 'resMagic', w: 6, minRarity: 'rare', slots: ['helmet', 'armor', 'gloves', 'pants', 'boots', 'offhand'], roll: i => 6 + Math.floor(i / 5) + rint(0, 6), fmt: v => `+${v}% Magic Resistance` },
  { id: 'resPoison', w: 6, minRarity: 'rare', slots: ['helmet', 'armor', 'gloves', 'pants', 'boots', 'offhand'], roll: i => 6 + Math.floor(i / 5) + rint(0, 6), fmt: v => `+${v}% Poison Resistance` },
  // Enemy Resist Shred: weapon/gloves (+jewelry) — an offense-side stat.
  { id: 'enemyResDown', w: 3, slots: ['weapon', 'gloves'], roll: i => 2 + Math.floor(i / 12) + rint(0, 3), fmt: v => `Enemies lose ${v}% Resistances` },
  // Skill bonuses: Helm/Armor/Weapon (+jewelry) per direct request.
  { id: 'skill', w: 4, slots: ['helmet', 'armor', 'weapon'], roll: () => 1, fmt: (v, x) => `+${v} to ${x || 'a skill'}` },   // extra: skill id
  // Capped at +3 — scales in slowly with item level rather than always rolling +1.
  { id: 'allSkills', w: 1, slots: ['helmet', 'armor', 'weapon'], roll: i => Math.min(3, 1 + Math.floor(i / 30)), fmt: v => `+${v} to All Skills` },   // very rare — same weight as Vampiric
  // Vampiric: very rare, epic+ weapons only (see rollAffixes' eligibility filter).
  // Scales 1-10% life steal with item level.
  { id: 'lifesteal', w: 1, weaponOnly: true, minRarity: 'epic', roll: i => Math.min(10, 1 + Math.floor(i / 11) + rint(0, 1)), fmt: v => `+${v}% Life Steal` },
  // Mana Steal: mirrors Life Steal exactly (weapon-only, epic+, capped 10%).
  { id: 'manasteal', w: 1, weaponOnly: true, minRarity: 'epic', roll: i => Math.min(10, 1 + Math.floor(i / 11) + rint(0, 1)), fmt: v => `+${v}% Mana Steal` },
  // Weapon Poison: weapon-only, rare+. 30% chance per hit to poison the
  // target for a few rounds, dealing the rolled damage at the start of
  // each of those rounds. v is a compound value {dmg, rounds}.
  // Percent of target max HP, not a flat number — a flat dmg/round value
  // (the old `Math.round(...*(1+i*0.3))`) grows only linearly with ilvl
  // while monster HP grows on a much steeper curve, so it would trivialize
  // to irrelevance within a handful of levels. Same fix as the poison-DOT
  // skills (Venomous Strike / Shadow Execution).
  // Per an explicit "poison is too low" request: both pct AND rounds now
  // scale together with ilvl (previously only pct scaled, and rounds was
  // a flat random 2-4 unrelated to item level) — 2% max HP/round for 2
  // rounds at ilvl 1, up to 5% max HP/round for 8 rounds at ilvl 100, so
  // a "better roll" genuinely means a stronger AND longer poison instead
  // of just a slightly bigger number.
  { id: 'poisonWeapon', w: 3, weaponOnly: true, minRarity: 'rare',
    roll: i => { const t = Math.max(0, Math.min(1, (i - 1) / 99)); return { pct: 0.02 + t * 0.03, rounds: Math.round(2 + t * 6) }; },
    fmt: v => `30% chance to Poison for ${(v.pct * 100).toFixed(1)}% max HP/round for ${v.rounds} Rounds` },
  // Weapon Slow: weapon-only, rare+. v is a compound value {chance, pct, rounds}.
  { id: 'slowWeapon', w: 3, weaponOnly: true, minRarity: 'rare',
    roll: () => ({ chance: rint(10, 20), pct: rint(20, 50), rounds: rint(1, 5) }),
    fmt: v => `${v.chance}% chance to Slow enemy by ${v.pct}% for ${v.rounds} Rounds` },
  // Pain Reflection: rare, defensive slots (+jewelry) — reflects a % of
  // incoming damage back at the attacker.
  { id: 'painReflect', w: 3, minRarity: 'rare', slots: ['helmet', 'armor', 'gloves', 'pants', 'boots', 'offhand'],
    roll: i => 5 + Math.floor(i / 10) + rint(0, 5), fmt: v => `Reflects ${v}% of incoming damage` },
  // Execute: rare, weapon-only (+jewelry) — bonus damage vs. low-HP enemies.
  { id: 'execute', w: 3, weaponOnly: true, minRarity: 'rare',
    roll: i => 10 + Math.floor(i / 8) + rint(0, 10), fmt: v => `+${v}% damage to enemies below 25% HP` },
  // Gold Find / Magic Find: rare, jewelry-exclusive (empty slots array —
  // no non-jewelry slot qualifies, but the jewelry bypass still applies).
  { id: 'goldFind', w: 3, minRarity: 'rare', slots: [], roll: i => 10 + Math.floor(i / 6) + rint(0, 10), fmt: v => `+${v}% Gold Find` },
  { id: 'magicFind', w: 3, minRarity: 'rare', slots: [], roll: i => 5 + Math.floor(i / 8) + rint(0, 5), fmt: v => `+${v}% Magic Find` },
  // Critical Strike / Double Strike: ultra-rare, weapon-only (+jewelry),
  // legendary+ only — same prestige tier as Life/Mana Steal.
  { id: 'critStrike', w: 1, weaponOnly: true, minRarity: 'legendary',
    roll: i => Math.min(30, 5 + Math.floor(i / 10) + rint(0, 5)), fmt: v => `${v}% chance to deal +100% damage` },
  { id: 'doubleStrike', w: 1, weaponOnly: true, minRarity: 'legendary',
    roll: i => Math.min(20, 3 + Math.floor(i / 12) + rint(0, 4)), fmt: v => `${v}% chance to strike again immediately` },
  // Spellstrike / Blessing: ultra-rare, weapon-only (+jewelry),
  // legendary+. On landing a hit, a chance to also cast a random skill
  // from the player's own class — independent of learned rank, mana, or
  // cooldown (it's the item casting, not the player) — always resolved
  // at a fixed low rank (1), so it's a minor proc, not a mana-free copy
  // of the player's actual build.
  { id: 'procOffense', w: 1, weaponOnly: true, minRarity: 'legendary',
    roll: () => rint(5, 10), fmt: v => `${v}% chance to also cast a random attack/debuff spell on hit` },
  { id: 'procSupport', w: 1, weaponOnly: true, minRarity: 'legendary',
    roll: () => rint(5, 10), fmt: v => `${v}% chance to also cast a random heal/buff spell on hit` },
];

// Name parts keyed by affix id — items and runes generate their
// prefix/suffix from the stats they actually carry.
DATA.NAME_PARTS = {
  str:          { pre: ['Mighty', 'Brutish', "Giant's", 'Ironthewed'], suf: ['of Strength', 'of the Ox', 'of Iron Arms', 'of the Colossus'] },
  dex:          { pre: ['Agile', 'Limber', "Viper's", 'Featherlight'], suf: ['of Dexterity', 'of the Cat', 'of Quick Hands', 'of the Acrobat'] },
  int:          { pre: ['Clever', "Sage's", 'Mindful', 'Erudite'], suf: ['of Intelligence', 'of the Owl', 'of Deep Thought', 'of the Scholar'] },
  hp:           { pre: ['Stout', 'Vital', "Bear's", 'Hearty'], suf: ['of Vitality', 'of the Bear', 'of Long Life', 'of the Oak Heart'] },
  mana:         { pre: ['Azure', 'Soulful', 'Brimming', 'Bottomless'], suf: ['of Mana', 'of the Deep Well', 'of the Inner Sea', 'of Reverie'] },
  speed:        { pre: ['Fleet', 'Rushing', "Falcon's", 'Untiring'], suf: ['of Speed', 'of the Wind', 'of Haste', 'of the Chase'] },
  hpRegen:      { pre: ['Mending', 'Regrowing', "Troll's", 'Knitting'], suf: ['of Mending', 'of Regrowth', 'of Recovery', 'of Second Breath'] },
  manaRegen:    { pre: ['Flowing', 'Tidal', 'Welling', 'Murmuring'], suf: ['of Flow', 'of the Spring', 'of Clarity', 'of the Tide'] },
  evasion:      { pre: ['Elusive', 'Ghostly', 'Shifting', 'Blurred'], suf: ['of Evasion', 'of Mist', 'of Slipping Shadows', 'of the Untouched'] },
  dmgFlat:      { pre: ['Sharp', 'Cruel', 'Jagged', 'Biting'], suf: ['of Harm', 'of the Fang', 'of Wounding', 'of Keen Edges'] },
  dmgPct:       { pre: ['Savage', 'Merciless', 'Raging', 'Bloodthirsty'], suf: ['of Slaughter', 'of Fury', 'of Carnage', 'of the Berserker'] },
  armor:        { pre: ['Plated', 'Warding', "Turtle's", 'Bolstered'], suf: ['of Armor', 'of the Shell', 'of Warding', 'of the Rampart'] },
  dr:           { pre: ['Unyielding', 'Stony', 'Steadfast', 'Adamant'], suf: ['of Bulwarks', 'of Stone Skin', 'of Endurance', 'of the Bastion'] },
  resPhys:      { pre: ['Ironhide', 'Sturdy', 'Oaken', 'Deflecting'], suf: ['of Iron Hide', 'of Deflection', 'of the Ram', 'of Blunted Blades'] },
  resMagic:     { pre: ['Spellbane', 'Gleaming', 'Nullifying', 'Sigiled'], suf: ['of Spell Warding', 'of the Null', 'of the Sigil', 'of Broken Hexes'] },
  resPoison:    { pre: ['Cleansing', 'Pure', "Serpent's", 'Unblighted'], suf: ['of Antivenom', 'of Purity', 'of the Serpent', 'of Clean Blood'] },
  enemyResDown: { pre: ['Sundering', 'Piercing', 'Rending', 'Cracking'], suf: ['of Sundering', 'of Breaching', 'of the Breaker', 'of Split Guards'] },
  skill:        { pre: ["Adept's", 'Practiced', "Master's", 'Honed'], suf: ['of the Adept', 'of Technique', 'of Mastery', 'of Drilled Forms'] },
  allSkills:    { pre: ["Grandmaster's", 'Exalted', 'Allwise', 'Peerless'], suf: ['of All Arts', 'of the Grandmaster', 'of Ascendance', 'of Every Discipline'] },
  manasteal:    { pre: ['Draining', 'Siphoning', 'Mindsteal', 'Leeching'], suf: ['of Mana Steal', 'of the Siphon', 'of the Drain', 'of Stolen Thought'] },
  poisonWeapon: { pre: ['Venomous', 'Toxic', 'Blighted', 'Vile'], suf: ['of Poison', 'of the Serpent', 'of Venom', 'of Blight'] },
  slowWeapon:   { pre: ['Numbing', 'Chilling', 'Binding', 'Leaden'], suf: ['of Slowing', 'of Fetters', 'of the Snare', 'of Chains'] },
  allStats:     { pre: ["Champion's", 'Complete', 'Balanced', 'Wholesome'], suf: ['of Completion', 'of the Champion', 'of Balance', 'of All Virtues'] },
  painReflect:  { pre: ['Thorned', 'Barbed', 'Spiked', 'Vengeful'], suf: ['of Thorns', 'of Retribution', 'of Spikes', 'of Vengeance'] },
  execute:      { pre: ['Merciless', 'Grim', "Reaper's", 'Finishing'], suf: ['of Execution', 'of the Reaper', 'of Finality', 'of the Death Blow'] },
  goldFind:     { pre: ["Miser's", 'Golden', 'Greedy', "Merchant's"], suf: ['of Gold', 'of Fortune', 'of the Hoard', 'of the Merchant'] },
  magicFind:    { pre: ['Lucky', 'Fated', "Fortune's", 'Charmed'], suf: ['of Luck', 'of Fate', 'of the Prospector', 'of Discovery'] },
  critStrike:   { pre: ['Precise', 'Deadly', 'Piercing', 'Ruthless'], suf: ['of Precision', 'of the Killshot', 'of Ruthlessness', 'of the Vital Point'] },
  doubleStrike: { pre: ['Twinned', 'Flickering', 'Relentless', 'Rapid'], suf: ['of Twin Blows', 'of the Flurry', 'of Relentlessness', 'of Rapid Strikes'] },
  procOffense:  { pre: ['Arcing', 'Volatile', 'Sparking', 'Wild'], suf: ['of Spellstrike', 'of the Spark', 'of Wild Magic', 'of the Outburst'] },
  procSupport:  { pre: ['Blessed', 'Radiant', 'Serene', 'Hallowed'], suf: ['of Blessing', 'of Grace', 'of the Ward', 'of Serenity'] },
};
// fallback if an item somehow has no affixes to name itself after
DATA.FALLBACK_PRE = ['Curious', 'Weathered', 'Polished', 'Odd'];
DATA.FALLBACK_SUF = ['of the Wanderer', 'of the Road', 'of Fortune', 'of the Unknown'];

// ------------------------------------------------------------
// Unique weapon names (rare / epic / legendary weapons)
// ------------------------------------------------------------
// Evocative nouns per weapon type — the second word of a unique name.
DATA.WEAPON_NOUNS = {
  greatsword: ['Cleaver', 'Reaver', 'Edge', 'Sorrow', 'Doom'],
  battleaxe: ['Hewer', 'Splitter', 'Maw', 'Bite', 'Grudge'],
  maul: ['Breaker', 'Quake', 'Ruin', 'Skullmark', 'Anvil'],
  warhammer: ['Crusher', 'Knell', 'Fist', 'Toll', 'Verdict'],
  mace: ['Bludgeon', 'Dent', 'Knuckle', 'Concussion', 'Bruiser'],
  axe: ['Chop', 'Notch', 'Chip', 'Splint', 'Wedge'],
  spear: ['Reach', 'Star', 'Pike', 'Answer', 'Horizon'],
  crossbow: ['Bolt', 'Judgment', 'Snap', 'Reply', 'Full-Stop'],
  handcrossbow: ['Prick', 'Sting', 'Quick-Bolt', 'Palmshot', 'Retort'],
  bow: ['Song', 'Sigh', 'Arc', 'Whisper', 'Rain'],
  throwingknives: ['Swarm', 'Flight', 'Scatter', 'Chorus', 'Hail'],
  longsword: ['Fang', 'Oath', 'Song', 'Promise', 'Edge'],
  scimitar: ['Crescent', 'Sickle', 'Sable', 'Wind', 'Sirocco'],
  dagger: ['Sting', 'Kiss', 'Whisper', 'Thorn', 'Secret'],
  twinblade: ['Dance', 'Talon', 'Storm', 'Scissor', 'Waltz'],
  shortsword: ['Bite', 'Shard', 'Point', 'Snarl', 'Quill'],
  staff: ['Walker', 'Pillar', 'Word', 'Root', 'Question'],
  wand: ['Spark', 'Whim', 'Point', 'Wink', 'Murmur'],
  scepter: ['Crown', 'Scion', 'Star', 'Decree', 'Rod'],
};

// Evocative nouns for non-weapon items (epic/legendary unique names).
// Keyed by base id (offhands) or slot (armor pieces, jewelry).
DATA.ITEM_NOUNS = {
  buckler: ['Ward', 'Rebuff', 'Answer', 'Guard'],
  kiteshield: ['Wall', 'Bastion', 'Refuge', 'Aegis'],
  towershield: ['Mountain', 'Gate', 'Rampart', 'Bulwark'],
  orb: ['Eye', 'Sphere', 'Mind', 'Focus'],
  tome: ['Codex', 'Verse', 'Word', 'Grimoire'],
  helmet: ['Crown', 'Visage', 'Gaze', 'Brow'],
  armor: ['Aegis', 'Shell', 'Heart', 'Embrace'],
  gloves: ['Grip', 'Touch', 'Fists', 'Hold'],
  pants: ['Stride', 'March', 'Stance', 'Path'],
  boots: ['Walkers', 'Treads', 'Steps', 'Journey'],
  amulet: ['Tear', 'Heart', 'Promise', 'Memory'],
  ring: ['Band', 'Coil', 'Oath', 'Circle'],
  cloak: ['Shadow', 'Wings', 'Veil', 'Shroud'],
  belt: ['Cinch', 'Girdle', 'Sash', 'Reserve'],
};

// Short adjectives per affix — the first word of a rare/epic weapon name.
DATA.AFFIX_ADJ = {
  str: ['Brutal', 'Mighty', 'Heavy'], dex: ['Swift', 'Keen', 'Nimble'], int: ['Arcane', 'Wise', 'Lucid'],
  hp: ['Stout', 'Lifebound', 'Vital'], mana: ['Soulful', 'Azure', 'Deep'], speed: ['Fleet', 'Quick', 'Restless'],
  hpRegen: ['Mending', 'Living', 'Warm'], manaRegen: ['Flowing', 'Welling', 'Humming'],
  evasion: ['Ghostly', 'Fleeting', 'Pale'], dmgFlat: ['Cruel', 'Sharp', 'Hungry'], dmgPct: ['Savage', 'Raging', 'Wild'],
  armor: ['Warded', 'Iron', 'Shielding'], dr: ['Adamant', 'Stone', 'Grim'],
  resPhys: ['Sturdy', 'Oaken', 'Blunting'], resMagic: ['Runed', 'Gleaming', 'Null'], resPoison: ['Vile', 'Venom', 'Sour'],
  enemyResDown: ['Sundering', 'Piercing', 'Rending'], skill: ['Practiced', 'Honed', 'Studied'],
  allSkills: ['Peerless', 'Perfect', 'Exalted'],
  lifesteal: ['Vampiric', 'Bloodthirsty', 'Leeching'],
  manasteal: ['Draining', 'Siphoning', 'Leeching'],
  poisonWeapon: ['Venomous', 'Toxic', 'Vile'],
  slowWeapon: ['Numbing', 'Chilling', 'Binding'],
  allStats: ['Complete', 'Balanced', 'Wholesome'],
  painReflect: ['Thorned', 'Barbed', 'Vengeful'],
  execute: ['Merciless', 'Grim', 'Finishing'],
  goldFind: ['Golden', 'Greedy', 'Lucrative'],
  magicFind: ['Lucky', 'Fated', 'Charmed'],
  critStrike: ['Precise', 'Deadly', 'Ruthless'],
  doubleStrike: ['Twinned', 'Flickering', 'Rapid'],
  procOffense: ['Arcing', 'Volatile', 'Wild'],
  procSupport: ['Blessed', 'Radiant', 'Hallowed'],
};

// Heroic epithets per affix — the first word of a legendary weapon name.
DATA.AFFIX_HEROIC = {
  str: ["Titan's", "Warlord's"], dex: ["Windrunner's", "Shadowdancer's"], int: ["Archmage's", "Oracle's"],
  hp: ["Lifewarden's", 'Everliving'], mana: ["Soulkeeper's", "Voidheart's"], speed: ["Stormchaser's", "Galewind's"],
  hpRegen: ["Phoenix's", 'Undying'], manaRegen: ["Wellspring's", "Tidecaller's"],
  evasion: ["Phantom's", 'Untouchable'], dmgFlat: ["Executioner's", 'Doomforged'], dmgPct: ["Warbringer's", "Slaughterer's"],
  armor: ["Bulwark's", 'Aegisborn'], dr: ['Unbreakable', "Mountain's"],
  resPhys: ["Juggernaut's", "Ironsoul's"], resMagic: ["Spellbreaker's", "Nullwarden's"], resPoison: ["Plaguebane's", "Serpentlord's"],
  enemyResDown: ["Worldsplitter's", "Siegemaster's"], skill: ["Virtuoso's", "Master's"],
  allSkills: ["Master's", "Grandmaster's"],
  lifesteal: ["Bloodletter's", "Nightfeeder's"],
  manasteal: ["Mindeater's", "Soulsiphon's"],
  poisonWeapon: ["Plaguebringer's", "Venomlord's"],
  slowWeapon: ["Frostbinder's", "Chainbreaker's"],
  allStats: ["Ascendant's", "Paragon's"],
  painReflect: ["Retributor's", "Thornlord's"],
  execute: ["Reaper's", "Deathbringer's"],
  goldFind: ["Midas'", "Hoarder's"],
  magicFind: ["Fortune's", "Fated One's"],
  critStrike: ["Assassin's", "Executioner's"],
  doubleStrike: ["Whirlwind's", "Blur's"],
  procOffense: ["Stormcaller's", "Chaosweaver's"],
  procSupport: ["Sainted", "Seraph's"],
};

// helper available to data + game
function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function chance(p) { return Math.random() < p; }
// +25% compounding growth per level (armor & magnitude affixes)
function bigScale(i) { return Math.pow(1.25, Math.max(0, i - 1)); }
// Matches enemyHpScale/enemyDmgScale (game.js) exactly — level * 1.05^L,
// mostly linear with a small compounding kicker. A "small downgrade" from
// the old 1.5^L (or even 1.4^L) doesn't actually fix anything: exponential
// growth always eventually outruns linear growth regardless of how small
// the base is, so weapon damage kept blowing past monster HP by the
// mid-game. Full parity with monster scaling keeps hits-to-kill roughly
// constant across the whole level range instead of trending toward zero.
function dmgScale(i) { const l = Math.max(1, i); return l * Math.pow(1.05, l - 1); }
// Deliberately NOT matched to dmgScale/monster scaling — armor feeds a
// diminishing-returns mitigation formula (enemyHit in game.js) whose
// denominator is linear in level; giving armor ANY exponential component
// (even a small 1.05^L one) eventually overwhelms that denominator again,
// the exact "armor mitigation runs away toward 100%" bug fixed earlier
// this session. Pure linear (no exponential term at all) is the more
// conservative, already-correct choice here, not a smaller version of the
// same fix — kept at the slope-0.85 "small downgrade" from last change.
function dmgFlatScale(i) { return 1 + Math.max(0, i - 1) * 0.85; }
