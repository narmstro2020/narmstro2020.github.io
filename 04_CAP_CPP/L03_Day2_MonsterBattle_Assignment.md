# Lesson 3 Activity: Monster Battle Loop

**Date:** Tuesday, April 7, 2026
**Unit 2: Loops | Day 2 of 2**
**Points:** 15 (accuracy)

---

## The Mission

You are building a **turn-based monster battle** using loops. The player and a monster take turns attacking each other until one of them drops to 0 HP or below. Each round displays both combatants' HP — including a visual **HP bar** built with a `for` loop.

---

## Requirements

### Core Battle Loop (while)

Your program must use a `while` loop that continues as long as **both** the player and the monster are alive (HP > 0).

Each round of the loop must:
1. Display the current round number
2. Display both HP values **and** HP bars
3. The player attacks the monster (subtract damage from monster HP)
4. Check if the monster is dead — if so, break out or let the loop end
5. The monster attacks the player (subtract damage from player HP)
6. Increment the round counter

### HP Bar (for loop)

For each combatant, print a visual HP bar using a `for` loop. The bar should show one `#` for every 10 HP remaining.

Example for 70 HP:
```
[#######...]    70/100 HP
```

The bar should be **10 characters wide** (representing 100 max HP):
- Print `#` for each filled unit (`hp / 10` of them)
- Print `.` for each empty unit (the rest)

### After the Loop

When the battle ends, display:
- Who won (player or monster)
- Final HP of both combatants
- Total rounds fought
- Total damage dealt by the player (accumulator variable)

---

## Variables You'll Need

| Variable | Type | Starting Value |
|----------|------|----------------|
| `playerHP` | `int` | `100` |
| `monsterHP` | `int` | `80` |
| `playerDamage` | `int` | `15` (damage per hit) |
| `monsterDamage` | `int` | `12` (damage per hit) |
| `round` | `int` | `1` |
| `totalDamageDealt` | `int` | `0` (accumulator) |

---

## Example Output

```
=== MONSTER BATTLE ===

--- Round 1 ---
Player:  [##########]  100/100 HP
Monster: [########..]   80/80 HP

You strike the monster for 15 damage!
The monster claws you for 12 damage!

--- Round 2 ---
Player:  [########..]   88/100 HP
Monster: [######....]   65/80 HP

You strike the monster for 15 damage!
The monster claws you for 12 damage!

--- Round 3 ---
Player:  [######**..]   76/100 HP
Monster: [#####.....]   50/80 HP

...

--- Round 6 ---
Player:  [####......]   40/100 HP
Monster: [#.........]    5/80 HP

You strike the monster for 15 damage!
The monster has been defeated!

=== VICTORY! ===
Rounds fought: 6
Your HP remaining: 40/100
Monster HP remaining: -10/80
Total damage you dealt: 90
```

*Your output doesn't need to match this exactly — the HP bar format can vary as long as it uses a for loop.*

---

## Getting Started

1. Open CLion — new project or existing
2. Use the starter code provided
3. Build in order: variables → HP bar → battle loop → ending
4. **Test after each section!**

---

## HP Bar Hint

The HP bar is the trickiest part. Here's the pattern:

```cpp
// Print HP bar for a given current HP and max HP
cout << "[";
for (int i = 0; i < 10; i++) {
    if (i < currentHP / 10) {
        cout << "#";
    } else {
        cout << ".";
    }
}
cout << "]";
```

This prints 10 characters total. The number of `#` symbols equals `currentHP / 10` (integer division!). The rest are `.` characters.

You'll need to print this bar **twice per round** — once for the player, once for the monster. Consider writing the bar code and copy/pasting it, adjusting the variable names. (In the next unit we'll learn functions to avoid this repetition!)

---

## Grading

| Criteria | Points |
|----------|--------|
| **Compiles and runs** without errors | 3 |
| **Correct output** — battle loop runs until one combatant reaches 0 HP, each round shows round number + both HP values + HP bars, correct damage applied each round, winner declared, final stats shown | 7 |
| **Uses required concepts** — `while` loop with compound condition, `for` loop for HP bar, round counter, accumulator for total damage, HP bar uses if/else inside for loop | 5 |
| **Total** | **15** |

---

## Extension (if you finish early)

- **Randomize damage:** Instead of fixed damage, use `rand() % 10 + 8` for a range of 8–17 damage per hit. You'll need `#include <cstdlib>`, `#include <ctime>`, and `srand(time(0));` at the start.
- **Add a second monster:** After the first monster dies, spawn a second one with more HP. Track total rounds across both fights.
- **Color the HP bar:** Print `#` normally when HP > 50, print a warning message when HP drops below 25.
- **Add player choice:** Each round, let the player choose: 1=Attack (normal damage), 2=Heavy Attack (double damage but skip your defense — monster hits harder), 3=Defend (half damage taken).

---

## Reminders

- **Reference your notes** from today (Monday, April 6) — especially the loop tracing section and nested loop examples.
- The HP bar uses **integer division** (`hp / 10`) — remember from Lesson 2, integer division drops the decimal!
- If your loop runs forever, hit the red ⬛ Stop button and check: is your condition eventually becoming false?
