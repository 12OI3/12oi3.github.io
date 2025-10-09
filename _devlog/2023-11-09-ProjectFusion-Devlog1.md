---

title: "ProjectFusion #1"
excerpt: >
   The prototype of our new Boss-rush turn-based combat-"Project Fusion" 
published: true 
time: 2023-11-09

---

## Introduction

![](/assets/images/devlogs/ProjectFusion-1/1.png)

Since our development progress has reached a milestone, we plan to take this opportunity to publicly announce our latest on developing game, "Project Fusion." Our current progress has completed the foundational core system of the game, so we have prepared a core mechanics testing demo for everyone to try out. 

![](/assets/images/devlogs/ProjectFusion-1/2.png)

As the rules of this game are a little bit unique, we will introduce some of the most important systems in the game in this devlog, as well as the planned features in the future. It is better to understand the rules before you start playing the demo, since it does not include any tutorials. At the end of this devlog, there is also a survey, and we hope you can help us by giving us any advice and ideas. 

## What Kind of Game "Project Fusion"  is?

![](/assets/images/devlogs/ProjectFusion-1/3.png)

"Project Fusion '' is a Boss-rush turn-based combat which features a unique order timeline system and an eye-popping artifact fusion system. In the game, players need to form a party with “scorch mage” and “ice mage,” undertake the missions to defeat the target. The game allows players to freely create and fuse artifacts during the crafting phase, and these artifacts enable mages to use a variety of different skills in battle. During combat, players need to strategically plan the number and order of skill used each turn to maximize their advantage on the action bar. This way, players can use the “Exposed” & “Break” system to chain combos and deal significant damage to enemies. 

## How to Play - Combat

First, let us introduce the most crucial and core system in the game, Order Timeline. 

![](/assets/images/devlogs/ProjectFusion-1/4.png)

The order timeline consists of 16 slots from 0 to 15, which are divided into the light green “current timeline” on the left and the dark green “next timeline” on the right. All characters on the field are displayed on the order timeline, and the character at the bottom represents the current active character. If there are characters remaining on the “current timeline,” they'll all be moved toward left until the first slot(slot 0) is occupied by any actionable character. If there are more than one characters in the first slot (slot 0), the order is determined based on the last-in, first-out(LIFO) rule. 

![](/assets/images/devlogs/ProjectFusion-1/5.gif)

When a character takes action, they can use skills, which all have costs. The costs of a skill determine how many slots the character will move on the order timeline after using it. Characters can continuously use skills until they have moved from the “current timeline” to “next timeline”, which means that the total accumulated costs used exceeds over 7. Once all characters on the “current timeline” have moved to the “next timeline,” this turn is now ended. The “next timeline” will shift all of the characters to “current timeline,” then starting the next turn. 


Next, we'll introduce “Exposed” & ”Break,” two of the most important statuses that have a significant impact on the game's combat. 

![](/assets/images/devlogs/ProjectFusion-1/6.gif)

When the current active character moves to a slot that has opponent characters occupied, all of the opponent characters will gain “Exposed” status until the current active character leaves. 

![](/assets/images/devlogs/ProjectFusion-1/7.gif)

When an “Exposed” character gets hit, “Exposed” will be removed and gain 1 “Break” status. "Break" characters will remove “Break” when it is their time to act. Upon hitting a character with “Break,” that character will be pushed to one slot on the right.

![](/assets/images/devlogs/ProjectFusion-1/8.gif)

During ally character’s turn, they can take the following four actions until the total costs of actions used exceeds 7:

* Skill: Players can pick an available skill to use. Each skill has a cooldown (CD), which means that there need to wait several turns before it can be used again after being used once.
* Items: This is a feature that is currently under development. Players will be able to use items to influence the battlefield.
* Move: Player can move to any tile one time per turn. This feature is not fully completed, and moving will play a significant role in the Boss battle in the future.
* Guard: A 8 costs action, but provides the character a scorch shield or frost shield. In the early stages of a mission, there may be times when Guard is necessary to allow characters to end their turn. 

![](/assets/images/devlogs/ProjectFusion-1/9.png)

The current demo hasn't completed the shield system yet. Shields are divided into scorch or frost, which represent the two damage systems in the game. As long as a shield is present, the player won't enter “Break,” and the damage received will be halved. However, scorch shield will lose 1 point when they take frost damage, and frost shield will lose 1 point when they take scorch damage. 

In the full game, players will need to defeat multiple stages of Bosses and deplete the Boss's health at each stage to enter the crafting stage. In the future plan, victory is achieved when the player successfully defeats the Boss. However, in the current demo version, since the Boss mechanics are not yet completed, the condition to enter the crafting stage is set as defeating all the slimes on the field. 

## How to Play - Crafting

![](/assets/images/devlogs/ProjectFusion-1/10.png)

After winning a battle, players can enter the crafting phase. In the crafting phase, players can perform five different actions: Create, Fuse, Extract, Equip, and Ready. Every time when players enter the crafting phase, their crafting level will increase by 1, and they will gain more crafting point (CP) to use at the start of the phase. 

![](/assets/images/devlogs/ProjectFusion-1/11.gif)

Players can create artifacts in the crafting stage. There are three artifacts that players can create at one time. Players need to spend 1 CP to create an artifact, and players can also press F to spend 1 CP to refresh the list of artifacts that can be created. 

![](/assets/images/devlogs/ProjectFusion-1/12.gif)

Players can spend 1 CP to fuse any two pieces of artifacts. After selecting the first material, players can fuse three different artifacts with the same element type as the first material, based on the element type of the second material. Before confirming the fusion, players can choose which skills the artifact will inherit and select from all non-unique skills from both materials. 

![](/assets/images/devlogs/ProjectFusion-1/13.gif)

In the future, players will be able to spend 1 CP to extract artifacts in their inventory into useful items. However, this feature is not currently implemented in the demo, so players can only clear unwanted artifacts from their inventory without any cost current. 

![](/assets/images/devlogs/ProjectFusion-1/14.gif)

Players can help three mages in their party to equip their artifact. Except for specialized artifacts, each mage can equip two other artifacts. The skills available for the mage to use will be all of the skills from the artifacts equipped by that mage. 

Finally, once the player is ready, they can proceed to the next phase of battle. 

## Core Mechanic Testing Demo and Questionnaire

Thank you for reading this far I believe you now have a certain level of understanding of the game we are currently developing. We have already uploaded the core mechanics testing version of the game on Itch.io, and we hope that you can go there to try it out, whether you want to experience the order timeline mechanics or just messing up with the artifact fusion system. We also hope that you can fill out the survey below to provide us with some feedback. Please let us know whether the mechanics and systems in the game are enjoyable, and any suggestions or reviews about our game. 

Questionnaire: closing

## Future Plan

In the future, we plan to release a more polished version of the demo early next year, allowing you to experience how the current systems can be interacted with in Boss battles. Additionally, this includes the implementation of the item system, UI rework, characteristic skills for different elemental characters (the current skills are temporary, we plan to let each element mage having its own unique gameplay, allowing players to mix and match different element combinations for missions), and introducing trait systems that add random mechanics to the same Boss, all of which are part of our current development plans. 

If you have a strong interest in this project, feel free to follow our Itch.io account to receive notifications when we have updates. Once again, we appreciate all the players who have provided us with feedback. Thank you! 

[Take Me To Project Page](/project/2024-02-Project Fusion/)