# Lesson 5: Intro to Functions — Guided Notes

**Date:** Friday, April 10, 2026
**Unit 3: Functions | Day 1 of 2**
**Points:** 5 (completion)

> ✏️ Fill in the blanks as we go. Type every code example into CLion and run it.
> Today we learn how to organize code into reusable pieces called functions.

---

## Part 1: Why Functions?

Look at this code from your Monster Battle:

```cpp
// Player HP bar
cout << "Player:  [";
for (int i = 0; i < 10; i++) {
    if (i < playerHP / 10) cout << "#";
    else cout << ".";
}
cout << "]  " << playerHP << "/" << playerMaxHP << " HP" << endl;

// Monster HP bar
cout << "Monster: [";
for (int i = 0; i < 10; i++) {
    if (i < monsterHP / 10) cout << "#";
    else cout << ".";
}
cout << "]  " << monsterHP << "/" << monsterMaxHP << " HP" << endl;
```

What's the problem? The code is almost \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ — we wrote the same HP bar logic twice.

What if we had 5 enemies? We'd copy/paste it \_\_\_\_\_\_ times. What if we wanted to change the bar to 20 characters wide? We'd have to change it in \_\_\_\_\_\_ places.

A **function** is a named block of code that you can \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ whenever you need it.

### Benefits of functions:

- **Reuse** — write once, call \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
- **Organize** — break a big program into smaller, named \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
- **Fix once** — if there's a bug, you fix it in \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ place

---

## Part 2: Your First Function

### Structure

```cpp
returnType functionName(parameters) {
    // code
    return value;  // if returnType isn't void
}
```

### A simple function:

```cpp
void printSeparator() {
    cout << "------------------------------" << endl;
}
```

