// ============================================
// SECTION 7: Putting It All Together
// ============================================

public class Doorbell
{
    public delegate void DoorbellHandler(string visitorName);
    public event DoorbellHandler OnRing;
    
    public void Ring(string visitor)
    {
        Console.WriteLine($"\n🔔 Doorbell rang! Visitor: {visitor}");
        OnRing?.Invoke(visitor);
    }
}

public class Section07_PuttingItTogether
{
    static void UnlockDoor(string name)
        => Console.WriteLine($"🔓 Door unlocked for {name}");
    
    public static void Run()
    {
        Console.WriteLine("=== Section 7: Putting It Together ===");
        
        var doorbell = new Doorbell();
        
        // Named method subscriber
        doorbell.OnRing += UnlockDoor;
        
        // Lambda subscriber
        doorbell.OnRing += (name) =>
            Console.WriteLine($"📹 Camera recording: {name} at door");
        
        // Anonymous method subscriber
        doorbell.OnRing += delegate(string name)
        {
            Console.WriteLine($"💡 Porch light turned on for {name}");
        };
        
        doorbell.Ring("Alice");
        doorbell.Ring("Delivery Driver");
        
        // TODO 1: Add a lambda subscriber that prints
        //         "📱 Phone notification: [name] is at the door"
        
        // TODO 2: Add a named method called "LogVisitor" that prints
        //         "📋 Visitor log: [name] arrived at [current time]"
        //         Hint: DateTime.Now.ToShortTimeString()
        
        // TODO 3: Subscribe LogVisitor and ring the doorbell with "Bob"
    }
}
