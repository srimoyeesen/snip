# Snip — URL shortener with analytics

A starter Next.js app: shorten links, track clicks, with a free tier and a
$3/month Starter tier. Built on Next.js (App Router) + Supabase (database +
passwordless auth) + Razorpay (payments). Abuse prevention (verified signup, Google Safe
Browsing checks at creation *and* on each redirect, bad-pattern blocking) is
built in.

> This is scaffolding to start from, not a finished product. The structure and
> all core logic are here; you fill in your own keys and deploy.

## What's included

```
url-shortener/
├─ app/
│  ├─ page.jsx                 Landing page + create-link form
│  ├─ [slug]/route.js          The public redirect (logs clicks, re-checks safety)
│  ├─ login/page.jsx           Magic-link login
│  ├─ auth/callback/route.js   Completes login, sets session
│  ├─ dashboard/page.jsx       Your links + click counts
│  ├─ dashboard/[slug]/page.jsx  Per-link analytics (time / referrer / country / device)
│  ├─ pricing/page.jsx         Free + $3 Starter, upgrade button
│  ├─ blocked/page.jsx         Shown when a destination is flagged unsafe
│  └─ api/
│     ├─ links/route.js        Create a link (auth + limit + safety + insert)
│     └─ razorpay/
│        ├─ subscription/route.js  Create the Starter subscription (returns hosted URL)
│        └─ webhook/route.js       Flip user to/from the paid plan
├─ lib/                        Supabase clients, slug + URL validation, Safe Browsing, Razorpay
├─ supabase/schema.sql         Run this once in the Supabase SQL editor
├─ supabase/migration-razorpay.sql  Run if you set up the DB before the Razorpay switch
├─ middleware.js               Keeps the auth session fresh
└─ .env.example                Copy to .env.local and fill in
```

## Setup (about 30 minutes)

### 1. Install
```bash
cd url-shortener
npm install
cp .env.example .env.local
```

### 2. Supabase (database + auth)
1. Create a free project at supabase.com.
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, run it.
3. In **Settings → API**, copy the Project URL, the `anon` key, and the
   `service_role` key into `.env.local`.
4. In **Authentication → URL Configuration**, add
   `http://localhost:3000/auth/callback` (and later your production URL) as a
   redirect URL.

### 3. Google Safe Browsing (link safety)
1. In Google Cloud Console, create a project and **enable the Safe Browsing API**.
2. Create an API key, put it in `GOOGLE_SAFE_BROWSING_KEY`.
   (If you skip this, link scanning is bypassed — fine for local testing only.)

### 4. Razorpay (the Starter tier)
Use **Test mode** while building (toggle in the dashboard). Test mode works
without waiting for international-payments approval.
1. **API keys:** Settings → API Keys → generate. Put the Key ID in
   `RAZORPAY_KEY_ID` and the Key Secret in `RAZORPAY_KEY_SECRET`.
2. **Plan:** Subscriptions → Plans → create a plan (e.g. monthly, ~₹249 or a
   USD amount once international is enabled). Copy its `plan_...` id into
   `RAZORPAY_PLAN_ID`.
3. **Webhook:** Settings → Webhooks → add a webhook pointing at
   `http://localhost:3000/api/razorpay/webhook` (use an ngrok URL for local
   testing, or your real domain in production). Subscribe to the
   `subscription.activated`, `subscription.charged`, and `subscription.cancelled`
   events. Set a secret and copy it into `RAZORPAY_WEBHOOK_SECRET`.

> Already ran `schema.sql` before this switch? Run `supabase/migration-razorpay.sql`
> once in the SQL editor to rename the billing column.

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000 , log in with your email, and create a link.

## Deploy (Vercel)
1. Push this folder to a GitHub repo.
2. Import it at vercel.com — it auto-detects Next.js.
3. Add every variable from `.env.local` in the Vercel project settings, and set
   `NEXT_PUBLIC_SITE_URL` to your real domain.
4. In Razorpay, add a **production webhook** pointing at
   `https://yourdomain.com/api/razorpay/webhook` and update the webhook secret.
   Switch to live Razorpay keys once your account + international payments are approved.
5. Point your domain at Vercel. The redirect runs at `yourdomain.com/<slug>`.

## Tuning knobs
- **Free link limit:** `FREE_LINKS_PER_MONTH` in your env (default 25).
- **Safety re-check interval:** `RECHECK_AFTER_MS` in `app/[slug]/route.js`.
- **Slug length / alphabet:** `lib/slug.js`.

## Known starter shortcuts (improve as you grow)
- Click counts are aggregated in JavaScript; move to a Postgres view/RPC at scale.
- Rate limiting is currently just the monthly link cap; add per-IP/minute limits
  (e.g. Upstash Redis) before a public launch.
- Run free vs. paid links on **separate short domains** before scaling, so abuse
  on the free domain can't blocklist paying customers (see the build plan).
- Add a cancel flow (Razorpay subscription cancel API) so Starter users can self-serve.
```
