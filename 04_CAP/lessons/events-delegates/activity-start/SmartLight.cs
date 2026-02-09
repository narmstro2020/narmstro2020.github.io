// ============================================
// SmartLight.cs — Smart Lighting System
// ============================================
// Responds to motion detection and time changes.
// Turns lights on/off based on activity and time of day.
// ============================================

public class SmartLight
{
    private bool _isNightMode = false;

    // TODO: Create a method called "HandleMotion" that:
    //   - Takes a string parameter (location)
    //   - Prints "💡 Lights: Turning on lights in {location}"
    //   - If _isNightMode is true, also print "    🌙 (dimmed to 30% — night mode)"

    // TODO: Create a method called "HandleTimeChange" that:
    //   - Takes a string parameter (time)
    //   - If the time contains "PM" and does NOT contain "12":
    //       Set _isNightMode = true and print "💡 Lights: Night mode activated"
    //   - If the time contains "AM":
    //       Set _isNightMode = false and print "💡 Lights: Day mode activated"
}
