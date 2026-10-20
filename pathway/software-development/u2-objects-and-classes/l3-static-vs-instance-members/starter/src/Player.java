/**
 * THE PLAYER — the same six facts, now behind a wall (U2 L2).
 *
 * <p>In Lesson 1 every field was public and anything could write
 * {@code player.health = -50}. Now the fields are {@code private}: only code
 * inside this class can touch them. Reading goes through a getter; writing goes
 * through a setter that <em>checks</em>. The rule "health stays between 0 and
 * MAX_HEALTH" used to be scattered through {@code Main} as calls to
 * {@code clamp}; now it lives in one place, where nothing can get around it.</p>
 *
 * <p>That is encapsulation, and it is the first security idea in the course:
 * never trust a value coming in from outside. Validate at the door.</p>
 */
public class Player {

    /** The name typed at the gate. */
    private String name;
    /** Current health, 0 to {@link Main#MAX_HEALTH} — the setter guarantees it. */
    private int health;
    /** Gold carried, never negative — the setter guarantees it. */
    private int gold;
    /** Level; a Relic raises it by one. */
    private int level;
    /** Row on the arena grid. */
    private int row;
    /** Column on the arena grid. */
    private int col;

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
     * A challenger with a chosen health and purse. The values go through the
     * setters, so a bad starting value is caught at the door like any other.
     *
     * @param playerName the name typed at the gate
     * @param startingHealth health to begin with; clamped to the legal range
     * @param startingGold gold to begin with; never below zero
     */
    Player(String playerName, int startingHealth, int startingGold) {
        name = playerName;
        setHealth(startingHealth);
        setGold(startingGold);
        level = 1;
        row = 2;
        col = 1;
    }

    // ================= getters: the only way to read =================

    /** @return the name typed at the gate */
    String getName() { return name; }

    /** @return current health, always 0 to MAX_HEALTH */
    int getHealth() { return health; }

    /** @return gold carried, never negative */
    int getGold() { return gold; }

    /** @return the current level */
    int getLevel() { return level; }

    /** @return row on the arena grid */
    int getRow() { return row; }

    /** @return column on the arena grid */
    int getCol() { return col; }

    // ================= setters: the only way to write, and they check =================

    /**
     * Sets health, forced into the legal range. {@code setHealth(-50)} leaves
     * the player at 0; {@code setHealth(999)} leaves them at MAX_HEALTH. The
     * caller cannot break the rule, which is the point of having a setter.
     *
     * @param newHealth the health asked for
     */
    void setHealth(int newHealth) {
        health = Main.clamp(newHealth, 0, Main.MAX_HEALTH);
    }

    /**
     * Sets gold, never below zero. A negative purse is not a thing.
     *
     * @param newGold the gold asked for
     */
    void setGold(int newGold) {
        gold = Math.max(0, newGold);
    }

    /**
     * Moves the player to a row, kept inside the arena.
     *
     * @param newRow the row asked for
     */
    void setRow(int newRow) {
        row = Main.clamp(newRow, 0, Main.ROWS - 1);
    }

    /**
     * Moves the player to a column, kept inside the arena.
     *
     * @param newCol the column asked for
     */
    void setCol(int newCol) {
        col = Main.clamp(newCol, 0, Main.COLS - 1);
    }

    /**
     * Raises the level by one. There is no {@code setLevel}: the only way a
     * level changes is up, by one, so that is the only method offered.
     */
    void levelUp() {
        level++;
    }
}
