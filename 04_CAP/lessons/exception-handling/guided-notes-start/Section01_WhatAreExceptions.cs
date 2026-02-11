// ============================================
// SECTION 1: What Are Exceptions?
// ============================================

public class Section01_WhatAreExceptions
{
    public static void Run()
    {
        Console.WriteLine("=== Section 1: What Are Exceptions? ===");
        
        // This code compiles fine but will crash at runtime!
        Console.Write("Enter a number: ");
        string input = Console.ReadLine();
        int number = int.Parse(input);
        Console.WriteLine($"You entered: {number}");
        
        // TODO 1: Run this program and type "hello" instead of a number.
        //         What exception type do you see? Write it as a comment below:
        //         Exception type: ___________________________
        
        // TODO 2: Run again and type nothing (just press Enter).
        //         What exception type do you see? Write it as a comment below:
        //         Exception type: ___________________________
        
        // TODO 3: In a comment, explain the difference between a syntax error
        //         (like a missing semicolon) and an exception.
    }
}
