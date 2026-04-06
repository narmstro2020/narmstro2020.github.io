# Lesson 3: while & for Loops — Guided Notes

**Date:** Monday, April 6, 2026
**Unit 2: Loops | Day 1 of 2**
**Points:** 5 (completion)

> ✏️ Fill in the blanks as we go. Type every code example into CLion and run it.
> Welcome back from break! Quick review first, then new stuff.

---

## Quick Review (5 minutes)

Before we start loops, let's make sure we remember if/else from before break.

### 🖥️ Predict the output, then run it:

```cpp
int hp = 30;

if (hp > 50) {
    cout << "Healthy" << endl;
} else if (hp > 0) {
    cout << "Wounded" << endl;
} else {
    cout << "Dead" << endl;
}
```

Output: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Great — you still know selection. Now let's make code **repeat**.

---

## Part 1: Why Loops?

Right now, if we want the player to attack 5 times, we'd have to write:

```cpp
cout << "You attack! -10 HP" << endl;
cout << "You attack! -10 HP" << endl;
cout << "You attack! -10 HP" << endl;
cout << "You attack! -10 HP" << endl;
cout << "You attack! -10 HP" << endl;
```

That's \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ lines of identical code. What if we wanted 100 attacks?

A **loop** lets you \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ a block of code multiple times without rewriting it.

C++ has three types of loops:
1. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ loop — repeats while a condition is true
2. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ loop — repeats a specific number of times
3. `do-while` loop — (next lesson)

---

## Part 2: The while Loop

A `while` loop repeats **as long as the condition is true**.

### Structure

```cpp
while (condition) {
    // code that repeats
}
```

How it works:
1. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ the condition
2. If true → run the code inside the `{ }`
3. Go back to step \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
4. If false → \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ the loop and continue

### 🖥️ Type and run:

```cpp
int count = 1;

while (count <= 5) {
    cout << "Attack #" << count << "! -10 HP" << endl;
    count++;
}

cout << "Battle over!" << endl;
```

Output:
```
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
```

What does `count++` do? It's a shortcut for \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_.

Without `count++`, the loop would run \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (forever — an **infinite loop**!).

---

## Part 3: Loop Tracing (Desk-Checking)

Tracing a loop means tracking the variable values **by hand** on paper. This is one of the most important debugging skills.

### Trace this loop:

```cpp
int hp = 30;
int round = 1;

while (hp > 0) {
    cout << "Round " << round << ": HP = " << hp << endl;
    hp -= 12;
    round++;
}

cout << "You fainted!" << endl;
```

Fill in the table:

| Iteration | `round` (start) | `hp` (start) | `hp > 0`? | `hp` after `-= 12` | `round` after `++` |
|-----------|-----------------|--------------|-----------|--------------------|--------------------|
| 1 | 1 | 30 | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ |
| 2 | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ |
| 3 | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ |
| 4 | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ | — | — |

How many times does the loop body run? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

What is `hp` when the loop ends? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 🖥️ Now run it in CLion and check your answers!

---

## Part 4: Infinite Loops

An **infinite loop** runs forever because the condition \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ becomes false.

### 🔴 What's wrong with this code?

```cpp
int x = 1;

while (x <= 10) {
    cout << x << endl;
}
```

Problem: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Fix: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**If your program freezes in CLion:** click the red ⬛ **Stop** button to kill it. Don't panic — this happens to everyone.

### Three rules to avoid infinite loops:

1. Your loop condition must eventually become \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
2. Something inside the loop must \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ the variable in the condition
3. Double-check: does the variable move \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (toward making the condition false)?

---

## Part 5: Counter and Accumulator Variables

### Counter variable

A **counter** tracks how many times something has happened.

```cpp
int enemiesDefeated = 0;  // starts at 0

while (enemiesDefeated < 3) {
    cout << "You defeated an enemy!" << endl;
    enemiesDefeated++;  // count goes up by 1
}

cout << "Total defeated: " << enemiesDefeated << endl;
```

Pattern: start at \_\_\_\_\_\_\_\_\_\_\_\_, increment by \_\_\_\_\_\_\_\_\_\_\_\_ each iteration.

### Accumulator variable

An **accumulator** builds up a total over multiple iterations.

