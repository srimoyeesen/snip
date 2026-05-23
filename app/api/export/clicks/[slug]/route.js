// GET /api/export/clicks/:slug -> CSV of raw clicks for one of the user's links.
// RLS ensures the slug lookup only returns a link the logged-in user owns.

import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

const COLS = ["clicked_at", "country", "region", "city", "device", "browser", "os", "referrer"];

function esc(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request, { params }) {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: link } = await supabase
    .from("links").select("id, slug").eq("slug", params.slug).single();
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: clicks } = await supabase
    .from("clicks").select(COLS.join(", "))
    .eq("link_id", link.id)
    .order("clicked_at", { ascending: false });

  const lines = [COLS.join(",")];
  for (const c of clicks || []) lines.push(COLS.map((k) => esc(c[k])).join(","));

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="snip-${link.slug}-clicks.csv"`,
    },
  });
}
