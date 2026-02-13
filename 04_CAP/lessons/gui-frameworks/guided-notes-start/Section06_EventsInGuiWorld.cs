// ============================================
// SECTION 6: Events in the GUI World
// ============================================
// This section is READ & ANNOTATE — study the code, then complete the TODOs.

// --- The Key Insight ---
// GUI events work EXACTLY like the events from Unit 5:
//   publisher.Event += subscriber_handler;
//
// The "publisher" is a control (Button, Slider, TextBox)
// The "event" is what happened (Click, ValueChanged, TextChanged)
// The "handler" is your method or lambda

// --- Two Ways to Wire Events ---

// WAY 1: In XAML (declarative)
// ─────────────────────────────
// <Button Content="Go" Click="OnGoClicked"/>
//
// // In code-behind, you define the matching method:
// private void OnGoClicked(object sender, RoutedEventArgs e)
// {
//     output.Text = "You clicked Go!";
// }
//
// Pros: Easy to see in XAML which control has which handler
// Cons: Must match the method name exactly

// WAY 2: In C# code-behind (programmatic)
// ────────────────────────────────────────
// // In XAML, just give the button a name:
// // <Button x:Name="goBtn" Content="Go"/>
//
// // In C# constructor, wire with += :
// public MainWindow()
// {
//     InitializeComponent();
//
//     // Lambda — concise, great for simple handlers
//     goBtn.Click += (s, e) => output.Text = "Clicked!";
//
//     // Or a named method — better for complex logic
//     goBtn.Click += HandleGoClick;
// }
//
// private void HandleGoClick(object sender, RoutedEventArgs e)
// {
//     // Complex logic here
//     output.Text = $"Clicked at {DateTime.Now:T}";
// }

// --- Common Event Signatures ---
//
// Button Click:
//   void Handler(object sender, RoutedEventArgs e)
//
// TextBox TextChanged:
//   void Handler(object sender, TextChangedEventArgs e)
//
// Slider ValueChanged:
//   void Handler(object sender, RangeBaseValueChangedEventArgs e)
//   // e.NewValue = the new slider value
//   // e.OldValue = the previous slider value
//
// ComboBox SelectionChanged:
//   void Handler(object sender, SelectionChangedEventArgs e)
//   // e.AddedItems[0] = the newly selected item
//
// ToggleSwitch Toggled:
//   void Handler(object sender, RoutedEventArgs e)
//   // Cast sender: var toggle = (ToggleSwitch)sender;
//   // toggle.IsOn → true or false

// --- The sender Parameter ---
//
// 'sender' is the control that FIRED the event.
// You can share one handler across multiple controls:
//
// <Button x:Name="btn1" Content="One" Click="OnAnyClick"/>
// <Button x:Name="btn2" Content="Two" Click="OnAnyClick"/>
// <Button x:Name="btn3" Content="Three" Click="OnAnyClick"/>
//
// private void OnAnyClick(object sender, RoutedEventArgs e)
// {
//     var btn = (Button)sender;  // Cast to access Button properties
//     output.Text = $"You clicked: {btn.Content}";
// }

// --- Live Updates with ValueChanged ---
//
// // The slider fires ValueChanged on EVERY tick:
// tipSlider.ValueChanged += (s, e) =>
// {
//     percentLabel.Text = $"{e.NewValue:F0}%";
//     RecalculateTip();  // Update the result in real-time
// };


// ==========================================================
// TODO 1: You have a form with 5 buttons that each represent
//         a color (Red, Blue, Green, Yellow, Purple). You want
//         ONE handler that changes a TextBlock's text to show
//         which color was clicked. Write the XAML for one of
//         the buttons AND the C# handler method signature.
// ==========================================================
// XAML for one button:
//
//
// C# handler:
//
//
//

// ==========================================================
// TODO 2: For the Slider's ValueChanged event, the EventArgs
//         type is RangeBaseValueChangedEventArgs. It has two
//         useful properties: NewValue and OldValue. Write a
//         lambda that subscribes to a slider's ValueChanged
//         and displays: "Changed from X to Y" in a TextBlock
//         called 'statusText'.
// ==========================================================
// YOUR ANSWER (lambda):
//
//
//

// ==========================================================
// TODO 3: Compare these two approaches. Which do you prefer
//         and why? Is there a situation where one is clearly
//         better than the other?
//
//         Approach A (XAML):  Click="OnGoClicked"
//         Approach B (C#):    goBtn.Click += (s, e) => { };
// ==========================================================
// YOUR ANSWER:
//
//
//
