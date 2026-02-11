// ============================================
// SECTION 7: Custom Exceptions
// ============================================

public class InsufficientFundsException : Exception
{
    public decimal AttemptedAmount { get; }
    public decimal CurrentBalance { get; }

    public InsufficientFundsException(decimal attempted, decimal balance)
        : base($"Cannot withdraw {attempted:C}. Balance: {balance:C}")
    {
        AttemptedAmount = attempted;
        CurrentBalance = balance;
    }
}

public class Section07_CustomExceptions
{
    public static void Run()
    {
        Console.WriteLine("=== Section 7: Custom Exceptions ===");
        
        decimal balance = 100.00m;
        decimal withdrawal = 250.00m;
        
        try
        {
            if (withdrawal > balance)
                throw new InsufficientFundsException(withdrawal, balance);
            
            balance -= withdrawal;
            Console.WriteLine($"Withdrawal successful. New balance: {balance:C}");
        }
        catch (InsufficientFundsException ex)
        {
            Console.WriteLine(ex.Message);
            Console.WriteLine($"Short by: {ex.AttemptedAmount - ex.CurrentBalance:C}");
        }
        
        // TODO 1: Create a custom exception class called InvalidGradeException that:
        //         - Inherits from Exception
        //         - Has a property: int Grade { get; }
        //         - Constructor takes an int grade parameter
        //         - Passes this message to base(): $"Invalid grade: {grade}. Must be 0-100."
        //         - Sets the Grade property in the constructor
        
        // TODO 2: Write code that asks the user to enter a grade (use int.Parse).
        //         If the grade is less than 0 or greater than 100, throw your
        //         InvalidGradeException. Catch it and display the message AND
        //         the Grade property.
        
        // TODO 3: Also catch FormatException in case the user doesn't type a number.
        //         Remember: specific catches first, general last!
    }
}
