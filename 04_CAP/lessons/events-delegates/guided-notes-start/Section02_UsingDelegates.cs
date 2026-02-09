// ============================================
// SECTION 2: Using Delegates (Callbacks)
// ============================================

public delegate int MathOperation(int a, int b);

public class Section02_UsingDelegates
{
    public static int Add(int a, int b) => a + b;
    public static int Subtract(int a, int b) => a - b;
    public static int Multiply(int a, int b) => a * b;
    
    // This method accepts a delegate as a parameter!
    public static void RunCalculation(MathOperation operation, int x, int y)
    {
        int result = operation(x, y);
        Console.WriteLine($"Result: {result}");
    }
    
    // Null-safe invocation with ?.Invoke()
    public static void SafeRun(MathOperation? operation, int x, int y)
    {
        int? result = operation?.Invoke(x, y);
        Console.WriteLine(result != null 
            ? $"Result: {result}" 
            : "No operation provided!");
    }
    
    public static void Run()
    {
        Console.WriteLine("=== Section 2: Using Delegates ===");
        
        RunCalculation(Add, 10, 5);       // Result: 15
        RunCalculation(Subtract, 10, 5);  // Result: 5
        RunCalculation(Multiply, 10, 5);  // Result: 50
        
        // Safe invocation — won't crash even if null
        SafeRun(null, 10, 5);
        
        // TODO 1: Create a method called "Divide" that returns a / b
        //         (int division is fine, no need for decimals)
        
        // TODO 2: In Run(), call RunCalculation with your Divide method
        //         using the values 20 and 4
        
        // TODO 3: Call SafeRun with your Divide method using 20 and 4
    }
}
