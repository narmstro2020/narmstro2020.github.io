// ============================================================
// TipCalculator.cs — Business Logic Model
// This class knows NOTHING about the UI. It only does math.
// Complete the TODOs to implement the calculation logic.
// ============================================================

namespace TipCalculatorApp
{
    public class TipCalculator
    {
        // ====================================================
        // TODO 9: Create two auto-properties:
        //
        //   public decimal BillAmount { get; set; }
        //   public double TipPercentage { get; set; }
        // ====================================================


        // ====================================================
        // TODO 10: Create a read-only property TipAmount that
        //          calculates the tip.
        //
        //   Formula: BillAmount * (decimal)(TipPercentage / 100)
        //
        //   Use an expression-bodied property:
        //     public decimal TipAmount => ...
        //
        //   Note: We cast (decimal) because TipPercentage is
        //   a double but BillAmount is a decimal. You can't
        //   multiply different numeric types without casting.
        // ====================================================


        // ====================================================
        // TODO 11: Create a read-only property Total that
        //          returns BillAmount + TipAmount.
        //
        //   public decimal Total => ...
        // ====================================================


        // ====================================================
        // TODO 12: Create a method SplitAmount that takes an
        //          int parameter 'people' and returns the
        //          per-person amount (Total / people).
        //
        //   Handle the edge case: if people <= 0, return Total.
        //
        //   public decimal SplitAmount(int people)
        //       => people > 0 ? Total / people : Total;
        // ====================================================

    }
}
