# Lesson 9: Classes, Constructors & Methods
### Self-Guided Notes | Wednesday, April 22, 2026
### Work through this first — activity starts when you're done

---

> **Goal:** Get through all five parts and the self-check before starting the activity. Classes are the next step beyond structs — same idea of grouping data, but now the data and the functions that operate on it live together in one place.

---

## Part 1: Structs vs. Classes — What's the Difference?

Last lesson you wrote structs like this:

```cpp
struct Hero {
    string name;
    int hp;
    int attack;
};

void takeDamage(Hero &h, int dmg) { h.hp -= dmg; }
void printHero(const Hero &h)     { cout << h.name << endl; }
```

The data and the functions are separate. You have to remember to pass the struct to every function. A **class** bundles the data and its functions together — the functions become **methods** that belong to the object.

```cpp
class Hero {
public:
    string name;
    int hp;
    int attack;

    void takeDamage(int dmg) { hp -= dmg; }   // no parameter needed — hp is already "here"
    void print()             { cout << name << "  HP: " << hp << endl; }
};
```

The key word is `public:` — it means these members are accessible from outside the class. You'll see `private:` in Part 4.

---

## Part 2: Constructors

A **constructor** is a special method that runs automatically when an object is created. It has the same name as the class and no return type.

```cpp
class Hero {
public:
    string name;
    int hp;
    int maxHP;
    int attack;
    int level;

    // Constructor
    Hero(string n, int hp_, int atk) {
        name   = n;
        hp     = hp_;
        maxHP  = hp_;
        attack = atk;
        level  = 1;
    }

    void print() {
        cout << "[" << name << "]  HP: " << hp << "/" << maxHP
             << "  ATK: " << attack << "  LVL: " << level << endl;
    }
};
```

Now creating a hero looks like calling a function:

```cpp
Hero player("Aria", 100, 12);   // constructor fires automatically
player.print();
```

**▶ TRY IT — Run this:**

```cpp
#include <iostream>
#include <string>
using namespace std;

class Hero {
public:
    string name;
    int hp, maxHP, attack, level;

    Hero(string n, int hp_, int atk) {
        name = n; hp = hp_; maxHP = hp_; attack = atk; level = 1;
    }

    void print() {
        cout << "[" << name << "]  HP: " << hp << "/" << maxHP
             << "  ATK: " << attack << "  LVL: " << level << endl;
    }
};

int main() {
    Hero player("Aria", 100, 12);
    player.print();

    player.hp -= 25;
    player.print();
    return 0;
}
```

```
[Aria]  HP: 100/100  ATK: 12  LVL: 1
[Aria]  HP: 75/100   ATK: 12  LVL: 1
```

---

## Part 3: Methods — Functions That Belong to the Class

Any function defined inside a class is a **method**. It has direct access to the class's data — no parameters needed for the object itself.

```cpp
class Hero {
public:
    string name;
    int hp, maxHP, attack, level;

    Hero(string n, int hp_, int atk) {
        name = n; hp = hp_; maxHP = hp_; attack = atk; level = 1;
    }

    void takeDamage(int dmg) {
        hp -= dmg;
        if (hp < 0) hp = 0;
    }

    void heal(int amount) {
        hp += amount;
        if (hp > maxHP) hp = maxHP;
    }

    void levelUp() {
        level++;
        maxHP += 10;
        attack += 2;
        hp = maxHP;   // full heal on level up
        cout << name << " leveled up! Now LVL " << level << endl;
    }

    bool isAlive() {
        return hp > 0;
    }

    void print() {
        cout << "[" << name << "]  HP: " << hp << "/" << maxHP
             << "  ATK: " << attack << "  LVL: " << level << endl;
    }
};
```

Calling a method uses the dot operator — same as structs:

```cpp
Hero player("Brom", 110, 18);
player.takeDamage(40);
player.heal(15);
player.levelUp();
player.print();
```

**▶ TRY IT — Add `takeDamage`, `heal`, `levelUp`, and `isAlive` to your class from Part 2. Test each one in `main`.**

> 🤔 What's the difference between calling `takeDamage(hero, 40)` (the old struct way) and `hero.takeDamage(40)` (the class way)?
>
> _______________________________________________

---

## Part 4: Public vs. Private

`public` members can be accessed from anywhere. `private` members can only be accessed from inside the class — outside code can't read or change them directly.

```cpp
class Hero {
private:
    int hp;      // outside code can't do: player.hp = 9999
    int maxHP;

public:
    string name;
    int attack;
    int level;

    Hero(string n, int hp_, int atk) {
        name = n; hp = hp_; maxHP = hp_; attack = atk; level = 1;
    }

    // Controlled access via methods
    int getHP()    { return hp; }
    int getMaxHP() { return maxHP; }

    void takeDamage(int dmg) {
        hp -= dmg;
        if (hp < 0) hp = 0;
    }

    void print() {
        cout << "[" << name << "]  HP: " << hp << "/" << maxHP << endl;
    }
};
```

Methods that just return a private value are called **getters**. Methods that safely change a private value are called **setters**.

> 📌 **Why bother?** Private data prevents bugs where outside code accidentally sets HP to a negative number or skips the safety cap. The class controls its own data.

**▶ TRY IT — In `main`, try to write `player.hp = 9999;` with `hp` marked `private`. What error do you get? Then use `player.getHP()` instead.**

---

## Part 5: Classes in Vectors

Classes work in vectors exactly like structs did:

```cpp
vector<Hero> party;
party.push_back(Hero("Aria",  80,  14));
party.push_back(Hero("Brom",  110, 18));
party.push_back(Hero("Celia", 90,  12));

for (Hero &h : party) {
    h.print();
}
```

> ⚠️ Use `Hero &h` (reference) in the range-based loop — not `Hero h`. Without `&`, you get a copy and any changes you make inside the loop won't affect the original.

**▶ TRY IT — Build a party of three, loop through and call `takeDamage(20)` on each, then loop again and print. Confirm all three lost 20 HP.**

---

## Self-Check — No Grade

1. What's the main difference between a struct and a class in terms of how data and behavior are organized?
2. What is a constructor? When does it run?
3. If `hp` is `private`, how can outside code read its value?
4. Why use `Hero &h` instead of `Hero h` in a range-based for loop over a `vector<Hero>`?
5. Write a class called `Enemy` with private `hp` and `maxHP`, a constructor, and a `takeDamage(int dmg)` method.

---

**Done? Flip to the activity and start Step A.**
