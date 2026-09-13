// format.js — how a value reads on the page, decided once.
//
// Stage 5 pulled these out of render.js because the same date was being
// formatted three different ways in three places. Every "?" and "unknown" the
// user can see comes from here, so a missing field never shows as undefined.

export function formatMagnitude(magnitude) {
  return typeof magnitude === "number" ? magnitude.toFixed(1) : "?";
}

export function formatDepth(km) {
  return typeof km === "number" ? `${km.toFixed(1)} km` : "unknown";
}

export function formatCoords(lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") return "unknown";
  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}

/** Clock time for the list; the detail view wants the full date as well. */
export function formatTime(ms, { full = false } = {}) {
  const d = new Date(ms);
  return full ? d.toLocaleString() : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
