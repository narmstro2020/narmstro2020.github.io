// api.js — everything that talks to the network lives here, and nothing else does.
//
// Splitting this out is requirement 7 (ES modules). It also makes the app
// testable: main.js can be handed a fake fetch and never touch the internet.

const FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

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

/** Fetch the feed and hand back plain objects the UI can render. */
export async function loadQuakes(doFetch = fetch) {
  const response = await doFetch(FEED);
  return toQuakes(await response.json());
}
