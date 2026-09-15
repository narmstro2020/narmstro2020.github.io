/*
 * U1 L6 — CONDITIONALS: if, else if, else · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 6
 *
 * START FROM YOUR OWN LESSON 5 FILE. The code below is the L5 solution, for
 * anyone who lost theirs. The TODO markers are the same either way.
 *
 *     javac Main.java
 *     java Main
 *
 * Until today the program ran the same way every time. Today it branches.
 *
 * FIVE TODOs, marked in the code below, all near the bottom of main. In
 * order. Compile and run after each.
 *
 *   TODO 1  the attack roll     if / else if / else on a hard-coded roll    (add)
 *   TODO 2  walk every branch   change the roll to 10, then 5, then 1; run each
 *   TODO 3  win and lose        the fight can end                            (add)
 *   TODO 4  the clamp           closes the Lesson 4 TODO on the health bar   (add)
 *   TODO 5  compound conditions &&  ||  !  -- and why the order matters      (add)
 *
 * COMING FROM PYTHON: parentheses are required, if (health > 0); braces, not
 * indentation; else if, not elif. Indentation means nothing to the compiler
 * and everything to the next reader. Keep it tidy anyway.
 *
 * BREAK IT ON PURPOSE (after TODO 5): if (alive = false) compiles and silently
 * sets alive to false. if (health = 0) will NOT compile. One = assigns, two ==
 * compare; the compiler only catches it when the variable is not a boolean.
 * Put both back afterwards.
 *
 * FINISHED EARLY?  A condition that decides whether the enemy enrages, using at
 * least two of && || !. Say out loud, in one sentence, exactly when it is true.
 *
 * BEFORE YOU LEAVE: back up as Arena_U1L6_LastnameF and submit.
 */

import java.util.Scanner;

