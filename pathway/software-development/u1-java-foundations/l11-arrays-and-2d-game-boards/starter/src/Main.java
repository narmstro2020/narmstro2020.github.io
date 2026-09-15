/*
 * U1 L11 — ARRAYS AND 2D GAME BOARDS · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 11
 *
 * START FROM YOUR OWN LESSON 10 FILE. The code below is the L10 solution, for
 * anyone who lost theirs. The TODO markers are the same either way.
 *
 *     javac Main.java
 *     java Main
 *
 * THE ONE IDEA: Lesson 9 DREW the grid with if-statements. Today you STORE it
 * in a char[][]. Then a hazard is one assignment, and collision is reading the
 * cell you are about to step into.
 *
 * SIX TODOs, marked in the code below. Do them in order. Compile after each.
 *
 *   TODO 1  the pack       two arrays + printInventory + findItem     (add)
 *   TODO 2  the board      newArena() builds a char[][]                (add)
 *   TODO 3  drawing        drawArena(char[][]) replaces the L9 loop    (replace)
 *   TODO 4  moving         peek() + clear / update / set               (replace)
 *   TODO 5  the log        damageLog[] and average()                   (add)
 *   TODO 6  break it       two errors on purpose, then undo them
 *
 * THREE FACTS THAT CAUSE EVERY ARRAY BUG
 *   new String[5] is five forever.     .length has NO parentheses.
 *   Indices run 0 to length-1.         String[] starts full of null.
 *
 * FINISHED EARLY?  A hazard '^' that hurts and a treasure '$' that pays. One
 * line each to place them (see TODO 2) and two branches to react (TODO 4).
 *
 * BEFORE YOU LEAVE: back up as Arena_U1L11_LastnameF and submit.
 */

import java.util.Scanner;

