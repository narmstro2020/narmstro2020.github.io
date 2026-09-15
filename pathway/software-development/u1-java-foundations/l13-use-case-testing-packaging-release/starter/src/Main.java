import java.util.Random;
import java.util.Scanner;

/*
 * U1 L13 — USE-CASE TESTING, PACKAGING, RELEASE · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 13 (two days)
 *
 * START FROM YOUR OWN LESSON 12 FILE. The code below is the L12 solution, for
 * anyone who lost theirs.
 *
 * NO NEW CODE TODAY unless a test fails. There are no TODO markers in this file.
 * Today's work is the two files next to it and one command:
 *
 *   DAY 1  TESTS.md      eight cases, expected column filled in BEFORE the first run;
 *                        at least three bad-input cases. Run them all. Fix what fails,
 *                        or log it in README.md as a known issue. Then a partner plays
 *                        with the README as their only help; log what they break.
 *
 *   DAY 2  the JAR       from the project root, three commands:
 *                            javac -d out src/Main.java
 *                            jar --create --file ArenaGame.jar --main-class Main -C out .
 *                            java -jar ArenaGame.jar
 *                        Copy ArenaGame.jar to the Desktop and run it from a terminal
 *                        there. If it only runs inside the project, it is not packaged.
 *          README.md     "How to run it" leads with the JAR; a Testing section points
 *                        at TESTS.md.
 *
 * A fixed seed left in Random makes every game identical. Check before you ship.
 *
 * BEFORE YOU LEAVE: back up as Arena_U1L13_LastnameF and submit the zip:
 * src, TESTS.md, README.md, ArenaGame.jar.
 */
/**
 * THE ARENA — a turn-based console fight, built one lesson at a time in
 * 7184 Software Development, Unit 1.
 *
 * <p>Run it with {@code java Main} from the {@code src} folder. The player
 * moves around a small grid, fights an enemy when adjacent, and collects loot
 * from a weighted table.</p>
 *
 * <p>Known issue: the enemy does not move. It waits where it is placed.
 * Chasing the player needs pathfinding, which is not a Unit 1 topic.</p>
 */
