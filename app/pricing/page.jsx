"use client";

import { useState } from "react";

// Two tiers: Free + Starter. Upgrade is a one-time Razorpay Payment Link for now
// (recurring/subscriptions need account approval — see /api/razorpay/subscription).
export default function Pricing() {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    const res = await fetch("/api/razorpay/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url; // go to Razorpay checkout
    else {
      setLoading(false);
      alert(data.error || "Could not start checkout. Are you logged in?");
    }
  }

  return (
    <div>
      <h1>Simple pricing</h1>
      <p className="subtitle">Start free. Upgrade only when you need more links.</p>

      <div className="card">
        <h3>Free</h3>
        <p className="muted">25 links / month · unlimited clicks · click analytics</p>
        <strong>₹0</strong>
      </div>

      <div className="card">
        <h3>Starter</h3>
        <p className="muted">Unlimited links · longer analytics history</p>
        <strong>₹249</strong> <span className="muted">one-time</span>
        <div style={{ marginTop: 12 }}>
          <button onClick={upgrade} disabled={loading}>
            {loading ? "Redirecting…" : "Upgrade to Starter"}
          </button>
        </div>
      </div>
    </div>
  );
}
