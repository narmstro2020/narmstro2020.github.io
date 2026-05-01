package io.github.armstrong;

// ============================================================
// 🎮 GAME SCREEN — Day 3 Starter
// ============================================================
//
// Day 1 (Apr 27): Get the player moving, jumping, and landing
// Day 2 (Apr 29): Add sprite sheet animations and flipping
// Day 3 (May 1):  Add enemies, coins, and collision
//
// If you didn't finish Day 1/2 TODOs, do those FIRST.
// Then move on to the Day 3 TODOs.
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

public class GameScreen implements Screen {

    private final Main game;

    // ── Constants ──
    private static final float GRAVITY = -500f;
    private static final float JUMP_VELOCITY = 300f;
    private static final float MOVE_SPEED = 150f;
    private static final float GROUND_Y = 50f;

    // ── Rendering ──
    private SpriteBatch batch;
    private OrthographicCamera camera;
    private Texture playerSheet;

    // DAY 2 TODO 1: Add these animation fields:
    //   - Animation<TextureRegion> idleAnim, runAnim, jumpAnim
    //   - float stateTime = 0f
    //   - boolean facingRight = true


    // DAY 3 TODO 1: Add enemy and coin textures + animations:
    //   - Texture enemySheet, coinSheet
    //   - Animation<TextureRegion> slimeAnim, coinAnim


    // DAY 3 TODO 2: Add enemy list, coin list, player bounds, and score:
    //   - ArrayList<float[]> enemies
    //   - ArrayList<Rectangle> coins
    //   - Rectangle playerBounds
    //   - int score = 0


    // ── Player ──
    private float playerX = 100f;
    private float playerY = GROUND_Y;
    private float velocityY = 0f;
    private boolean onGround = true;

    public GameScreen(Main game) {
        this.game = game;
    }

    @Override
    public void show() {
        batch = new SpriteBatch();
        camera = new OrthographicCamera();
        camera.setToOrtho(false, 640, 480);

        playerSheet = new Texture("player.png");

        // DAY 2 TODO 2: Split the sprite sheet and create animations:
        //   TextureRegion[][] grid = TextureRegion.split(playerSheet, 64, 64);
        //   idleAnim = new Animation<>(0.2f, grid[0]);   // row 0
        //   runAnim  = new Animation<>(0.1f, grid[1]);   // row 1
        //   jumpAnim = new Animation<>(0.15f, grid[2]);  // row 2
        //   Set play modes: idleAnim → LOOP, runAnim → LOOP, jumpAnim → NORMAL


        // DAY 3 TODO 3: Load enemy sheet and create slime animation:
        //   enemySheet = new Texture("enemy-slime.png");
        //   TextureRegion[][] eGrid = TextureRegion.split(enemySheet, 64, 64);
        //   slimeAnim = new Animation<>(0.15f, eGrid[0]);
        //   slimeAnim.setPlayMode(Animation.PlayMode.LOOP);


        // DAY 3 TODO 4: Load coin sheet and create coin animation:
        //   coinSheet = new Texture("coin.png");
        //   TextureRegion[][] cGrid = TextureRegion.split(coinSheet, 32, 32);  ← 32, not 64!
        //   coinAnim = new Animation<>(0.08f, cGrid[0]);
        //   coinAnim.setPlayMode(Animation.PlayMode.LOOP);


        // DAY 3 TODO 5: Create the player bounding box:
        //   playerBounds = new Rectangle(playerX, playerY, 64, 64);


        // DAY 3 TODO 6: Create enemies ArrayList and add 2 enemies:
        //   enemies = new ArrayList<>();
        //   enemies.add(new float[]{250, GROUND_Y, 80, 200, 350});
        //   enemies.add(new float[]{450, GROUND_Y, 60, 400, 550});


        // DAY 3 TODO 7: Create coins ArrayList and add 5 coins in a row:
        //   coins = new ArrayList<>();
        //   for (int i = 0; i < 5; i++) {
        //       coins.add(new Rectangle(150 + i * 70, 200, 32, 32));
        //   }

    }


    // ══════════════════════════════════════════
    // DAY 3 — UPDATE METHODS
    // ══════════════════════════════════════════

