// render.js — everything that touches the DOM lives here.
//
// Each function takes the element to write into. None of them fetch anything,
// and none of them decide anything. That separation is why they are testable.

export function renderLoading(el) {
  el.innerHTML = `<p class="state">Loading earthquakes…</p>`;
}

export function renderError(el, message) {
  el.innerHTML = `<p class="state error">${message}</p>
    <button id="retry" type="button">Try again</button>`;
}

export function renderEmpty(el) {
  el.innerHTML = `<p class="state">No earthquakes in the last day. Genuinely good news.</p>`;
}

/** Different from "no data": there is data, the controls just exclude all of it. */
export function renderNoMatches(el) {
  el.innerHTML = `<p class="state">Nothing matches. Lower the minimum magnitude or clear the search.</p>`;
}

/** Magnitude to a CSS class, so the styling is data-driven rather than hard-coded. */
export function severity(magnitude) {
  if (magnitude >= 5) return "major";
  if (magnitude >= 3) return "moderate";
  return "minor";
}

/**
 * The controls are rendered ONCE, at load. Re-rendering them on every
 * keystroke would replace the input the user is typing in, and the focus goes
 * with it. main.js re-renders the results only.
 */
export function renderControls(el, controls) {
  el.innerHTML = `
    <label>Min magnitude
      <input id="min-magnitude" type="number" min="0" max="10" step="0.5" value="${controls.minMagnitude}">
    </label>
    <label>Search place
      <input id="search" type="search" placeholder="e.g. Alaska" value="${controls.query}">
    </label>
    <label>Sort by
      <select id="sort">
        <option value="time" ${controls.sortBy === "time" ? "selected" : ""}>Newest first</option>
        <option value="magnitude" ${controls.sortBy === "magnitude" ? "selected" : ""}>Strongest first</option>
      </select>
    </label>`;
}

export function renderList(el, quakes, { total = quakes.length } = {}) {
  if (total === 0) return renderEmpty(el);
  if (quakes.length === 0) return renderNoMatches(el);
  el.innerHTML = `<ul class="quakes">` + quakes.map((q) => `
    <li class="quake ${severity(q.magnitude)}">
      <span class="mag">${q.magnitude?.toFixed(1) ?? "?"}</span>
      <button class="place" type="button" data-id="${q.id}">${q.place ?? "Unknown location"}</button>
      <time datetime="${new Date(q.time).toISOString()}">${new Date(q.time).toLocaleTimeString()}</time>
    </li>`).join("") + `</ul>
    <p class="count">${quakes.length} of ${total} in the last 24 hours</p>`;
}

/** Requirement 6: one item, in full. The Back button is handled by main.js. */
export function renderDetail(el, q) {
  if (!q) return renderNoMatches(el);
  el.innerHTML = `
    <article class="detail ${severity(q.magnitude)}">
      <button id="back" type="button">&larr; Back to the list</button>
      <h2><span class="mag">${q.magnitude?.toFixed(1) ?? "?"}</span> ${q.place ?? "Unknown location"}</h2>
      <dl>
        <dt>When</dt><dd>${new Date(q.time).toLocaleString()}</dd>
        <dt>Depth</dt><dd>${q.depth == null ? "unknown" : `${q.depth.toFixed(1)} km`}</dd>
        <dt>Location</dt><dd>${q.lat?.toFixed(2) ?? "?"}, ${q.lon?.toFixed(2) ?? "?"}</dd>
        <dt>Felt reports</dt><dd>${q.felt}</dd>
        <dt>Tsunami warning</dt><dd>${q.tsunami ? "yes" : "no"}</dd>
      </dl>
      <p><a href="${q.url}" target="_blank" rel="noopener">Full USGS event page</a></p>
    </article>`;
}
