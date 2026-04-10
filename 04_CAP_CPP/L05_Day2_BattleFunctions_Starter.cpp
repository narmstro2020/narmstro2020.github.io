// =============================================================
// Lesson 5 Activity: Battle Functions
// Date: Monday, April 13, 2026
// Name: ____________________
//
// Instructions:
//   Write each function above main().
//   Build ONE function at a time, then test it.
//   Your main() should be clean and readable.
//
// Required functions (minimum 5):
//   1. void printSeparator()
//   2. void displayHP(string name, int hp, int maxHP)
//   3. bool isAlive(int hp)
//   4. int rollDamage(int min, int max)
//   5. One of your choice
// =============================================================

#include <iostream>
#include <string>
#include <cstdlib>
#include <ctime>
using namespace std;

// ===========================================
// FUNCTION 1: printSeparator
// Prints a decorative line
// ===========================================

// TODO: Write printSeparator() here
// It takes no parameters and returns nothing (void).
// It should print a line like "==============================".



// ===========================================
// FUNCTION 2: displayHP
// Shows a combatant's HP bar
// Parameters: name (string), hp (int), maxHP (int)
// ===========================================

// TODO: Write displayHP() here
// Use a for loop to draw a 10-character bar.
// Print: Name:  [######....]  hp/maxHP HP
//
// Hint from your notes:
// cout << name << ": [";
// for (int i = 0; i < 10; i++) {
//     if (i < hp / 10) cout << "#";
//     else cout << ".";
// }
// cout << "]  " << hp << "/" << maxHP << " HP" << endl;



// ===========================================
// FUNCTION 3: isAlive
// Returns true if hp > 0, false otherwise
// ===========================================

// TODO: Write isAlive() here
// One line: return hp > 0;



// ===========================================
// FUNCTION 4: rollDamage
// Returns a random int between min and max (inclusive)
// ===========================================

// TODO: Write rollDamage() here
// return rand() % (max - min + 1) + min;



// ===========================================
// FUNCTION 5: Your choice!
// Ideas:
//   string getStatus(int hp) — returns "Healthy"/"Wounded"/"Critical"/"Dead"
//   int calculateXP(int enemyLevel, int rounds) — returns XP
//   void printBattleHeader(string enemyName, int round)
//   void printVictory(int playerHP, int maxHP, int rounds)
// ===========================================

// TODO: Write your 5th function here



// ===========================================
// MAIN — Your battle loop goes here
// Use your functions to keep it clean!
// ===========================================

int main() {

    srand(time(0));  // seed random numbers — do this ONCE

    // ---- Setup ----
    int playerHP = 100;
    int playerMaxHP = 100;
    int monsterHP = 80;
    int monsterMaxHP = 80;
    int round = 1;

    // TODO: Print a battle header using printSeparator()
    //       and cout for the title



    // ---- Battle Loop ----
    // TODO: while loop using isAlive() for BOTH combatants

    // Inside the loop:
    //   1. Print round number
    //   2. Call displayHP() for player
    //   3. Call displayHP() for monster
    //   4. Player attacks: use rollDamage(8, 18), subtract from monsterHP
    //   5. Check if monster is dead (use isAlive()) — if dead, break
    //   6. Monster attacks: use rollDamage(6, 14), subtract from playerHP
    //   7. Increment round



    // ---- Results ----
    // TODO: Print separator
    // TODO: Display winner (check isAlive(playerHP))
    // TODO: Show final stats (rounds, HP remaining)
    // TODO: Use your 5th function here if applicable



    return 0;
}
