/*
 * U1 L10 — METHODS, PARAMETERS, RETURN VALUES · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 10
 *
 * START FROM YOUR OWN LESSON 9 FILE. The code below is the L9 solution, for
 * anyone who lost theirs. The TODO markers are the same either way.
 *
 *     javac Main.java
 *     java Main
 *
 * YOU ARE ADDING NOTHING. Today you MOVE code out of main into methods, and
 * the game must behave EXACTLY as it did before. Run it now, play one fight,
 * write down what happens. Refactor. Run it again. Any difference is a bug.
 *
 *   main now:         258 lines       main by the end:  under 60
 *
 * Count both. Both numbers go on the board.
 *
 * HOW: move ONE block. Compile. Run. Then the next. Six moves then one compile
 * gives six errors and no idea which move caused which.
 *
 * WHERE METHODS GO: at class level, AFTER main's closing brace, never inside
 * it. Each marker below says which block moves, what the method's signature
 * is, and what one line replaces the block in main.
 *
 *   TODO 1  pure output      printTitle, countdown, printBanner, printHealthBar
 *   TODO 2  values back      isAlive, calculateDamage, applyDamage, clamp
 *   TODO 3  the arena        drawArena needs FOUR parameters -- that is the point
 *   TODO 4  the big win      readChoice: Lesson 8's twelve lines become one call
 *   TODO 5  overload         a second calculateDamage with a different parameter list
 *   TODO 6  finish the job   readName, difficultyName, readAction, attack, moveLeft,
 *                            moveRight, defend, drinkPotion, flee, enemyResponse, endOfFight
 *
 * THE ONE THAT WILL CATCH YOU: a method gets a COPY of each argument.
 *     static void tryToHeal(int hp) { hp += 50; }      // does NOTHING to main's health
 * If a method needs to change a number in main, it RETURNS the new value and
 * main assigns it:   health = heal(health, 50);
 *
 * FINISHED EARLY?  Extract the whole enemy turn into one method. You will need
 * several values back and there is only one return. Sit with that: you want
 * to return a whole FIGHTER, and in Unit 2 you will.
 *
 * WHAT TO SUBMIT — THIS IS CHECKPOINT 1: back up as Arena_CP1_LastnameF.
 */

import java.util.Scanner;

