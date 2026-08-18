/*
 * U1 L3 — COMBAT MATH · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 3
 *
 * ALREADY HERE:  Lessons 1–2 finished — the opening, the constants, the stat
 *                block, the opponent. Rethemed to the arena; retheme it back
 *                to your own game if you'd rather work in yours.
 * YOU'RE ADDING: arithmetic that changes the numbers, integer division, %,
 *                and a cast.
 *
 *     javac Main.java
 *     java Main
 *
 * Compile and run after every TODO.
 */
public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;

    public static void main(String[] args) {
        System.out.println("The arena awaits.");
        System.out.println("Sand, torchlight, and a crowd that has already decided how this ends.");
        System.out.println("The gate opens.");
        System.out.println("");

        String playerName = "Nameless";
        int health = MAX_HEALTH;
        int gold = STARTING_GOLD;
        int level = 1;
        boolean alive = true;
        double critChance = 0.15;

        String enemyName = "Cave Goblin";
        int enemyHealth = 40;
        int enemyPower = 7;

        System.out.println("Fighter: " + playerName);
        System.out.println("Health: " + health + " / " + MAX_HEALTH);
        System.out.println("Gold: " + gold);
        System.out.println("Level: " + level);
        System.out.println("Alive: " + alive);
        System.out.println("Crit chance: " + critChance);
        System.out.println("");

        System.out.println("Opponent: " + enemyName);
        System.out.println("Health: " + enemyHealth);
        System.out.println("Power: " + enemyPower);
        System.out.println("");


        // ---------- 1 · combat arithmetic ----------
        // TODO 1a: work out the damage the enemy deals. Something like
        //          enemyPower * 2 — your game, your formula.
        //          Then SUBTRACT it from health using -=  and print the result.
        //
        //              health -= damage;
        //
        // TODO 1b: drink a potion — add some health back with +=
        // TODO 1c: level up with ++  and print the new level.


        // ---------- 2 · the accuracy bug ----------
        // TODO 2a: declare  int hits = 3;  and  int swings = 7;
        //
        // TODO 2b: TYPE THE BROKEN VERSION FIRST and run it:
        //
        //              int brokenAccuracy = hits / swings * 100;
        //
        //          Print it. You will get 0%. Do not fix it yet — work out WHY
        //          first, and write the reason down. int / int throws the
        //          remainder away before the * 100 ever happens.
        //
        // TODO 2c: now fix it TWO different ways, both into a double:
        //            - cast one operand:   (double) hits / swings * 100
        //            - reorder so a double is in the maths first:  hits * 100.0 / swings
        //          Print both. Same answer, two routes.


        // ---------- 3 · a rhythm with % ----------
        // TODO 3: the enemy enrages every third turn.
        //         Declare  int turn = 6;  then use the remainder operator:
        //
        //              boolean enrages = (turn % 3 == 0);
        //
        //         Print it. Change turn to 5 and run again. % is how you make
        //         anything happen "every N times" without counting.


        // ---------- 4 · crit, and what a cast costs ----------
        // TODO 4: multiply your damage by 1.75 into a double, then force it
        //         into an int with a cast:
        //
        //              int applied = (int) critDamage;
        //
        //         Print the double, the int, and the difference between them.
        //         The cast does NOT round. It truncates — it drops everything
        //         after the decimal point. Prove that to yourself.

    }
}
