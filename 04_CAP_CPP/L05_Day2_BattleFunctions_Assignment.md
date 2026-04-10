# Lesson 5 Activity: Battle Functions

**Date:** Monday, April 13, 2026
**Unit 3: Functions | Day 2 of 2**
**Points:** 15 (accuracy)

---

## The Mission

You're **refactoring** your Monster Battle — taking the messy all-in-main code and organizing it into clean, reusable functions. When you're done, your `main()` function should read almost like English.

Refactoring means: same behavior, better \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_.

---

## Required Functions

You must write **at least 5 functions**. Here are the required ones:

### 1. `void displayHP(string name, int hp, int maxHP)`

Prints an HP bar for any combatant.

```
Player:  [########..]  76/100 HP
```

- Uses a `for` loop to draw the bar (10 characters wide)
- Shows current/max HP after the bar

### 2. `bool isAlive(int hp)`

Returns `true` if HP > 0, `false` otherwise.

```cpp
if (isAlive(playerHP)) { ... }
```

### 3. `int rollDamage(int min, int max)`

Returns a random number between `min` and `max` (inclusive).

```cpp
int hit = rollDamage(8, 18);
```

- Requires `#include <cstdlib>` and `srand(time(0))` in main

### 4. `void printSeparator()`

Prints a decorative line to separate sections of output.

```
==============================
```

### 5. One function of your choice

Pick one (or make up your own):

| Function | Signature | What it does |
|----------|-----------|-------------|
| Status label | `string getStatus(int hp)` | Returns "Healthy" / "Wounded" / "Critical" / "Dead" based on HP |
| XP calculator | `int calculateXP(int enemyLevel, int rounds)` | Returns XP earned: `enemyLevel * 50 - rounds * 5` |
| Battle header | `void printBattleHeader(string enemyName, int round)` | Prints `--- Round 3 vs. Goblin ---` |
| Victory message | `void printVictory(int playerHP, int maxHP, int rounds)` | Prints a formatted victory screen |

---

## Program Structure

Your final program should follow this structure:

```
#include statements

// ---- FUNCTIONS (above main) ----
void printSeparator() { ... }
void displayHP(...) { ... }
bool isAlive(...) { ... }
int rollDamage(...) { ... }
// your 5th function here

// ---- MAIN ----
int main() {
    // setup variables
    // srand(time(0))
    // battle loop using your functions
    // ending
}
```

### main() Should Be Clean

Your `main()` function should use function calls instead of inline logic. For example:

```cpp
// ❌ Before (messy)
cout << "Player:  [";
for (int i = 0; i < 10; i++) {
    if (i < playerHP / 10) cout << "#";
    else cout << ".";
}
cout << "]  " << playerHP << "/100 HP" << endl;

// ✅ After (clean)
displayHP("Player", playerHP, 100);
```

---

## Example Output

```
==============================
      MONSTER BATTLE
==============================

--- Round 1 ---
Player:  [##########]  100/100 HP  (Healthy)
Goblin:  [########..]   80/80 HP

You strike the goblin for 14 damage!
The goblin claws you for 11 damage!

--- Round 2 ---
Player:  [########..]   89/100 HP  (Healthy)
Goblin:  [######....]   66/80 HP

You strike the goblin for 16 damage!
The goblin claws you for 8 damage!

...

--- Round 5 ---
Player:  [######....]   58/100 HP  (Wounded)
Goblin:  [#.........]    6/80 HP

You strike the goblin for 12 damage!
The goblin has been defeated!

==============================
      VICTORY!
==============================
Rounds fought: 5
HP remaining: 58/100 (Wounded)
XP earned: 135
==============================
```

---

## Getting Started

1. Open CLion — new project or existing
2. Start with the **starter code**
3. Build one function at a time:
   - Write `printSeparator()` → call it from main → test
   - Write `displayHP()` → call it from main → test
   - Write `isAlive()` → use it in the while condition → test
   - Write `rollDamage()` → use it in the attack logic → test
   - Write your 5th function → integrate it → test
4. **Test after every function!** Don't write all 5 then try to run.

---

## Grading

| Criteria | Points |
|----------|--------|
| **Compiles and runs** without errors | 3 |
| **Correct output** — battle plays out using functions, HP bars display correctly, random damage works, winner declared, final stats shown. main() is clean and readable. | 7 |
| **Uses required concepts** — at least 5 functions defined above main, at least 1 void function, at least 1 function that returns a value, at least 1 function with parameters, functions are actually called from main (not just defined), no duplicated logic that could be a function call | 5 |
| **Total** | **15** |

---

## Concept Checklist

- [ ] At least 5 functions defined above `main()`
- [ ] `void displayHP(string, int, int)` — prints HP bar
- [ ] `bool isAlive(int)` — returns true/false
- [ ] `int rollDamage(int, int)` — returns random damage
- [ ] `void printSeparator()` — prints decorative line
- [ ] 5th function of my choice
- [ ] Functions are called from `main()`, not just defined
- [ ] `main()` is clean — no duplicated HP bar code
- [ ] `while` loop uses `isAlive()` in its condition
- [ ] Random damage uses `rollDamage()`, not inline `rand()`
- [ ] Battle produces correct output with winner + stats
- [ ] `srand(time(0))` called once at the start of main

---

## Extension (if you finish early)

- **Add a `getMenuChoice()` function** that handles the do-while validation from Lesson 4 and returns the validated choice. This makes your battle loop even cleaner.
- **Add a `void printHPBar(int hp, int maxHP)` helper** that only draws the `[###....]` part, then have `displayHP` call it. This is a function calling a function!
- **Two enemies:** After defeating the first, fight a second with higher stats. Use the same functions for both battles — that's the power of reuse.
- **Add a `double calculateWinRate(int playerHP, int monsterHP)` function** that estimates win probability based on remaining HP ratio.

---

## Reminders

- Functions go **above** `main()`, not inside it.
- Every function with a non-void return type **must** have a `return` statement.
- `srand(time(0))` goes in `main()`, not inside `rollDamage()`. You only seed the random number generator once.
- If your battle runs the same way every time, you probably forgot `srand(time(0))`.
