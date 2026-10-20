/**
 * Two players, then one player with two names (U2 L1). Run this one on its
 * own: {@code java PlayerDemo}. It proves the two facts the lesson rests on.
 */
public class PlayerDemo {

    /**
     * Builds two separate players, hurts one, and shows the other is untouched;
     * then aliases one player under a second name and shows that a change
     * through either name is a change to the same object.
     *
     * @param args not used
     */
    public static void main(String[] args) {
        // FACT 1 — two `new`s make two objects. Their state is separate.
        Player ada = new Player("Ada");
        Player ben = new Player("Ben", 60, 5);
        ada.health -= 30;
        System.out.printf("%s has %d HP, %s has %d HP%n", ada.name, ada.health, ben.name, ben.health);

        // FACT 2 — assignment does NOT make a copy. `twin` is a second name for
        // the same object; there is still only one Ada.
        Player twin = ada;
        twin.health = 0;
        System.out.printf("%s has %d HP after twin.health = 0%n", ada.name, ada.health);
        System.out.println(ada == twin ? "ada and twin are the SAME object" : "different objects");
        System.out.println(ada == ben ? "ada and ben are the same object" : "ada and ben are DIFFERENT objects");
    }
}
