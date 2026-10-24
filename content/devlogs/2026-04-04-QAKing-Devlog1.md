---
title: "QA King Devlog #1"

time: "2026-04-04"

published: true

comments: true

highlight: true

excerpt: |-
  How I made a spreadsheet-based level editor in under 1 day.

skills:
  - "Technical Game Design"
  - "Tools"

projects:
  - "2026-04-QA King"
---

QA King is a project created during the Game Design course at CMU ETC, taught by Jesse Schell. The idea of having players play a buggy platformer had always been on my mind, so [Oscar](https://the12thcavalier.itch.io/) and I decided to make it during the course. During development, I decided to create a spreadsheet-based level editor to let Oscar easily playtest and adjust the levels.

## Level Editor

![](/assets/images/devlogs/QA King-1/1.png)

So, this is what the editor for a level looked like. One column and one row are for coordinates, and the cells are tiles for each level. I made it so that the cell background changes color based on the first letter, giving us a clearer visual of the level itself.

## Tile Property

Since tiles may have different properties, I used one of my strongest tools, [Scriptable Functions Library](/project/2026-05-Scriptable Functions Library). The system reads the ID in each cell, finds the corresponding functions in the library, and executes them. If the tile ID is followed by arguments, they are identified as well.

## Main Hub

![](/assets/images/devlogs/QA King-1/2.png)

Different sheets represent different levels, and you can decide which ones should be included in the Main sheet. The status controls whether the level should be activated, the size indicates the base size of the level, and the comments let us leave reminders for ourselves.

## Conclusion

After an update, the sheets can be exported as JSON files and loaded into Unity. I wrote a system to parse these files, generating levels for players. This system was really worth making since Oscar could actually work on the levels without touching the code, and it made working on things afterward a breeze for both of us.
