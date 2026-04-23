package io.github.found1;

// ============================================================
// 🎮 GAMEPLAY MECHANICS ACTIVITY
// ============================================================
//
// Activity — Apr 21, 2026 · 15 pts
//
// You've animated your player. Now make the game PLAY like a game.
// This activity adds gravity, ground collision, patrolling enemies,
// and collectible coins to a working screen.
//
// SETUP:
//   1. Ensure player.png, enemy-slime.png, coin.png are in assets/
//   2. Add this file next to Main.java
//   3. In Main.java: setScreen(new GameplayScreen());
//
// WHAT "DONE" LOOKS LIKE:
//   ☐ Player falls due to gravity and lands on the ground
//   ☐ LEFT/RIGHT moves the player, SPACE jumps
//   ☐ Two slime enemies patrol back and forth between boundaries
//   ☐ Walking into a slime resets the player to start position
//   ☐ Five coins hover in the air — walking through one collects it
//   ☐ Score displays in the console when a coin is collected
//   ☐ All collision uses Rectangle.overlaps()
//
// ============================================================

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Animation;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.math.Rectangle;

import java.util.ArrayList;
import java.util.Iterator;

public class GameplayScreen implements Screen {

    // ── Constants ──
    private static final float GRAVITY = -500f;       // pixels/sec² (pulls DOWN)
    private static final float JUMP_VELOCITY = 300f;   // pixels/sec (launches UP)
    private static final float MOVE_SPEED = 150f;      // pixels/sec (left/right)
    private static final float GROUND_Y = 50f;         // y-position of the ground

    // ── Core rendering ──
    private SpriteBatch batch;
    private OrthographicCamera camera;

    // ── Textures & animations ──
    private Texture playerSheet, enemySheet, coinSheet;
    private Animation<TextureRegion> idleAnim, runAnim, jumpAnim;
    private Animation<TextureRegion> slimeAnim, coinAnim;
    private float stateTime = 0f;

    // ── Player state ──
    private float playerX = 100f;
    private float playerY = GROUND_Y;
    private float velocityY = 0f;       // current vertical speed
    private boolean onGround = true;
    private boolean facingRight = true;

    // ── Enemies ──
    // Each enemy is represented by a float[]: {x, y, speed, leftBound, rightBound}
    private ArrayList<float[]> enemies;

    // ── Coins ──
    // Each coin is a Rectangle (x, y, width, height) — removed on collection
    private ArrayList<Rectangle> coins;
    private int score = 0;

    // ── Player bounding box ──
    private Rectangle playerBounds;


    // ══════════════════════════════════════════════════════════
    // SECTION 1: Setup — Load assets and initialize game objects
    // (3 pts)
    // ══════════════════════════════════════════════════════════

    @Override
    public void show() {
        batch = new SpriteBatch();
        camera = new OrthographicCamera();
        camera.setToOrtho(false, 640, 480);

        // ── Load and split player sheet (done for you) ──
        playerSheet = new Texture("player.png");
        TextureRegion[][] pGrid = TextureRegion.split(playerSheet, 64, 64);
        idleAnim = new Animation<>(0.2f, pGrid[0]);
        runAnim  = new Animation<>(0.1f, pGrid[1]);
        jumpAnim = new Animation<>(0.15f, pGrid[2]);
        idleAnim.setPlayMode(Animation.PlayMode.LOOP);
        runAnim.setPlayMode(Animation.PlayMode.LOOP);
        jumpAnim.setPlayMode(Animation.PlayMode.NORMAL);

        // ── Load enemy and coin sheets (done for you) ──
        enemySheet = new Texture("enemy-slime.png");
        TextureRegion[][] eGrid = TextureRegion.split(enemySheet, 64, 64);
        slimeAnim = new Animation<>(0.15f, eGrid[0]);
        slimeAnim.setPlayMode(Animation.PlayMode.LOOP);

        coinSheet = new Texture("coin.png");
        TextureRegion[][] cGrid = TextureRegion.split(coinSheet, 32, 32);
        coinAnim = new Animation<>(0.08f, cGrid[0]);
        coinAnim.setPlayMode(Animation.PlayMode.LOOP);

        // ── Player bounding box (done for you) ──
        playerBounds = new Rectangle(playerX, playerY, 64, 64);

        // TODO 1a: Create the enemies ArrayList and add TWO enemies.
        //   Each enemy is a float[] with 5 values:
        //     { startX, startY, speed, leftBound, rightBound }
        //
        //   Enemy 1: starts at x=250, y=GROUND_Y, speed=80,
        //            patrols between x=200 and x=350
        //
        //   Enemy 2: starts at x=450, y=GROUND_Y, speed=60,
        //            patrols between x=400 and x=550
        //
        //   Example of adding one:
        //     enemies.add(new float[]{250, GROUND_Y, 80, 200, 350});


        // TODO 1b: Create the coins ArrayList and add FIVE coins.
        //   Each coin is a Rectangle: new Rectangle(x, y, 32, 32)
        //   Place them in a row at y=200, starting at x=150,
        //   spaced 70 pixels apart (x = 150, 220, 290, 360, 430).
        //
        //   Use a for loop:
        //     for (int i = 0; i < 5; i++) {
        //         coins.add(new Rectangle(150 + i * 70, 200, 32, 32));
        //     }

    }


