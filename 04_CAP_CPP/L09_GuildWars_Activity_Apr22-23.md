# Guild Wars — Class-Based Combat System
### Lesson 9 Activity | Classes, Constructors & Methods
### 15 Points | Accuracy Graded

---

# DAY 1 — APRIL 22 (second half of class)
## Build the Hero and Enemy Classes

> Start this after finishing the self-guided notes. Today you convert the struct-based Hero and Enemy from Lesson 8 into proper classes with constructors, private data, and methods. Tomorrow you run them through a full guild vs. dungeon combat simulation.
>
> **Reference:** Lesson 9 notes — keep them open. Your Lesson 8 HeroForge project is also a useful reference for the logic you're rebuilding.

---

## Step A — Project Setup

Create a new CLion project called `GuildWars`. Paste this starter into `main.cpp`.

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <ctime>
using namespace std;

// ── ENUMS ──────────────────────────────────────────────────────────────────
enum class HeroClass { Warrior, Mage, Ranger };
enum class EnemyType { Goblin, Skeleton, Troll };

// ── FORWARD DECLARATIONS ───────────────────────────────────────────────────
class Hero;
class Enemy;

// ── FREE FUNCTION PROTOTYPES ───────────────────────────────────────────────
int  rollDice(int sides);
int  calcDamage(int baseAttack);
void runFight(Hero &hero, Enemy &enemy);
void printDivider();

// ── HERO CLASS ─────────────────────────────────────────────────────────────
class Hero {
private:
    int hp;
    int maxHP;

public:
    string    name;
    HeroClass heroClass;
    int       attack;
    int       level;
    int       wins;

    Hero(string n, HeroClass cls);   // defined below main

    // TODO: method declarations (Step B)
};

// ── ENEMY CLASS ────────────────────────────────────────────────────────────
class Enemy {
private:
    int hp;
    int maxHP;

public:
    string    name;
    EnemyType type;
    int       attack;

    Enemy(string n, EnemyType t);   // defined below main

    // TODO: method declarations (Step C)
};

// ── MAIN ───────────────────────────────────────────────────────────────────
int main() {
    srand(time(0));

    // TODO: Day 1 work goes here
    return 0;
}

// ── FREE FUNCTIONS ─────────────────────────────────────────────────────────
int rollDice(int sides)        { return rand() % sides + 1; }
int calcDamage(int baseAttack) { return rollDice(6) + baseAttack; }
void printDivider()            { cout << "----------------------------------------" << endl; }

// ── CONSTRUCTOR DEFINITIONS ────────────────────────────────────────────────
Hero::Hero(string n, HeroClass cls) {
    name      = n;
    heroClass = cls;
    level     = 1;
    wins      = 0;

    if      (cls == HeroClass::Warrior) { maxHP = 110; attack = 18; }
    else if (cls == HeroClass::Mage)    { maxHP = 80;  attack = 14; }
    else                                { maxHP = 90;  attack = 12; }

    hp = maxHP;
}

Enemy::Enemy(string n, EnemyType t) {
    name = n;
    type = t;

    if      (t == EnemyType::Goblin)   { maxHP = 45;  attack = 7;  }
    else if (t == EnemyType::Skeleton) { maxHP = 60;  attack = 10; }
    else                               { maxHP = 90;  attack = 14; }

    hp = maxHP;
}
```

### ✅ Checkpoint 1: Compiles Clean (1 pt)
The starter compiles with no errors or warnings about undefined methods — those are coming next.

---

## Step B — Hero Methods

Add these method declarations inside the `Hero` class (in the `// TODO` section), then write their definitions below the constructor definitions at the bottom of the file.

**`int getHP()`** — returns `hp`

**`int getMaxHP()`** — returns `maxHP`

**`void takeDamage(int dmg)`** — subtracts `dmg` from `hp`, caps at 0

**`void heal(int amount)`** — adds `amount` to `hp`, caps at `maxHP`

**`void levelUp()`** — increments `level`, adds 10 to `maxHP`, adds 2 to `attack`, fully heals. Prints: `"[name] leveled up! Now LVL X"`

**`bool isAlive()`** — returns `hp > 0`

**`string className()`** — returns `"Warrior"`, `"Mage"`, or `"Ranger"` based on `heroClass`

**`void print()`** — prints one formatted line:
```
[Aria | Mage]  HP: 80/80  ATK: 14  LVL: 1  Wins: 0
```

