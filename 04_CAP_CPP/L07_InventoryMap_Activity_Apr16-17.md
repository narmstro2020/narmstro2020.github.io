# Inventory Manager + Dungeon Map
### Lesson 7 Activity | Vectors
### 15 Points | Accuracy Graded

---

# DAY 1 — APRIL 16 (second half of class)
## Build the Inventory System

> Start this after finishing the self-guided notes. Today you build a menu-driven inventory system backed by a vector. Tomorrow you connect it to a dungeon map.
>
> **Reference:** Lesson 7 notes — keep them open.

---

## Step A — Project Setup

Create a new CLion project called `InventoryMap`. Paste this starter into `main.cpp`.

```cpp
#include <iostream>
#include <vector>
#include <string>
using namespace std;

// ── PROTOTYPES ─────────────────────────────────────────────────────────────
void printInventory(const vector<string> &inv);
void addItem(vector<string> &inv, string item);
bool removeItem(vector<string> &inv, string item);
int  findItem(const vector<string> &inv, string item);
void useItem(vector<string> &inv, string item);
void printMenu();

int main() {
    vector<string> inventory;
    int choice = 0;

    cout << "=== RPG Inventory Manager ===" << endl;

    while (choice != 5) {
        printMenu();
        cin >> choice;
        cin.ignore();

        if (choice == 1) {
            // TODO: add item (Step B)
        } else if (choice == 2) {
            // TODO: remove item (Step C)
        } else if (choice == 3) {
            // TODO: search for item (Step D)
        } else if (choice == 4) {
            // TODO: use item (Step E)
        } else if (choice == 5) {
            cout << "Closing inventory." << endl;
        } else {
            cout << "Invalid choice." << endl;
        }

        if (choice != 5) printInventory(inventory);
    }

    return 0;
}

void printMenu() {
    cout << "\n--- Menu ---" << endl;
    cout << "1. Add item" << endl;
    cout << "2. Remove item" << endl;
    cout << "3. Search for item" << endl;
    cout << "4. Use item" << endl;
    cout << "5. Quit" << endl;
    cout << "Choice: ";
}
```

### ✅ Checkpoint 1: Compile & Menu Loops (1 pt)
The program compiles, displays the menu, and loops. Choosing 5 prints "Closing inventory." and exits. Nothing else needs to work yet.

---

## Step B — Add Items & Print Inventory

Write these two functions and fill in the `choice == 1` branch.

**`void addItem(vector<string> &inv, string item)`**
- Use `push_back()` to add the item.
- Print: `"[item] added to inventory."`
- If the inventory already has 10 items, print `"Inventory full!"` and don't add.

**`void printInventory(const vector<string> &inv)`**
- If the vector is empty, print `"Inventory is empty."`
- Otherwise print a numbered list with a count header:
  ```
  === Inventory (3/10) ===
  1. Sword
  2. Potion
  3. Map
  ```

**`choice == 1` branch in `main`:**
```cpp
cout << "Item name: ";
string itemName;
getline(cin, itemName);
addItem(inventory, itemName);
```

### ✅ Checkpoint 2: Add & Display Working (3 pts)
1. Adding an item prints a confirmation and shows the updated numbered list.
2. The header shows current count out of 10.
3. Trying to add an 11th item prints "Inventory full!" and the list stays at 10.

---

## Step C — Remove Items by Name

Write `findItem` and `removeItem`, then fill in the `choice == 2` branch.

**`int findItem(const vector<string> &inv, string item)`**
- Loop through the vector. If `inv[i] == item`, return `i`.
- If not found, return `-1`.

**`bool removeItem(vector<string> &inv, string item)`**
- Call `findItem`. If it returns `-1`, return `false`.
- Otherwise erase the element: `inv.erase(inv.begin() + idx)` and return `true`.

**`choice == 2` branch:**
```cpp
cout << "Item to remove: ";
string itemName;
getline(cin, itemName);
if (!removeItem(inventory, itemName))
    cout << itemName << " not found in inventory." << endl;
```

