// ============================================================
// MainWindow.xaml.cs — Code-Behind for Tip Calculator
// Complete the TODOs to wire up events and connect to the model.
// ============================================================

using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;

namespace TipCalculatorApp
{
    public sealed partial class MainWindow : Window
    {
        // ====================================================
        // TODO 5: Create a private field for the TipCalculator
        //         model class. Initialize it with new().
        //         Example: private TipCalculator _calc = new();
        // ====================================================


        public MainWindow()
        {
            this.InitializeComponent();
        }

        // ====================================================
        // TODO 6: Implement OnTipSliderChanged
        //
        // This fires every time the slider moves. You need to:
        //   1. Update tipPercentLabel.Text to show the current
        //      percentage, e.g. "Tip: 18%"
        //      Hint: use e.NewValue to get the slider's value
        //   2. Call UpdateCalculation() to recalculate in
        //      real-time as the user drags the slider
        //
        // Method signature:
        //   private void OnTipSliderChanged(object sender,
        //       RangeBaseValueChangedEventArgs e)
        // ====================================================


        // ====================================================
        // TODO 7: Implement OnCalculateClicked
        //
        // This fires when the Calculate button is clicked.
        // Steps:
        //   1. Call UpdateCalculation()
        //
        // Method signature:
        //   private void OnCalculateClicked(object sender,
        //       RoutedEventArgs e)
        // ====================================================


        // ====================================================
        // TODO 8: Implement UpdateCalculation()
        //
        // This is the main logic method. Steps:
        //   1. Try to parse billBox.Text into a decimal.
        //      If it fails, set tipAmountText to "$0.00",
        //      totalText to "$0.00", perPersonText to "$0.00",
        //      and return early.
        //
        //   2. Set _calc.BillAmount to the parsed bill value
        //
        //   3. Set _calc.TipPercentage to tipSlider.Value
        //
        //   4. Get the number of people from the ComboBox:
        //      int people = splitCombo.SelectedIndex + 1;
        //      (SelectedIndex 0 = "1 person", 1 = "2 people", etc.)
        //
        //   5. Update the display TextBlocks:
        //      tipAmountText.Text = _calc.TipAmount.ToString("C");
        //      totalText.Text = _calc.Total.ToString("C");
        //      perPersonText.Text = _calc.SplitAmount(people).ToString("C");
        //
        // Method signature:
        //   private void UpdateCalculation()
        // ====================================================

    }
}
