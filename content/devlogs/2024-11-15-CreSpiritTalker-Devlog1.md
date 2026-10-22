---
skills: ["Tools"]
highlight: false
project: "2025-06-CreSpiritTalker"
title: I made a visual novel tool that supports infinite possibilities.
excerpt: >
   CreSpiritTalker Devlog #1
published: true 
time: 2024-11-15
---

<b></b>
<iframe width="1280" height="720" src="https://www.youtube-nocookie.com/embed/eZWFNiyEKhc?controls=0" frameborder="0" allowfullscreen></iframe>
<b></b>

## Introduction

CreSpiritTalker is a highly customizable Unity editor tool designed to help users create visual novel scenes. As a commissioned outsourcing project from CreSpirit, this tool has been in development since 10/29/2024. The tool is written in C#.
Since this is an outsourcing project, I cannot go into too much detail, so I will explain the features I made.

## Feature - Create Scenes to Customize

CreSpiritTalker provides users with a streamlined way to create visual novel scenes by cloning templates, adjusting UI elements, and importing language settings. With the editor tool, users can create templates and manage language settings for dialogs and fonts.

## Feature - JSON Dialog File

Users can use Google Sheets to manage dialogue and download it as a JSON file for use in Unity. The language settings determine which language slots are read from the dialogue JSON file.

## Feature - In-game Functions

By using the CreSpiritTalker namespace, users can integrate the tool into their projects, allowing them to call its functionality seamlessly. The tool follows a full operational cycle—Open, Load, Play, Close—executed with UniTask to ensure efficient asynchronous behavior. It also supports two different ways to advance dialogue: normal and skip.

## Feature - Custom command

In addition, users can insert text commands to add effects during dialogues and create custom commands to extend functionality further. The system supports both async and non-async functions, enabling flexible usage scenarios. They can be implemented by users and added to the system.

## Future Plan

The basic structure of the tool was finished. I will continue to add default functions like custom buttons, vocal & sfx & bgm settings, sprite controllers...