public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;
    static final int ROWS = 5;
    static final int COLS = 11;

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        // ---- TODO 1a · MOVE the next 7 lines into   static void printTitle()
        //      and REPLACE them with:   printTitle();
        System.out.print("""
                ========================
                     THE ARENA
                ========================
                """);
        System.out.println("Sand, torchlight, and a crowd that has already decided how this ends.");
        System.out.println("The gate opens.");
        System.out.println("");

        // ---- TODO 6a · MOVE into   static String readName(Scanner in)
        //      it RETURNS the name;  REPLACE with:   String playerName = readName(in);
        System.out.print("What is your name, challenger? ");
        String playerName = in.nextLine().trim();
        if (playerName.isEmpty()) {
            playerName = "Challenger";
        }

        // ---- TODO 4 · THE BIG WIN. MOVE the do-while into
        //          static int readChoice(Scanner in, int min, int max, String prompt)
        //      Inside it, use min, max and prompt instead of 1, 3 and the text.
        //      REPLACE these 10 lines with ONE:
        //          int difficulty = readChoice(in, 1, 3, "Difficulty (1 = easy, 2 = normal, 3 = brutal)");
        //      Lesson 8's twelve lines, now reusable for any number in any range.
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

        // ---- TODO 6b · MOVE the switch into   static String difficultyName(int difficulty)
        //      (return the switch)  REPLACE with:   System.out.println("Difficulty: " + difficultyName(difficulty));
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

        // ---- TODO 1b · MOVE the countdown into   static void countdown(int from)
        //      (loop from `from`, not from 3)  REPLACE with:   countdown(3);
        for (int i = 3; i > 0; i--) {
            System.out.println(i + "...");
        }
        System.out.println("FIGHT!");
        System.out.println("");

        int turnNumber = 1;
        boolean playing = true;
        boolean fled = false;

        while (playing) {
            // ---- TODO 1c · MOVE these 2 lines into   static void printBanner(String text)
            //      REPLACE with:   printBanner("Turn " + turnNumber);
            System.out.println("=".repeat(40));
            System.out.printf("  Turn %d%n", turnNumber);
            System.out.printf("%-12s HP %3d/%3d    %-14s HP %3d%n",
                              playerName, health, MAX_HEALTH, enemyName, enemyHealth);
            System.out.println("");

            // ---- TODO 3 · THE ARENA. MOVE the nested loop (through the blank
            //      println after it) into
            //          static void drawArena(int playerRow, int playerCol, int enemyRow, int enemyCol)
            //      REPLACE with:   drawArena(playerRow, playerCol, enemyRow, enemyCol);
            //      It needs FOUR parameters because a method cannot see main's
            //      variables. That is not a limitation -- it is the point: the
            //      method draws ANY positions you hand it.
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

            // ---- TODO 6c · MOVE into   static boolean isAdjacent(int r1, int c1, int r2, int c2)
            //      REPLACE with:   boolean adjacent = isAdjacent(playerRow, playerCol, enemyRow, enemyCol);
            boolean adjacent = (playerRow == enemyRow) && (Math.abs(playerCol - enemyCol) == 1);
            int roll = (turnNumber * 3) % 10 + 1;
            int damage = 0;

            // ---- TODO 6d · MOVE the prompt into
            //          static String readAction(Scanner in, boolean adjacent, String enemyName)
            //      (it returns the trimmed, upper-cased answer)
            //      REPLACE with:   String action = readAction(in, adjacent, enemyName);
            if (adjacent) {
                System.out.print("[A]ttack  [D]efend  [P]otion  [L]eft  [R]ight  [F]lee: ");
            } else {
                System.out.print("The " + enemyName + " is out of reach.  "
                                 + "[L]eft  [R]ight  [D]efend  [P]otion  [F]lee: ");
            }
            String action = in.nextLine().trim().toUpperCase();

            switch (action) {
                // ---- TODO 2b · the roll-to-damage rule becomes
                //          static int calculateDamage(int power, int roll)
                //      three returns: roll >= 9 gives power * 2, roll >= 3 gives
                //      power, otherwise 0. The first return that runs wins.
                // ---- TODO 5 · OVERLOAD it: same name, a third parameter
                //          static int calculateDamage(int power, int roll, double critMultiplier)
                //      Java picks by the parameter list. Two methods that differ
                //      only in return type will not compile -- try it once.
                // ---- TODO 6e · then MOVE this whole case body into
                //          static int attack(boolean adjacent, int enemyPower, int roll)
                //      (it returns the damage; call calculateDamage inside it)
                //      REPLACE with:   case "A" -> damage = attack(adjacent, enemyPower, roll);
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
                // ---- TODO 6f · MOVE into   static int moveLeft(int playerCol)
                //      it RETURNS the new column (or the old one, if the wall stops you)
                //      REPLACE with:   case "L" -> playerCol = moveLeft(playerCol);
                case "L" -> {
                    if (playerCol - 1 < 1) {
                        System.out.println("The wall stops you.");
                    } else {
                        playerCol--;
                        System.out.println("You step left.");
                    }
                }
                // ---- TODO 6g · MOVE into   static int moveRight(int playerCol, int enemyCol, String enemyName)
                //      REPLACE with:   case "R" -> playerCol = moveRight(playerCol, enemyCol, enemyName);
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
                // ---- TODO 6h · MOVE into   static int defend(int health)   -- returns health + 5
                //      REPLACE with:   case "D" -> health = defend(health);
                //      Why return it? Because `health += 5` inside a method changes a COPY.
                case "D" -> {
                    health += 5;
                    System.out.println("You raise your guard and recover 5 HP.");
                }
                // ---- TODO 6i · MOVE the two healing lines into   static int drinkPotion(int health)
                //      the potions-- and the if stay in main:
                //          case "P" -> {
                //              if (potions > 0) { potions--; health = drinkPotion(health); }
                //              else System.out.println("You reach for a potion. There are none.");
                //          }
                case "P" -> {
                    if (potions > 0) {
                        potions--;
                        health += 25;
                        System.out.println("You drink a potion and recover 25 HP.");
                    } else {
                        System.out.println("You reach for a potion. There are none.");
                    }
                }
                // ---- TODO 6j · MOVE into   static boolean flee()   -- prints, returns true
                //      REPLACE with:   case "F" -> fled = flee();
                case "F" -> {
                    fled = true;
                    System.out.println("You run for the gate. The crowd howls.");
                }
                default -> System.out.println("The crowd jeers. You hesitate and lose the turn.");
            }

            // ---- TODO 2c · static int applyDamage(int hp, int damage)   -- returns hp - damage
            //      REPLACE with:   enemyHealth = applyDamage(enemyHealth, damage);
            enemyHealth -= damage;

            // ---- TODO 6k · MOVE the counter-attack AND the clamp below into
            //          static int enemyResponse(boolean fled, boolean adjacent, int health,
            //                                   int enemyHealth, int enemyPower, String enemyName)
            //      it returns the player's new health, already clamped.
            //      REPLACE both blocks with:
            //          health = enemyResponse(fled, adjacent, health, enemyHealth, enemyPower, enemyName);
            if (!fled && enemyHealth > 0 && adjacent) {
                health -= enemyPower;
                System.out.printf("The %s strikes back for %d.%n", enemyName, enemyPower);
            }

            // ---- TODO 2d · static int clamp(int value, int min, int max)
            //      one line inside:   return Math.max(min, Math.min(max, value));
            //      REPLACE with:   health = clamp(health, 0, MAX_HEALTH);
            if (health > MAX_HEALTH) {
                health = MAX_HEALTH;
            } else if (health < 0) {
                health = 0;
            }

            // ---- TODO 1d · MOVE into   static void printHealthBar(int hp)
            //      REPLACE with:   printHealthBar(health);
            int bars = health / 5;
            String bar = "#".repeat(bars) + "-".repeat(20 - bars);
            System.out.printf("[%s] %d%%%n", bar, health);

            // ---- TODO 2a · static boolean isAlive(int hp)   -- return hp > 0;
            //      then write   enemyHealth <= 0   as   !isAlive(enemyHealth)   below.
            // ---- TODO 6l · MOVE the three-way ending into
            //          static boolean endOfFight(boolean fled, int health, int enemyHealth,
            //                                    String enemyName, int turnNumber)
            //      it returns true when the fight is over.
            //      REPLACE with:   playing = !endOfFight(fled, health, enemyHealth, enemyName, turnNumber);
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

    // =========================================================================
    // METHODS GO HERE: after main's closing brace, inside the class. Each one
    // is `static`, because main is. Fill this in as you work through the
    // markers above -- easiest first:
    //
    //   TODO 1  static void printTitle()
    //           static void countdown(int from)
    //           static void printBanner(String text)
    //           static void printHealthBar(int hp)
    //   TODO 2  static boolean isAlive(int hp)
    //           static int calculateDamage(int power, int roll)
    //           static int applyDamage(int hp, int damage)
    //           static int clamp(int value, int min, int max)
    //   TODO 3  static void drawArena(int playerRow, int playerCol, int enemyRow, int enemyCol)
    //   TODO 4  static int readChoice(Scanner in, int min, int max, String prompt)
    //   TODO 5  static int calculateDamage(int power, int roll, double critMultiplier)
    //   TODO 6  the rest, one at a time, each followed by a compile and a run
    // =========================================================================
}
