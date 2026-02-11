// ============================================
// SECTION 3: Multiple Catch Blocks
// ============================================

public class Section03_MultipleCatchBlocks
{
    public static void Run()
    {
        Console.WriteLine("=== Section 3: Multiple Catch Blocks ===");
        
        try
        {
            Console.Write("Enter an index (0-4): ");
            int index = int.Parse(Console.ReadLine());
            int[] numbers = { 10, 20, 30, 40, 50 };
            Console.WriteLine($"Value: {numbers[index]}");
        }
        catch (FormatException ex)
        {
            Console.WriteLine("That wasn't a number!");
        }
        catch (IndexOutOfRangeException ex)
        {
            Console.WriteLine($"Index must be 0-4. {ex.Message}");
        }
        
        // TODO 1: Add a general catch (Exception ex) block at the END
        //         that prints "Something unexpected happened: " + ex.Message
        //         Remember: most specific first, general last!
        
        // TODO 2: Test with these inputs and write what happens as comments:
        //         - Valid input (e.g., 2): 
        //         - "abc": 
        //         - 99: 
        
        // TODO 3: Try moving catch (Exception ex) to be the FIRST catch block.
        //         What error does the compiler give you? Write it as a comment, 
        //         then move it back to the end.
    }
}
