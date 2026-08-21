/*
 * U1 L9 — FOR LOOPS AND NESTED LOOPS · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 9
 *
 * ALREADY HERE:  Lessons 1-8 finished — including the game loop, so the fight
 *                already repeats until someone falls.
 * YOU'RE ADDING: for loops. A banner, a countdown, and — the real work — an
 *                arena drawn by a loop inside a loop, that your player walks
 *                around in.
 *
 *     javac Main.java
 *     java Main
 *
 * BEFORE YOU CHANGE ANYTHING: run it. It works. Today is not about fixing
 * something broken — it is about the console finally looking like a game.
 */

import java.util.Scanner;

public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;

    // TODO 0: the arena is 5 rows by 11 columns. Name those.
    //
    //          Constants, not magic numbers — the nested loops below should
    //          read as "for every row, for every column", not "for 0 to 5".
    //
    //              static final int ROWS = 5;
    //              static final int COLS = 11;

    public static void main(String[] args) {
        /*
         * PSEUDOCODE — the design, before the code (D1.7)
         *
         *   ASK for the player's name
         *   IF the name is blank
         *       USE "Challenger" instead
         *   ASK for difficulty 1-3
         *   REPEAT UNTIL the answer is 1, 2, or 3      <- L8, done: do-while
         *   COUNT DOWN from 3                          <- L9, TODO 4
         *   DRAW the arena                             <- L9, TODO 2
         *   SHOW the menu and READ one action
         *   MOVE, or FIGHT if the enemy is adjacent    <- L9, TODO 3
         *   REPEAT the whole turn until someone falls  <- L8, done: while
         *   SHOW a summary and wait for Enter
         */

        Scanner in = new Scanner(System.in);

        // ---------- L4 · text block title screen ----------
        String title = """
                ========================
                     THE ARENA
                ========================
                """;
        System.out.print(title);

        System.out.println("Sand, torchlight, and a crowd that has already decided how this ends.");
        System.out.println("The gate opens.");
        System.out.println("");

        System.out.print("What is your name, challenger? ");
        String playerName = in.nextLine().trim();
        if (playerName.isEmpty()) {
            playerName = "Challenger";
        }

        // ---------- L8 · validated difficulty ----------
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

        // ---------- L7 · a switch EXPRESSION ----------
        String difficultyName = switch (difficulty) {
            case 1 -> "Easy";
            case 2 -> "Normal";
            case 3 -> "Brutal";
            default -> "Unknown";
        };
        System.out.println("Difficulty: " + difficultyName);
        System.out.println("");

        int health = MAX_HEALTH;
        int gold = STARTING_GOLD;
        int level = 1;
        int potions = 2;
        boolean alive = true;
        double critChance = 0.15;

        String enemyName = "Cave Goblin";
        int enemyHealth = 30 + difficulty * 15;
        int enemyPower = 4 + difficulty * 3;

        // TODO 1: where is everybody?
        //
        //          Four ints. Rows and columns are just numbers; the grid gets
        //          DRAWN from them, nothing is stored yet.
        //
        //              int playerRow = 2, playerCol = 1;
        //              int enemyRow  = 2, enemyCol  = 9;
        //
        //          Row 2 is the middle of five rows (0, 1, 2, 3, 4). Column 1
        //          is just inside the left wall. Work out why column 9 is just
        //          inside the right wall of an 11-wide arena.

        System.out.printf("%-12s HP %3d/%3d  Gold %4d  Lv %d%n",
                          playerName, health, MAX_HEALTH, gold, level);
        System.out.printf("Alive %-5b  Crit %.0f%%%n", alive, critChance * 100);
        System.out.println("");

        System.out.printf("%s enters the arena. The %s has %d HP.%n",
                          playerName, enemyName, enemyHealth);
        System.out.print("Press Enter to begin...");
        in.nextLine();
        System.out.println("");

        // TODO 4: count down from 3, then print FIGHT!
        //
        //          Do this one first — it is four lines and it proves you have
        //          the three parts of a for loop the right way round.
        //
        //              for (int i = 3; i > 0; i--) {
        //                  System.out.println(i + "...");
        //              }
        //
        //          START at 3. TEST that it is still above 0. STEP DOWNWARD.
        //          Get any one of the three pointing the wrong way and the loop
        //          either never runs or never stops. Try it wrong once.

        System.out.println(enemyName.toUpperCase() + " blocks your path!");
        System.out.printf("Opponent %-14s HP %3d  Power %2d%n",
                          enemyName, enemyHealth, enemyPower);
        System.out.println("");


        // ================= L8 · THE GAME LOOP =================
        int turnNumber = 1;
        boolean playing = true;

        while (playing) {

            // TODO 5: a banner across the top of each turn.
            //
            //              for (int i = 0; i < 40; i++) {
            //                  System.out.print("=");
            //              }
            //              System.out.println();
            //
            //          Then answer this honestly: "=".repeat(40) from Lesson 4
            //          does the same job in one line. Which is better HERE, and
            //          why? (A loop earns its place when each pass does
            //          something DIFFERENT. This one does not. TODO 2 does.)

            System.out.printf("  Turn %d%n", turnNumber);
            System.out.printf("%-12s HP %3d/%3d    %-14s HP %3d%n",
                              playerName, health, MAX_HEALTH, enemyName, enemyHealth);
            System.out.println("");

            // TODO 2: ***THE ARENA***. This is the lesson.
            //
            //          A loop inside a loop. The OUTER loop walks the rows.
            //          The INNER loop walks the columns of that row. The inner
            //          loop runs COMPLETELY for each single pass of the outer.
            //
            //              for (int r = 0; r < ROWS; r++) {
            //                  for (int c = 0; c < COLS; c++) {
            //                      // decide ONE character for cell (r, c)
            //                  }
            //                  System.out.println();     // <- END OF A ROW
            //              }
            //
            //          Which character? In this order:
            //            player here?          '@'
            //            enemy here?           'X'
            //            top or bottom row?    '-'
            //            first or last column? '|'
            //            otherwise             ' '
            //
            //          THE ONE EVERYONE FORGETS is the println() after the
            //          inner loop. Leave it out and all 55 characters print on
            //          one line. If your arena is a single long stripe, that is
            //          why.
            //
            //          Draw the grid on paper first. Label the rows 0-4 down
            //          the side and the columns 0-10 across the top, and mark
            //          where '@' and 'X' should land.

            // TODO 3: can you even reach the enemy?
            //
            //              boolean adjacent = (playerRow == enemyRow)
            //                              && (Math.abs(playerCol - enemyCol) == 1);
            //
            //          Same row, one column apart, on either side — which is
            //          what Math.abs is doing there.
            //
            //          Then add movement to the menu below:
            //
            //              case "L" -> playerCol--;
            //              case "R" -> playerCol++;
            //
            //          ...and stop the player walking through the wall. You
            //          already know how: it is the clamp from Lesson 6, in a
            //          new place. If playerCol drops below 1, put it back to 1.
            //
            //          Finally: attacking should only work when adjacent, and
            //          the enemy should only hit back when adjacent. Otherwise
            //          you are fighting something on the far side of the room.

            int roll = (turnNumber * 3) % 10 + 1;
            int damage = 0;

            System.out.print("[A]ttack  [D]efend  [P]otion  [F]lee: ");
            String action = in.nextLine().trim().toUpperCase();

            switch (action) {
                case "A" -> {
                    if (roll >= 9) {
                        damage = enemyPower * 2;
                        System.out.println("CRITICAL HIT!");
                    } else if (roll >= 3) {
                        damage = enemyPower;
                        System.out.println("A solid hit.");
                    } else {
                        System.out.println("You miss.");
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
                    alive = false;
                    System.out.println("You run for the gate. The crowd howls.");
                }
                default -> System.out.println("The crowd jeers. You hesitate and lose the turn.");
            }

            enemyHealth -= damage;

            if (alive && enemyHealth > 0) {
                health -= enemyPower;
                System.out.printf("The %s strikes back for %d.%n", enemyName, enemyPower);
            }

            // ---------- L6 · the clamp ----------
            if (health > MAX_HEALTH) {
                health = MAX_HEALTH;
            } else if (health < 0) {
                health = 0;
            }

            // ---------- L4 · the health bar ----------
            int bars = health / 5;
            String bar = "#".repeat(bars) + "-".repeat(20 - bars);
            System.out.printf("[%s] %d%%%n", bar, health);

            // ---------- the three ways this loop ends ----------
            if (!alive) {
                System.out.println("You escape with your life, and nothing else.");
                playing = false;
            } else if (enemyHealth <= 0) {
                System.out.printf("%nThe %s falls! You win on turn %d.%n", enemyName, turnNumber);
                playing = false;
            } else if (health <= 0) {
                System.out.printf("%nYou have fallen on turn %d.%n", turnNumber);
                alive = false;
                playing = false;
            }

            turnNumber++;
        }

        System.out.printf("%nThe arena empties after %d turns.%n", turnNumber - 1);

        // FINISHED EARLY?
        //   Add a SECOND enemy at a different position and draw both.
        //   Then think about ten enemies. That is thirty variables, and you
        //   would have to touch every one of them to add an eleventh.
        //   Sit with how bad that is. Lesson 11 is the answer.
    }
}
