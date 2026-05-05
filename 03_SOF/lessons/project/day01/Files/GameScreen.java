package io.github.armstrong;

// ============================================================
// 🎮 GAME SCREEN — Full Project Starter
// ============================================================
//
// Day 1 (Apr 27): Movement, jumping, gravity
// Day 2 (Apr 29): Sprite sheet animations and flipping
// Day 3 (May 1):  Enemies, coins, and collision
// Day 4 (May 5):  Platforms and level design
// Day 5 (May 7):  Lives, win/lose, screen transitions
// Day 6 (May 11): HUD and hitbox polish
// Day 7 (May 13): Final polish and submit
//
// Work through the TODOs in order by day.
// If you didn't finish a previous day, do those FIRST.
//
// ============================================================

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Animation;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.math.Rectangle;

import java.util.ArrayList;
import java.util.Iterator;

public class GameScreen implements Screen {

    private final Main game;

    // ── Constants ──
    private static final int W = 640;
    private static final int H = 480;
    private static final float GRAVITY = -600f;
    private static final float JUMP_VELOCITY = 350f;
    private static final float MOVE_SPEED = 160f;
    private static final float GROUND_Y = 50f;

    // DAY 5 TODO 1: Add these constants:
    //   private static final int START_LIVES = 3;
    //   private static final float SPAWN_X = 50f;
    //   private static final float SPAWN_Y = 80f;


    // ── Rendering ──
    private SpriteBatch batch;
    private OrthographicCamera camera;
    private Texture playerSheet;

    // DAY 4 TODO 1: Add platform rendering field:
    //   private Texture pixel;

    // DAY 6 TODO 1: Add HUD font field:
    //   private BitmapFont hudFont;


    // DAY 2 TODO 1: Add animation fields:
    //   - Animation<TextureRegion> idleAnim, runAnim, jumpAnim
    //   - float stateTime = 0f
    //   - boolean facingRight = true


    // DAY 3 TODO 1: Add enemy and coin textures + animations:
    //   - Texture enemySheet, coinSheet
    //   - Animation<TextureRegion> slimeAnim, coinAnim


    // DAY 3 TODO 2: Add enemy list, coin list, player bounds, and score:
    //   - ArrayList<float[]> enemies        (each = {x, y, speed, leftBound, rightBound})
    //   - ArrayList<Rectangle> coins
    //   - Rectangle playerBounds
    //   - int score = 0

    // DAY 4 TODO 2: Add platforms list:
    //   - ArrayList<Rectangle> platforms

    // DAY 5 TODO 2: Add game state fields:
    //   - int lives = START_LIVES
    //   - boolean switchToGameOver = false
    //   - boolean playerWon = false


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
        camera.setToOrtho(false, W, H);

        playerSheet = new Texture("player.png");

        // DAY 4 TODO 3: Load white.png for platform drawing:
        //   pixel = new Texture("white.png");

        // DAY 6 TODO 2: Create the HUD font:
        //   hudFont = new BitmapFont();
        //   hudFont.setColor(Color.WHITE);
        //   hudFont.getData().setScale(1.5f);

        // DAY 2 TODO 2: Split the sprite sheet and create animations:
        //   TextureRegion[][] grid = TextureRegion.split(playerSheet, 64, 64);
        //   idleAnim = new Animation<>(0.2f, grid[0]);
        //   runAnim  = new Animation<>(0.1f, grid[1]);
        //   jumpAnim = new Animation<>(0.15f, grid[2]);
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
        //
        //   DAY 6 TODO 3: Later, change this to tighter bounds:
        //     playerBounds = new Rectangle(0, 0, 28, 48);


        // DAY 4 TODO 4: Create platforms list and add platforms:
        //   platforms = new ArrayList<>();
        //   platforms.add(new Rectangle(0, 30, W, 20));           // ground
        //   platforms.add(new Rectangle(100, 130, 120, 16));      // lower
        //   platforms.add(new Rectangle(300, 130, 120, 16));
        //   platforms.add(new Rectangle(500, 130, 120, 16));
        //   platforms.add(new Rectangle(50, 230, 140, 16));       // mid
        //   platforms.add(new Rectangle(250, 260, 160, 16));
        //   platforms.add(new Rectangle(470, 230, 130, 16));
        //   platforms.add(new Rectangle(150, 360, 130, 16));      // high
        //   platforms.add(new Rectangle(380, 390, 140, 16));


