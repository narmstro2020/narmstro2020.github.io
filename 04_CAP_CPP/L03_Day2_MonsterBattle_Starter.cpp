// =============================================================
// Lesson 3 Activity: Monster Battle Loop
// Date: Tuesday, April 7, 2026
// Name: ____________________
//
// Instructions:
//   Fill in each // TODO section.
//   Test after EACH section — build incrementally!
//   Refer to your Lesson 3 notes for while/for syntax.
// =============================================================

#include <iostream>
using namespace std;

int main() {

    // ===========================================
    // SECTION 1: Set up variables
    // ===========================================

    int playerHP = 100;
    int monsterHP = 80;
    int playerDamage = 15;
    int monsterDamage = 12;
    int round = 1;
    int totalDamageDealt = 0;  // accumulator

    int playerMaxHP = 100;
    int monsterMaxHP = 80;

    cout << "=== MONSTER BATTLE ===" << endl;
    cout << endl;

    // ===========================================
    // SECTION 2: Battle loop
    // Loop while BOTH player AND monster are alive
    // ===========================================

    while (playerHP > 0 && monsterHP > 0) {

        // ---- Display round header ----
        cout << "--- Round " << round << " ---" << endl;

        // ---- Display player HP bar ----
        // TODO: Print the player's HP bar using a for loop
        // Pattern:
        //   cout << "Player:  [";
        //   for (int i = 0; i < 10; i++) {
        //       if (i < playerHP / 10) {
        //           cout << "#";
        //       } else {
        //           cout << ".";
        //       }
        //   }
        //   cout << "]  " << playerHP << "/" << playerMaxHP << " HP" << endl;



        // ---- Display monster HP bar ----
        // TODO: Print the monster's HP bar using a for loop
        // (Same pattern as above, but with monsterHP and monsterMaxHP)



        cout << endl;

        // ---- Player attacks monster ----
        // TODO: Subtract playerDamage from monsterHP
        // TODO: Add playerDamage to totalDamageDealt (accumulator)
        // TODO: Print a message like "You strike the monster for 15 damage!"



        // ---- Check if monster is dead ----
        // TODO: If monsterHP <= 0, print "The monster has been defeated!"
        //       and use "break;" to exit the loop early
        // (This prevents the dead monster from attacking back)



        // ---- Monster attacks player ----
        // TODO: Subtract monsterDamage from playerHP
        // TODO: Print a message like "The monster claws you for 12 damage!"



        cout << endl;

        // ---- Increment round ----
        round++;
    }

    // ===========================================
    // SECTION 3: Battle results
    // ===========================================

    cout << endl;

    // TODO: Display who won
    // If playerHP > 0: "=== VICTORY! ==="
    // Else: "=== DEFEAT... ==="



    // TODO: Display final stats
    // - Rounds fought (round - 1, since we incremented after the last round)
    // - Player HP remaining
    // - Monster HP remaining
    // - Total damage you dealt



    return 0;
}
