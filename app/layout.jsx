import "./globals.css";
import { getServerClient } from "@/lib/supabase-server";

export const metadata = {
  title: "Snip — link shortener with analytics",
  description: "Shorten links, track clicks. Free tier + a simple $3 plan.",
};

export default async function RootLayout({ children }) {
  // Auth-aware nav: show the signed-in user + Log out, or a Log in button.
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <header className="nav">
          <a href="/" className="brand">
            <span className="brand-mark">/</span>snip
          </a>
          <nav className="nav-links">
            {user ? (
              <>
                <a href="/dashboard">Dashboard</a>
                <a href="/pricing">Pricing</a>
                <span className="nav-user" title={user.email}>{user.email}</span>
                <form action="/auth/signout" method="post" className="signout-form">
                  <button type="submit" className="linkbtn">Log out</button>
                </form>
              </>
            ) : (
              <>
                <a href="/pricing">Pricing</a>
                <a href="/login" className="nav-cta">Log in</a>
              </>
            )}
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          Spotted abuse? Email <a href="mailto:abuse@snip.app">abuse@snip.app</a>
        </footer>
      </body>
    </html>
  );
}
