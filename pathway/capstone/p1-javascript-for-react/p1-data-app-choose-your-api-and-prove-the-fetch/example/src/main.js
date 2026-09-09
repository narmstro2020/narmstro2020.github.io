// main.js — today this proves one thing: the data arrives.
import { loadRaw } from "./api.js";

const output = document.querySelector("#output");

const data = await loadRaw();

// Look at this in the console FIRST. You cannot render a shape you have not seen.
console.log(data);

// And on the page, so you can see it without the console open.
output.textContent = JSON.stringify(data, null, 2).slice(0, 2000);
