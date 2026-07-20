-- ============================================================
-- Rivomind HR — Full Database Schema
-- Migration: 001_full_schema.sql
-- Run this entire script in: Supabase → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- STEP 1: Custom ENUM Types
-- ============================================================

CREATE TYPE request_type    AS ENUM ('new_account', 'password_reset');
CREATE TYPE request_status  AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE applicant_status AS ENUM (
    'pending',
    'accepted',
    'interview_scheduled',
    'interview_completed',
    'selected',
    'document_collection',
    'documents_received',
    'documents_verified',
    'workspace_created',
    'on_hold',
    'rejected'
);

CREATE TYPE interview_status  AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE document_status   AS ENUM ('pending', 'received', 'verified', 'rejected');
CREATE TYPE notification_type AS ENUM (
    'interview_reminder',
    'documents_received',
    'documents_verified',
    'workspace_created',
    'hr_request_pending',
    'hr_request_approved',
    'hr_request_rejected'
);
CREATE TYPE sync_status AS ENUM ('running', 'completed', 'failed');

-- ============================================================
-- STEP 2: Shared updated_at trigger function
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STEP 3: roles (Lookup Table)
-- ============================================================

CREATE TABLE public.roles (
    id          SMALLSERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.roles (name, description) VALUES
    ('admin', 'Super user who manages HR accounts and system settings'),
    ('hr',    'Human Resources team member managing recruitment pipeline');

-- ============================================================
-- STEP 4: profiles (Extends Supabase Auth)
-- ============================================================

CREATE TABLE public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username    VARCHAR(100) UNIQUE NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    role_id     SMALLINT NOT NULL REFERENCES public.roles(id),
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role     ON public.profiles(role_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_active   ON public.profiles(is_active) WHERE is_active = true;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STEP 5: hr_requests
-- ============================================================

CREATE TABLE public.hr_requests (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username         VARCHAR(100) NOT NULL,
    request_type     request_type NOT NULL,
    status           request_status DEFAULT 'pending',
    admin_id         UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    resolved_at      TIMESTAMPTZ
);

CREATE INDEX idx_hr_requests_status  ON public.hr_requests(status);
CREATE INDEX idx_hr_requests_created ON public.hr_requests(created_at DESC);

-- ============================================================
-- STEP 6: applicants
-- ============================================================

CREATE TABLE public.applicants (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hr_id            UUID NOT NULL REFERENCES public.profiles(id),
    google_sheet_row INTEGER,
    full_name        VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    phone            VARCHAR(20),
    resume_url       TEXT,
    additional_data  JSONB,
    status           applicant_status DEFAULT 'pending',
    interview_date   DATE,
    interview_time   TIME,
    meet_link        TEXT,
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applicants_hr         ON public.applicants(hr_id);
CREATE INDEX idx_applicants_status     ON public.applicants(status);
CREATE INDEX idx_applicants_hr_status  ON public.applicants(hr_id, status);
CREATE INDEX idx_applicants_email      ON public.applicants(email);
CREATE INDEX idx_applicants_created    ON public.applicants(created_at DESC);
CREATE INDEX idx_applicants_search     ON public.applicants
    USING GIN(to_tsvector('english', full_name || ' ' || email));

CREATE TRIGGER trg_applicants_updated_at
    BEFORE UPDATE ON public.applicants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STEP 7: interviews
-- ============================================================

CREATE TABLE public.interviews (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id      UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    hr_id             UUID NOT NULL REFERENCES public.profiles(id),
    interview_date    DATE NOT NULL,
    interview_time    TIME NOT NULL,
    meet_link         TEXT NOT NULL,
    calendar_event_id TEXT,
    status            interview_status DEFAULT 'scheduled',
    reminder_sent     BOOLEAN DEFAULT false,
    completed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interviews_applicant ON public.interviews(applicant_id);
CREATE INDEX idx_interviews_date      ON public.interviews(interview_date);
CREATE INDEX idx_interviews_pending_reminder
    ON public.interviews(interview_date, interview_time, status)
    WHERE reminder_sent = false AND status = 'scheduled';

CREATE UNIQUE INDEX idx_interviews_active_applicant
    ON public.interviews(applicant_id)
    WHERE status = 'scheduled';

-- ============================================================
-- STEP 8: status_history (Audit Trail)
-- ============================================================

CREATE TABLE public.status_history (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    old_status   applicant_status,
    new_status   applicant_status NOT NULL,
    changed_by   UUID NOT NULL REFERENCES public.profiles(id),
    notes        TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_applicant ON public.status_history(applicant_id);
CREATE INDEX idx_status_history_created   ON public.status_history(created_at DESC);

-- ============================================================
-- STEP 9: document_types (Lookup)
-- ============================================================

CREATE TABLE public.document_types (
    id          SMALLSERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT true
);

INSERT INTO public.document_types (name, description, is_required) VALUES
    ('agreement_letter', 'Signed agreement letter from the candidate', true),
    ('aadhaar_card',     'Government-issued Aadhaar card',             true),
    ('marksheet',        'Current academic marksheet',                 true);

-- ============================================================
-- STEP 10: documents
-- ============================================================

CREATE TABLE public.documents (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id     UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    document_type_id SMALLINT NOT NULL REFERENCES public.document_types(id),
    file_path        TEXT NOT NULL,
    file_name        VARCHAR(255) NOT NULL,
    file_size        INTEGER,
    mime_type        VARCHAR(100),
    status           document_status DEFAULT 'received',
    verified_by      UUID REFERENCES public.profiles(id),
    verified_at      TIMESTAMPTZ,
    rejection_reason TEXT,
    uploaded_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_applicant      ON public.documents(applicant_id);
CREATE INDEX idx_documents_status         ON public.documents(status);
CREATE INDEX idx_documents_applicant_type ON public.documents(applicant_id, document_type_id);

-- ============================================================
-- STEP 11: workspaces
-- ============================================================

CREATE TABLE public.workspaces (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL UNIQUE REFERENCES public.applicants(id) ON DELETE CASCADE,
    folder_id    TEXT NOT NULL,
    folder_url   TEXT NOT NULL,
    sheet_id     TEXT NOT NULL,
    sheet_url    TEXT NOT NULL,
    created_by   UUID NOT NULL REFERENCES public.profiles(id),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workspaces_applicant ON public.workspaces(applicant_id);

-- ============================================================
-- STEP 12: notifications
-- ============================================================

CREATE TABLE public.notifications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES public.profiles(id),
    notification_type notification_type NOT NULL,
    title             VARCHAR(255) NOT NULL,
    message           TEXT NOT NULL,
    link              TEXT,
    is_read           BOOLEAN DEFAULT false,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user    ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread  ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================================
-- STEP 13: sync_logs
-- ============================================================

CREATE TABLE public.sync_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hr_id          UUID REFERENCES public.profiles(id),
    sheet_url      TEXT NOT NULL,
    rows_read      INTEGER DEFAULT 0,
    new_applicants INTEGER DEFAULT 0,
    status         sync_status DEFAULT 'running',
    error_message  TEXT,
    started_at     TIMESTAMPTZ DEFAULT NOW(),
    completed_at   TIMESTAMPTZ
);

CREATE INDEX idx_sync_logs_hr     ON public.sync_logs(hr_id);
CREATE INDEX idx_sync_logs_status ON public.sync_logs(status);

-- ============================================================
-- STEP 14: Row-Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs      ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role_id = (SELECT id FROM public.roles WHERE name = 'admin')
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---- PROFILES ----
CREATE POLICY "Admin can view all profiles"
    ON public.profiles FOR SELECT
    USING (is_admin());

CREATE POLICY "HR can view own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Admin can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admin can update any profile"
    ON public.profiles FOR UPDATE
    USING (is_admin());

CREATE POLICY "HR can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- ---- HR REQUESTS ----
CREATE POLICY "Admin can view all requests"
    ON public.hr_requests FOR SELECT
    USING (is_admin());

CREATE POLICY "Admin can update requests"
    ON public.hr_requests FOR UPDATE
    USING (is_admin());

-- Anyone (even unauthenticated) can submit a request
CREATE POLICY "Anyone can create a request"
    ON public.hr_requests FOR INSERT
    WITH CHECK (true);

-- ---- APPLICANTS ----
CREATE POLICY "HR can view own applicants"
    ON public.applicants FOR SELECT
    USING (hr_id = auth.uid());

CREATE POLICY "HR can update own applicants"
    ON public.applicants FOR UPDATE
    USING (hr_id = auth.uid());

CREATE POLICY "HR can insert applicants"
    ON public.applicants FOR INSERT
    WITH CHECK (hr_id = auth.uid());

CREATE POLICY "Admin can view all applicants"
    ON public.applicants FOR SELECT
    USING (is_admin());

-- ---- INTERVIEWS ----
CREATE POLICY "HR can view own interviews"
    ON public.interviews FOR SELECT
    USING (hr_id = auth.uid());

CREATE POLICY "HR can insert interviews"
    ON public.interviews FOR INSERT
    WITH CHECK (hr_id = auth.uid());

CREATE POLICY "HR can update own interviews"
    ON public.interviews FOR UPDATE
    USING (hr_id = auth.uid());

-- ---- STATUS HISTORY ----
CREATE POLICY "HR can view own applicant history"
    ON public.status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applicants a
            WHERE a.id = status_history.applicant_id AND a.hr_id = auth.uid()
        )
    );

CREATE POLICY "HR can insert history"
    ON public.status_history FOR INSERT
    WITH CHECK (changed_by = auth.uid());

CREATE POLICY "Admin can view all history"
    ON public.status_history FOR SELECT
    USING (is_admin());

-- ---- DOCUMENTS ----
CREATE POLICY "HR can view own applicant documents"
    ON public.documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applicants a
            WHERE a.id = documents.applicant_id AND a.hr_id = auth.uid()
        )
    );

CREATE POLICY "HR can update own applicant documents"
    ON public.documents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.applicants a
            WHERE a.id = documents.applicant_id AND a.hr_id = auth.uid()
        )
    );

