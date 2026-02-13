// ============================================
// SECTION 4: WinUI 3 — Modern Windows
// ============================================

public class Section04_WinUI3ModernWindows
{
    // ── WHAT IS WINUI 3? ─────────────────────────────
    // WinUI 3 (2021) is Microsoft's CURRENT recommended
    // framework for new Windows desktop applications.
    //
    // It builds on the XAML foundation from WPF but adds:
    //   - Fluent Design (Windows 11 look and feel)
    //   - Windows App SDK (decoupled from OS updates)
    //   - Modern controls with built-in accessibility
    //   - Better performance and touch support

    // TODO 1: WinUI 3 is "decoupled from OS updates." In your own words,
    //         explain what this means for developers. Why is it useful?
    //         (Hint: think about what happens when a new Windows version ships)
    //
    // Your answer:


    // ── EVOLUTION TIMELINE ───────────────────────────
    //
    //   2002  WinForms     → C# code only, pixel layout
    //   2006  WPF          → XAML + C#, flexible layout, GPU rendering
    //   2012  UWP          → Modern but restricted to Windows Store
    //   2021  WinUI 3      → Best of WPF + modern design, no restrictions
    //
    // UWP (Universal Windows Platform) was an attempt between WPF and WinUI 3,
    // but it had too many limitations (couldn't access all Windows APIs,
    // required the Windows Store). WinUI 3 removed those restrictions.

    // TODO 2: Why did UWP fail to replace WPF? What restrictions did it have
    //         that WinUI 3 solved?
    //
    // Your answer:


    // ── WHAT'S THE SAME AS WPF ──────────────────────
    //
    //   ✅ XAML markup for UI layout
    //   ✅ Code-behind (.xaml.cs) for event handling
    //   ✅ Layout panels: StackPanel, Grid, etc.
    //   ✅ Event wiring: Click="Handler" or control.Click += handler
    //   ✅ x:Name to reference controls from C#
    //   ✅ Partial classes for file splitting

    // ── WHAT'S DIFFERENT FROM WPF ───────────────────
    //
    //   WPF Namespace:    System.Windows
    //   WinUI Namespace:  Microsoft.UI.Xaml
    //
    //   WPF Base Class:   System.Windows.Window
    //   WinUI Base Class: Microsoft.UI.Xaml.Window
    //
    //   WPF EventArgs:    System.Windows.RoutedEventArgs
    //   WinUI EventArgs:  Microsoft.UI.Xaml.RoutedEventArgs

    // TODO 3: If you learned WPF first and then switched to WinUI 3,
    //         what would change in your code? What would stay the same?
    //
    // Your answer:


    // ── WHY WINUI 3 FOR THIS CLASS ──────────────────
    //
    //   1. It's Microsoft's recommended path for new apps
    //   2. XAML skills transfer to WPF, .NET MAUI, and Avalonia
    //   3. Uses events & delegates from Unit 5
    //   4. Produces professional, modern-looking apps
    //   5. Available on .NET 8+ (what we already use)

    // TODO 4: Look at reason #2. Three other frameworks are mentioned
    //         that also use XAML. Research one of them briefly.
    //         What is it used for? (e.g., mobile, cross-platform, etc.)
    //
    // Framework you chose:
    // What it's used for:

}
