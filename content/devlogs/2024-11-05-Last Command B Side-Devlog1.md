---
title: "Last Command: B-Side Devlog #1"

time: "2024-11-05"

published: true

comments: true

highlight: true

excerpt: |-
  This mini game took 4 months to make, here is why.

skills:
  - "Technical Game Design"
  - "Tools"
  - "UI/UX"

projects:
  - "2024-06-Last Command B Side"
---

Since this was a commercial project that I worked on during a paid internship, I can’t talk too much about the details. In this devlog, I’ll go through the things I encountered during the process.

During the internship, I was responsible for creating a mini-game for [Last Command’s DLC](https://store.steampowered.com/app/2417760/Last_Command_BSide/).
At first, I thought it would be an easy task, but it ended up taking me 4 months to prototype.

## The Start

[![LineWay gameplay](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/661430/ss_874a750bb2368d3eb7408d1c45091578500a670b.1920x1080.jpg?t=1702294985)](https://store.steampowered.com/app/661430/LineWay/)

[LineWay](https://store.steampowered.com/app/661430/LineWay/) was our original reference for the mechanics.
However, after beating the game, we agreed that these mechanics had a small chance of getting players stuck.
Since we were making a mini-game to add a change of pace to the DLC’s progression, getting players stuck was definitely a no for us.

After brainstorming, we decided on two design pillars for this mini-game:

- Zen
- Satisfaction

We wanted to create a mini-game that players could control smoothly.
The puzzles themselves should be easy to understand, even solvable through brute force.
We also wanted to create bursts of feedback between each thinking section to keep things interesting.

Thus, we decided on the idea of using pieces to create certain shapes.

![](/assets/images/projects/Last Command B Side/1.jpg)

## Why It Took 4 Months

After deciding on the core mechanics, we kept testing out different mechanics to make it better.
We tried randomizing things, adding different twists, and adding a narrative underneath it all.

However, we finally realized that a mini-game is just a mini-game: simple is best.
Thus, we went back to square one, sticking with the original idea.

During development, a similar mini-game also showed up in [Wuthering Waves](https://www.youtube.com/watch?v=6lmpps81riI), but that is a different story.
I also created a level editor inside the Unity Inspector, letting developers easily adjust the level layouts and usable blocks without touching a single line of code.

Everything went smoothly, until I started implementing the UI.

![](/assets/images/projects/Last Command B Side/2.jpg)

## UI Is a Problem, but I Nailed It

UI was harder than I thought.
Since the mini-game required players to pick up blocks, rotate them, and place them, a lot of problems appeared:

- What if a player places a block on top of another?
- What if a player places a block on top of two others?
- How do we show players that they cannot place something out of bounds?
- How do we let players switch between the board and inventory?
- Where should the center of each block be?

[![God Of Weapons inventory UI](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2342950/ss_af967c2142f346ed8c09d65e3e4e5ed1504cb5a6.1920x1080.jpg?t=1790824677)](https://store.steampowered.com/app/2342950/God_Of_Weapons/)

We looked at all kinds of games with this type of UI, including [DREDGE](https://store.steampowered.com/app/1562430/DREDGE/), [Backpack Battles](https://store.steampowered.com/app/2427700/Backpack_Battles/), and [God Of Weapons](https://store.steampowered.com/app/2342950/God_Of_Weapons/).
After several rounds of playtesting and looking at references, we finally worked out a decent control scheme that wouldn’t confuse players and was easy to pick up.

![](/assets/images/devlogs/Last Command B Side-1/gameplay.gif)

## Conclusion

This was a really fun experience as a technical game design intern. Prototyping to meet a requirement and working with others taught me a lot!

Both the [main game](https://store.steampowered.com/app/1487270/Last_Command/) and [DLC](https://store.steampowered.com/app/2417760/Last_Command_BSide/) are on Steam now, and I must say that this game has some of the most creative boss fights I’ve ever played.
Please go check it out!