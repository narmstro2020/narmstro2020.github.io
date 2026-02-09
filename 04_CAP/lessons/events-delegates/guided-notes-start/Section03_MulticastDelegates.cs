// ============================================
// SECTION 3: Multicast Delegates
// ============================================

public delegate void AlarmAction(string location);

public class Section03_MulticastDelegates
{
    public static void SendEmail(string loc)
        => Console.WriteLine($"📧 Email sent about: {loc}");
    
    public static void LogToConsole(string loc)
        => Console.WriteLine($"📝 Logged alarm at: {loc}");
    
    public static void SoundBuzzer(string loc)
        => Console.WriteLine($"🔊 BUZZER for: {loc}");
    
    public static void Run()
    {
        Console.WriteLine("=== Section 3: Multicast Delegates ===");
        
        // Subscribe multiple methods
        AlarmAction onAlarm = SendEmail;
        onAlarm += LogToConsole;
        onAlarm += SoundBuzzer;
        
        Console.WriteLine("--- Triggering alarm (3 subscribers) ---");
        onAlarm("Kitchen");
        
        // Unsubscribe the buzzer
        onAlarm -= SoundBuzzer;
        
        Console.WriteLine("\n--- After removing buzzer (2 subscribers) ---");
        onAlarm("Garage");
        
        // TODO 1: Create a new method called "CallFireDepartment" that takes a string
        //         and prints "🚒 Fire dept called for: " followed by the location
        
        // TODO 2: Subscribe CallFireDepartment to onAlarm
        //         AFTER the existing subscribers, then trigger the alarm for "Basement"
        
        // TODO 3: Unsubscribe SendEmail, then trigger for "Bedroom" to see the change
    }
}
