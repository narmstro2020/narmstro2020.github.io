/*
 * U1 L6 — CONDITIONALS: if, else if, else · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 6
 *
 * ALREADY HERE:  Lessons 1-5 finished — the title screen, the status line,
 *                combat math, the health bar, and a Scanner that asks the
 *                player questions.
 * YOU'RE ADDING: decisions. Until today your program ran the same way every
 *                time. Now it branches.
 *
 *     javac Main.java
 *     java Main
 *
 * ==========================================================================
 * COMING FROM PYTHON? THREE DIFFERENCES
 *
 *   parentheses are REQUIRED     if (health > 0)      not  if health > 0
 *   braces, not indentation      { ... }              not  a colon
 *   else if, not elif
 *
 * Indentation means NOTHING to the compiler and EVERYTHING to the next person
 * who reads your code. Keep it tidy anyway.
 *
 * ==========================================================================
 * THE NEW IDEA: SHORT-CIRCUIT EVALUATION
 *
 *     if (swings > 0 && hits / swings > 0.5) { ... }
 *
 *   If swings is 0, Java NEVER evaluates the right-hand side, so there is no
 *   divide-by-zero. && stops at the first false; || stops at the first true.
 *
 *   ORDER MATTERS. Flip those two conditions around and the program throws.
 *   Try it once, on purpose, so you have seen it.
 *
 * ==========================================================================
 * TODO 1: the attack roll — if / else if / else
 *
 *           int roll = 7;              // hard-coded on purpose; L12 makes it random
 *           int damage2;
 *
 *           if (roll >= 9) {
 *               damage2 = enemyPower * 2;
 *               System.out.println("CRITICAL HIT!");
 *           } else if (roll >= 3) {
 *               damage2 = enemyPower;
 *               System.out.println("A solid hit.");
 *           } else {
 *               damage2 = 0;
 *               System.out.println("You miss.");
 *           }
 *
 *           enemyHealth -= damage2;
 *
 *         THEN DO THIS, AND DO NOT SKIP IT:
 *         Change roll to 10, run. Change it to 5, run. Change it to 1, run.
 *         WALK ALL THREE BRANCHES. It costs two minutes, and it is the first
 *         real testing you will do in this course.
 *
 * TODO 2: the fight can now end.
 *
 *           if (enemyHealth <= 0) {
 *               System.out.println("The " + enemyName + " falls!");
 *               alive = true;
 *           } else if (health <= 0) {
 *               System.out.println("You have fallen.");
 *               alive = false;
 *           }
 *
 * TODO 3: compound conditions that mean something.
 *
 *           // The guard comes FIRST. Swap these and a zero divisor throws.
 *           if (swings > 0 && hits / swings > 0.5) {
 *               System.out.println("Your aim is holding up.");
 *           }
 *
 *           if (health < MAX_HEALTH / 4 && gold >= 10) {
 *               System.out.println("You should buy a potion.");
 *           }
 *
 *           if (!alive || enemyHealth <= 0) {
 *               System.out.println("The fight is over.");
 *           }
 *
 * TODO 4: BREAK IT ON PURPOSE — = versus ==
 *
 *         Type this and run it:
 *
 *           if (alive = false) { System.out.println("dead"); }
 *
 *         It COMPILES. It also silently sets alive to false and then does the
 *         wrong thing. One equals sign ASSIGNS; two equals signs COMPARE.
 *
 *         Now try:
 *
 *           if (health = 0) { ... }
 *
 *         That one will NOT compile, because an int is not a boolean. Which is
 *         exactly why this bug only bites you with booleans — the compiler
 *         catches every other case and stays silent on the one that matters.
 *
 *         Put both back the way they were when you are done.
 *
 * ==========================================================================
 * TODO 5: close the Lesson 4 TODO at the bottom of this file.
 *
 *         The health bar breaks when health goes above MAX_HEALTH or below 0.
 *         You have been carrying that comment for two lessons. Today you have
 *         the tool:
 *
 *           if (health > MAX_HEALTH) {
 *               health = MAX_HEALTH;
 *           } else if (health < 0) {
 *               health = 0;
 *           }
 *
 *         Test it BOTH ways — drink enough potions to go over, then take
 *         enough damage to go under. The bar has to survive both.
 *
 * ==========================================================================
 * FINISHED EARLY?
 *
 *   Write a condition that decides whether the enemy enrages, using at least
 *   two of && || and !. Then say out loud, to your partner, exactly when it
 *   is true. If you cannot say it in one sentence, it is too complicated.
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
