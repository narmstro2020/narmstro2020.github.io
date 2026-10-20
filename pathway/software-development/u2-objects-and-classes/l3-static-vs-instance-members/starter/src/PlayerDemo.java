/**
 * Try to break the player (U2 L2). Run this one on its own:
 * {@code java PlayerDemo}. Every attack on the player's state is turned away.
 */
public class PlayerDemo {

    /**
     * Attempts every illegal value the game could ever produce and shows the
     * setter refusing each one. The line that does not compile is left in as
     * a comment: that is the one that matters most.
     *
     * @param args not used
     */
    public static void main(String[] args) {
        Player ada = new Player("Ada");

        // ada.health = -50;     // DOES NOT COMPILE: health has private access in Player
        // That line was legal in Lesson 1. Now the only way in is the setter.

        ada.setHealth(-50);
        System.out.printf("setHealth(-50)  -> %d HP%n", ada.getHealth());
        ada.setHealth(999);
        System.out.printf("setHealth(999)  -> %d HP%n", ada.getHealth());
        ada.setGold(-5);
        System.out.printf("setGold(-5)     -> %d gold%n", ada.getGold());
        ada.setCol(40);
        System.out.printf("setCol(40)      -> col %d%n", ada.getCol());

        // The constructor goes through the same setters, so a bad start is
        // caught at the door too.
        Player ben = new Player("Ben", -10, -1);
        System.out.printf("new Player(\"Ben\", -10, -1) -> %d HP, %d gold%n", ben.getHealth(), ben.getGold());

        // Lesson 1's fact still holds: two names, one object.
        Player twin = ada;
        twin.setHealth(0);
        System.out.printf("%s has %d HP after twin.setHealth(0)%n", ada.getName(), ada.getHealth());
    }
}
