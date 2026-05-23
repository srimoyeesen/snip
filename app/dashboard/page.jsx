// Dashboard (server component). Lists the logged-in user's links with click
// counts. RLS guarantees a user only ever sees their own rows.
//
// Click counts are aggregated in JS here for simplicity. Once you have lots of
// data, replace this with a Postgres view or an RPC that does the GROUP BY.

import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = getServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("plan").eq("id", user.id).single();

  const { data: links } = await supabase
    .from("links")
    .select("id, slug, destination_url, created_at")
    .order("created_at", { ascending: false });

  // Aggregate click counts for the user's links.
  const ids = (links || []).map((l) => l.id);
  const counts = {};
  if (ids.length) {
    const { data: clicks } = await supabase
      .from("clicks").select("link_id").in("link_id", ids);
    for (const c of clicks || []) counts[c.link_id] = (counts[c.link_id] || 0) + 1;
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "";

  return (
    <div>
      <h1>Your links</h1>
      <p className="subtitle">
        Plan: <span className="pill">{profile?.plan || "free"}</span>
        {profile?.plan !== "starter" && (
          <>  ·  <a href="/pricing">Upgrade to Starter ($3/mo)</a></>
        )}
      </p>

      {(!links || links.length === 0) ? (
        <p className="muted">No links yet. <a href="/">Create your first one →</a></p>
      ) : (
        <table>
          <thead>
            <tr><th>Short link</th><th>Destination</th><th>Clicks</th></tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id}>
                <td><a href={`${base}/${l.slug}`}>/{l.slug}</a></td>
                <td className="muted" style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.destination_url}
                </td>
                <td><a href={`/dashboard/${l.slug}`}>{counts[l.id] || 0}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
