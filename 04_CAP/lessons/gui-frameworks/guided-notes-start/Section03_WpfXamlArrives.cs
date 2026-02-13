// ============================================
// SECTION 3: WPF — XAML Arrives
// ============================================
// This section is READ & ANNOTATE — study the code, then complete the TODOs.

// --- What is WPF? ---
// Windows Presentation Foundation (2006) introduced XAML —
// a markup language that SEPARATES the UI from the logic.
// This was a revolutionary shift: designers could work on the
// XAML while developers worked on the C# code-behind.

// --- The Two Files ---
//
// FILE 1: MainWindow.xaml (the markup — WHAT the user sees)
// ─────────────────────────────────────────────────────────
// <Window x:Class="MyApp.MainWindow"
//         xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
//         Title="My WPF App" Height="300" Width="400">
//
//     <StackPanel Margin="20">
//         <TextBox x:Name="nameBox"
//                  PlaceholderText="Enter your name"/>
//
//         <Button Content="Submit"
//                 Click="OnSubmitClicked"
//                 Margin="0,10,0,0"/>
//
//         <TextBlock x:Name="output"
//                    FontSize="18"
//                    Margin="0,10,0,0"/>
//     </StackPanel>
// </Window>
//
//
// FILE 2: MainWindow.xaml.cs (the code-behind — WHAT HAPPENS)
// ─────────────────────────────────────────────────────────
// using System.Windows;
//
// namespace MyApp
// {
//     public partial class MainWindow : Window
//     {
//         public MainWindow()
//         {
//             InitializeComponent();  // Loads the XAML
//         }
//
//         private void OnSubmitClicked(object sender, RoutedEventArgs e)
//         {
//             output.Text = $"Hello, {nameBox.Text}!";
//         }
//     }
// }

// --- Key Concepts ---
//
// x:Name="nameBox"     → Creates a C# field you can access in code-behind
// Click="OnSubmitClicked" → Wires the Click event to a method by name
// partial class        → The class is split: XAML generates one part, you write the other
// InitializeComponent() → Loads and connects the XAML to the C# class
//
// Think of it like HTML + JavaScript:
//   XAML  ≈ HTML (structure & layout)
//   C#    ≈ JavaScript (behavior & logic)

// --- StackPanel ---
// Stacks its children vertically (default) or horizontally.
// Unlike WinForms' pixel positioning, controls automatically
// flow one after another. The panel handles the layout.

// --- Comparison: WinForms vs WPF ---
//
// WinForms:                           WPF:
// ─────────────────────               ─────────────────────
// btn.Location = new Point(20, 50);   <Button Margin="20"/>
// btn.Size = new Size(100, 30);       (auto-sized by panel)
// btn.Text = "Go";                    Content="Go"
// btn.Click += handler;               Click="handler"
// Controls.Add(btn);                  (auto — declared in XAML)


// ==========================================================
// TODO 1: The WPF example uses TWO files. In your own words,
//         explain what each file is responsible for and WHY
//         this separation is useful.
// ==========================================================
// YOUR ANSWER:
//
//
//

// ==========================================================
// TODO 2: What does the "partial" keyword do in
//         "public partial class MainWindow"? Why is it needed
//         when using XAML? (Hint: the XAML compiler generates
//         the other half of the class.)
// ==========================================================
// YOUR ANSWER:
//
//
//

// ==========================================================
// TODO 3: In the WPF XAML above, find: (a) the control that
//         lets users type text, (b) the attribute that wires
//         a click event, and (c) the attribute that gives a
//         control a C# accessible name. Write them below.
// ==========================================================
// YOUR ANSWER:
// (a) Control for text input:
// (b) Attribute for click event:
// (c) Attribute for C# accessible name:
//
