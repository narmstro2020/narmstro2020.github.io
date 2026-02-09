// ============================================
// SmartSpeaker.cs — Smart Speaker (Announces Everything)
// ============================================
// The smart speaker subscribes to ALL hub events and
// announces what's happening in the home.
// This device uses LAMBDAS for all its event handlers.
// ============================================

public class SmartSpeaker
{
    // Unlike the other devices, the SmartSpeaker uses LAMBDAS
    // for its handlers. Since lambdas can't be defined outside 
    // of a method body, we'll store them as delegate fields.

    // TODO: Create a field for each handler using the appropriate delegate type.
    //       Use lambdas to define the behavior inline.
    //
    // Example:
    // public HomeHub.TemperatureHandler HandleTemperature =
    //     (temp) => Console.WriteLine($"🔊 Speaker: Temperature is now {temp}°F");

    // TODO: Create HandleMotion (MotionHandler) that announces:
    //       "🔊 Speaker: Motion detected in {location}"

    // TODO: Create HandleAlarm (AlarmHandler) that announces:
    //       "🔊 Speaker: ⚠️ SECURITY ALERT at {zone}! ⚠️"

    // TODO: Create HandleArrival (PersonHandler) that announces:
    //       "🔊 Speaker: Welcome home, {name}!"

    // TODO: Create HandleDeparture (PersonHandler) that announces:
    //       "🔊 Speaker: Goodbye, {name}! Stay safe!"
}
