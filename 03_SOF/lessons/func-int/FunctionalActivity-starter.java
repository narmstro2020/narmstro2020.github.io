import java.util.*;
import java.util.function.*;

/**
 * Functional Interfaces Activity — Configurable Entity System
 * March 6, 2026 · Java Concepts · 15 Points
 *
 * INSTRUCTIONS:
 * Complete each TODO section below. Each part builds on the previous one.
 * Compile and test after each section before moving on.
 *
 * POINT BREAKDOWN:
 *   Part 1 — Custom Functional Interfaces (3 pts)
 *   Part 2 — Lambda-Based Filtering & Transformation (4 pts)
 *   Part 3 — Configurable Behaviors with Consumers (4 pts)
 *   Part 4 — Input Action Map (4 pts)
 *
 * SUBMISSION:
 *   Push your completed project to GitHub and submit the repo link on Canvas.
 *
 * RUN:
 *   javac FunctionalActivity.java && java FunctionalActivity
 */
public class FunctionalActivity {

    // ══════════════════════════════════════════════════════════════════
    // GAME ENTITY CLASSES (provided — do NOT modify)
    // ══════════════════════════════════════════════════════════════════

    static class Player {
        String name;
        int health;
        double speed;
        int score;

        Player(String name, int health, double speed) {
            this.name = name;
            this.health = health;
            this.speed = speed;
            this.score = 0;
        }

        void jump()     { System.out.println(name + " jumps!"); }
        void dash()     { System.out.println(name + " dashes! Speed: " + (speed * 2)); }
        void attack()   { System.out.println(name + " attacks!"); }
        void interact() { System.out.println(name + " interacts with nearby object."); }
        void addScore(int pts) { score += pts; System.out.println(name + " +" + pts + " pts! (Total: " + score + ")"); }
        void takeDamage(int dmg) { health -= dmg; System.out.println(name + " takes " + dmg + " damage! HP: " + health); }

        @Override
        public String toString() {
            return String.format("%-10s | HP: %3d | Speed: %.1f | Score: %d", name, health, speed, score);
        }
    }

    static class Enemy {
        String type;
        int health;
        int damage;
        boolean isActive;

        Enemy(String type, int health, int damage) {
            this.type = type;
            this.health = health;
            this.damage = damage;
            this.isActive = true;
        }

        void deactivate() { isActive = false; System.out.println("  " + type + " defeated!"); }

        @Override
        public String toString() {
            return String.format("%-10s | HP: %3d | DMG: %2d | %s", type, health, damage, isActive ? "ACTIVE" : "DEAD");
        }
    }


    // ══════════════════════════════════════════════════════════════════
    //  PART 1: Custom Functional Interfaces (3 pts)
    // ══════════════════════════════════════════════════════════════════

    // TODO 1a: Create a @FunctionalInterface called DamageCalculator
    //   - It should take three parameters: int baseDamage, int armor, double critMultiplier
    //   - It should return an int (the final damage)
    //
    // Write it here (above or below this comment):



    // TODO 1b: Create a @FunctionalInterface called PowerUp
    //   - It should take two parameters: int currentHealth, double currentSpeed
    //   - It should return a double (the new speed)
    //
    // Write it here:



    // ══════════════════════════════════════════════════════════════════
    //  PART 2: Filtering & Transformation with Lambdas (4 pts)
    // ══════════════════════════════════════════════════════════════════

    /**
     * Filters a list of enemies using the given predicate.
     * Returns a new list containing only enemies that pass the test.
     *
     * TODO 2a: Implement this method using a for-each loop.
     *   - Create an empty ArrayList for results
     *   - Loop through enemies
     *   - If condition.test(enemy) is true, add it to results
     *   - Return results
     */
    static List<Enemy> filterEnemies(List<Enemy> enemies, Predicate<Enemy> condition) {
        // Your code here:

        return new ArrayList<>(); // replace this
    }

