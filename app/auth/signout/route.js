// POST /auth/signout -> clears the session cookie and returns to the homepage.
// Triggered by the "Log out" form in the nav (POST so it can't be prefetched).

import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = getServerClient();
  await supabase.auth.signOut();
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`, { status: 302 });
}
