# Dungeon Combat Engine
### Lesson 6 Activity | Pass by Reference, Scope & Random Numbers
### 15 Points | Accuracy Graded

---

# DAY 1 — APRIL 14
## Build the Core Engine

> **The setup:** You're building the combat engine for a dungeon RPG — the invisible machinery that runs every battle. Today you build the foundation: a player with stats, functions that modify those stats by reference, and a fight against one enemy using random dice rolls. Tomorrow you expand it: multiple enemies, critical hits, dodge chance, and a healing potion.
>
> **Reference:** Lesson 5 notes (functions) and Lesson 6 notes (`&` and random numbers) — have them open.

---

## Step A — Project Setup

Create a new CLion project called `DungeonCombat`. Replace the contents of `main.cpp` with the starter code below.

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>
#include <string>
using namespace std;

// ── PROTOTYPES ─────────────────────────────────────────────────────────────
void printDivider();
void printStats(string name, int hp, int maxHP, int attack, int level);
void takeDamage(int &hp, int dmg);
void heal(int &hp, int maxHP, int amount);
int  rollDice(int sides);
int  calcDamage(int baseAttack);
bool isAlive(int hp);

int main() {
    srand(time(0));

    // Player stats
    string playerName = "Hero";
    int playerHP    = 100;
    int playerMaxHP = 100;
    int playerAtk   = 10;
    int playerLevel = 1;

    // Enemy stats
    string enemyName = "Goblin";
    int enemyHP    = 40;
    int enemyMaxHP = 40;
    int enemyAtk   = 6;

    cout << "A wild " << enemyName << " appears!" << endl;
    printDivider();

    // TODO: combat loop goes here (Step C)

    return 0;
}

// ── FUNCTION DEFINITIONS ────────────────────────────────────────────────────

void printDivider() {
    cout << "----------------------------------------" << endl;
}

void printStats(string name, int hp, int maxHP, int attack, int level) {
    cout << "[" << name << "]  HP: " << hp << "/" << maxHP
         << "  ATK: " << attack
         << "  LVL: " << level << endl;
}

bool isAlive(int hp) {
    return hp > 0;
}

int rollDice(int sides) {
    return rand() % sides + 1;
}
```

### ✅ Checkpoint 1: Compile & Run (2 pts)
1. Paste the starter code. Confirm it compiles with no errors.
2. You should see:  `A wild Goblin appears!`  followed by the divider line.
3. If you get errors, check for missing semicolons and mismatched parentheses.

---

## Step B — Write the Missing Functions

The prototypes are declared but three functions are missing their definitions. Add them below `printDivider()` in your code.

**B1: `void takeDamage(int &hp, int dmg)`**
- Subtract `dmg` from `hp` using pass by reference.
- Add a safety check: if `hp` drops below 0, set it to 0. (HP should never go negative.)
- Print nothing in this function — let `main` handle the output.

**B2: `void heal(int &hp, int maxHP, int amount)`**
- Add `amount` to `hp` using pass by reference.
- Cap `hp` at `maxHP` (don't let it exceed the maximum).
- Print nothing — just modify the value.

**B3: `int calcDamage(int baseAttack)`**
- Return a random damage value based on the attacker's `baseAttack`.
- Formula: roll a d6, then add `baseAttack`. → `damage = rollDice(6) + baseAttack`
- Damage will always be at least `baseAttack + 1` and at most `baseAttack + 6`.

### ✅ Checkpoint 2: Functions Written (3 pts)
1. `takeDamage()` modifies `hp` by reference and caps at 0.
2. `heal()` modifies `hp` by reference and caps at `maxHP`.
3. `calcDamage()` returns `rollDice(6) + baseAttack`.
4. **Quick test:** Call `takeDamage(playerHP, 25)` in `main` and print `playerHP` — it should now be 75.

---

## Step C — Build the Combat Loop

Replace the `TODO` comment in `main()` with the loop below.

```cpp
int round = 1;

