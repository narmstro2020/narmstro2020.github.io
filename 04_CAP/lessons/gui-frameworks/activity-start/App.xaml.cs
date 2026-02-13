// ============================================
// TIP CALCULATOR — App.xaml.cs
// App startup — creates and activates the window.
// You do NOT need to modify this file.
// ============================================

using Microsoft.UI.Xaml;

namespace TipCalculator;

public partial class App : Application
{
    private Window? _window;

    public App()
    {
        this.InitializeComponent();
    }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        _window = new MainWindow();
        _window.Activate();
    }
}
