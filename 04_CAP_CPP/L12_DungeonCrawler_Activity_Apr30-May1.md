# Dungeon Crawler
### Lesson 12 Activity | Collision Detection
### 15 Points | Accuracy Graded

---

# DAY 1 — APRIL 30 (second half of class)
## Build the Room & Collision System

> Start this after finishing the self-guided notes. Today you build a dungeon room with real wall collision, collectible pickups, and a HUD. This project is the closest thing to your capstone yet — almost everything you add today carries forward.
>
> **Reference:** Lesson 12 notes — keep them open. Your Lesson 11 SpriteExplorer project is also a reference — you can reuse your assets and sprite animation code.

---

## Step A — Project Setup

Create a new CLion project called `DungeonCrawler`. Use the FetchContent `CMakeLists.txt` with the asset-copy command:

```cmake
cmake_minimum_required(VERSION 3.26)
project(DungeonCrawler)

set(CMAKE_CXX_STANDARD 20)

include(FetchContent)
FetchContent_Declare(
    raylib
    GIT_REPOSITORY https://github.com/raysan5/raylib.git
    GIT_TAG master
)
FetchContent_MakeAvailable(raylib)

add_executable(DungeonCrawler main.cpp)
target_link_libraries(DungeonCrawler raylib)

add_custom_command(TARGET DungeonCrawler POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/assets
    $<TARGET_FILE_DIR:DungeonCrawler>/assets
)
```

Copy your `assets/` folder from SpriteExplorer into this project root. Start `main.cpp` with:

```cpp
#include "raylib.h"
#include <vector>
#include <string>
using namespace std;

const int SCREEN_W = 960;
const int SCREEN_H = 640;

// ── STRUCTS ────────────────────────────────────────────────────────────────
struct Pickup {
    Rectangle rect;
    bool      collected;
    string    label;
    int       value;
};

struct Door {
    Rectangle rect;
    bool      isOpen;
    string    destination;
};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "Dungeon Crawler");
    SetTargetFPS(60);

    // ── PLAYER ────────────────────────────────────────────────
    Rectangle player   = {100.0f, 300.0f, 32.0f, 48.0f};
    float     speed    = 200.0f;
    int       hp       = 100;
    int       maxHP    = 100;
    int       gold     = 0;

    // ── SPRITE ANIMATION ──────────────────────────────────────
    Texture2D heroTex    = LoadTexture("assets/hero.png");
    int   frameWidth     = 32;   // ← update to match your sheet
    int   frameHeight    = 48;   // ← update to match your sheet
    int   totalFrames    = 4;    // ← update to match your sheet
    int   currentFrame   = 0;
    float frameTimer     = 0.0f;
    float frameSpeed     = 0.12f;
    bool  facingRight    = true;
    bool  moving         = false;

    // ── WALLS ─────────────────────────────────────────────────
    vector<Rectangle> walls = {
        {0,   0,   SCREEN_W, 40},            // top
        {0,   SCREEN_H - 40, SCREEN_W, 40},  // bottom
        {0,   0,   40, SCREEN_H},            // left
        {SCREEN_W - 40, 0, 40, SCREEN_H},    // right
        {200, 150, 20,  200},                // interior pillar left
        {740, 150, 20,  200},                // interior pillar right
        {350, 400, 260, 20},                 // horizontal barrier
    };

    // ── PICKUPS ───────────────────────────────────────────────
    vector<Pickup> pickups = {
        {{500, 200, 20, 20}, false, "Gold",   15},
        {{300, 480, 20, 20}, false, "Gold",   10},
        {{680, 480, 20, 20}, false, "Potion", 0},
    };

    // ── DOOR ──────────────────────────────────────────────────
    Door exitDoor = {{440, 0, 80, 40}, false, "Room 2"};

    // ── MESSAGE ───────────────────────────────────────────────
    string message    = "";
    float  msgTimer   = 0.0f;

    while (!WindowShouldClose()) {
        float delta = GetFrameTime();

        // TODO: update logic (Steps B, C, D)

        BeginDrawing();
        ClearBackground({20, 12, 8, 255});

        // TODO: draw calls (Steps B, C, D, E)

        EndDrawing();
    }

    UnloadTexture(heroTex);
    CloseWindow();
    return 0;
}
```

