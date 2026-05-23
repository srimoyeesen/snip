// GET /auth/callback?code=...  -> exchanges the magic-link code for a session
// cookie, then sends the user to their dashboard.

import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = getServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
