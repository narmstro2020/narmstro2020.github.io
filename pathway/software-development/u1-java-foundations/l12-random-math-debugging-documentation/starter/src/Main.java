/*
 * U1 L12 — RANDOM, MATH, ALGORITHM DESIGN · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 12
 *
 * ALREADY HERE:  Lesson 11. Arrays, a stored board, an inventory.
 * YOU'RE ADDING: real randomness, one-line clamping, and an algorithm you
 *                design ON PAPER before you type it.
 *
 *     javac Main.java
 *     java Main
 *
 * ==========================================================================
 * TODAY THE DESIGN HAPPENS ON PAPER FIRST
 *
 * Standard D1.12 is "systematic problem analysis and algorithm development".
 * That is not something you can do in an editor. Four steps, every time:
 *
 *   1. RESTATE   the problem in one sentence
 *   2. DECOMPOSE it into steps
 *   3. SEQUENCE  them -- what happens first, what depends on what
 *   4. TEST      against cases you chose BEFORE you wrote it
 *
 * Step 4 is the one people skip and the one that catches the bug.
 *
 * ==========================================================================
 * TODO 1: clamp health in ONE line, and delete the Lesson 4 TODO.
 *
 *           health = Math.max(0, Math.min(MAX_HEALTH, health));
 *
 *         Read it inside-out: never above the max, then never below zero.
 *         Test it by over-healing AND by taking a massive hit. The bar has to
 *         survive both.
 *
 * TODO 2: real randomness.
 *
 *           import java.util.Random;
 *           Random rng = new Random();
 *
 *           int r = rng.nextInt(1, 11);     // 1..10  (Java 17+, prefer this)
 *
 *         Replace the fake `(turnNumber * 3) % 10 + 1` roll.
 *
 *         CREATE THE Random ONCE, outside the game loop. One created inside
 *         the loop gets re-created every turn and stops behaving randomly.
 *
 *         SEEDING: new Random(42) gives the same sequence every run. Use a
 *         seed while you are hunting a bug so it happens the same way twice --
 *         then take it out. A bug you cannot reproduce is a bug you cannot fix.
 *
 * TODO 3: ***THE LOOT ALGORITHM***. Paper first. This is the lesson.
 *
 *         SPEC — LOOT DROP
 *           When an enemy dies, roll for loot:
 *             50% Potion, 30% Coin Pouch, 15% Shield, 5% Relic.
 *           A Relic also grants +1 level.
 *           Print what dropped. Add it to the pack if there is room; if the
 *           pack is full, print "Your pack is full!" and drop nothing.
 *
 *         WRITE THE FOUR STEPS DOWN BEFORE YOU OPEN THE EDITOR.
 *
 *         Then, and only then:
 *
 *           static String rollLoot(Random rng) {
 *               int roll = rng.nextInt(100);        // 0..99
 *               if (roll < 50) return "Potion";
 *               if (roll < 80) return "Coin Pouch";
 *               if (roll < 95) return "Shield";
 *               return "Relic";
 *           }
 *
 *         WHY 50 / 80 / 95 AND NOT 50 / 30 / 15?
 *         Work it out before you read on. The thresholds are CUMULATIVE --
 *         each `if` only sees the rolls that already failed the ones above it,
 *         so 50-79 is thirty numbers wide, which is the 30%.
 *
 * TODO 4: TEST IT. Do not trust it.
 *
 *           int[] counts = new int[4];
 *           for (int i = 0; i < 1000; i++) {
 *               String loot = rollLoot(rng);
 *               if (loot.equals("Potion"))          counts[0]++;
 *               else if (loot.equals("Coin Pouch")) counts[1]++;
 *               else if (loot.equals("Shield"))     counts[2]++;
 *               else                                counts[3]++;
 *           }
 *
 *         Print the percentages. You should get something close to
 *         50 / 30 / 15 / 5. Your own numbers proving your own algorithm is a
 *         better result than anyone telling you it is right.
 *
 * TODO 5: damage variance.
 *
 *           int damage = base + rng.nextInt(-2, 3);   // -2 .. +2
 *           damage = Math.max(0, damage);             // never negative
 *
 *         What would negative damage look like on screen? It would HEAL the
 *         enemy. Asking that question is how you catch a bug before it exists.
 *
 * ==========================================================================
 * FINISHED EARLY?
 *
 *   Make brutal mode shift the thresholds toward Relic. Then answer the real
 *   question: does that make the game better, or just easier?
 *
 * BEFORE YOU LEAVE: REMOVE ANY FIXED SEED, back up as Arena_U1L12_LastnameF,
 * and submit. A seeded game plays identically every time and looks broken.
 */

import java.util.Scanner;

/*
 * U1 L11 — ARRAYS AND 2D GAME BOARDS · your Lesson 11 code
 *
 * THE SHIFT OF THE DAY, in two words:
 *
 *   L9  DREW the grid   — a nested loop decided each character from conditions
 *   L11 STORES the grid — a char[][] holds the world, and drawing just prints it
 *
 * Everything else follows from that. A hazard is one assignment instead of
 * another else-if. Collision is reading the cell you are about to move into.
 */
