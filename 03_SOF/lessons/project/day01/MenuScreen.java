package com.yourname.platformer;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.ScreenAdapter;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.utils.ScreenUtils;

public class MenuScreen extends ScreenAdapter {

    private final PlatformerGame game;
    private BitmapFont titleFont;
    private BitmapFont promptFont;

    public MenuScreen(PlatformerGame game) {
        this.game = game;
    }

    @Override
    public void show() {
        titleFont = new BitmapFont();
        titleFont.getData().setScale(3f);
        titleFont.setColor(Color.WHITE);

        promptFont = new BitmapFont();
        promptFont.getData().setScale(1.5f);
        promptFont.setColor(Color.LIGHT_GRAY);
    }

    @Override
    public void render(float delta) {
        ScreenUtils.clear(0.1f, 0.1f, 0.15f, 1f);

        // Check for start input
        if (Gdx.input.isKeyJustPressed(Input.Keys.ENTER)) {
            game.setScreen(new GameScreen(game));
            dispose();
        }

        game.batch.begin();
        titleFont.draw(game.batch, PlatformerGame.TITLE,
                PlatformerGame.WINDOW_WIDTH / 2f - 150,
                PlatformerGame.WINDOW_HEIGHT / 2f + 50);
        promptFont.draw(game.batch, "Press ENTER to Start",
                PlatformerGame.WINDOW_WIDTH / 2f - 120,
                PlatformerGame.WINDOW_HEIGHT / 2f - 40);
        game.batch.end();
    }

    @Override
    public void dispose() {
        if (titleFont != null) titleFont.dispose();
        if (promptFont != null) promptFont.dispose();
    }
}
