package io.github.armstrong;

// ============================================================
// 🎮 MENU SCREEN — DAY 5
// ============================================================
//
// Create this screen on Day 5 (May 7).
// It shows the game title, a blinking start prompt, and controls.
// Pressing ENTER transitions to GameScreen.
//
// Once this works, update Main.java to start here instead of
// going straight to GameScreen.
//
// ============================================================

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.graphics.g2d.GlyphLayout;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;

public class MenuScreen implements Screen {

    private final Main game;

    private static final int W = 640;
    private static final int H = 480;

    // DAY 5 TODO M1: Declare these fields:
    //   - SpriteBatch batch
    //   - OrthographicCamera camera
    //   - BitmapFont titleFont
    //   - BitmapFont promptFont
    //   - GlyphLayout layout          (used to measure text width for centering)
    //   - float stateTime = 0f        (used for blinking animation)


    public MenuScreen(Main game) {
        this.game = game;
    }

    @Override
    public void show() {
        // DAY 5 TODO M2: Initialize rendering:
        //   batch = new SpriteBatch();
        //   camera = new OrthographicCamera();
        //   camera.setToOrtho(false, W, H);

        // DAY 5 TODO M3: Create title font (big, yellow):
        //   titleFont = new BitmapFont();
        //   titleFont.setColor(Color.YELLOW);
        //   titleFont.getData().setScale(3f);

        // DAY 5 TODO M4: Create prompt font (medium, white):
        //   promptFont = new BitmapFont();
        //   promptFont.setColor(Color.WHITE);
        //   promptFont.getData().setScale(1.5f);

        // DAY 5 TODO M5: Create GlyphLayout for text centering:
        //   layout = new GlyphLayout();

    }

    @Override
    public void render(float delta) {
        // DAY 5 TODO M6: Add delta to stateTime


        // DAY 5 TODO M7: Check for ENTER key to start the game:
        //   if (Gdx.input.isKeyJustPressed(Input.Keys.ENTER)) {
        //       game.setScreen(new GameScreen(game));
        //       dispose();
        //       return;
        //   }


        // DAY 5 TODO M8: Clear screen:
        //   Gdx.gl.glClearColor(0.05f, 0.05f, 0.1f, 1f);
        //   Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);


        // DAY 5 TODO M9: Draw the menu:
        //   batch.setProjectionMatrix(camera.combined);
        //   batch.begin();
        //
        //   // Title — centered
        //   String title = "PLATFORMER";
        //   layout.setText(titleFont, title);
        //   titleFont.draw(batch, title, (W - layout.width) / 2f, H / 2f + 80);
        //
        //   // Blinking prompt — toggles every 0.5 seconds
        //   if ((int)(stateTime * 2) % 2 == 0) {
        //       String prompt = "Press ENTER to Start";
        //       layout.setText(promptFont, prompt);
        //       promptFont.draw(batch, prompt, (W - layout.width) / 2f, H / 2f - 20);
        //   }
        //
        //   // Controls hint at bottom
        //   promptFont.getData().setScale(1f);
        //   String controls = "Arrow Keys: Move   |   Space: Jump";
        //   layout.setText(promptFont, controls);
        //   promptFont.draw(batch, controls, (W - layout.width) / 2f, 60);
        //   promptFont.getData().setScale(1.5f);
        //
        //   batch.end();

    }

    @Override
    public void resize(int w, int h) { camera.setToOrtho(false, W, H); }
    @Override public void pause() {}
    @Override public void resume() {}
    @Override public void hide() {}

    @Override
    public void dispose() {
        // DAY 5 TODO M10: Dispose batch, titleFont, promptFont

    }
}
