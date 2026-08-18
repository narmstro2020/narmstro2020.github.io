/*
 * U1 L8 — WHILE LOOPS AND THE GAME LOOP · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 8
 *
 * ALREADY HERE:  Lessons 1-7 finished — including the combat menu and the
 *                switch that drives it.
 * YOU'RE ADDING: input validation that finally closes the Lesson 5 TODO, and
 *                a while loop that turns one turn into a whole fight.
 *
 *     javac Main.java
 *     java Main
 *
 * BEFORE YOU CHANGE ANYTHING: run it and type `banana` at the difficulty
 * prompt. It dies. That has been true since Lesson 5 and there is a TODO in
 * this file that says so. Today you close it.
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
         *   SHOW the menu and READ one action
         *   DO what the spec says for that action
         *   REPEAT the whole turn until someone falls   <- L8, needs while
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

        // TODO 1: close the Lesson 5 TODO — validate the difficulty.
        //
        //          Read this in English first:
        //            1. ask for the difficulty
        //            2. while what they typed ISN'T a number, complain and
        //               throw it away
        //            3. read the number
        //            4. if it isn't 1, 2 or 3 — go back to step 1
        //
        //          Step 4 wraps steps 1-3, and you always want to ask at
        //          least once. That shape is a do-while:
        //
        //              int difficulty;
        //              do {
        //                  ...ask...
        //                  while (!in.hasNextInt()) {
        //                      System.out.print("Numbers only. Try again: ");
        //                      in.next();          // <- throws the bad word away
        //                  }
        //                  difficulty = in.nextInt();
        //              } while (difficulty < 1 || difficulty > 3);
        //              in.nextLine();
        //
        //          Then delete `in.next()` and type `banana` to see what an
        //          infinite loop actually looks like. Ctrl+C to escape. Put
        //          it back afterwards.
        int difficulty = 2;   // <- replace this line with the loop above

        // ---------- L7 · a switch EXPRESSION — it produces a value ----------
        // Note the arrows and the semicolon at the end. This whole switch IS
        // the right-hand side of an assignment.
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


        // TODO 2: wrap the whole combat turn in a game loop.
        //
        //              int turnNumber = 1;
        //              boolean playing = true;
        //
        //              while (playing) {
        //                  ...everything below, indented one more level...
        //                  turnNumber++;
        //              }
        //
        //          THE HARD PART is deciding what goes INSIDE. Ask yourself,
        //          line by line: should this happen once, or every turn?
        //            once  -> title, name, difficulty, starting stats
        //            every -> status line, menu, switch, clamp, health bar
        //
        //          If your name prompt comes back on turn 2, you wrapped too
        //          much.

        // TODO 3: make the roll change each turn, so every turn isn't identical:
        //              int roll = (turnNumber * 3) % 10 + 1;
        //          That's % from Lesson 3. L12 makes it properly random.

        // TODO 4: let the enemy hit back, or you can never lose:
        //              if (alive && enemyHealth > 0) {
        //                  health -= enemyPower;
        //                  ...print what happened...
        //              }

        // TODO 5: three ways the loop ends — fled, won, lost. Check !alive
        //          FIRST. Put it last instead, then flee on low health, and
        //          it will tell you that you died.

        // ---------- L6 · the attack roll (now driven by the menu) ----------
        // roll is still hard-coded so every branch can be walked by hand.
        // Change it to 10, then 5, then 1 and run each time. L12 makes it random.
        int roll = 7;
        int damage2 = 0;
        int potions = 2;

        // ---------- L7 · the menu, implemented from the spec sheet ----------
        System.out.println("Your move.");
        System.out.print("[A]ttack  [D]efend  [P]otion  [F]lee: ");
        String action = in.nextLine().trim().toUpperCase();

        // A switch STATEMENT — it does things rather than producing a value.
        // Arrow cases do not fall through, so no break is needed anywhere.
        switch (action) {
            case "A" -> {
                if (roll >= 9) {
                    damage2 = enemyPower * 2;
                    System.out.println("CRITICAL HIT!");
                } else if (roll >= 3) {
                    damage2 = enemyPower;
                    System.out.println("A solid hit.");
                } else {
                    damage2 = 0;
                    System.out.println("You miss.");
                }
            }
            case "D" -> {
                damage2 = 0;
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
            // The spec says an unknown key costs the turn. It does NOT say
            // "ask again" — that would be a different program, and L8's loop
            // is what makes asking again possible.
            default -> System.out.println("The crowd jeers. You hesitate and lose the turn.");
        }

        // ---------- L7 · the ternary — it CHOOSES A VALUE, nothing more ----------
        System.out.printf("You have %d %s left.%n",
                          potions, potions == 1 ? "potion" : "potions");

        String condition = health > MAX_HEALTH / 2 ? "steady" : "faltering";
        System.out.println("You look " + condition + ".");
        System.out.println("");

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