    // ══════════════════════════════════════════════════════════
    // SECTION 2: Player Physics — Gravity, jumping, ground
    // (4 pts)
    // ══════════════════════════════════════════════════════════

    /**
     * Updates the player's vertical position based on gravity.
     * Called once per frame from render().
     *
     * How it works:
     *   1. Add GRAVITY * delta to velocityY (accelerate downward)
     *   2. Add velocityY * delta to playerY (move the player)
     *   3. If playerY <= GROUND_Y, snap to ground and stop falling
     *
     * @param delta time since last frame in seconds
     */
    private void updatePlayerPhysics(float delta) {
        // TODO 2a: Apply gravity to velocityY
        //   velocityY += GRAVITY * delta;


        // TODO 2b: Apply velocityY to playerY
        //   playerY += velocityY * delta;


        // TODO 2c: Ground collision — if playerY is at or below GROUND_Y:
        //   - Set playerY = GROUND_Y (snap to ground)
        //   - Set velocityY = 0 (stop falling)
        //   - Set onGround = true (allow jumping again)

    }

    /**
     * Handles player input for movement and jumping.
     * Called once per frame from render().
     *
     * @param delta time since last frame in seconds
     */
    private void handlePlayerInput(float delta) {
        // TODO 2d: If SPACE is pressed AND onGround is true:
        //   - Set velocityY = JUMP_VELOCITY
        //   - Set onGround = false
        //   (This prevents double-jumping — you can only jump from the ground)


        // TODO 2e: If LEFT is pressed:
        //   - Subtract MOVE_SPEED * delta from playerX
        //   - Set facingRight = false


        // TODO 2f: If RIGHT is pressed:
        //   - Add MOVE_SPEED * delta to playerX
        //   - Set facingRight = true

    }


    // ══════════════════════════════════════════════════════════
    // SECTION 3: Enemy Patrol — Move back and forth
    // (3 pts)
    // ══════════════════════════════════════════════════════════

    /**
     * Updates all enemies. Each enemy moves horizontally and reverses
     * direction when hitting its patrol boundaries.
     *
     * Remember the float[] layout: {x, y, speed, leftBound, rightBound}
     *   Index 0 = x position
     *   Index 1 = y position
     *   Index 2 = speed (positive = moving right, negative = moving left)
     *   Index 3 = left boundary
     *   Index 4 = right boundary
     *
     * @param delta time since last frame in seconds
     */
    private void updateEnemies(float delta) {
        // TODO 3: Loop through every float[] in the enemies list.
        //   For each enemy:
        //     1. Update x position: enemy[0] += enemy[2] * delta
        //     2. If enemy[0] <= enemy[3] (hit left boundary):
        //          - Set enemy[0] = enemy[3]  (snap to boundary)
        //          - Negate enemy[2]           (reverse direction: speed = -speed)
        //     3. If enemy[0] >= enemy[4] (hit right boundary):
        //          - Set enemy[0] = enemy[4]
        //          - Negate enemy[2]
        //
        //   Use a for-each loop: for (float[] enemy : enemies) { ... }

    }


