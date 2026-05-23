// Server-side Supabase clients.
//
// There are TWO server clients here, used for different jobs:
//
//   getServerClient()  -> acts AS THE LOGGED-IN USER (respects RLS). Use in
//                         pages and API routes that read/write a user's data.
//
//   getAdminClient()   -> uses the SECRET service-role key and BYPASSES RLS.
//                         Use only where there is no logged-in user, e.g. the
//                         public redirect (logging a click) and the Razorpay
//                         webhook (flipping a user to the paid plan).

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Per-request client tied to the visitor's auth cookie.
export function getServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can be called from a Server Component where cookies are
            // read-only — safe to ignore; middleware/route handlers refresh it.
          }
        },
      },
    }
  );
}

// Privileged client. NEVER import this into client components.
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