### ✅ Checkpoint 1: Compiles & Window Opens (1 pt)
The window opens. No linker errors. The screen is dark brown — no walls or player visible yet (those come next).

---

## Step B — Draw the Room & Move the Player

Add the wall drawing and player movement inside the game loop.

**Update logic (before `BeginDrawing`):**
```cpp
// Player movement with rollback collision
moving = false;

float prevX = player.x;
float prevY = player.y;

if (IsKeyDown(KEY_D) || IsKeyDown(KEY_RIGHT)) { player.x += speed * delta; facingRight = true;  moving = true; }
if (IsKeyDown(KEY_A) || IsKeyDown(KEY_LEFT))  { player.x -= speed * delta; facingRight = false; moving = true; }

for (Rectangle &w : walls)
    if (CheckCollisionRecs(player, w)) { player.x = prevX; break; }

if (IsKeyDown(KEY_S) || IsKeyDown(KEY_DOWN))  { player.y += speed * delta; moving = true; }
if (IsKeyDown(KEY_W) || IsKeyDown(KEY_UP))    { player.y -= speed * delta; moving = true; }

for (Rectangle &w : walls)
    if (CheckCollisionRecs(player, w)) { player.y = prevY; break; }

// Sprite animation
if (moving) {
    frameTimer += delta;
    if (frameTimer >= frameSpeed) {
        frameTimer = 0.0f;
        currentFrame = (currentFrame + 1) % totalFrames;
    }
} else {
    currentFrame = 0;
    frameTimer   = 0.0f;
}
```

**Draw calls (inside `BeginDrawing`/`EndDrawing`):**
```cpp
// Walls
for (Rectangle &w : walls)
    DrawRectangleRec(w, DARKGRAY);

// Player sprite
Rectangle srcRect = {
    (float)(currentFrame * frameWidth),
    0.0f,
    facingRight ? (float)frameWidth : -(float)frameWidth,
    (float)frameHeight
};
DrawTextureRec(heroTex, srcRect, {player.x, player.y}, WHITE);

// Debug: outline player bounding box (remove before final submit)
DrawRectangleLinesEx(player, 1, {255, 255, 0, 100});
```

### ✅ Checkpoint 2: Movement & Wall Collision (4 pts)
1. The animated sprite moves with WASD / arrow keys.
2. The player cannot pass through any of the four border walls.
3. The player cannot pass through either interior pillar or the horizontal barrier.
4. The player slides along walls when moving diagonally into them — doesn't get stuck.

---

## Step C — Pickups

Add pickup logic and drawing inside the game loop.

**Update (before `BeginDrawing`):**
```cpp
// Message timer
if (msgTimer > 0) msgTimer -= delta;

// Pickup collision
for (Pickup &p : pickups) {
    if (!p.collected && CheckCollisionRecs(player, p.rect)) {
        p.collected = true;
        if (p.label == "Gold") {
            gold += p.value;
            message  = "+" + to_string(p.value) + " Gold!";
        } else if (p.label == "Potion") {
            hp = min(hp + 30, maxHP);
            message  = "Potion! +30 HP";
        }
        msgTimer = 2.0f;
    }
}
```

**Draw (inside `BeginDrawing`/`EndDrawing`):**
```cpp
for (Pickup &p : pickups) {
    if (!p.collected) {
        Color c = (p.label == "Gold") ? GOLD : GREEN;
        DrawCircle((int)p.rect.x + 10, (int)p.rect.y + 10, 10, c);
        DrawText(p.label.c_str(), (int)p.rect.x - 8, (int)p.rect.y - 16, 14, WHITE);
    }
}

// Popup message
if (msgTimer > 0)
    DrawText(message.c_str(), (int)player.x - 20, (int)player.y - 30, 20, YELLOW);
```

