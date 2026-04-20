# Lesson 8: Structs & Enums
### Self-Guided Notes | Monday, April 20, 2026
### Work through this first — activity starts when you're done

---

> **Goal:** Get through all four parts and the self-check before starting the activity. These concepts are the foundation of how real games organize data — every entity in a game (player, enemy, item) is essentially a struct.

---

## Part 1: The Problem — Too Many Variables

Look at how you've been tracking a character so far:

```cpp
string playerName  = "Hero";
int    playerHP    = 100;
int    playerMaxHP = 100;
int    playerAtk   = 10;
int    playerLevel = 1;
```

That's five separate variables for one character. Add a second character and you have ten. Add an enemy roster and it falls apart completely. There's no connection between these variables — the compiler doesn't know they belong together.

A **struct** solves this by grouping related data into a single custom type.

---

## Part 2: Defining and Using a Struct

```cpp
struct Hero {
    string name;
    int hp;
    int maxHP;
    int attack;
    int level;
};   // <-- semicolon required after the closing brace
```

This defines a new type called `Hero`. Create variables of that type and access their fields with the **dot operator**:

```cpp
Hero player;
player.name   = "Aria";
player.hp     = 100;
player.maxHP  = 100;
player.attack = 12;
player.level  = 1;

cout << player.name << " — HP: " << player.hp << "/" << player.maxHP << endl;
```

You can also initialize all fields at once with braces:

```cpp
Hero player = {"Aria", 100, 100, 12, 1};
```

**▶ TRY IT — Run this:**

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Hero {
    string name;
    int hp;
    int maxHP;
    int attack;
    int level;
};

int main() {
    Hero player = {"Aria", 100, 100, 12, 1};
    cout << player.name << " — HP: " << player.hp << "/" << player.maxHP << endl;
    cout << "ATK: " << player.attack << "  LVL: " << player.level << endl;

    player.level++;
    player.maxHP += 10;
    player.hp = player.maxHP;
    cout << "Leveled up! Now LVL " << player.level << ", Max HP " << player.maxHP << endl;
    return 0;
}
```

---

## Part 3: Structs with Functions and Vectors

Structs follow the same rules as other types — pass by `&` to modify, `const &` to read.

```cpp
void printHero(const Hero &h) {
    cout << "[" << h.name << "]  HP: " << h.hp << "/" << h.maxHP
         << "  ATK: " << h.attack << "  LVL: " << h.level << endl;
}

void takeDamage(Hero &h, int dmg) {
    h.hp -= dmg;
    if (h.hp < 0) h.hp = 0;
}

bool isAlive(const Hero &h) {
    return h.hp > 0;
}
```

Structs work seamlessly with vectors:

```cpp
vector<Hero> party;
party.push_back({"Aria",  100, 100, 12, 1});
party.push_back({"Brom",  80,  80,  18, 1});
party.push_back({"Celia", 120, 120, 8,  1});

for (const Hero &h : party) {
    printHero(h);
}
```

**▶ TRY IT — Add `printHero` above `main` and loop through a party of three heroes. Print each one.**

> 🤔 Why use `const Hero &h` instead of `Hero h` as the parameter for `printHero`?
>
> _______________________________________________

---

## Part 4: Enums — Named Categories

An **enum** (enumeration) defines a set of named constants. Instead of magic numbers or raw strings to represent categories, you give them meaningful names.

```cpp
enum class ItemType  { Weapon, Armor, Consumable, Quest };
enum class Direction { North, South, East, West };
enum class GameState { Title, Playing, GameOver, Victory };
```

Use `enum class` (scoped enum) — it prevents name collisions and makes your intent clear.

```cpp
ItemType equipped = ItemType::Weapon;

if (equipped == ItemType::Weapon) {
    cout << "Weapon equipped!" << endl;
}
```

Combine enums with structs to model game objects cleanly:

```cpp
struct Item {
    string   name;
    ItemType type;
    int      value;
};

Item sword  = {"Iron Sword",    ItemType::Weapon,     15};
Item potion = {"Health Potion", ItemType::Consumable, 50};
```

**▶ TRY IT — Run this. Then add a third item of type `ItemType::Quest` and print it.**

```cpp
#include <iostream>
#include <string>
using namespace std;

enum class ItemType { Weapon, Armor, Consumable, Quest };

struct Item {
    string   name;
    ItemType type;
    int      value;
};

string itemTypeName(ItemType t) {
    if (t == ItemType::Weapon)     return "Weapon";
    if (t == ItemType::Armor)      return "Armor";
    if (t == ItemType::Consumable) return "Consumable";
    return "Quest";
}

int main() {
    Item sword  = {"Iron Sword",    ItemType::Weapon,     15};
    Item potion = {"Health Potion", ItemType::Consumable, 50};

    cout << sword.name  << " [" << itemTypeName(sword.type)  << "]" << endl;
    cout << potion.name << " [" << itemTypeName(potion.type) << "]" << endl;
    return 0;
}
```

---

## Self-Check — No Grade

1. What's wrong with storing character data in five separate variables? How does a struct fix it?
2. What does the dot operator (`.`) do?
3. Why does a struct definition need a semicolon after the closing `}`?
4. When would you use an `enum class` instead of a plain `int` or `string`?
5. Write a struct called `Enemy` with fields: `name` (string), `hp` (int), `maxHP` (int), `attack` (int), and a field using an enum of your own design.

---

**Done? Flip to the activity and start Step A.**
