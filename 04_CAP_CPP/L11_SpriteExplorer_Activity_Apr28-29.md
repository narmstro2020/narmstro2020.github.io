# Sprite Explorer
### Lesson 11 Activity | Sprites & Textures
### 15 Points | Accuracy Graded

---

# DAY 1 — APRIL 28 (second half of class)
## Load Textures & Build the Scene

> Start this after finishing the self-guided notes. Today you set up a new project, find and import sprite assets, and build a static dungeon scene using real textures. Tomorrow you animate your character and add movement.
>
> **Reference:** Lesson 11 notes — keep them open.

---

## Step A — Project Setup

Create a new CLion project called `SpriteExplorer`. Use the **FetchContent** `CMakeLists.txt` from Lesson 10, updated for this project, and add the asset-copy command:

```cmake
cmake_minimum_required(VERSION 3.26)
project(SpriteExplorer)

set(CMAKE_CXX_STANDARD 20)

include(FetchContent)
FetchContent_Declare(
    raylib
    GIT_REPOSITORY https://github.com/raysan5/raylib.git
    GIT_TAG master
)
FetchContent_MakeAvailable(raylib)

add_executable(SpriteExplorer main.cpp)
target_link_libraries(SpriteExplorer raylib)

# Copy assets folder to build output on every build
add_custom_command(TARGET SpriteExplorer POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/assets
    $<TARGET_FILE_DIR:SpriteExplorer>/assets
)
```

**Create the assets folder:**
In your project root (same level as `main.cpp`), create a folder called `assets`. This is where all your image files will live.

Start `main.cpp` with:

```cpp
#include "raylib.h"

const int SCREEN_W = 960;
const int SCREEN_H = 640;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "Sprite Explorer");
    SetTargetFPS(60);

    // TODO: load textures here

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        // TODO: draw here

        EndDrawing();
    }

    // TODO: unload textures here
    CloseWindow();
    return 0;
}
```

### ✅ Checkpoint 1: Window Opens (1 pt)
A black 960×640 window opens and closes cleanly. Reload CMake if needed after editing `CMakeLists.txt`.

---

## Step B — Find & Import Assets

You need at least **two** image files for this activity:

1. **A character sprite sheet** — a single PNG with at least 2 walk-cycle frames side by side (4 frames preferred). Each frame should be the same width.
2. **A background or tileset image** — a dungeon floor, grass tile, or any scene background.

**Where to find them (free, no account needed):**
- `https://kenney.nl/assets` — search "RPG" or "Dungeon". The "Tiny Dungeon" pack is a good match.
- `https://opengameart.org` — filter by 2D, license CC0.
- `https://itch.io` — filter Free → Assets → Sprites.

**What to look for:**
- PNG format
- Character sheet where all frames are equal width (check the asset description — it usually tells you frame size)
- A background that is at least 960×640, or a small tile you can repeat

**Once downloaded:**
- Copy the character sheet into your `assets/` folder. Rename it something simple like `hero.png`.
- Copy the background into `assets/`. Rename it `background.png`.
- Note the frame width and height — you'll need those numbers in Step D.

### ✅ Checkpoint 2: Assets in Folder (1 pt)
Your `assets/` folder contains at least `hero.png` and `background.png`. Both are PNG files. The project still compiles after reload.

---

## Step C — Load & Draw the Background

Load your background texture and draw it. If your background image is smaller than the screen, tile it using a nested loop.

**Single large background (fits the whole screen):**
```cpp
// Above the game loop:
Texture2D background = LoadTexture("assets/background.png");

// Inside BeginDrawing/EndDrawing:
DrawTexture(background, 0, 0, WHITE);

// Before CloseWindow:
UnloadTexture(background);
```

**Small tile (repeat to fill screen):**
```cpp
// Inside BeginDrawing/EndDrawing:
int tileW = background.width;
int tileH = background.height;

for (int y = 0; y < SCREEN_H; y += tileH) {
    for (int x = 0; x < SCREEN_W; x += tileW) {
        DrawTexture(background, x, y, WHITE);
    }
}
```

