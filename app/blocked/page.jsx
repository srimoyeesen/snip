// Shown when a link's destination was flagged as unsafe by Safe Browsing.
export default function Blocked() {
  return (
    <div>
      <h1>Link blocked</h1>
      <p className="subtitle">
        This short link points to a destination that was flagged as unsafe
        (malware or phishing), so we've stopped the redirect to protect you.
      </p>
      <a href="/">← Go home</a>
    </div>
  );
}
