# Dungeon Screen
### Lesson 10 Activity | Intro to raylib
### 15 Points | Accuracy Graded

---

# DAY 1 — APRIL 24 (second half of class)
## Draw the Scene

> Start this after finishing the self-guided notes and confirming raylib opens a window. Today you draw a complete dungeon title screen using shapes and text. Tomorrow you add a HUD, an animated element, and a second screen.
>
> **Reference:** Lesson 10 notes — keep them open.

---

## Step A — New Project

Create a new CLion project called `DungeonScreen`. Set up `CMakeLists.txt` the same way you did in the notes — just change the project name:

```cmake
cmake_minimum_required(VERSION 3.26)
project(DungeonScreen)

set(CMAKE_CXX_STANDARD 20)

include(FetchContent)

FetchContent_Declare(
        raylib
        GIT_REPOSITORY https://github.com/raysan5/raylib.git
        GIT_TAG master
)
FetchContent_MakeAvailable(raylib)

add_executable(DungeonScreen main.cpp)
target_link_libraries(DungeonScreen raylib)

```

Start `main.cpp` with this skeleton:

```cpp
#include "raylib.h"

const int SCREEN_W = 900;
const int SCREEN_H = 600;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "Dungeon Screen");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        // TODO: drawing goes here

        EndDrawing();
    }

    CloseWindow();
    return 0;
}
```

### ✅ Checkpoint 1: Window Opens (1 pt)
A black 900×600 window appears. It closes cleanly when you click X or press Escape.

---

## Step B — Background & Sky

The scene is a dungeon exterior at night. Build it from the bottom up.

**Sky gradient effect (two layered rectangles):**
```cpp
DrawRectangle(0, 0, SCREEN_W, SCREEN_H / 2, {10, 5, 30, 255});      // deep night sky
DrawRectangle(0, SCREEN_H / 2, SCREEN_W, SCREEN_H / 2, {20, 12, 8, 255}); // dark ground
```

**Stars (draw at least 8 small circles scattered across the top half):**
```cpp
DrawCircle(80,  40,  2, RAYWHITE);
DrawCircle(200, 70,  2, RAYWHITE);
DrawCircle(350, 25,  3, RAYWHITE);
// add 5 more at different positions...
```

**Moon:**
```cpp
DrawCircle(750, 80, 40, {230, 230, 200, 255});   // moon
DrawCircle(770, 65, 38, {10, 5, 30, 255});        // shadow circle that creates crescent shape
```

### ✅ Checkpoint 2: Sky & Ground Draw (2 pts)
The top half of the window shows a dark night sky with at least 8 stars and a crescent moon. The bottom half is dark ground. No plain black background.

---

## Step C — The Dungeon Gate

Draw a stone dungeon entrance using rectangles and a circle arch.

```cpp
// Gate frame (stone walls)
DrawRectangle(330, 200, 80,  300, DARKGRAY);   // left pillar
DrawRectangle(490, 200, 80,  300, DARKGRAY);   // right pillar
DrawRectangle(300, 180, 300, 40,  GRAY);       // top lintel

// Arch opening
DrawCircle(450, 240, 80, BLACK);               // arch top (dark = open passage)
DrawRectangle(370, 240, 160, 260, BLACK);      // arch body

// Gate details
DrawRectangleLines(330, 200, 80,  300, LIGHTGRAY);  // left pillar outline
DrawRectangleLines(490, 200, 80,  300, LIGHTGRAY);  // right pillar outline
DrawText("DUNGEON",  385, 410, 24, {180, 60, 60, 255});
```

### ✅ Checkpoint 3: Gate Draws (3 pts)
A stone gate arch is visible against the background. The opening is dark (looks like a passage). Both pillars and the lintel are visible. The word DUNGEON appears inside the arch.

---

## Step D — Title and Prompt Text

Add the game title at the top and a prompt at the bottom.

