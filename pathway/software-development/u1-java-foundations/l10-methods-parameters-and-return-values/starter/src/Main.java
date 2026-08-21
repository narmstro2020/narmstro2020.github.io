/*
 * U1 L10 — METHODS, PARAMETERS, RETURN VALUES · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 10
 *
 * ALREADY HERE:  Lessons 1-9 finished. It works. It is also 258 lines long
 *                and every one of them is inside main.
 * YOU'RE ADDING: nothing. Today you MOVE things.
 *
 *     javac Main.java
 *     java Main
 *
 * THE RULE OF THE DAY: BEHAVIOUR MUST NOT CHANGE.
 *
 *   1. Run it now. Play one fight. Write down what happens.
 *   2. Refactor.
 *   3. Run it again. If anything is different, you broke it.
 *
 * That discipline has a name — refactoring — and it is worth more than the
 * syntax you learn today.
 *
 * ==========================================================================
 * YOUR TARGET
 *
 *   main right now:  258 lines
 *   main by the end: under 60
 *
 * Count it before and after. Both numbers go on the board.
 * ==========================================================================
 *
 * HOW TO DO THIS WITHOUT BREAKING IT
 *
 *   Move ONE thing. Compile. Run. Then move the next one.
 *
 *   Moving six methods and then compiling gives you six errors at once and no
 *   idea which change caused which. Moving one gives you one.
 *
 * ==========================================================================
 * THE ORDER TO WORK IN — easiest first, so you get a win early
 *
 * TODO 1: the pure-output ones. No return value; nothing to get subtly wrong.
 *
 *           static void printBanner(String text) {
 *               System.out.println("=".repeat(40));
 *               System.out.printf("  %s%n", text);
 *           }
 *
 *           static void printHealthBar(int hp) { ... }
 *           static void printTitle() { ... }
 *           static void countdown(int from) { ... }
 *
 *         Methods go at CLASS level — as siblings of main, not inside it.
 *         Look at where main's closing brace is and put them after it.
 *
 * TODO 2: the ones that hand a value back.
 *
 *           static boolean isAlive(int hp) {
 *               return hp > 0;
 *           }
 *
 *           static int calculateDamage(int power, int roll) {
 *               if (roll >= 9) return power * 2;
 *               if (roll >= 3) return power;
 *               return 0;
 *           }
 *
 *           static int applyDamage(int hp, int damage) { return hp - damage; }
 *
 *         Three returns in one method is fine. The first one that runs wins.
 *
 * TODO 3: the arena. It is the biggest single block in main and it moves
 *         without changing a character:
 *
 *           static void drawArena(int playerRow, int playerCol,
 *                                 int enemyRow, int enemyCol) { ... }
 *
 *         It needs FOUR parameters because a method cannot see main's local
 *         variables. That is not a limitation to work around — it is the
 *         entire point. The method works for any positions you hand it.
 *
 * TODO 4: the big win — the input validation from Lesson 8.
 *
 *           static int readChoice(Scanner in, int min, int max) {
 *               int choice;
 *               do {
 *                   System.out.printf("Choose %d-%d: ", min, max);
 *                   while (!in.hasNextInt()) {
 *                       in.next();
 *                       System.out.printf("Numbers only. Choose %d-%d: ", min, max);
 *                   }
 *                   choice = in.nextInt();
 *                   in.nextLine();
 *               } while (choice < min || choice > max);
 *               return choice;
 *           }
 *
 *         Twelve lines you fought for in Lesson 8, now one call — and you can
 *         use it anywhere you need a number in a range. THAT is abstraction.
 *
 * TODO 5: OVERLOAD calculateDamage with a crit-multiplier version.
 *
 *           static int calculateDamage(int power, int roll, double critMultiplier)
 *
 *         Same name, different PARAMETER LIST. Two methods that differ only in
 *         return type will not compile — try it once so you see the error.
 *
 * ==========================================================================
 * THE ONE THAT WILL CATCH YOU
 *
 *   static void tryToHeal(int hp) { hp += 50; }   // does NOTHING
 *
 *   Java hands the method a COPY. Changing the copy does not change yours.
 *   The fix is to give it back:
 *
 *       health = heal(health, 50);
 *
 *   When a method "does nothing", this is why. Every time.
 *
 * ==========================================================================
 * FINISHED EARLY?
 *
 *   Extract the entire enemy turn into one method.
 *
 *   You will find you need several values back — the enemy's health, the
 *   damage dealt, whether it is still standing — and there is only one
 *   return. Sit with that for five minutes.
 *
 *   You want to return a whole FIGHTER. In Unit 2 you will.
 *
 * ==========================================================================
 * WHAT TO SUBMIT — THIS IS CHECKPOINT 1
 *
 *   Back up as Arena_CP1_LastnameF and submit it on Canvas.
 *   Your game must behave exactly as it did this morning.
 */

// ---------------------------------------------------------------------------
// Your Lesson 9 file goes below, unchanged. Start from YOUR OWN code — the
// point of today is refactoring what you wrote, not typing something new.
//
// If you have lost your L9 work, ask, and start from the L9 solution instead.
// ---------------------------------------------------------------------------

import java.util.Scanner;

