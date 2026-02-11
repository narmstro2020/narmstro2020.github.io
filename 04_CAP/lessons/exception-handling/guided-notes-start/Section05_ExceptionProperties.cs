// ============================================
// SECTION 5: Exception Properties
// ============================================

public class Section05_ExceptionProperties
{
    public static void Run()
    {
        Console.WriteLine("=== Section 5: Exception Properties ===");
        
        try
        {
            int[] arr = { 1, 2, 3 };
            Console.WriteLine(arr[10]);
        }
        catch (IndexOutOfRangeException ex)
        {
            Console.WriteLine($"Message:    {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            Console.WriteLine($"Source:     {ex.Source}");
            Console.WriteLine($"Inner:      {ex.InnerException}");
        }
        
        // TODO 1: In a comment, explain what the StackTrace told you.
        //         What line number did the error occur on?
        
        // TODO 2: Write a try/catch that calls int.Parse("not a number").
        //         In the catch, print all four properties:
        //         Message, StackTrace, Source, and InnerException
        
        // TODO 3: Use Console.WriteLine(ex) (just the exception itself).
        //         In a comment, explain how this compares to printing
        //         each property individually. Which is more useful for debugging?
    }
}
