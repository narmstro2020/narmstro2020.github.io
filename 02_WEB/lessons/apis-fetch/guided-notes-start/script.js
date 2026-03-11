/* ── Warm-Up Data ── */
const roster = [
    {name: "Amara Johnson", gpa: 3.8},
    {name: "Devon Carter", gpa: 3.2},
    {name: "Sofia Reyes", gpa: 3.9},
    {name: "Marcus Lee", gpa: 2.7},
    {name: "Priya Patel", gpa: 4.0},
    {name: "Tyler Brooks", gpa: 3.5},
    {name: "Leila Hassan", gpa: 3.6},
    {name: "Caleb Wright", gpa: 2.9}
];

// ── TODO 1 ──────────────────────────────────────
// Select #warmup-btn and add a 'click' listener.
// Use .filter() to find students with gpa >= 3.5.
// Update #warmup-result with the count.
// Example: "4 students with GPA ≥ 3.5"
// ────────────────────────────────────────────────


// ── TODO 2 ──────────────────────────────────────
// Select #warmup-search and add an 'input' listener.
// Filter roster where name.toLowerCase().includes(term).
// Show: "X students match '[term]'"
// ────────────────────────────────────────────────


// ── TODO 3 ──────────────────────────────────────
// In comments below, write the two key differences
// between JSON and a JS object literal:
//   1.
//   2.
// ────────────────────────────────────────────────


// ── TODO 4 ──────────────────────────────────────
// Refer to the filled-in blanks in your notes above.
// The completed syntax should be:
//   fetch("url")
//     .then(response => response.json())
//     .then(data => { console.log(data); })
//     .catch(err => { console.error(err); });
// ────────────────────────────────────────────────


// ── TODO 5 ──────────────────────────────────────
// Label each Promise state in the comments:
//   a) fetch("...") was just called, server hasn't responded yet
//      State: ___________
//   b) The server returned data and .then() ran
//      State: ___________
//   c) The URL was wrong, no response came back
//      State: ___________
// ────────────────────────────────────────────────


// ── TODO 6 ──────────────────────────────────────
// Write a fetch() call to:
//   "https://jsonplaceholder.typicode.com/users"
// Chain .then(res => res.json()).then(data => console.log(data))
// Open DevTools (F12) → Console tab to see the result.
// ────────────────────────────────────────────────


// ── TODO 7 ──────────────────────────────────────
// Select #fetch-btn and add a click listener.
// When clicked:
//   1. Set #fetch-status text to "Loading..."
//   2. fetch("https://jsonplaceholder.typicode.com/users")
//   3. In second .then(), loop users with forEach
//   4. Build HTML and set #user-grid innerHTML
//      Each card should show name and email.
// ────────────────────────────────────────────────


// ── TODO 8 ──────────────────────────────────────
// After rendering, update #fetch-status to:
//   "Loaded X users"   (use data.length or users.length)
// ────────────────────────────────────────────────


// ── TODO 9 ──────────────────────────────────────
// After rendering cards:
//   1. document.querySelector('#json-viewer').textContent
//        = JSON.stringify(data, null, 2)
//   2. Add class "open" to #json-viewer
//   3. Add class "open" to #json-toggle
// ────────────────────────────────────────────────


// ── TODO 10 ─────────────────────────────────────
// Add .catch(err => { ... }) to your fetch chain.
// Inside it:
//   1. Set #fetch-status text = "Error: " + err.message
//   2. Set its style.color = "#f07178"
//   3. Add class "open" to #error-display
//   4. Set #error-display.textContent = err.message
// ────────────────────────────────────────────────


// ── TODO 11 ─────────────────────────────────────
// Test your error handler:
//   Change the URL to "https://fake.invalid/users"
//   Click Fetch — confirm error appears.
//   Then restore the real URL.
// (No code needed here — just follow the steps.)
// ────────────────────────────────────────────────


// ── TODO 12 ─────────────────────────────────────
// Update your click handler to read the dropdown:
//   const endpoint = document.querySelector('#fetch-select').value;
// Build the URL as:
//   "https://jsonplaceholder.typicode.com" + endpoint
// ────────────────────────────────────────────────


// ── TODO 13 ─────────────────────────────────────
// Inside your .then(data => { ... }), use if/else if
// to render different content per endpoint:
//   /users → name + email
//   /posts → title.slice(0, 50) + body.slice(0, 80)
//   /todos → title + (completed ? "✓ done" : "○ pending")
// ────────────────────────────────────────────────


// ── TODO 14 (BONUS) ─────────────────────────────
// Add a number input and button to the output panel.
// On click, fetch /users/{id} (single object, not array).
// Render: name, email, phone, website, company.name.
// ────────────────────────────────────────────────


/* ── JSON toggle (wired for you) ── */
document.querySelector('#json-toggle').addEventListener('click', () => {
    const viewer = document.querySelector('#json-viewer');
    const toggle = document.querySelector('#json-toggle');
    viewer.classList.toggle('open');
    toggle.textContent = viewer.classList.contains('open')
        ? '▴ hide raw JSON'
        : '▾ show raw JSON';
});