Method definitions outside the class use the `Hero::` prefix:

```cpp
int Hero::getHP() {
    return hp;
}

void Hero::takeDamage(int dmg) {
    hp -= dmg;
    if (hp < 0) hp = 0;
}

// ... and so on for each method
```

### ✅ Checkpoint 2: Hero Methods Work (4 pts)
In `main`, create a hero and test each method:

```cpp
Hero h("Aria", HeroClass::Mage);
h.print();
h.takeDamage(30);
h.print();
h.heal(10);
h.print();
h.levelUp();
h.print();
cout << "Alive: " << h.isAlive() << endl;
```

Each call should produce the correct output. Confirm `hp` can't go below 0 and can't exceed `maxHP`.

---

## Step C — Enemy Methods

Add and define these methods for the `Enemy` class using the same `Enemy::` prefix pattern.

**`int getHP()`** — returns `hp`

**`int getMaxHP()`** — returns `maxHP`

**`void takeDamage(int dmg)`** — subtracts `dmg` from `hp`, caps at 0

**`bool isAlive()`** — returns `hp > 0`

**`string typeName()`** — returns `"Goblin"`, `"Skeleton"`, or `"Troll"`

**`void print()`** — prints one formatted line:
```
{Krag | Troll}  HP: 90/90  ATK: 14
```

### ✅ Checkpoint 3: Enemy Methods Work (2 pts)
In `main`, create an enemy and test:

```cpp
Enemy e("Krag", EnemyType::Troll);
e.print();
e.takeDamage(50);
e.print();
cout << "Alive: " << e.isAlive() << endl;
```

---

## Step D — Build the Roster & Print It

In `main`, build a party of three heroes and a dungeon of three enemies using the constructors. Print both rosters.

```cpp
vector<Hero> guild;
guild.push_back(Hero("Aria",  HeroClass::Mage));
guild.push_back(Hero("Brom",  HeroClass::Warrior));
guild.push_back(Hero("Celia", HeroClass::Ranger));

vector<Enemy> dungeon;
dungeon.push_back(Enemy("Grub",    EnemyType::Goblin));
dungeon.push_back(Enemy("Rattler", EnemyType::Skeleton));
dungeon.push_back(Enemy("Krag",    EnemyType::Troll));

cout << "=== Guild ===" << endl;
for (Hero &h : guild)    h.print();

cout << "\n=== Dungeon ===" << endl;
for (Enemy &e : dungeon) e.print();
```

### ✅ Checkpoint 4: Rosters Display (1 pt)
All six entities print correctly formatted with proper stats for their class/type.

---

## Day 1 Extension (if time remains)

- Add a `private` `string guild` field to `Hero` with a getter `getGuild()` and a setter `setGuild(string g)`. Assign guilds in `main` and display them in `print()`.
- Add a default constructor `Hero()` that sets all values to safe defaults (empty string, 1 HP, etc.).
- Add a method `void resetHP()` that fully heals the hero back to `maxHP`.

---
---

# DAY 2 — APRIL 23
## Run the Guild vs. Dungeon Simulation

> Continue in the same project. Today you write the `runFight` function and the full simulation loop — each hero in the guild takes on each enemy in the dungeon.

---

## Step E — Write `runFight`

Fill in the `runFight` function (prototype is already declared). It runs a complete round-by-round fight between one hero and one enemy and handles the outcome.

```cpp
void runFight(Hero &hero, Enemy &enemy) {
    cout << "\n--- " << hero.name << " vs " << enemy.name << " ---" << endl;

    int round = 1;
    while (hero.isAlive() && enemy.isAlive()) {
        int heroDmg  = calcDamage(hero.attack);
        int enemyDmg = calcDamage(enemy.attack);

        enemy.takeDamage(heroDmg);
        hero.takeDamage(enemyDmg);

        cout << "Round " << round << ":  "
             << hero.name  << " deals " << heroDmg  << " → " << enemy.name << " HP " << enemy.getHP() << "  |  "
             << enemy.name << " deals " << enemyDmg << " → " << hero.name  << " HP " << hero.getHP()  << endl;

        round++;
    }

    printDivider();
    if (hero.isAlive()) {
        cout << hero.name << " defeats " << enemy.name << "!" << endl;
        hero.wins++;
        hero.levelUp();
    } else {
        cout << hero.name << " is defeated by " << enemy.name << "." << endl;
    }
}
```

