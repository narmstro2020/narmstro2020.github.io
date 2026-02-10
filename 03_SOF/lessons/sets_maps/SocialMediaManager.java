import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * ============================================
 *  Social Media Contacts Manager — Activity
 * ============================================
 *
 * You are building a contact management system for a social media app!
 *
 * The system uses:
 *   - A Set to track blocked users (unique, no duplicates)
 *   - A Map to store user profiles (username → display name)
 *   - A Map to track follower counts (username → count)
 *
 * Skills practiced:
 *   - HashSet: add, remove, contains
 *   - HashMap: put, get, containsKey, getOrDefault, entrySet
 *   - TreeSet: sorted iteration
 *   - Iterating Sets and Maps with for-each loops
 *
 * Complete the TODO sections below. Each TODO has instructions
 * and hints. The main() method at the bottom tests your work.
 *
 * Reference your guided notes from yesterday if you get stuck!
 */
public class SocialMediaManager {

    // ============================================
    // DATA FIELDS
    // ============================================
    private Map<String, String> profiles;       // username → display name
    private Map<String, Integer> followerCounts; // username → follower count
    private Set<String> blockedUsers;           // set of blocked usernames


    // ============================================
    // TODO #1: Constructor — Initialize Collections
    // ============================================
    /**
     * Creates a new SocialMediaManager with empty collections.
     *
     * Initialize all three fields:
     *   - profiles as a new HashMap
     *   - followerCounts as a new HashMap
     *   - blockedUsers as a new HashSet
     */
    public SocialMediaManager() {
        // YOUR CODE HERE

    }


    // ============================================
    // TODO #2: Register a New User
    // ============================================
    /**
     * Registers a new user in the system.
     *
     * Steps:
     *   1. Check if the username already exists in profiles
     *      using containsKey(). If it does, print a message
     *      saying the username is taken and return.
     *   2. If the username is new, add it to profiles with
     *      the given displayName.
     *   3. Set their initial follower count to 0 in followerCounts.
     *
     * @param username    the unique username
     * @param displayName the user's display name
     */
    public void registerUser(String username, String displayName) {
        // YOUR CODE HERE

    }


    // ============================================
    // TODO #3: Get Display Name (with safe lookup)
    // ============================================
    /**
     * Returns the display name for a given username.
     *
     * Use getOrDefault() to return "Unknown User" if the
     * username is not found in profiles.
     *
     * @param username the username to look up
     * @return the display name or "Unknown User"
     */
    public String getDisplayName(String username) {
        // YOUR CODE HERE
        return "";  // ← replace this
    }


    // ============================================
    // TODO #4: Add Followers
    // ============================================
    /**
     * Increases a user's follower count by the given amount.
     *
     * Steps:
     *   1. Get the user's CURRENT follower count from followerCounts
     *      (use getOrDefault with 0 as the fallback).
     *   2. Put the updated count (current + amount) back into
     *      the followerCounts map.
     *
     * @param username the user gaining followers
     * @param amount   how many new followers
     */
    public void addFollowers(String username, int amount) {
        // YOUR CODE HERE

    }


    // ============================================
    // TODO #5: Block and Unblock Users
    // ============================================
    /**
     * Blocks a user by adding their username to the blockedUsers set.
     * Print a confirmation message.
     *
     * @param username the user to block
     */
    public void blockUser(String username) {
        // YOUR CODE HERE

    }

    /**
     * Unblocks a user by removing their username from the blockedUsers set.
     * Print a confirmation message.
     *
     * @param username the user to unblock
     */
    public void unblockUser(String username) {
        // YOUR CODE HERE

    }

    /**
     * Checks if a user is blocked.
     *
     * Use the contains() method on the blockedUsers set.
     *
     * @param username the user to check
     * @return true if blocked, false otherwise
     */
    public boolean isBlocked(String username) {
        // YOUR CODE HERE
        return false;  // ← replace this
    }


    // ============================================
    // TODO #6: Print All Profiles (Map iteration)
    // ============================================
    /**
     * Prints all registered users and their display names.
     *
     * Use a for-each loop with entrySet() on the profiles map.
     * For each entry, print in the format:
     *   @username — Display Name (X followers)
     *
     * To get the follower count, use getOrDefault on followerCounts
     * with 0 as the fallback.
     *
     * Example output:
     *   @alice_dev — Alice Johnson (1500 followers)
     *   @bob_codes — Bob Smith (800 followers)
     */
    public void printAllProfiles() {
        System.out.println("═══ All Registered Users ═══");
        // YOUR CODE HERE

    }