public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;
    static final int ROWS = 5;
    static final int COLS = 11;
    // TODO 1a · add:   static final int PACK_SLOTS = 5;

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

        // ---- TODO 1b · THE PACK ------------------------------------------
        // Two arrays side by side, and a count of how many slots are filled:
        //
        //     String[] itemNames = new String[PACK_SLOTS];
        //     int[] itemCounts = new int[PACK_SLOTS];
        //     int itemSlots = 0;
        //     itemNames[0] = "Potion";  itemCounts[0] = 2;  itemSlots++;
        //     itemNames[1] = "Bomb";    itemCounts[1] = 1;  itemSlots++;
        //
        // Then delete `potions = 2` from the line above -- the pack holds the
        // potions now. The "P" case in the switch is TODO 1d.
        // ------------------------------------------------------------------

        // ---- TODO 5a · THE DAMAGE LOG ------------------------------------
        //     int[] damageLog = new int[20];
        //     int loggedTurns = 0;
        // An int[] starts full of 0, so nothing to fill in.
        // ------------------------------------------------------------------

        // ---- TODO 2b · BUILD THE BOARD -----------------------------------
        //     char[][] arena = newArena();          // TODO 2a writes newArena
        //     arena[playerRow][playerCol] = '@';
        //     arena[enemyRow][enemyCol]   = 'X';
        // Extension: arena[3][4] = '^';  arena[1][7] = '$';   -- one line each
        // ------------------------------------------------------------------

        openingCeremony(in, playerName, health, enemyName, enemyHealth);

        int turnNumber = 1;
        boolean playing = true, fled = false;

        while (playing) {
            // ---- TODO 3a · REPLACE the drawTurn call with three calls ------
            //     printBanner("Turn " + turnNumber);
            //     printFighters(playerName, health, enemyName, enemyHealth);
            //     drawArena(arena);                 // the board, not positions
            //     printInventory(itemNames, itemCounts, itemSlots);   // TODO 1c
            // then delete the drawTurn method below. It only bundled these.
            // ----------------------------------------------------------------
            drawTurn(turnNumber, playerName, health, enemyName, enemyHealth,
                     playerRow, playerCol, enemyRow, enemyCol);

            boolean adjacent = isAdjacent(playerRow, playerCol, enemyRow, enemyCol);
            int roll = (turnNumber * 3) % 10 + 1;
            String action = readAction(in, adjacent, enemyName);
            int damage = 0;

            switch (action) {
                case "A" -> damage = attack(adjacent, enemyPower, roll);

                // ---- TODO 4a · REPLACE the "L" and "R" cases with ONE case --
                //     case "L", "R" -> {
                //         int target = playerCol + (action.equals("L") ? -1 : 1);
                //         char cell = peek(arena, playerRow, target);   // TODO 4b
                //         if (cell == '#' || cell == 'X') {
                //             System.out.println(cell == '#' ? "The wall stops you."
                //                                            : "The " + enemyName + " blocks your way.");
                //         } else {
                //             arena[playerRow][playerCol] = ' ';       // 1. clear the old cell
                //             playerCol = target;                      // 2. move
                //             arena[playerRow][playerCol] = '@';       // 3. set the new cell
                //             System.out.println(action.equals("L") ? "You step left." : "You step right.");
                //         }
                //     }
                // Skip step 1 and the player leaves a trail of '@'. You will see it.
                // Then delete moveLeft and moveRight below -- the board replaced them.
                // Extension: before step 2, if cell == '^' take 8 damage; if '$' add gold.
                // ----------------------------------------------------------------
                case "L" -> playerCol = moveLeft(playerCol);
                case "R" -> playerCol = moveRight(playerCol, enemyCol, enemyName);

                case "D" -> health = defend(health);

                // ---- TODO 1d · REPLACE the "P" case: potions live in the pack --
                //     case "P" -> {
                //         int slot = findItem(itemNames, itemSlots, "Potion");   // TODO 1c
                //         if (slot >= 0 && itemCounts[slot] > 0) {
                //             itemCounts[slot]--;
                //             health = drinkPotion(health);
                //         } else {
                //             System.out.println("You reach for a potion. There are none.");
                //         }
                //     }
                // ----------------------------------------------------------------
                case "P" -> {
                    if (potions > 0) { potions--; health = drinkPotion(health); }
                    else System.out.println("You reach for a potion. There are none.");
                }
                case "F" -> fled = flee();
                default -> System.out.println("The crowd jeers. You hesitate and lose the turn.");
            }

            enemyHealth = applyDamage(enemyHealth, damage);

            // ---- TODO 5b · record this turn's damage ---------------------------
            //     if (loggedTurns < damageLog.length) {      // < length, never <=
            //         damageLog[loggedTurns++] = damage;
            //     }
            // --------------------------------------------------------------------

            health = enemyResponse(fled, adjacent, health, enemyHealth, enemyPower, enemyName);
            printHealthBar(health);

            playing = !endOfFight(fled, health, enemyHealth, enemyName, turnNumber);
            turnNumber++;
        }

        // ---- TODO 5c · print the average --------------------------------------
        //     System.out.printf("Average damage per turn: %.1f%n", average(damageLog, loggedTurns));
        // ------------------------------------------------------------------------
        System.out.printf("%nThe arena empties after %d turns.%n", turnNumber - 1);
    }

    // ================= arrays (new today) =================
    //
    // ---- TODO 2a · newArena: build the board ---------------------------------
    //     static char[][] newArena() {
    //         char[][] arena = new char[ROWS][COLS];
    //         for (int r = 0; r < arena.length; r++) {              // arena.length    = rows
    //             for (int c = 0; c < arena[r].length; c++) {       // arena[r].length = columns
    //                 boolean edge = (r == 0 || r == arena.length - 1
    //                              || c == 0 || c == arena[r].length - 1);
    //                 arena[r][c] = edge ? '#' : ' ';
    //             }
    //         }
    //         return arena;
    //     }
    //
    // ---- TODO 4b · peek: what is in a cell, without stepping into it ---------
    //     static char peek(char[][] arena, int row, int col) {
    //         if (row < 0 || row >= arena.length) return '#';      // off the board = wall
    //         if (col < 0 || col >= arena[row].length) return '#';
    //         return arena[row][col];
    //     }
    //     That IS collision detection. Unit 3 does exactly this with sprites.
    //
    // ---- TODO 1c · printInventory and findItem -------------------------------
    //     static void printInventory(String[] names, int[] counts, int slots) {
    //         System.out.println("-- Pack --");
    //         for (int i = 0; i < slots; i++) {                     // to slots, NOT names.length
    //             System.out.printf("  %d) %-10s x%d%n", i + 1, names[i], counts[i]);
    //         }
    //         System.out.println("");
    //     }
    //
    //     static int findItem(String[] names, int slots, String wanted) {
    //         for (int i = 0; i < slots; i++) {
    //             if (names[i].equals(wanted)) return i;
    //         }
    //         return -1;                                             // not in the pack
    //     }
    //     Loop to `slots`, not names.length: the tail of the array is still null,
    //     and null.equals(...) throws.
    //
    // ---- TODO 5d · average -----------------------------------------------------
    //     static double average(int[] log, int used) {
    //         if (used == 0) return 0.0;
    //         int total = 0;
    //         for (int i = 0; i < used; i++) total += log[i];
    //         return (double) total / used;                          // the L3 cast
    //     }
    //
    // ---- TODO 6 · BREAK IT ON PURPOSE, then put it back ----------------------
    //     itemNames[5] = "x";        -> ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5
    //     itemNames[3].length();     -> NullPointerException (slot 3 was never assigned)
    //     Read both messages out loud. The first one tells you the index AND the
    //     length, which is the whole diagnosis.
    // --------------------------------------------------------------------------

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
        printStatus(name, hp, MAX_HEALTH, STARTING_GOLD, 1);
        System.out.printf("%s enters the arena. The %s has %d HP.%n", name, enemy, enemyHp);
        System.out.print("Press Enter to begin...");
        in.nextLine();
        System.out.println("");
        countdown(3);
        System.out.println("");
    }

    // TODO 3a · delete this method once main calls the three parts itself.
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

    // ---- TODO 3b · REPLACE this whole method ------------------------------------
    // It DRAWS the board from positions. The new one PRINTS the stored board:
    //
    //     static void drawArena(char[][] arena) {
    //         for (char[] row : arena) {               // a 2D array is an array of rows
    //             System.out.println(new String(row));
    //         }
    //         System.out.println("");
    //     }
    //
    // Same name, different parameter. Keep ROWS and COLS -- newArena uses them.
    // -----------------------------------------------------------------------------
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

    // TODO 4a · delete moveLeft and moveRight once the "L", "R" case uses the board.
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
