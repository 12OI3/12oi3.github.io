---
title: "Project Fusion Devlog #3"

time: "2026-10-24"

published: true

comments: true

highlight: true

excerpt: |-
  I combined Octopath Traveler and Persona 5 into our UI. Here is how.

skills:
  - "UI/UX"

projects:
  - "2024-02-Project Fusion"
---

This devlog is actually written three years after the project ended. The goal of this article is to showcase the UI design I made, since this project was the first time I challenged myself to create a stylish UI.
Octopath Traveler and Persona 5 were two of the inspirations that made us want to start this project, and during development, I decided to create a UI combining both.

## Action Bar UI

![](/assets/images/devlogs/ProjectFusion-1/7.gif)

In Octopath Traveler, there is an action bar showing the order of characters, and that is critical to Project Fusion as well.
Thus, designing the action bar UI was important.
We use the bottom left to show the current target, giving clear information about who is attacking and who is receiving the attack.
We also display everything that happens one step at a time through smooth UI animations and camera movement.

## Menu UI

![](/assets/images/devlogs/ProjectFusion-1/5.gif)

The action menu is another thing that we carefully designed, with a spinning square to attract players' attention so that they know it is their time to move, and an expanding sub-menu to display all the other details.

We designed it so that players will look in the following order:

1. See the current character they are going to move.
2. Look up to see the four main actions they can execute.
3. Look further up to see the actions they can choose from the sub-menu.
4. Look further up to see the hint about how to use the selected action.
5. Look toward the middle to choose a target and see the results of the action.
6. Look down to see the action bar changes and start to consider what to do next.

The players' gaze will constantly move in a clockwise circle, helping them stay in the flow.
We also put the player's party on the top left, the turn count at the top, and the enemy party on the top right.

## Conclusion

To be honest, I am amazed by what I achieved three years ago. The next stylish UI I created was for [BEAT-Shojo](/project/2025-11-BEAT-Shojo/), which I am also really proud of. It also makes me think: what should I create next?
