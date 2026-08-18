/*
 * U1 L7 — SWITCH, TERNARY, AND CODING TO SPEC · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 7
 *
 * ALREADY HERE:  Lessons 1-6 finished — the title screen, Scanner input, the
 *                combat maths, the attack branching, and the health clamp.
 * YOU'RE ADDING: a difficulty name from a switch EXPRESSION, a four-option
 *                combat menu from a switch STATEMENT, and two ternaries.
 *
 *     javac Main.java
 *     java Main
 *
 * BUILD WHAT THE SPEC SAYS, not what you would prefer. The spec sheet is on
 * the assignment page. You will disagree with something in it — probably the
 * 5 HP for defending. Build it anyway, then tell me why you'd change it.
 *
 * TODAY IS ONE TURN. The menu runs once and the program ends. That should
 * annoy you. Taking a second turn needs a loop, and that is Lesson 8.
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

        // TODO 1: a switch EXPRESSION that turns difficulty 1/2/3 into
        //          "Easy" / "Normal" / "Brutal", then print it.
        //          Note the semicolon after the closing brace — the whole
        //          switch is the right-hand side of an assignment, so it is
        //          ONE statement and ends like one.
        //
        //              String difficultyName = switch (difficulty) {
        //                  case 1 -> "Easy";
        //                  ...
        //              };
        //
        //          Try deleting the default afterwards. It won't compile.

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


        // ---------- L6 · the attack roll (keep this — it moves) ----------
        int roll = 7;
        int damage2 = 0;
        int potions = 2;

        // TODO 2: print the menu and read one action.
        //
        //              System.out.print("[A]ttack  [D]efend  [P]otion  [F]lee: ");
        //              String action = in.nextLine().trim().toUpperCase();
        //
        //          .trim() kills stray spaces, .toUpperCase() means `a` works
        //          as well as `A`. Both are from Lesson 4.

        // TODO 3: a switch STATEMENT on `action`, with a case for each of
        //          A, D, P, F plus a default. Use ARROW cases (->) — they do
        //          not fall through, so you never write `break`.
        //
        //          Your Lesson 6 attack branching (the if / else if / else on
        //          `roll`) moves INSIDE case "A". Do not rewrite it.
        //
        //          The other three cases and the default are on the spec sheet.
        //          Follow it exactly.

        // TODO 4: two ternaries.
        //          (a) singular/plural, so one potion doesn't read "1 potions":
        //                  potions == 1 ? "potion" : "potions"
        //          (b) a condition word — over half health is "steady",
        //              otherwise "faltering"
        //
        //          A ternary chooses a VALUE. If you're choosing an ACTION,
        //          that's an if.

        enemyHealth -= damage2;
        System.out.printf("%s has %d HP left.%n", enemyName, enemyHealth);

        // ---------- L6 · the fight can now end ----------
        if (enemyHealth <= 0) {
            System.out.println("The " + enemyName + " falls!");
            alive = true;
        } else if (health <= 0) {
            System.out.println("You have fallen.");
            alive = false;
        }

        // ---------- L6 · compound conditions ----------
        // The guard comes FIRST. Flip these two and a zero divisor throws.
        if (swings > 0 && hits / swings > 0.5) {
            System.out.println("Your aim is holding up.");
        }
        if (health < MAX_HEALTH / 4 && gold >= 10) {
            System.out.println("You should buy a potion.");
        }
        if (!alive || enemyHealth <= 0) {
            System.out.println("The fight is over.");
        }

        // ---------- L6 · the clamp, at last (the L4 TODO, closed) ----------
        if (health > MAX_HEALTH) {
            health = MAX_HEALTH;
        } else if (health < 0) {
            health = 0;
        }

        // ---------- L4 · the health bar ----------
        int bars = health / 5;
        String bar = "#".repeat(bars) + "-".repeat(20 - bars);
        System.out.printf("[%s] %d%%%n", bar, health);
    }
}