        // DAY 3 TODO 6: Create enemies ArrayList and add 2 enemies:
        //   enemies = new ArrayList<>();
        //   enemies.add(new float[]{250, GROUND_Y, 80, 200, 350});
        //   enemies.add(new float[]{450, GROUND_Y, 60, 400, 550});
        //
        //   DAY 4 TODO 5: Later, update enemies to patrol on platforms:
        //     enemies = new ArrayList<>();
        //     enemies.add(new float[]{200, 50, 70, 100, 350});      // ground
        //     enemies.add(new float[]{310, 146, 50, 300, 400});     // lower platform
        //     enemies.add(new float[]{260, 276, -45, 250, 390});    // mid platform


        // DAY 3 TODO 7: Create coins ArrayList and add 5 coins:
        //   coins = new ArrayList<>();
        //   for (int i = 0; i < 5; i++) {
        //       coins.add(new Rectangle(150 + i * 70, 200, 32, 32));
        //   }
        //
        //   DAY 4 TODO 6: Later, update coins to sit on platforms:
        //     coins = new ArrayList<>();
        //     coins.add(new Rectangle(60, 70, 32, 32));         // ground
        //     coins.add(new Rectangle(440, 70, 32, 32));
        //     coins.add(new Rectangle(140, 160, 32, 32));       // lower
        //     coins.add(new Rectangle(540, 160, 32, 32));
        //     coins.add(new Rectangle(80, 260, 32, 32));        // mid
        //     coins.add(new Rectangle(310, 290, 32, 32));
        //     coins.add(new Rectangle(510, 260, 32, 32));
        //     coins.add(new Rectangle(190, 390, 32, 32));       // high
        //     coins.add(new Rectangle(430, 420, 32, 32));


