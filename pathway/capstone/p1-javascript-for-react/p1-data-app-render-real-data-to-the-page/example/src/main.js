// main.js — fetch, then draw. No loading state and no error handling yet;
// that is the next work block, and today you will feel why they are needed.
import { loadQuakes } from "./api.js";
import { renderList } from "./render.js";

const output = document.querySelector("#output");

const quakes = await loadQuakes();
renderList(output, quakes);
