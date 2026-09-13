// main.js — wires the pieces together. This file makes decisions; the others do not.
import { loadQuakes, describeError } from "./api.js";
import { applyControls, findQuake } from "./quakes.js";
import { renderLoading, renderError, renderControls, renderList, renderDetail } from "./render.js";

const output = document.querySelector("#output");

// ALL of the app's state, in one place. Everything on screen is a function of this.
const state = {
  quakes: [],                                        // what the API gave us, never mutated
  controls: { minMagnitude: 0, query: "", sortBy: "time" },
  selectedId: null,                                  // a detail view is open when this is set
};

async function load() {
  // The loading state goes up BEFORE the await, or nobody ever sees it.
  renderLoading(output);
  try {
    state.quakes = await loadQuakes();
    renderApp();
  } catch (err) {
    renderError(output, describeError(err));
    document.querySelector("#retry")?.addEventListener("click", load);
  }
}

/** Two regions: controls are drawn once, results are redrawn on every change. */
function renderApp() {
  output.innerHTML = `<section id="controls" class="controls"></section><section id="results"></section>`;
  renderControls(document.querySelector("#controls"), state.controls);
  renderResults();
}

function renderResults() {
  const results = document.querySelector("#results");
  const controls = document.querySelector("#controls");
  if (state.selectedId) {
    controls.hidden = true;
    renderDetail(results, findQuake(state.quakes, state.selectedId));
  } else {
    controls.hidden = false;
    renderList(results, applyControls(state.quakes, state.controls), { total: state.quakes.length });
  }
}

/** Read the three controls into state, then redraw only the results. */
function onControlsChanged() {
  state.controls = {
    minMagnitude: Number(document.querySelector("#min-magnitude").value) || 0,
    query: document.querySelector("#search").value,
    sortBy: document.querySelector("#sort").value,
  };
  renderResults();
}

// One listener on the container instead of one per row (event delegation):
// rows come and go with every re-render, the container does not.
output.addEventListener("input", (e) => {
  if (e.target.closest("#controls")) onControlsChanged();
});
output.addEventListener("click", (e) => {
  const open = e.target.closest("[data-id]");
  if (open) {
    state.selectedId = open.dataset.id;
    renderResults();
  } else if (e.target.id === "back") {
    state.selectedId = null;
    renderResults();
  }
});

load();
