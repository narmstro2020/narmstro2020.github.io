# Lesson 6: Pass by Reference, Scope & Random Numbers
### Self-Guided Notes | Tuesday, April 14, 2026 | No Turn-In — Keep for Reference

---

> **How these notes work:** Read each section, then type the code in CLion and run it. The TRY IT blocks are the most important part — reading code is not the same as running it. You'll need these concepts for the two-day activity that starts tomorrow.

---

## Part 1: The Problem — When Functions Don't Change Anything

You built functions last class. But what happens when a function *tries* to change a variable? Run this and see:

**▶ TRY IT — Type and run this exactly:**

```cpp
#include <iostream>
using namespace std;

void takeDamage(int hp, int dmg) {
    hp -= dmg;
    cout << "Inside function, hp = " << hp << endl;
}

int main() {
    int playerHP = 100;
    takeDamage(playerHP, 25);
    cout << "Back in main, hp = " << playerHP << endl;
    return 0;
}
```

**Expected output:**
```
Inside function, hp = 75
Back in main, hp = 100
```

> 🤔 **PREDICT BEFORE READING:** Why is `playerHP` still 100 after the function ran? Write your best guess:
>
> _______________________________________________
>
> _______________________________________________

**Why this happens — Pass by VALUE:**

When you call `takeDamage(playerHP, 25)`, C++ makes a **copy** of `playerHP` and gives it to the function. The function works on the copy — not the original. When the function ends, the copy is thrown away.

Think of it like a photocopy machine: the function gets a photocopy of your variable. Changing the photocopy does nothing to the original.

---

## Part 2: The Fix — Pass by REFERENCE

To let a function actually change a variable, add `&` before the parameter name. This gives the function a **reference** (an alias) to the original — not a copy.

| ❌ Pass by VALUE (copy) | ✅ Pass by REFERENCE (original) |
|---|---|
| `void takeDamage(int hp, int dmg)` | `void takeDamage(int &hp, int dmg)` |
| Changes a local copy | Changes the actual variable |
| `playerHP` unchanged after call | `playerHP` IS changed after call |

**▶ TRY IT — Add the `&` and run again:**

```cpp
void takeDamage(int &hp, int dmg) {   // <-- added &
    hp -= dmg;
    cout << "Inside function, hp = " << hp << endl;
}
```

**Expected output:**
```
Inside function, hp = 75
Back in main, hp = 75   ← now it sticks!
```

**The `&` Rule:**

- Use `&` when the function needs to **CHANGE** the variable
- Leave it off when the function only needs to **READ** the variable

Common game uses **with** `&`:  `takeDamage(&hp)`,  `heal(&hp, maxHP)`,  `levelUp(&level, &attack)`

Common game uses **without** `&`:  `rollDamage(min, max)`,  `isAlive(hp)`,  `printHP(name, hp)`

**▶ TRY IT — Write a `heal()` function:**

```cpp
void heal(int &hp, int maxHP, int amount) {
    hp += amount;
    if (hp > maxHP) hp = maxHP;   // cap at max
}

// In main:
int hp = 60, maxHP = 100;
heal(hp, maxHP, 50);
cout << hp << endl;   // Should print: 100 (not 110)
```

---

## Part 3: Scope — Where Variables Live

Every variable has a **scope**: the region of code where it exists. Outside that region, the variable doesn't exist.

```cpp
int main() {
    int gold = 100;           // gold exists inside main

    {
        int bonus = 50;       // bonus only exists inside this { }
        gold += bonus;        // fine — gold is in scope here
    }

    // bonus doesn't exist here anymore
    cout << gold << endl;     // OK: prints 150
    // cout << bonus << endl; // ERROR: bonus is out of scope
    return 0;
}
```

**Key scope rules:**

- **Local variable** — defined inside a function or `{ }` block. Only lives there. This is what you want.
- **Function parameter** — also local. Only exists for the life of that function call.
- **Global variable** — defined outside all functions. Visible everywhere. Avoid in game code — hard to track, causes bugs.

Rule of thumb: define variables as close to where you use them as possible.

**▶ TRY IT — Predict what happens, then run this:**

