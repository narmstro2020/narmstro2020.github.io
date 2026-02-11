// ============================================
// InsufficientFundsException.cs — Custom Exception
// ============================================
// Thrown when a withdrawal exceeds the available balance.
// Carries extra data about the failed transaction.
// ============================================

// TODO: Create the InsufficientFundsException class that:
//   - Inherits from Exception
//   - Has two read-only properties:
//       decimal AttemptedAmount { get; }
//       decimal CurrentBalance { get; }
//   - Constructor takes (decimal attempted, decimal balance)
//   - Calls base() with a descriptive message like:
//       $"Insufficient funds. Attempted: {attempted:C}, Balance: {balance:C}"
//   - Sets both properties in the constructor body

// public class InsufficientFundsException : Exception
// {
//     ... your code here ...
// }
