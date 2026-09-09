// main.js — wires the two together. This file makes decisions; the other two do not.
import { loadQuakes, describeError } from "./api.js";
import { renderLoading, renderError, renderList } from "./render.js";

const output = document.querySelector("#output");

async function show() {
  // The loading state goes up BEFORE the await, or nobody ever sees it.
  renderLoading(output);
  try {
    const quakes = await loadQuakes();
    renderList(output, quakes);
  } catch (err) {
    renderError(output, describeError(err));
    document.querySelector("#retry")?.addEventListener("click", show);
  }
}

show();
