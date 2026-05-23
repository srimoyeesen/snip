"use client";

import { useState } from "react";

// Small interactive copy-to-clipboard button used in the dashboard table.
export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <button type="button" className="copy-btn" onClick={copy} title="Copy short link">
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