```cpp
int totalDamage = 0;  // starts at 0
int round = 1;

while (round <= 3) {
    int hit = round * 5;  // damage increases each round
    totalDamage += hit;
    cout << "Round " << round << ": dealt " << hit
         << " damage (total: " << totalDamage << ")" << endl;
    round++;
}
```

Pattern: start at \_\_\_\_\_\_\_\_\_\_\_\_, add \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ each iteration.

---

## Part 6: The for Loop

A `for` loop is a compact way to write a counting loop. It puts the **initialization**, **condition**, and **update** all in one line.

### Structure

```cpp
for (initialization; condition; update) {
    // code that repeats
}
```

### Example — same as our while loop:

```cpp
// while version:
int count = 1;
while (count <= 5) {
    cout << "Attack #" << count << endl;
    count++;
}

// for version:
for (int count = 1; count <= 5; count++) {
    cout << "Attack #" << count << endl;
}
```

The three parts of a `for` loop:

| Part | What it does | Example |
|------|-------------|---------|
| Initialization | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | `int count = 1` |
| Condition | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | `count <= 5` |
| Update | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | `count++` |

The initialization runs \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (once / every iteration).

The condition is checked \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (once / every iteration).

The update runs \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (once / after each iteration).

### 🖥️ Type and run:

```cpp
for (int i = 0; i < 10; i++) {
    cout << i << " ";
}
cout << endl;
```

Output: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Why does it print 0 through 9, not 1 through 10? Because `i` starts at \_\_\_\_\_\_ and the condition is `<` not \_\_\_\_\_\_.

---

## Part 7: Counting Patterns with for

### Count up:
```cpp
for (int i = 1; i <= 10; i++) { ... }   // 1, 2, 3, ..., 10
```

### Count down:
```cpp
for (int i = 10; i >= 1; i--) { ... }   // 10, 9, 8, ..., 1
```

### Count by 2s:
```cpp
for (int i = 0; i <= 20; i += 2) { ... } // 0, 2, 4, ..., 20
```

### 🖥️ Type and run — a countdown:

```cpp
cout << "Self-destruct in..." << endl;
for (int i = 5; i >= 1; i--) {
    cout << i << "..." << endl;
}
cout << "BOOM!" << endl;
```

---

## Part 8: Nested Loops

You can put a loop \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ another loop. The inner loop runs **completely** for each iteration of the outer loop.

### 🖥️ Type and run:

```cpp
for (int row = 0; row < 5; row++) {
    for (int col = 0; col < 10; col++) {
        cout << ". ";
    }
    cout << endl;
}
```

Output — what shape does it make? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

How many total dots are printed? \_\_\_\_\_\_ × \_\_\_\_\_\_ = \_\_\_\_\_\_

### Making it a dungeon map:

```cpp
int playerRow = 2;
int playerCol = 4;

for (int row = 0; row < 5; row++) {
    for (int col = 0; col < 10; col++) {
        if (row == playerRow && col == playerCol) {
            cout << "@ ";
        } else {
            cout << ". ";
        }
    }
    cout << endl;
}
```

This prints a grid with `@` at position (\_\_\_\_\_\_, \_\_\_\_\_\_) and `.` everywhere else.

---

## Part 9: while vs. for — When to Use Each

| Use `while` when... | Use `for` when... |
|--------------------|--------------------|
| You don't know how many times it will repeat | You \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ how many times it will repeat |
| The loop depends on user input or game events | You're \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ through a range of numbers |
| Example: game loop (while player is alive) | Example: print a grid, count from 1 to 10 |

---

## 🧠 Exit Ticket

**Without running the code**, what is the output?

```cpp
int total = 0;

for (int i = 1; i <= 4; i++) {
    total += i;
}

cout << "Total: " << total << endl;
```

Trace it:

| `i` | `total` before | `total` after `+= i` |
|-----|---------------|----------------------|
| 1 | 0 | \_\_\_\_ |
| 2 | \_\_\_\_ | \_\_\_\_ |
| 3 | \_\_\_\_ | \_\_\_\_ |
| 4 | \_\_\_\_ | \_\_\_\_ |

Output: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

**📌 Reminders:**
- Save your notes — you'll need them tomorrow.
- Tomorrow (Tuesday, April 7): **"Monster Battle Loop"** activity — you'll build a turn-based battle with HP bars using `while` and `for` loops. 15 points.