### ✅ Checkpoint 3: Remove Working (3 pts)
1. Removing an existing item deletes it and shows the updated list.
2. Removing a non-existent item prints the not-found message.
3. Removing a middle item doesn't leave a gap — remaining items shift correctly.

---

## Step D — Day 1 Wrap-Up: Search

Fill in the `choice == 3` branch using `findItem`:

```cpp
cout << "Item to search: ";
string itemName;
getline(cin, itemName);
int idx = findItem(inventory, itemName);
if (idx == -1)
    cout << itemName << " is not in your inventory." << endl;
else
    cout << itemName << " found at slot " << (idx + 1) << "." << endl;
```

### ✅ Checkpoint 4: Search Working (1 pt)
Searching for an item in the inventory reports its slot number. Searching for one that isn't there reports not found.

---

## Day 1 Extension (if time remains)

- Add a `"Use"` preview: the `choice == 4` branch just prints `"Use not yet implemented."` — that's tomorrow.
- Prevent duplicates: before adding, call `findItem`. If it returns anything other than `-1`, print `"You already have that."` and skip the add.
- Sort alphabetically after every add: `#include <algorithm>`, then call `sort(inv.begin(), inv.end())` inside `addItem`.

---
---

# DAY 2 — APRIL 17
## Build the Dungeon Map

> Continue in the same project. You're adding to `main.cpp` — don't start over. Today you build a 10×10 dungeon where moving around collects items that go directly into your inventory from Day 1.

---

## Step E — Use Items (finish the menu first)

Before building the map, finish the inventory menu by writing `useItem` and filling in the `choice == 4` branch.

**`void useItem(vector<string> &inv, string item)`**
- Check if the item exists with `findItem`. If not, print `"You don't have a [item]."` and return.
- If it exists, call `removeItem`, then print the effect:

| Item | Effect message |
|---|---|
| `"Potion"` | `"You drink the Potion. HP restored!"` |
| `"Key"` | `"You use the Key. A door unlocks..."` |
| `"Map"` | `"You study the Map. The dungeon becomes clearer."` |
| `"Sword"` | `"You brandish the Sword. +5 to your next attack!"` |
| Anything else | `"You use the [item]. Nothing special happens."` |

**`choice == 4` branch:**
```cpp
cout << "Item to use: ";
string itemName;
getline(cin, itemName);
useItem(inventory, itemName);
```

### ✅ Checkpoint 5: Use Items Working (1 pt)
Using a known item removes it from the inventory and prints the correct message. Using an item not in the inventory prints the "don't have" message.

---

## Step F — Create the Grid

Add these two functions above `main()`. They set up and print the 10×10 dungeon.

```cpp
const int ROWS = 10;
const int COLS = 10;

void initMap(vector<vector<char>> &grid) {
    // Fill floor
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            grid[r][c] = '.';

    // Border walls
    for (int r = 0; r < ROWS; r++) { grid[r][0] = '#'; grid[r][COLS-1] = '#'; }
    for (int c = 0; c < COLS; c++) { grid[0][c] = '#'; grid[ROWS-1][c] = '#'; }

    // Interior walls
    grid[3][2] = '#'; grid[3][3] = '#'; grid[3][4] = '#';
    grid[6][5] = '#'; grid[6][6] = '#'; grid[6][7] = '#';

    // Collectibles (letter = item abbreviation)
    grid[2][5] = 'P';   // Potion
    grid[5][2] = 'K';   // Key
    grid[7][8] = 'M';   // Map
    grid[4][7] = 'S';   // Sword
}

void printMap(const vector<vector<char>> &grid, int pRow, int pCol) {
    cout << "\n";
    for (int r = 0; r < ROWS; r++) {
        for (int c = 0; c < COLS; c++) {
            if (r == pRow && c == pCol) cout << "@";
            else cout << grid[r][c];
            cout << " ";
        }
        cout << "\n";
    }
    cout << "Move: W=up  S=down  A=left  D=right  Q=quit dungeon\n";
}
```

Add this dungeon section to the **end of `main()`**, after the inventory while-loop exits:

