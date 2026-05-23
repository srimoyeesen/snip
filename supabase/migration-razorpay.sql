-- Run this ONCE in the Supabase SQL editor if you already ran schema.sql
-- (i.e. your profiles table still has the old stripe_customer_id column).
-- It renames that column to the provider-neutral billing_ref used by the
-- Razorpay webhook. Fresh installs of schema.sql already use billing_ref.

alter table public.profiles
  rename column stripe_customer_id to billing_ref;
