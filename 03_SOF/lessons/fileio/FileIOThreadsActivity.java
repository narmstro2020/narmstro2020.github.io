// ============================================================
// 🎮 FILE I/O & MULTITHREADING ACTIVITY
// ============================================================
//
// Activity — L06 · Apr 9, 2026 · 15 pts
//
// SCENARIO:
//   You're building the save/load system for your platformer.
//   Players earn coins, lose lives, and progress through levels.
//   Their game state needs to persist between sessions (File I/O)
//   and assets need to load without freezing the game (Threads).
//
// SETUP:
//   1. Add Gson to your pom.xml (see bottom of this file)
//   2. Create this class in your project
//   3. Complete each TODO
//   4. Run main() to test — all 5 sections should print ✅
//
// RULES:
//   - Use try-with-resources for ALL file operations
//   - Use Gson for JSON (not manual string building)
//   - Use lambdas for thread creation where possible
//
// ============================================================

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.*;
import java.util.*;
import java.util.concurrent.*;

public class FileIOThreadsActivity {

    // ──────────────────────────────────────────
    // INNER CLASS: GameState
    // This represents your platformer's save data
    // ──────────────────────────────────────────
    static class GameState {
        String playerName;
        int lives;
        int score;
        int coinsCollected;
        String currentLevel;
        List<String> unlockedLevels;

        public GameState() {
            // Default constructor needed for Gson
        }

        public GameState(String playerName, int lives, int score,
                         int coinsCollected, String currentLevel,
                         List<String> unlockedLevels) {
            this.playerName = playerName;
            this.lives = lives;
            this.score = score;
            this.coinsCollected = coinsCollected;
            this.currentLevel = currentLevel;
            this.unlockedLevels = unlockedLevels;
        }

        @Override
        public String toString() {
            return String.format("%s | Lives: %d | Score: %d | Coins: %d | Level: %s | Unlocked: %s",
                    playerName, lives, score, coinsCollected, currentLevel, unlockedLevels);
        }
    }


    // ══════════════════════════════════════════
    // SECTION 1: Writing a Plain Text File (2 pts)
    // ══════════════════════════════════════════

    /**
     * Writes high scores to a plain text file.
     * Each entry should be on its own line in the format: "PlayerName: Score"
     *
     * Example output in file:
     *   Mario: 15000
     *   Luigi: 12300
     *   Toad: 9800
     */
    public static void writeHighScores(String filename, Map<String, Integer> scores) {
        // TODO 1: Write each entry from the scores map to the file
        //   - Use a PrintWriter wrapped around a FileWriter
        //   - Use try-with-resources
        //   - Write each entry as: playerName + ": " + score
        //   - Catch IOException and print the stack trace


    }


    // ══════════════════════════════════════════
    // SECTION 2: Reading a Plain Text File (2 pts)
    // ══════════════════════════════════════════

    /**
     * Reads high scores from a plain text file back into a Map.
     * Parses lines in the format "PlayerName: Score"
     *
     * @return Map of player names to scores
     */
    public static Map<String, Integer> readHighScores(String filename) {
        Map<String, Integer> scores = new LinkedHashMap<>();

        // TODO 2: Read the file line by line and parse each entry
        //   - Use a BufferedReader wrapped around a FileReader
        //   - Use try-with-resources
        //   - Split each line on ": " to get name and score
        //   - Use Integer.parseInt() to convert the score string to int
        //   - Put each entry into the scores map
        //   - Catch IOException and print the stack trace


        return scores;
    }


    // ══════════════════════════════════════════
    // SECTION 3: JSON Save/Load with Gson (4 pts)
    // ══════════════════════════════════════════

    /**
     * Saves a GameState object to a JSON file using Gson.
     * Use pretty printing so the file is human-readable.
     */
    public static void saveGameState(String filename, GameState state) {
        // TODO 3a: Create a Gson instance with pretty printing enabled
        //   Hint: new GsonBuilder().setPrettyPrinting().create()


        // TODO 3b: Write the GameState to the file as JSON
        //   - Use try-with-resources with a FileWriter
        //   - Use gson.toJson(state, writer) to write directly to the file
        //   - Catch IOException and print the stack trace


    }

    /**
     * Loads a GameState object from a JSON file using Gson.
     *
     * @return the loaded GameState, or null if the file doesn't exist
     */
    public static GameState loadGameState(String filename) {
        // TODO 3c: Read the JSON file and convert it back to a GameState
        //   - Create a Gson instance
        //   - Use try-with-resources with a FileReader
        //   - Use gson.fromJson(reader, GameState.class) to deserialize
        //   - Return the loaded GameState
        //   - Catch IOException, print the stack trace, and return null

        return null;
    }


    // ══════════════════════════════════════════
    // SECTION 4: Basic Threading (3 pts)
    // ══════════════════════════════════════════

    /**
     * Simulates loading three game assets on separate threads.
     * Each "load" takes a different amount of time (simulated with Thread.sleep).
     */
    public static void loadAssetsWithThreads() {
        System.out.println("  Starting asset loading on 3 threads...");

        // TODO 4a: Create a thread that simulates loading textures
        //   - Print "  [Textures] Loading..." at the start
        //   - Sleep for 800 milliseconds (Thread.sleep(800))
        //   - Print "  [Textures] Done! ✅"
        //   - Use a lambda: new Thread(() -> { ... })


        // TODO 4b: Create a thread that simulates loading sounds
        //   - Print "  [Sounds] Loading..." at the start
        //   - Sleep for 500 milliseconds
        //   - Print "  [Sounds] Done! ✅"


        // TODO 4c: Create a thread that simulates loading level data
        //   - Print "  [Level] Loading..." at the start
        //   - Sleep for 1200 milliseconds
        //   - Print "  [Level] Done! ✅"


        // TODO 4d: Start all three threads


        // TODO 4e: Wait for all three threads to finish
        //   - Call .join() on each thread (wrap each in try-catch for InterruptedException)
        //   Hint:
        //     try { threadName.join(); } catch (InterruptedException e) { e.printStackTrace(); }


        System.out.println("  All assets loaded!");
    }


