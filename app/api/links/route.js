// POST /api/links  -> create a short link for the logged-in user.
//
// Enforces, in order:
//   1. Auth        (must be logged in)
//   2. Validation  (destination + optional custom alias)
//   3. Free limit  (free users capped at FREE_LINKS_PER_MONTH)
//   4. Safety scan  (Google Safe Browsing)
//   5. Insert      (with a unique slug)

import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";
import { generateSlug, validateAlias, validateDestination } from "@/lib/slug";
import { isUrlSafe } from "@/lib/safe-browsing";

const FREE_LIMIT = parseInt(process.env.FREE_LINKS_PER_MONTH || "25", 10);

export async function POST(request) {
  const supabase = getServerClient();

  // 1. Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const { destination, alias } = await request.json();

  // 2. Validation
  const destCheck = validateDestination(destination || "");
  if (!destCheck.ok) {
    return NextResponse.json({ error: destCheck.error }, { status: 400 });
  }
  if (alias) {
    const aliasCheck = validateAlias(alias);
    if (!aliasCheck.ok) {
      return NextResponse.json({ error: aliasCheck.error }, { status: 400 });
    }
  }

  // 3. Free-tier limit — count this user's links created this calendar month.
  const { data: profile } = await supabase
    .from("profiles").select("plan").eq("id", user.id).single();

  if (!profile || profile.plan === "free") {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("links")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= FREE_LIMIT) {
      return NextResponse.json(
        {
          error: `You've used your ${FREE_LIMIT} free links this month.`,
          upgrade: true, // the UI uses this to show the $3 Starter nudge
        },
        { status: 402 }
      );
    }
  }

  // 4. Safety scan
  const safe = await isUrlSafe(destination);
  if (!safe) {
    return NextResponse.json(
      { error: "That destination was flagged as unsafe and can't be shortened." },
      { status: 400 }
    );
  }

  // 5. Insert with a unique slug (retry a few times on collision).
  let slug = alias || generateSlug();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("links")
      .insert({
        slug,
        destination_url: destination,
        user_id: user.id,
        safe_status: "clean",
        safe_checked_at: new Date().toISOString(),
      })
      .select("slug")
      .single();

    if (!error) {
      const base = process.env.NEXT_PUBLIC_SITE_URL || "";
      return NextResponse.json({ slug: data.slug, shortUrl: `${base}/${data.slug}` });
    }

    // 23505 = unique violation. A custom alias clash is fatal; a random one retries.
    if (error.code === "23505") {
      if (alias) {
        return NextResponse.json({ error: "That alias is already taken." }, { status: 409 });
      }
      slug = generateSlug();
      continue;
    }
    return NextResponse.json({ error: "Could not create link." }, { status: 500 });
  }

  return NextResponse.json({ error: "Could not generate a unique link, try again." }, { status: 500 });
}