public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;
    static final int ROWS = 5;
    static final int COLS = 11;

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        System.out.print("""
                ========================
                     THE ARENA
                ========================
                """);
        System.out.println("Sand, torchlight, and a crowd that has already decided how this ends.");
        System.out.println("The gate opens.");
        System.out.println("");

        System.out.print("What is your name, challenger? ");
        String playerName = in.nextLine().trim();
        if (playerName.isEmpty()) {
            playerName = "Challenger";
        }

        int difficulty;
        do {
            System.out.print("Difficulty (1 = easy, 2 = normal, 3 = brutal): ");
            while (!in.hasNextInt()) {
                System.out.print("Numbers only. Try again: ");
                in.next();
            }
            difficulty = in.nextInt();
        } while (difficulty < 1 || difficulty > 3);
        in.nextLine();

        String difficultyName = switch (difficulty) {
            case 1 -> "Easy";
            case 2 -> "Normal";
            case 3 -> "Brutal";
            default -> "Unknown";
        };
        System.out.println("Difficulty: " + difficultyName);
        System.out.println("");

        int health = MAX_HEALTH;
        int potions = 2;
        int playerRow = 2, playerCol = 1;
        int enemyRow = 2, enemyCol = 9;

        String enemyName = "Cave Goblin";
        int enemyHealth = 30 + difficulty * 15;
        int enemyPower = 4 + difficulty * 3;

        System.out.printf("%-12s HP %3d/%3d  Gold %4d  Lv %d%n",
                          playerName, health, MAX_HEALTH, STARTING_GOLD, 1);
        System.out.println("");

        System.out.printf("%s enters the arena. The %s has %d HP.%n",
                          playerName, enemyName, enemyHealth);
        System.out.print("Press Enter to begin...");
        in.nextLine();
        System.out.println("");

        for (int i = 3; i > 0; i--) {
            System.out.println(i + "...");
        }
        System.out.println("FIGHT!");
        System.out.println("");

        int turnNumber = 1;
        boolean playing = true;
        boolean fled = false;

        while (playing) {
            System.out.println("=".repeat(40));
            System.out.printf("  Turn %d%n", turnNumber);
            System.out.printf("%-12s HP %3d/%3d    %-14s HP %3d%n",
                              playerName, health, MAX_HEALTH, enemyName, enemyHealth);
            System.out.println("");

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

            boolean adjacent = (playerRow == enemyRow) && (Math.abs(playerCol - enemyCol) == 1);
            int roll = (turnNumber * 3) % 10 + 1;
            int damage = 0;

            if (adjacent) {
                System.out.print("[A]ttack  [D]efend  [P]otion  [L]eft  [R]ight  [F]lee: ");
            } else {
                System.out.print("The " + enemyName + " is out of reach.  "
                                 + "[L]eft  [R]ight  [D]efend  [P]otion  [F]lee: ");
            }
            String action = in.nextLine().trim().toUpperCase();

            switch (action) {
                case "A" -> {
                    if (!adjacent) {
                        System.out.println("You swing at empty air. Get closer first.");
                    } else if (roll >= 9) {
                        damage = enemyPower * 2;
                        System.out.println("CRITICAL HIT!");
                    } else if (roll >= 3) {
                        damage = enemyPower;
                        System.out.println("A solid hit.");
                    } else {
                        System.out.println("You miss.");
                    }
                }
                case "L" -> {
                    if (playerCol - 1 < 1) {
                        System.out.println("The wall stops you.");
                    } else {
                        playerCol--;
                        System.out.println("You step left.");
                    }
                }
                case "R" -> {
                    if (playerCol + 1 > COLS - 2) {
                        System.out.println("The wall stops you.");
                    } else if (playerCol + 1 == enemyCol) {
                        System.out.println("The " + enemyName + " blocks your way.");
                    } else {
                        playerCol++;
                        System.out.println("You step right.");
                    }
                }
                case "D" -> {
                    health += 5;
                    System.out.println("You raise your guard and recover 5 HP.");
                }
                case "P" -> {
                    if (potions > 0) {
                        potions--;
                        health += 25;
                        System.out.println("You drink a potion and recover 25 HP.");
                    } else {
                        System.out.println("You reach for a potion. There are none.");
                    }
                }
                case "F" -> {
                    fled = true;
                    System.out.println("You run for the gate. The crowd howls.");
                }
                default -> System.out.println("The crowd jeers. You hesitate and lose the turn.");
            }

            enemyHealth -= damage;

            if (!fled && enemyHealth > 0 && adjacent) {
                health -= enemyPower;
                System.out.printf("The %s strikes back for %d.%n", enemyName, enemyPower);
            }

            if (health > MAX_HEALTH) {
                health = MAX_HEALTH;
            } else if (health < 0) {
                health = 0;
            }

            int bars = health / 5;
            String bar = "#".repeat(bars) + "-".repeat(20 - bars);
            System.out.printf("[%s] %d%%%n", bar, health);

            if (fled) {
                System.out.println("You escape with your life, and nothing else.");
                playing = false;
            } else if (enemyHealth <= 0) {
                System.out.printf("%nThe %s falls! You win on turn %d.%n", enemyName, turnNumber);
                playing = false;
            } else if (health <= 0) {
                System.out.printf("%nYou have fallen on turn %d.%n", turnNumber);
                playing = false;
            }

            turnNumber++;
        }

        System.out.printf("%nThe arena empties after %d turns.%n", turnNumber - 1);
    }
}
