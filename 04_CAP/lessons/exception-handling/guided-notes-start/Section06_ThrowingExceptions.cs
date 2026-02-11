// ============================================
// SECTION 6: Throwing Exceptions
// ============================================

public class Section06_ThrowingExceptions
{
    static void SetAge(int age)
    {
        if (age < 0 || age > 150)
        {
            throw new ArgumentOutOfRangeException(nameof(age),
                "Age must be between 0 and 150.");
        }
        Console.WriteLine($"Age set to: {age}");
    }
    
    public static void Run()
    {
        Console.WriteLine("=== Section 6: Throwing Exceptions ===");
        
        try
        {
            SetAge(25);   // works fine
            SetAge(-5);   // throws!
        }
        catch (ArgumentOutOfRangeException ex)
        {
            Console.WriteLine($"Invalid age: {ex.Message}");
        }
        
        // TODO 1: Write a method called ValidateUsername(string username) that:
        //         - Throws ArgumentNullException if username is null
        //           Hint: throw new ArgumentNullException(nameof(username));
        //         - Throws ArgumentException if username is empty or less than 3 characters
        //           Hint: throw new ArgumentException("Username must be at least 3 characters.", nameof(username));
        //         - Otherwise prints "✅ Username valid: {username}"
        
        // TODO 2: Call ValidateUsername in a try/catch with these test cases:
        //         - null
        //         - "" (empty string)
        //         - "ab" (too short)
        //         - "alice" (valid)
        //         Use separate try/catch for each, or call them one at a time.
        
        // TODO 3: In a comment, explain why we use throw new instead of
        //         just printing an error message with Console.WriteLine.
        //         What advantage does throwing give us?
    }
}
