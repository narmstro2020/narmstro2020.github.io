// ============================================
// TIP CALCULATOR — TipCalculatorModel.cs
// WinUI 3 Activity — Business Logic
// ============================================
// This class handles ALL the math. It knows nothing
// about buttons, sliders, or any UI controls.
// This is the "Model" in our three-layer approach:
//   .xaml (UI) ↔ .xaml.cs (events) ↔ Model.cs (logic)
// ============================================

namespace TipCalculator;

/// <summary>
/// Holds the results of a tip calculation.
/// </summary>
public class TipResult
{
    /// <summary>The tip amount in dollars.</summary>
    public double TipAmount { get; set; }

    /// <summary>The bill + tip combined.</summary>
    public double TotalWithTip { get; set; }

    /// <summary>Total divided by number of people.</summary>
    public double PerPerson { get; set; }

    /// <summary>Tip divided by number of people.</summary>
    public double TipPerPerson { get; set; }
}

/// <summary>
/// Performs tip calculations. No UI dependencies — pure math.
/// </summary>
public class TipCalculatorModel
{
    /// <summary>
    /// Calculates tip, total, and per-person amounts.
    /// </summary>
    /// <param name="billAmount">The pre-tip bill total</param>
    /// <param name="tipPercent">Tip as a decimal (e.g., 0.18 for 18%)</param>
    /// <param name="numberOfPeople">How many people are splitting</param>
    /// <param name="roundUp">Whether to round the total up to the nearest dollar</param>
    /// <returns>A TipResult with all calculated values</returns>
    public TipResult Calculate(double billAmount, double tipPercent,
                               int numberOfPeople, bool roundUp)
    {
        // TODO 1: Calculate the tip amount.
        //         Formula: billAmount * tipPercent
        //
        //         Hint: double tipAmount = billAmount * tipPercent;

        double tipAmount = 0; // ← Replace 0 with the calculation


        // TODO 2: Calculate the total with tip.
        //         Formula: billAmount + tipAmount
        //
        //         Hint: double totalWithTip = billAmount + tipAmount;

        double totalWithTip = 0; // ← Replace 0 with the calculation


        // TODO 3: If roundUp is true, round totalWithTip UP to the
        //         nearest whole dollar using Math.Ceiling().
        //         Then recalculate tipAmount as totalWithTip - billAmount.
        //
        //         Hint: if (roundUp)
        //               {
        //                   totalWithTip = Math.Ceiling(totalWithTip);
        //                   tipAmount = totalWithTip - billAmount;
        //               }



        // TODO 4: Calculate perPerson (total ÷ people) and
        //         tipPerPerson (tip ÷ people).
        //         Make sure numberOfPeople is at least 1 to avoid
        //         dividing by zero.
        //
        //         Hint: int people = Math.Max(numberOfPeople, 1);
        //               double perPerson = totalWithTip / people;
        //               double tipPerPerson = tipAmount / people;

        double perPerson = 0;    // ← Replace with calculation
        double tipPerPerson = 0; // ← Replace with calculation


        // TODO 5: Create and return a TipResult object with all four values.
        //
        //         Hint: return new TipResult
        //               {
        //                   TipAmount = tipAmount,
        //                   TotalWithTip = totalWithTip,
        //                   PerPerson = perPerson,
        //                   TipPerPerson = tipPerPerson
        //               };

        return new TipResult(); // ← Replace with populated result
    }
}
