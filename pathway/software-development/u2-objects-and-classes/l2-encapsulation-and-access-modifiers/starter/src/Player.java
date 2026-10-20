/**
 * THE PLAYER — the first class in the arena (U2 L1).
 *
 * <p>A class is a blueprint. An object is one thing built from it with
 * {@code new}. Every loose player variable that used to live in {@code main} —
 * name, health, gold, level, row, col — now lives here, together, in one object,
 * so a method that needs the player takes one parameter instead of six.</p>
 *
 * <p>The fields are public today. Lesson 2 makes them private and explains why:
 * right now anything can write {@code player.health = -50} and nothing stops it.</p>
 */
public class Player {

    /** The name typed at the gate. */
    String name;
    /** Current health, 0 to {@link Main#MAX_HEALTH}. */
    int health;
    /** Gold carried. */
    int gold;
    /** Level; a Relic raises it by one. */
    int level;
    /** Row on the arena grid. */
    int row;
    /** Column on the arena grid. */
    int col;

    /**
     * A fresh challenger: full health, the starting gold, level 1, standing at
     * the left of the arena.
     *
     * @param playerName the name typed at the gate
     */
    Player(String playerName) {
        name = playerName;
        health = Main.MAX_HEALTH;
        gold = Main.STARTING_GOLD;
        level = 1;
        row = 2;
        col = 1;
    }

    /**
     * A challenger with a chosen health and purse — a second constructor with
     * the same name and a different parameter list. Overloading, from Lesson 10.
     *
     * @param playerName the name typed at the gate
     * @param startingHealth health to begin with
     * @param startingGold gold to begin with
     */
    Player(String playerName, int startingHealth, int startingGold) {
        name = playerName;
        health = startingHealth;
        gold = startingGold;
        level = 1;
        row = 2;
        col = 1;
    }
}