        // DAY 5 TODO 3: Set spawn position:
        //   playerX = SPAWN_X;
        //   playerY = SPAWN_Y;

    }


    // ══════════════════════════════════════════
    // UPDATE METHODS
    // ══════════════════════════════════════════

    // DAY 3 TODO 8: Create updateEnemies method:
    //
    //   private void updateEnemies(float delta) {
    //       for (float[] enemy : enemies) {
    //           enemy[0] += enemy[2] * delta;
    //           if (enemy[0] <= enemy[3]) {
    //               enemy[0] = enemy[3];
    //               enemy[2] = -enemy[2];
    //           }
    //           if (enemy[0] >= enemy[4]) {
    //               enemy[0] = enemy[4];
    //               enemy[2] = -enemy[2];
    //           }
    //       }
    //   }


    // DAY 3 TODO 9: Create checkCollisions method:
    //
    //   private void checkCollisions() {
    //       playerBounds.setPosition(playerX, playerY);
    //
    //       // DAY 6 TODO 4: Later, use tighter offset:
    //       //   playerBounds.setPosition(playerX + 18, playerY + 6);
    //
    //       for (float[] enemy : enemies) {
    //           Rectangle enemyRect = new Rectangle(enemy[0], enemy[1], 64, 64);
    //
    //           // DAY 6 TODO 5: Later, tighten enemy hitbox:
    //           //   Rectangle enemyRect = new Rectangle(enemy[0] + 12, enemy[1] + 10, 40, 36);
    //
    //           if (playerBounds.overlaps(enemyRect)) {
    //               playerX = 100;
    //               playerY = GROUND_Y;
    //               velocityY = 0;
    //               System.out.println("Hit! Resetting player.");
    //
    //               // DAY 5 TODO 4: Later, replace the above reset with:
    //               //   loseLife();
    //               //   return;
    //           }
    //       }
    //
    //       Iterator<Rectangle> it = coins.iterator();
    //       while (it.hasNext()) {
    //           Rectangle coin = it.next();
    //           if (playerBounds.overlaps(coin)) {
    //               it.remove();
    //               score++;
    //               System.out.println("Coin! Score: " + score);
    //           }
    //       }
    //
    //       // DAY 5 TODO 5: Add win condition:
    //       //   if (coins.isEmpty()) {
    //       //       switchToGameOver = true;
    //       //       playerWon = true;
    //       //   }
    //   }


    // DAY 5 TODO 6: Create loseLife method:
    //
    //   private void loseLife() {
    //       lives--;
    //       if (lives <= 0) {
    //           switchToGameOver = true;
    //           playerWon = false;
    //       } else {
    //           playerX = SPAWN_X;
    //           playerY = SPAWN_Y;
    //           velocityY = 0;
    //           onGround = false;
    //       }
    //   }


    @Override
    public void render(float delta) {

        // DAY 5 TODO 7: Deferred screen transition — add at VERY TOP of render:
        //   if (switchToGameOver) {
        //       game.setScreen(new GameOverScreen(game, score, playerWon));
        //       dispose();
        //       return;
        //   }


        // ── INPUT ──

        // DAY 1 TODO: LEFT arrow → subtract MOVE_SPEED * delta from playerX
        //   DAY 2 TODO 3a: also set facingRight = false

        // DAY 1 TODO: RIGHT arrow → add MOVE_SPEED * delta to playerX
        //   DAY 2 TODO 3b: also set facingRight = true

        // DAY 1 TODO: SPACE (only if onGround) → set velocityY = JUMP_VELOCITY, onGround = false

        // DAY 5 TODO 8: Keep player in screen bounds:
        //   if (playerX < 0) playerX = 0;
        //   if (playerX > W - 64) playerX = W - 64;


        // ── PHYSICS ──

        // DAY 1 TODO: Add GRAVITY * delta to velocityY
        // DAY 1 TODO: Add velocityY * delta to playerY
        // DAY 1 TODO: If playerY <= GROUND_Y → snap to ground, stop falling, set onGround = true
        //
        // DAY 4 TODO 7: Later, REPLACE the simple GROUND_Y check above with platform collision:
        //   onGround = false;
        //   for (Rectangle plat : platforms) {
        //       if (velocityY <= 0) {
        //           float playerBottom = playerY;
        //           float platTop = plat.y + plat.height;
        //           boolean horizontalOverlap =
        //               (playerX + 64 > plat.x) && (playerX < plat.x + plat.width);
        //           if (horizontalOverlap
        //                   && playerBottom <= platTop
        //                   && playerBottom >= platTop - 15) {
        //               playerY = platTop;
        //               velocityY = 0;
        //               onGround = true;
        //           }
        //       }
        //   }

        // DAY 5 TODO 9: Add fall-off-screen detection after physics:
        //   if (playerY < -100) {
        //       loseLife();
        //   }


        // ── UPDATES ──

        // DAY 3 TODO 10: Call update methods:
        //   updateEnemies(delta);
        //   checkCollisions();


        // ── ANIMATION ──

        // DAY 2 TODO 4: Add delta to stateTime

        // DAY 2 TODO 5: Pick the right animation:
        //   Animation<TextureRegion> currentAnim;
        //   if (!onGround)                                        → currentAnim = jumpAnim
        //   else if (LEFT or RIGHT pressed)                       → currentAnim = runAnim
        //   else                                                  → currentAnim = idleAnim

        // DAY 2 TODO 6: Get the current frame:
        //   boolean looping = onGround;
        //   TextureRegion frame = currentAnim.getKeyFrame(stateTime, looping);

        // DAY 2 TODO 7: Flip the frame:
        //   if (!facingRight && !frame.isFlipX()) frame.flip(true, false);
        //   else if (facingRight && frame.isFlipX()) frame.flip(true, false);


        // ── DRAW ──
        Gdx.gl.glClearColor(0.08f, 0.08f, 0.14f, 1f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        batch.setProjectionMatrix(camera.combined);
        batch.begin();

        // DAY 4 TODO 8: Draw platforms FIRST:
        //   batch.setColor(0.3f, 0.3f, 0.5f, 1f);
        //   for (Rectangle plat : platforms) {
        //       batch.draw(pixel, plat.x, plat.y, plat.width, plat.height);
        //   }
        //   batch.setColor(Color.WHITE);

        // DAY 2 TODO 8: Replace this line with: batch.draw(frame, playerX, playerY);
        batch.draw(playerSheet, playerX, playerY, 64, 64);

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

        // DAY 6 TODO 6: Draw HUD (after player, so it's on top):
        //   hudFont.setColor(Color.WHITE);
        //   hudFont.draw(batch, "Score: " + score, 10, H - 10);
        //   hudFont.draw(batch, "Lives: " + lives, 10, H - 35);
        //   hudFont.draw(batch, "Coins: " + coins.size() + " left", W - 180, H - 10);

        batch.end();
    }

    @Override
    public void resize(int w, int h) { camera.setToOrtho(false, W, H); }
    @Override public void pause() {}
    @Override public void resume() {}
    @Override public void hide() {}

    @Override
    public void dispose() {
        batch.dispose();
        playerSheet.dispose();
        // DAY 3 TODO 13: Also dispose enemySheet and coinSheet
        // DAY 4 TODO 9: Also dispose pixel
        // DAY 6 TODO 7: Also dispose hudFont

    }
}
