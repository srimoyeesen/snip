// Lightweight, dependency-free user-agent parsing. Heuristic — good enough for
// dashboard breakdowns, not a substitute for a full UA database.

export function parseUA(ua = "") {
  const s = ua.toLowerCase();

  let os = "Unknown";
  if (/windows nt/.test(s)) os = "Windows";
  else if (/iphone|ipad|ipod/.test(s)) os = "iOS";
  else if (/mac os x|macintosh/.test(s)) os = "macOS";
  else if (/android/.test(s)) os = "Android";
  else if (/linux/.test(s)) os = "Linux";

  // Order matters: Edge/Opera UAs also contain "chrome"; Chrome contains "safari".
  let browser = "Unknown";
  if (/edg\//.test(s)) browser = "Edge";
  else if (/opr\/|opera/.test(s)) browser = "Opera";
  else if (/firefox\//.test(s)) browser = "Firefox";
  else if (/chrome\//.test(s)) browser = "Chrome";
  else if (/safari\//.test(s)) browser = "Safari";

  const device = /mobile|android|iphone|ipad|ipod/.test(s) ? "mobile" : "desktop";

  return { browser, os, device };
}
