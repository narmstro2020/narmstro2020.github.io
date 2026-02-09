// ============================================
// 🏠 Smart Home Simulator — Activity
// Events & Delegates in C#
// ============================================
// 
// You are building a smart home system! The HomeHub is the central
// controller that fires events. Devices subscribe and respond.
//
// Files in this project:
//   Program.cs          <- You are here (entry point)
//   HomeHub.cs          <- The event publisher (central controller)
//   Thermostat.cs       <- Responds to temperature events
//   SmartLight.cs       <- Responds to motion and time events
//   SecurityCamera.cs   <- Responds to motion and alarm events
//   DoorLock.cs         <- Responds to arrival/departure events
//   SmartSpeaker.cs     <- Responds to ALL events (announcements)
// ============================================

Console.WriteLine("╔══════════════════════════════════════╗");
Console.WriteLine("║     🏠 Smart Home Simulator          ║");
Console.WriteLine("╚══════════════════════════════════════╝");
Console.WriteLine();

// Step 1: Create the HomeHub
var hub = new HomeHub();

// Step 2: Create devices
var thermostat = new Thermostat();
var lights = new SmartLight();
var camera = new SecurityCamera();
var doorLock = new DoorLock();
var speaker = new SmartSpeaker();

// Step 3: Subscribe devices to hub events
// TODO: Subscribe each device's handler methods to the appropriate hub events
// 
// Thermostat should respond to: OnTemperatureChanged
// SmartLight should respond to:  OnMotionDetected, OnTimeChanged
// SecurityCamera should respond to: OnMotionDetected, OnAlarmTriggered
// DoorLock should respond to: OnPersonArrived, OnPersonLeft
// SmartSpeaker should respond to: OnTemperatureChanged, OnMotionDetected,
//                                  OnAlarmTriggered, OnPersonArrived, OnPersonLeft
//
// Example: hub.OnTemperatureChanged += thermostat.HandleTemperature;


// Step 4: Simulate a day in the smart home!
Console.WriteLine("\n🌅 === MORNING ROUTINE ===");
// TODO: Call hub.SimulateTemperatureChange(68)
// TODO: Call hub.SimulateTimeChange("7:00 AM")
// TODO: Call hub.SimulatePersonArrival("Dad")

Console.WriteLine("\n☀️ === MIDDAY ===");
// TODO: Call hub.SimulateTemperatureChange(78)
// TODO: Call hub.SimulateMotion("Backyard")

Console.WriteLine("\n🌙 === EVENING ===");
// TODO: Call hub.SimulateTimeChange("9:00 PM")
// TODO: Call hub.SimulatePersonArrival("Mom")
// TODO: Call hub.SimulateMotion("Front Porch")

Console.WriteLine("\n🚨 === LATE NIGHT ===");
// TODO: Call hub.SimulateTemperatureChange(35)
// TODO: Call hub.SimulateAlarm("Back Door")
// TODO: Call hub.SimulatePersonDeparture("Intruder")

Console.WriteLine("\n✅ Simulation Complete!");
