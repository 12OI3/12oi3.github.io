---

title: "CreSpiritTalker #2"
excerpt: >
   Updating More and More Important Features
published: true 
time: 2025-06-28

---

<b></b>
<iframe width="1280" height="720" src="https://www.youtube-nocookie.com/embed/UEKAlN_w6Ao?controls=0" frameborder="0" allowfullscreen></iframe>
<b></b>

CreSpiritTalker is now at version 0.6.5, and over the past month of hard work, many new features and improvements have been added since the first devlog.
Let’s take a look at what’s new:

## Feature - Database Structure Refactor

Previously, all data was stored on a per-scene basis, which made it difficult to support multi-scene usage.
To address this, I’ve refactored the entire database structure. Data is now stored in ScriptableObjects, making it more flexible and scene-independent. This lays the foundation for scalable and reusable dialogue systems across different scenes.

## Feature - Sound Related

The database now supports BGM, SFX, and VA.
BGM and SFX can be played via new built-in commands during a scene.
VA is automatically played if set correctly, with runtime logic that selects the appropriate voice file based on language and voice settings.
Developers can assign Character SFX, which plays a unique sound effect per character whenever dialogue is displayed!

## Feature - Dialog Options

Dialogue option is now possible, it’s a bit tricky to set up, but incredibly flexible once implemented.
A new mechanism called Dialog Jump allows for conditional dialogue progression, it will continue to jump the dialog lines until the current key meet the jump string.
When a dialogue line includes [Dialog_WaitForJumper], it pauses until a specified string in the manager is changed.
By combining this with objects that inherit from the CreSpiritTalkerButton class and using spawn commands, you can create custom dialogue options.
Buttons can modify the Dialog Jump string, resuming the dialogue based on player choice.

## Feature - Save System

I also made a new save/load system.
You can save the current game state, including all scene objects, logs, and metadata, as a JSON string.
Loading this file restores the previous state.

However, version updates may cause save files to become incompatible (e.g., missing lines or objects). 
To handle this, the system allows developers to register a "danger transfer list".
If the system detects current save file is registered on the list, it uses the developer-defined transfer positions to redirect the loading flow.
It then fast-forwards through dialogue to the correct point, executing only essential command logic in a non-async manner to ensure stability.

## Feature - More and More QOL

I’ve also added many QoL features to make development smoother.
For example, an one-click scanning can now register all custom commands in the project.
Sound files now support prefixes, useful for managing different versions or localizations.
Dialogue JSON files can now include a scene name in the first line, allowing managers to auto-start scenes with new utility functions.
Many new helper functions and commands have been added for easier integration and usability.

Version 0.6.5 marks a temporarily complete milestone for CreSpiritTalker. While I may continue to make minor updates as needed, most of the core features are now in place.
This has been my first experience developing a Unity plugin tool—and I’ve learned so much through this experence.

[Take Me To Project Page](/project/2025-6-CreSpiritTalker/)