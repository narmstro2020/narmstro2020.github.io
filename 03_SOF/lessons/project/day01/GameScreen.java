package com.yourname.platformer;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.ScreenAdapter;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.math.Rectangle;
import com.badlogic.gdx.math.Vector2;
import com.badlogic.gdx.utils.ScreenUtils;

public class GameScreen extends ScreenAdapter {

    private final PlatformerGame game;
    private OrthographicCamera camera;

    // Player state
    private Texture playerTexture;
    private Vector2 playerPos;
    private Vector2 playerVelocity;
    private Rectangle playerBounds;

    // Physics constants — tweak these to get the feel right
    private static final float GRAVITY = -800f;
    private static final float JUMP_VELOCITY = 400f;
    private static final float MOVE_SPEED = 200f;
    private static final float GROUND_Y = 100f; // temporary ground

    // Game state
    private int score = 0;
    private int lives = 3;
    private boolean isOnGround = false;

    public GameScreen(PlatformerGame game) {
        this.game = game;
    }

    @Override
    public void show() {
        // Camera setup
        camera = new OrthographicCamera();
        camera.setToOrtho(false, PlatformerGame.WINDOW_WIDTH, PlatformerGame.WINDOW_HEIGHT);

        // Player setup
        // TODO: Replace with your sprite sheet / texture
        playerTexture = new Texture(Gdx.files.internal("textures/player.png"));
        playerPos = new Vector2(100, GROUND_Y);
        playerVelocity = new Vector2(0, 0);
        playerBounds = new Rectangle(playerPos.x, playerPos.y, 32, 48);

        // TODO: Load your tilemap here
        //   TmxMapLoader loader = new TmxMapLoader();
        //   TiledMap map = loader.load("maps/level1.tmx");
        //   OrthogonalTiledMapRenderer mapRenderer = new OrthogonalTiledMapRenderer(map);

        // TODO: Load enemies, coins, and other entities

        // TODO: Set up HUD

        // TODO: Set up audio
    }

    @Override
    public void render(float delta) {
        // ── Input ──────────────────────────────
        handleInput(delta);

        // ── Physics ────────────────────────────
        updatePhysics(delta);

        // ── Collisions ─────────────────────────
        // TODO: Check collisions with tilemap, enemies, and items

        // ── Camera ─────────────────────────────
        updateCamera();

        // ── Draw ───────────────────────────────
        ScreenUtils.clear(0.4f, 0.6f, 0.9f, 1f); // sky blue background

        camera.update();
        game.batch.setProjectionMatrix(camera.combined);

        // TODO: Render tilemap before entities
        //   mapRenderer.setView(camera);
        //   mapRenderer.render();

        game.batch.begin();

        // Draw player
        game.batch.draw(playerTexture, playerPos.x, playerPos.y);

        // TODO: Draw enemies
        // TODO: Draw items/coins
        // TODO: Draw HUD (use a separate camera or Stage for HUD)

        game.batch.end();

        // ── Game State ─────────────────────────
        if (lives <= 0) {
            game.setScreen(new GameOverScreen(game, score));
            dispose();
        }
    }

    private void handleInput(float delta) {
        // Horizontal movement
        playerVelocity.x = 0;

        if (Gdx.input.isKeyPressed(Input.Keys.LEFT) || Gdx.input.isKeyPressed(Input.Keys.A)) {
            playerVelocity.x = -MOVE_SPEED;
        }
        if (Gdx.input.isKeyPressed(Input.Keys.RIGHT) || Gdx.input.isKeyPressed(Input.Keys.D)) {
            playerVelocity.x = MOVE_SPEED;
        }

        // Jumping
        if ((Gdx.input.isKeyJustPressed(Input.Keys.SPACE)
                || Gdx.input.isKeyJustPressed(Input.Keys.UP)
                || Gdx.input.isKeyJustPressed(Input.Keys.W))
                && isOnGround) {
            playerVelocity.y = JUMP_VELOCITY;
            isOnGround = false;

            // TODO: Play jump sound effect here
        }
    }

    private void updatePhysics(float delta) {
        // Apply gravity
        playerVelocity.y += GRAVITY * delta;

        // Update position
        playerPos.x += playerVelocity.x * delta;
        playerPos.y += playerVelocity.y * delta;

        // Temporary ground collision (replace with tilemap collision)
        if (playerPos.y <= GROUND_Y) {
            playerPos.y = GROUND_Y;
            playerVelocity.y = 0;
            isOnGround = true;
        }

        // Update collision bounds
        playerBounds.setPosition(playerPos.x, playerPos.y);
    }

    private void updateCamera() {
        // Follow player horizontally, with some look-ahead
        camera.position.x = playerPos.x + 100;
        camera.position.y = PlatformerGame.WINDOW_HEIGHT / 2f;

        // TODO: Clamp camera to level bounds so it doesn't show outside the map
    }

    @Override
    public void dispose() {
        if (playerTexture != null) playerTexture.dispose();
        // TODO: Dispose tilemap, enemies, coins, audio, HUD
    }
}
