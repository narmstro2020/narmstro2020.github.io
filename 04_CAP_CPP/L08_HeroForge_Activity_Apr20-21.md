# Hero Forge — Party Builder & Combat Sim
### Lesson 8 Activity | Structs & Enums
### 15 Points | Accuracy Graded

---

# DAY 1 — APRIL 20 (second half of class)
## Define the Data, Build the Party

> Start this after finishing the self-guided notes. Today you define the structs and enums that describe your game world, build a party of heroes, and write the functions that display and modify them. Tomorrow you pit that party against an enemy roster in a full combat simulation.
>
> **Reference:** Lesson 8 notes — keep them open.

---

## Step A — Project Setup

Create a new CLion project called `HeroForge`. Paste this starter into `main.cpp`. It includes all the types and prototypes you'll fill in today.

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <ctime>
using namespace std;

// ── ENUMS ──────────────────────────────────────────────────────────────────
enum class HeroClass  { Warrior, Mage, Ranger };
enum class EnemyType  { Goblin, Skeleton, Troll, Dragon };
enum class BattleResult { Victory, Defeat, Ongoing };

// ── STRUCTS ────────────────────────────────────────────────────────────────
struct Hero {
    string    name;
    HeroClass heroClass;
    int       hp;
    int       maxHP;
    int       attack;
    int       level;
};

struct Enemy {
    string    name;
    EnemyType type;
    int       hp;
    int       maxHP;
    int       attack;
};

// ── PROTOTYPES ─────────────────────────────────────────────────────────────
string heroClassName(HeroClass c);
string enemyTypeName(EnemyType t);
void   printHero(const Hero &h);
void   printEnemy(const Enemy &e);
void   printParty(const vector<Hero> &party);
void   takeDamage(Hero &h, int dmg);
void   takeDamage(Enemy &e, int dmg);   // same name, different parameter type
bool   isAlive(const Hero &h);
bool   isAlive(const Enemy &e);
int    rollDice(int sides);
int    calcDamage(int baseAttack);
Hero   createHero(string name, HeroClass cls);

int main() {
    srand(time(0));

    // TODO: Day 1 work goes here
    return 0;
}
```

### ✅ Checkpoint 1: Compiles Clean (1 pt)
The starter compiles with no errors. You'll see warnings about unused functions — that's fine for now.

---

## Step B — Name Helpers & Print Functions

Write these functions above `main()`. They turn enum values into readable strings and display struct data neatly.

**`string heroClassName(HeroClass c)`**
Return `"Warrior"`, `"Mage"`, or `"Ranger"` based on `c`. Use `if` statements.

**`string enemyTypeName(EnemyType t)`**
Return `"Goblin"`, `"Skeleton"`, `"Troll"`, or `"Dragon"` based on `t`.

**`void printHero(const Hero &h)`**
Print one line per hero. Example:
```
[Aria | Mage]  HP: 80/80  ATK: 14  LVL: 1
```

**`void printEnemy(const Enemy &e)`**
Print one line per enemy. Example:
```
{Krag | Troll}  HP: 90/90  ATK: 16
```

**`void printParty(const vector<Hero> &party)`**
Print a header, then call `printHero` for each hero in the party. Example:
```
=== Party ===
[Aria  | Mage]     HP: 80/80   ATK: 14  LVL: 1
[Brom  | Warrior]  HP: 110/110 ATK: 18  LVL: 1
[Celia | Ranger]   HP: 90/90   ATK: 12  LVL: 1
```

### ✅ Checkpoint 2: Display Functions Work (3 pts)
In `main`, create one `Hero` and one `Enemy` manually and call `printHero` and `printEnemy` on them. Both should print formatted output matching the examples above.

---

## Step C — Game Logic Functions

Write these four functions. You've written versions of most of them before — now they work on structs.

**`void takeDamage(Hero &h, int dmg)`**
Subtract `dmg` from `h.hp`. Cap at 0.

**`void takeDamage(Enemy &e, int dmg)`**
Same logic, but for an `Enemy`. Notice: C++ allows two functions with the same name if their parameters differ — this is called **overloading**.

**`bool isAlive(const Hero &h)`**
Return `h.hp > 0`.

**`bool isAlive(const Enemy &e)`**
Return `e.hp > 0`.

**`int rollDice(int sides)`**
Return `rand() % sides + 1`.

**`int calcDamage(int baseAttack)`**
Return `rollDice(6) + baseAttack`.

### ✅ Checkpoint 3: Logic Functions Work (2 pts)
Test in `main`: create a `Hero`, call `takeDamage(hero, 30)`, and print their HP. Should drop by 30. Call `isAlive` and print the result. Call `takeDamage` again with 9999 and confirm HP floors at 0, not a negative number.

---

## Step D — `createHero` & Build the Party

Write `Hero createHero(string name, HeroClass cls)`. This function returns a fully initialized `Hero` struct with stats based on the class:

| Class | maxHP | attack |
|---|---|---|
| `Warrior` | 110 | 18 |
| `Mage` | 80 | 14 |
| `Ranger` | 90 | 12 |

Set `hp = maxHP`, `level = 1`. Use `if` statements on `cls` to assign the right stats.

In `main`, build a party of three heroes — one of each class — and print the full party:

```cpp
vector<Hero> party;
party.push_back(createHero("Aria",  HeroClass::Mage));
party.push_back(createHero("Brom",  HeroClass::Warrior));
party.push_back(createHero("Celia", HeroClass::Ranger));

