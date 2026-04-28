# Lesson 11: Sprites & Textures
### Self-Guided Notes | Tuesday, April 28, 2026
### Work through this first — activity starts when you're done

---

> **Goal:** Learn how to load image files into raylib, draw them to the screen, and animate a sprite sheet using a frame counter. By the end of this lesson your game will have real art instead of colored rectangles.

---

## Part 1: Textures vs. Images

raylib has two related types:

| Type | Lives in... | Used for... |
|---|---|---|
| `Image` | CPU (regular memory) | Loading, editing pixels |
| `Texture2D` | GPU (video memory) | Drawing to the screen |

You almost always load an `Image` from disk and immediately convert it to a `Texture2D`. Once it's on the GPU, drawing is very fast.

```cpp
Image img      = LoadImage("hero.png");       // load from disk into CPU
Texture2D tex  = LoadTextureFromImage(img);   // send to GPU
UnloadImage(img);                             // CPU copy no longer needed
```

Or the shortcut when you don't need to edit the pixels first:

```cpp
Texture2D tex = LoadTexture("hero.png");      // load + send in one step
```

> ⚠️ **Always call `UnloadTexture(tex)` before `CloseWindow()`** — textures live on the GPU and won't be freed automatically.

---

## Part 2: Where to Put Your Image Files

raylib looks for files **relative to where the executable runs**. In CLion that is the `cmake-build-debug` folder by default — but that's inconvenient.

**Easier approach: copy assets next to the executable automatically.**

Add this to your `CMakeLists.txt` after `target_link_libraries`:

```cmake
# Copy assets folder to build directory on every build
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/assets
    $<TARGET_FILE_DIR:${PROJECT_NAME}>/assets
)
```

Then create an `assets/` folder inside your project root (same level as `main.cpp`) and put all your images there. Load them like this:

```cpp
Texture2D tex = LoadTexture("assets/hero.png");
```

---

## Part 3: Drawing a Texture

```cpp
// Draw at a position (top-left corner of the texture)
DrawTexture(tex, x, y, WHITE);   // WHITE tint = original colors

// Draw with a tint color (multiplied with original pixels)
DrawTexture(tex, x, y, RED);     // everything tinted red

// Draw with scale and rotation
DrawTextureEx(tex, {x, y}, rotation, scale, WHITE);
// rotation = degrees, scale = 1.0 is original size, 2.0 is double
```

**▶ TRY IT — Full working example:**

```cpp
#include "raylib.h"

int main() {
    InitWindow(800, 600, "Texture Test");
    SetTargetFPS(60);

    Texture2D hero = LoadTexture("assets/hero.png");

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        DrawTexture(hero, 100, 100, WHITE);           // normal
        DrawTextureEx(hero, {300, 100}, 0.0f, 2.0f, WHITE);  // 2x size
        DrawTextureEx(hero, {550, 100}, 45.0f, 1.0f, WHITE); // rotated

        EndDrawing();
    }

    UnloadTexture(hero);
    CloseWindow();
    return 0;
}
```

---

## Part 4: Sprite Sheets & Animation

A **sprite sheet** is one image file containing multiple animation frames laid out in a grid. Instead of loading a separate file per frame, you load one sheet and draw a different rectangle from it each frame.

```
┌─────────────────────────┐
│  [0]  [1]  [2]  [3]     │  ← walk cycle frames, each 32×32 px
└─────────────────────────┘
```

Use `DrawTextureRec` to draw one rectangular region of a texture:

```cpp
// Assumes each frame is 32×32 pixels, 4 frames across
int frameWidth  = 32;
int frameHeight = 32;
int currentFrame = 0;   // 0, 1, 2, or 3

Rectangle srcRect = {
    (float)(currentFrame * frameWidth),  // x into the sheet
    0.0f,                                // y into the sheet
    (float)frameWidth,
    (float)frameHeight
};

Vector2 position = {200.0f, 300.0f};
DrawTextureRec(sheet, srcRect, position, WHITE);
```

**Advancing frames over time:**

```cpp
float frameTimer  = 0.0f;
float frameSpeed  = 0.12f;   // seconds per frame (~8 FPS animation)
int   totalFrames = 4;

// In the game loop, before BeginDrawing:
float delta = GetFrameTime();
frameTimer += delta;
if (frameTimer >= frameSpeed) {
    frameTimer = 0.0f;
    currentFrame = (currentFrame + 1) % totalFrames;  // wraps 3 → 0
}
```

**▶ TRY IT — Walk through the logic on paper:**

> 🤔 If `frameSpeed = 0.12f` and the game runs at 60 FPS, roughly how many game frames pass before the animation advances one frame?
>
> _______________________________________________

---

## Part 5: Finding Free Sprite Assets

You need actual image files to work with. Good free sources:

- **itch.io** — search "free RPG sprites" or "free tileset" → filter by Free. Many are CC0 (public domain).
- **OpenGameArt.org** — large library of CC0 and CC-BY assets.
- **Kenney.nl** — huge collection of free game assets, all CC0, very beginner-friendly.

For today's activity, a simple 4-frame walk-cycle sprite sheet works best. Look for one where all frames are the same size (e.g., 16×16, 32×32, or 48×48 each).

> 📌 **PNG is the preferred format** — raylib handles transparency (alpha channel) in PNGs automatically with no extra code.

---

## Self-Check — No Grade

1. What's the difference between `Image` and `Texture2D`? Which one do you use for drawing?
2. Why do you need `UnloadTexture()` before `CloseWindow()`?
3. What does `DrawTextureRec` do that `DrawTexture` doesn't?
4. If your sprite sheet has 6 frames each 48px wide, what is the `srcRect.x` value for frame 3 (zero-indexed)?
5. What does `% totalFrames` do in the frame counter expression `(currentFrame + 1) % totalFrames`?

---

**Done? Flip to the activity and start Step A.**
