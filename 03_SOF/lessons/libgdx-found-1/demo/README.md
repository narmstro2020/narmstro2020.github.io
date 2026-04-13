# 🎨 Sample Sprite Sheets — Animation Lesson

These sample sprite sheets let you test the animation code from today's notes
in a real libGDX project. Use them during the final project build as a
placeholder until you find/create your own art.

## Project Setup

Place all `.png` files in your libGDX project's assets folder:

```
your-game/
├── pom.xml
├── assets/
│   ├── player.png          ← put them here
│   ├── enemy-slime.png
│   └── coin.png
└── src/...
```

Then load them with `new Texture("player.png")` from your game code.

---

## The Files

### 🧍 `player.png` — 256 × 192

A 4×3 grid of 64×64 frames, organized by row:

| Row | Animation | Frames | Suggested PlayMode | Duration |
|-----|-----------|--------|--------------------|----------|
| 0   | Idle      | 4      | `LOOP`             | 0.2f     |
| 1   | Run       | 4      | `LOOP`             | 0.1f     |
| 2   | Jump      | 4      | `NORMAL`           | 0.15f    |

**Splitting it:**
```java
Texture sheet = new Texture("player.png");
TextureRegion[][] grid = TextureRegion.split(sheet, 64, 64);
// grid[row][col]
TextureRegion[] idleFrames = grid[0];  // row 0
TextureRegion[] runFrames  = grid[1];  // row 1
TextureRegion[] jumpFrames = grid[2];  // row 2
```

---

### 🟢 `enemy-slime.png` — 256 × 64

A single row of 4 frames, 64×64 each. A slime bouncing/squashing as it moves.

| Frames | Suggested PlayMode | Duration |
|--------|--------------------|----------|
| 4      | `LOOP`             | 0.15f    |

```java
Texture sheet = new Texture("enemy-slime.png");
TextureRegion[][] grid = TextureRegion.split(sheet, 64, 64);
Animation<TextureRegion> slimeAnim = new Animation<>(0.15f, grid[0]);
slimeAnim.setPlayMode(Animation.PlayMode.LOOP);
```

---

### 🪙 `coin.png` — 192 × 32

A single row of 6 frames, **32×32 each** (smaller than player/enemy!).
Shows a coin rotating through a full spin.

| Frames | Suggested PlayMode | Duration |
|--------|--------------------|----------|
| 6      | `LOOP`             | 0.08f    |

```java
Texture sheet = new Texture("coin.png");
TextureRegion[][] grid = TextureRegion.split(sheet, 32, 32);  // 32 not 64!
Animation<TextureRegion> coinAnim = new Animation<>(0.08f, grid[0]);
coinAnim.setPlayMode(Animation.PlayMode.LOOP);
```

---

## Quick Test — Minimal Screen

`AnimationDemoScreen.java` (in this folder) is a ready-to-run libGDX screen
that loads all three sheets, plays every animation, and shows the player
switching between idle/run/jump based on arrow key input. Drop it into your
project to verify your assets work before building game logic around them.

---

## A Note on Art Style

These sprites are intentionally simple placeholder graphics — just enough
geometry that you can see the animation cycle working. For your final game,
you're encouraged to replace them with:

- Your own hand-drawn art
- Free asset packs from [itch.io](https://itch.io/game-assets/free)
- [Kenney.nl](https://kenney.nl/assets) assets (public domain)
- [OpenGameArt.org](https://opengameart.org)

Keep the **same grid dimensions** if you want to drop-in replace them.
