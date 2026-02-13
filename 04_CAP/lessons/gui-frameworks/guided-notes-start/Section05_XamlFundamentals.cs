// ============================================
// SECTION 5: XAML Fundamentals
// ============================================
// This section is READ & ANNOTATE — study the code, then complete the TODOs.

// --- What is XAML? ---
// XAML (eXtensible Application Markup Language) is XML-based.
// Every tag creates a C# OBJECT. Every attribute sets a PROPERTY.
//
// XAML:  <Button Content="Go" Width="100"/>
// Same as C#: var btn = new Button();
//             btn.Content = "Go";
//             btn.Width = 100;

// --- Layout Panels ---
// Panels are CONTAINERS that arrange their children.
// You've seen StackPanel — here are the key panels:

// StackPanel — stacks children vertically (default) or horizontally
// ─────────────────────────────────────────────────────────────────
// <StackPanel Orientation="Vertical" Spacing="8">
//     <TextBlock Text="First"/>
//     <TextBlock Text="Second"/>
//     <TextBlock Text="Third"/>
// </StackPanel>
//
// Result:
// ┌──────────────┐
// │ First        │
// │ Second       │
// │ Third        │
// └──────────────┘

// <StackPanel Orientation="Horizontal" Spacing="8">
//     <Button Content="A"/>
//     <Button Content="B"/>
//     <Button Content="C"/>
// </StackPanel>
//
// Result:
// ┌───┬───┬───┐
// │ A │ B │ C │
// └───┴───┴───┘

// Grid — rows and columns (like a table)
// ─────────────────────────────────────────────────────────────────
// <Grid RowSpacing="8" ColumnSpacing="8">
//     <Grid.RowDefinitions>
//         <RowDefinition Height="Auto"/>      <!-- sizes to content -->
//         <RowDefinition Height="*"/>          <!-- fills remaining space -->
//     </Grid.RowDefinitions>
//     <Grid.ColumnDefinitions>
//         <ColumnDefinition Width="150"/>      <!-- fixed 150px -->
//         <ColumnDefinition Width="*"/>        <!-- fills remaining -->
//     </Grid.ColumnDefinitions>
//
//     <TextBlock Text="Name:" Grid.Row="0" Grid.Column="0"/>
//     <TextBox Grid.Row="0" Grid.Column="1"/>
//
//     <TextBlock Text="Notes:" Grid.Row="1" Grid.Column="0"/>
//     <TextBox Grid.Row="1" Grid.Column="1"
//              AcceptsReturn="True"/>
// </Grid>
//
// Result:
// ┌──────────┬─────────────────────┐
// │ Name:    │ [_______________]   │  ← Row 0 (Auto height)
// ├──────────┼─────────────────────┤
// │ Notes:   │ [               ]   │  ← Row 1 (* fills rest)
// │          │ [               ]   │
// └──────────┴─────────────────────┘
//   Col 0       Col 1
//  (150px)     (* fill)

// --- Sizing Keywords ---
// Auto  → size to fit the content
// *     → take all remaining space (proportional: 2* = twice as much as 1*)
// 150   → exactly 150 device-independent pixels

// --- Common Properties ---
//
// Margin="10"           → 10px space on ALL sides (outside the control)
// Margin="10,5"         → 10px left/right, 5px top/bottom
// Margin="10,5,10,20"   → left, top, right, bottom
//
// Padding="16,8"        → space INSIDE the control (like CSS padding)
//
// HorizontalAlignment   → Left, Center, Right, Stretch (default)
// VerticalAlignment     → Top, Center, Bottom, Stretch (default)
//
// Width="200"           → fixed width
// Height="Auto"         → height based on content (default)


// ==========================================================
// TODO 1: You need a layout with a label on the left and a
//         TextBox on the right, followed by a row of 3 buttons
//         underneath. Which panel(s) would you use? Sketch
//         out the XAML structure below (no need for full
//         syntax — just show nesting like):
//         <Grid>
//           <TextBlock .../>
//           <TextBox .../>
//           <StackPanel> ... </StackPanel>
//         </Grid>
// ==========================================================
// YOUR ANSWER:
//
//
//
//
//

// ==========================================================
// TODO 2: What's the difference between Height="Auto" and
//         Height="*"? When would you use each one?
// ==========================================================
// YOUR ANSWER:
//
//
//

// ==========================================================
// TODO 3: Translate this XAML to the equivalent C# code:
//         <TextBox x:Name="emailBox"
//                  PlaceholderText="Enter email"
//                  Margin="0,8,0,0"
//                  Width="300"/>
// ==========================================================
// YOUR ANSWER (C# equivalent):
//
//
//
//
