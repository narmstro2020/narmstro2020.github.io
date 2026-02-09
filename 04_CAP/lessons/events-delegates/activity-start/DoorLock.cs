// ============================================
// DoorLock.cs — Smart Door Lock
// ============================================
// Responds to person arrival and departure events.
// Automatically locks/unlocks based on who is home.
// ============================================

public class DoorLock
{
    private bool _isLocked = true;
    private List<string> _peopleHome = new List<string>();

    // TODO: Create a method called "HandleArrival" that:
    //   - Takes a string parameter (personName)
    //   - Adds personName to _peopleHome list
    //   - Sets _isLocked to false
    //   - Prints "🔓 DoorLock: Unlocked for {personName}"
    //   - Prints "    People home: {count}" using _peopleHome.Count

    // TODO: Create a method called "HandleDeparture" that:
    //   - Takes a string parameter (personName)
    //   - Removes personName from _peopleHome list (use .Remove())
    //   - If _peopleHome.Count == 0:
    //       Set _isLocked to true
    //       Print "🔒 DoorLock: All gone — door LOCKED"
    //   - Otherwise:
    //       Print "🔓 DoorLock: {personName} left — {count} still home"
}
