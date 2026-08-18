/*
 * U1 L5 — SCANNER INPUT AND PSEUDOCODE · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 5
 *
 * ALREADY HERE:  Lessons 1–4 finished — the title screen, the formatted status
 *                line, String methods, combat math, the health bar.
 * YOU'RE ADDING: pseudocode first, then a Scanner so the game asks the player
 *                questions instead of hard-coding the answers.
 *
 *     javac Main.java
 *     java Main
 *
 * DESIGN BEFORE YOU TYPE. Part 1 is written English, not Java. Everyone wants
 * to skip it. The people who skip it write the nextLine() bug and then spend
 * twenty minutes not understanding why the program refuses to stop.
 */

// TODO 2a: import the Scanner class. It is not built in like System is.
//          This line goes at the VERY TOP of the file, above `public class`:
//
//              import java.util.Scanner;

public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;

    public static void main(String[] args) {

        /*
         * TODO 1: PSEUDOCODE — the design, in English, before any Java.
         *
         *   Write out what the program will ASK for and what it will DO with
         *   each answer. Use plain words in capitals for the decisions:
         *   ASK, IF, SET, SHOW, REPEAT UNTIL.
         *
         *   Mine looks like this — yours should match YOUR game:
         *
         *       ASK for the player's name
         *       IF the name is blank
         *           USE "Challenger" instead
         *       ASK for difficulty 1-3
         *       SET enemy health based on difficulty
         *       SHOW a summary and wait for Enter
         *
         *   Leave it here as a comment when you're done. It is part of what
         *   you turn in, and in six weeks it is how you'll remember what this
         *   file was supposed to do.
         */

        // TODO 2b: make the Scanner, once, here at the top of main:
        //
        //              Scanner in = new Scanner(System.in);

        String title = """
                ========================
                     THE ARENA
                ========================
                """;
        System.out.print(title);

        System.out.println("Sand, torchlight, and a crowd that has already decided how this ends.");
        System.out.println("The gate opens.");
        System.out.println("");

        // TODO 3a: ask for the player's name instead of hard-coding it.
        //
        //              System.out.print("What is your name, challenger? ");
        //              String playerName = in.nextLine().trim();
        //
        //          .trim() removes stray spaces. Then handle the blank answer
        //          your pseudocode planned for — .isEmpty() tells you.
        //          Delete the hard-coded line below once yours works.
        String playerName = "Nameless";

        // TODO 3b: ask for a difficulty from 1 to 3 with in.nextInt(), then
        //          use it to scale the enemy — enemyHealth and enemyPower
        //          below should be worked out FROM difficulty, not fixed.
        //
        //          THE BUG EVERYONE HITS: nextInt() takes the number and
        //          leaves the Enter keypress sitting in the buffer. The next
        //          nextLine() then reads that leftover newline and returns
        //          immediately. Fix it with one bare line right after:
        //
        //              int difficulty = in.nextInt();
        //              in.nextLine();   // consume the leftover newline
        //
        //          Write that comment on it. You will meet this bug again.

        int health = MAX_HEALTH;
        int gold = STARTING_GOLD;
        int level = 1;
        boolean alive = true;
        double critChance = 0.15;

        String enemyName = "Cave Goblin";
        int enemyHealth = 40;
        int enemyPower = 7;

        System.out.printf("%-12s HP %3d/%3d  Gold %4d  Lv %d%n",
                          playerName, health, MAX_HEALTH, gold, level);
        System.out.printf("Alive %-5b  Crit %.0f%%%n", alive, critChance * 100);
        System.out.println("");

        // TODO 3c: a summary line, then wait for the player to press Enter:
        //
        //              System.out.printf("%s enters the arena. The %s has %d HP.%n",
        //                                playerName, enemyName, enemyHealth);
        //              System.out.print("Press Enter to begin...");
        //              in.nextLine();

        System.out.println(enemyName.toUpperCase() + " blocks your path!");
        System.out.printf("Opponent %-14s HP %3d  Power %2d%n",
                          enemyName, enemyHealth, enemyPower);
        System.out.println("Name length: " + enemyName.length());

        boolean isBoss = enemyName.contains("Dragon");
        System.out.println("Boss fight: " + isBoss);

        if (enemyName.equalsIgnoreCase("cave goblin")) {
            System.out.println("You have fought one of these before.");
        }
        System.out.println("");

        int damage = enemyPower * 2;
        health -= damage;
        System.out.println("You take " + damage + " damage. Health: " + health);

        int potion = 15;
        health += potion;
        level++;
        System.out.println("You drink a potion. Health: " + health);
        System.out.println("You reach level " + level + ".");
        System.out.println("");

        int hits = 3;
        int swings = 7;
        double acc1 = (double) hits / swings * 100;
        System.out.printf("Accuracy: %.1f%%%n", acc1);
        System.out.println("");

        int turn = 6;
        boolean enrages = (turn % 3 == 0);
        System.out.println("Turn " + turn + " — enrages: " + enrages);
        System.out.println("");

        int bars = health / 5;
        String bar = "#".repeat(bars) + "-".repeat(20 - bars);
        System.out.printf("[%s] %d%%%n", bar, health);


        // TODO 4: break it on purpose, twice. Read each error, then undo it.
        //
        //     a) Delete your  in.nextLine();  after nextInt(). Run it. The
        //        "Press Enter" prompt flies straight past. NO error message —
        //        the program just skips a question. That is the worst kind of
        //        bug and the reason the fix line gets a comment.
        //
        //     b) At the difficulty prompt, type a LETTER instead of a number.
        //        InputMismatchException, and the program dies. Real validation
        //        needs hasNextInt() and a loop — that is Lesson 8. Today you
        //        just need to have SEEN it.


        // TODO 5: design a feature of your own. Pseudocode FIRST, as a comment,
        //         then build it. Ask the player something your game cares about
        //         — a class, a weapon, a starting bonus — and use the answer.

    }
}
