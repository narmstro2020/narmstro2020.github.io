// ============================================
// SECTION 7: Patterns & Architecture
// ============================================

public class Section07_PatternsAndArchitecture
{
    // ── PARTIAL CLASSES ──────────────────────────────
    // The "partial" keyword lets you split ONE class across
    // MULTIPLE files. The compiler merges them at build time.
    //
    //   // File 1: MainWindow.xaml.cs (YOUR code)
    //   public partial class MainWindow : Window
    //   {
    //       private void CalcButton_Click(object s, RoutedEventArgs e)
    //       {
    //           // your event handler logic
    //       }
    //   }
    //
    //   // File 2: MainWindow.g.cs (AUTO-GENERATED from XAML)
    //   public partial class MainWindow : Window
    //   {
    //       private TextBox txtName;     // from x:Name="txtName"
    //       private Button calcButton;   // from x:Name="calcButton"
    //
    //       private void InitializeComponent()
    //       {
    //           // loads and parses the XAML, creates all controls
    //       }
    //   }
    //
    // Both files define the SAME class. The compiler combines them.
    // You NEVER edit the .g.cs file — it's regenerated every build.

    // TODO 1: In your own words, explain why partial classes are essential
    //         for the XAML + code-behind pattern. What would happen if C#
    //         didn't support partial classes?
    //
    // Your answer:


    // ── PROJECT FILE STRUCTURE ───────────────────────
    //
    //   MyApp/
    //   ├── App.xaml                  → App-level resources & themes
    //   ├── App.xaml.cs               → App startup (creates the window)
    //   ├── MainWindow.xaml           → UI layout (XAML)
    //   ├── MainWindow.xaml.cs        → Event handlers (C#)
    //   ├── TipCalculator.cs          → Business logic (pure C# class)
    //   ├── Package.appxmanifest      → App metadata (name, icon)
    //   └── MyApp.csproj              → Project config & NuGet packages

    // TODO 2: Which file would you edit to...
    //         a) Change the text on a button?
    //         b) Add logic for when a button is clicked?
    //         c) Add a method to calculate sales tax?
    //         d) Change the app's display name?
    //
    // Your answers:
    //   a)
    //   b)
    //   c)
    //   d)


    // ── THE CODE-BEHIND PATTERN ─────────────────────
    //
    // The approach we'll use in this class:
    //
    //   .xaml          → Define the UI layout
    //   .xaml.cs       → Handle events, update controls
    //   Model.cs       → Business logic (calculations, validation)
    //
    // Example flow:
    //
    //   1. User types "50" in a TextBox and clicks "Calculate"
    //   2. XAML fires Button.Click event
    //   3. Code-behind handler reads TextBox.Text
    //   4. Code-behind calls TipCalculator.Calculate(50, 0.18)
    //   5. Code-behind updates TextBlock.Text with the result
    //
    // The business logic class (TipCalculator) knows NOTHING
    // about buttons, text boxes, or UI. It just does math.

    // TODO 3: Why is it a good practice to keep business logic (like
    //         TipCalculator) separate from the code-behind? What problems
    //         could arise if you put ALL your logic in the .xaml.cs file?
    //
    // Your answer:


    // ── INITIALIZECOMPONENT() ────────────────────────
    //
    // Every code-behind constructor MUST call InitializeComponent():
    //
    //   public MainWindow()
    //   {
    //       this.InitializeComponent();  // ← ALWAYS first!
    //
    //       // AFTER this line, x:Name controls are available
    //       calcButton.Click += (s, e) => { ... };
    //   }
    //
    // InitializeComponent() is defined in the auto-generated .g.cs file.
    // It reads the XAML, creates all controls, and assigns x:Name fields.
    // If you try to use a control BEFORE this call, you'll get a
    // NullReferenceException because the controls don't exist yet!

    // TODO 4: A student writes this code and gets a NullReferenceException.
    //         What's wrong?
    //
    //   public MainWindow()
    //   {
    //       myButton.Click += (s, e) => { };  // crashes here!
    //       this.InitializeComponent();
    //   }
    //
    // Your answer:

}