public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;

    public static void main(String[] args) {
        /*
         * PSEUDOCODE — the design, before the code (D1.7)
         *
         *   ASK for the player's name
         *   IF the name is blank
         *       USE "Challenger" instead
         *   ASK for difficulty 1-3
         *   REPEAT UNTIL the answer is 1, 2, or 3      <- L8, needs do-while
         *   SET enemy health based on difficulty
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

        System.out.print("Difficulty (1 = easy, 2 = normal, 3 = brutal): ");
        // TODO validate difficulty input — reject anything that isn't 1-3.
        //      Typing letters here throws InputMismatchException and the
        //      program dies. Proper validation needs hasNextInt() and a
        //      loop — that is L8.
        int difficulty = in.nextInt();
        in.nextLine();   // consume the leftover newline. Delete this line and
                         // the "Press Enter" prompt below flies straight past.

        int health = MAX_HEALTH;
        int gold = STARTING_GOLD;
        int level = 1;
        boolean alive = true;
        double critChance = 0.15;

        String enemyName = "Cave Goblin";
        int enemyHealth = 30 + difficulty * 15;
        int enemyPower = 4 + difficulty * 3;

        // ---------- L4 · one formatted line instead of six ----------
        System.out.printf("%-12s HP %3d/%3d  Gold %4d  Lv %d%n",
                          playerName, health, MAX_HEALTH, gold, level);
        System.out.printf("Alive %-5b  Crit %.0f%%%n", alive, critChance * 100);
        System.out.println("");

        System.out.printf("%s enters the arena. The %s has %d HP.%n",
                          playerName, enemyName, enemyHealth);
        System.out.print("Press Enter to begin...");
        in.nextLine();
        System.out.println("");

        // ---------- L4 · String methods on the enemy ----------
        System.out.println(enemyName.toUpperCase() + " blocks your path!");
        System.out.printf("Opponent %-14s HP %3d  Power %2d%n",
                          enemyName, enemyHealth, enemyPower);
        System.out.println("Name length: " + enemyName.length());

        boolean isBoss = enemyName.contains("Dragon");
        System.out.println("Boss fight: " + isBoss);

        // .equals() compares the TEXT. == would compare the object reference,
        // which is the wrong question and only works by accident.
        if (enemyName.equalsIgnoreCase("cave goblin")) {
            System.out.println("You have fought one of these before.");
        }
        System.out.println("");

        // ---------- 1 · combat arithmetic ----------
        int damage = enemyPower * 2;
        health -= damage;
        System.out.println("You take " + damage + " damage. Health: " + health);

        int potion = 15;
        health += potion;
        level++;
        System.out.println("You drink a potion. Health: " + health);
        System.out.println("You reach level " + level + ".");
        System.out.println("");

        // ---------- 2 · the accuracy bug, then both fixes ----------
        int hits = 3;
        int swings = 7;

        // The broken version. int / int is an int, so 3 / 7 is 0, and 0 * 100 is 0.
        // Students TYPE THIS FIRST and run it. Seeing 0% is the lesson.
        int brokenAccuracy = hits / swings * 100;
        System.out.println("Accuracy (broken): " + brokenAccuracy + "%");

        // Fix one: cast an operand, so the division itself is done in doubles.
        double acc1 = (double) hits / swings * 100;

        // Fix two: reorder so a double literal is in the maths before the divide.
        double acc2 = hits * 100.0 / swings;

        // L4 · same numbers, now readable. This is what printf is FOR.
        System.out.printf("Accuracy (cast):    %.1f%%%n", acc1);
        System.out.printf("Accuracy (reorder): %.1f%%%n", acc2);
        System.out.println("");

        // ---------- 3 · a rhythm with % ----------
        int turn = 6;
        boolean enrages = (turn % 3 == 0);
        System.out.println("Turn " + turn + " — enrages: " + enrages);
        System.out.println("");

        // ---------- 4 · crit, and what the cast costs ----------
        double critDamage = damage * 1.75;
        int applied = (int) critDamage;
        System.out.println("Crit damage (double): " + critDamage);
        System.out.println("Crit damage (int):    " + applied);
        System.out.println("Lost to the cast:     " + (critDamage - applied));
        System.out.println("");

        // ---- TODO 1 · THE ATTACK ROLL ----------------------------------------
        // roll is hard-coded on purpose so you can walk every branch by hand.
        // Lesson 12 makes it random.
        //
        //     int roll = 7;
        //     int damage2;
        //     if (roll >= 9) {
        //         damage2 = enemyPower * 2;
        //         System.out.println("CRITICAL HIT!");
        //     } else if (roll >= 3) {
        //         damage2 = enemyPower;
        //         System.out.println("A solid hit.");
        //     } else {
        //         damage2 = 0;
        //         System.out.println("You miss.");
        //     }
        //     enemyHealth -= damage2;
        //     System.out.printf("%s has %d HP left.%n", enemyName, enemyHealth);
        // ----------------------------------------------------------------------

        // ---- TODO 2 · WALK EVERY BRANCH ----------------------------------------
        // Change roll to 10 and run. Then 5 and run. Then 1 and run. All three
        // messages must appear once. Two minutes, and it is the first real
        // testing you do in this course. Leave roll at 7 when you are done.
        // ----------------------------------------------------------------------

        // ---- TODO 3 · WIN AND LOSE ---------------------------------------------
        //     if (enemyHealth <= 0) {
        //         System.out.println("The " + enemyName + " falls!");
        //     } else if (health <= 0) {
        //         System.out.println("You have fallen.");
        //         alive = false;
        //     }
        // ----------------------------------------------------------------------

        // ---- TODO 5 · COMPOUND CONDITIONS --------------------------------------
        //     // The guard comes FIRST. Swap these two and a zero divisor throws.
        //     if (swings > 0 && hits / swings > 0.5) {
        //         System.out.println("Your aim is holding up.");
        //     }
        //     if (health < MAX_HEALTH / 4 && gold >= 10) {
        //         System.out.println("You should buy a potion.");
        //     }
        //     if (!alive || enemyHealth <= 0) {
        //         System.out.println("The fight is over.");
        //     }
        // && stops at the first false and || at the first true, so the right-
        // hand side is never evaluated when the left already decided. That is
        // why swings > 0 goes first. Flip it once, on purpose, and watch it throw.
        // ----------------------------------------------------------------------

        // ---- TODO 4 · THE CLAMP: close the Lesson 4 TODO on the next line ------
        // Put this ABOVE the health bar, then delete the old TODO comment:
        //     if (health > MAX_HEALTH) {
        //         health = MAX_HEALTH;
        //     } else if (health < 0) {
        //         health = 0;
        //     }
        // Test it BOTH ways: set health to 150 and run; set it to -20 and run.
        // The bar has to survive both.
        // ----------------------------------------------------------------------

        // ---------- L4 · the health bar ----------
        // TODO clamp health between 0 and MAX_HEALTH
        // health is 101 right now, so this prints 101% and does NOT crash
        // (101 / 5 is 20, and 20 - 20 is 0). One more potion and repeat()
        // throws IllegalArgumentException. The fix is an if — that is L6.
        int bars = health / 5;
        String bar = "#".repeat(bars) + "-".repeat(20 - bars);
        System.out.printf("[%s] %d%%%n", bar, health);
    }
}
