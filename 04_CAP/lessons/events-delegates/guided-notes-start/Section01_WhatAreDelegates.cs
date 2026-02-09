// ============================================
// SECTION 1: What Are Delegates?
// ============================================

// Step 1: Declare a delegate type
// This says: "Any method that takes a string and returns void can be stored here"
public delegate void Notify(string message);

public class Section01_WhatAreDelegates
{
    // Step 2: Create methods that match the delegate signature
    public static void ShowAlert(string msg)
    {
        Console.WriteLine($"🔔 ALERT: {msg}");
    }
    
    public static void LogMessage(string msg)
    {
        Console.WriteLine($"📝 LOG: {msg}");
    }
    
    public static void Run()
    {
        Console.WriteLine("=== Section 1: What Are Delegates? ===");
        
        // Step 3: Assign a method to the delegate
        Notify notifier = ShowAlert;
        notifier("Server is down!");
        
        // Step 4: Reassign to a different method
        notifier = LogMessage;
        notifier("Server is down!");
        
        // TODO 1: Create a new method called "SendEmail" that takes a string parameter
        //         and prints "📧 EMAIL: " followed by the message
        
        // TODO 2: Assign SendEmail to the notifier delegate and invoke it
        //         with the message "Disk space low!"
    }
}
