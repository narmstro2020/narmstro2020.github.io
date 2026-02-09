// ============================================
// HomeHub.cs — The Central Event Publisher
// ============================================
// The HomeHub is the "brain" of the smart home.
// It defines delegate types, events, and methods
// that simulate things happening in the home.
// ============================================

public class HomeHub
{
    // ── Delegate Declarations ──────────────────────────
    public delegate void TemperatureHandler(double temperature);
    public delegate void MotionHandler(string location);
    public delegate void AlarmHandler(string zone);
    public delegate void PersonHandler(string personName);
    public delegate void TimeHandler(string currentTime);

    // ── Event Declarations ─────────────────────────────
    // TODO: Declare events using the delegates above
    // Each event should be public so devices can subscribe
    //
    // public event TemperatureHandler OnTemperatureChanged;
    // public event MotionHandler OnMotionDetected;
    // public event AlarmHandler OnAlarmTriggered;
    // public event PersonHandler OnPersonArrived;
    // public event PersonHandler OnPersonLeft;
    // public event TimeHandler OnTimeChanged;


    // ── Simulation Methods ─────────────────────────────
    // These methods simulate things happening and fire the appropriate events

    public void SimulateTemperatureChange(double newTemp)
    {
        Console.WriteLine($"\n  🌡️ Temperature changed to {newTemp}°F");
        // TODO: Fire OnTemperatureChanged event (null-safe with ?.Invoke)
    }

    public void SimulateMotion(string location)
    {
        Console.WriteLine($"\n  👀 Motion detected in: {location}");
        // TODO: Fire OnMotionDetected event (null-safe)
    }

    public void SimulateAlarm(string zone)
    {
        Console.WriteLine($"\n  🚨 ALARM triggered at: {zone}");
        // TODO: Fire OnAlarmTriggered event (null-safe)
    }

    public void SimulatePersonArrival(string name)
    {
        Console.WriteLine($"\n  🚶 {name} arrived home");
        // TODO: Fire OnPersonArrived event (null-safe)
    }

    public void SimulatePersonDeparture(string name)
    {
        Console.WriteLine($"\n  🚶 {name} left home");
        // TODO: Fire OnPersonLeft event (null-safe)
    }

    public void SimulateTimeChange(string time)
    {
        Console.WriteLine($"\n  🕐 Time is now: {time}");
        // TODO: Fire OnTimeChanged event (null-safe)
    }
}
