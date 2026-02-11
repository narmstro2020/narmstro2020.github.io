// ============================================
// TransactionViewer.cs — Reads Transaction History
// ============================================
// Reads and displays the transactions.txt log file.
// Handles the case where no transactions exist yet.
// ============================================

public class TransactionViewer
{
    // TODO: Create a static method called DisplayHistory() that:
    //   - Uses a try/catch/finally to read "transactions.txt"
    //   - In try: open a StreamReader, read all content, print it
    //     Hint: StreamReader reader = null;
    //           reader = new StreamReader("transactions.txt");
    //           Console.WriteLine(reader.ReadToEnd());
    //   - Catches FileNotFoundException and prints:
    //       "📭 No transaction history yet."
    //   - Catches IOException and prints the error message
    //   - In finally: close the reader (null-check first!)
    //       reader?.Close();
    //       Console.WriteLine("📄 Transaction viewer closed.");
}
