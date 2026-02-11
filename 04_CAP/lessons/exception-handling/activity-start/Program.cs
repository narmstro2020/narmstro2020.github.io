// ============================================
// 🏦 SafeBank — Console Banking Application
// Exception Handling in C#
// ============================================
//
// Build a crash-proof banking app! Every possible
// error should be caught and handled gracefully.
//
// Files in this project:
//   Program.cs                      <- You are here
//   BankAccount.cs                  <- Account with deposit/withdraw
//   InsufficientFundsException.cs   <- Custom exception
//   TransactionViewer.cs            <- Reads transaction log
// ============================================

Console.WriteLine("╔══════════════════════════════════════╗");
Console.WriteLine("║        🏦 Welcome to SafeBank        ║");
Console.WriteLine("╚══════════════════════════════════════╝");
Console.WriteLine();

// Step 1: Create the bank account
var account = new BankAccount("Student", 100.00m);
Console.WriteLine($"Account created for {account.AccountHolder} with {account.Balance:C}\n");

bool running = true;

while (running)
{
    Console.WriteLine("\n===== SafeBank Menu =====");
    Console.WriteLine("[1] Check Balance");
    Console.WriteLine("[2] Deposit");
    Console.WriteLine("[3] Withdraw");
    Console.WriteLine("[4] Transaction History");
    Console.WriteLine("[5] Exit");
    Console.Write("Choice: ");

    // TODO: Read the user's menu choice.
    //       Use int.TryParse — do NOT use int.Parse in a try/catch for this!
    //       If TryParse fails, print "Invalid choice. Enter 1-5." and continue.
    
    // TODO: Use a switch or if/else on the choice:
    //
    //   Choice 1 — Check Balance:
    //       Print the account balance (account.Balance with :C format)
    //
    //   Choice 2 — Deposit:
    //       Ask "Enter deposit amount: $"
    //       Use decimal.TryParse to read the amount
    //       Call account.Deposit(amount) inside a try/catch
    //       Catch ArgumentOutOfRangeException — print friendly message
    //       Catch Exception as a safety net
    //
    //   Choice 3 — Withdraw:
    //       Ask "Enter withdrawal amount: $"
    //       Use decimal.TryParse to read the amount
    //       Call account.Withdraw(amount) inside a try/catch
    //       Catch InsufficientFundsException — print message AND the shortfall
    //           Hint: ex.AttemptedAmount - ex.CurrentBalance
    //       Catch ArgumentOutOfRangeException — print friendly message
    //       Catch Exception as a safety net
    //
    //   Choice 4 — Transaction History:
    //       Call TransactionViewer.DisplayHistory()
    //
    //   Choice 5 — Exit:
    //       Set running = false
    //       Print "Thanks for banking with SafeBank! 👋"
    //
    //   Default:
    //       Print "Invalid choice. Enter 1-5."
}
