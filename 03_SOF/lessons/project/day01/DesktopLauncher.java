package com.yourname.platformer;

import com.badlogic.gdx.backends.lwjgl3.Lwjgl3Application;
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3ApplicationConfiguration;

/**
 * Desktop launcher — this is the main() entry point for your game.
 * Run this class to start the platformer.
 */
public class DesktopLauncher {
    public static void main(String[] args) {
        Lwjgl3ApplicationConfiguration config = new Lwjgl3ApplicationConfiguration();
        config.setTitle(PlatformerGame.TITLE);
        config.setWindowedMode(PlatformerGame.WINDOW_WIDTH, PlatformerGame.WINDOW_HEIGHT);
        config.setResizable(false);
        config.useVsync(true);
        config.setForegroundFPS(60);

        new Lwjgl3Application(new PlatformerGame(), config);
    }
}
