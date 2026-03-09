import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Java Streams Activity — Starter Code
 * Web Dev & Databases | Day 2 of 2 | 15 points
 *
 * In this activity you will use Java Streams to process game data
 * from a 2D platformer. Each method has a description of what it
 * should do and a TODO comment showing you where to write your answer.
 *
 * DO NOT use traditional for-loops or for-each loops.
 * Every solution must use a Stream pipeline.
 *
 * Run StreamsActivity to test your answers. Correct output
 * is shown in the comments at the bottom of this file.
 */
public class StreamsActivity {

    // ─────────────────────────────────────────────
    //  Data Models
    // ─────────────────────────────────────────────

    record Enemy(String name, int hp, boolean alive, String type) {}
    record Coin(int x, int y, boolean collected, int value) {}
    record Platform(String id, float x, float y, float width) {}

    // ─────────────────────────────────────────────
    //  Sample Data (don't modify)
    // ─────────────────────────────────────────────

    static List<Enemy> enemies = Arrays.asList(
        new Enemy("Goomba",    30, true,  "ground"),
        new Enemy("Koopa",     50, true,  "ground"),
        new Enemy("Boo",       40, false, "flying"),
        new Enemy("Piranha",   80, true,  "plant"),
        new Enemy("Lakitu",    35, true,  "flying"),
        new Enemy("Hammer Bro",90, true,  "ground"),
        new Enemy("Thwomp",   120, false, "ceiling")
    );

    static List<Coin> coins = Arrays.asList(
        new Coin(100, 200, false, 10),
        new Coin(150, 200, true,  10),
        new Coin(200, 200, false, 10),
        new Coin(300, 150, false, 50),  // gold coin
        new Coin(400, 300, true,  10),
        new Coin(500, 100, false, 50),  // gold coin
        new Coin(600, 200, true,  10)
    );

    static List<Platform> platforms = Arrays.asList(
        new Platform("plat-C", 320f, 300f, 100f),
        new Platform("plat-A",  40f, 200f, 120f),
        new Platform("plat-E", 640f, 150f,  80f),
        new Platform("plat-B", 180f, 250f,  90f),
        new Platform("plat-D", 500f, 280f, 110f)
    );

    static List<Integer> highScores = Arrays.asList(
        8500, 4200, 9900, 3100, 7650, 5500, 9900, 2200, 6800
    );

    // ─────────────────────────────────────────────
    //  PART 1 — filter() (3 pts)
    // ─────────────────────────────────────────────

    /**
     * 1a. Return a list of all enemies that are still alive.
     */
    static List<Enemy> getAliveEnemies() {
        // TODO: Stream enemies, filter by alive == true, collect to list
        return null;
    }

    /**
     * 1b. Return a list of enemies that are alive AND of type "flying".
     */
    static List<Enemy> getAliveFlyers() {
        // TODO: Stream enemies, chain TWO filter() calls, collect to list
        return null;
    }

    /**
     * 1c. Return a list of uncollected coins worth 50 points each (gold coins).
     */
    static List<Coin> getUncollectedGoldCoins() {
        // TODO: Stream coins, filter by not collected AND value == 50, collect to list
        return null;
    }

    // ─────────────────────────────────────────────
    //  PART 2 — map() (3 pts)
    // ─────────────────────────────────────────────

    /**
     * 2a. Return a list of the NAMES of all enemies (alive or not).
     */
    static List<String> getAllEnemyNames() {
        // TODO: Stream enemies, map to enemy.name(), collect to list
        return null;
    }

    /**
     * 2b. Return a list of all enemy HP values doubled (simulate a power-up that doubles HP).
     *     Include all enemies.
     */
    static List<Integer> getDoubledHp() {
        // TODO: Stream enemies, map to enemy.hp() * 2, collect to list
        return null;
    }

    /**
     * 2c. Return the platform IDs sorted alphabetically.
     *     Hint: Use sorted() then map() to extract the id.
     */
    static List<String> getSortedPlatformIds() {
        // TODO: Stream platforms, sort by id (natural order), map to id, collect to list
        return null;
    }

    // ─────────────────────────────────────────────
    //  PART 3 — Terminal Operations (3 pts)
    // ─────────────────────────────────────────────

    /**
     * 3a. Count how many coins have NOT been collected yet.
     */
    static long countUncollectedCoins() {
        // TODO: Stream coins, filter by not collected, count()
        return -1;
    }

    /**
     * 3b. Return the name of the first alive enemy with HP greater than 70.
     *     If none exists, return "none".
     *     Hint: Use filter(), map() to name, findFirst(), orElse()
     */
    static String firstToughEnemy() {
        // TODO: Stream enemies, filter alive && hp > 70, map to name,
        //       findFirst().orElse("none")
        return null;
    }

    /**
     * 3c. Return true if ANY enemy is of type "ceiling".
     */
    static boolean hasCeilingEnemy() {
        // TODO: Stream enemies, anyMatch()
        return false;
    }

    // ─────────────────────────────────────────────
    //  PART 4 — Chained Pipelines (3 pts)
    // ─────────────────────────────────────────────