    /**
     * Transforms a list of strings using the given function.
     * Returns a new list with every string transformed.
     *
     * TODO 2b: Implement this method.
     *   - Create an empty ArrayList for results
     *   - Loop through items
     *   - Add transformer.apply(item) to results
     *   - Return results
     */
    static List<String> transformAll(List<String> items, Function<String, String> transformer) {
        // Your code here:

        return new ArrayList<>(); // replace this
    }


    // ══════════════════════════════════════════════════════════════════
    //  PART 3: Configurable Behaviors (4 pts)
    // ══════════════════════════════════════════════════════════════════

    /**
     * Applies a behavior to every enemy in the list.
     *
     * TODO 3a: Implement this method.
     *   - Loop through enemies
     *   - Call behavior.accept(enemy) on each one
     */
    static void applyToAll(List<Enemy> enemies, Consumer<Enemy> behavior) {
        // Your code here:

    }


    // ══════════════════════════════════════════════════════════════════
    //  MAIN METHOD — This is where you'll wire everything together
    // ══════════════════════════════════════════════════════════════════

    public static void main(String[] args) {

        System.out.println("╔══════════════════════════════════════════════╗");
        System.out.println("║   Functional Interfaces Activity             ║");
        System.out.println("╚══════════════════════════════════════════════╝\n");

        // ── SETUP ───────────────────────────────────────────────────
        Player player = new Player("Hero", 100, 5.0);

        List<Enemy> enemies = new ArrayList<>(Arrays.asList(
            new Enemy("Slime",    30,  5),
            new Enemy("Skeleton", 60, 12),
            new Enemy("Dragon",  150, 35),
            new Enemy("Bat",      15,  3),
            new Enemy("Golem",   200, 20),
            new Enemy("Ghost",    40, 15)
        ));

        List<String> playerNames = Arrays.asList("alice", "bob", "charlie", "diana");


        // ════════════════════════════════════════════════════════════
        //  PART 1 TESTS: Custom Functional Interfaces
        // ════════════════════════════════════════════════════════════
        System.out.println("═══ PART 1: Custom Functional Interfaces ═══\n");

        // TODO 1c: Create a DamageCalculator lambda called "standardCalc"
        //   Formula: (baseDamage - armor) * critMultiplier, cast to int
        //   Example: standardCalc.calculate(50, 20, 1.5) should return 45


        // TODO 1d: Create a DamageCalculator lambda called "piercingCalc"
        //   Formula: baseDamage * critMultiplier (ignores armor), cast to int
        //   Example: piercingCalc.calculate(50, 20, 1.5) should return 75


        // TODO 1e: Create two PowerUp lambdas:
        //   - "speedBoost": if health > 50, return speed * 2, else return speed
        //   - "steadyBoost": always return speed + 2.0


        // Uncomment these when your lambdas are ready:
        // System.out.println("Standard damage (50 base, 20 armor, 1.5x crit): " + standardCalc.calculate(50, 20, 1.5));
        // System.out.println("Piercing damage (50 base, 20 armor, 1.5x crit): " + piercingCalc.calculate(50, 20, 1.5));
        // System.out.println("Speed boost (HP=100, speed=5.0): " + speedBoost.apply(100, 5.0));
        // System.out.println("Speed boost (HP=30, speed=5.0): " + speedBoost.apply(30, 5.0));
        // System.out.println("Steady boost (HP=anything, speed=5.0): " + steadyBoost.apply(50, 5.0));

        System.out.println();


        // ════════════════════════════════════════════════════════════
        //  PART 2 TESTS: Filtering & Transformation
        // ════════════════════════════════════════════════════════════
        System.out.println("═══ PART 2: Filtering & Transformation ═══\n");

        // TODO 2c: Use filterEnemies with a lambda to find all enemies with HP > 50
        //   Print the results
        System.out.println("Strong enemies (HP > 50):");
        // List<Enemy> strongEnemies = filterEnemies(enemies, ...);
        // strongEnemies.forEach(System.out::println);

        System.out.println();

        // TODO 2d: Use filterEnemies with a lambda to find enemies with damage < 15
        System.out.println("Weak enemies (DMG < 15):");
        // List<Enemy> weakEnemies = filterEnemies(enemies, ...);
        // weakEnemies.forEach(System.out::println);

        System.out.println();

        // TODO 2e: Use transformAll to convert playerNames to uppercase
        System.out.println("Scoreboard names:");
        // List<String> upperNames = transformAll(playerNames, ...);
        // upperNames.forEach(System.out::println);

        System.out.println();

        // TODO 2f: Use transformAll to add "[LVL 1] " prefix to each name
        System.out.println("Tagged names:");
        // List<String> taggedNames = transformAll(playerNames, ...);
        // taggedNames.forEach(System.out::println);

        System.out.println();


        // ════════════════════════════════════════════════════════════
        //  PART 3 TESTS: Configurable Behaviors
        // ════════════════════════════════════════════════════════════
        System.out.println("═══ PART 3: Configurable Behaviors ═══\n");

        // TODO 3b: Create a Consumer<Enemy> called "weaken" that reduces each enemy's HP by 10
        //   Then call applyToAll(enemies, weaken)


        // TODO 3c: Create a Consumer<Enemy> called "printStatus" that prints each enemy
        //   Then call applyToAll(enemies, printStatus) to show the updated list
        System.out.println("After weakening all enemies:");


        // TODO 3d: Use Predicate chaining!
        //   Create two predicates:
        //     - isStrong: HP > 50
        //     - isHighDamage: damage > 15
        //   Chain them with .and() to create "isBoss"
        //   Use filterEnemies(enemies, isBoss) and print results
        System.out.println("\nBoss-tier enemies (HP > 50 AND DMG > 15):");


        System.out.println();


        // ════════════════════════════════════════════════════════════
        //  PART 4: Input Action Map (4 pts)
        // ════════════════════════════════════════════════════════════
        System.out.println("═══ PART 4: Input Action Map ═══\n");

        // In a real game, you'd use libGDX key codes. Here we'll simulate
        // with Strings to keep it simple.

        // TODO 4a: Create a Map<String, Consumer<Player>> called "inputMap"
        //   Add these key bindings using lambdas:
        //     "SPACE"  -> player jumps
        //     "SHIFT"  -> player dashes
        //     "E"      -> player interacts
        //     "F"      -> player attacks


        // TODO 4b: Create a method-style simulation loop.
        //   Given this list of "pressed keys", look up and execute each action:
        List<String> pressedKeys = Arrays.asList("SPACE", "F", "E", "SPACE", "SHIFT");

        System.out.println("Simulating key presses:");
        // for (String key : pressedKeys) {
        //     Consumer<Player> action = inputMap.get(key);
        //     if (action != null) {
        //         action.accept(player);
        //     }
        // }

        System.out.println();


        // TODO 4c: Create a Supplier<Enemy> called "enemySpawner" that returns
        //   a new Bat enemy each time it's called (HP: 15, DMG: 3)
        //   Use it to spawn 3 enemies and add them to a new list, then print them.
        System.out.println("Spawned enemies:");
        // Supplier<Enemy> enemySpawner = ...;
        // List<Enemy> spawned = new ArrayList<>();
        // for (int i = 0; i < 3; i++) {
        //     spawned.add(enemySpawner.get());
        // }
        // spawned.forEach(System.out::println);


        System.out.println();

        // ════════════════════════════════════════════════════════════
        //  FINAL STATUS
        // ════════════════════════════════════════════════════════════
        System.out.println("═══ FINAL STATUS ═══\n");
        System.out.println(player);
        System.out.println("\nAll enemies:");
        enemies.forEach(System.out::println);
    }
}
