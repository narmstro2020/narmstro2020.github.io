// ── Intercept console.log to show output in panel ──
const output = document.getElementById('output');
const _log = console.log;
console.log = function (...args) {
    _log(...args);
    const line = document.createElement('div');
    line.textContent = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    output.insertBefore(line, output.querySelector('.render-zone'));
};

// ═══════════════════════════════════════════
// WARM-UP: Loops Review (TODOs 1–2)
// ═══════════════════════════════════════════
console.log('── Warm-Up ──');

// TODO 1: Write a for loop that counts from 1 to 5
// YOUR CODE HERE

const fruits = ['apple', 'banana', 'cherry'];
// TODO 2: for...of loop — log each fruit
// YOUR CODE HERE


// ═══════════════════════════════════════════
// SECTION 1: Array Basics (TODOs 3–5)
// ═══════════════════════════════════════════
console.log('── Section 1: Array Basics ──');

// TODO 3: Declare an array of 3 colors
const colors = /* YOUR CODE HERE */;

// TODO 4: Log the first color (index 0)
console.log(/* YOUR CODE HERE */);

// TODO 5: Log the array's length
console.log(/* YOUR CODE HERE */);


// ═══════════════════════════════════════════
// SECTION 2: Mutating Arrays (TODOs 6–8)
// ═══════════════════════════════════════════
console.log('── Section 2: Mutating Arrays ──');

const nums = [10, 20, 30];

// TODO 6: Add 40 to the end using push
// YOUR CODE HERE

// TODO 7: Remove the last item using pop — store in removed
const removed = /* YOUR CODE HERE */;
console.log('Removed:', removed);

// TODO 8: Remove the first item using shift — store in first
const first = /* YOUR CODE HERE */;
console.log('First was:', first);


// ═══════════════════════════════════════════
// SECTION 3: Array Methods (TODOs 9–11)
// ═══════════════════════════════════════════
console.log('── Section 3: forEach / map / filter ──');

const scores = [88, 72, 95, 61, 83];

// TODO 9: forEach — log each score
scores.forEach(/* YOUR CODE HERE */);

// TODO 10: map — each score + 5 bonus points
const boosted = scores.map(/* YOUR CODE HERE */);
console.log('Boosted:', boosted);

// TODO 11: filter — only scores >= 80
const passing = scores.filter(/* YOUR CODE HERE */);
console.log('Passing:', passing);


// ═══════════════════════════════════════════
// SECTION 4: Objects (TODOs 12–14)
// ═══════════════════════════════════════════
console.log('── Section 4: Objects ──');

// TODO 12: Create a student object with name, grade, isEnrolled
const student = /* YOUR CODE HERE */;

// TODO 13: Log the student's name using dot notation
console.log(/* YOUR CODE HERE */);

// TODO 14: Add a 'school' property
// YOUR CODE HERE

console.log(student);


// ═══════════════════════════════════════════
// SECTION 5: Arrays of Objects (TODOs 15–16)
// ═══════════════════════════════════════════
console.log('── Section 5: Arrays of Objects ──');

const students = [
    {name: 'Aaliyah', grade: 92, club: 'Robotics'},
    {name: 'Marcus', grade: 78, club: 'Chess'},
    {name: 'Priya', grade: 95, club: 'Robotics'},
    {name: 'Devon', grade: 85, club: 'Art'},
];

// TODO 15: forEach — log each student's name and grade
students.forEach(/* YOUR CODE HERE */);

// TODO 16: filter — only Robotics club students
const robotics = students.filter(/* YOUR CODE HERE */);
console.log('Robotics:', robotics);


// ═══════════════════════════════════════════
// SECTION 6: DOM Rendering (TODOs 17–18)
// ═══════════════════════════════════════════
console.log('── Section 6: DOM Cards ──');

// TODO 17: Select #card-list
const cardList = /* YOUR CODE HERE */;

// TODO 18: forEach over students — create .card divs
students.forEach(/* YOUR CODE HERE */);


// ═══════════════════════════════════════════
// BONUS (TODO 19)
// ═══════════════════════════════════════════

// TODO 19 (BONUS): map to names array → join → log roster
// YOUR CODE HERE