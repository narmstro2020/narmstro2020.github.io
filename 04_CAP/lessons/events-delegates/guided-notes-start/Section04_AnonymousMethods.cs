// ============================================
// SECTION 4: Anonymous Methods
// ============================================

public delegate void Formatter(string text);

public class Section04_AnonymousMethods
{
    public static void Run()
    {
        Console.WriteLine("=== Section 4: Anonymous Methods ===");
        
        // Anonymous method — defined inline!
        Formatter shout = delegate(string text)
        {
            Console.WriteLine(text.ToUpper() + "!!!");
        };
        
        Formatter whisper = delegate(string text)
        {
            Console.WriteLine(text.ToLower() + "...");
        };
        
        shout("Hello World");    // HELLO WORLD!!!
        whisper("Hello World");  // hello world...
        
        // Works with multicast too!
        Formatter both = shout;
        both += whisper;
        Console.WriteLine("\n--- Both formatters ---");
        both("Testing");
        
        // TODO 1: Create an anonymous method assigned to a Formatter delegate called "reverse"
        //         It should print the text reversed (Hint: new string(text.Reverse().ToArray()))
        
        // TODO 2: Invoke your "reverse" formatter with "Hello World"
        
        // TODO 3: Add "reverse" to the "both" multicast delegate and invoke "both" with "Code"
    }
}
