# Lesson 4: do-while, Input Validation & Loop Control — Guided Notes

**Date:** Wednesday, April 8, 2026
**Unit 2: Loops | Day 1 of 2**
**Points:** 5 (completion)

> ✏️ Fill in the blanks as we go. Type every code example into CLion and run it.
> Today: the last loop type, input validation, and controlling loops with break/continue.

---

## Quick Review

Yesterday you built a Monster Battle using `while` and `for` loops.

**Fill in from memory:**

A `while` loop checks the condition \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (before / after) running the code.

A `for` loop has three parts in one line: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_, \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_, \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_.

---

## Part 1: The do-while Loop

A `do-while` loop is like a `while` loop, but it checks the condition **after** running the code. This means the code inside runs **at least \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_** time(s), even if the condition starts false.

### Structure

```cpp
do {
    // code that repeats
} while (condition);  // <-- note the semicolon!
```

### Comparison

| Loop | When it checks | Minimum runs |
|------|---------------|-------------|
| `while` | \_\_\_\_\_\_\_\_\_\_\_\_ the code runs | \_\_\_\_ |
| `do-while` | \_\_\_\_\_\_\_\_\_\_\_\_ the code runs | \_\_\_\_ |

### 🖥️ Type and run:

```cpp
int x = 100;

// while version — how many times does it print?
while (x < 5) {
    cout << "while: " << x << endl;
    x++;
}

// do-while version — how many times does it print?
x = 100;
do {
    cout << "do-while: " << x << endl;
    x++;
} while (x < 5);
```

`while` output: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (nothing? one line? many lines?)

`do-while` output: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Why? The `do-while` runs the body \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ before checking if `x < 5`.

---

## Part 2: Input Validation

The most common use for `do-while` is **input validation** — asking the user for input and re-prompting if their answer is invalid.

### The Pattern

```cpp
int choice;

do {
    cout << "Enter a number between 1 and 3: ";
    cin >> choice;

    if (choice < 1 || choice > 3) {
        cout << "Invalid! Try again." << endl;
    }
} while (choice < 1 || choice > 3);

cout << "You chose: " << choice << endl;
```

How this works:
1. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ the user for input
2. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ the input
3. If invalid, show an error message
4. The `while` condition checks: is it \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_?
5. If still invalid → \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ from step 1
6. If valid → \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ the loop

### Why do-while and not while?

Because you need to \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ the input at least once before you can check if it's valid. The variable doesn't have a meaningful value until the user types something.

### 🖥️ Type and run — try entering invalid values:

```cpp
int age;

do {
    cout << "Enter your age (1-120): ";
    cin >> age;

    if (age < 1 || age > 120) {
        cout << "That's not a valid age!" << endl;
    }
} while (age < 1 || age > 120);

cout << "Your age is: " << age << endl;
```

What happens when you type `-5`? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

What happens when you type `200`? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

What happens when you type `25`? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Part 3: Input Validation for Menus

This pattern is perfect for game menus:

```cpp
int menuChoice;

do {
    cout << "=== BATTLE MENU ===" << endl;
    cout << "1) Attack" << endl;
    cout << "2) Defend" << endl;
    cout << "3) Heal" << endl;
    cout << "Choose: ";
    cin >> menuChoice;

    if (menuChoice < 1 || menuChoice > 3) {
        cout << "Invalid choice! Pick 1, 2, or 3." << endl;
        cout << endl;
    }
} while (menuChoice < 1 || menuChoice > 3);

// Now menuChoice is guaranteed to be 1, 2, or 3
switch (menuChoice) {
    case 1: cout << "You attack!" << endl; break;
    case 2: cout << "You defend!" << endl; break;
    case 3: cout << "You heal!" << endl; break;
}
```

The do-while \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ that the player enters a valid choice before the switch runs.

---

## Part 4: break

The `break` statement \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ exits the loop it's inside.

You already used `break` in switch statements. It works the same way in loops.

### 🖥️ Type and run:

```cpp
for (int i = 1; i <= 100; i++) {
    cout << i << " ";

    if (i == 7) {
        cout << "<-- Found lucky number!" << endl;
        break;
    }
}

cout << "Loop ended." << endl;
```

Output: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

The loop was set to go to 100, but `break` stopped it at \_\_\_\_\_\_.

### When to use break in a loop:

- \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ for something and found it → stop searching
- A game-ending condition is met \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (enemy died mid-round)
- The user enters a \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ command (like "quit")

---

## Part 5: continue

The `continue` statement \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ the rest of the current iteration and jumps to the next one.

### 🖥️ Type and run:

```cpp
for (int i = 1; i <= 10; i++) {
    if (i % 3 == 0) {
        continue;  // skip multiples of 3
    }
    cout << i << " ";
}
cout << endl;
```

Output: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Which numbers were skipped? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ (because they're divisible by \_\_\_\_\_\_)

### break vs. continue

| `break` | `continue` |
|---------|-----------|
| \_\_\_\_\_\_\_\_\_\_\_\_ the entire loop | \_\_\_\_\_\_\_\_\_\_\_\_ the current iteration |
| Loop is done | Loop \_\_\_\_\_\_\_\_\_\_\_\_ with the next iteration |

---

## Part 6: Choosing the Right Loop

You now know all three loop types. Here's when to use each:

| Loop | Best for... | Example |
|------|------------|---------|
| `while` | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ — you don't know how many times | Game loop: `while (playerHP > 0)` |
| `for` | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ — you know how many times | Print grid: `for (int i = 0; i < 10; i++)` |
| `do-while` | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ — must run at least once | Menu: "Enter choice" → validate |

### Decision Flowchart

Ask yourself:
1. Do I know how many times it repeats? → Use a \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ loop
2. Does it depend on a condition? → Use a \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ loop
3. Must the code run at least once? → Use a \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ loop

---

## Part 7: Common Loop Patterns

### Sentinel Loop

A **sentinel** is a special value that signals "stop." The loop runs until the user enters the sentinel.

```cpp
int input;

cout << "Enter numbers to add (enter -1 to stop):" << endl;

int total = 0;

while (true) {
    cout << "> ";
    cin >> input;

    if (input == -1) {
        break;
    }

    total += input;
}

cout << "Total: " << total << endl;
```

The sentinel value here is \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_.

`while (true)` creates an intentional \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ loop that we exit with \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_.

### Flag Loop

A **flag** is a boolean variable that controls the loop.

```cpp
bool gameOver = false;
int hp = 100;

while (!gameOver) {
    cout << "HP: " << hp << endl;
    hp -= 30;

    if (hp <= 0) {
        gameOver = true;
    }
}

cout << "Game over!" << endl;
```

The flag variable is \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_. It starts as \_\_\_\_\_\_\_\_\_\_\_\_ and is set to \_\_\_\_\_\_\_\_\_\_\_\_ when the game ends.

`!gameOver` means "\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_" — the loop runs while the game is NOT over.

---

## Part 8: Nesting Loops with Selection

The real power comes from combining loops with if/else. Here's a pattern you'll use tomorrow:

### 🖥️ Type and run:

```cpp
int playerRow = 2;
int playerCol = 4;

for (int row = 0; row < 5; row++) {
    for (int col = 0; col < 10; col++) {
        if (row == 0 || row == 4 || col == 0 || col == 9) {
            cout << "# ";   // wall
        } else if (row == playerRow && col == playerCol) {
            cout << "@ ";   // player
        } else {
            cout << ". ";   // empty
        }
    }
    cout << endl;
}
```

What does this print?

```
________________________________________
________________________________________
________________________________________
________________________________________
________________________________________
```

The `if` on `row == 0 || row == 4 || col == 0 || col == 9` creates a \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ of walls around the edge.

---

## 🧠 Exit Ticket

**Without running the code**, predict the output:

```cpp
int tries = 0;
int secret = 3;
int guess;

do {
    guess = tries + 1;
    cout << "Guess: " << guess << endl;
    tries++;
} while (guess != secret);

cout << "Found it in " << tries << " tries!" << endl;
```

Trace it:

| Iteration | `tries` (start) | `guess` = tries+1 | `guess != 3`? | `tries` after `++` |
|-----------|-----------------|-------------------|--------------|-------------------|
| 1 | 0 | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ |
| 2 | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ |
| 3 | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ | \_\_\_\_ |

Output:
```
___________________________________
___________________________________
___________________________________
___________________________________
```

---

**📌 Reminders:**
- Save your notes — you'll need them tomorrow.
- Tomorrow (Thursday, April 9): **"Dungeon Map + Improved Battle"** — a checkpoint activity combining nested loops, do-while menus, and combat. 15 points.