- `void` means the function \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (doesn't give back a value)
- `printSeparator` is the \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ of the function
- `()` means it takes \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ parameters (no inputs)

### Calling a function:

```cpp
int main() {
    printSeparator();  // call it!
    cout << "BATTLE START" << endl;
    printSeparator();  // call it again!
    return 0;
}
```

### 🖥️ Type and run the complete program:

```cpp
#include <iostream>
using namespace std;

void printSeparator() {
    cout << "==============================" << endl;
}

int main() {
    printSeparator();
    cout << "    MONSTER BATTLE" << endl;
    printSeparator();
    cout << "Get ready to fight!" << endl;
    printSeparator();
    return 0;
}
```

Output:
```
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
```

**Key rule:** Functions must be \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (written) **above** `main()`, or declared with a prototype before `main()` (we'll cover prototypes later).

---

## Part 3: Parameters — Giving Functions Input

Parameters let you pass \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ into a function so it can work with different values each time.

### Function with one parameter:

```cpp
void printGreeting(string name) {
    cout << "Welcome, " << name << "!" << endl;
}

int main() {
    printGreeting("Kira");      // name = "Kira"
    printGreeting("Shadow");    // name = "Shadow"
    printGreeting("Blaze");     // name = "Blaze"
    return 0;
}
```

- `string name` is the \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ — a variable that receives the value you pass in
- `"Kira"` is the \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ — the actual value being passed

### Function with multiple parameters:

```cpp
void displayHP(string name, int hp, int maxHP) {
    cout << name << ": " << hp << "/" << maxHP << " HP" << endl;
}

int main() {
    displayHP("Player", 85, 100);
    displayHP("Goblin", 40, 80);
    displayHP("Dragon", 200, 200);
    return 0;
}
```

Parameters are separated by \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_.

The **order matters** — the first argument fills the first parameter, second fills the second, etc.

### 🖥️ Type and run:

```cpp
#include <iostream>
#include <string>
using namespace std;

void displayHP(string name, int hp, int maxHP) {
    cout << name << ": [";
    for (int i = 0; i < 10; i++) {
        if (i < hp / 10) cout << "#";
        else cout << ".";
    }
    cout << "]  " << hp << "/" << maxHP << " HP" << endl;
}

int main() {
    displayHP("Player", 100, 100);
    displayHP("Goblin", 45, 80);
    displayHP("Dragon", 10, 200);
    return 0;
}
```

Output:
```
_________________________________
_________________________________
_________________________________
```

Look at that — the HP bar is written \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ but used \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ times!

---

## Part 4: Return Values — Functions That Give Back

Some functions \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ a value back to whoever called them.

### A function that returns an int:

```cpp
int rollDamage(int min, int max) {
    int damage = rand() % (max - min + 1) + min;
    return damage;
}
```

- `int` before the name means it \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ an integer
- `return damage;` sends the value \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ to the caller

### Using the return value:

```cpp
int hit = rollDamage(5, 15);
cout << "You dealt " << hit << " damage!" << endl;
```

The return value gets \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ in a variable, just like cin or math.

### 🖥️ Type and run:

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>
using namespace std;

int rollDamage(int min, int max) {
    return rand() % (max - min + 1) + min;
}

int calculateXP(int enemyLevel) {
    return enemyLevel * 50 + 10;
}

int main() {
    srand(time(0));

    int hit1 = rollDamage(5, 15);
    int hit2 = rollDamage(5, 15);
    int hit3 = rollDamage(5, 15);

    cout << "Hit 1: " << hit1 << " damage" << endl;
    cout << "Hit 2: " << hit2 << " damage" << endl;
    cout << "Hit 3: " << hit3 << " damage" << endl;

    int xp = calculateXP(3);
    cout << "XP earned: " << xp << endl;

    return 0;
}
```

What does `calculateXP(3)` return? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (3 × 50 + 10 = \_\_\_\_\_\_)

---

## Part 5: Return Type Cheat Sheet

| Return Type | Meaning | Example |
|-------------|---------|---------|
| `void` | Returns \_\_\_\_\_\_\_\_\_\_\_\_ | `void printSeparator()` |
| `int` | Returns a \_\_\_\_\_\_\_\_\_\_\_\_ | `int rollDamage(int min, int max)` |
| `double` | Returns a \_\_\_\_\_\_\_\_\_\_\_\_ | `double calculateCrit(double base)` |
| `bool` | Returns \_\_\_\_\_\_\_\_\_\_\_\_ | `bool isAlive(int hp)` |
| `string` | Returns \_\_\_\_\_\_\_\_\_\_\_\_ | `string getTitle(int level)` |

### A function that returns bool:

```cpp
bool isAlive(int hp) {
    return hp > 0;
}
```

This returns `true` if HP is greater than 0, `false` otherwise.

### Using it in an if statement:

```cpp
if (isAlive(playerHP)) {
    cout << "You're still fighting!" << endl;
} else {
    cout << "You have fallen." << endl;
}
```

### 🖥️ Type and run:

```cpp
#include <iostream>
using namespace std;

bool isAlive(int hp) {
    return hp > 0;
}

string getStatus(int hp) {
    if (hp > 75) return "Healthy";
    if (hp > 25) return "Wounded";
    if (hp > 0) return "Critical";
    return "Dead";
}

int main() {
    int hp = 50;

    cout << "Alive: " << isAlive(hp) << endl;
    cout << "Status: " << getStatus(hp) << endl;

    hp = 0;
    cout << "Alive: " << isAlive(hp) << endl;
    cout << "Status: " << getStatus(hp) << endl;

    return 0;
}
```

Output:
```
_________________________________
_________________________________
_________________________________
_________________________________
```

---

## Part 6: void vs. Return — When to Use Each

| Use `void` when... | Use a return type when... |
|--------------------|-----------------------|
| The function \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ something (prints, draws) | The function \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ something (calculates, checks) |
| You don't need a result back | You need to \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ the result |
| Example: `displayHP()`, `printSeparator()` | Example: `rollDamage()`, `isAlive()` |

**Rule of thumb:** If you'd say "show me" → \_\_\_\_\_\_\_\_\_\_\_\_. If you'd say "tell me" → \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_.

---

## Part 7: Putting It Together — A Clean Battle

Here's what a battle looks like when organized with functions:

```cpp
void displayHP(string name, int hp, int maxHP) { ... }
bool isAlive(int hp) { ... }
int rollDamage(int min, int max) { ... }
void printSeparator() { ... }

int main() {
    int playerHP = 100, monsterHP = 80;
    int round = 1;

    printSeparator();
    cout << "  BATTLE START!" << endl;
    printSeparator();

    while (isAlive(playerHP) && isAlive(monsterHP)) {
        cout << "--- Round " << round << " ---" << endl;
        displayHP("Player", playerHP, 100);
        displayHP("Monster", monsterHP, 80);

        int hit = rollDamage(8, 18);
        monsterHP -= hit;
        cout << "You deal " << hit << " damage!" << endl;

        if (!isAlive(monsterHP)) break;

        hit = rollDamage(6, 14);
        playerHP -= hit;
        cout << "Monster deals " << hit << " damage!" << endl;

        round++;
    }

    printSeparator();
    if (isAlive(playerHP)) {
        cout << "VICTORY!" << endl;
    } else {
        cout << "DEFEAT..." << endl;
    }
}
```

Notice how `main()` reads like \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ — you can understand what happens without reading the function details.

---

## Part 8: Common Mistakes

### Calling without parentheses:

```cpp
printSeparator;    // ❌ WRONG — doesn't call the function
printSeparator();  // ✅ RIGHT — actually calls it
```

### Mismatched types:

```cpp
int rollDamage(int min, int max) { ... }

// ❌ WRONG — passing a string where an int is expected
int hit = rollDamage("five", "ten");

// ✅ RIGHT
int hit = rollDamage(5, 10);
```

### Forgetting the return statement:

```cpp
int add(int a, int b) {
    int sum = a + b;
    // ❌ Forgot to return! The function returns garbage.
}

int add(int a, int b) {
    return a + b;  // ✅ RIGHT
}
```

### Putting a function inside main():

```cpp
int main() {
    void printHello() {   // ❌ WRONG — can't define functions inside main
        cout << "Hi" << endl;
    }
}
```

Functions go \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ main, not inside it.

---

## 🧠 Exit Ticket

**Without running the code**, predict the output:

```cpp
int doubleIt(int x) {
    return x * 2;
}

void showResult(string label, int value) {
    cout << label << ": " << value << endl;
}

int main() {
    int a = 5;
    int b = doubleIt(a);
    int c = doubleIt(b);

    showResult("a", a);
    showResult("b", b);
    showResult("c", c);

    return 0;
}
```

Trace it:

| Variable | Value |
|----------|-------|
| `a` | \_\_\_\_ |
| `b` = doubleIt(5) | \_\_\_\_ |
| `c` = doubleIt(\_\_\_\_) | \_\_\_\_ |

Output:
```
_________________________________
_________________________________
_________________________________
```

---

**📌 Reminders:**
- Save your notes — you'll need them Monday.
- Monday (April 13): **"Battle Functions"** activity — you'll refactor the Monster Battle into clean, reusable functions. 15 points.
