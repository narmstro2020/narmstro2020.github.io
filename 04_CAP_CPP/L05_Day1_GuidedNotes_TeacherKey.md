# Lesson 5: Intro to Functions — Teacher Answer Key

**Date:** Friday, April 10, 2026
**Unit 3: Functions | Day 1 of 2**

> 🔑 Filled-in answers in **bold**. Pacing guide at the end.

---

## Part 1: Why Functions?

The code is almost **identical / the same**. 5 enemies = copy **5** times. Change bar width = change in **5** places.

A function is a named block of code you can **call / reuse** whenever you need it.

Benefits: call **many times**, smaller named **pieces/chunks**, fix in **one** place.

---

## Part 2: Your First Function

- `void` means the function **returns nothing**
- `printSeparator` is the **name**
- `()` means it takes **no / zero** parameters

Output:
```
==============================
    MONSTER BATTLE
==============================
Get ready to fight!
==============================
```

Functions must be **defined** above `main()`.

---

## Part 3: Parameters

- `string name` is the **parameter**
- `"Kira"` is the **argument**
- Parameters are separated by **commas**

HP bar display output:
```
Player: [##########]  100/100 HP
Goblin: [####......]  45/80 HP
Dragon: [#.........]  10/200 HP
```

(Note: Dragon HP bar shows only 0 `#` because `10/10 = 1`, wait actually `10/10 = 1` so 1 bar. But `10/200` — the bar is based on current HP divided by 10, not percentage. So 10 HP = 1 bar regardless of max. This is a simplification — the bar shows absolute HP in units of 10, not percentage.)

Written **once** but used **three** times.

---

## Part 4: Return Values

- `int` before the name means it **returns** an integer
- `return damage;` sends the value **back** to the caller
- Return value gets **stored** in a variable

`calculateXP(3)` returns **160** (3 × 50 + 10 = **160**)

---

## Part 5: Return Type Cheat Sheet

| Return Type | Meaning |
|-------------|---------|
| `void` | Returns **nothing** |
| `int` | Returns a **whole number** |
| `double` | Returns a **decimal number** |
| `bool` | Returns **true or false** |
| `string` | Returns **text** |

Output:
```
Alive: 1
Status: Wounded
Alive: 0
Status: Dead
```

---

## Part 6: void vs. Return

| Use `void` when... | Use a return type when... |
|--------------------|-----------------------|
| The function **does/displays** something | The function **computes/calculates** something |
| You don't need a result back | You need to **use/store** the result |

Rule of thumb: "show me" → **void**. "tell me" → **return type**.

---

## Part 7: Putting It Together

`main()` reads like **English / a story / plain language**.

---

## Part 8: Common Mistakes

Functions go **above/before** main, not inside it.

---

## 🧠 Exit Ticket — Answer

| Variable | Value |
|----------|-------|
| `a` | **5** |
| `b` = doubleIt(5) | **10** |
| `c` = doubleIt(**10**) | **20** |

Output:
```
a: 5
b: 10
c: 20
```

---

## 📋 Pacing Guide (86 minutes)

| Time | Section | Minutes | Notes |
|------|---------|---------|-------|
| 0:00 | Part 1: Why functions? | 8 | Show the duplicated HP bar code from their own battle. Ask: "What's wrong with this?" Let them feel the pain of copy/paste before offering the solution. |
| 0:08 | Part 2: First function (void, no params) | 10 | `printSeparator()` is dead simple. Type it, call it 3 times. The magic moment is seeing one function produce output in 3 places. |
| 0:18 | Part 3: Parameters | 15 | This is the biggest conceptual leap today. Start with one parameter (`printGreeting`), then jump to three (`displayHP`). Type the HP bar function together — this is the payoff from Part 1. "Remember those 2 copied HP bars? Now it's one function." |
| 0:33 | Part 4: Return values | 12 | `rollDamage` and `calculateXP` are the key examples. Emphasize: the function does work and gives you back the answer. Show storing the return value in a variable. |
| 0:45 | Part 5: Return type cheat sheet | 8 | `isAlive()` and `getStatus()` are practical RPG functions. The bool-returning function used in an if statement is an important pattern. |
| 0:53 | Part 6: void vs. return | 5 | Quick summary. The "show me vs. tell me" rule is easy to remember. |
| 0:58 | Part 7: Clean battle example | 10 | Show the complete battle loop using functions. Don't have them type this — just read through it together. Ask: "Can you understand what main() does without reading the function bodies?" That's the goal. |
| 1:08 | Part 8: Common mistakes | 5 | Quick — four common bugs. The "function inside main" one trips up a lot of students. |
| 1:13 | Exit ticket + wrap-up | 13 | Trace the chained function calls. This tests whether they understand that a return value can be passed as an argument. |

### If You're Running Short on Time

Cut Part 7 (the full clean battle walkthrough). Students will build this themselves on Monday. Also shorten Part 8 to just the top 2 mistakes (missing parentheses and function-inside-main).

### If You Have Extra Time

- Have students write a `printBorder(int width)` function that prints a line of `=` characters of the given width
- Challenge: write a function `int max(int a, int b)` that returns the larger of two numbers
- Show that you can use a function call directly: `cout << rollDamage(1, 6) << endl;` without storing in a variable first

### Key Teaching Moments

- **The duplicated HP bar (Part 1):** Don't skip this setup. Students need to feel the problem before they appreciate the solution. Pull up their actual code from Tuesday's activity if possible.
- **Parameters vs. arguments (Part 3):** Use the analogy: the parameter is the **parking spot** (labeled, waiting), the argument is the **car** (the actual value that parks there). The spot has a name and type, the car brings the value.
- **Return values (Part 4):** The key insight: "A function call with a return type IS a value." So `rollDamage(5, 15)` *is* a number, just like `42` is a number. You can store it, print it, use it in math.
- **isAlive in an if (Part 5):** This pattern — `if (isAlive(hp))` — is how professional code reads. It's also a preview of how they'll structure game logic going forward.

### Common Student Struggles

- **"Where do I put the function?"** — Above main, not inside it. This is the #1 structural error. CLion will give an error about nested function definitions.
- **Confusing parameters and arguments** — Parameters are in the function definition, arguments are in the function call. They correspond by position.
- **Forgetting to return** — If the function has a non-void return type, every code path must return a value. CLion may warn about this.
- **Thinking void functions can be stored** — `int x = printSeparator();` doesn't work because void returns nothing.
- **Not understanding that parameters are copies** — If they change `hp` inside `displayHP`, it doesn't change the original variable in main. This is pass-by-value, which we'll cover next lesson.