-- Candidates upload via the portal (service role used — this policy supports direct inserts)
CREATE POLICY "System can insert documents"
    ON public.documents FOR INSERT
    WITH CHECK (true);

-- ---- WORKSPACES ----
CREATE POLICY "HR can view own applicant workspaces"
    ON public.workspaces FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applicants a
            WHERE a.id = workspaces.applicant_id AND a.hr_id = auth.uid()
        )
    );

CREATE POLICY "System can insert workspaces"
    ON public.workspaces FOR INSERT
    WITH CHECK (true);

-- ---- NOTIFICATIONS ----
CREATE POLICY "User can view own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "User can mark own notifications read"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- ---- SYNC LOGS ----
CREATE POLICY "HR can view own sync logs"
    ON public.sync_logs FOR SELECT
    USING (hr_id = auth.uid());

CREATE POLICY "Admin can view all sync logs"
    ON public.sync_logs FOR SELECT
    USING (is_admin());

CREATE POLICY "System can insert sync logs"
    ON public.sync_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update sync logs"
    ON public.sync_logs FOR UPDATE
    USING (true);

-- ============================================================
-- STEP 15: Database Functions
-- ============================================================

-- Auto-mark interviews as completed after their scheduled time passes
CREATE OR REPLACE FUNCTION mark_passed_interviews()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.interviews
    SET status = 'completed', completed_at = NOW()
    WHERE status = 'scheduled'
      AND (interview_date < CURRENT_DATE
        OR (interview_date = CURRENT_DATE AND interview_time < CURRENT_TIME));

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Return interviews that need a reminder (within 20 minutes)
-- Called by a cron/Edge Function
CREATE OR REPLACE FUNCTION get_interviews_needing_reminders()
RETURNS TABLE(
    interview_id  UUID,
    applicant_name VARCHAR,
    meet_link     TEXT,
    hr_id         UUID
) AS $$
BEGIN
    RETURN QUERY
    UPDATE public.interviews i
    SET reminder_sent = true
    FROM public.applicants a
    WHERE i.applicant_id = a.id
      AND i.status = 'scheduled'
      AND i.reminder_sent = false
      AND i.interview_date = CURRENT_DATE
      AND i.interview_time BETWEEN CURRENT_TIME AND (CURRENT_TIME + INTERVAL '20 minutes')
    RETURNING i.id, a.full_name, i.meet_link, i.hr_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DONE
-- ============================================================
-- After running this script:
-- 1. Go to Authentication > Settings: disable email confirmations, disable signups
-- 2. Create the admin user manually in Authentication > Users
-- 3. Run the seed snippet below to create the admin profile row:
--
--    INSERT INTO public.profiles (id, username, full_name, phone, role_id)
--    VALUES (
--        '<paste-admin-auth-user-uuid-here>',
--        'admin',
--        'Admin User',
--        '',
--        (SELECT id FROM public.roles WHERE name = 'admin')
--    );
-- ============================================================