### ✅ Checkpoint 5: One Fight Runs (2 pts)
In `main`, call `runFight(guild[0], dungeon[0])`. The round log should print with both sides taking damage each round. The correct win/loss message should appear, and if the hero wins, `levelUp()` should fire and print.

---

## Step F — The Full Simulation

Replace your `main` test code with the full guild-vs-dungeon loop. Each enemy must be defeated by *someone* in the guild. Heroes who are already dead are skipped. A hero who wins levels up before the next fight.

```cpp
cout << "\n========== GUILD WARS BEGINS ==========" << endl;

cout << "\n=== Guild ===" << endl;
for (Hero &h : guild) h.print();

cout << "\n=== Dungeon ===" << endl;
for (Enemy &e : dungeon) e.print();
printDivider();

int dungeonCleared = 0;

for (int e = 0; e < (int)dungeon.size(); e++) {
    cout << "\n*** Encounter: ";
    dungeon[e].print();

    bool enemyDefeated = false;

    for (int h = 0; h < (int)guild.size(); h++) {
        if (!guild[h].isAlive()) {
            cout << guild[h].name << " is down — skipping." << endl;
            continue;
        }

        runFight(guild[h], dungeon[e]);

        if (!dungeon[e].isAlive()) {
            enemyDefeated = true;
            dungeonCleared++;
            break;
        }
    }

    if (!enemyDefeated) {
        cout << "The entire guild fell to " << dungeon[e].name << "!" << endl;
        break;
    }
}

cout << "\n========== GUILD WARS OVER ==========" << endl;
cout << "\nFinal Guild Status:" << endl;
for (Hero &h : guild) h.print();

cout << "\nDungeon rooms cleared: " << dungeonCleared << " / " << dungeon.size() << endl;

if (dungeonCleared == (int)dungeon.size())
    cout << "The guild conquers the dungeon!" << endl;
else
    cout << "The dungeon stands unconquered..." << endl;
```

### ✅ Checkpoint 6: Full Simulation Runs (4 pts)
1. Each enemy is fought by the first living hero in the guild.
2. Defeated heroes are skipped with the "down — skipping" message.
3. A winning hero levels up between fights — stats increase and show in their next `print()`.
4. The final guild status shows updated HP and level for all heroes, and the cleared count is accurate.

---

## Step G — Class Bonus Abilities (choose at least one)

Pick at least one ability to add before submitting. These reward understanding the class structure.

**Warrior — Shield Block:** 20% chance to take 0 damage on any incoming hit. Add the roll inside `takeDamage` when `heroClass == HeroClass::Warrior`. Print: `"[name] blocks the hit!"`

**Mage — Spell Burst:** Every third round, the Mage deals an extra `rollDice(8)` bonus damage. Track round number inside `runFight` and apply the bonus when `round % 3 == 0`. Print: `"[name] casts Spell Burst!"`

**Ranger — Double Shot:** 25% chance to attack twice in one round. Add the second roll and second `takeDamage` call in `runFight` when `heroClass == HeroClass::Ranger`. Print: `"[name] fires twice!"`

### ✅ Checkpoint 7: At Least One Class Ability Working (1 pt)
Run the simulation and confirm the ability fires at least once during a fight with the correct printed message and mechanical effect.

---

## Extensions (Early Finishers)

- Add a fourth enemy type `EnemyType::Dragon` with 130 HP and 20 ATK as a final boss that only appears if the guild clears all three rooms.
- Add a `private` `int goldEarned` field to `Hero` with a getter. Award gold on wins (Goblin = 10, Skeleton = 20, Troll = 35) and display total at the end.
- Add a `void rest()` method to `Hero` that heals 25 HP (capped at `maxHP`) — call it on every living hero between dungeon rooms.

---

## Grading Rubric — 15 Points

| Criteria | What to Show | Pts |
|---|---|---|
| Compiles clean | No errors in starter; class structure intact | 1 |
| Hero methods | All 7 methods defined, `hp`/`maxHP` private, caps work, `print()` formats correctly | 4 |
| Enemy methods | All 5 methods defined, `hp`/`maxHP` private, caps work, `print()` formats correctly | 2 |
| Rosters display | Guild and dungeon both print with correct stats | 1 |
| One fight runs | `runFight` logs rounds, hero wins increment `wins`, `levelUp` fires on victory | 2 |
| Full simulation | Defeated heroes skipped, enemies cleared in order, final summary accurate | 4 |
| Class ability | At least one class-specific ability implemented and observable during play | 1 |