while (isAlive(playerHP) && isAlive(enemyHP)) {
    cout << "\n=== Round " << round << " ===" << endl;
    printStats(playerName, playerHP, playerMaxHP, playerAtk, playerLevel);
    printStats(enemyName, enemyHP, enemyMaxHP, enemyAtk, 1);
    printDivider();

    // Player attacks
    int playerDmg = calcDamage(playerAtk);
    takeDamage(enemyHP, playerDmg);
    cout << playerName << " deals " << playerDmg << " damage!" << endl;

    if (!isAlive(enemyHP)) break;

    // Enemy attacks back
    int enemyDmg = calcDamage(enemyAtk);
    takeDamage(playerHP, enemyDmg);
    cout << enemyName << " deals " << enemyDmg << " damage!" << endl;

    round++;
}

// Win/lose outcome
printDivider();
if (isAlive(playerHP)) {
    cout << "Victory! You defeated the " << enemyName << "!" << endl;
} else {
    cout << "Defeated... The " << enemyName << " wins." << endl;
}
```

### ✅ Checkpoint 3: Combat Loop Working (5 pts)
1. The game runs through multiple rounds until one fighter reaches 0 HP.
2. Stats print each round and update correctly — HP decreases as expected.
3. The loop stops as soon as a fighter dies. The player doesn't take damage after the enemy dies.
4. Victory or defeat message prints at the end.
5. Run it 3 times — different dice rolls should produce different numbers of rounds.

---

## Step D — Day 1 Extension (if time remains)

All three checkpoints done? Try one or more of these:

- Add a second enemy type (Skeleton: 60 HP, 8 ATK) and let the player fight it after the Goblin.
- Add a `displayHP()` function that draws a visual HP bar using characters:  `[=====-----]`
- Track total damage dealt and print it after the battle.
- Make the enemy name and stats into variables you can easily swap out.

---
---

# DAY 2 — APRIL 15
## Expand the Engine

> **Day 2 goal:** You have a working 1v1 combat engine. Today you make it feel like a real RPG. You'll add three enemies in sequence, critical hits, dodge chance, and a one-use healing potion.
>
> **Start from your Day 1 code — continue in the same project. Do NOT start over.**
>
> New concepts you'll use today: `rand()` for chance, `&` for player stats that persist across fights, logical flow with `if/else`.

---

## Step E — Add Critical Hits and Dodge

**E1: Critical Hit (20% chance)**

Inside the player's attack section, roll a d10. If the result is 1 or 2 (20% chance), it's a critical hit that doubles the damage.

```cpp
// Inside the while loop, player attack section:
int playerDmg = calcDamage(playerAtk);
bool isCrit = (rollDice(10) <= 2);   // 20% chance
if (isCrit) playerDmg *= 2;

takeDamage(enemyHP, playerDmg);

if (isCrit)
    cout << "*** CRITICAL HIT! " << playerName << " deals " << playerDmg << " damage! ***" << endl;
else
    cout << playerName << " deals " << playerDmg << " damage." << endl;
```

**E2: Dodge (15% chance)**

Before the enemy deals damage, roll a d20. If the result is 1, 2, or 3, the player dodges completely.

```cpp
// Inside the while loop, enemy attack section:
bool dodged = (rollDice(20) <= 3);   // 15% chance
if (dodged) {
    cout << "You dodge the " << enemyName << "'s attack!" << endl;
} else {
    int enemyDmg = calcDamage(enemyAtk);
    takeDamage(playerHP, enemyDmg);
    cout << enemyName << " deals " << enemyDmg << " damage." << endl;
}
```

### ✅ Checkpoint 4: Crits & Dodge Working (3 pts)
1. Critical hits occasionally double damage with the special printed message.
2. Dodge occasionally skips enemy damage with a printed message.
3. Run 5 times — you should see crits or dodges appear sometimes, but not every run.

---

## Step F — Add a Healing Potion

The player gets one healing potion they can use during combat.

- Declare `bool hasPotion = true;` before the `while` loop.
- At the start of each round (before attacking), check if the player's HP is below 40% of `maxHP` AND they have a potion.
- If both are true: use the potion (heal 35 HP, set `hasPotion = false`, print a message).
- The potion is automatic for now — no player input required.

```cpp
bool hasPotion = true;   // declare before the while loop

