// Google Safe Browsing lookup.
// Returns true if the URL is SAFE, false if it matches a known threat.
// Fails OPEN (returns true) if the API key is missing or the call errors, so a
// transient Google outage doesn't block your whole product — tune to taste.

export async function isUrlSafe(targetUrl) {
  const key = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (!key) {
    console.warn("GOOGLE_SAFE_BROWSING_KEY not set — skipping safety check.");
    return true;
  }

  const endpoint =
    "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + key;

  const body = {
    client: { clientId: "url-shortener", clientVersion: "1.0.0" },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING", // phishing
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION",
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: targetUrl }],
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("Safe Browsing API error:", res.status);
      return true; // fail open
    }
    const data = await res.json();
    // Empty response object => no threats found => safe.
    return !data || !data.matches || data.matches.length === 0;
  } catch (err) {
    console.error("Safe Browsing request failed:", err);
    return true; // fail open
  }
}