public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;
    static final int ROWS = 5;
    static final int COLS = 11;
    static final int PACK_SLOTS = 5;

    /**
     * Runs one complete visit to the arena: setup, the movement and combat loop,
     * then the closing report.
     *
     * @param args not used; the game reads everything from the keyboard
     */
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        printTitle();
        String playerName = readName(in);
        int difficulty = readChoice(in, 1, 3, "Difficulty (1 = easy, 2 = normal, 3 = brutal)");
        System.out.println("Difficulty: " + difficultyName(difficulty));
        System.out.println("");

        // ONE Random for the whole program. One created inside the loop would be
        // re-created every turn and lose the distribution entirely.
        Random rng = new Random();
        // Random rng = new Random(42);   // <- fixed seed while debugging

        int health = MAX_HEALTH, gold = STARTING_GOLD, playerCol = 1;
        int level = 1;
        final int playerRow = 2, enemyRow = 2, enemyCol = 9;

        String enemyName = "Cave Goblin";
        int enemyHealth = 30 + difficulty * 15;
        int enemyPower = 4 + difficulty * 3;

        // ---------- PARALLEL ARRAYS ----------
        // Two arrays that must be kept in step BY HAND. Sort one without the
        // other and every count belongs to the wrong item. That failure mode is
        // the argument for objects in U2 — do not hide it.
        String[] itemNames = new String[PACK_SLOTS];
        int[] itemCounts = new int[PACK_SLOTS];
        int itemSlots = 0;

        itemNames[0] = "Potion";  itemCounts[0] = 2;  itemSlots++;
        itemNames[1] = "Bomb";    itemCounts[1] = 1;  itemSlots++;

        // int[] starts full of 0. String[] starts full of null — which is why
        // touching an unassigned slot throws NullPointerException.
        int[] damageLog = new int[20];
        int loggedTurns = 0;

        // ---------- THE BOARD ----------
        char[][] arena = newArena();
        arena[playerRow][playerCol] = '@';
        arena[enemyRow][enemyCol] = 'X';
        arena[3][4] = '^';      // hazard  — one line, because the grid stores the world
        arena[1][7] = '$';      // treasure

        openingCeremony(in, playerName, health, enemyName, enemyHealth);

        int turnNumber = 1;
        boolean playing = true, fled = false;

        while (playing) {
            printBanner("Turn " + turnNumber);
            printFighters(playerName, health, enemyName, enemyHealth);
            drawArena(arena);
            printInventory(itemNames, itemCounts, itemSlots);

            boolean adjacent = isAdjacent(playerRow, playerCol, enemyRow, enemyCol);
            int roll = rng.nextInt(1, 11);      // 1..10, and genuinely random now
            String action = readAction(in, adjacent, enemyName);
            int damage = 0;

            switch (action) {
                case "A" -> damage = attack(adjacent, enemyPower, roll, rng);
                case "L", "R" -> {
                    int target = playerCol + (action.equals("L") ? -1 : 1);
                    char cell = peek(arena, playerRow, target);
                    if (cell == '#' || cell == 'X') {
                        System.out.println(cell == '#' ? "The wall stops you."
                                                       : "The " + enemyName + " blocks your way.");
                    } else {
                        // Three steps, every time: clear, update, set.
                        // Miss the clear and the player leaves a trail of '@'.
                        arena[playerRow][playerCol] = ' ';
                        if (cell == '^') {
                            health = applyDamage(health, 8);
                            System.out.println("You step on a spike trap. 8 damage.");
                        } else if (cell == '$') {
                            gold += 15;
                            System.out.println("You scoop up 15 gold.");
                        } else {
                            System.out.println(action.equals("L") ? "You step left." : "You step right.");
                        }
                        playerCol = target;
                        arena[playerRow][playerCol] = '@';
                    }
                }
                case "D" -> health = defend(health);
                case "P" -> {
                    int slot = findItem(itemNames, itemSlots, "Potion");
                    if (slot >= 0 && itemCounts[slot] > 0) {
                        itemCounts[slot]--;
                        health = drinkPotion(health);
                    } else {
                        System.out.println("You reach for a potion. There are none.");
                    }
                }
                case "F" -> fled = flee();
                default -> System.out.println("The crowd jeers. You hesitate and lose the turn.");
            }

            enemyHealth = applyDamage(enemyHealth, damage);
            if (loggedTurns < damageLog.length) {
                damageLog[loggedTurns++] = damage;      // < length, never <=
            }

            health = enemyResponse(fled, adjacent, health, enemyHealth, enemyPower, enemyName);
            printHealthBar(health);

            boolean over = endOfFight(fled, health, enemyHealth, enemyName, turnNumber);
            if (over && !fled && !isAlive(enemyHealth)) {
                String loot = rollLoot(rng);
                if (loot.equals("Relic")) {
                    level++;
                    System.out.println("The relic hums. You reach level " + level + ".");
                }
                itemSlots = awardLoot(loot, itemNames, itemCounts, itemSlots);
            }
            playing = !over;
            turnNumber++;
        }

        System.out.printf("%nGold: %d%n", gold);
        System.out.printf("Average damage per turn: %.1f%n", average(damageLog, loggedTurns));
        verifyLootTable(rng, 1000);
        System.out.printf("The arena empties after %d turns.%n", turnNumber - 1);
    }

    // ================= arrays =================

    /**
     * Builds an empty arena with a wall of '#' around the outside.
     *
     * @return a new ROWS by COLS grid, walls on the border, spaces inside
     */
    static char[][] newArena() {
        char[][] arena = new char[ROWS][COLS];
        // arena.length is the number of ROWS.
        // arena[r].length is the number of COLUMNS in row r.
        for (int r = 0; r < arena.length; r++) {
            for (int c = 0; c < arena[r].length; c++) {
                boolean edge = (r == 0 || r == arena.length - 1
                             || c == 0 || c == arena[r].length - 1);
                arena[r][c] = edge ? '#' : ' ';
            }
        }
        return arena;
    }

    // A 2D array is an ARRAY OF ROWS, so the enhanced for hands you each row.
    /**
     * Prints the arena to the console, one row per line.
     *
     * @param arena the grid to draw
     */
    static void drawArena(char[][] arena) {
        for (char[] row : arena) {
            System.out.println(new String(row));
        }
        System.out.println("");
    }

    // Reading the cell you are about to enter IS collision detection. U3 does
    // exactly this with sprites.
    /**
     * Reports what is in one cell WITHOUT moving anything into it.
     * Anything outside the grid reads as a wall, so callers never have to
     * range-check before asking.
     *
     * @param arena the grid to look at
     * @param row row index, may be out of range
     * @param col column index, may be out of range
     * @return the character in that cell, or '#' if the cell is off the grid
     */
    static char peek(char[][] arena, int row, int col) {
        if (row < 0 || row >= arena.length) return '#';
        if (col < 0 || col >= arena[row].length) return '#';
        return arena[row][col];
    }

    /**
     * Prints the pack, one numbered line per filled slot.
     *
     * @param names item names; entries past slots may be null
     * @param counts how many of each
     * @param slots how many slots are actually filled
     */
    static void printInventory(String[] names, int[] counts, int slots) {
        System.out.println("-- Pack --");
        for (int i = 0; i < slots; i++) {
            System.out.printf("  %d) %-10s x%d%n", i + 1, names[i], counts[i]);
        }
        System.out.println("");
    }

    // Loops to `slots`, not to names.length — the tail of the array is still
    // null, and calling anything on null throws.
    /**
     * Finds where an item sits in the pack.
     *
     * @param names item names; entries past slots may be null
     * @param slots how many slots are filled
     * @param wanted the item name to look for
     * @return the index of the item, or -1 if the pack does not contain it
     */
    static int findItem(String[] names, int slots, String wanted) {
        for (int i = 0; i < slots; i++) {
            if (names[i] != null && names[i].equals(wanted)) return i;
        }
        return -1;
    }

    /**
     * Averages the first used entries of a log.
     *
     * @param log the numbers
     * @param used how many entries are real
     * @return the mean of the first used entries, or 0.0 when used is 0
     */
    static double average(int[] log, int used) {
        if (used == 0) return 0.0;
        int total = 0;
        for (int i = 0; i < used; i++) {
            total += log[i];
        }
        return (double) total / used;      // the L3 cast, still earning its keep
    }

    // ================= output =================

    /**
     * Prints the title card shown once at the start of the game.
     */
    static void printTitle() {
        System.out.print("""
                ========================
                     THE ARENA
                ========================
                """);
        System.out.println("Sand, torchlight, and a crowd that has already decided how this ends.");
        System.out.println("The gate opens.");
        System.out.println("");
    }

    /**
     * Prints both fighters, waits for Enter, then counts the player in.
     *
     * @param in the shared Scanner
     * @param name the player's name
     * @param hp the player's starting health
     * @param enemy the enemy's name
     * @param enemyHp the enemy's starting health
     */
    static void openingCeremony(Scanner in, String name, int hp, String enemy, int enemyHp) {
        System.out.printf("%-12s HP %3d/%3d%n", name, hp, MAX_HEALTH);
        System.out.printf("%s enters the arena. The %s has %d HP.%n", name, enemy, enemyHp);
        System.out.print("Press Enter to begin...");
        in.nextLine();
        System.out.println("");
        countdown(3);
        System.out.println("");
    }

    /**
     * Prints one line boxed in dashes.
     *
     * @param text the line to box
     */
    static void printBanner(String text) {
        System.out.println("=".repeat(40));
        System.out.printf("  %s%n", text);
    }

    /**
     * Prints the one-line status of both fighters.
     *
     * @param name the player's name
     * @param hp the player's health
     * @param enemy the enemy's name
     * @param enemyHp the enemy's health
     */
    static void printFighters(String name, int hp, String enemy, int enemyHp) {
        System.out.printf("%-12s HP %3d/%3d    %-14s HP %3d%n", name, hp, MAX_HEALTH, enemy, enemyHp);
        System.out.println("");
    }

    /**
     * Prints a bar of blocks standing for the player's health.
     *
     * @param hp current health, 0 to MAX_HEALTH
     */
    static void printHealthBar(int hp) {
        int bars = hp / 5;
        System.out.printf("[%s] %d%%%n", "#".repeat(bars) + "-".repeat(20 - bars), hp);
    }

    /**
     * Counts down out loud before the fight starts.
     *
     * @param from the number to start counting down from
     */
    static void countdown(int from) {
        for (int i = from; i > 0; i--) System.out.println(i + "...");
        System.out.println("FIGHT!");
    }

    // ================= input =================

    /**
     * Asks for the player's name and refuses to accept an empty one.
     *
     * @param in the shared Scanner
     * @return a name with at least one non-space character
     */
    static String readName(Scanner in) {
        System.out.print("What is your name, challenger? ");
        String name = in.nextLine().trim();
        return name.isEmpty() ? "Challenger" : name;
    }

    /**
     * Asks for a whole number and keeps asking until it is in range.
     * Non-numeric input is consumed rather than crashing, which is the L8 fix.
     *
     * @param in the shared Scanner
     * @param min smallest allowed value
     * @param max largest allowed value
     * @param prompt what to print each time
     * @return a number between min and max inclusive
     */
    static int readChoice(Scanner in, int min, int max, String prompt) {
        int choice;
        do {
            System.out.printf("%s: ", prompt);
            while (!in.hasNextInt()) {
                in.next();
                System.out.printf("Numbers only. %s: ", prompt);
            }
            choice = in.nextInt();
            in.nextLine();
        } while (choice < min || choice > max);
        return choice;
    }

    /**
     * Asks what the player wants to do this turn and normalises the answer.
     *
     * @param in the shared Scanner
     * @param adjacent true when the enemy is next to the player
     * @param enemyName the enemy's name, for the prompt
     * @return an uppercase single-letter action
     */
    static String readAction(Scanner in, boolean adjacent, String enemyName) {
        if (adjacent) {
            System.out.print("[A]ttack  [D]efend  [P]otion  [L]eft  [R]ight  [F]lee: ");
        } else {
            System.out.print("The " + enemyName + " is out of reach.  "
                             + "[L]eft  [R]ight  [D]efend  [P]otion  [F]lee: ");
        }
        return in.nextLine().trim().toUpperCase();
    }

    // ================= values =================

    /**
     * Turns the difficulty number into the word shown on screen.
     *
     * @param difficulty 1, 2 or 3
     * @return "Easy", "Normal" or "Hard"
     */
    static String difficultyName(int difficulty) {
        return switch (difficulty) {
            case 1 -> "Easy";
            case 2 -> "Normal";
            case 3 -> "Brutal";
            default -> "Unknown";
        };
    }

    /**
     * Reports whether a fighter is still standing.
     *
     * @param hp the health to test
     * @return true when hp is above zero
     */
    static boolean isAlive(int hp) { return hp > 0; }

    /**
     * Reports whether two cells touch, including diagonally.
     *
     * @param r1 first row
     * @param c1 first column
     * @param r2 second row
     * @param c2 second column
     * @return true when the two cells are next to each other
     */
    static boolean isAdjacent(int r1, int c1, int r2, int c2) {
        return r1 == r2 && Math.abs(c1 - c2) == 1;
    }

    /**
     * Works out damage for one blow. A roll of 9 or 10 is a critical hit
     * and doubles the result.
     *
     * @param power the attacker's base power
     * @param roll 1 to 10; 9 or above is critical
     * @return damage dealt, never below zero
     */
    static int calculateDamage(int power, int roll) {
        if (roll >= 9) return power * 2;
        if (roll >= 3) return power;
        return 0;
    }

    /**
     * Subtracts damage from a health total.
     *
     * @param hp health before the blow
     * @param damage damage dealt
     * @return health after the blow
     */
    static int applyDamage(int hp, int damage) { return hp - damage; }

    // Read it inside-out: never above max, then never below min. This one line
    // is the Lesson 4 TODO, closed permanently.
    /**
     * Forces a value into a range.
     *
     * @param value the number to limit
     * @param min lowest allowed
     * @param max highest allowed
     * @return value, or the nearest end of the range
     */
    static int clamp(int value, int min, int max) { return Math.max(min, Math.min(max, value)); }

    /**
     * Resolves the player's attack for one turn.
     *
     * @param adjacent true when the enemy is in reach
     * @param enemyPower the enemy's power
     * @param roll this turn's roll
     * @param rng the shared random source
     * @return damage dealt to the enemy, or 0 when out of reach
     */
    static int attack(boolean adjacent, int enemyPower, int roll, Random rng) {
        if (!adjacent) {
            System.out.println("You swing at empty air. Get closer first.");
            return 0;
        }
        int damage = calculateDamage(enemyPower, roll);
        // Variance, floored at 0 -- negative damage would HEAL the enemy.
        if (damage > 0) damage = Math.max(0, damage + rng.nextInt(-2, 3));
        if (damage == 0)              System.out.println("You miss.");
        else if (damage > enemyPower) System.out.println("CRITICAL HIT!");
        else                          System.out.println("A solid hit.");
        return damage;
    }

    /**
     * Applies the defend action.
     *
     * @param health health before defending
     * @return health after defending, capped at MAX_HEALTH
     */
    static int defend(int health) {
        System.out.println("You raise your guard and recover 5 HP.");
        return health + 5;
    }

    /**
     * Applies a potion.
     *
     * @param health health before drinking
     * @return health after drinking, capped at MAX_HEALTH
     */
    static int drinkPotion(int health) {
        System.out.println("You drink a potion and recover 25 HP.");
        return health + 25;
    }

    /**
     * Applies the flee action.
     *
     * @return always true; fleeing always ends the fight
     */
    static boolean flee() {
        System.out.println("You run for the gate. The crowd howls.");
        return true;
    }

    /**
     * Works out how much the enemy hits back for this turn.
     *
     * @param fled true when the player fled
     * @param adjacent true when the enemy is in reach
     * @param health the player's health
     * @param enemyHealth the enemy's health
     * @param enemyPower the enemy's power
     * @return damage dealt to the player
     */
    static int enemyResponse(boolean fled, boolean adjacent, int health,
                             int enemyHealth, int enemyPower, String enemyName) {
        if (!fled && isAlive(enemyHealth) && adjacent) {
            health = applyDamage(health, enemyPower);
            System.out.printf("The %s strikes back for %d.%n", enemyName, enemyPower);
        }
        return clamp(health, 0, MAX_HEALTH);
    }

    /**
     * Decides whether the fight is over and prints the ending if it is.
     * Fleeing is checked FIRST, so fleeing at 0 HP does not report a death.
     *
     * @param fled true when the player fled
     * @param health the player's health
     * @param enemyHealth the enemy's health
     * @param name the player's name
     * @param enemy the enemy's name
     * @param turn the turn number just played
     * @return true when the fight has ended
     */
    static boolean endOfFight(boolean fled, int health, int enemyHealth,
                              String enemyName, int turnNumber) {
        if (fled) {
            System.out.println("You escape with your life, and nothing else.");
            return true;
        }
        if (!isAlive(enemyHealth)) {
            System.out.printf("%nThe %s falls! You win on turn %d.%n", enemyName, turnNumber);
            return true;
        }
        if (!isAlive(health)) {
            System.out.printf("%nYou have fallen on turn %d.%n", turnNumber);
            return true;
        }
        return false;
    }

    // ================= the loot algorithm (D1.12) =================
    //
    // 1. RESTATE   When an enemy dies, one item drops, at fixed odds.
    // 2. DECOMPOSE roll a number; map it to an item; report it; add it to the
    //              pack if there is room.
    // 3. SEQUENCE  roll BEFORE mapping; check for space BEFORE adding.
    // 4. TEST      50/30/15/5, verified below by rolling it a thousand times.
    //
    // The thresholds are CUMULATIVE (50, 80, 95) because each `if` only sees
    // the rolls that already failed the ones above it. 50-79 is thirty numbers
    // wide, which is the 30%.
    /**
     * Rolls one item off the weighted loot table.
     *
     * @param rng the shared random source
     * @return the name of the item rolled
     */
    static String rollLoot(Random rng) {
        int roll = rng.nextInt(100);        // 0..99
        if (roll < 50) return "Potion";
        if (roll < 80) return "Coin Pouch";
        if (roll < 95) return "Shield";
        return "Relic";
    }

    // Step 4 as real code. Students run this and watch their own numbers land
    // on 50/30/15/5, which is a far better proof than being told it is right.
    /**
     * Rolls the loot table many times and prints how often each item came up.
     * A test harness, not part of the game: it is how we showed the weights are
     * what we said they were.
     *
     * @param rng the shared random source
     * @param rolls how many rolls to make
     */
    static void verifyLootTable(Random rng, int rolls) {
        int[] counts = new int[4];
        for (int i = 0; i < rolls; i++) {
            String loot = rollLoot(rng);
            if (loot.equals("Potion"))          counts[0]++;
            else if (loot.equals("Coin Pouch")) counts[1]++;
            else if (loot.equals("Shield"))     counts[2]++;
            else                                counts[3]++;
        }
        String[] labels = {"Potion", "Coin Pouch", "Shield", "Relic"};
        double[] expected = {50, 30, 15, 5};
        System.out.printf("%n-- Loot table over %d rolls --%n", rolls);
        for (int i = 0; i < labels.length; i++) {
            System.out.printf("  %-11s %5.1f%%   (expected %.0f%%)%n",
                              labels[i], counts[i] * 100.0 / rolls, expected[i]);
        }
    }

    // Adds to the pack if there is room; stacks if the item is already there.
    /**
     * Puts an item in the pack, stacking it if it is already there.
     *
     * @param loot the item name
     * @param names pack item names
     * @param counts pack counts
     * @param slots how many slots are filled before this call
     * @return the number of filled slots after the award
     */
    static int awardLoot(String loot, String[] names, int[] counts, int slots) {
        System.out.printf("The %s drops!%n", loot);
        int existing = findItem(names, slots, loot);
        if (existing >= 0) {
            counts[existing]++;
            return slots;
        }
        if (slots >= names.length) {
            System.out.println("Your pack is full!");
            return slots;
        }
        names[slots] = loot;
        counts[slots] = 1;
        return slots + 1;
    }
}
