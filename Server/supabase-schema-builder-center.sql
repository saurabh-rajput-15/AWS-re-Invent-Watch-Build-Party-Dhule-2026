-- ==============================================================================
-- AWS re:Invent Watch & Build Party Dhule 2026
-- Supabase Schema: AWS Builder Center Event Verification & Sync
-- ==============================================================================

-- 1. Table: builder_center_attendees
-- Stores attendees found in the event's attendee / invite / request roster
CREATE TABLE IF NOT EXISTS public.builder_center_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL DEFAULT 'c8a38d77-8262-34c4-b744-ea8dfb7b35a6',
    builder_id TEXT NOT NULL,                          -- lowercased AWS Builder ID alias (e.g. 'saurabhrajput1')
    display_name TEXT,                                  -- Display name on AWS
    email TEXT,                                         -- Email address (if available)
    avatar_url TEXT,                                    -- Avatar image
    roster_type TEXT NOT NULL DEFAULT 'request',       -- 'request', 'attendee', 'invited'
    registered_at TIMESTAMPTZ,                           -- When requested on Builder Center
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    raw_metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT uq_event_builder UNIQUE (event_id, builder_id)
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_bca_builder_id ON public.builder_center_attendees(lower(builder_id));
CREATE INDEX IF NOT EXISTS idx_bca_email ON public.builder_center_attendees(lower(email));
CREATE INDEX IF NOT EXISTS idx_bca_event_id ON public.builder_center_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_bca_synced_at ON public.builder_center_attendees(synced_at DESC);

-- 2. Alter registrations table to link event verification state
ALTER TABLE public.registrations
    ADD COLUMN IF NOT EXISTS builder_center_verified BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS builder_center_status TEXT DEFAULT 'pending_check'
        CHECK (builder_center_status IN ('registered_on_builder_center', 'not_registered', 'pending_check')),
    ADD COLUMN IF NOT EXISTS builder_center_verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS builder_center_raw JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_reg_bc_verified ON public.registrations(builder_center_verified);
CREATE INDEX IF NOT EXISTS idx_reg_bc_status ON public.registrations(builder_center_status);

-- 3. Table: agent_sync_logs (Diagnostics & audit)
CREATE TABLE IF NOT EXISTS public.agent_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_type TEXT NOT NULL,                         -- 'live_alias_check', 'admin_sync', 'cron'
    target_builder_id TEXT,
    found BOOLEAN DEFAULT FALSE,
    response_time_ms INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON public.agent_sync_logs(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.builder_center_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_sync_logs ENABLE ROW LEVEL SECURITY;

-- 5. Permissions & Grants
GRANT ALL ON TABLE public.builder_center_attendees TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.agent_sync_logs TO anon, authenticated, service_role;

-- 6. Policies
DROP POLICY IF EXISTS "Allow read builder_center_attendees" ON public.builder_center_attendees;
CREATE POLICY "Allow read builder_center_attendees"
    ON public.builder_center_attendees
    FOR SELECT
    TO anon, authenticated, service_role
    USING (true);

DROP POLICY IF EXISTS "Allow write builder_center_attendees" ON public.builder_center_attendees;
CREATE POLICY "Allow write builder_center_attendees"
    ON public.builder_center_attendees
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read write agent_sync_logs" ON public.agent_sync_logs;
CREATE POLICY "Allow read write agent_sync_logs"
    ON public.agent_sync_logs
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);
