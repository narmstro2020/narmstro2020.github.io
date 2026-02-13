// ============================================
// SECTION 1: Why GUI Frameworks?
// ============================================
// This section is READ & ANNOTATE — study the code, then complete the TODOs.

// --- Console App Pattern (what you've been doing) ---
// 
// Console.Write("Enter your name: ");
// string name = Console.ReadLine();          // BLOCKS here until user types
// Console.Write("Enter your age: ");
// string age = Console.ReadLine();           // BLOCKS again
// Console.WriteLine($"Hello {name}, age {age}!");
//
// Key traits:
//   - Sequential: one input at a time, in order
//   - Blocking: program waits for each ReadLine()
//   - Text only: no buttons, sliders, or visual controls

// --- GUI App Pattern (what you're learning) ---
//
// // In XAML (markup):
// // <TextBox x:Name="nameBox" PlaceholderText="Enter name"/>
// // <TextBox x:Name="ageBox" PlaceholderText="Enter age"/>
// // <Button Content="Submit" Click="OnSubmit"/>
// // <TextBlock x:Name="output"/>
//
// // In C# (code-behind):
// private void OnSubmit(object sender, RoutedEventArgs e)
// {
//     output.Text = $"Hello {nameBox.Text}, age {ageBox.Text}!";
// }
//
// Key traits:
//   - Event-driven: code runs when the user takes an action
//   - Non-blocking: all inputs are visible and usable at once
//   - Visual: buttons, text fields, sliders, dropdowns, etc.

// --- The Connection: Events & Delegates ---
//
// Remember from Unit 5:
//   public event EventHandler Click;
//   button.Click += (sender, e) => { /* handler */ };
//
// GUI frameworks use this EXACT pattern:
//   1. Controls expose events (Click, TextChanged, ValueChanged)
//   2. You subscribe with += (lambda or named method)
//   3. The framework calls your handler when the user interacts


// ==========================================================
// TODO 1: In your own words, explain the difference between
//         "sequential/blocking" (console) and "event-driven"
//         (GUI) programming. Write 2-3 sentences below.
// ==========================================================
// YOUR ANSWER:
//
//
//

// ==========================================================
// TODO 2: Look at the GUI code pattern above. Identify which
//         line uses the delegate/event pattern from Unit 5.
//         Copy that line below and explain what happens when
//         the user clicks the button.
// ==========================================================
// YOUR ANSWER:
//
//
//