```cpp
// Title
DrawText("SHADOW KEEP",       180, 60,  52, {200, 160, 255, 255});
DrawText("SHADOW KEEP",       182, 62,  52, {100, 50,  180, 255});  // shadow offset

// Prompt (you'll make this blink tomorrow — for now just draw it)
DrawText("Press ENTER to begin", 285, 540, 22, LIGHTGRAY);
```

> 📌 Drawing the same text twice with a 2px offset and a darker color creates a drop shadow effect — a common raylib trick.

### ✅ Checkpoint 4: Title & Prompt Display (2 pts)
"SHADOW KEEP" appears with a visible drop shadow effect. The prompt text is visible at the bottom of the screen.

---

## Day 1 Extension (if time remains)

- Add torch flames using two overlapping circles near each pillar — one orange, one yellow, slightly smaller.
- Draw a row of mountains or hills on the horizon using `DrawTriangle`.
- Add a subtitle line in smaller text below the title.

---
---

# DAY 2 — APRIL 27
## Add the HUD, Animation & a Second Screen

> Continue in the same project. Today you add variables to track state, make the prompt blink, and build a second "game" screen with a moving player rectangle and a HUD overlay.

---

## Step E — Variables & Game State

At the top of `main()`, add these variables before the game loop. You'll use them throughout Day 2.

```cpp
// Game state
bool onTitleScreen = true;

// Animation
float blinkTimer   = 0.0f;
bool  showPrompt   = true;

// Player (used on game screen)
float playerX      = 430.0f;
float playerY      = 490.0f;
const float SPEED  = 180.0f;

// Player stats for HUD
int playerHP       = 100;
int playerMaxHP    = 100;
int playerGold     = 0;
```

Also add this line at the very top of the game loop, before `BeginDrawing`:

```cpp
float delta = GetFrameTime();   // seconds since last frame
```

> 📌 `GetFrameTime()` returns the time since the last frame in seconds (roughly 0.016 at 60 FPS). Multiplying speed values by `delta` makes movement **frame-rate independent** — the player moves the same distance per second regardless of FPS.

---

## Step F — Screen Switching & Blinking Prompt

Wrap your existing title screen drawing in an `if (onTitleScreen)` block. Add the blink logic and ENTER key detection.

```cpp
// Before BeginDrawing — update logic:
if (onTitleScreen) {
    blinkTimer += delta;
    if (blinkTimer >= 0.6f) {
        showPrompt  = !showPrompt;
        blinkTimer  = 0.0f;
    }
    if (IsKeyPressed(KEY_ENTER)) {
        onTitleScreen = false;
    }
}

// Inside BeginDrawing/EndDrawing:
if (onTitleScreen) {
    // ... all your Day 1 drawing code ...

    // Replace the static prompt with the blinking version:
    if (showPrompt)
        DrawText("Press ENTER to begin", 285, 540, 22, LIGHTGRAY);
}
```

