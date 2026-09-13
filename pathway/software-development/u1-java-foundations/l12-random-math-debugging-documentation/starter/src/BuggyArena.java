import java.util.Scanner;

/*
 * THE BUG HUNT.
 *
 * Three bugs. Nobody is going to tell you where they are.
 *
 * One of them the compiler will find for you. One of them you will only find
 * with a breakpoint and the Variables panel. One of them looks fine until the
 * very last time round the loop.
 *
 * Rules:
 *   - Fix them one at a time.
 *   - For each one, write down HOW YOU FOUND IT, not just what it was.
 *   - Bug 1 must be found with the debugger. Reading it does not count.
 */
public class BuggyArena {

    static int applyDamage(int hp, int damage) {
        return hp + damage;
    }

    static String describe(int hp) {
        if (hp = 0) return "defeated";
        if (hp < 25) return "badly hurt";
        return "healthy";
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int[] enemyHp = {30, 25, 40};
        int hits = 0;

        for (int i = 0; i <= enemyHp.length; i++) {
            System.out.print("Damage to enemy " + (i + 1) + ": ");
            int dmg = in.nextInt();
            enemyHp[i] = applyDamage(enemyHp[i], dmg);
            System.out.println("Enemy is " + describe(enemyHp[i]));
            hits++;
        }
        System.out.println("Total hits: " + hits);
    }
}
