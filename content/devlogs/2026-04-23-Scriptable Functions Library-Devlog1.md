---
title: "Scriptable Functions Library Devlog #1"

time: "2026-04-23"

published: true

comments: true

highlight: true

excerpt: |-
  I published the most critical system I use for prototyping on GitHub.

skills:
  - "Tools"

projects:
  - "2026-05-Scriptable Functions Library"
---

After finishing my first year at CMU ETC, I decided to build this structure as a Unity plugin. The reason is simple: I use it every time.

To be honest, this is not a complicated idea. But it keeps being useful, whether I am working on dialogue, level generation, or trying a new gameplay system. That is why I decided to turn it into a plugin instead of rebuilding the structure for every project.

## What Does It Do?

This structure is just so helpful because it lets me call functions by string ID. I can manage those IDs in a spreadsheet or on other platforms, then let the game find the corresponding function and execute it.

It also supports async/await and abstract classes, so I can use the same structure in different situations.

## Where I Have Used It

Here are the projects where I have used this structure:

- [CreSpiritTalker](/project/2025-06-CreSpiritTalker/)
- [Vocabutory](/project/2025-07-Vocabutory/)
- [One Day More](/project/2026-01-One%20Day%20More/)
- [QA King](/project/2026-04-QA%20King/)
- [Bodega Budget](/project/2026-05-Bodega%20Budget/)
- [You Hive My Word](/project/2026-09-You%20Hive%20My%20Word/)
- [What Does This Sound Like](/project/2026-10-What%20Does%20This%20Sound%20Like/)

Below is the README copied from the repository, giving you a sense of what this plugin can do and how to use it:

## Basic Utilities

Open the tool via: "Window > Scriptable Functions Library" in the menu.

In order to use the tool, you will have to create a library. A ScriptableObject will be created in the Resources folder, and this asset stores all preset data and is used at runtime.

Do not rename or move this asset. Its path is required for proper functionality.

The system automatically registers all non-abstract classes that inherit from ScriptableFunction. For example:

```csharp

using UnityEngine;
using ScriptableFunctionsLibrary;

public class Demo : MonoBehaviour
{
    void Start()
    {
        (ScriptableFunctionsLibraryManager.Library["DemoFunction"] as DemoFunction).Execute();
    }
}

public class DemoFunction : ScriptableFunction
{
    public void Execute()
    {
        Debug.Log("Hello World!");
    }
}

```

DemoFunction is automatically detected and registered. You can check out all classes via the tool window, and enable or disable them at runtime.

You can add tooltips using Unity’s Tooltip attribute:

```csharp

using UnityEngine;
using ScriptableFunctionsLibrary;

[Tooltip("This will print Hello World!")]
public class DemoToolTipFunction : ScriptableFunction
{
    public void Execute()
    {
        Debug.Log("Hello World!");
    }
}

```

These tooltips will appear in the editor for better readability.

## Abstract Classes

Abstract classes are ignored during registration, making them ideal for defining shared logic or parameters.

It is recommended to create an abstract base class that implements shared behavior, then have other classes inherit from it.

```csharp

using UnityEngine;
using ScriptableFunctionsLibrary;

public abstract class NumberFunction : ScriptableFunction
{
    public abstract int Number { get;}
    public void PrintNumber()
    {
        Debug.Log(Number);
    }
}

public class One : NumberFunction
{
    public override int Number => 1;
}

public class Two : NumberFunction
{
    public override int Number => 2;
}

public class Three : NumberFunction
{
    public override int Number => 3;
}

```

## Async/Await

This library supports async/await:

``` csharp

using UnityEngine;
using ScriptableFunctionsLibrary;
using System.Threading.Tasks;

public abstract class AsyncFunction : ScriptableFunction
{
    public abstract Task Execute();
}

public class IsAsyncFunction : AsyncFunction
{
    public override async Task Execute()
    {
        await Task.Delay(1000);
    }
}

public class IsNotAsyncFunction : AsyncFunction
{
    public override Task Execute()
    {
        return Task.CompletedTask;
    }
}

```