    // ══════════════════════════════════════════════════════════
    // SECTION 4: Collision Detection — Player vs enemies & coins
    // (3 pts)
    // ══════════════════════════════════════════════════════════

    /**
     * Checks for collisions between the player and all enemies/coins.
     *
     * libGDX's Rectangle class has an overlaps() method:
     *   rect1.overlaps(rect2) → true if they intersect
     *
     * Enemy collision → reset player to start
     * Coin collision  → remove the coin, increase score
     */
    private void checkCollisions() {
        // First, sync the player bounding box to the current position
        playerBounds.setPosition(playerX, playerY);

        // TODO 4a: Check player vs each enemy.
        //   For each float[] in enemies:
        //     - Create a temporary Rectangle for the enemy:
        //         Rectangle enemyRect = new Rectangle(enemy[0], enemy[1], 64, 64);
        //     - If playerBounds.overlaps(enemyRect):
        //         - Reset playerX = 100
        //         - Reset playerY = GROUND_Y
        //         - Reset velocityY = 0
        //         - Print "Hit! Resetting player." to the console


        // TODO 4b: Check player vs each coin.
        //   Use an Iterator so you can safely remove coins during the loop:
        //
        //     Iterator<Rectangle> it = coins.iterator();
        //     while (it.hasNext()) {
        //         Rectangle coin = it.next();
        //         if (playerBounds.overlaps(coin)) {
        //             it.remove();
        //             score++;
        //             System.out.println("Coin! Score: " + score);
        //         }
        //     }

    }


    // ══════════════════════════════════════════════════════════
    // SECTION 5: Render — Update, then draw everything
    // (2 pts)
    // ══════════════════════════════════════════════════════════

    @Override
    public void render(float delta) {
        stateTime += delta;

        // TODO 5a: Call your update methods in this order:
        //   1. handlePlayerInput(delta)
        //   2. updatePlayerPhysics(delta)
        //   3. updateEnemies(delta)
        //   4. checkCollisions()


        // ── Pick the right player animation (done for you) ──
        Animation<TextureRegion> currentAnim;
        if (!onGround) {
            currentAnim = jumpAnim;
        } else if (Gdx.input.isKeyPressed(Input.Keys.LEFT)
                || Gdx.input.isKeyPressed(Input.Keys.RIGHT)) {
            currentAnim = runAnim;
        } else {
            currentAnim = idleAnim;
        }

        boolean looping = onGround;
        TextureRegion playerFrame = currentAnim.getKeyFrame(stateTime, looping);

        // Flip handling (done for you)
        if (!facingRight && !playerFrame.isFlipX()) {
            playerFrame.flip(true, false);
        } else if (facingRight && playerFrame.isFlipX()) {
            playerFrame.flip(true, false);
        }

        // ── Clear screen ──
        Gdx.gl.glClearColor(0.1f, 0.1f, 0.15f, 1f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        batch.setProjectionMatrix(camera.combined);
        batch.begin();

        // Draw player (done for you)
        batch.draw(playerFrame, playerX, playerY);

        // TODO 5b: Draw each enemy.
        //   Loop through enemies, get the slime animation frame,
        //   and draw it at (enemy[0], enemy[1]):
        //
        //     TextureRegion slimeFrame = slimeAnim.getKeyFrame(stateTime, true);
        //     for (float[] enemy : enemies) {
        //         batch.draw(slimeFrame, enemy[0], enemy[1]);
        //     }


        // TODO 5c: Draw each remaining coin.
        //   Get the coin animation frame, then loop through the coins list
        //   and draw at (coin.x, coin.y):
        //
        //     TextureRegion coinFrame = coinAnim.getKeyFrame(stateTime, true);
        //     for (Rectangle coin : coins) {
        //         batch.draw(coinFrame, coin.x, coin.y);
        //     }


        batch.end();
    }

    @Override
    public void resize(int width, int height) {
        camera.setToOrtho(false, width, height);
    }

    @Override public void pause() {}
    @Override public void resume() {}
    @Override public void hide() {}

    @Override
    public void dispose() {
        batch.dispose();
        playerSheet.dispose();
        enemySheet.dispose();
        coinSheet.dispose();
    }
}
