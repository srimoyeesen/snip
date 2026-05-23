// GET /api/export/links -> CSV of the logged-in user's links + click counts.

import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

function esc(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: links } = await supabase
    .from("links").select("id, slug, destination_url, created_at")
    .order("created_at", { ascending: false });

  const ids = (links || []).map((l) => l.id);
  const counts = {};
  if (ids.length) {
    const { data: clicks } = await supabase.from("clicks").select("link_id").in("link_id", ids);
    for (const c of clicks || []) counts[c.link_id] = (counts[c.link_id] || 0) + 1;
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const lines = [["slug", "short_url", "destination", "clicks", "created_at"].join(",")];
  for (const l of links || []) {
    lines.push([l.slug, `${base}/${l.slug}`, l.destination_url, counts[l.id] || 0, l.created_at].map(esc).join(","));
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="snip-links.csv"',
    },
  });
}
