export const metadata = { title: "Contact — Snip" };

export default function Contact() {
  return (
    <div>
      <h1>Contact us</h1>
      <p className="subtitle">We're happy to help.</p>

      <div className="card">
        <h3>Support</h3>
        <p className="muted">
          For questions about your account, billing, or anything else, email us at{" "}
          <a href="mailto:support@snip.app">support@snip.app</a>. We aim to reply
          within 2 business days.
        </p>
      </div>

      <div className="card">
        <h3>Report abuse</h3>
        <p className="muted">
          To report a malicious, spam, or phishing link, email{" "}
          <a href="mailto:abuse@snip.app">abuse@snip.app</a> and we'll investigate
          and disable it promptly.
        </p>
      </div>

      <p className="muted">Snip is an independently operated service based in India.</p>
    </div>
  );
}
