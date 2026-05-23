"use client";

import { useState } from "react";

// Landing page + create-link form. Calls POST /api/links.
// If the API returns { upgrade: true } (free limit hit), we show the
// in-context $3 Starter nudge instead of a plain error.
export default function Home() {
  const [destination, setDestination] = useState("");
  const [alias, setAlias] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setShowUpgrade(false);
    setLoading(true);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, alias: alias || undefined }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      if (data.upgrade) setShowUpgrade(true);
      return;
    }
    setResult(data);
    setDestination("");
    setAlias("");
  }

  return (
    <div>
      <h1>Shorten a link, track every click</h1>
      <p className="subtitle">
        Free to start. Need more than your monthly free links? Go unlimited for $3/mo.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <input
            type="url"
            placeholder="https://example.com/your-long-url"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
        <div className="row">
          <input
            type="text"
            placeholder="custom-alias (optional)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Shortening…" : "Shorten"}
          </button>
        </div>
      </form>

      {result && (
        <div className="result">
          Your short link:{" "}
          <a href={result.shortUrl} target="_blank" rel="noreferrer">
            {result.shortUrl}
          </a>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {showUpgrade && (
        <div className="card">
          <strong>Out of free links this month.</strong>
          <p className="muted">Upgrade to Starter for unlimited links — just $3/month.</p>
          <a href="/pricing"><button>Upgrade to Starter</button></a>
        </div>
      )}

      <p className="muted" style={{ marginTop: 24 }}>
        New here? <a href="/login">Log in</a> to create and track your links.
      </p>
    </div>
  );
}