Use whichever approach fits your asset.

### ✅ Checkpoint 3: Background Fills Screen (2 pts)
The background image (or tiled version) covers the entire 960×640 window with no black gaps. No colored rectangles — real texture only.

---

## Step D — Draw the Static Character

Load your character sprite sheet and draw **one frame** of it at a fixed position. You're not animating yet — just confirming the texture loads and the frame crop works.

```cpp
// Above the game loop — replace with your actual frame dimensions:
Texture2D hero    = LoadTexture("assets/hero.png");
int frameWidth    = 32;    // ← change to match your sprite sheet
int frameHeight   = 32;    // ← change to match your sprite sheet
int totalFrames   = 4;     // ← how many frames across the sheet

// Inside BeginDrawing/EndDrawing:
Rectangle srcRect = {0.0f, 0.0f, (float)frameWidth, (float)frameHeight};
Vector2   heroPos = {440.0f, 300.0f};
DrawTextureRec(hero, srcRect, heroPos, WHITE);

// Before CloseWindow:
UnloadTexture(hero);
```

> 📌 If your sprite appears as a tiny speck, use `DrawTextureEx` to scale it up:
> ```cpp
> DrawTextureEx(hero, heroPos, 0.0f, 3.0f, WHITE);  // 3x scale
> ```
> For `DrawTextureEx`, `srcRect` is not used — it always draws the full texture. To draw one frame at scale, use `DrawTexturePro` (covered below in the extension).

### ✅ Checkpoint 4: Character Frame Draws (3 pts)
1. The character sprite is visible on screen, not a colored rectangle.
2. The frame is cropped correctly — you see one character pose, not the whole sheet.
3. The sprite is large enough to see clearly (scale up if needed).

---

## Step E — Day 1 Overlay

Add a semi-transparent dark overlay behind text to make it readable over any background:

```cpp
DrawRectangle(0, 0, SCREEN_W, 40, {0, 0, 0, 140});   // top bar
DrawText("Sprite Explorer", 10, 10, 24, WHITE);
DrawFPS(SCREEN_W - 80, 10);
```

### ✅ Checkpoint 5: Overlay & Text (1 pt)
A semi-transparent bar runs across the top. The title and FPS counter are legible over it.

---

## Day 1 Extension (if time remains)

- Draw the full sprite sheet in a corner at small scale so you can see all frames at once — useful for debugging frame crops.
- Add a second character or enemy sprite from a different asset.
- Draw the character name below the sprite using `DrawText`.

---
---

# DAY 2 — APRIL 29
## Animate & Move the Character

> Continue in the same project. Today you add a frame counter to animate the character, wire up keyboard input to move them around the screen, and flip the sprite based on direction.

---

## Step F — Add the Frame Counter

Add these variables above the game loop:

```cpp
float frameTimer   = 0.0f;
float frameSpeed   = 0.12f;   // seconds per frame
int   currentFrame = 0;
```

Add this update block **before** `BeginDrawing`:

```cpp
float delta = GetFrameTime();

frameTimer += delta;
if (frameTimer >= frameSpeed) {
    frameTimer    = 0.0f;
    currentFrame  = (currentFrame + 1) % totalFrames;
}
```

Update your `srcRect` each frame so it reflects the current frame:

```cpp
Rectangle srcRect = {
    (float)(currentFrame * frameWidth),
    0.0f,
    (float)frameWidth,
    (float)frameHeight
};
```

### ✅ Checkpoint 6: Character Animates (3 pts)
1. The character cycles through all frames in order.
2. The animation speed is smooth — not flickering instantly, not stuck.
3. The loop wraps back to frame 0 correctly after the last frame.

---

## Step G — Add Movement

Add player position variables above the game loop:

```cpp
float heroX     = 440.0f;
float heroY     = 300.0f;
float heroSpeed = 200.0f;
bool  moving    = false;
```

Add movement input **before** `BeginDrawing`, after the frame timer block:

