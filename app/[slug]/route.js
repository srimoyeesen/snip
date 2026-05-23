// GET /:slug  -> the public redirect.
//
// Runs with the admin client because there is no logged-in user here.
// On each hit it: looks up the link, re-checks safety if the last check is
// stale (catches "approve a clean URL then swap it" abuse), logs the click,
// then redirects.

import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";
import { isUrlSafe } from "@/lib/safe-browsing";

const RECHECK_AFTER_MS = 6 * 60 * 60 * 1000; // re-scan at most every 6 hours

export async function GET(request, { params }) {
  const { slug } = params;
  const admin = getAdminClient();
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const { data: link } = await admin
    .from("links")
    .select("id, destination_url, safe_status, safe_checked_at")
    .eq("slug", slug)
    .single();

  // Unknown slug -> send home (or render a 404 page).
  if (!link) {
    return NextResponse.redirect(base + "/?notfound=1", 302);
  }

  // Already flagged -> show the warning page instead of redirecting.
  if (link.safe_status === "flagged") {
    return NextResponse.redirect(`${base}/blocked`, 302);
  }

  // Stale safety check -> re-scan in the background-ish (awaited but fast).
  const lastChecked = link.safe_checked_at ? Date.parse(link.safe_checked_at) : 0;
  if (Date.now() - lastChecked > RECHECK_AFTER_MS) {
    const safe = await isUrlSafe(link.destination_url);
    await admin
      .from("links")
      .update({
        safe_status: safe ? "clean" : "flagged",
        safe_checked_at: new Date().toISOString(),
      })
      .eq("id", link.id);
    if (!safe) {
      return NextResponse.redirect(`${base}/blocked`, 302);
    }
  }

  // Log the click. Vercel provides geo + UA headers for free.
  const ua = request.headers.get("user-agent") || "";
  const device = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";
  await admin.from("clicks").insert({
    link_id: link.id,
    referrer: request.headers.get("referer") || null,
    country: request.headers.get("x-vercel-ip-country") || null,
    device,
  });

  return NextResponse.redirect(link.destination_url, 302);
}