// Inside the while loop, at the start of each round:
if (hasPotion && playerHP < (playerMaxHP * 0.4)) {
    heal(playerHP, playerMaxHP, 35);
    hasPotion = false;
    cout << "You drink a healing potion! HP restored to " << playerHP << endl;
}
```

### ✅ Checkpoint 5: Potion System Working (2 pts)
1. The potion triggers automatically when HP drops below 40%.
2. It only triggers once per game — `hasPotion` prevents a second use.
3. **Quick test:** Temporarily set `playerHP = 30` at the start of `main` to verify the potion fires immediately on Round 1.

---

## Step G — Three Enemies in Sequence

Wrap the combat loop in an outer loop so the player faces three enemies. Player HP carries over between fights.

**Enemy roster:**

| Enemy | HP | ATK |
|---|---|---|
| Goblin | 40 | 6 |
| Orc | 70 | 10 |
| Skeleton | 55 | 8 |

If the player dies mid-run, the outer loop stops — they don't face the next enemy.

```cpp
// Declare enemy data before the outer loop
string enemyNames[3] = {"Goblin", "Orc", "Skeleton"};
int enemyHPs[3]      = {40, 70, 55};
int enemyMaxHPs[3]   = {40, 70, 55};
int enemyAtks[3]     = {6, 10, 8};

// Outer loop: one iteration per enemy
for (int e = 0; e < 3 && isAlive(playerHP); e++) {
    string enemyName = enemyNames[e];
    int enemyHP    = enemyHPs[e];
    int enemyMaxHP = enemyMaxHPs[e];
    int enemyAtk   = enemyAtks[e];

    cout << "\n=== A wild " << enemyName << " appears! ===" << endl;
    printDivider();

    // ← your existing combat while loop goes here (unchanged)

    if (isAlive(playerHP)) {
        cout << enemyName << " defeated!" << endl;
        if (e < 2) cout << "Another enemy approaches..." << endl;
    }
}

// Final outcome
printDivider();
if (isAlive(playerHP)) {
    cout << "All enemies defeated! You are victorious!" << endl;
} else {
    cout << "You have fallen in the dungeon..." << endl;
}
```

### ✅ Checkpoint 6: Three-Enemy Gauntlet (5 pts)
1. Player fights all 3 enemies in sequence. HP carries over between fights.
2. If the player dies, the gauntlet ends immediately — no more enemies.
3. If all 3 enemies are defeated, the victory message prints.
4. Potion still works correctly — fires at most once across all three fights.
5. Crits and dodges still work in all three fights.

---

## Step H — Extensions (Early Finishers)

All six checkpoints done? Push the engine further:

- **Level Up:** After each enemy dies, call a `levelUp(&playerLevel, &playerMaxHP, &playerAtk)` function that bumps stats and fully heals the player.
- **Turn Counter:** Track how many rounds the entire gauntlet takes and print it at the end.
- **Poison:** 10% chance per round the player is poisoned (lose 3 extra HP that round). Cured automatically after 2 rounds.
- **Enemy AI Variation:** Instead of always attacking, the Skeleton sometimes "prepares" — skips its turn but doubles damage next round.
- **Custom Boss:** Design a 4th enemy with 120 HP and special mechanics of your own choosing.

---

## Grading Rubric — 15 Points

| Criteria | What to Show | Pts |
|---|---|---|
| Core functions use `&` correctly | `takeDamage`, `heal`, `calcDamage` all use reference parameters; HP caps work | 3 |
| Combat loop runs correctly | Rounds display, stats update, loop stops when HP hits 0 | 2 |
| Critical hit system | 20% chance, doubles damage, prints special message | 2 |
| Dodge system | 15% chance, skips enemy damage, prints message | 2 |
| Healing potion | Triggers below 40% HP, fires only once, uses `heal()` | 2 |
| Three-enemy gauntlet | All 3 fought in sequence, HP carries over, loop exits early on death | 3 |
| Code quality | Functions used instead of duplicated code; `srand` called once; clear names | 1 |
