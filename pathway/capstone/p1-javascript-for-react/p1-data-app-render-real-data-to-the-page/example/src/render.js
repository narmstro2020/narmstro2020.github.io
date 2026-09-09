// render.js — everything that touches the DOM lives here.
//
// Each function takes the element to write into. None of them fetch anything,
// and none of them decide anything. That separation is why they are testable.

/** Magnitude to a CSS class, so the styling is data-driven rather than hard-coded. */
export function severity(magnitude) {
  if (magnitude >= 5) return "major";
  if (magnitude >= 3) return "moderate";
  return "minor";
}

export function renderEmpty(el) {
  el.innerHTML = `<p class="state">No earthquakes in the last day. Genuinely good news.</p>`;
}

export function renderList(el, quakes) {
  if (quakes.length === 0) return renderEmpty(el);
  el.innerHTML = `<ul class="quakes">` + quakes.map((q) => `
    <li class="quake ${severity(q.magnitude)}">
      <span class="mag">${q.magnitude?.toFixed(1) ?? "?"}</span>
      <a href="${q.url}" target="_blank" rel="noopener">${q.place ?? "Unknown location"}</a>
      <time datetime="${new Date(q.time).toISOString()}">${new Date(q.time).toLocaleTimeString()}</time>
    </li>`).join("") + `</ul>
    <p class="count">${quakes.length} in the last 24 hours</p>`;
}