```cpp
int main() {
    for (int i = 0; i < 3; i++) {
        cout << i << endl;
    }
    cout << i << endl;   // ?
    return 0;
}
```

> 🤔 **PREDICT:** Will this compile and run, or give an error? Why?
>
> _______________________________________________
>
> _______________________________________________

---

## Part 4: Random Numbers

C++ can generate random numbers using two headers: `<cstdlib>` for `rand()` and `srand()`, and `<ctime>` for `time()`.

```cpp
#include <iostream>
#include <cstdlib>    // rand(), srand()
#include <ctime>      // time()
using namespace std;

int main() {
    srand(time(0));   // seed once — ALWAYS at the start of main()

    // Roll a 6-sided die: 1 to 6
    int roll = rand() % 6 + 1;
    cout << "You rolled: " << roll << endl;

    // Random damage in range [min, max]
    int minDmg = 5, maxDmg = 15;
    int dmg = rand() % (maxDmg - minDmg + 1) + minDmg;
    cout << "Damage dealt: " << dmg << endl;

    return 0;
}
```

**The formula:**

| Goal | Formula |
|---|---|
| 0 to N-1 | `rand() % N` |
| 1 to N | `rand() % N + 1` |
| min to max | `rand() % (max - min + 1) + min` |

> ⚠️ **CRITICAL:** Only call `srand(time(0))` **once** — at the very beginning of `main()`. If you call it inside a loop or inside a function, you'll get the same "random" number every time.

**▶ TRY IT — Roll 2d6:**

```cpp
srand(time(0));
int die1 = rand() % 6 + 1;
int die2 = rand() % 6 + 1;
cout << "Die 1: " << die1 << endl;
cout << "Die 2: " << die2 << endl;
cout << "Total: " << die1 + die2 << endl;
```

Run it 5 times — the numbers should be different each time.

**▶ TRY IT — Write `rollDice(int sides)`:**

Write a function that returns a random roll from 1 to `sides`. Test it by rolling a d4, d6, d8, d12, and d20.

```cpp
int rollDice(int sides) {
    return rand() % sides + 1;
}

int main() {
    srand(time(0));
    cout << "d4:  " << rollDice(4)  << endl;
    cout << "d6:  " << rollDice(6)  << endl;
    cout << "d8:  " << rollDice(8)  << endl;
    cout << "d12: " << rollDice(12) << endl;
    cout << "d20: " << rollDice(20) << endl;
    return 0;
}
```

---

## Part 5: Function Prototypes (Quick Preview)

C++ reads top-to-bottom. If you try to call a function before it's defined, you get a compile error. A **prototype** tells the compiler a function exists without giving the full definition yet.

| ❌ Error — used before defined | ✅ Prototype solves it |
|---|---|
| `int main() {` | `void greet();   // prototype` |
| `    greet();  // ERROR!` | `int main() {` |
| `}` | `    greet();   // works now` |
| `void greet() { ... }` | `}` |
| | `void greet() { ... }` |

**Prototype syntax** — just the function signature ending with `;`:

```cpp
void takeDamage(int &hp, int dmg);
int  rollDice(int sides);
bool isAlive(int hp);
```

Prototypes go at the top of the file, above `main()`. Parameter names are optional in prototypes.

---

## Self-Check — No Grade

Answer these before tomorrow's activity. Be honest — if you're unsure, re-read the section.

1. What does the `&` in a parameter do? When should you use it vs. leaving it off?

2. If you call `srand(time(0))` inside a loop that runs 10 times, what problem will you have?

3. Write the formula to generate a random number from 10 to 20.

4. What is "scope"? Why can't you use a variable outside the `{ }` where it was defined?

5. What's a function prototype, and when do you need one?

---

## Coming Up: Two-Day Activity (April 15–16)

You'll build a **Dungeon Combat Engine** using everything from Lessons 5 and 6.

- **Day 1 (April 15):** Build the core engine — player stats, damage/heal by reference, random dice rolls, fight one enemy.
- **Day 2 (April 16):** Expand — multiple enemies, critical hits, dodge, healing potions, full game loop.

**15 points, accuracy graded. These notes are your reference — have them open.**