    // DAY 3 TODO 8: Create an updateEnemies method:
    //
    //   private void updateEnemies(float delta) {
    //       Loop through each float[] enemy in the enemies list:
    //         1. Move: enemy[0] += enemy[2] * delta
    //         2. If enemy[0] <= enemy[3] (left boundary):
    //              enemy[0] = enemy[3];
    //              enemy[2] = -enemy[2];  (reverse direction)
    //         3. If enemy[0] >= enemy[4] (right boundary):
    //              enemy[0] = enemy[4];
    //              enemy[2] = -enemy[2];
    //   }


    // DAY 3 TODO 9: Create a checkCollisions method:
    //
    //   private void checkCollisions() {
    //       // Sync player bounds to current position
    //       playerBounds.setPosition(playerX, playerY);
    //
    //       // Check player vs each enemy
    //       for (float[] enemy : enemies) {
    //           Rectangle enemyRect = new Rectangle(enemy[0], enemy[1], 64, 64);
    //           if (playerBounds.overlaps(enemyRect)) {
    //               playerX = 100;
    //               playerY = GROUND_Y;
    //               velocityY = 0;
    //               System.out.println("Hit! Resetting player.");
    //           }
    //       }
    //
    //       // Check player vs each coin (use Iterator for safe removal)
    //       Iterator<Rectangle> it = coins.iterator();
    //       while (it.hasNext()) {
    //           Rectangle coin = it.next();
    //           if (playerBounds.overlaps(coin)) {
    //               it.remove();
    //               score++;
    //               System.out.println("Coin! Score: " + score);
    //           }
    //       }
    //   }


    @Override
    public void render(float delta) {

        // ── INPUT ──

        // DAY 1 TODO: LEFT arrow → subtract MOVE_SPEED * delta from playerX
        //   DAY 2 TODO 3a: also set facingRight = false

        // DAY 1 TODO: RIGHT arrow → add MOVE_SPEED * delta to playerX
        //   DAY 2 TODO 3b: also set facingRight = true

        // DAY 1 TODO: SPACE (only if onGround) → set velocityY = JUMP_VELOCITY, onGround = false


        // ── PHYSICS ──

        // DAY 1 TODO: Add GRAVITY * delta to velocityY
        // DAY 1 TODO: Add velocityY * delta to playerY
        // DAY 1 TODO: If playerY <= GROUND_Y → snap to ground, stop falling, set onGround = true


        // ── UPDATES ──

        // DAY 3 TODO 10: Call your update methods:
        //   updateEnemies(delta);
        //   checkCollisions();


        // ── ANIMATION ──

        // DAY 2 TODO 4: Add delta to stateTime

        // DAY 2 TODO 5: Pick the right animation based on player state:
        //   Animation<TextureRegion> currentAnim;
        //   - If NOT onGround              → currentAnim = jumpAnim
        //   - Else if LEFT or RIGHT pressed → currentAnim = runAnim
        //   - Else                          → currentAnim = idleAnim

        // DAY 2 TODO 6: Get the current frame:
        //   boolean looping = onGround;
        //   TextureRegion frame = currentAnim.getKeyFrame(stateTime, looping);

        // DAY 2 TODO 7: Flip the frame to face the right direction:
        //   if (!facingRight && !frame.isFlipX()) frame.flip(true, false);
        //   else if (facingRight && frame.isFlipX()) frame.flip(true, false);


        // ── DRAW ──
        Gdx.gl.glClearColor(0.1f, 0.1f, 0.15f, 1f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        batch.setProjectionMatrix(camera.combined);
        batch.begin();

        // DAY 2 TODO 8: Replace this line with: batch.draw(frame, playerX, playerY);
        batch.draw(frame, playerX, playerY, 64, 64);

        // DAY 3 TODO 11: Draw enemies:
        //   TextureRegion slimeFrame = slimeAnim.getKeyFrame(stateTime, true);
        //   for (float[] enemy : enemies) {
        //       batch.draw(slimeFrame, enemy[0], enemy[1]);
        //   }

        // DAY 3 TODO 12: Draw coins:
        //   TextureRegion coinFrame = coinAnim.getKeyFrame(stateTime, true);
        //   for (Rectangle coin : coins) {
        //       batch.draw(coinFrame, coin.x, coin.y);
        //   }

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
        // DAY 3 TODO 13: Also dispose enemySheet and coinSheet

    }
}
