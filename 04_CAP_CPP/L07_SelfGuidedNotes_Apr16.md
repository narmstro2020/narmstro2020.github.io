# Lesson 7: Vectors
### Self-Guided Notes | Thursday, April 16, 2026
### Work through this first — activity starts when you're done

---

> **Goal:** Get through all five parts and the self-check before starting the activity. Each TRY IT should take 2–3 minutes. Don't skip them.

---

## Part 1: Why Vectors?

You could store items like this — but it breaks the moment you don't know how many you'll have:

```cpp
string item0 = "Sword";
string item1 = "Shield";
// What if the player picks up a 6th item?
```

C++ arrays fix the naming problem but lock you into a fixed size:

```cpp
string inventory[5];   // exactly 5 slots, forever — can't grow
```

A `vector` is an array that can grow and shrink dynamically. It lives in `<vector>`.

```cpp
#include <vector>

vector<string> inventory;      // starts empty, no size needed
inventory.push_back("Sword");  // now has 1 element
inventory.push_back("Shield"); // now has 2 elements
```

**▶ TRY IT — Run this and confirm the output:**

```cpp
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    vector<string> inv;
    inv.push_back("Sword");
    inv.push_back("Shield");
    inv.push_back("Potion");

    cout << "Items: " << inv.size() << endl;
    cout << "First: " << inv[0] << endl;
    cout << "Last:  " << inv[2] << endl;
    return 0;
}
```

```
Items: 3
First: Sword
Last:  Potion
```

---

## Part 2: Core Operations

| Operation | What it does |
|---|---|
| `push_back(val)` | Add to the end |
| `pop_back()` | Remove the last element |
| `size()` | Number of elements |
| `[i]` | Access by index (no range check) |
| `at(i)` | Access by index (throws error if out of bounds) |
| `clear()` | Remove all elements |
| `empty()` | Returns `true` if size is 0 |

> ⚠️ Vectors are **zero-indexed.** First element = `[0]`, last = `[size()-1]`. Accessing `[size()]` is out of bounds — likely a crash.

**▶ TRY IT:**

```cpp
vector<string> inv = {"Sword", "Shield", "Potion"};
cout << inv.size() << endl;    // 3

inv.pop_back();
cout << inv.size() << endl;    // 2
cout << inv.at(1) << endl;     // Shield
// cout << inv.at(2) << endl;  // would throw — Potion is gone
```

---

## Part 3: Iterating a Vector

**Index-based** (use when you need the index number):
```cpp
for (int i = 0; i < inv.size(); i++) {
    cout << (i + 1) << ". " << inv[i] << endl;
}
```

**Range-based** (cleaner when you just need each value):
```cpp
for (string item : inv) {
    cout << item << endl;
}
```

**▶ TRY IT — Print a numbered list:**

```cpp
vector<string> inv = {"Sword", "Shield", "Potion", "Map"};
for (int i = 0; i < inv.size(); i++) {
    cout << (i + 1) << ". " << inv[i] << endl;
}
```

```
1. Sword
2. Shield
3. Potion
4. Map
```

> 🤔 Why `i + 1` instead of `i`?
>
> _______________________________________________

---

## Part 4: Passing Vectors to Functions

Same rules as other variables — pass by `&` to modify, `const &` to read safely without copying.

```cpp
// Read-only — const & (efficient, can't accidentally change it)
void printInventory(const vector<string> &inv) {
    for (int i = 0; i < inv.size(); i++)
        cout << (i + 1) << ". " << inv[i] << endl;
}

// Modifying — plain &
void addItem(vector<string> &inv, string item) {
    inv.push_back(item);
}
```

**▶ TRY IT — Wire them up in `main`:**

```cpp
int main() {
    vector<string> inv;
    addItem(inv, "Sword");
    addItem(inv, "Potion");
    printInventory(inv);
    return 0;
}
```

---

## Part 5: 2D Vectors — Grids

A `vector<vector<char>>` is a grid: a vector of rows, where each row is a vector of characters.

```cpp
int rows = 4, cols = 6;
vector<vector<char>> grid(rows, vector<char>(cols, '.'));  // fill with '.'

grid[1][2] = '@';   // player at row 1, col 2
grid[0][3] = '#';   // wall at row 0, col 3

for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++)
        cout << grid[r][c] << " ";
    cout << "\n";
}
```

```
. . . # . .
. . @ . . .
. . . . . .
. . . . . .
```

**▶ TRY IT — Run this. Then add a second wall somewhere and reprint.**

> 🤔 How do you read the character at row 2, col 4?
>
> _______________________________________________

---

## Self-Check — No Grade

Answer these before flipping to the activity:

1. What does `push_back()` do? What does `pop_back()` do?
2. A vector has 5 elements. What are the valid index values?
3. What's the difference between `const vector<string> &` and `vector<string> &` as a parameter?
4. Write the line that creates a 10×10 grid of `char`, all initialized to `'.'`.

---

**Done? Flip to the activity and start Step A.**
