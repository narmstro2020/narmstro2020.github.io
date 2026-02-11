// ============================================
// SECTION 4: The Finally Block
// ============================================

public class Section04_TheFinallyBlock
{
    public static void Run()
    {
        Console.WriteLine("=== Section 4: The Finally Block ===");
        
        StreamReader reader = null;
        try
        {
            reader = new StreamReader("data.txt");
            string content = reader.ReadToEnd();
            Console.WriteLine(content);
        }
        catch (FileNotFoundException ex)
        {
            Console.WriteLine("File not found! " + ex.Message);
        }
        finally
        {
            if (reader != null)
            {
                reader.Close();
                Console.WriteLine("📁 Reader closed in finally block.");
            }
            Console.WriteLine("✅ Finally block always runs!");
        }
        
        // TODO 1: Create a file called "data.txt" in your project's
        //         bin/Debug/net9.0 folder. Write some text in it.
        //         Run the program — does the finally block run? (Answer in comment)
        
        // TODO 2: Delete the file and run again.
        //         Does the finally block still run? (Answer in comment)
        
        // TODO 3: Write your own try/catch/finally that:
        //         - Opens a StreamWriter to write to "log.txt" (append mode)
        //           Hint: new StreamWriter("log.txt", true)
        //         - Writes "Log entry at: " + DateTime.Now
        //         - Catches any IOException
        //         - In finally, closes the writer (null-check first!)
    }
}
