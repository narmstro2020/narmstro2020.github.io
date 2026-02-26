// ─────────────────────────────────────────────
//  FEATURE 1: Grade Calculator
//  Skills: querySelector, addEventListener, .value, if/else chain
// ─────────────────────────────────────────────

// TODO 1: Select the elements you need
//   - Select #scoreInput and store in a variable called scoreInput
//   - Select #gradeBtn and store in a variable called gradeBtn
//   - Select #gradeOutput and store in a variable called gradeOutput


// TODO 2: Add a click event listener to gradeBtn
//   Inside the listener:
//   - Get the value from scoreInput and convert it to a number using Number()
//   - Store it in a variable called score


// TODO 3: Write an if/else chain to determine the letter grade
//   Inside the same listener (after TODO 2):
//   - If score >= 90 → set gradeOutput.textContent to "🅰️ A — Excellent!"
//   - Else if score >= 80 → "🅱️ B — Great job!"
//   - Else if score >= 70 → "©️ C — Not bad!"
//   - Else if score >= 60 → "📝 D — Needs improvement"
//   - Else → "❌ F — Let's study more"
//   Also add the class "active" to gradeOutput: gradeOutput.classList.add("active")


// ─────────────────────────────────────────────
//  FEATURE 2: Ticket Pricer
//  Skills: comparison operators, logical operators (&&), if/else
// ─────────────────────────────────────────────

// TODO 4: Select the elements you need
//   - Select #ageInput → ageInput
//   - Select #weekendSelect → weekendSelect
//   - Select #ticketBtn → ticketBtn
//   - Select #ticketOutput → ticketOutput


// TODO 5: Add a click event listener to ticketBtn
//   Inside the listener:
//   - Get the age from ageInput (convert to Number)
//   - Get the weekend value from weekendSelect (.value)
//   - Create a boolean: const isWeekend = weekend === "yes"


// TODO 6: Write the pricing logic using if/else with comparison + logical ops
//   Inside the same listener (after TODO 5):
//   - If age < 0 or age > 120 → "⚠️ Please enter a valid age"
//   - Else if age <= 5 → "🎈 Free! Kids 5 and under are free"
//   - Else if age <= 12 → child pricing:
//       If isWeekend → "🎟️ Child Weekend: $8.00"
//       Else → "🎟️ Child Weekday: $5.00"
//   - Else if age >= 65 → "👴 Senior Discount: $6.00"
//   - Else → adult pricing:
//       If isWeekend → "🎟️ Adult Weekend: $15.00"
//       Else → "🎟️ Adult Weekday: $10.00"
//   Don't forget: ticketOutput.classList.add("active")


// ─────────────────────────────────────────────
//  FEATURE 3: Day Planner
//  Skills: switch statement
// ─────────────────────────────────────────────

// TODO 7: Select the elements you need
//   - Select #daySelect → daySelect
//   - Select #dayBtn → dayBtn
//   - Select #dayOutput → dayOutput


// TODO 8: Add a click event listener to dayBtn
//   Inside the listener:
//   - Get the selected day from daySelect (.value)
//   - Write a switch statement on the day value:
//       case "monday"    → "💪 Chest day — hit the gym!"
//       case "tuesday"   → "📚 Study session — review your notes"
//       case "wednesday" → "🎮 Hump day — game night!"
//       case "thursday"  → "💻 Code day — work on a project"
//       case "friday"    → "🎉 TGIF — movie night!"
//       case "saturday"  → "🏀 Weekend vibes — play some sports"
//       case "sunday"    → "😴 Rest day — recharge for the week"
//       default          → "🤔 Pick a day first!"
//   Set dayOutput.textContent to your result
//   Don't forget: dayOutput.classList.add("active")


// ─────────────────────────────────────────────
//  FEATURE 4 (BONUS): Temperature Advisor
//  Skills: if/else + logical operators (&&)
// ─────────────────────────────────────────────

// TODO 9: Select the elements you need
//   - Select #tempInput → tempInput
//   - Select #rainSelect → rainSelect
//   - Select #tempBtn → tempBtn
//   - Select #tempOutput → tempOutput


// TODO 10 (BONUS): Add a click event listener to tempBtn
//   Inside the listener:
//   - Get the temp from tempInput (convert to Number)
//   - Get the rain value from rainSelect
//   - Create a boolean: const isRaining = rain === "yes"
//   - Write an if/else chain:
//       If temp >= 85 AND isRaining → "🌧️ Hot & rainy — umbrella + light clothes"
//       Else if temp >= 85 → "☀️ It's hot — shorts, sunscreen, stay hydrated!"
//       Else if temp >= 60 AND isRaining → "🌂 Mild & rainy — bring a jacket and umbrella"
//       Else if temp >= 60 → "😎 Perfect weather — t-shirt and jeans!"
//       Else if temp >= 32 AND isRaining → "🥶 Cold & rainy — heavy coat and umbrella!"
//       Else if temp >= 32 → "🧥 It's chilly — wear a warm coat"
//       Else → "❄️ Freezing! Bundle up — hat, gloves, heavy coat"
//   Set tempOutput.textContent and add "active" class