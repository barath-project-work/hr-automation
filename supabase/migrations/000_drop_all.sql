-- ============================================================
-- DROP EVERYTHING — Run this FIRST to wipe the existing schema
-- Go to: Supabase → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Drop all tables (CASCADE removes foreign key dependencies automatically)
DROP TABLE IF EXISTS public.sync_logs         CASCADE;
DROP TABLE IF EXISTS public.notifications     CASCADE;
DROP TABLE IF EXISTS public.workspaces        CASCADE;
DROP TABLE IF EXISTS public.documents         CASCADE;
DROP TABLE IF EXISTS public.document_types    CASCADE;
DROP TABLE IF EXISTS public.status_history    CASCADE;
DROP TABLE IF EXISTS public.interviews        CASCADE;
DROP TABLE IF EXISTS public.applicants        CASCADE;
DROP TABLE IF EXISTS public.hr_requests       CASCADE;
DROP TABLE IF EXISTS public.profiles          CASCADE;
DROP TABLE IF EXISTS public.roles             CASCADE;

-- Drop any other custom tables you may have created
-- (add them here if needed)

-- Drop all custom ENUM types
DROP TYPE IF EXISTS sync_status        CASCADE;
DROP TYPE IF EXISTS notification_type  CASCADE;
DROP TYPE IF EXISTS document_status    CASCADE;
DROP TYPE IF EXISTS interview_status   CASCADE;
DROP TYPE IF EXISTS applicant_status   CASCADE;
DROP TYPE IF EXISTS request_status     CASCADE;
DROP TYPE IF EXISTS request_type       CASCADE;

-- Drop custom functions
DROP FUNCTION IF EXISTS update_updated_at()               CASCADE;
DROP FUNCTION IF EXISTS is_admin()                        CASCADE;
DROP FUNCTION IF EXISTS mark_passed_interviews()          CASCADE;
DROP FUNCTION IF EXISTS get_interviews_needing_reminders() CASCADE;

-- ============================================================
-- DONE — Now run 001_full_schema.sql in a NEW query tab
-- ============================================================
