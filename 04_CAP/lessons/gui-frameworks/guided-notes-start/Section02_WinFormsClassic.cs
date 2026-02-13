// ============================================
// SECTION 2: WinForms — The Classic
// ============================================
// This section is READ & ANNOTATE — study the code, then complete the TODOs.

// --- What is WinForms? ---
// Windows Forms (2002) was the FIRST GUI framework for C#/.NET.
// Everything is written in C# — there is NO markup language.
// A visual designer lets you drag-and-drop controls, and it
// auto-generates C# code to position them.

// --- Creating a WinForms Window ---
//
// using System.Windows.Forms;
//
// public class MyForm : Form                  // Inherits from Form base class
// {
//     private TextBox nameBox;
//     private Button submitBtn;
//     private Label outputLabel;
//
//     public MyForm()
//     {
//         // Set up the window
//         this.Text = "My First WinForm";      // Window title
//         this.Size = new Size(400, 300);       // Fixed pixel size
//
//         // Create controls — all positioned with PIXELS
//         nameBox = new TextBox();
//         nameBox.Location = new Point(20, 20);  // x=20, y=20
//         nameBox.Size = new Size(200, 25);
//
//         submitBtn = new Button();
//         submitBtn.Text = "Submit";
//         submitBtn.Location = new Point(230, 20);
//         submitBtn.Size = new Size(80, 25);
//
//         outputLabel = new Label();
//         outputLabel.Location = new Point(20, 60);
//         outputLabel.Size = new Size(300, 25);
//
//         // Wire up the click event — same += pattern!
//         submitBtn.Click += (sender, e) =>
//         {
//             outputLabel.Text = $"Hello, {nameBox.Text}!";
//         };
//
//         // Add controls to the form
//         this.Controls.Add(nameBox);
//         this.Controls.Add(submitBtn);
//         this.Controls.Add(outputLabel);
//     }
// }

// --- Strengths ---
// • Very easy to learn — drag, drop, double-click to add handlers
// • Fast prototyping — visual designer generates positioning code
// • Huge community — tons of tutorials and StackOverflow answers
// • Still works in .NET 8+

// --- Limitations ---
// • Pixel-based layout — doesn't resize/scale well
// • UI and logic live in the same C# file (tightly coupled)
// • Dated look — native Windows controls, hard to customize
// • No markup language — can't easily separate design from code


// ==========================================================
// TODO 1: In the WinForms code above, find every line that
//         sets a control's position using pixels. How many
//         lines did you find? Why could this be a problem
//         on screens with different resolutions?
// ==========================================================
// YOUR ANSWER:
//
//
//

// ==========================================================
// TODO 2: The submitBtn.Click += line uses the SAME event
//         pattern from Unit 5. What is the delegate signature
//         that Click expects? (Hint: what are the two
//         parameters in the lambda?)
// ==========================================================
// YOUR ANSWER:
//
//
//

// ==========================================================
// TODO 3: Compare how WinForms creates a button vs. how you
//         might write it in XAML (see Section 3 preview):
//           C#:   var btn = new Button(); btn.Text = "Go";
//           XAML: <Button Content="Go"/>
//         Which approach separates the "what" from the "how"?
//         Write 1-2 sentences explaining your reasoning.
// ==========================================================
// YOUR ANSWER:
//
//
//
