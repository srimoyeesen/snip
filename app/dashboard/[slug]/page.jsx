// Per-link analytics (server component): clicks over the last 14 days, top
// referrers, country split, device split. All aggregated in JS from the raw
// clicks rows — fine for a starter; move to SQL aggregation as you scale.

import { redirect, notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function tally(rows, key) {
  const out = {};
  for (const r of rows) {
    const v = r[key] || "unknown";
    out[v] = (out[v] || 0) + 1;
  }
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}

export default async function LinkAnalytics({ params }) {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: link } = await supabase
    .from("links").select("id, slug, destination_url").eq("slug", params.slug).single();
  if (!link) notFound();

  const { data: clicks } = await supabase
    .from("clicks").select("clicked_at, referrer, country, device").eq("link_id", link.id);

  const rows = clicks || [];

  // Clicks per day for the last 14 days.
  const byDay = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    byDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const c of rows) {
    const day = c.clicked_at.slice(0, 10);
    if (day in byDay) byDay[day]++;
  }
  const maxDay = Math.max(1, ...Object.values(byDay));

  return (
    <div>
      <h1>/{link.slug}</h1>
      <p className="subtitle">{rows.length} total clicks · → {link.destination_url}</p>

      <h3>Last 14 days</h3>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, marginBottom: 24 }}>
        {Object.entries(byDay).map(([day, n]) => (
          <div key={day} title={`${day}: ${n}`}
               style={{ flex: 1, background: "var(--accent)", borderRadius: 4,
                        height: `${(n / maxDay) * 100}%`, minHeight: 2 }} />
        ))}
      </div>

      <div className="card">
        <strong>Top referrers</strong>
        {tally(rows, "referrer").slice(0, 5).map(([k, v]) => (
          <div key={k} className="muted">{k} — {v}</div>
        ))}
      </div>
      <div className="card">
        <strong>Countries</strong>
        {tally(rows, "country").slice(0, 5).map(([k, v]) => (
          <div key={k} className="muted">{k} — {v}</div>
        ))}
      </div>
      <div className="card">
        <strong>Devices</strong>
        {tally(rows, "device").map(([k, v]) => (
          <div key={k} className="muted">{k} — {v}</div>
        ))}
      </div>

      <a href="/dashboard">← Back to all links</a>
    </div>
  );
}
