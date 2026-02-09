// ============================================
// SECTION 6: Introduction to Events
// ============================================

public class TemperatureSensor
{
    // 1. Declare delegate type
    public delegate void TempChangedHandler(double newTemp);
    
    // 2. Declare event using the delegate
    public event TempChangedHandler OnTemperatureChanged;
    
    private double _currentTemp;
    
    // 3. Method that fires the event
    public void SetTemperature(double temp)
    {
        _currentTemp = temp;
        Console.WriteLine($"\n🌡️ Temperature set to {temp}°F");
        
        // Fire the event (null-safe)
        OnTemperatureChanged?.Invoke(temp);
    }
}

public class Section06_IntroToEvents
{
    public static void Run()
    {
        Console.WriteLine("=== Section 6: Introduction to Events ===");
        
        var sensor = new TemperatureSensor();
        
        // Subscribe with a named method
        sensor.OnTemperatureChanged += DisplayTemp;
        
        // Subscribe with a lambda
        sensor.OnTemperatureChanged += (temp) =>
        {
            if (temp > 100)
                Console.WriteLine("🔥 WARNING: Overheating!");
        };
        
        sensor.SetTemperature(72);
        sensor.SetTemperature(105);
        
        // These would NOT compile from outside the class:
        // sensor.OnTemperatureChanged = null;        // ❌ Can't replace
        // sensor.OnTemperatureChanged(99);            // ❌ Can't invoke
        // sensor.OnTemperatureChanged?.Invoke(99);    // ❌ Can't invoke
        
        // TODO 1: Subscribe a lambda to OnTemperatureChanged that prints
        //         "❄️ WARNING: Freezing!" if the temperature drops below 32
        
        // TODO 2: After the existing SetTemperature calls, add:
        //         sensor.SetTemperature(28) to test your freezing warning
        
        // TODO 3: Uncomment the three "would NOT compile" lines one at a time
        //         and observe the compiler error. Then re-comment them.
    }
    
    static void DisplayTemp(double temp)
    {
        Console.WriteLine($"📊 Dashboard updated: {temp}°F");
    }
}
