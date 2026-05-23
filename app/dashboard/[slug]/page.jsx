// Per-link analytics (server component): clicks over the last 14 days, unique
// visitors, plus referrer / country / city / device / browser / OS breakdowns.
// Aggregated in JS from the raw clicks rows — fine for a starter; move to SQL
// aggregation as you scale.

import { redirect, notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function tally(rows, key) {
  const out = {};
  for (const r of rows) {
    const v = r[key] || "Unknown";
    out[v] = (out[v] || 0) + 1;
  }
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}

function Breakdown({ title, rows, field, limit = 6 }) {
  const items = tally(rows, field).slice(0, limit);
  return (
    <div className="card">
      <strong>{title}</strong>
      {items.length === 0 ? (
        <div className="muted">No data yet</div>
      ) : (
        items.map(([k, v]) => (
          <div key={k} className="bd-row">
            <span className="muted">{k}</span>
            <span>{v}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default async function LinkAnalytics({ params }) {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: link } = await supabase
    .from("links").select("id, slug, destination_url").eq("slug", params.slug).single();
  if (!link) notFound();

  const { data: clicks } = await supabase
    .from("clicks")
    .select("clicked_at, referrer, country, region, city, device, browser, os, visitor_hash")
    .eq("link_id", link.id);

  const rows = clicks || [];
  const unique = new Set(rows.map((r) => r.visitor_hash).filter(Boolean)).size;

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

  // Clicks by hour of day (UTC).
  const byHour = Array(24).fill(0);
  for (const c of rows) byHour[new Date(c.clicked_at).getUTCHours()]++;
  const maxHour = Math.max(1, ...byHour);

  return (
    <div>
      <h1>/{link.slug}</h1>
      <p className="subtitle" style={{ wordBreak: "break-all" }}>→ {link.destination_url}</p>

      <div className="stats">
        <div className="stat"><div className="stat-num">{rows.length}</div><div className="stat-label">Total clicks</div></div>
        <div className="stat"><div className="stat-num">{unique}</div><div className="stat-label">Unique visitors</div></div>
      </div>

      <div className="toolbar">
        <a className="btn-ghost" href={`/api/export/clicks/${link.slug}`}>⬇ Download CSV</a>
      </div>

      <h3>Last 14 days</h3>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, marginBottom: 28 }}>
        {Object.entries(byDay).map(([day, n]) => (
          <div key={day} title={`${day}: ${n}`}
               style={{ flex: 1, background: "var(--brand)", borderRadius: 4,
                        height: `${(n / maxDay) * 100}%`, minHeight: 2 }} />
        ))}
      </div>

      <h3>Busiest hours (UTC)</h3>
      <div className="hours">
        {byHour.map((n, h) => (
          <div key={h} className="hour" title={`${h}:00 UTC — ${n} clicks`}>
            <div className="hour-bar" style={{ height: `${(n / maxHour) * 100}%`, minHeight: 2 }} />
            <span className="hour-label">{h % 6 === 0 ? h : ""}</span>
          </div>
        ))}
      </div>

      <div className="breakdowns">
        <Breakdown title="Top referrers" rows={rows} field="referrer" />
        <Breakdown title="Countries" rows={rows} field="country" />
        <Breakdown title="Cities" rows={rows} field="city" />
        <Breakdown title="Devices" rows={rows} field="device" />
        <Breakdown title="Browsers" rows={rows} field="browser" />
        <Breakdown title="Operating systems" rows={rows} field="os" />
      </div>

      <a href="/dashboard">← Back to all links</a>
    </div>
  );
}
