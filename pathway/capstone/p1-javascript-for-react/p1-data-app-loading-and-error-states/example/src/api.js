// api.js — everything that talks to the network lives here, and nothing else does.
//
// Splitting this out is requirement 7 (ES modules). It also makes the app
// testable: main.js can be handed a fake fetch and never touch the internet.

const FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

/**
 * Turns whatever went wrong into a sentence a human can act on.
 * A thrown TypeError from fetch means the request never left the building.
 */
export function describeError(err) {
  if (err instanceof TypeError) return "Could not reach the server. Check your connection.";
  if (err.status === 404) return "That feed does not exist any more.";
  if (err.status >= 500) return "The server is having a bad day. Try again in a minute.";
  if (err.status) return `The server refused the request (${err.status}).`;
  return "Something went wrong loading the data.";
}

/** The shape the rest of the app wants, pulled out of the feed's shape. */
export function toQuakes(geojson) {
  return geojson.features.map((f) => ({
    id: f.id,
    magnitude: f.properties.mag,
    place: f.properties.place,
    time: f.properties.time,
    url: f.properties.url,
  }));
}

/**
 * Fetch the feed and hand back plain objects.
 * `doFetch` is a seam for testing — production passes nothing and gets real fetch.
 */
export async function loadQuakes(doFetch = fetch) {
  const response = await doFetch(FEED);
  if (!response.ok) {
    // A 404 is a SUCCESSFUL request for a page that isn't there. fetch does not
    // throw on it, which surprises everyone exactly once.
    const err = new Error(`HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return toQuakes(await response.json());
}
