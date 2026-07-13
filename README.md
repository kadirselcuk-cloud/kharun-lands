# ⚔️ Kharun Lands

An idle browser RPG with a full ten-chapter story. Play **Kharun** (Warrior), **Pars** (Rogue), or **Minnie** (Mage) and fight through 100 story Quests across 10 Chapters — from the marshes of Reedmarsh to the final confrontation with the demon Vorrhak in the Rift of the First King.

## Running the game

No dependencies needed beyond Node.js:

```
node server.js
```

Then open http://localhost:3111 in your browser.

## How it plays

- **Stats**: Strength drives HP & HP Regen, Dexterity drives Speed, Evasion & attack rate, Intelligence drives Mana & Mana Regen.
- **Combat**: round-based with an ATB speed gauge — every round each fighter gains gauge equal to their Speed and acts at 100. Faster heroes attack more often.
- **Story**: a paged Prologue, then 10 Chapters of 10 Quests each. Every Quest is tied 1:1 to a Location, has its own creature roster, and ends with a boss named after the story's creature for that quest. Chapter bosses show in dark blood-red, mini bosses in pinkish red. The Journal tracks quest objectives and resolutions.
- **The 1111 pattern**: each quest holds 1,111 creatures. Every 11th is a 🔷 Rare (two-word name), every 111th a 🟣 Epic, and the 1,111th is the 🔶 Quest Boss. Kill the boss to complete the quest and unlock the next.
- **Skills**: 12 per class — free main attack, two passives, two attacks, two AoEs, heal, buff, debuff, and two ultimates — with rank-ups, level gates, and prerequisites.
- **Loot**: 11 equipment slots, Normal → Magical → Rare → Epic → Legendary rarities, class/weight restrictions, two-hand / dual-wield / weapon-and-shield rules, and socketable runes (Faded Rune / Rune / Rare Rune / Epic Rune / Legendary Rune / Mythic Rune) named after the stats they carry.
- **Saving**: automatic, to your browser's localStorage. The title screen offers Continue or New Character.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell |
| `style.css` | All styling |
| `data.js` | Classes, skills, story (prologue/chapters/quests/epilogue), creatures, items, affixes, name generation data |
| `game.js` | Engine — combat, adventure loop, loot, leveling, persistence |
| `ui.js` | Screens and rendering |
| `server.js` | Dependency-free static file server (port 3111) |
