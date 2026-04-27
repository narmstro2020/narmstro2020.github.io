package com.yourname.platformer.util;

import com.badlogic.gdx.Gdx;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.*;

/**
 * Handles saving and loading game data to/from JSON files.
 *
 * Uses Gson for serialization — same pattern from the File I/O lesson.
 * Files are saved to the user's local storage directory so they persist
 * between game sessions.
 *
 * TODO: Customize SaveData fields to match what YOUR game needs to save.
 */
public class SaveManager {

    private static final String SAVE_FILE = "savegame.json";
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    /**
     * Represents all data that gets saved between sessions.
     * Add or remove fields based on your game's needs.
     */
    public static class SaveData {
        public int highScore = 0;
        public int totalCoinsCollected = 0;
        public String lastLevel = "level1";
        // TODO: Add more fields as needed
        //   public boolean[] unlockedLevels;
        //   public float bestTime;
        //   public String playerName;
    }

    /**
     * Saves the given data to a JSON file.
     */
    public static void save(SaveData data) {
        try (FileWriter fw = new FileWriter(
                Gdx.files.local(SAVE_FILE).file())) {
            gson.toJson(data, fw);
        } catch (IOException e) {
            Gdx.app.error("SaveManager", "Failed to save game", e);
        }
    }

    /**
     * Loads saved data from the JSON file.
     * Returns a new SaveData with defaults if the file doesn't exist.
     */
    public static SaveData load() {
        File file = Gdx.files.local(SAVE_FILE).file();
        if (!file.exists()) {
            return new SaveData(); // fresh save with defaults
        }

        try (FileReader fr = new FileReader(file)) {
            SaveData data = gson.fromJson(fr, SaveData.class);
            return data != null ? data : new SaveData();
        } catch (IOException e) {
            Gdx.app.error("SaveManager", "Failed to load save", e);
            return new SaveData();
        }
    }

    /**
     * Convenience method: saves a new high score if it beats the current one.
     */
    public static void saveHighScore(int score) {
        SaveData data = load();
        if (score > data.highScore) {
            data.highScore = score;
            save(data);
        }
    }
}
