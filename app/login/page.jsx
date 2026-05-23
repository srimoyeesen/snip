"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";

// Passwordless login: enter email, get a magic link. Clicking it verifies the
// email (our abuse defense #1) and logs the user in via /auth/callback.
export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const supabase = getBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div>
        <h1>Check your email</h1>
        <p className="subtitle">
          We sent a magic link to <strong>{email}</strong>. Click it to log in.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>Log in</h1>
      <p className="subtitle">No password. We'll email you a one-click login link.</p>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send link</button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
