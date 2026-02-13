// ============================================
// SECTION 4: WinUI 3 — Modern Windows
// ============================================
// This section is READ & ANNOTATE — study the code, then complete the TODOs.

// --- What is WinUI 3? ---
// WinUI 3 is Microsoft's CURRENT recommended framework for
// building Windows desktop apps. Released 2021, part of the
// Windows App SDK.
//
// Key point: WinUI 3 uses THE SAME XAML concepts as WPF.
// If you learn WinUI 3, you already understand WPF (and vice versa).

// --- WinUI 3 vs WPF: What Changed? ---
//
// 1. NAMESPACE:
//    WPF:   using System.Windows;
//    WinUI: using Microsoft.UI.Xaml;
//
// 2. DESIGN LANGUAGE:
//    WPF:   Classic Windows look (or custom styles)
//    WinUI: Fluent Design — rounded corners, acrylic, mica, dark mode
//
// 3. APP MODEL:
//    WPF:   Runs on .NET runtime alone
//    WinUI: Windows App SDK + .NET (more Windows integration)
//
// 4. THE XAML IS NEARLY IDENTICAL:
//    WPF:   <Button Content="Go" Click="OnGo"/>
//    WinUI: <Button Content="Go" Click="OnGo"/>     ← Same!

// --- WinUI 3 Example ---
//
// FILE: MainWindow.xaml
// ─────────────────────────────────────────────
// <Window x:Class="TipCalcApp.MainWindow"
//         xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
//         xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
//
//     <StackPanel Spacing="12" Padding="24">
//         <TextBlock Text="Tip Calculator"
//                    FontSize="28" FontWeight="Bold"/>
//
//         <TextBox x:Name="billBox"
//                  PlaceholderText="Enter bill amount"
//                  Header="Bill Amount"/>
//
//         <Slider x:Name="tipSlider"
//                 Minimum="0" Maximum="30" Value="18"
//                 Header="Tip Percentage"
//                 ValueChanged="OnTipChanged"/>
//
//         <TextBlock x:Name="tipOutput"
//                    FontSize="20"/>
//
//         <Button Content="Calculate"
//                 Click="OnCalculate"
//                 Style="{StaticResource AccentButtonStyle}"/>
//     </StackPanel>
// </Window>
//
//
// FILE: MainWindow.xaml.cs
// ─────────────────────────────────────────────
// using Microsoft.UI.Xaml;
// using Microsoft.UI.Xaml.Controls;
// using Microsoft.UI.Xaml.Controls.Primitives;
//
// namespace TipCalcApp
// {
//     public sealed partial class MainWindow : Window
//     {
//         public MainWindow()
//         {
//             this.InitializeComponent();
//         }
//
//         private void OnTipChanged(object sender,
//             RangeBaseValueChangedEventArgs e)
//         {
//             // Update the label as the slider moves
//             if (tipOutput != null)
//                 tipOutput.Text = $"Tip: {e.NewValue:F0}%";
//         }
//
//         private void OnCalculate(object sender, RoutedEventArgs e)
//         {
//             if (decimal.TryParse(billBox.Text, out decimal bill))
//             {
//                 decimal tip = bill * (decimal)(tipSlider.Value / 100);
//                 decimal total = bill + tip;
//                 tipOutput.Text = $"Tip: {tip:C} | Total: {total:C}";
//             }
//         }
//     }
// }

// --- WinUI-Specific Niceties ---
// • PlaceholderText — grayed-out hint text in empty TextBox
// • Header — built-in label above controls
// • Spacing — gap between children in StackPanel (no more Margin hacks!)
// • AccentButtonStyle — pre-built accent-colored button
// • Dark/light mode — automatic, based on system setting


// ==========================================================
// TODO 1: Compare the WinUI 3 XAML above with the WPF XAML
//         in Section 3. List THREE things that are the same
//         and TWO things that are different.
// ==========================================================
// SAME:
// 1.
// 2.
// 3.
//
// DIFFERENT:
// 1.
// 2.
//

// ==========================================================
// TODO 2: The Slider control has a ValueChanged event. What
//         is the delegate/event signature? (Look at the
//         OnTipChanged method parameters.) How does this
//         compare to Button's Click event signature?
// ==========================================================
// YOUR ANSWER:
//
//
//

// ==========================================================
// TODO 3: In the OnCalculate method, why does the code use
//         decimal.TryParse instead of decimal.Parse? What
//         would happen in a GUI app if Parse threw an exception
//         and it wasn't caught?
// ==========================================================
// YOUR ANSWER:
//
//
//
