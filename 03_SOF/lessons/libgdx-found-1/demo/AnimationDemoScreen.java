package io.github.found1;// ============================================================
// 🎮 AnimationDemoScreen — Drop-in test for sample sprite sheets
// ============================================================
//
// Purpose:  Prove the sample sprite sheets (player.png, enemy-slime.png,
//           coin.png) load and animate correctly before you build game
//           logic around them.
//
// Controls: LEFT / RIGHT arrows → run animation + flip direction
//           SPACE              → jump animation
//           (no input)         → idle animation
//
// Setup:    1. Put player.png, enemy-slime.png, coin.png in your assets folder
//           2. Drop this file into your src/main/java
//           3. Set it as the starting screen in your Game class:
//                 setScreen(new AnimationDemoScreen());
//
// ============================================================

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input.Keys;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Animation;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;

public class AnimationDemoScreen implements Screen {

    enum PlayerState { IDLE, RUNNING, JUMPING }

    private SpriteBatch batch;
    private OrthographicCamera camera;

    // Sheets
    private Texture playerSheet, enemySheet, coinSheet;

    // Player animations
    private Animation<TextureRegion> idleAnim, runAnim, jumpAnim;

    // Enemy & coin animations
    private Animation<TextureRegion> slimeAnim, coinAnim;

    // State tracking
    private float stateTime = 0f;
    private PlayerState state = PlayerState.IDLE;
    private boolean facingRight = true;
    private float playerX = 100f, playerY = 100f;

    @Override
    public void show() {
        batch = new SpriteBatch();
        camera = new OrthographicCamera();
        camera.setToOrtho(false, 640, 480);

        // ── Load player sheet: 4 cols × 3 rows of 64×64 frames ──
        playerSheet = new Texture("player.png");
        TextureRegion[][] pGrid = TextureRegion.split(playerSheet, 64, 64);

        idleAnim = new Animation<>(0.2f,  pGrid[0]);  // row 0
        runAnim  = new Animation<>(0.1f,  pGrid[1]);  // row 1
        jumpAnim = new Animation<>(0.15f, pGrid[2]);  // row 2

        idleAnim.setPlayMode(Animation.PlayMode.LOOP);
        runAnim.setPlayMode(Animation.PlayMode.LOOP);
        jumpAnim.setPlayMode(Animation.PlayMode.NORMAL);

        // ── Load enemy sheet: 4 cols × 1 row of 64×64 frames ──
        enemySheet = new Texture("enemy-slime.png");
        TextureRegion[][] eGrid = TextureRegion.split(enemySheet, 64, 64);
        slimeAnim = new Animation<>(0.15f, eGrid[0]);
        slimeAnim.setPlayMode(Animation.PlayMode.LOOP);

        // ── Load coin sheet: 6 cols × 1 row of 32×32 frames (smaller!) ──
        coinSheet = new Texture("coin.png");
        TextureRegion[][] cGrid = TextureRegion.split(coinSheet, 32, 32);
        coinAnim = new Animation<>(0.08f, cGrid[0]);
        coinAnim.setPlayMode(Animation.PlayMode.LOOP);
    }

    @Override
    public void render(float delta) {
        stateTime += delta;

        // ── Handle input and update state ──
        PlayerState previous = state;

        if (Gdx.input.isKeyPressed(Keys.SPACE)) {
            state = PlayerState.JUMPING;
        } else if (Gdx.input.isKeyPressed(Keys.LEFT)) {
            state = PlayerState.RUNNING;
            facingRight = false;
            playerX -= 100 * delta;
        } else if (Gdx.input.isKeyPressed(Keys.RIGHT)) {
            state = PlayerState.RUNNING;
            facingRight = true;
            playerX += 100 * delta;
        } else {
            state = PlayerState.IDLE;
        }

        // Reset stateTime when state changes (so new anim starts at frame 0)
        if (state != previous) {
            stateTime = 0f;
        }

        // ── Pick the right player animation ──
        Animation<TextureRegion> current;
        switch (state) {
            case IDLE:    current = idleAnim; break;
            case RUNNING: current = runAnim;  break;
            case JUMPING: current = jumpAnim; break;
            default:      current = idleAnim;
        }

        // Jump is NORMAL (one-shot) — others loop
        boolean looping = state != PlayerState.JUMPING;
        TextureRegion playerFrame = current.getKeyFrame(stateTime, looping);

        // Flip if facing left (with isFlipX check to avoid double-flip)
        if (!facingRight && !playerFrame.isFlipX()) {
            playerFrame.flip(true, false);
        } else if (facingRight && playerFrame.isFlipX()) {
            playerFrame.flip(true, false);
        }

        TextureRegion slimeFrame = slimeAnim.getKeyFrame(stateTime, true);
        TextureRegion coinFrame  = coinAnim.getKeyFrame(stateTime, true);

        // ── Draw ──
        Gdx.gl.glClearColor(0.1f, 0.1f, 0.15f, 1f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);


        batch.setProjectionMatrix(camera.combined);
        batch.begin();

        batch.draw(playerFrame, playerX, playerY);
        batch.draw(slimeFrame,  400f, 100f);
        batch.draw(coinFrame,   300f, 250f);
        batch.draw(coinFrame,   340f, 250f);
        batch.draw(coinFrame,   380f, 250f);

        batch.end();
    }

    @Override public void resize(int width, int height) {
        camera.setToOrtho(false, width, height);
    }
    @Override public void pause()  {}
    @Override public void resume() {}
    @Override public void hide()   {}

    @Override
    public void dispose() {
        batch.dispose();
        playerSheet.dispose();
        enemySheet.dispose();
        coinSheet.dispose();
    }
}