```cpp
moving = false;

if (IsKeyDown(KEY_D) || IsKeyDown(KEY_RIGHT)) { heroX += heroSpeed * delta; moving = true; }
if (IsKeyDown(KEY_A) || IsKeyDown(KEY_LEFT))  { heroX -= heroSpeed * delta; moving = true; }
if (IsKeyDown(KEY_S) || IsKeyDown(KEY_DOWN))  { heroY += heroSpeed * delta; moving = true; }
if (IsKeyDown(KEY_W) || IsKeyDown(KEY_UP))    { heroY -= heroSpeed * delta; moving = true; }

// Keep on screen
if (heroX < 0)                        heroX = 0;
if (heroX > SCREEN_W - frameWidth)    heroX = SCREEN_W - frameWidth;
if (heroY < 0)                        heroY = 0;
if (heroY > SCREEN_H - frameHeight)   heroY = SCREEN_H - frameHeight;
```

**Pause animation when not moving:**

```cpp
if (moving) {
    frameTimer += delta;
    if (frameTimer >= frameSpeed) {
        frameTimer   = 0.0f;
        currentFrame = (currentFrame + 1) % totalFrames;
    }
} else {
    currentFrame = 0;   // rest on frame 0 when idle
    frameTimer   = 0.0f;
}
```

Update your draw call to use the live position:

```cpp
Vector2 heroPos = {heroX, heroY};
DrawTextureRec(hero, srcRect, heroPos, WHITE);
```

### ✅ Checkpoint 7: Movement Works (3 pts)
1. WASD or arrow keys move the character smoothly across the background.
2. The character stays within screen bounds on all four sides.
3. The animation plays while moving and pauses (holds frame 0) when still.

---

## Step H — Flip Direction

When the character moves left, the sprite should face left. Add a `facingRight` boolean:

```cpp
bool facingRight = true;
```

Update it inside the movement block:

```cpp
if (IsKeyDown(KEY_D) || IsKeyDown(KEY_RIGHT)) facingRight = true;
if (IsKeyDown(KEY_A) || IsKeyDown(KEY_LEFT))  facingRight = false;
```

Flip the sprite horizontally by making `srcRect.width` negative when facing left:

```cpp
Rectangle srcRect = {
    (float)(currentFrame * frameWidth),
    0.0f,
    facingRight ? (float)frameWidth : -(float)frameWidth,
    (float)frameHeight
};
```

> 📌 A negative width in `srcRect` is raylib's built-in way to flip a texture horizontally — no extra function needed.

### ✅ Checkpoint 8: Sprite Flips (1 pt)
Moving right shows the sprite facing right. Moving left shows the sprite mirrored (facing left). No separate left-facing asset required.

---

## Extensions (Early Finishers)

- **Idle animation:** If your sprite sheet has idle frames on a second row (`srcRect.y = frameHeight`), switch rows when not moving.
- **Shadow:** Draw a dark semi-transparent ellipse just below the character position to simulate a ground shadow.
- **Collectible:** Place a second small texture (a coin, gem, or chest) somewhere on screen. When the player walks over it, remove it and display a "Collected!" message for 2 seconds.
- **Scale on direction:** Use `DrawTextureEx` to slightly scale the character up (1.05×) when moving and back to 1.0× when idle — subtle but gives a feel of momentum.

---

## Grading Rubric — 15 Points

| Criteria | What to Show | Pts |
|---|---|---|
| Window opens cleanly | 960×640 window, correct title, no crash | 1 |
| Assets in project | `hero.png` and `background.png` present, project compiles | 1 |
| Background fills screen | Full coverage, tiled or single image, no black gaps | 2 |
| Character frame draws | Sprite visible, correctly cropped to one frame, scaled legibly | 3 |
| UI overlay | Semi-transparent bar, title and FPS readable on top | 1 |
| Animation plays | All frames cycle in order at smooth speed, wraps correctly | 3 |
| Movement with bounds | WASD moves character, all four edges enforced | 3 |
| Sprite flips | Faces right when moving right, faces left when moving left | 1 |
