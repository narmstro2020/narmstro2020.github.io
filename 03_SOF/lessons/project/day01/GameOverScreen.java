package com.yourname.platformer;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.ScreenAdapter;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.utils.ScreenUtils;

public class GameOverScreen extends ScreenAdapter {

    private final PlatformerGame game;
    private final int finalScore;
    private BitmapFont titleFont;
    private BitmapFont scoreFont;
    private BitmapFont promptFont;

    public GameOverScreen(PlatformerGame game, int finalScore) {
        this.game = game;
        this.finalScore = finalScore;
    }

    @Override
    public void show() {
        titleFont = new BitmapFont();
        titleFont.getData().setScale(3f);
        titleFont.setColor(Color.RED);

        scoreFont = new BitmapFont();
        scoreFont.getData().setScale(2f);
        scoreFont.setColor(Color.WHITE);

        promptFont = new BitmapFont();
        promptFont.getData().setScale(1.2f);
        promptFont.setColor(Color.LIGHT_GRAY);

        // TODO: Save high score here using SaveManager
        //   SaveManager.saveHighScore(finalScore);
    }

    @Override
    public void render(float delta) {
        ScreenUtils.clear(0.1f, 0.05f, 0.05f, 1f);

        // Restart
        if (Gdx.input.isKeyJustPressed(Input.Keys.ENTER)) {
            game.setScreen(new GameScreen(game));
            dispose();
        }

        // Return to menu
        if (Gdx.input.isKeyJustPressed(Input.Keys.ESCAPE)) {
            game.setScreen(new MenuScreen(game));
            dispose();
        }

        float centerX = PlatformerGame.WINDOW_WIDTH / 2f;
        float centerY = PlatformerGame.WINDOW_HEIGHT / 2f;

        game.batch.begin();
        titleFont.draw(game.batch, "GAME OVER",
                centerX - 130, centerY + 80);
        scoreFont.draw(game.batch, "Score: " + finalScore,
                centerX - 80, centerY);
        promptFont.draw(game.batch, "ENTER = Play Again    ESC = Menu",
                centerX - 170, centerY - 80);
        game.batch.end();
    }

    @Override
    public void dispose() {
        if (titleFont != null) titleFont.dispose();
        if (scoreFont != null) scoreFont.dispose();
        if (promptFont != null) promptFont.dispose();
    }
}
