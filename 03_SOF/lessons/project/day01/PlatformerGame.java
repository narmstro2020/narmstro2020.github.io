// ============================================================
// 🎮 PLATFORMER — FINAL PROJECT STARTER
// ============================================================
//
// This is your starting point. It sets up the Game class with
// screen management. Your job is to build out each screen and
// fill this game with life.
//
// START HERE on Apr 27:
//   1. Get this running (you should see the MenuScreen)
//   2. Implement player movement in GameScreen
//   3. Add gravity and jumping
//   4. Load your first Tiled level
//   5. Keep building from there!
//
// ============================================================

package com.yourname.platformer;

import com.badlogic.gdx.Game;
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;

// TODO: Update the package name above to match your project

public class PlatformerGame extends Game {

    // Shared SpriteBatch — created once, used by all screens
    public SpriteBatch batch;

    // Game constants
    public static final int WINDOW_WIDTH = 1280;
    public static final int WINDOW_HEIGHT = 720;
    public static final String TITLE = "My Platformer"; // Change this!

    @Override
    public void create() {
        batch = new SpriteBatch();

        // Start with the menu screen
        setScreen(new MenuScreen(this));
    }

    @Override
    public void dispose() {
        batch.dispose();
        // Dispose the current screen if it exists
        if (getScreen() != null) {
            getScreen().dispose();
        }
    }
}
