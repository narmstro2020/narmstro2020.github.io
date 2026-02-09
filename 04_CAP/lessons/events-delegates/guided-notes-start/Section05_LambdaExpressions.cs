// ============================================
// SECTION 5: Lambda Expressions
// ============================================

public delegate int Calculate(int a, int b);
public delegate void Printer(string msg);
public delegate bool Checker(int number);

public class Section05_LambdaExpressions
{
    public static void Run()
    {
        Console.WriteLine("=== Section 5: Lambda Expressions ===");
        
        // Single-line lambda (expression body)
        Calculate add = (a, b) => a + b;
        Calculate multiply = (a, b) => a * b;
        
        Console.WriteLine($"Add: {add(3, 4)}");          // 7
        Console.WriteLine($"Multiply: {multiply(3, 4)}");  // 12
        
        // Lambda with void return
        Printer greet = (name) => Console.WriteLine($"Hello, {name}!");
        greet("class");
        
        // Lambda returning bool
        Checker isEven = (n) => n % 2 == 0;
        Console.WriteLine($"Is 4 even? {isEven(4)}");   // True
        Console.WriteLine($"Is 7 even? {isEven(7)}");   // False
        
        // Multi-line lambda (statement body — needs braces and return)
        Calculate safeDivide = (a, b) =>
        {
            if (b == 0) return 0;
            return a / b;
        };
        Console.WriteLine($"Safe divide: {safeDivide(10, 0)}"); // 0
        
        // TODO 1: Create a lambda "subtract" using the Calculate delegate
        //         that returns a - b. Print the result of subtract(10, 3)
        
        // TODO 2: Create a lambda "isPositive" using the Checker delegate
        //         that returns true if the number is greater than 0
        //         Test it with 5 and -3
        
        // TODO 3: Create a multi-line lambda "clampedAdd" using Calculate
        //         that adds a + b but caps the result at 100 (returns 100 if sum > 100)
        //         Test with (60, 50) and (30, 20)
    }
}