### ✅ Checkpoint 5: Blink & Screen Switch Work (2 pts)
The prompt text blinks on and off approximately every 0.6 seconds. Pressing ENTER switches to a black screen (the game screen you'll build next).

---

## Step G — The Game Screen

Add an `else` branch for the game screen. This is a simple top-down dungeon room.

```cpp
else {
    // ── UPDATE ──────────────────────────────────────────────
    if (IsKeyDown(KEY_W) || IsKeyDown(KEY_UP))    playerY -= SPEED * delta;
    if (IsKeyDown(KEY_S) || IsKeyDown(KEY_DOWN))  playerY += SPEED * delta;
    if (IsKeyDown(KEY_A) || IsKeyDown(KEY_LEFT))  playerX -= SPEED * delta;
    if (IsKeyDown(KEY_D) || IsKeyDown(KEY_RIGHT)) playerX += SPEED * delta;

    // Keep player inside dungeon room (leave room for walls)
    if (playerX < 20)            playerX = 20;
    if (playerX > SCREEN_W - 40) playerX = SCREEN_W - 40;
    if (playerY < 60)            playerY = 60;
    if (playerY > SCREEN_H - 60) playerY = SCREEN_H - 60;

    // ── DRAW ────────────────────────────────────────────────
    // Floor
    DrawRectangle(0, 40, SCREEN_W, SCREEN_H - 40, {30, 20, 15, 255});

    // Walls (border)
    DrawRectangle(0,  0, SCREEN_W, 40,  DARKGRAY);
    DrawRectangle(0,  SCREEN_H - 20, SCREEN_W, 20, DARKGRAY);
    DrawRectangle(0,  0, 20, SCREEN_H, DARKGRAY);
    DrawRectangle(SCREEN_W - 20, 0, 20, SCREEN_H, DARKGRAY);

    // Player
    DrawRectangle((int)playerX, (int)playerY, 24, 24, {100, 180, 255, 255});
    DrawRectangleLines((int)playerX, (int)playerY, 24, 24, WHITE);
}
```

### ✅ Checkpoint 6: Player Moves in Room (3 pts)
1. A blue rectangle moves with W/A/S/D (or arrow keys).
2. The player cannot move past any of the four walls.
3. Movement feels smooth — not lurching or stuttering.

---

## Step H — HUD Overlay

Add this at the end of the game screen draw block, after all room/player drawing. The HUD always draws on top.

```cpp
// ── HUD ─────────────────────────────────────────────────────

// HP bar background
DrawRectangle(10, 8, 200, 22, DARKGRAY);
// HP bar fill — width scales with current HP
int hpBarWidth = (int)(200.0f * playerHP / playerMaxHP);
DrawRectangle(10, 8, hpBarWidth, 22, {60, 180, 60, 255});
DrawRectangleLines(10, 8, 200, 22, WHITE);
DrawText(TextFormat("HP: %d / %d", playerHP, playerMaxHP), 15, 10, 18, WHITE);

// Gold counter
DrawText(TextFormat("Gold: %d", playerGold), 720, 10, 20, GOLD);

// Controls reminder
DrawText("WASD = move   ESC = quit", 280, SCREEN_H - 18, 16, DARKGRAY);
```

> 📌 `TextFormat("HP: %d / %d", playerHP, playerMaxHP)` works like `printf` — `%d` is replaced by the integer values. This is raylib's way of drawing dynamic numbers without `cout`.

### ✅ Checkpoint 7: HUD Displays (2 pts)
1. A green HP bar is visible in the top-left and proportionally represents current HP.
2. A gold counter is visible in the top-right.
3. The controls reminder appears at the bottom.
4. **Verify the bar:** Temporarily set `playerHP = 50` in your variable declarations. The bar should fill exactly halfway. Set it back to 100 when done.

---

## Extensions (Early Finishers)

- **Collectible gold:** Place a yellow circle somewhere in the room. When the player's rectangle overlaps it (`CheckCollisionPointRec` or a simple distance check), increment `playerGold` by 10 and move the coin to a new position.
- **Damage zone:** Draw a red rectangle somewhere in the room. Each frame the player overlaps it, decrease `playerHP` by 1. Add a check so HP doesn't go below 0.
- **Room name:** Draw the current room name (e.g., "The Entrance Hall") at the top center, inside the wall strip.
- **Back to title:** Press Escape on the game screen to return to `onTitleScreen = true`.

---

## Grading Rubric — 15 Points

| Criteria | What to Show | Pts |
|---|---|---|
| Window opens and closes cleanly | 900×600 window, correct title bar, no crash on close | 1 |
| Sky & ground background | Night sky, 8+ stars, crescent moon, dark ground | 2 |
| Dungeon gate | Two pillars, lintel, dark arch opening, DUNGEON text | 3 |
| Title & prompt text | "SHADOW KEEP" with drop shadow, prompt visible | 2 |
| Blink & screen switch | Prompt blinks ~0.6s interval, ENTER switches screens | 2 |
| Player movement with bounds | WASD moves player smoothly, all four walls enforced | 3 |
| HUD displays | HP bar scales correctly, gold counter visible, controls reminder | 2 |
