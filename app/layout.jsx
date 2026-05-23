import "./globals.css";

export const metadata = {
  title: "ShortLink — free link shortener with analytics",
  description: "Shorten links, track clicks. Free tier + a simple $3 plan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <a href="/" className="brand">ShortLink</a>
          <nav>
            <a href="/dashboard">Dashboard</a>
            <a href="/pricing">Pricing</a>
            <a href="/login">Log in</a>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          Spotted abuse? Email <a href="mailto:abuse@yourdomain.com">abuse@yourdomain.com</a>
        </footer>
      </body>
    </html>
  );
}
