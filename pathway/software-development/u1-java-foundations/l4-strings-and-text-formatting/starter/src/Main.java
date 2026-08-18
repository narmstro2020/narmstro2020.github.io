/*
 * U1 L4 — THE STATUS LINE · STARTER CODE
 * 7184 Software Development · Unit 1, Lesson 4
 *
 * ALREADY HERE:  Lessons 1–3 finished — stat block, combat arithmetic, the
 *                accuracy fixes, the enrage timer, the crit cast.
 * YOU'RE ADDING: printf, String methods, a health bar, and a title screen.
 *
 *     javac Main.java
 *     java Main
 *
 * Today is the day the output stops looking terrible. Everything you have been
 * told to ignore for three lessons — the crooked columns, the 42.857142857142854 —
 * gets fixed with printf.
 */
public class Main {

    static final int MAX_HEALTH = 100;
    static final int STARTING_GOLD = 20;

    public static void main(String[] args) {
        // TODO 4: a title screen, using a TEXT BLOCK — three double-quotes.
        //         Put it above these opening lines:
        //
        //              String title = """
        //                      ========================
        //                           THE ARENA
        //                      ========================
        //                      """;
        //              System.out.print(title);
        //
        //         Note System.out.print, not println — the text block already
        //         ends with a newline. Use YOUR game's name.

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

        // ---------- 1 · a status line that lines up ----------
        // TODO 1: replace the six println lines below with TWO printf lines.
        //
        //              System.out.printf("%-12s HP %3d/%3d  Gold %4d  Lv %d%n",
        //                                playerName, health, MAX_HEALTH, gold, level);
        //
        //         %s is a String, %d a whole number, %f a decimal, %b a boolean.
        //         The number is the WIDTH. The minus sign means left-align.
        //         %n is the newline. %% prints a literal percent sign.
        //
        //         Get the fighter onto one line and the crit chance onto
        //         another with  %.0f%%  so 0.15 prints as 15%.
        //         Delete the six printlns once your two printf lines work.
        System.out.println("Fighter: " + playerName);
        System.out.println("Health: " + health + " / " + MAX_HEALTH);
        System.out.println("Gold: " + gold);
        System.out.println("Level: " + level);
        System.out.println("Alive: " + alive);
        System.out.println("Crit chance: " + critChance);
        System.out.println("");

        // ---------- 3 · String methods on the enemy ----------
        // TODO 3: ask the enemy's NAME some questions. Print each answer:
        //
        //           enemyName.toUpperCase()            shout it
        //           enemyName.length()                 how many characters
        //           enemyName.contains("Dragon")       a boolean — boss fight?
        //           enemyName.equalsIgnoreCase("cave goblin")
        //
        //         Use .equals() / .equalsIgnoreCase() to compare text —
        //         NEVER ==. On Strings, == asks "are these the same object in
        //         memory," which is the wrong question and only works by
        //         accident. This is the single most common Java bug there is.
        System.out.println("Opponent: " + enemyName);
        System.out.println("Health: " + enemyHealth);
        System.out.println("Power: " + enemyPower);
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
        int brokenAccuracy = hits / swings * 100;
        System.out.println("Accuracy (broken): " + brokenAccuracy + "%");

        double acc1 = (double) hits / swings * 100;
        double acc2 = hits * 100.0 / swings;

        // TODO 1b: these two print 42.857142857142854, which no player should
        //          ever see. Replace them with printf and %.1f%% so they read
        //          42.9%. Same numbers — this is what printf is FOR.
        System.out.println("Accuracy (cast):    " + acc1 + "%");
        System.out.println("Accuracy (reorder): " + acc2 + "%");
        System.out.println("");

        int turn = 6;
        boolean enrages = (turn % 3 == 0);
        System.out.println("Turn " + turn + " — enrages: " + enrages);
        System.out.println("");

        double critDamage = damage * 1.75;
        int applied = (int) critDamage;
        System.out.println("Crit damage (double): " + critDamage);
        System.out.println("Crit damage (int):    " + applied);
        System.out.println("Lost to the cast:     " + (critDamage - applied));
        System.out.println("");


        // ---------- 2 · the health bar ----------
        // TODO 2: draw health as a bar of characters, using .repeat():
        //
        //              int bars = health / 5;
        //              String bar = "#".repeat(bars) + "-".repeat(20 - bars);
        //              System.out.printf("[%s] %d%%%n", bar, health);
        //
        //         health is 101 right now, which prints 101% and happens not
        //         to crash. Add one more potion and .repeat() will throw
        //         IllegalArgumentException, because you can't repeat something
        //         a negative number of times. Try it. The real fix is an if,
        //         and that is Lesson 6 — for now just SEE it break.

    }
}