    // ══════════════════════════════════════════
    // SECTION 5: ExecutorService (4 pts)
    // ══════════════════════════════════════════

    /**
     * Uses an ExecutorService to process coin collection events.
     * Simulates multiple enemies dropping coins simultaneously.
     * The shared coin counter must be thread-safe.
     */
    static int totalCoins = 0;

    // TODO 5a: Write a synchronized method called addCoins
    //   - Takes an int parameter called amount
    //   - Adds amount to totalCoins
    //   - Prints: "  Collected " + amount + " coins (Total: " + totalCoins + ")"


    public static void processCoinDrops() {
        totalCoins = 0;
        int[] coinDrops = {5, 3, 10, 7, 2, 8, 1, 15, 4, 6};

        // TODO 5b: Create an ExecutorService with a fixed thread pool of 3 threads


        // TODO 5c: Submit a task for each coin drop in the array
        //   - Each task should call addCoins() with the coin amount
        //   - Add a small delay: Thread.sleep(100) to simulate processing time
        //   - Use a for-each loop over coinDrops


        // TODO 5d: Shut down the pool and wait for all tasks to finish
        //   - Call pool.shutdown()
        //   - Call pool.awaitTermination(10, TimeUnit.SECONDS)
        //     (wrap in try-catch for InterruptedException)


        System.out.println("  Final coin total: " + totalCoins);
    }


    // ══════════════════════════════════════════
    // MAIN — Test everything
    // ══════════════════════════════════════════

    public static void main(String[] args) {

        System.out.println("══════════════════════════════════════");
        System.out.println("  FILE I/O & THREADING ACTIVITY");
        System.out.println("══════════════════════════════════════\n");

        // --- Section 1: Write High Scores ---
        System.out.println("▸ Section 1: Writing High Scores");
        Map<String, Integer> scores = new LinkedHashMap<>();
        scores.put("Mario", 15000);
        scores.put("Luigi", 12300);
        scores.put("Toad", 9800);
        scores.put("Peach", 17200);
        writeHighScores("highscores.txt", scores);
        System.out.println("  Wrote " + scores.size() + " scores to highscores.txt ✅\n");

        // --- Section 2: Read High Scores ---
        System.out.println("▸ Section 2: Reading High Scores");
        Map<String, Integer> loaded = readHighScores("highscores.txt");
        loaded.forEach((name, score) ->
                System.out.println("  " + name + ": " + score));
        boolean section2Pass = loaded.size() == 4 && loaded.get("Peach") == 17200;
        System.out.println("  Read back " + loaded.size() + " scores " +
                (section2Pass ? "✅" : "❌") + "\n");

        // --- Section 3: JSON Save/Load ---
        System.out.println("▸ Section 3: JSON Save/Load");
        GameState original = new GameState(
                "Mario", 3, 14500, 87, "world-1-2",
                Arrays.asList("world-1-1", "world-1-2")
        );
        System.out.println("  Saving: " + original);
        saveGameState("savegame.json", original);

        GameState restored = loadGameState("savegame.json");
        if (restored != null) {
            System.out.println("  Loaded: " + restored);
            boolean section3Pass = restored.playerName.equals("Mario")
                    && restored.score == 14500
                    && restored.unlockedLevels.size() == 2;
            System.out.println("  JSON round-trip " +
                    (section3Pass ? "✅" : "❌") + "\n");
        } else {
            System.out.println("  Failed to load ❌\n");
        }

        // --- Section 4: Threading ---
        System.out.println("▸ Section 4: Asset Loading with Threads");
        long start = System.currentTimeMillis();
        loadAssetsWithThreads();
        long elapsed = System.currentTimeMillis() - start;
        // If threads ran in parallel, total time should be ~1200ms, not ~2500ms
        boolean section4Pass = elapsed < 2000;
        System.out.println("  Elapsed: " + elapsed + "ms " +
                (section4Pass ? "(parallel ✅)" : "(sequential ❌ — did you start all threads?)") + "\n");

        // --- Section 5: ExecutorService ---
        System.out.println("▸ Section 5: Coin Drops with ExecutorService");
        processCoinDrops();
        boolean section5Pass = totalCoins == 61;  // 5+3+10+7+2+8+1+15+4+6
        System.out.println("  Expected: 61 | Got: " + totalCoins + " " +
                (section5Pass ? "✅" : "❌") + "\n");

        // --- Summary ---
        System.out.println("══════════════════════════════════════");
        System.out.println("  RESULTS");
        System.out.println("══════════════════════════════════════");
        System.out.println("  Section 1 (Write):        ✅");
        System.out.println("  Section 2 (Read):         " + (section2Pass ? "✅" : "❌"));
        System.out.println("  Section 3 (JSON):         " + (restored != null ? "✅" : "❌"));
        System.out.println("  Section 4 (Threads):      " + (section4Pass ? "✅" : "❌"));
        System.out.println("  Section 5 (Executor):     " + (section5Pass ? "✅" : "❌"));
    }
}


// ============================================================
// MAVEN DEPENDENCY — Add this inside <dependencies> in pom.xml
// ============================================================
//
// <dependency>
//     <groupId>com.google.code.gson</groupId>
//     <artifactId>gson</artifactId>
//     <version>2.11.0</version>
// </dependency>
//
// ============================================================
