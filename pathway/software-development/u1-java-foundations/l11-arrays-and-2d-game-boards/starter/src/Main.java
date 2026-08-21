/*
 * U1 L11 — ARRAYS AND 2D GAME BOARDS · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 11
 *
 * ALREADY HERE:  Lesson 10's refactor. Everything is in methods and it works.
 * YOU'RE ADDING: arrays. A pack that holds items, and an arena that is STORED
 *                rather than drawn from a pile of if-statements.
 *
 *     javac Main.java
 *     java Main
 *
 * ==========================================================================
 * THE SHIFT, IN TWO WORDS
 *
 *   Lesson 9  DREW the grid  — a nested loop decided each character
 *   Today you STORE the grid — a char[][] holds the world
 *
 * Everything today follows from that. A hazard becomes one assignment instead
 * of another else-if. Collision becomes reading the cell you are moving into.
 *
 * ==========================================================================
 * THREE FACTS THAT CAUSE EVERY ARRAY BUG
 *
 *   1. Fixed size at creation. new String[5] is five forever.
 *   2. .length is a FIELD, no parentheses -- unlike string.length().
 *      That inconsistency is Java's fault, not yours. It still catches people.
 *   3. Indices run 0 to length-1. An array of 5 has no index 5.
 *
 *   Defaults: int[] -> 0, boolean[] -> false, String[] -> NULL.
 *   That last one is why NullPointerException is about to happen to you.
 *
 * ==========================================================================
 * TODO 1: the pack — two arrays, side by side.
 *
 *           String[] itemNames = new String[5];
 *           int[] itemCounts = new int[5];
 *           int itemSlots = 0;
 *
 *           itemNames[0] = "Potion";  itemCounts[0] = 2;  itemSlots++;
 *           itemNames[1] = "Bomb";    itemCounts[1] = 1;  itemSlots++;
 *
 *         Then a method to show it:
 *
 *           static void printInventory(String[] names, int[] counts, int slots)
 *
 *         Loop to `slots`, NOT to names.length. The rest of the array is still
 *         null, and calling anything on null throws.
 *
 *         Then ask yourself: what happens if you sort the names and forget the
 *         counts? Two arrays kept in step BY HAND. Sit with that -- in Unit 2
 *         these become one array of Item objects and the problem disappears.
 *
 * TODO 2: ***THE BOARD***. This is the lesson.
 *
 *           char[][] arena = new char[5][11];
 *
 *           for (int r = 0; r < arena.length; r++) {
 *               for (int c = 0; c < arena[r].length; c++) {
 *                   boolean edge = (r == 0 || r == arena.length - 1
 *                                || c == 0 || c == arena[r].length - 1);
 *                   arena[r][c] = edge ? '#' : ' ';
 *               }
 *           }
 *           arena[playerRow][playerCol] = '@';
 *           arena[enemyRow][enemyCol]   = 'X';
 *
 *         arena.length     = how many ROWS
 *         arena[r].length  = how many COLUMNS in row r
 *
 *         Drawing is now three lines, because a 2D array is an array of rows:
 *
 *           static void drawArena(char[][] arena) {
 *               for (char[] row : arena) {
 *                   System.out.println(new String(row));
 *               }
 *           }
 *
 * TODO 3: movement is now THREE steps, every time:
 *
 *           1. clear the old cell:  arena[r][c] = ' ';
 *           2. update the position
 *           3. set the new cell:    arena[r][c] = '@';
 *
 *         Miss step 1 and your player leaves a trail of '@' behind it. You
 *         will see it immediately and it is funny. Then fix it.
 *
 *         COLLISION is just checking what is already in the cell you are about
 *         to enter. Write a peek(arena, row, col) that returns that character,
 *         then refuse to move into '#' or 'X'.
 *
 * TODO 4: a damage log and its average.
 *
 *           int[] damageLog = new int[20];
 *           ...
 *           int total = 0;
 *           for (int d : damageLog) total += d;
 *           double average = (double) total / damageLog.length;
 *
 *         The cast is Lesson 3's. Leave it out and every average is a whole
 *         number.
 *
 * TODO 5: BREAK IT ON PURPOSE. Twice, deliberately.
 *
 *           inventory[5]        on a 5-length array
 *              -> ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5
 *
 *           names[3].length()   on a slot you never assigned
 *              -> NullPointerException
 *
 *         Read both messages out loud. Java's array errors are unusually good
 *         -- the first one tells you the index AND the length, which is the
 *         whole diagnosis.
 *
 * ==========================================================================
 * FINISHED EARLY?
 *
 *   Add a hazard '^' that hurts you and a treasure '$' that pays you.
 *   One line each -- because the grid now STORES the world instead of just
 *   drawing it. That is the entire argument for the 2D array.
 *
 * BEFORE YOU LEAVE: back up as Arena_U1L11_LastnameF and submit.
 */

