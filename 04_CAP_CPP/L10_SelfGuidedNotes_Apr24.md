# Lesson 10: Intro to raylib
### Self-Guided Notes | Thursday, April 24, 2026
### Work through this first — activity starts when you're done

---

> **Goal:** Get raylib installed and working, understand the game loop, and be able to open a window and draw to it. Parts 1–2 are setup — follow every step carefully. Parts 3–5 are the actual coding concepts.

---

## Part 1: Installing raylib on Windows

You only do this once. Follow each step exactly.

**Step 1 — Download raylib**

1. Open a browser and go to: `https://github.com/raysan5/raylib/releases`
2. Find the latest release (5.x). Under **Assets**, download:
   `raylib-5.x_win64_mingw-w64.zip`
3. Extract the zip. Inside you'll find an `include/` folder and a `lib/` folder.
4. Create the folder `C:\raylib` and copy the extracted contents there so you end up with:
   ```
   C:\raylib\include\raylib.h
   C:\raylib\lib\libraylib.a
   ```

**Step 2 — Create a CLion project with the right CMakeLists.txt**

1. In CLion: **File → New Project → C++ Executable**. Name it `RaylibTest`.
2. After the project opens, find `CMakeLists.txt` in the project root and **replace its entire contents** with:

```cmake
cmake_minimum_required(VERSION 3.26)
project(RaylibTest)

set(CMAKE_CXX_STANDARD 17)

set(RAYLIB_DIR "C:/raylib")

add_executable(RaylibTest main.cpp)

target_include_directories(RaylibTest PRIVATE ${RAYLIB_DIR}/include)
target_link_directories(RaylibTest PRIVATE ${RAYLIB_DIR}/lib)
target_link_libraries(RaylibTest raylib opengl32 gdi32 winmm)
```

3. CLion will show a banner saying CMake needs to reload — click **Reload CMake Project**.

**Step 3 — Test the installation**

Replace the contents of `main.cpp` with:

```cpp
#include "raylib.h"

int main() {
    InitWindow(800, 600, "raylib works!");
    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(RAYWHITE);
        DrawText("Hello, dungeon!", 200, 280, 30, DARKGRAY);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
```

Build and run. You should see a white window with gray text. If you get a linker error, double-check the paths in `CMakeLists.txt` and confirm the files exist at `C:\raylib\include\raylib.h` and `C:\raylib\lib\libraylib.a`.

> ⚠️ **Note:** `#include "raylib.h"` uses quotes, not angle brackets, since it's not a system library.

---

## Part 2: The Game Loop

Every real-time game — raylib or otherwise — runs the same basic loop over and over, as fast as the CPU will allow (or locked to a frame rate):

```
while the window is open:
    1. Process input
    2. Update game state
    3. Draw everything
```

In raylib that looks like this:

```cpp
InitWindow(800, 600, "My Game");
SetTargetFPS(60);               // lock to 60 frames per second

while (!WindowShouldClose()) {  // runs until the user closes the window
    // 1. Input & update (logic goes here)

    BeginDrawing();             // 2. Start the frame
    ClearBackground(BLACK);     // wipe last frame
    // Draw calls go here
    EndDrawing();               // 3. Show the frame
}

CloseWindow();
```

> 📌 **Everything you draw must be between `BeginDrawing()` and `EndDrawing()`.**
> `ClearBackground()` wipes the previous frame — without it, every frame stacks on the last one.

---

## Part 3: The Coordinate System

raylib's window uses a 2D coordinate system where **(0, 0) is the top-left corner**. X increases to the right, Y increases downward.

```
(0,0) ─────────────────→ X
  │
  │      (400, 300) = center of an 800×600 window
  │
  ↓
  Y
```

All drawing functions take positions as `(x, y)` with this system in mind.

---

## Part 4: Drawing Shapes and Text

```cpp
// Rectangles
DrawRectangle(x, y, width, height, color);
DrawRectangleLines(x, y, width, height, color);  // outline only

// Circles
DrawCircle(centerX, centerY, radius, color);

// Lines
DrawLine(x1, y1, x2, y2, color);

// Text
DrawText("Hello!", x, y, fontSize, color);

// FPS counter (useful for debugging)
DrawFPS(10, 10);
```

**Built-in colors you can use by name:**
`BLACK`, `WHITE`, `RAYWHITE`, `DARKGRAY`, `GRAY`, `LIGHTGRAY`,
`RED`, `DARKRED`, `GREEN`, `DARKGREEN`, `BLUE`, `DARKBLUE`,
`PURPLE`, `DARKPURPLE`, `YELLOW`, `GOLD`, `ORANGE`, `BROWN`,
`SKYBLUE`, `BEIGE`, `MAROON`, `PINK`, `LIME`, `VIOLET`

**Custom colors** use `{R, G, B, A}` (0–255 each, A = alpha/transparency):
```cpp
Color myColor = {100, 50, 200, 255};
```

**▶ TRY IT — Replace your `main.cpp` with this and run it:**

```cpp
#include "raylib.h"

int main() {
    InitWindow(800, 600, "Shapes Test");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        DrawRectangle(100, 100, 200, 80, DARKPURPLE);
        DrawRectangleLines(100, 100, 200, 80, PURPLE);
        DrawCircle(500, 200, 50, GOLD);
        DrawLine(0, 300, 800, 300, DARKGRAY);
        DrawText("Dungeon Awaits", 220, 400, 40, WHITE);
        DrawFPS(10, 10);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}
```

---

## Part 5: Rectangles as Data — `Rectangle`

raylib has a built-in `Rectangle` struct you'll use constantly for positioning, collision, and UI:

```cpp
Rectangle box = {100, 200, 150, 50};   // x, y, width, height
DrawRectangleRec(box, RED);
DrawRectangleLinesEx(box, 2, WHITE);    // outline, 2px thick
```

This matters because later you'll use the same `Rectangle` for both drawing *and* collision detection — you define the position once and use it everywhere.

**▶ TRY IT — Add a `Rectangle` to your scene. Move its `x` and `y` values around to see how position changes.**

---

## Self-Check — No Grade

1. What does `ClearBackground()` do and why is it needed every frame?
2. In an 800×600 window, what coordinates are the exact center?
3. What is wrong with this code?
   ```cpp
   BeginDrawing();
   InitWindow(800, 600, "Game");
   DrawText("Hi", 100, 100, 20, WHITE);
   EndDrawing();
   ```
4. Write the `DrawRectangle` call that draws a 60×20 health bar at position (20, 20) in green.

---

**Done? Flip to the activity and start Step A.**
