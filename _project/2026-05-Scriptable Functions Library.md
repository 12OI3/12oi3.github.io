---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

title: "Scriptable Functions Library"
excerpt: > 
  #Plugin #Database #Unity
published: true 
classes: wide
time: 2026-05b

header:
  teaser: /assets/images/projects/Scriptable Functions Library/teaser.jpg

sidebar:
  - title: Scriptable Functions Library
    text: > 
      A Unity tool that generates a ScriptableObject used to register and manage callable functions via string IDs.
  - title: Tags
    text: > 
      #Plugin #Database #Unity
  - title: Develop Date
    text: > 
      2026/4 ~ 2026/4
  - title: Team size
    text: > 
      1
  - title: Download
    text: > 
      [Link](https://github.com/12OI3/Scriptable-Functions-Library)
  - title: Role & Responsibility
    text: >
      Solo Development: 
      <br>
      - Everything.

---

A Unity tool that generates a ScriptableObject used to register and manage callable functions via string IDs.

[Git Hub Link](https://github.com/12OI3/Scriptable-Functions-Library)

## Introduction
Scriptable Functions Library provides a lightweight way to organize and invoke functions using string ID. It is flexible enough to support various use cases. This tool is particularly suitable for technical designers or developers comfortable with minor code integration, as some parameters must still be defined in code. This system is also designed primarily for prototyping. It may not scale efficiently for large production systems.

That said, it helps:
- Avoid large switch-case statements
- Centralize function management
- Improve iteration speed during development

## Basic Utilities

Open the tool via: "Window > Scriptable Functions Library" in the menu.

In order to use the tool, you will have to create library. A scriptable object will be created under the resource folde, and this asset stores all preset data and is used at runtime.

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

DemoFunction is automatically detected and registered. You can check out all classes via the tool window, and enable/disable it in runtime.

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

## Abstract Usages

Abstract classes are ignored during registration, making them ideal for defining shared logic or parameters.

It is recommand to create an abstract base class that implement shared behavior, then having more class inherit from it.

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

This library support Async/Await:

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