printParty(party);
```

### ✅ Checkpoint 4: Party Builds & Displays (3 pts)
1. `createHero` returns correct stats for each class.
2. All three heroes appear in `printParty` output with correct HP, ATK, and class label.
3. Manually change `party[0].hp` to 40 and reprint — the change should show.

---

## Day 1 Extension (if time remains)

- Add a fourth hero class (`Cleric`: 95 HP, 10 ATK) and add a member to `HeroClass`.
- Add a `gold` field to the `Hero` struct and a `giveGold(Hero &h, int amount)` function.
- Write a `findHero(const vector<Hero> &party, string name)` function that returns the index of the hero with that name, or `-1` if not found.

---
---

# DAY 2 — APRIL 21
## Run the Combat Simulation

> Continue in the same project. Today you build an enemy roster and run each hero in your party through a 1v1 fight. The party's HP carries over — heroes who get hurt stay hurt for their next fight.

---

## Step E — Build the Enemy Roster

Write a helper function `Enemy createEnemy(string name, EnemyType type)` that returns a fully initialized `Enemy` with stats based on type:

| Type | maxHP | attack |
|---|---|---|
| `Goblin` | 45 | 7 |
| `Skeleton` | 60 | 10 |
| `Troll` | 90 | 14 |
| `Dragon` | 130 | 20 |

Add its prototype next to the others. Then in `main`, build the enemy roster:

```cpp
vector<Enemy> enemies;
enemies.push_back(createEnemy("Grub",    EnemyType::Goblin));
enemies.push_back(createEnemy("Rattler", EnemyType::Skeleton));
enemies.push_back(createEnemy("Krag",    EnemyType::Troll));
```

Print the roster using a loop and `printEnemy`.

### ✅ Checkpoint 5: Enemy Roster Displays (1 pt)
Three enemies print with correct names, types, HP, and ATK values.

---

## Step F — The Combat Function

Write this function above `main`. It runs a complete 1v1 fight between one hero and one enemy and returns a `BattleResult`.

```cpp
BattleResult fight(Hero &hero, Enemy &enemy) {
    cout << "\n--- " << hero.name << " vs " << enemy.name << " ---" << endl;

    int round = 1;
    while (isAlive(hero) && isAlive(enemy)) {
        cout << "Round " << round << ": ";

        // Hero attacks
        int heroDmg = calcDamage(hero.attack);
        takeDamage(enemy, heroDmg);
        cout << hero.name << " deals " << heroDmg << " dmg. "
             << enemy.name << " HP: " << enemy.hp << "  |  ";

        if (!isAlive(enemy)) break;

        // Enemy attacks back
        int enemyDmg = calcDamage(enemy.attack);
        takeDamage(hero, enemyDmg);
        cout << enemy.name << " deals " << enemyDmg << " dmg. "
             << hero.name << " HP: " << hero.hp << endl;

        round++;
    }

    cout << endl;
    if (isAlive(hero)) {
        cout << hero.name << " wins!" << endl;
        return BattleResult::Victory;
    } else {
        cout << hero.name << " is defeated." << endl;
        return BattleResult::Defeat;
    }
}
```

Add `BattleResult fight(Hero &hero, Enemy &enemy);` to your prototypes.

### ✅ Checkpoint 6: One Fight Runs (2 pts)
In `main`, call `fight(party[0], enemies[0])`. The round-by-round log should print, and a win or loss message should appear at the end. HP on both sides should decrease each round.

---

## Step G — The Gauntlet Loop

Now wire up the full simulation: each hero in the party fights each enemy in order. A hero who falls in battle is skipped for subsequent fights. The party's HP carries over throughout.

```cpp
cout << "\n========== GAUNTLET BEGINS ==========" << endl;
printParty(party);

