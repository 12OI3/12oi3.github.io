---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

title: "CreSpiritTalker"
excerpt: >
  #Plugin #VisualNovel #Unity
published: true 
classes: wide
time: 2025-6

header:
  teaser: /assets/images/projects/CreSpiritTalker/teaser.png

gallery:
  - url: /assets/images/projects/CreSpiritTalker/1.png
    image_path: /assets/images/projects/CreSpiritTalker/1.png
    alt: "Screen Shot A"
  - url: /assets/images/projects/CreSpiritTalker/2.png
    image_path: /assets/images/projects/CreSpiritTalker/2.png
    alt: "Screen Shot B"

sidebar:
  - title: CreSpiritTalker
    text: > 
      A Unity editor tool designed to help users create visual novel scenes, also a commissioned outsourcing project from CreSpirit.
  - title: Tags
    text: > 
      #Plugin #VisualNovel #Unity
  - title: Develop Date
    text: > 
      2024/11 ~ 2025/6
  - title: Team size
    text: > 
      1
  - title: Download
    text: > 
      [Not Available]()
  - title: Role & Responsibility
    text: >
    text: >
      Solo Development: 
      <br>
      - Everything.

---

A Unity editor tool designed to help users create visual novel scenes, also a commissioned outsourcing project from CreSpirit.

{% include gallery %}

## Feature

* A highly customizable Unity editor tool featuring its own dedicated editor window.
* Designed for creating both visual novel-style games and general in-game dialogue interfaces.
* Supports embedding text commands directly into dialogues, with full support for developer-defined custom commands.

## Description

<b></b>
<iframe width="1280" height="720" src="https://www.youtube-nocookie.com/embed/UEKAlN_w6Ao?controls=0" frameborder="0" allowfullscreen></iframe>
<b></b>

Whew, this is my first time creating a plugin tool—huge thanks to CreSpirit for giving me the opportunity!
Developing a plugin is a completely different experience compared to making a game, and I’ve learned a great deal through this process.
Not only did I gain insight into the mindset and development workflow required for tool creation, but I also picked up several Unity techniques I hadn’t used before.
This tool is designed for a variety of use cases, from visual novel-style games to general dialogue scenes in other game genres. 
In fact, I plan to use it in my future projects that require a dialogue system.

The most important feature of this project is the command system. 
Commands can be embedded directly into the dialogue using a special format. 
As the dialogue is read line by line, the system detects and executes these commands. 
They can handle everything from basic dialogue effects and object control to managing the flow of conversations—and more.

What’s even better is that developers can extend the system by inheriting the command class to create their own custom commands. 
This is especially powerful for implementing unique or complex behaviors.

Unfortunately, since this is a commissioned outsourcing project, I’m not able to release it publicly.
However, if you’re curious to learn more, feel free to check out the devlogs!

## Devlogs:
* [#1](/devlog/2024-11-15-CreSpiritTalker-Devlog1)
* [#2](/devlog/2025-06-28-CreSpiritTalker-Devlog2)
