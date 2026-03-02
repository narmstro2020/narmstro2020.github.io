// ============================================================
// 🔄 DYNAMIC LIST BUILDER — Loops + DOM Activity
// ============================================================
//
// WHAT YOU ALREADY KNOW:
//   ✅ Variables (let, const)
//   ✅ Functions
//   ✅ Template literals (`Hello ${name}`)
//   ✅ querySelector & addEventListener
//   ✅ Comparison & logical operators
//   ✅ if/else & switch
//   ✅ Loop syntax (for, while, for...of) ← from Day 1 notes
//
// YOUR MISSION:
//   Complete TODOs 1–8 (required) and 9–10 (bonus).
//   Each feature uses a DIFFERENT loop type.
//   Pattern: Select → Listen → Loop → Render
//

// ╔══════════════════════════════════════════════════════╗
// ║  FEATURE 1: Task List (for loop)                     ║
// ║  TODOs 1–3                                           ║
// ╚══════════════════════════════════════════════════════╝

// This array will store all the tasks the user adds.
const tasks = [];

// TODO 1: Use querySelector to select these 3 elements:
//   - The text input with id "task-input"       → store in taskInput
//   - The button with id "add-task-btn"         → store in addTaskBtn
//   - The output div with id "task-list"        → store in taskList
//   - The button with id "clear-tasks-btn"      → store in clearTasksBtn


// This function re-renders the ENTIRE task list using a for loop.
// It gets called every time a task is added or cleared.
function renderTasks() {
    // TODO 2: Use a FOR loop to build an HTML string of all tasks.
    //
    //   Step A: Create a variable called html and set it to ""  (empty string)
    //
    //   Step B: Write a for loop: for (let i = 0; i < tasks.length; i++)
    //     Inside the loop, ADD to the html string using +=
    //     Each task should look like this (use template literals):
    //
    //     <div class="list-item">
    //       <span><span class="num">${i + 1}.</span> ${tasks[i]}</span>
    //     </div>
    //
    //   Step C: After the loop, set taskList.innerHTML = html
    //
    //   Step D: Handle the empty state — if tasks.length === 0,
    //     set taskList.innerHTML to:
    //     '<span class="placeholder">Your tasks will appear here...</span>'


}

// TODO 3: Add TWO event listeners:
//
//   Listener A — addTaskBtn "click":
//     1. Get the value from taskInput → store in a variable called task
//     2. Check: if task is NOT an empty string (task !== "")
//        a. Push the task into the tasks array:  tasks.push(task)
//        b. Clear the input:  taskInput.value = ""
//        c. Call renderTasks()
//
//   Listener B — clearTasksBtn "click":
//     1. Set tasks.length = 0   (this empties the array)
//     2. Call renderTasks()


// ╔══════════════════════════════════════════════════════╗
// ║  FEATURE 2: Countdown Generator (while loop)         ║
// ║  TODOs 4–5                                           ║
// ╚══════════════════════════════════════════════════════╝

// TODO 4: Use querySelector to select these 3 elements:
//   - The number input with id "countdown-input"   → store in countdownInput
//   - The button with id "countdown-btn"           → store in countdownBtn
//   - The output div with id "countdown-display"   → store in countdownDisplay


// TODO 5: Add an event listener on countdownBtn for "click":
//
//   Inside the listener:
//     1. Get the value from countdownInput and convert to a number:
//        let num = Number(countdownInput.value);
//
//     2. Create a variable called html and set it to ""
//
//     3. Add the opening div:
//        html += '<div class="countdown-grid">';
//
//     4. Write a WHILE loop: while (num >= 1)
//        Inside the loop:
//          a. Pick a color based on the number:
//             - if num > 10  → color = "var(--purple)"
//             - else if num > 5  → color = "var(--blue)"
//             - else if num > 3  → color = "var(--yellow)"
//             - else → color = "var(--red)"
//
//          b. Add a tile to html using +=
//             `<div class="countdown-tile" style="background:${color}; color:var(--bg);">${num}</div>`
//
//          c. DECREASE num by 1:  num--
//          ⚠️ IMPORTANT: If you forget num--, the loop runs FOREVER!
//
//     5. After the while loop, close the grid:
//        html += '</div>';
//
//     6. Set countdownDisplay.innerHTML = html


