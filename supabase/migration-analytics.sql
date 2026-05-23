-- Run ONCE in the Supabase SQL editor to add richer analytics columns.
-- Existing click rows keep NULLs for these; new clicks populate them going forward.

alter table public.clicks add column if not exists visitor_hash text;  -- privacy-safe unique-visitor id
alter table public.clicks add column if not exists browser text;       -- Chrome / Safari / ...
alter table public.clicks add column if not exists os text;            -- Windows / macOS / iOS / ...
alter table public.clicks add column if not exists city text;
alter table public.clicks add column if not exists region text;
