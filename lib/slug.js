// Short-code generation and destination-URL validation.

// Unambiguous alphabet — no 0/O/1/l/I to avoid confusion when typed by hand.
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

// Generate a random slug, e.g. "k7Gh2x".
export function generateSlug(length = 6) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

// Reserved words that must never become a slug (they collide with real routes).
const RESERVED = new Set([
  "api", "login", "dashboard", "pricing", "auth", "about", "terms",
  "privacy", "favicon.ico", "robots.txt",
]);

// Validate a user-supplied custom alias. Returns { ok } or { ok:false, error }.
export function validateAlias(alias) {
  if (!/^[a-zA-Z0-9_-]{3,40}$/.test(alias)) {
    return { ok: false, error: "Alias must be 3-40 letters, numbers, - or _." };
  }
  if (RESERVED.has(alias.toLowerCase())) {
    return { ok: false, error: "That alias is reserved." };
  }
  return { ok: true };
}

// Basic destination sanity + obvious-abuse blocking (Section 6 of the plan).
// Returns { ok } or { ok:false, error }.
export function validateDestination(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Only http and https links are allowed." };
  }

  // Block raw IP-address destinations (common in abuse).
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname)) {
    return { ok: false, error: "Links to raw IP addresses aren't allowed." };
  }

  // Block punycode / look-alike domains.
  if (url.hostname.startsWith("xn--") || url.hostname.includes(".xn--")) {
    return { ok: false, error: "Internationalized look-alike domains aren't allowed." };
  }

  // Block chaining to other shorteners.
  const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly"];
  if (SHORTENERS.some((d) => url.hostname === d || url.hostname.endsWith("." + d))) {
    return { ok: false, error: "Links to other URL shorteners aren't allowed." };
  }

  return { ok: true };
}
