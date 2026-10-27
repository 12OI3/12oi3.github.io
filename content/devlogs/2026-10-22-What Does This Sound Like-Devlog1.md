---
title: "What Does This Sound Like? Devlog #1"

time: "2026-10-22"

published: true

comments: true

highlight: true

excerpt: |-
  I created the best system in my 8 years of game dev life.

skills:
  - "Technical Game Design"
  - "Tools"

projects:
  - "2026-10-What Does This Sound Like"
---

## A Game About Foley

We are basically making an indie game at this point.
I am really excited to work on this project, since I really think this is an innovative idea, and I can use my school time to work on it.

Here is [a brief introduction to the game](/project/2026-10-What%20Does%20This%20Sound%20Like/).

At the start of the semester, I knew that a robust level system was important.
A good level system could save a lot of time, and after some testing, I found a solution.
I am not going to sugarcoat it: this is the best system I have created in my 8 years of game dev life.

## The Challenge

![](/assets/images/projects/What Does This Sound Like/1.jpg)

In our game, players need to interact with different objects to make sounds.
And then, players can record these sounds and edit them into a soundscape.
In order to achieve this, each level will have tons of objects that produce sounds, and tons of different ways to produce those sounds.

![](/assets/images/projects/What Does This Sound Like/2.jpg)

Thus, I concluded that our level system needed to do three things:

First, it needed to **work**.
Of course, each object may have several ways to make different sounds. Each interaction needs to produce the corresponding sound, and some will trigger additional events.

Second, it needed to be **readable**.
There will be tons of objects inside the game, so having an easy way to identify all the interactions is important.

Third, it needed to be **extendable**.
The game might have interactions we have not thought of yet, so the system must be flexible enough to support those features.

## Hierarchy-Based Relation

Inspired by [this structure](https://www.youtube.com/watch?v=YLS-TI7pHa0), I decided to connect Objects and Actions using a hierarchy.

It basically looks like this:

![](/assets/images/devlogs/What Does This Sound Like-1/1.png){.image-compact}

As you can see, all actions are prefabs, and actions go under objects.
In this case:

- Sand
  - Walk
- Tent
  - Hit
  - Scrape
  - Shake
  - Pluck
  - Sleep
  - Enter
  - Exit

![](/assets/images/devlogs/What Does This Sound Like-1/2.png){.image-compact}

This is what the components inside an action look like.

Basically, it contains a script that inherits from a base class, which contains a function to produce sounds.
This base class requires an FMODStudioEventEmitter, which plays sounds but requires a path to the corresponding sound event.
Here is the magic: the path will be exactly [parent name] + [_] + [object name].
Thus, as long as the object and action names match the sound event's name, and they are in the correct hierarchy, the editor script I made will automatically fill in the corresponding path in FMODStudioEventEmitter.

![](/assets/images/devlogs/What Does This Sound Like-1/3.png)

As you can see, we have several scripts that inherit from the base class, and these scripts have their own logic to produce sounds.
For example, touchable requires a collider, and it triggers sounds when the player enters it.
At this point, the system is really easy to extend, since if we need a new way to create sounds, I just need to write a new logic script.

![](/assets/images/devlogs/What Does This Sound Like-1/4.png){.image-compact}

The prefab itself acts as a template.
It can be easily dragged into the scene to give an object an action.
Then, I can easily customize the position, collider size, and even a special command event sequence that triggers on interaction.
Since these are prefab instance overrides, the others will not be affected.

## Command Event Sequence

![](/assets/images/devlogs/What Does This Sound Like-1/5.png){.image-compact}

These command events are created using my own plugin [Scriptable Functions Library](/project/2026-05-Scriptable%20Functions%20Library/), which allows me to use classes based on string IDs.
I can then set up different commands for me to use.

![](/assets/images/devlogs/What Does This Sound Like-1/6.png)

For example, if I need a bird to fly away when triggered, it will execute the events in order.
Since it is async/await, it is really easy to create crazy effects using only these commands.
If there is something that is really complicated, I can also just create a new event that executes it.

## Status Policy

![](/assets/images/devlogs/What Does This Sound Like-1/7.png){.image-compact}

I created a status system to manage different states in the game.
Since it is tied to an event system, I can register functions and invoke the event when the status list changes.
This opens up far more crazy possibilities for what I can do in a scene.

For example, character animations can listen to the event and change based on a specific status.

![](/assets/images/devlogs/What Does This Sound Like-1/8.png)
![](/assets/images/devlogs/What Does This Sound Like-1/9.png)

For another example, our game requires you to open the car door first, and then get into the car. Then you can execute several actions inside the car.
We use "OnCarDoorOpen" & "OnCar" to identify the state of the car model and decide whether to show the enter action, and whether the player should be snapped to the car seat.

## Conclusion

That is the major part of the system now.

There are still a lot of details I created in this system, and it really helps me create levels.
I am really proud that I made this system, and I think this is one of the greatest systems I have made.
Just for the record, I didn't consult any AI when designing this system. I came up with it on my own.

Hell Yeah!