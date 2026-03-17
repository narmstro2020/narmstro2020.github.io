# Lesson 1 Activity: Character Creator

**Date:** Tuesday, March 17, 2026
**Unit 1: C++ Foundations | Day 2 of 2**
**Points:** 15 (accuracy)

---

## The Mission

You are building a **Character Creator** for an RPG game. Your program will ask the user for information about their character, then display a formatted character sheet in the console.

This uses everything from yesterday's notes: `cout`, `cin`, variables, and all 5 data types.

---

## Requirements

Your program must do **all** of the following:

### Input (use `cin` to collect from the user)

| Prompt the user for... | Store as... |
|------------------------|-------------|
| Character name | `string` |
| Character age | `int` |
| Character height (in feet, e.g. 5.9) | `double` |
| Character class (e.g. Warrior, Mage, Archer) | `string` |
| Is the character enchanted? (1 = yes, 0 = no) | `bool` |

That's **5 inputs** using **4 different data types** (`string`, `int`, `double`, `bool`).

### Output (use `cout` to display)

Your program must print a **formatted character sheet** that includes:

- A clear header (e.g. `=== CHARACTER SHEET ===`)
- All 5 values the user entered, each on its own line with a label
- At least one **calculated stat** — pick one or make up your own:
  - `XP to next level = age × 100`
  - `Base damage = age / 2`
  - `Gold starting amount = age × 10 + 50`
- A blank line separating the header from the stats (use `cout << endl;`)

### Code Requirements

- Use `#include <iostream>` and `#include <string>`
- Use `using namespace std;`
- All code inside `int main() { ... }`
- End with `return 0;`
- Use **camelCase** for all variable names (e.g. `charName`, `charAge`, not `char_name` or `CharAge`)

---

## Example Run

Your output doesn't need to match this exactly, but it should look something like this:

```
=== CHARACTER CREATOR ===

Enter your character's name: Shadow
Enter your character's age: 22
Enter your character's height: 5.8
Enter your character's class: Mage
Is your character enchanted? (1=yes, 0=no): 1

==============================
    CHARACTER SHEET
==============================
Name:      Shadow
Class:     Mage
Age:       22
Height:    5.8 ft
Enchanted: 1
------------------------------
XP to Next Level: 2200
==============================
```

---

## Getting Started

1. Open CLion
2. Create a **new C++ Executable project** (or use your project from yesterday)
3. Replace the code in `main.cpp` with the starter code (see next page or provided file)
4. Fill in the sections marked with `// TODO`
5. **Run your program** after each section to make sure it works before moving on

---

## Grading

| Criteria | Points |
|----------|--------|
| **Compiles and runs** without errors | 3 |
| **Correct output** — all 5 inputs collected, character sheet displays all values with labels, includes a calculated stat | 7 |
| **Uses required concepts** — at least 4 data types (`int`, `double`, `string`, `bool`), uses `cin` and `cout`, proper camelCase naming, includes `#include`, `main()`, and `return 0` | 5 |
| **Total** | **15** |

---

## Extension (if you finish early)

Already done? Try adding one or more of these. These won't earn extra points but will build your skills:

- Add a second calculated stat (e.g. both XP and base damage)
- Add a `char` variable for the character's rank initial (e.g. `'S'`, `'A'`, `'B'`)
- Add a backstory field using `getline(cin, backstory)` — remember, you'll need to handle the newline left by `cin >>` first (hint: add `cin.ignore();` before the `getline`)
- Make the character sheet look fancier with box-drawing characters or extra formatting

---

## Reminders

- **All work in class.** Save often!
- **Reference your notes** from yesterday (Monday, March 16) — they have everything you need.
- **Ask for help** if you're stuck. Check your error messages first, then ask a neighbor, then ask the teacher.
- It's okay if your output doesn't look exactly like the example. Focus on getting the requirements right.
