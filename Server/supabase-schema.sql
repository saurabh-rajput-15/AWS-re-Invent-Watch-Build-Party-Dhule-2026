-- ==============================================================================
-- AWS re:Invent Watch & Build Party Dhule 2026
-- Supabase PostgreSQL Database Schema
-- ==============================================================================

-- 1. Create the registrations table
create table if not exists public.registrations (
  id text primary key,
  full_name text not null,
  email text not null unique,
  phone text not null,
  builder_id text not null,
  college text not null,
  year text default '3rd Year',
  skill_level text default 'Beginner',
  interest_track text,
  why_join text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  registered_at bigint not null,
  reviewed_at bigint,
  reviewed_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Fast query indexes
create index if not exists idx_registrations_email on public.registrations(lower(email));
create index if not exists idx_registrations_status on public.registrations(status);
create index if not exists idx_registrations_builder_id on public.registrations(lower(builder_id));

-- 3. Enable Row Level Security (RLS)
alter table public.registrations enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public attendee registration" on public.registrations;
drop policy if exists "Allow read registration" on public.registrations;
drop policy if exists "Allow service role full access" on public.registrations;

-- Policy: Allow anyone to insert a registration (public form submission)
create policy "Allow public attendee registration"
  on public.registrations
  for insert
  with check (true);

-- Policy: Allow reading registrations (public pass verification & portal view)
create policy "Allow read registration"
  on public.registrations
  for select
  using (true);

-- Policy: Service role key bypasses RLS automatically, but we also grant full permissions
create policy "Allow service role full access"
  on public.registrations
  for all
  using (auth.role() = 'service_role' or auth.role() = 'authenticated' or auth.role() = 'anon')
  with check (auth.role() = 'service_role' or auth.role() = 'authenticated' or auth.role() = 'anon');
