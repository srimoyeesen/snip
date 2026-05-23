// GET /auth/callback -> completes a magic-link login and sets the session
// cookie, then sends the user to their dashboard.
//
// Handles two flows:
//   token_hash + type  -> verifyOtp (works from ANY browser/device — preferred
//                         for email magic links, e.g. opening the email on a phone)
//   code               -> exchangeCodeForSession (PKCE; only works in the same
//                         browser that requested the link)

import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  const supabase = getServerClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Anything else (missing/expired/invalid) -> back to login with a flag.
  return NextResponse.redirect(`${origin}/login?error=could-not-sign-in`);
}
