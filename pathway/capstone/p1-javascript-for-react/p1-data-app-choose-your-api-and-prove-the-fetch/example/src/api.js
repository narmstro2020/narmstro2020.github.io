// api.js — the only file that talks to the network.
//
// Day one of the project is not about making it look like anything. It is about
// proving you can get real data out of a real API and into your browser.

const FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

/** Fetch the feed and hand back the raw JSON, exactly as the API sent it. */
export async function loadRaw(doFetch = fetch) {
  const response = await doFetch(FEED);
  return response.json();
}