```cpp
// ── DUNGEON ────────────────────────────────────────────────────────────────
vector<vector<char>> dungeon(ROWS, vector<char>(COLS, '.'));
initMap(dungeon);
int pRow = 1, pCol = 1;

cout << "\n=== Entering the dungeon... ===" << endl;
printMap(dungeon, pRow, pCol);
printInventory(inventory);

char move;
while (true) {
    cout << "Move: ";
    cin >> move;
    move = tolower(move);
    if (move == 'q') break;

    // TODO: movement + collision (Step G)
    // TODO: item pickup (Step H)

    printMap(dungeon, pRow, pCol);
    printInventory(inventory);
}
```

### ✅ Checkpoint 6: Map Displays (2 pts)
1. A 10×10 grid renders with `#` walls on the border and interior, `.` for floor, and letter symbols for collectibles.
2. `@` appears at row 1, col 1 (the player's starting position).
3. The map reprints after every move input.

---

## Step G — Movement & Collision

Replace the movement TODO:

```cpp
int newRow = pRow;
int newCol = pCol;

if      (move == 'w') newRow--;
else if (move == 's') newRow++;
else if (move == 'a') newCol--;
else if (move == 'd') newCol++;
else { cout << "Use W/A/S/D to move." << endl; continue; }

if (dungeon[newRow][newCol] != '#') {
    pRow = newRow;
    pCol = newCol;
} else {
    cout << "A wall blocks your path." << endl;
}
```

### ✅ Checkpoint 7: Movement & Collision Working (2 pts)
1. W/A/S/D moves `@` on the grid in the correct direction.
2. Walking into a `#` prints the block message and doesn't move the player.
3. The player can't escape the border (border walls handle this automatically).

---

## Step H — Item Pickup

After updating `pRow`/`pCol`, check if the player stepped on a collectible. If so, add it to the inventory and clear it from the map.

```cpp
char cell = dungeon[pRow][pCol];

if (cell == 'P') {
    addItem(inventory, "Potion");
    dungeon[pRow][pCol] = '.';
} else if (cell == 'K') {
    addItem(inventory, "Key");
    dungeon[pRow][pCol] = '.';
} else if (cell == 'M') {
    addItem(inventory, "Map");
    dungeon[pRow][pCol] = '.';
} else if (cell == 'S') {
    addItem(inventory, "Sword");
    dungeon[pRow][pCol] = '.';
}
```

### ✅ Checkpoint 8: Item Pickup Working (3 pts)
1. Walking over a collectible prints the "added to inventory" confirmation.
2. The collectible symbol disappears from the map after pickup.
3. The inventory displays the new item after pickup.
4. Walking back over the same cell doesn't pick up the item again.

---

## Extensions (Early Finishers)

- **Win condition:** If all 4 items are collected, print `"You found all the treasure! You win!"` and break out of the dungeon loop.
- **Enemy on the map:** Place an `'E'` on the grid. Stepping on it triggers a mini-battle using `rollDice()` from Lesson 6, then removes the enemy if the player wins.
- **Move counter:** Track how many moves the player has made and display it below the map.
- **Fog of war:** Only show cells within 2 steps of the player — print `' '` for everything beyond that radius.
- **Item effects on the map:** Using the `"Key"` changes a specific `'#'` wall to `'.'`, opening a new passage.

---

## Grading Rubric — 15 Points

| Criteria | What to Show | Pts |
|---|---|---|
| Inventory compiles and menu loops | Menu displays, choice 5 exits cleanly | 1 |
| Add & display | `push_back` used, numbered list with `X/10` count, 10-item cap enforced | 3 |
| Remove by name | `erase()` used, item removed correctly, not-found message works | 3 |
| Search | `findItem()` returns correct index, slot number shown to user | 1 |
| Use items | Item removed on use, correct message per item, not-in-inventory handled | 1 |
| Map renders correctly | 10×10 grid prints, walls in place, `@` at correct starting position | 2 |
| Movement & collision | W/A/S/D moves player, walls block correctly | 2 |
| Item pickup | Collectibles transfer to inventory, removed from map, no re-pickup | 2 |
