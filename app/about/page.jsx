export const metadata = { title: "About — Snip" };

export default function About() {
  return (
    <div>
      <h1>About Snip</h1>
      <p className="subtitle">A simple link shortener with real analytics.</p>

      <p>
        Snip turns long, unwieldy URLs into short, shareable links — and then shows
        you what happens after you share them. For every link you create, Snip
        tracks total and unique clicks, along with the location, device, browser,
        and referrer of each visit, so you can understand how your links actually
        perform.
      </p>
      <p>
        We built Snip to be straightforward and fairly priced. It runs on a
        freemium model: a free tier that covers everyday use, and an affordable
        Starter plan for people who need more links and deeper history. No bloat,
        no surprises.
      </p>
      <p>
        Snip is an independently operated service based in India. Have a question
        or some feedback? We'd love to hear from you — head to our{" "}
        <a href="/contact">contact page</a>.
      </p>
    </div>
  );
}