import java.util.Scanner;

/*
 * U1 L10 — METHODS, PARAMETERS, RETURN VALUES · your Lesson 10 code
 *
 * SAME GAME. SAME BEHAVIOUR. Every output is byte-for-byte what L9 produced.
 * The only thing that changed is where the code lives.
 *
 *   main in L9:  258 lines   (measured, not estimated)
 *   main here:    50 lines   -- an 80% cut, into 31 named methods
 *
 * Those numbers are the lesson. Put both on the board.
 *
 * WHY NOT LOWER? The turn switch mutates five things at once -- health,
 * potions, playerCol, damage and fled. Extracting it would need to return all
 * five, and there is only one return. THAT is the extension, and it is the
 * cliffhanger into U2: you want to return a whole fighter, and you cannot yet.
 */
public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;
    static final int ROWS = 5;
    static final int COLS = 11;

    // ================= main: the shape of the program, and nothing else =====
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        printTitle();
        String playerName = readName(in);
        int difficulty = readChoice(in, 1, 3, "Difficulty (1 = easy, 2 = normal, 3 = brutal)");
        System.out.println("Difficulty: " + difficultyName(difficulty));
        System.out.println("");

        int health = MAX_HEALTH, potions = 2, playerCol = 1;
        final int playerRow = 2, enemyRow = 2, enemyCol = 9;
        String enemyName = "Cave Goblin";
        int enemyHealth = 30 + difficulty * 15;
        int enemyPower = 4 + difficulty * 3;

        openingCeremony(in, playerName, health, enemyName, enemyHealth);

        int turnNumber = 1;
        boolean playing = true, fled = false;

        while (playing) {
            drawTurn(turnNumber, playerName, health, enemyName, enemyHealth,
                     playerRow, playerCol, enemyRow, enemyCol);

            boolean adjacent = isAdjacent(playerRow, playerCol, enemyRow, enemyCol);
            int roll = (turnNumber * 3) % 10 + 1;
            String action = readAction(in, adjacent, enemyName);
            int damage = 0;

            switch (action) {
                case "A" -> damage = attack(adjacent, enemyPower, roll);
                case "L" -> playerCol = moveLeft(playerCol);
                case "R" -> playerCol = moveRight(playerCol, enemyCol, enemyName);
                case "D" -> health = defend(health);
                case "P" -> {
                    if (potions > 0) { potions--; health = drinkPotion(health); }
                    else System.out.println("You reach for a potion. There are none.");
                }
                case "F" -> fled = flee();
                default -> System.out.println("The crowd jeers. You hesitate and lose the turn.");
            }

            enemyHealth = applyDamage(enemyHealth, damage);
            health = enemyResponse(fled, adjacent, health, enemyHealth, enemyPower, enemyName);
            printHealthBar(health);

            playing = !endOfFight(fled, health, enemyHealth, enemyName, turnNumber);
            turnNumber++;
        }

        System.out.printf("%nThe arena empties after %d turns.%n", turnNumber - 1);
    }

    // ================= output: no return value, nothing to get wrong ========

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
        printStatus(name, hp, MAX_HEALTH, STARTING_GOLD, 1);
        System.out.printf("%s enters the arena. The %s has %d HP.%n", name, enemy, enemyHp);
        System.out.print("Press Enter to begin...");
        in.nextLine();
        System.out.println("");
        countdown(3);
        System.out.println("");
    }

    static void drawTurn(int turnNumber, String name, int hp, String enemy, int enemyHp,
                         int playerRow, int playerCol, int enemyRow, int enemyCol) {
        printBanner("Turn " + turnNumber);
        printFighters(name, hp, enemy, enemyHp);
        drawArena(playerRow, playerCol, enemyRow, enemyCol);
    }

    static void printBanner(String text) {
        System.out.println("=".repeat(40));
        System.out.printf("  %s%n", text);
    }

    static void printStatus(String name, int hp, int maxHp, int gold, int level) {
        System.out.printf("%-12s HP %3d/%3d  Gold %4d  Lv %d%n", name, hp, maxHp, gold, level);
        System.out.println("");
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
        for (int i = from; i > 0; i--) {
            System.out.println(i + "...");
        }
        System.out.println("FIGHT!");
    }

    // L9's nested loop, unchanged — just moved somewhere with a name.
    static void drawArena(int playerRow, int playerCol, int enemyRow, int enemyCol) {
        for (int r = 0; r < ROWS; r++) {
            for (int c = 0; c < COLS; c++) {
                if (r == playerRow && c == playerCol)      System.out.print('@');
                else if (r == enemyRow && c == enemyCol)   System.out.print('X');
                else if (r == 0 || r == ROWS - 1)          System.out.print('-');
                else if (c == 0 || c == COLS - 1)          System.out.print('|');
                else                                       System.out.print(' ');
            }
            System.out.println();
        }
        System.out.println("");
    }

    // ================= input =================

    static String readName(Scanner in) {
        System.out.print("What is your name, challenger? ");
        String name = in.nextLine().trim();
        return name.isEmpty() ? "Challenger" : name;
    }

    // The twelve ugly lines from L8, now one call. THIS is the extraction that
    // makes the case for methods better than any definition does.
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

    // ================= things that give a value back =================

    static String difficultyName(int difficulty) {
        return switch (difficulty) {
            case 1 -> "Easy";
            case 2 -> "Normal";
            case 3 -> "Brutal";
            default -> "Unknown";
        };
    }

    static boolean isAlive(int hp) {
        return hp > 0;
    }

    static boolean isAdjacent(int r1, int c1, int r2, int c2) {
        return r1 == r2 && Math.abs(c1 - c2) == 1;
    }

    static int calculateDamage(int power, int roll) {
        if (roll >= 9) return power * 2;
        if (roll >= 3) return power;
        return 0;
    }

    // OVERLOAD: same name, different parameter list. Java picks by what you pass.
    // Note the parameters differ — a return-type-only difference will not compile.
    static int calculateDamage(int power, int roll, double critMultiplier) {
        if (roll >= 9) return (int) (power * critMultiplier);
        if (roll >= 3) return power;
        return 0;
    }

    static int applyDamage(int hp, int damage) {
        return hp - damage;
    }

    static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    static int attack(boolean adjacent, int enemyPower, int roll) {
        if (!adjacent) {
            System.out.println("You swing at empty air. Get closer first.");
            return 0;
        }
        int damage = calculateDamage(enemyPower, roll);
        if (damage == 0)                   System.out.println("You miss.");
        else if (damage > enemyPower)      System.out.println("CRITICAL HIT!");
        else                               System.out.println("A solid hit.");
        return damage;
    }

    static int moveLeft(int playerCol) {
        if (playerCol - 1 < 1) {
            System.out.println("The wall stops you.");
            return playerCol;
        }
        System.out.println("You step left.");
        return playerCol - 1;
    }

    static int moveRight(int playerCol, int enemyCol, String enemyName) {
        if (playerCol + 1 > COLS - 2) {
            System.out.println("The wall stops you.");
            return playerCol;
        }
        if (playerCol + 1 == enemyCol) {
            System.out.println("The " + enemyName + " blocks your way.");
            return playerCol;
        }
        System.out.println("You step right.");
        return playerCol + 1;
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

    // The enemy only answers if you are still here and it can reach you.
    // Returns the player's new health, clamped — because a method that changes
    // a parameter changes only its own copy.
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
