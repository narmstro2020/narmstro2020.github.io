// quakes.js — the pure logic. Arrays in, arrays out. No fetch, no DOM.
//
// This is requirement 5 (filter / sort / search with array methods), and it is
// the file the Node harness can test without a browser, because nothing in
// here knows a browser exists.

/** Keep only quakes at or above a magnitude. A missing magnitude counts as 0. */
export function filterByMinMagnitude(quakes, min) {
  return quakes.filter((q) => (q.magnitude ?? 0) >= min);
}

/** Case-insensitive match on the place name. An empty search keeps everything. */
export function searchByPlace(quakes, text) {
  const needle = text.trim().toLowerCase();
  if (needle === "") return quakes;
  return quakes.filter((q) => (q.place ?? "").toLowerCase().includes(needle));
}

/**
 * A NEW array, ordered. `sort` mutates whatever you call it on, so the copy
 * (`[...quakes]`) is the whole point of this function — without it the
 * "original" list quietly changes order underneath the app.
 */
export function sortQuakes(quakes, key) {
  const sorted = [...quakes];
  if (key === "magnitude") {
    sorted.sort((a, b) => (b.magnitude ?? -Infinity) - (a.magnitude ?? -Infinity));
  } else {
    sorted.sort((a, b) => b.time - a.time);        // newest first
  }
  return sorted;
}

/** The three above, in the order the UI applies them. One call from main.js. */
export function applyControls(quakes, { minMagnitude = 0, query = "", sortBy = "time" } = {}) {
  return sortQuakes(searchByPlace(filterByMinMagnitude(quakes, minMagnitude), query), sortBy);
}

/** The record behind a click, or null. The detail view is a lookup, not a second fetch. */
export function findQuake(quakes, id) {
  return quakes.find((q) => q.id === id) ?? null;
}
