# ⚔️ Kharun Lands

An idle browser RPG. Pick a class — **Warrior**, **Rogue**, or **Mage** — and battle your way through 100 levels across 10 biomes, from the Green Plains to the Heart of the Abyss.

## Running the game

No dependencies needed beyond Node.js:

```
node server.js
```

Then open http://localhost:3111 in your browser.

## How it plays

- **Stats**: Strength drives HP & HP Regen, Dexterity drives Speed, Evasion & attack rate, Intelligence drives Mana & Mana Regen.
- **Combat**: round-based with an ATB speed gauge — every round each fighter gains gauge equal to their Speed and acts at 100. Faster heroes attack more often.
- **The 1111 pattern**: each level holds 1,111 creatures. Every 11th is a 🔷 Rare (two-word name), every 111th a 🟣 Epic, and the 1,111th is the 🔶 Legendary Boss (name + title). Kill the boss to unlock the next level.
- **Skills**: 12 per class — free main attack, two passives, two attacks, two AoEs, heal, buff, debuff, and two ultimates — with rank-ups, level gates, and prerequisites.
- **Loot**: 11 equipment slots, Normal → Magical → Rare → Epic → Legendary rarities, class/weight restrictions, two-hand / dual-wield / weapon-and-shield rules, and socketable runes (Faded Rune / Rune / Rare Rune / Epic Rune / Legendary Rune / Mythic Rune) named after the stats they carry.
- **Saving**: automatic, to your browser's localStorage. The title screen offers Continue or New Character.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell |
| `style.css` | All styling |
| `data.js` | Classes, skills, biomes, creatures, items, affixes, name generation data |
| `game.js` | Engine — combat, adventure loop, loot, leveling, persistence |
| `ui.js` | Screens and rendering |
| `server.js` | Dependency-free static file server (port 3111) |
