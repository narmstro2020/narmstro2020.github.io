# Lesson 12: Collision Detection
### Self-Guided Notes | Thursday, April 30, 2026
### Work through this first — activity starts when you're done

---

> **Goal:** Learn how raylib handles rectangle-based collision, how to structure collidable objects using what you know about structs and classes, and how to build the core interaction system your capstone game will depend on.

---

## Part 1: What Is Collision Detection?

Every game needs to know when two things overlap — a player touching a wall, a sword hitting an enemy, a character stepping on a coin. This is **collision detection**.

The simplest and most common approach in 2D games is **AABB** — Axis-Aligned Bounding Box. Every object gets an invisible rectangle that represents its space. If two rectangles overlap, a collision is detected.

```
┌─────────┐
│  Player │
│   rect  │──── overlapping? ────┌──────────┐
└─────────┘                      │  Enemy   │
                                 │   rect   │
                                 └──────────┘
```

raylib has a built-in function for this:

```cpp
bool CheckCollisionRecs(Rectangle r1, Rectangle r2);
// returns true if r1 and r2 overlap, false otherwise
```

---

## Part 2: `Rectangle` as a Bounding Box

You already used `Rectangle` to draw in Lesson 10. Now you use it for collision too — the same struct does both jobs.

```cpp
Rectangle player = {100.0f, 200.0f, 32.0f, 48.0f};  // x, y, width, height
Rectangle wall   = {300.0f, 180.0f, 20.0f, 200.0f};

if (CheckCollisionRecs(player, wall)) {
    cout << "Hit a wall!" << endl;
}

// Draw both so you can see them
DrawRectangleRec(player, BLUE);
DrawRectangleRec(wall, GRAY);
```

> 📌 During development, always draw your collision rectangles so you can see exactly what the engine is checking. Remove or hide them before submitting the final project.

**▶ TRY IT — Run this minimal example:**

```cpp
#include "raylib.h"
#include <iostream>
using namespace std;

int main() {
    InitWindow(800, 600, "Collision Test");
    SetTargetFPS(60);

    Rectangle player = {100.0f, 270.0f, 40.0f, 60.0f};
    Rectangle wall   = {400.0f, 200.0f, 20.0f, 200.0f};
    float speed      = 200.0f;

    while (!WindowShouldClose()) {
        float delta = GetFrameTime();

        if (IsKeyDown(KEY_D)) player.x += speed * delta;
        if (IsKeyDown(KEY_A)) player.x -= speed * delta;

        bool hit = CheckCollisionRecs(player, wall);

        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangleRec(player, hit ? RED : BLUE);
        DrawRectangleRec(wall, GRAY);
        DrawText(hit ? "COLLISION!" : "No collision", 10, 10, 24, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}
```

> 🤔 The player turns red on collision but still passes through the wall. Why? What's missing to make it actually block?
>
> _______________________________________________

---

## Part 3: Resolving Collision — Actually Blocking Movement

Detecting collision isn't enough — you need to *respond* to it. The standard approach: **save the previous position, try the move, and roll back if a collision occurs.**

```cpp
float prevX = player.x;   // save before moving
player.x += speed * delta;

if (CheckCollisionRecs(player, wall)) {
    player.x = prevX;     // roll back — movement blocked
}
```

Do the same for Y independently:

```cpp
float prevX = player.x;
float prevY = player.y;

if (IsKeyDown(KEY_D)) player.x += speed * delta;
if (IsKeyDown(KEY_A)) player.x -= speed * delta;

if (CheckCollisionRecs(player, wall)) player.x = prevX;

if (IsKeyDown(KEY_S)) player.y += speed * delta;
if (IsKeyDown(KEY_W)) player.y -= speed * delta;

if (CheckCollisionRecs(player, wall)) player.y = prevY;
```

> 📌 Resolving X and Y **separately** is important — it lets the player slide along walls instead of stopping completely when they move diagonally into one.

**▶ TRY IT — Add the rollback logic to your test from Part 2. The player should now stop at the wall instead of passing through.**

---

## Part 4: Multiple Collidable Objects — Vectors of Rectangles

Real games have many walls, enemies, and items. Store them in vectors and loop through to check each one.

```cpp
vector<Rectangle> walls = {
    {0,   0,   800, 20},   // top border
    {0,   580, 800, 20},   // bottom border
    {0,   0,   20,  600},  // left border
    {780, 0,   20,  600},  // right border
    {200, 100, 20,  300},  // interior wall
};

// Check all walls in one loop
float prevX = player.x;
player.x += /* input */;
for (Rectangle &w : walls) {
    if (CheckCollisionRecs(player, w)) { player.x = prevX; break; }
}

float prevY = player.y;
player.y += /* input */;
for (Rectangle &w : walls) {
    if (CheckCollisionRecs(player, w)) { player.y = prevY; break; }
}
```

---

## Part 5: Trigger Zones — Collision Without Blocking

Not every collision should stop movement. A pickup, a door trigger, or a damage zone should *detect* overlap without blocking the player.

```cpp
struct Pickup {
    Rectangle rect;
    bool      collected;
    int       value;
};

Pickup coin = {{350.0f, 280.0f, 20.0f, 20.0f}, false, 10};

// In the game loop:
if (!coin.collected && CheckCollisionRecs(player, coin.rect)) {
    coin.collected = true;
    playerGold += coin.value;
}

// Only draw if not yet collected:
if (!coin.collected)
    DrawRectangleRec(coin.rect, GOLD);
```

**▶ TRY IT — Add a yellow coin pickup to your collision test. When the player walks over it, it disappears and a "Collected!" message appears.**

---

## Self-Check — No Grade

1. What does `CheckCollisionRecs` return, and what are its two parameters?
2. Why do you save `prevX` and `prevY` before applying movement?
3. Why resolve X and Y collisions separately rather than together?
4. What's the difference between a blocking collision and a trigger collision?
5. Write the struct definition for a `Door` that has a `Rectangle`, a `bool isOpen`, and a `string` destination room name.

---

**Done? Flip to the activity and start Step A.**
