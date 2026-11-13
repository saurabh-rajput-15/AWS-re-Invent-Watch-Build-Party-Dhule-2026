-- ==============================================================================
-- AWS re:Invent Watch & Build Party Dhule 2026
-- Complete Unified Supabase Setup Script
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ggckynkllxfhdlsgxsiv/sql/new
-- ==============================================================================

-- 1. Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    builder_id TEXT NOT NULL,
    college TEXT NOT NULL,
    year TEXT DEFAULT '3rd Year',
    skill_level TEXT DEFAULT 'Beginner',
    interest_track TEXT,
    why_join TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    registered_at BIGINT NOT NULL,
    reviewed_at BIGINT,
    reviewed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    builder_center_verified BOOLEAN DEFAULT FALSE NOT NULL,
    builder_center_status TEXT DEFAULT 'pending_check' CHECK (builder_center_status IN ('registered_on_builder_center', 'not_registered', 'pending_check')),
    builder_center_verified_at TIMESTAMPTZ,
    builder_center_raw JSONB DEFAULT '{}'::jsonb
);

-- Fast indexes for registrations
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(lower(email));
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_builder_id ON public.registrations(lower(builder_id));
CREATE INDEX IF NOT EXISTS idx_reg_bc_verified ON public.registrations(builder_center_verified);
CREATE INDEX IF NOT EXISTS idx_reg_bc_status ON public.registrations(builder_center_status);

-- 2. Create builder_center_attendees table (Tracks official AWS Builder Center roster)
CREATE TABLE IF NOT EXISTS public.builder_center_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL DEFAULT 'c8a38d77-8262-34c4-b744-ea8dfb7b35a6',
    builder_id TEXT NOT NULL,
    display_name TEXT,
    email TEXT,
    avatar_url TEXT,
    roster_type TEXT NOT NULL DEFAULT 'request',
    registered_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT uq_event_builder UNIQUE (event_id, builder_id)
);

CREATE INDEX IF NOT EXISTS idx_bca_builder_id ON public.builder_center_attendees(lower(builder_id));
CREATE INDEX IF NOT EXISTS idx_bca_email ON public.builder_center_attendees(lower(email));
CREATE INDEX IF NOT EXISTS idx_bca_event_id ON public.builder_center_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_bca_synced_at ON public.builder_center_attendees(synced_at DESC);

-- 3. Create agent_sync_logs table (Diagnostics & audit)
CREATE TABLE IF NOT EXISTS public.agent_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_type TEXT NOT NULL,
    target_builder_id TEXT,
    found BOOLEAN DEFAULT FALSE,
    response_time_ms INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON public.agent_sync_logs(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_center_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_sync_logs ENABLE ROW LEVEL SECURITY;

-- 5. Permissions & Grants
GRANT ALL ON TABLE public.registrations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.builder_center_attendees TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.agent_sync_logs TO anon, authenticated, service_role;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Allow public attendee registration" ON public.registrations;
CREATE POLICY "Allow public attendee registration" ON public.registrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read registration" ON public.registrations;
CREATE POLICY "Allow read registration" ON public.registrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role full access" ON public.registrations;
CREATE POLICY "Allow service role full access" ON public.registrations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read builder_center_attendees" ON public.builder_center_attendees;
CREATE POLICY "Allow read builder_center_attendees" ON public.builder_center_attendees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write builder_center_attendees" ON public.builder_center_attendees;
CREATE POLICY "Allow write builder_center_attendees" ON public.builder_center_attendees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read agent_sync_logs" ON public.agent_sync_logs;
CREATE POLICY "Allow read agent_sync_logs" ON public.agent_sync_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write agent_sync_logs" ON public.agent_sync_logs;
CREATE POLICY "Allow write agent_sync_logs" ON public.agent_sync_logs FOR ALL USING (true) WITH CHECK (true);

-- 7. Pre-seed Organizer and Agent profiles as verified attendees
INSERT INTO public.builder_center_attendees (event_id, builder_id, display_name, roster_type)
VALUES 
    ('c8a38d77-8262-34c4-b744-ea8dfb7b35a6', 'agentviru', 'agent', 'request'),
    ('c8a38d77-8262-34c4-b744-ea8dfb7b35a6', 'saurabhrajput', 'Saurabh Girase', 'attendee')
ON CONFLICT (event_id, builder_id) 
DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    roster_type = EXCLUDED.roster_type,
    synced_at = timezone('utc'::text, now());
