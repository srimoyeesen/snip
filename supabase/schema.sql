-- =====================================================================
-- URL Shortener — database schema
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- Supabase already gives you an auth.users table; we add three of our own.
-- =====================================================================

-- ---------------------------------------------------------------------
-- profiles: one row per user, holds their plan (free / starter)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  plan         text not null default 'free',          -- 'free' | 'starter'
  billing_ref  text,                                  -- Razorpay subscription id
  created_at   timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- links: the short links themselves
-- ---------------------------------------------------------------------
create table if not exists public.links (
  id              bigint generated always as identity primary key,
  slug            text not null unique,                -- the short code
  destination_url text not null,
  user_id         uuid not null references auth.users (id) on delete cascade,
  safe_status     text not null default 'clean',       -- 'clean' | 'flagged'
  safe_checked_at timestamptz,                         -- last safety re-check
  created_at      timestamptz not null default now()
);

create index if not exists links_slug_idx    on public.links (slug);
create index if not exists links_user_id_idx on public.links (user_id);

-- ---------------------------------------------------------------------
-- clicks: one row per redirect, powers analytics
-- ---------------------------------------------------------------------
create table if not exists public.clicks (
  id         bigint generated always as identity primary key,
  link_id    bigint not null references public.links (id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer   text,
  country    text,
  device     text                                       -- 'mobile' | 'desktop'
);

create index if not exists clicks_link_id_idx on public.clicks (link_id);

-- =====================================================================
-- Row Level Security
-- The browser uses the anon key, so RLS is what actually protects data.
-- The server's service-role key BYPASSES RLS (used by redirect + webhook).
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.links    enable row level security;
alter table public.clicks   enable row level security;

-- A user can read/update only their own profile.
create policy "own profile read"  on public.profiles
  for select using (auth.uid() = id);
create policy "own profile write" on public.profiles
  for update using (auth.uid() = id);

-- A user can see and create only their own links.
create policy "own links read"   on public.links
  for select using (auth.uid() = user_id);
create policy "own links insert" on public.links
  for insert with check (auth.uid() = user_id);
create policy "own links delete" on public.links
  for delete using (auth.uid() = user_id);

-- A user can read clicks that belong to their own links.
create policy "own clicks read" on public.clicks
  for select using (
    exists (
      select 1 from public.links l
      where l.id = clicks.link_id and l.user_id = auth.uid()
    )
  );