    /**
     * 4a. Return the top 3 unique high scores in DESCENDING order.
     *     Hint: distinct() → sorted() with reverse comparator → limit() → collect()
     */
    static List<Integer> topThreeScores() {
        // TODO
        return null;
    }

    /**
     * 4b. Return a comma-separated String of alive enemy names,
     *     in alphabetical order.
     *     Hint: filter → map to name → sorted → collect(Collectors.joining(", "))
     */
    static String aliveEnemyNamesCsv() {
        // TODO
        return null;
    }

    /**
     * 4c. Return a list of platform IDs for platforms with width >= 100f,
     *     sorted by x-position (ascending).
     */
    static List<String> widePlatformIds() {
        // TODO: filter by width >= 100, sort by x, map to id, collect
        return null;
    }

    // ─────────────────────────────────────────────
    //  PART 5 — Platformer Integration (3 pts)
    // ─────────────────────────────────────────────

    /**
     * 5a. Calculate the total value of ALL uncollected coins.
     *     Hint: Use mapToInt() and sum(), OR map + reduce.
     *     mapToInt(Coin::value).sum() is the cleanest approach.
     */
    static int totalUncollectedCoinValue() {
        // TODO
        return -1;
    }

    /**
     * 5b. Return true if ALL alive enemies have HP >= 30.
     *     Hint: filter alive, then allMatch()
     */
    static boolean allAliveEnemiesHealthy() {
        // TODO
        return false;
    }

    /**
     * 5c. Return a list of enemy names whose HP is above the
     *     average HP of all enemies (alive or not).
     *     Step 1: Calculate average HP using mapToInt().average().orElse(0)
     *     Step 2: Filter enemies where hp > average, map to name, collect.
     */
    static List<String> aboveAverageHpNames() {
        // TODO
        return null;
    }

    // ─────────────────────────────────────────────
    //  Main — Run to check your answers
    // ─────────────────────────────────────────────

    public static void main(String[] args) {
        System.out.println("====== Java Streams Activity ======\n");

        System.out.println("--- PART 1: filter() ---");
        System.out.println("1a alive enemies:     " + getAliveEnemies());
        System.out.println("1b alive flyers:      " + getAliveFlyers());
        System.out.println("1c uncollected gold:  " + getUncollectedGoldCoins());

        System.out.println("\n--- PART 2: map() ---");
        System.out.println("2a enemy names:       " + getAllEnemyNames());
        System.out.println("2b doubled HP:        " + getDoubledHp());
        System.out.println("2c platform ids:      " + getSortedPlatformIds());

        System.out.println("\n--- PART 3: terminal ops ---");
        System.out.println("3a uncollected count: " + countUncollectedCoins());
        System.out.println("3b first tough:       " + firstToughEnemy());
        System.out.println("3c ceiling enemy?:    " + hasCeilingEnemy());

        System.out.println("\n--- PART 4: chained ---");
        System.out.println("4a top 3 scores:      " + topThreeScores());
        System.out.println("4b alive names csv:   " + aliveEnemyNamesCsv());
        System.out.println("4c wide platforms:    " + widePlatformIds());

        System.out.println("\n--- PART 5: integration ---");
        System.out.println("5a uncollected value: " + totalUncollectedCoinValue());
        System.out.println("5b all healthy?:      " + allAliveEnemiesHealthy());
        System.out.println("5c above avg HP:      " + aboveAverageHpNames());
    }
}

/*
 * ═══════════════════════════════════════════════════
 *  EXPECTED OUTPUT (do not look until you're done!)
 * ═══════════════════════════════════════════════════
 *
 * --- PART 1: filter() ---
 * 1a alive enemies:     [Enemy[name=Goomba, ...], Enemy[name=Koopa, ...],
 *                         Enemy[name=Piranha, ...], Enemy[name=Lakitu, ...],
 *                         Enemy[name=Hammer Bro, ...]]
 * 1b alive flyers:      [Enemy[name=Lakitu, ...]]
 * 1c uncollected gold:  [Coin[x=300,...], Coin[x=500,...]]
 *
 * --- PART 2: map() ---
 * 2a enemy names:       [Goomba, Koopa, Boo, Piranha, Lakitu, Hammer Bro, Thwomp]
 * 2b doubled HP:        [60, 100, 80, 160, 70, 180, 240]
 * 2c platform ids:      [plat-A, plat-B, plat-C, plat-D, plat-E]
 *
 * --- PART 3: terminal ops ---
 * 3a uncollected count: 4
 * 3b first tough:       Piranha
 * 3c ceiling enemy?:    true
 *
 * --- PART 4: chained ---
 * 4a top 3 scores:      [9900, 8500, 7650]
 * 4b alive names csv:   Goomba, Hammer Bro, Koopa, Lakitu, Piranha
 * 4c wide platforms:    [plat-A, plat-C, plat-D]
 *
 * --- PART 5: integration ---
 * 5a uncollected value: 120
 * 5b all healthy?:      true
 * 5c above avg HP:      [Piranha, Hammer Bro, Thwomp]
 */