// ╔══════════════════════════════════════════════════════╗
// ║  FEATURE 3: Student Roster (for...of)                ║
// ║  TODOs 6–8                                           ║
// ╚══════════════════════════════════════════════════════╝

// TODO 6: Create an array called students with at least 6 names.
//   Example: const students = ["Alice", "Bob", "Carlos", "Diana", "Ethan", "Fiona"];


// TODO 7: Use querySelector to select:
//   - The button with id "load-roster-btn"    → store in loadRosterBtn
//   - The output div with id "roster-display" → store in rosterDisplay


// TODO 8: Add an event listener on loadRosterBtn for "click":
//
//   Inside the listener:
//     1. Create a variable called html and set it to ""
//
//     2. Add the opening grid div:
//        html += '<div class="roster-grid">';
//
//     3. Write a FOR...OF loop: for (const student of students)
//        Inside the loop:
//          a. Get the first letter:  const initial = student[0]
//
//          b. Pick a background color using a simple pattern.
//             Here's one way — use the index of the letter in the alphabet:
//             const colors = ["var(--accent)", "var(--purple)", "var(--yellow)", "var(--red)", "var(--blue)"];
//             const colorIndex = student.charCodeAt(0) % colors.length;
//             const bgColor = colors[colorIndex];
//
//          c. Add a card to html using +=
//             `<div class="roster-card">
//                <div class="avatar" style="background:${bgColor}; color:var(--bg);">${initial}</div>
//                <div class="name">${student}</div>
//                <div class="role">Student</div>
//              </div>`
//
//     4. After the loop, close the grid:
//        html += '</div>';
//
//     5. Set rosterDisplay.innerHTML = html


// ╔══════════════════════════════════════════════════════╗
// ║  FEATURE 4 — BONUS: Filtered Emoji Gallery (forEach) ║
// ║  TODOs 9–10                                          ║
// ╚══════════════════════════════════════════════════════╝

// TODO 9: Create an array of objects called items.
//   Each object should have: { emoji: "...", name: "...", category: "..." }
//   Use categories: "food", "animal", "sport"
//   Include at least 9 items (3 per category). Example:
//
//   const items = [
//     { emoji: "🍕", name: "Pizza", category: "food" },
//     { emoji: "🍔", name: "Burger", category: "food" },
//     { emoji: "🌮", name: "Taco", category: "food" },
//     { emoji: "🐶", name: "Dog", category: "animal" },
//     { emoji: "🐱", name: "Cat", category: "animal" },
//     { emoji: "🐸", name: "Frog", category: "animal" },
//     { emoji: "⚽", name: "Soccer", category: "sport" },
//     { emoji: "🏀", name: "Basketball", category: "sport" },
//     { emoji: "🏈", name: "Football", category: "sport" },
//   ];


const galleryDisplay = document.querySelector("#gallery-display");
const filterBtns = document.querySelectorAll(".filter-btn");

// This function renders the gallery, filtered by category.
function renderGallery(filter) {
    // TODO 10: Use forEach to build the gallery HTML.
    //
    //   Step A: Create a variable called html set to ""
    //   Step B: Add: html += '<div class="roster-grid">';
    //
    //   Step C: Use items.forEach(function(item) { ... })
    //     Inside the forEach:
    //       - Check: if filter === "all" OR item.category === filter
    //         If true, add a card to html:
    //           `<div class="roster-card">
    //              <div style="font-size:2rem; margin-bottom:0.5rem;">${item.emoji}</div>
    //              <div class="name">${item.name}</div>
    //              <div class="role">${item.category}</div>
    //            </div>`
    //
    //   Step D: After forEach, close: html += '</div>';
    //   Step E: Set galleryDisplay.innerHTML = html


}

// This code handles the filter button clicks — already done for you!
filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
        // Remove "active" class from all buttons
        filterBtns.forEach(function (b) {
            b.classList.remove("active");
        });
        // Add "active" to the clicked button
        btn.classList.add("active");
        // Get the filter value from the data-filter attribute
        const filter = btn.getAttribute("data-filter");
        // Render the gallery with the selected filter
        renderGallery(filter);
    });
});

// Show all items when the page first loads
// (Will only work after you complete TODOs 9–10)
// renderGallery("all");