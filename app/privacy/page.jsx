export const metadata = { title: "Privacy Policy — Snip" };

export default function Privacy() {
  return (
    <div>
      <h1>Privacy Policy</h1>
      <p className="subtitle">Last updated: 24 May 2026</p>

      <p>
        This Privacy Policy explains what information Snip ("we", "us") collects,
        how we use it, and the choices you have. By using snip-one.vercel.app (the
        "Service") you agree to this policy.
      </p>

      <h3>Information we collect</h3>
      <p>
        <strong>Account data.</strong> When you sign in, we store your email
        address so we can authenticate you and associate your links with your
        account. We use a passwordless magic-link login, so we never store a
        password.
      </p>
      <p>
        <strong>Link data.</strong> The destination URLs and short links you
        create.
      </p>
      <p>
        <strong>Click analytics.</strong> When someone visits one of your short
        links, we record the time of the click, the approximate location (country,
        region, city) derived from the visitor's IP address, the device type,
        browser, operating system, and referring website. We do <em>not</em> store
        raw IP addresses; to count unique visitors we store only a one-way hashed
        identifier from which the original IP cannot be recovered.
      </p>

      <h3>How we use information</h3>
      <p>
        We use this information to operate the Service: to authenticate you, create
        and serve your links, generate the analytics shown on your dashboard,
        process payments for paid plans, and protect the Service from abuse.
      </p>

      <h3>Service providers</h3>
      <p>
        We rely on a small number of trusted providers who process data on our
        behalf: <strong>Supabase</strong> (database and authentication),{" "}
        <strong>Vercel</strong> (hosting), <strong>Razorpay</strong> (payment
        processing), <strong>Google Safe Browsing</strong> (checking links for
        malware/phishing), and an email provider for login emails. Payment card
        details are handled entirely by Razorpay; we never see or store them.
      </p>

      <h3>Cookies</h3>
      <p>
        We use a single essential cookie to keep you signed in. We do not use
        advertising or third-party tracking cookies.
      </p>

      <h3>Data retention</h3>
      <p>
        We keep your account, link, and analytics data for as long as your account
        is active. You can ask us to delete your account and associated data at any
        time by contacting us.
      </p>

      <h3>Your rights</h3>
      <p>
        You may request access to, correction of, or deletion of your personal data
        by emailing <a href="mailto:support@snip.app">support@snip.app</a>.
      </p>

      <h3>Contact</h3>
      <p>
        Questions about this policy? Email{" "}
        <a href="mailto:support@snip.app">support@snip.app</a>.
      </p>
    </div>
  );
}
