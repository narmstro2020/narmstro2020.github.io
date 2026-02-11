// ============================================
// BankAccount.cs — The Core Account Class
// ============================================
// Manages a single checking account with deposits,
// withdrawals, and a transaction log file.
// ============================================

public class BankAccount
{
    public string AccountHolder { get; }
    public decimal Balance { get; private set; }

    public BankAccount(string holder, decimal initialBalance)
    {
        AccountHolder = holder;
        Balance = initialBalance;
    }

    // TODO: Create a Deposit(decimal amount) method that:
    //   - Throws ArgumentOutOfRangeException if amount <= 0
    //     Hint: throw new ArgumentOutOfRangeException(nameof(amount), "Deposit must be positive.");
    //   - Adds amount to Balance
    //   - Calls LogTransaction("DEPOSIT", amount)
    //   - Prints "💰 Deposited {amount:C}. New balance: {Balance:C}"

    // TODO: Create a Withdraw(decimal amount) method that:
    //   - Throws ArgumentOutOfRangeException if amount <= 0
    //   - Throws InsufficientFundsException if amount > Balance
    //     (pass amount and Balance to the constructor)
    //   - Subtracts amount from Balance
    //   - Calls LogTransaction("WITHDRAWAL", amount)
    //   - Prints "💸 Withdrew {amount:C}. New balance: {Balance:C}"

    // TODO: Create a private LogTransaction(string type, decimal amount) method that:
    //   - Uses a StreamWriter in a try/finally to append to "transactions.txt"
    //     Hint: StreamWriter writer = null;
    //           try { writer = new StreamWriter("transactions.txt", true); ... }
    //           finally { writer?.Close(); }
    //   - Writes a line like: "DEPOSIT: $50.00 | Balance: $150.00 | 2/11/2026 1:45 PM"
    //     Hint: $"{type}: {amount:C} | Balance: {Balance:C} | {DateTime.Now}"
}