int partyWins = 0;

for (int e = 0; e < enemies.size(); e++) {
    cout << "\n*** Enemy " << (e + 1) << ": ";
    printEnemy(enemies[e]);

    for (int h = 0; h < party.size(); h++) {
        if (!isAlive(party[h])) {
            cout << party[h].name << " is already defeated — skipping." << endl;
            continue;
        }

        BattleResult result = fight(party[h], enemies[e]);
        if (result == BattleResult::Victory) {
            partyWins++;
            break;   // enemy is dead — move to next enemy
        }
    }
}

cout << "\n========== GAUNTLET OVER ==========" << endl;
printParty(party);
cout << "Party wins: " << partyWins << " / " << enemies.size() << endl;

if (partyWins == (int)enemies.size())
    cout << "The party clears the dungeon!" << endl;
else
    cout << "The dungeon claims the party..." << endl;
```

### ✅ Checkpoint 7: Full Gauntlet Runs (4 pts)
1. Each enemy is fought in order. The first living hero in the party takes the fight.
2. A hero who has been knocked out is skipped with the "already defeated" message.
3. Hero HP carries over between fights — they don't reset.
4. The final party summary shows updated HP for all heroes, and the win count is correct.

---

## Step H — Extensions (Early Finishers)

- **Level up on victory:** When a hero wins a fight, increment their `level` and increase `maxHP` by 10 and `attack` by 2.
- **Heal between fights:** After each enemy is defeated, heal every living hero by 20 HP (use a loop, cap at `maxHP`).
- **Critical hits:** 15% chance (roll d20 ≤ 3) for a hero to deal double damage. Print a `*** CRIT! ***` message.
- **Class bonus:** Warriors ignore 2 points of incoming damage. Mages deal `rollDice(8)` bonus damage. Rangers have a 20% chance to attack twice.
- **Boss fight:** Add a Dragon as a 4th enemy. If the entire party is wiped before reaching it, skip the boss and print a special "The Dragon remains unkilled..." message.

---

## Grading Rubric — 15 Points

| Criteria | What to Show | Pts |
|---|---|---|
| Compiles clean | No errors in starter code | 1 |
| Display functions | `printHero`, `printEnemy`, `printParty` all format output correctly | 3 |
| Logic functions | `takeDamage` (both overloads) cap at 0; `isAlive` returns correct bool | 2 |
| `createHero` & party | Stats match the class table; party of three builds and prints correctly | 3 |
| Enemy roster | `createEnemy` stats correct; three enemies display properly | 1 |
| One fight runs | `fight()` logs rounds correctly; returns `Victory` or `Defeat` accurately | 2 |
| Full gauntlet | HP carries over; defeated heroes skipped; win count and final summary correct | 3 |
