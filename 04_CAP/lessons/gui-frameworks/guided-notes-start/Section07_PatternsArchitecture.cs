// ============================================
// SECTION 7: Patterns & Architecture
// ============================================
// This section is READ & ANNOTATE — study the code, then complete the TODOs.

// --- Why Architecture Matters ---
// In a console app, you might put everything in Program.cs.
// In a GUI app, you quickly end up with:
//   • XAML layout (what the user sees)
//   • Event handlers (what happens on interaction)
//   • Business logic (calculations, rules, data)
//   • Data models (classes representing your data)
//
// Mixing all of this together creates a mess. Let's learn
// the patterns that keep GUI code organized.

// --- Pattern 1: Partial Classes ---
//
// The "partial" keyword lets ONE class live in MULTIPLE files.
// The compiler merges them into a single class at build time.
//
// Why WinUI/WPF needs this:
//   File 1: MainWindow.xaml → compiler generates MainWindow.g.cs
//           (creates fields for every x:Name control)
//   File 2: MainWindow.xaml.cs → YOU write event handlers here
//   Result: One MainWindow class with both XAML-generated code
//           AND your custom logic.
//
// // Auto-generated (you never edit this):
// partial class MainWindow
// {
//     TextBox nameBox;        // from x:Name="nameBox"
//     Button submitBtn;       // from x:Name="submitBtn"
//     TextBlock output;       // from x:Name="output"
//     void InitializeComponent() { /* loads XAML */ }
// }
//
// // Your code-behind (you write this):
// partial class MainWindow
// {
//     public MainWindow()
//     {
//         InitializeComponent();
//     }
//
//     private void OnSubmit(object sender, RoutedEventArgs e)
//     {
//         output.Text = $"Hello, {nameBox.Text}!";
//     }
// }

// --- Pattern 2: Separate Model Classes ---
//
// Keep business logic OUT of the code-behind.
// Create plain C# classes for calculations and data.
//
// // TipCalculator.cs — knows NOTHING about UI
// public class TipCalculator
// {
//     public decimal BillAmount { get; set; }
//     public double TipPercentage { get; set; }
//
//     public decimal TipAmount
//         => BillAmount * (decimal)(TipPercentage / 100);
//
//     public decimal Total
//         => BillAmount + TipAmount;
//
//     public decimal SplitAmount(int people)
//         => people > 0 ? Total / people : Total;
// }
//
// // MainWindow.xaml.cs — THIN code-behind, delegates to model
// private TipCalculator _calc = new();
//
// private void OnCalculate(object sender, RoutedEventArgs e)
// {
//     if (decimal.TryParse(billBox.Text, out decimal bill))
//     {
//         _calc.BillAmount = bill;
//         _calc.TipPercentage = tipSlider.Value;
//
//         tipOutput.Text = $"Tip: {_calc.TipAmount:C}";
//         totalOutput.Text = $"Total: {_calc.Total:C}";
//     }
// }
//
// Benefits:
// • Model class can be UNIT TESTED without any UI
// • Code-behind stays thin — just reads UI → calls model → updates UI
// • Model can be reused in a different UI (console, web, mobile)

// --- Pattern 3: MVVM (Preview) ---
//
// MVVM = Model - View - ViewModel
//
// Model:     Data + business rules (TipCalculator.cs)
// View:      XAML only (MainWindow.xaml)
// ViewModel: Bridge that exposes data to the View via data binding
//
// This is the professional pattern used in WinUI/WPF apps.
// We won't use it in this lesson, but knowing it exists helps
// you understand what to learn next.
//
// With MVVM, you can eliminate MOST code-behind entirely —
// the XAML binds directly to ViewModel properties.
// Example:  <TextBlock Text="{x:Bind ViewModel.TotalDisplay}"/>


// ==========================================================
// TODO 1: Why can't you just put all your logic directly in
//         the event handler? Give TWO reasons why separating
//         business logic into its own class is beneficial.
// ==========================================================
// YOUR ANSWER:
//
//
//

// ==========================================================
// TODO 2: Look at the TipCalculator model class above. If you
//         wanted to add a "round up to nearest dollar" feature,
//         where would you add it? Write the property below.
//         (Hint: Math.Ceiling can round up to the next whole number)
// ==========================================================
// YOUR ANSWER:
//
//
//

// ==========================================================
// TODO 3: The code-behind pattern for GUI apps follows three
//         steps: (1) Read from UI controls, (2) Call model
//         logic, (3) Write results back to UI controls.
//         In the OnCalculate method above, identify which
//         lines correspond to each step.
// ==========================================================
// YOUR ANSWER:
// Step 1 (Read from UI):
//
// Step 2 (Call model):
//
// Step 3 (Write to UI):
//
