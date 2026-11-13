-- ==============================================================================
-- AWS re:Invent Watch & Build Party Dhule 2026
-- Database Restructuring & Cleanup Script
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ggckynkllxfhdlsgxsiv/sql/new
-- Run after supabase-unified-setup.sql, using the SQL Editor's postgres role.
-- ==============================================================================

BEGIN;

-- Keep alias checks and index creation consistent while the migration runs.
LOCK TABLE public.builder_center_attendees, public.registrations IN SHARE ROW EXCLUSIVE MODE;

-- Preserve attendee registrations: resolve duplicate aliases before rerunning.
-- A failure aborts the entire transaction, including cleanup and schema changes.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.builder_center_attendees
        WHERE lower(trim(builder_id)) <> '__agent_session__'
        GROUP BY event_id, lower(trim(builder_id))
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate normalized aliases exist in builder_center_attendees'
            USING HINT = 'Group by event_id, lower(trim(builder_id)) with HAVING count(*) > 1; reconcile those rows before rerunning.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.registrations
        GROUP BY lower(trim(builder_id))
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate normalized aliases exist in registrations'
            USING HINT = 'Group by lower(trim(builder_id)) with HAVING count(*) > 1; reconcile those registrations before rerunning.';
    END IF;
END;
$$;

-- 1. Create dedicated agent_sessions table (stores autonomous agent sessions cleanly)
CREATE TABLE IF NOT EXISTS public.agent_sessions (
    session_id TEXT PRIMARY KEY DEFAULT 'aws_builder_session',
    event_id TEXT NOT NULL DEFAULT 'c8a38d77-8262-34c4-b744-ea8dfb7b35a6',
    cookie TEXT NOT NULL,
    csrf_token TEXT NOT NULL,
    last_refreshed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Correct defaults when the table was created by an earlier version of this script.
ALTER TABLE public.agent_sessions
    ALTER COLUMN last_refreshed_at SET DEFAULT now(),
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN updated_at SET DEFAULT now();

-- Enable RLS & Grants for agent_sessions
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.agent_sessions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agent_sessions TO service_role;

DROP POLICY IF EXISTS "Allow service role full access to agent_sessions" ON public.agent_sessions;
CREATE POLICY "Allow service role full access to agent_sessions" 
ON public.agent_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed working AWS session credentials so cloud store is ready immediately
INSERT INTO public.agent_sessions (session_id, event_id, cookie, csrf_token, last_refreshed_at)
VALUES (
    'aws_builder_session',
    'c8a38d77-8262-34c4-b744-ea8dfb7b35a6',
    's_fid=0C823001514CA26F-044800A3E0F4C98C; cwr_u=f247c072-09e7-496b-a8cb-0a8d603d7a49; builder-auth-provider=BuilderID; s_sq=awsamazonallprod1%3D%2526pid%253Dhttps%25253A%25252F%25252Fbuilder.aws.com%25252Fconnect%25252Fevent%25252Fc8a38d77-8262-34c4-b744-ea8dfb7b35a6%2526oid%253DfunctionXt%252528%252529%25257B%25257D%2526oidt%253D2%2526ot%253DSUBMIT; awscccp=eyJjY2JhIjowLCJ2IjoiMSJ9; awsccc=eyJlIjoxLCJwIjowLCJmIjowLCJhIjowLCJpIjoiY2Y5MTkyODctZTY3ZC00MTE2LTk1NmQtNzVkMDQ4ZjUyZDI3IiwidiI6IjEifQ==; builder-session-token=AAAADmtleS0xNTY4OTU1MzA3NQmd8EPWnFuFvzytkhdeOBYaMPwJbcBaBv-K7UMCIJOVx4jEOkxPmkxZKZ3gcihCJX1KcB4hXThtObi0Co2Sd7JUjM6DBTXOF--rAwANnYrtk6W7X99WYUOBUMZdOH_O7DrTAS9jghTq9j33KqbJtGwczPpvC-5oydMuvcai8gy2Lv5A2uOaZi3dt5_HrzQpfJ2v7s3Bu8yIX2d3Sp6sIvKEelgkyqTNRcy4SwlwlJmPm8JIdZSv9W3e29nL5jHXdJg7lKmkarQOzcI2AaOFJ2KW2aolceaZf1ghKLB7No87C1F2UF02tn2VAIyf_GR5JZCR_nBwiwi2lWWHbAde3pzA3-6LE-iKkpEAjtU_4LrqqfUjbrnnoOWihW_CDjr1xmucOcb99f68rThlJZjpE8Gc2JYWV8F13ojFI5wIjzGVgA_FBB1xFjhgcakfyy9zSSfj0IM8mVG_L-nNg6ekMT9ek89ivkl4XiyIxsqOYSPlUlibiLbjhlesyLqESbNXBx2FRuP_qvmEdk3sy9Fs8h6IZqV01mA8oLkk5xBsQku14-WS5QoR-es-2I03Z4GwIBYVTYcqyydDr_xqgjOgpstEkakGo8sdzPKkZzYPdRC8J3SBztGDGUeb0ldwnNCNnqCQmA4OzdY6eZ8r_GOS8u3o6oULB0ZdvYr6gTciBLL1iSF2IgSpAwmIr53gpT2pJojolju4dVfJ1yDZwChSAlNCulGC78kGI8ngIWheXTeKjdwaP0vY6pU7KxO8C9sYcO7reXlJTBQHHR74C0IqJwoCwg_o9UwbtO7vAS9AvmKyflLQw4uiQrddLMlfnUb9yIYh34W9bHVwpXLeMuOZMmPokFNB-_XFxpLj3n7EIExeus8MLcdCGi0kkUos2Qe0aQAheoaKZabwcShfBMBX4Q5_7fPRK1VzchJUFpwY08bsF-OBebE0VyhcweNFlZFzTLN5vyi-s7yyRQI; cwr_s=eyJzZXNzaW9uSWQiOiI0MGE2MTA5YS02NTY0LTQzMmEtYWI5ZS1lM2Y2YTM0MzNjMGIiLCJyZWNvcmQiOnRydWUsImV2ZW50Q291bnQiOjIxMDQsInBhZ2UiOnsicGFnZUlkIjoiL2Nvbm5lY3QvZXZlbnQvYzhhMzhkNzctODI2Mi0zNGM0LWI3NDQtZWE4ZGZiN2IzNWE2IiwicGFyZW50UGFnZUlkIjoiLyIsImludGVyYWN0aW9uIjozLCJyZWZlcnJlciI6Imh0dHBzOi8vdXMtZWFzdC0xLnNpZ25pbi5hd3MvIiwicmVmZXJyZXJEb21haW4iOiJ1cy1lYXN0LTEuc2lnbmluLmF3cyIsInN0YXJ0IjoxNzk0NTUwNjc4NjM2fX0=',
    'hGgDI2BC/IcXhnkfHwjwP4gRe4tQKQM0zBF7S2g1xgrtAAAAAGr3QHtlOTJkMTNiZi0yM2FjLTQ2MjktYjQxMi1kYTA4YTMzMmM0OWE=',
    now()
)
ON CONFLICT (session_id) 
DO UPDATE SET 
    cookie = EXCLUDED.cookie,
    csrf_token = EXCLUDED.csrf_token,
    last_refreshed_at = EXCLUDED.last_refreshed_at;

-- 2. Remove legacy dummy session rows from builder_center_attendees
DELETE FROM public.builder_center_attendees 
WHERE lower(trim(builder_id)) = '__agent_session__';

-- 3. Prevent duplicate rows for the same alias in builder_center_attendees
CREATE UNIQUE INDEX IF NOT EXISTS uq_bca_event_builder_lower 
ON public.builder_center_attendees(event_id, lower(trim(builder_id)));

-- 4. Restructure registrations table:
-- Add dedicated check-in tracking columns (replaces burying in raw JSONB)
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS checked_in_by TEXT;

-- Preserve check-ins previously stored in builder_center_raw. Otherwise the new
-- default false column would hide them when the server reads dedicated columns.
UPDATE public.registrations
SET checked_in = true,
    checked_in_at = coalesce(
        checked_in_at,
        CASE
            WHEN builder_center_raw->>'checkedInAt' ~ '^[0-9]+(\.[0-9]+)?$'
            THEN to_timestamp((builder_center_raw->>'checkedInAt')::double precision / 1000.0)
        END
    ),
    checked_in_by = coalesce(checked_in_by, nullif(builder_center_raw->>'checkedInBy', ''))
WHERE builder_center_raw->>'checkedIn' = 'true';

-- Prevent double/duplicate registrations for the same alias ID (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_registrations_builder_id 
ON public.registrations(lower(trim(builder_id)));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_checked_in 
ON public.registrations(checked_in);

-- 5. Drop unused diagnostic logs table (not in use by website or admin portal)
DROP TABLE IF EXISTS public.agent_sync_logs;

COMMIT;