### ✅ Checkpoint 3: Pickups Work (3 pts)
1. Gold pickups disappear when the player walks over them. Gold counter increases.
2. The potion pickup disappears and restores HP (won't exceed `maxHP`).
3. A popup message appears briefly above the player for each pickup.

---

## Step D — Exit Door

Add the door trigger. The door opens only once all gold has been collected, then touching it shows a "Level Complete!" message.

**Update (before `BeginDrawing`):**
```cpp
// Check if all gold collected
bool allGoldCollected = true;
for (Pickup &p : pickups)
    if (!p.collected && p.label == "Gold") allGoldCollected = false;

exitDoor.isOpen = allGoldCollected;

// Door trigger
if (exitDoor.isOpen && CheckCollisionRecs(player, exitDoor.rect)) {
    message  = "Level Complete!";
    msgTimer = 999.0f;   // hold until next room (project placeholder)
}
```

**Draw (inside `BeginDrawing`/`EndDrawing`):**
```cpp
Color doorColor = exitDoor.isOpen ? {60, 180, 60, 255} : {100, 60, 60, 255};
DrawRectangleRec(exitDoor.rect, doorColor);
DrawText(exitDoor.isOpen ? "EXIT" : "LOCKED", (int)exitDoor.rect.x + 8, (int)exitDoor.rect.y + 12, 14, WHITE);
```

### ✅ Checkpoint 4: Door Logic Works (2 pts)
1. The door is red/dark when gold remains uncollected. Touching it does nothing.
2. After collecting all gold the door turns green. Walking into it shows "Level Complete!".

---

## Day 1 Extension (if time remains)

- Add a damage zone: a red rectangle somewhere in the room. Each frame the player overlaps it, subtract 1 from `hp`. Cap at 0.
- Add a second row of sprite sheet frames for an idle animation (different `srcRect.y` when `!moving`).
- Draw the door label above it when locked: "Collect all gold to open."

---
---

# DAY 2 — MAY 1
## Add the HUD, Enemies & Polish

> Continue in the same project. Today you add a full HUD, a patrolling enemy, and enemy collision — the last major piece before the capstone.

---

## Step E — Full HUD

Add this draw block at the very end of your `BeginDrawing`/`EndDrawing` section, after all world drawing so it always renders on top.

```cpp
// ── HUD ─────────────────────────────────────────────────────────────────

// HP bar
DrawRectangle(10, 8, 200, 22, DARKGRAY);
int hpBarW = (int)(200.0f * hp / maxHP);
Color hpColor = (hp > 50) ? {60, 180, 60, 255} : (hp > 25) ? ORANGE : RED;
DrawRectangle(10, 8, hpBarW, 22, hpColor);
DrawRectangleLines(10, 8, 200, 22, WHITE);
DrawText(TextFormat("HP  %d / %d", hp, maxHP), 15, 10, 18, WHITE);

// Gold
DrawText(TextFormat("Gold: %d", gold), SCREEN_W - 130, 10, 20, GOLD);

// Controls
DrawRectangle(0, SCREEN_H - 30, SCREEN_W, 30, {0, 0, 0, 160});
DrawText("WASD = move     collect gold to unlock the exit", 220, SCREEN_H - 22, 16, LIGHTGRAY);
```

> 📌 The HP bar color shifts from green → orange → red as HP falls — a common game UI pattern. The three-way conditional `(hp > 50) ? green : (hp > 25) ? orange : red` chains two ternary operators.

### ✅ Checkpoint 5: HUD Displays (2 pts)
1. HP bar is visible and fills proportionally. Color shifts as HP changes (test by temporarily lowering `hp`).
2. Gold counter updates in real time as pickups are collected.
3. Control hint bar is visible at the bottom.

---

## Step F — Add a Patrolling Enemy

Add this struct above `main()` (or near your other structs):

```cpp
struct Enemy {
    Rectangle rect;
    float     speed;
    float     dirX;      // 1.0 = right, -1.0 = left
    int       damage;
    bool      alive;
};
```

Add one enemy to `main()` before the game loop:

```cpp
Enemy patrol = {{500.0f, 300.0f, 36.0f, 48.0f}, 120.0f, 1.0f, 10, true};
```

**Update logic (before `BeginDrawing`):**
```cpp
if (patrol.alive) {
    patrol.rect.x += patrol.speed * patrol.dirX * delta;

    // Reverse at room boundaries
    if (patrol.rect.x < 60)              patrol.dirX =  1.0f;
    if (patrol.rect.x > SCREEN_W - 100)  patrol.dirX = -1.0f;

    // Also reverse at interior walls
    for (Rectangle &w : walls)
        if (CheckCollisionRecs(patrol.rect, w)) { patrol.dirX *= -1.0f; break; }
}
```

**Draw (inside `BeginDrawing`/`EndDrawing`):**
```cpp
if (patrol.alive) {
    DrawRectangleRec(patrol.rect, {180, 40, 40, 255});
    DrawRectangleLinesEx(patrol.rect, 1, RED);
    DrawText("!", (int)patrol.rect.x + 12, (int)patrol.rect.y - 18, 22, RED);
}
```

### ✅ Checkpoint 6: Enemy Patrols (2 pts)
1. The enemy moves back and forth across the room continuously.
2. The enemy reverses direction when it reaches the room edges or hits an interior wall.

---

## Step G — Player-Enemy Collision

Add the player-enemy interaction. Taking damage applies a brief invincibility window so the player isn't drained instantly.

Add these variables with the others before the game loop:

```cpp
float iFrameTimer = 0.0f;   // invincibility frames after taking damage
```

**Update (before `BeginDrawing`):**
```cpp
// Invincibility timer
if (iFrameTimer > 0) iFrameTimer -= delta;

// Player hit by enemy
if (patrol.alive && iFrameTimer <= 0 && CheckCollisionRecs(player, patrol.rect)) {
    hp -= patrol.damage;
    if (hp < 0) hp = 0;
    iFrameTimer = 1.2f;   // 1.2 second invincibility window
    message  = "-" + to_string(patrol.damage) + " HP!";
    msgTimer = 1.0f;
}

// Player death
if (hp <= 0) {
    message  = "You died...";
    msgTimer = 999.0f;
}
```

Make the player flash during invincibility frames:

```cpp
// In the draw section, replace the plain DrawTextureRec with:
if (iFrameTimer <= 0 || (int)(iFrameTimer * 10) % 2 == 0) {
    DrawTextureRec(heroTex, srcRect, {player.x, player.y}, WHITE);
}
```

### ✅ Checkpoint 7: Enemy Damage Works (3 pts)
1. Walking into the enemy reduces HP by the enemy's damage value and shows a popup.
2. The player flashes briefly after taking damage — can't be hit again during that window.
3. HP bar updates immediately and color shifts as HP drops.

---

## Step H — Extensions (Early Finishers)

These are direct capstone building blocks — any of these you finish now is less work in May.

- **Enemy death:** Add a `bool` to your enemy. When the player walks into the enemy while holding Space, the enemy dies (set `alive = false`) and drops a gold pickup at its position.
- **Second room:** Add a second `GameState` (use an `enum class`). When the door triggers, switch state and draw a different room layout with new walls and pickups.
- **Sound:** raylib has `LoadSound`, `PlaySound`, and `UnloadSound`. Add a coin pickup sound and a damage sound using a free `.wav` from `kenney.nl`.
- **Camera follow:** Look up `Camera2D` in the raylib docs. Set `camera.target` to the player position each frame — the world scrolls as the player moves, enabling rooms larger than the screen.

---

## Grading Rubric — 15 Points

| Criteria | What to Show | Pts |
|---|---|---|
| Compiles and window opens | No errors, 960×640 window | 1 |
| Wall collision | All 7 walls block movement; player slides along walls diagonally | 4 |
| Pickups | Gold and potion disappear on contact, counters update, popup shows | 3 |
| Exit door | Locked until all gold collected; turns green and triggers message on entry | 2 |
| HUD | HP bar scales and changes color, gold counter live, control bar visible | 2 |
| Enemy patrols | Enemy moves and reverses at walls continuously | 2 |
| Enemy damage | HP reduced on contact, flash invincibility window, popup shows | 1 |
