---
title: "You Hive My Word Devlog #1"

time: "2026-08-05"

published: true

comments: true

highlight: true

excerpt: |-
  I made so many prototypes over two months, and they all failed.

skills:
  - "Technical Game Design"
  - "Tools"
  - "UI/UX"

projects:
  - "2026-09-You Hive My Word"

ui_iterations:
  - image_path: "/assets/images/devlogs/You Hive My Word-1/UI1.png"
    url: "/assets/images/devlogs/You Hive My Word-1/UI1.png"
    alt: "You Hive My Word UI iteration 1"
  - image_path: "/assets/images/devlogs/You Hive My Word-1/UI2.png"
    url: "/assets/images/devlogs/You Hive My Word-1/UI2.png"
    alt: "You Hive My Word UI iteration 2"
  - image_path: "/assets/images/devlogs/You Hive My Word-1/UI3.png"
    url: "/assets/images/devlogs/You Hive My Word-1/UI3.png"
    alt: "You Hive My Word UI iteration 3"
  - image_path: "/assets/images/devlogs/You Hive My Word-1/UI4.png"
    url: "/assets/images/devlogs/You Hive My Word-1/UI4.png"
    alt: "You Hive My Word UI iteration 4"
  - image_path: "/assets/images/devlogs/You Hive My Word-1/UI5.png"
    url: "/assets/images/devlogs/You Hive My Word-1/UI5.png"
    alt: "You Hive My Word UI iteration 5"
  - image_path: "/assets/images/devlogs/You Hive My Word-1/UI7.png"
    url: "/assets/images/devlogs/You Hive My Word-1/UI7.png"
    alt: "You Hive My Word UI iteration 7"

ui_current:
  - url: "/assets/images/projects/You Hive My Word/4.jpg"
    image_path: "/assets/images/projects/You Hive My Word/4.jpg"
    alt: "Screenshot D"
  - url: "/assets/images/projects/You Hive My Word/1.jpg"
    image_path: "/assets/images/projects/You Hive My Word/1.jpg"
    alt: "Screenshot A"
  - url: "/assets/images/projects/You Hive My Word/2.jpg"
    image_path: "/assets/images/projects/You Hive My Word/2.jpg"
    alt: "Screenshot B"
  - url: "/assets/images/projects/You Hive My Word/3.jpg"
    image_path: "/assets/images/projects/You Hive My Word/3.jpg"
    alt: "Screenshot C"
---

Like I mentioned in the [latest devlog of Vocabutory](/devlog/2026-06-12-Vocabutory-Devlog3/):

You Hive My Word.

I am sharing the latest progress here and explaining why I am kind of stuck at this point.

## Players Must Have Control

After more analysis, I realized that both physics and the player's sense of control are important.

![](/assets/images/devlogs/You Hive My Word-1/Grab.gif)
![](/assets/images/devlogs/You Hive My Word-1/Suck.gif)

I tried letting players grab letters and suck them in, but eventually, dragging the conveyor belts worked best, especially when there were a lot of letters at the same time.

![](/assets/images/devlogs/You Hive My Word-1/Drag.gif)

## Spreadsheets

If you know me well, you know I use [Scriptable Functions Library](/project/2026-05-Scriptable%20Functions%20Library/) a lot. That is my favorite structure for prototyping, and I used it extensively in this project.

![](/assets/images/devlogs/You Hive My Word-1/Data1.png)
![](/assets/images/devlogs/You Hive My Word-1/Data2.png)

As you can see, all the data is stored inside this spreadsheet.
I can easily toggle settings and balance the numbers in it, then test them inside Unity without touching any lines of code.

## Player Logging Tool

In order to start playtesting, I decided to create a tool to track the numbers, since incremental games are all about math.

![](/assets/images/devlogs/You Hive My Word-1/Logs.png)

Unity automatically logs players' key progress and uploads it to the spreadsheet, so I can view it in graphs to see what is going on.

In fact, this is a great tool for controlling the interest curve of the game. I can tweak the progression so that players have a power spike every five minutes.

## Art Style and UI

I also worked really hard on the art style.

First, I decided to get rid of pixel art.

![](/assets/images/devlogs/You Hive My Word-1/Before.png)

This is the previous art style of the queen bee.

![](/assets/images/devlogs/You Hive My Word-1/After.png)

And this is the current art style of the queen bee.

I went through a lot of iterations on the UI, as shown below.

:::gallery ui_iterations third
:::

And all of these led to the current version:

:::gallery ui_current half
:::

Now, it is time for playtesting.

## Playtests Didn't Go Well

I tested the game with several friends, and they all played for 30–40 minutes, which is really ideal for what the game can provide for now.

I noticed that they were focused on constantly changing the words and finding the best efficiency, but something felt weird to me.

They weren't satisfied.

Something deep in my mind told me that they weren't really having fun playing this demo. The demo didn't meet my expectations. I realized that players weren't having fun.

## Mechanics Tweaks

I made a few attempts at fixing the game.

First, I tried a day and night system, where factories worked during the day, and players accepted orders and rearranged factories and words at night. This could provide a break in the tempo so that players could rest and think.

I removed the upgrade tree entirely and replaced it with a simple "meet the requirements to upgrade" system. This could let players see what they could do next and prioritize what they thought was stronger.

I removed the hybrid traits system so that each bee only had one trait. And I took it further by making bees unlockable instead of giving them out randomly. This could make progression easier to control and prevent players from getting stuck because of bad luck.

There were just so many tweaks I tried within two months. I tried achievement systems, different upgrade progressions, numbers, and traits. And I finally found a balance where everything fit together. However, there was a huge flaw in this version.

## The Last Leap

The flaw is simple:

I don't like it anymore.

I realized that I might have gone too far down the incremental rabbit hole, and the game had kind of taken a shape I wasn't interested in.

I asked myself: do I want to make this an incremental game?

And after four months of searching for an answer, it was "NO."

The reason the game felt so off to me was probably that, deep down, I was constantly making decisions against the idea of incremental games. The game was being torn between my mind and my heart.

I have to decide on a direction.

This will be the last leap I make.