public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;
    static final int ROWS = 5;
    static final int COLS = 11;
    static final int PACK_SLOTS = 5;

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        printTitle();
        String playerName = readName(in);
        int difficulty = readChoice(in, 1, 3, "Difficulty (1 = easy, 2 = normal, 3 = brutal)");
        System.out.println("Difficulty: " + difficultyName(difficulty));
        System.out.println("");

        int health = MAX_HEALTH, gold = STARTING_GOLD, playerCol = 1;
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
            int roll = (turnNumber * 3) % 10 + 1;
            String action = readAction(in, adjacent, enemyName);
            int damage = 0;

            switch (action) {
                case "A" -> damage = attack(adjacent, enemyPower, roll);
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

            playing = !endOfFight(fled, health, enemyHealth, enemyName, turnNumber);
            turnNumber++;
        }

        System.out.printf("%nGold: %d%n", gold);
        System.out.printf("Average damage per turn: %.1f%n", average(damageLog, loggedTurns));
        System.out.printf("The arena empties after %d turns.%n", turnNumber - 1);
    }

    // ================= arrays =================

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
    static void drawArena(char[][] arena) {
        for (char[] row : arena) {
            System.out.println(new String(row));
        }
        System.out.println("");
    }

    // Reading the cell you are about to enter IS collision detection. U3 does
    // exactly this with sprites.
    static char peek(char[][] arena, int row, int col) {
        if (row < 0 || row >= arena.length) return '#';
        if (col < 0 || col >= arena[row].length) return '#';
        return arena[row][col];
    }

    static void printInventory(String[] names, int[] counts, int slots) {
        System.out.println("-- Pack --");
        for (int i = 0; i < slots; i++) {
            System.out.printf("  %d) %-10s x%d%n", i + 1, names[i], counts[i]);
        }
        System.out.println("");
    }

    // Loops to `slots`, not to names.length — the tail of the array is still
    // null, and calling anything on null throws.
    static int findItem(String[] names, int slots, String wanted) {
        for (int i = 0; i < slots; i++) {
            if (names[i] != null && names[i].equals(wanted)) return i;
        }
        return -1;
    }

    static double average(int[] log, int used) {
        if (used == 0) return 0.0;
        int total = 0;
        for (int i = 0; i < used; i++) {
            total += log[i];
        }
        return (double) total / used;      // the L3 cast, still earning its keep
    }

    // ================= output =================

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

    static void openingCeremony(Scanner in, String name, int hp, String enemy, int enemyHp) {
        System.out.printf("%-12s HP %3d/%3d%n", name, hp, MAX_HEALTH);
        System.out.printf("%s enters the arena. The %s has %d HP.%n", name, enemy, enemyHp);
        System.out.print("Press Enter to begin...");
        in.nextLine();
        System.out.println("");
        countdown(3);
        System.out.println("");
    }

    static void printBanner(String text) {
        System.out.println("=".repeat(40));
        System.out.printf("  %s%n", text);
    }

    static void printFighters(String name, int hp, String enemy, int enemyHp) {
        System.out.printf("%-12s HP %3d/%3d    %-14s HP %3d%n", name, hp, MAX_HEALTH, enemy, enemyHp);
        System.out.println("");
    }

    static void printHealthBar(int hp) {
        int bars = hp / 5;
        System.out.printf("[%s] %d%%%n", "#".repeat(bars) + "-".repeat(20 - bars), hp);
    }

    static void countdown(int from) {
        for (int i = from; i > 0; i--) System.out.println(i + "...");
        System.out.println("FIGHT!");
    }

    // ================= input =================

    static String readName(Scanner in) {
        System.out.print("What is your name, challenger? ");
        String name = in.nextLine().trim();
        return name.isEmpty() ? "Challenger" : name;
    }

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

    static String difficultyName(int difficulty) {
        return switch (difficulty) {
            case 1 -> "Easy";
            case 2 -> "Normal";
            case 3 -> "Brutal";
            default -> "Unknown";
        };
    }

    static boolean isAlive(int hp) { return hp > 0; }

    static boolean isAdjacent(int r1, int c1, int r2, int c2) {
        return r1 == r2 && Math.abs(c1 - c2) == 1;
    }

    static int calculateDamage(int power, int roll) {
        if (roll >= 9) return power * 2;
        if (roll >= 3) return power;
        return 0;
    }

    static int applyDamage(int hp, int damage) { return hp - damage; }

    static int clamp(int value, int min, int max) { return Math.max(min, Math.min(max, value)); }

    static int attack(boolean adjacent, int enemyPower, int roll) {
        if (!adjacent) {
            System.out.println("You swing at empty air. Get closer first.");
            return 0;
        }
        int damage = calculateDamage(enemyPower, roll);
        if (damage == 0)              System.out.println("You miss.");
        else if (damage > enemyPower) System.out.println("CRITICAL HIT!");
        else                          System.out.println("A solid hit.");
        return damage;
    }

    static int defend(int health) {
        System.out.println("You raise your guard and recover 5 HP.");
        return health + 5;
    }

    static int drinkPotion(int health) {
        System.out.println("You drink a potion and recover 25 HP.");
        return health + 25;
    }

    static boolean flee() {
        System.out.println("You run for the gate. The crowd howls.");
        return true;
    }

    static int enemyResponse(boolean fled, boolean adjacent, int health,
                             int enemyHealth, int enemyPower, String enemyName) {
        if (!fled && isAlive(enemyHealth) && adjacent) {
            health = applyDamage(health, enemyPower);
            System.out.printf("The %s strikes back for %d.%n", enemyName, enemyPower);
        }
        return clamp(health, 0, MAX_HEALTH);
    }

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
}
