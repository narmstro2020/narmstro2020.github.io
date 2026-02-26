// Override console.log to display in the output panel
const consoleOutput = document.querySelector('#console-output');
const originalLog = console.log;
console.log = function (...args) {
    originalLog.apply(console, args);
    const line = document.createElement('div');
    line.textContent = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    line.style.color = '#4ecca3';
    consoleOutput.appendChild(line);
};

// ═══════════════════════════════════════════
// WARM-UP: Mood Checker (TODOs 1–3)
// ═══════════════════════════════════════════

// TODO 1: Add a click event listener to moodBtn.
//         Inside, grab the value from moodInput,
//         convert it to lowercase, and store in a variable called "mood".
// YOUR CODE HERE

// TODO 2: Use a switch statement on "mood".
//         Cases: "happy" → "😊 Glad to hear it!"
//                "sad"   → "😢 Hope your day gets better!"
//                "angry" → "😤 Take a deep breath!"
//         Default:        → "🤔 Interesting mood!"
//         Store the result in a variable called "message".
// YOUR CODE HERE

// TODO 3: Set moodResult.textContent to the message.
// YOUR CODE HERE


// ═══════════════════════════════════════════
// SECTION 1: The for Loop (TODOs 4–6)
// ═══════════════════════════════════════════
console.log('── Section 1: for Loop ──');

// TODO 4: Write a for loop that counts from 1 to 5.
//         Inside the loop, log each number to the console.
// YOUR CODE HERE

// TODO 5: Write a for loop that counts DOWN from 10 to 1.
//         Log each number. Use i-- to decrement.
// YOUR CODE HERE

// TODO 6: Write a for loop that prints only EVEN numbers from 2 to 20.
//         Hint: start at 2 and increment by 2 (i += 2).
// YOUR CODE HERE


// ═══════════════════════════════════════════
// SECTION 2: The while Loop (TODOs 7–8)
// ═══════════════════════════════════════════
console.log('── Section 2: while Loop ──');

// TODO 7: Create a variable "countdown" set to 5.
//         Write a while loop that logs "T-minus {countdown}..."
//         and decrements countdown each iteration.
//         After the loop, log "🚀 Liftoff!"
// YOUR CODE HERE

// TODO 8: Simulated dice roller!
//         Create a variable "roll" set to 0 and "attempts" set to 0.
//         Use a while loop that keeps rolling until roll === 6.
//         Inside: roll = Math.ceil(Math.random() * 6); attempts++;
//         After the loop, log how many attempts it took.
// YOUR CODE HERE


// ═══════════════════════════════════════════
// SECTION 3: The for...of Loop (TODOs 9–10)
// ═══════════════════════════════════════════
console.log('── Section 3: for...of Loop ──');

const fruits = ["apple", "banana", "cherry", "dragonfruit"];

// TODO 9: Write a for...of loop that logs each fruit.
//         Use: for (const fruit of fruits) { ... }
// YOUR CODE HERE

const scores = [88, 92, 75, 100, 67];

// TODO 10: Use a for...of loop to calculate the TOTAL of all scores.
//          Create a variable "total" set to 0 before the loop.
//          Inside the loop, add each score to total.
//          After the loop, log the total AND the average (total / scores.length).
// YOUR CODE HERE


// ═══════════════════════════════════════════
// SECTION 4: Iterating Arrays by Index (TODO 11)
// ═══════════════════════════════════════════
console.log('── Section 4: Array by Index ──');

const students = ["Alice", "Bob", "Charlie", "Diana"];

// TODO 11: Write a for loop that logs each student WITH their number.
//          Output: "1. Alice", "2. Bob", "3. Charlie", "4. Diana"
//          Hint: use template literals and (i + 1) for the number.
// YOUR CODE HERE


// ═══════════════════════════════════════════
// SECTION 5: break and continue (TODOs 12–13)
// ═══════════════════════════════════════════
console.log('── Section 5: break & continue ──');

// TODO 12: Use a for loop (1 to 10). If i === 5, BREAK out of the loop.
//          Log each number. You should see 1, 2, 3, 4 only.
// YOUR CODE HERE

// TODO 13: Use a for loop (1 to 10). If i is even, CONTINUE (skip it).
//          Log each number. You should see 1, 3, 5, 7, 9 only.
// YOUR CODE HERE


// ═══════════════════════════════════════════
// SECTION 6: DOM Manipulation with Loops (TODOs 14–15)
// ═══════════════════════════════════════════
console.log('── Section 6: DOM + Loops ──');

const colors = ["Crimson", "SteelBlue", "MediumSeaGreen", "Gold", "Orchid"];
const colorList = document.querySelector('#color-list');

// TODO 14: Use a for...of loop to create a <div> for each color.
//          For each color:
//            1. Create a div:      const div = document.createElement('div');
//            2. Set its text:       div.textContent = color;
//            3. Set its background: div.style.backgroundColor = color;
//            4. Add a class:        div.classList.add('color-swatch');
//            5. Append to list:     colorList.appendChild(div);
// YOUR CODE HERE

const tasks = [
    {text: "Read chapter 5", done: true},
    {text: "Finish homework", done: false},
    {text: "Study for quiz", done: false},
    {text: "Clean desk", done: true},
];
const taskList = document.querySelector('#task-list');

// TODO 15: Use a for...of loop to create a <div> for each task.
//          For each task:
//            1. Create a div element.
//            2. Set textContent to task.text
//            3. Add class 'task-item'
//            4. If task.done is true, ALSO add class 'completed'
//            5. Append to taskList
// YOUR CODE HERE


// ═══════════════════════════════════════════
// BONUS: Nested Loops (TODO 16)
// ═══════════════════════════════════════════

// TODO 16 (BONUS): Create a multiplication table!
//   Use two nested for loops (outer: row 1-5, inner: col 1-5).
//   Build a string for each row: "1x1=1  1x2=2  1x3=3 ..."
//   Log each row.
// YOUR CODE HERE