// =============================================================
// Lesson 2 Activity: Text Adventure — Room 1
// Date: Thursday, March 19, 2026
// Name: ____________________
//
// Instructions:
//   Fill in each // TODO section.
//   Test after EACH section — don't write it all at once!
//   Use your notes from Lessons 1 and 2.
//
// Checklist:
//   [ ] string, int, double, bool variables
//   [ ] switch with 3+ cases
//   [ ] if/else if/else with 3+ branches
//   [ ] nested if
//   [ ] arithmetic calculation
//   [ ] boolean check
//   [ ] 2+ endings
//   [ ] final stats display
// =============================================================

#include <iostream>
#include <string>
using namespace std;

int main() {

    // ===========================================
    // SECTION 1: Set up variables
    // ===========================================

    string playerName;
    int playerHP = 100;
    int playerGold = 50;
    bool hasKey = false;
    int menuChoice;

    // TODO: Add any extra variables you want
    // (e.g., monsterHP, weapon damage, etc.)



    // ===========================================
    // SECTION 2: Welcome message + get player name
    // ===========================================

    cout << "=== DUNGEON ESCAPE ===" << endl;
    cout << endl;

    cout << "What is your name, adventurer? ";
    cin >> playerName;

    cout << endl;
    cout << "Welcome, " << playerName << "!" << endl;
    cout << "HP: " << playerHP
         << " | Gold: " << playerGold
         << " | Key: " << hasKey << endl;
    cout << endl;

    // ===========================================
    // SECTION 3: Describe the room
    // ===========================================

    // TODO: Write 2-3 cout lines describing the dungeon room.
    // Set the scene — what does the player see?
    // Example:
    // cout << "You wake up in a cold, dark room." << endl;
    // cout << "There's a chest, a sleeping goblin, and a locked door." << endl;



    // ===========================================
    // SECTION 4: First choice — switch menu
    // Must have at least 3 cases + default
    // ===========================================

    cout << endl;
    cout << "What do you do?" << endl;
    cout << "1) Search the chest" << endl;
    cout << "2) Fight the goblin" << endl;
    cout << "3) Try the locked door" << endl;
    // TODO: Add a 4th option if you want!
    cout << "Choose: ";
    cin >> menuChoice;
    cout << endl;

    switch (menuChoice) {

        case 1:
            // TODO: Search the chest
            // Use a NESTED IF here:
            //   - If the player has enough gold, they can force it open
            //   - Inside that, decide what they find
            // Remember to update variables (gold, hasKey, etc.)
            // Example structure:
            //
            // cout << "You approach the chest." << endl;
            // if (playerGold >= 30) {
            //     // ask if they want to pay
            //     // if yes: spend gold, find the key
            //     // if no: walk away
            // } else {
            //     cout << "You can't afford to open it." << endl;
            // }



            break;

        case 2:
            // TODO: Fight the goblin
            // Use an IF / ELSE IF / ELSE chain with 3+ branches:
            //   - If HP > 75: you fight well, take little damage
            //   - If HP > 25: tough fight, take moderate damage
            //   - Else: you're too weak, take heavy damage
            // Include at least one ARITHMETIC CALCULATION (damage, HP change)
            // Example:
            //
            // int damage;
            // if (playerHP > 75) {
            //     damage = 10;
            //     cout << "You overpower the goblin!" << endl;
            // } else if (playerHP > 25) {
            //     ...
            // } else {
            //     ...
            // }
            // playerHP -= damage;



            break;

        case 3:
            // TODO: Try the locked door
            // Use a BOOLEAN CHECK:
            //   - If hasKey is true: you escape!
            //   - If hasKey is false: the door won't budge
            // Example:
            //
            // if (hasKey) {
            //     cout << "The key turns! You escape!" << endl;
            // } else {
            //     cout << "The door is locked." << endl;
            // }



            break;

        default:
            cout << "That's not a valid choice. You stand confused." << endl;
            break;
    }

    // ===========================================
    // SECTION 5: Ending
    // Must have at least 2 different endings
    // ===========================================

    cout << endl;

    // TODO: Check conditions and display different endings.
    // Use if/else to create at least 2 endings.
    // Example ideas:
    //   - if (playerHP <= 0): "You didn't make it..."
    //   - else if (hasKey): "You escaped the dungeon!"
    //   - else: "You're still trapped..."



    // ===========================================
    // SECTION 6: Final stats
    // ===========================================

    cout << endl;
    cout << "=== FINAL STATS ===" << endl;
    cout << "Name: " << playerName << endl;
    cout << "HP: " << playerHP << endl;
    cout << "Gold: " << playerGold << endl;
    cout << "Key: " << hasKey << endl;
    cout << endl;
    cout << "Thanks for playing!" << endl;

    return 0;
}
