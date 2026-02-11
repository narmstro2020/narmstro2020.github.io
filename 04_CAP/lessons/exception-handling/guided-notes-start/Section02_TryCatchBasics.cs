// ============================================
// SECTION 2: Try / Catch Basics
// ============================================

public class Section02_TryCatchBasics
{
    public static void Run()
    {
        Console.WriteLine("=== Section 2: Try / Catch Basics ===");
        
        // Wrap the risky code in try — catch handles the error
        try
        {
            Console.Write("Enter a number: ");
            string input = Console.ReadLine();
            int number = int.Parse(input);
            Console.WriteLine($"Double: {number * 2}");
        }
        catch (FormatException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            Console.WriteLine("Please enter a valid number next time!");
        }
        
        Console.WriteLine("Program continues! No crash.");
        
        // TODO 1: Add a second try/catch below that:
        //         - Asks the user for two numbers (use int.Parse for both)
        //         - Divides the first by the second and prints the result
        //         - Catches DivideByZeroException and prints a friendly message
        //         Test with: 10 / 0
        
        // TODO 2: After your try/catch, add a Console.WriteLine that proves
        //         the program kept running after the error
    }
}