    // ============================================
    // TODO #7: Get Top Users (sorted by username)
    // ============================================
    /**
     * Returns a sorted set of all usernames with more than
     * the given minimum number of followers.
     *
     * Steps:
     *   1. Create a new TreeSet<String> (for sorted results).
     *   2. Loop through followerCounts using entrySet().
     *   3. For each entry, if the follower count > minFollowers,
     *      add the username (the key) to the TreeSet.
     *   4. Return the TreeSet.
     *
     * @param minFollowers the minimum follower threshold
     * @return a sorted set of qualifying usernames
     */
    public Set<String> getTopUsers(int minFollowers) {
        // YOUR CODE HERE
        return new TreeSet<>();  // ← replace this
    }


    // ============================================
    // MAIN METHOD — Tests your code!
    // ============================================
    public static void main(String[] args) {
        System.out.println("════════════════════════════════════");
        System.out.println("   Social Media Manager — Tests    ");
        System.out.println("════════════════════════════════════");
        System.out.println();

        SocialMediaManager manager = new SocialMediaManager();

        // --- Test TODO #2: Register Users ---
        System.out.println("► Registering users...");
        manager.registerUser("alice_dev", "Alice Johnson");
        manager.registerUser("bob_codes", "Bob Smith");
        manager.registerUser("charlie_ui", "Charlie Brown");
        manager.registerUser("diana_data", "Diana Prince");
        manager.registerUser("evan_ml", "Evan Lee");
        manager.registerUser("alice_dev", "Alice Clone");  // duplicate — should be rejected
        System.out.println();

        // --- Test TODO #3: Get Display Name ---
        System.out.println("► Looking up display names...");
        System.out.println("alice_dev → " + manager.getDisplayName("alice_dev"));
        System.out.println("unknown   → " + manager.getDisplayName("unknown"));
        System.out.println();

        // --- Test TODO #4: Add Followers ---
        System.out.println("► Adding followers...");
        manager.addFollowers("alice_dev", 1500);
        manager.addFollowers("bob_codes", 800);
        manager.addFollowers("charlie_ui", 2300);
        manager.addFollowers("diana_data", 450);
        manager.addFollowers("evan_ml", 1200);
        manager.addFollowers("alice_dev", 200);  // Alice gains 200 more
        System.out.println("Alice's followers after update: should be 1700");
        System.out.println();

        // --- Test TODO #5: Block/Unblock ---
        System.out.println("► Testing block system...");
        manager.blockUser("troll_account");
        manager.blockUser("spam_bot");
        System.out.println("Is troll_account blocked? " + manager.isBlocked("troll_account"));
        System.out.println("Is alice_dev blocked?      " + manager.isBlocked("alice_dev"));
        manager.unblockUser("spam_bot");
        System.out.println("Is spam_bot still blocked?  " + manager.isBlocked("spam_bot"));
        System.out.println();

        // --- Test TODO #6: Print All Profiles ---
        System.out.println("► Printing all profiles...");
        manager.printAllProfiles();
        System.out.println();

        // --- Test TODO #7: Get Top Users ---
        System.out.println("► Users with > 1000 followers (sorted):");
        Set<String> topUsers = manager.getTopUsers(1000);
        for (String user : topUsers) {
            System.out.println("  ⭐ @" + user);
        }
        System.out.println();

        System.out.println("════════════════════════════════════");
        System.out.println("        Tests Complete!             ");
        System.out.println("════════════════════════════════════");
    }
}

/*
 * ============================================
 * REFERENCE — Syntax from Yesterday's Notes
 * ============================================
 *
 * // --- SETS ---
 * Set<String> names = new HashSet<>();
 * names.add("Alice");            // add element
 * names.remove("Alice");         // remove element
 * names.contains("Alice");       // check membership
 * names.size();                  // element count
 *
 * for (String name : names) {    // iterate
 *     System.out.println(name);
 * }
 *
 * // TreeSet — sorted automatically
 * Set<String> sorted = new TreeSet<>();
 *
 * // --- MAPS ---
 * Map<String, Integer> scores = new HashMap<>();
 * scores.put("Alice", 95);                    // add/replace
 * scores.get("Alice");                        // get value (or null)
 * scores.getOrDefault("Zoe", 0);              // get value (or fallback)
 * scores.containsKey("Alice");                // check if key exists
 * scores.remove("Alice");                     // remove entry
 * scores.size();                              // number of entries
 *
 * // Iterate over entries:
 * for (var entry : scores.entrySet()) {
 *     String key = entry.getKey();
 *     Integer value = entry.getValue();
 * }
 *
 * // Iterate over just keys:
 * for (String key : scores.keySet()) { ... }
 *
 * // Iterate over just values:
 * for (Integer value : scores.values()) { ... }
 *
 * // Count pattern:
 * map.put(key, map.getOrDefault(key, 0) + 1);
 *
 */
