# 04 — Database Schema & Supabase Design

> **Document Purpose:** Define the complete database schema, including all tables, columns, constraints, indexes, relationships, Row-Level Security (RLS) policies, and Supabase configuration.

---

## 4.1 Schema Overview

The database contains **12 core tables** organized into logical groups:

```
Authentication & Users
├── roles (lookup)
├── profiles (extends auth.users)
│
HR Management
├── hr_profiles
├── hr_requests
│
Recruitment Pipeline
├── applicants (synced from Google Sheets)
├── interviews
├── status_history
│
Document Management
├── documents
├── document_types (lookup)
│
Workspace Management
├── workspaces
├── workspace_columns (Task Tracker columns)
│
Notifications
├── notifications
│
System
├── sync_logs (Google Sheet sync tracking)
```

---

## 4.2 Complete Table Definitions

### 4.2.1 `roles` (Lookup Table)

```sql
CREATE TABLE public.roles (
    id          SMALLSERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,        -- 'admin', 'hr'
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO public.roles (name, description) VALUES
    ('admin', 'Super user who manages HR accounts and system settings'),
    ('hr', 'Human Resources team member managing recruitment pipeline');
```

---

### 4.2.2 `profiles` (Extends Supabase Auth)

This table links Supabase Auth users to their application-level profile.

```sql
CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username        VARCHAR(100) UNIQUE NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    role_id         SMALLINT NOT NULL REFERENCES public.roles(id),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast role-based lookups
CREATE INDEX idx_profiles_role ON public.profiles(role_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_active ON public.profiles(is_active) WHERE is_active = true;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

**Notes:**
- `auth.users` is managed by Supabase Auth. When an admin creates an HR account, we:
  1. Call `supabase.auth.admin.createUser()` to create the auth user.
  2. Insert a corresponding row into `profiles`.
- The `profiles` table is the source of truth for application-level user data.

---

### 4.2.3 `hr_requests` (HR Account Requests)

When an HR needs a new account or a password reset, they submit a request that the Admin approves.

```sql
CREATE TYPE request_type AS ENUM ('new_account', 'password_reset');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.hr_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(100) NOT NULL,               -- The HR's username
    request_type    request_type NOT NULL,
    status          request_status DEFAULT 'pending',
    admin_id        UUID REFERENCES public.profiles(id), -- Admin who reviewed
    rejection_reason TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ                          -- When admin took action
);

CREATE INDEX idx_hr_requests_status ON public.hr_requests(status);
CREATE INDEX idx_hr_requests_created ON public.hr_requests(created_at DESC);
```

---

### 4.2.4 `applicants` (Core Recruitment Table)

This is the primary table synced from Google Sheets. Each HR sees only their linked applicants.

```sql
CREATE TYPE applicant_status AS ENUM (
    'pending',              -- New application, awaiting review
    'accepted',             -- HR accepted, moved to interview scheduling
    'interview_scheduled',  -- Interview scheduled, email sent
    'interview_completed',  -- Interview happened (or auto-marked after scheduled time)
    'selected',             -- Selected post-interview, agreement sent
    'document_collection',  -- Awaiting documents from candidate
    'documents_received',   -- Documents uploaded by candidate
    'documents_verified',   -- HR verified documents
    'workspace_created',    -- Workspace created in Google Drive
    'on_hold',              -- Put on hold by HR
    'rejected'              -- Rejected at any stage
);

CREATE TABLE public.applicants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hr_id               UUID NOT NULL REFERENCES public.profiles(id),      -- Assigned HR
    google_sheet_row    INTEGER,                                           -- Row number in Google Sheet
    full_name           VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(20),
    resume_url          TEXT,                                              -- Link to resume (from Google Sheet)
    additional_data     JSONB,                                             -- Any extra columns from Google Sheet
    status              applicant_status DEFAULT 'pending',
    interview_date      DATE,
    interview_time      TIME,
    meet_link           TEXT,                                              -- Google Meet link
    notes               TEXT,                                              -- HR's internal notes
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Critical indexes
CREATE INDEX idx_applicants_hr ON public.applicants(hr_id);
CREATE INDEX idx_applicants_status ON public.applicants(status);
CREATE INDEX idx_applicants_hr_status ON public.applicants(hr_id, status);
CREATE INDEX idx_applicants_email ON public.applicants(email);
CREATE INDEX idx_applicants_created ON public.applicants(created_at DESC);

-- Full-text search index for name/email search
CREATE INDEX idx_applicants_search ON public.applicants
    USING GIN(to_tsvector('english', full_name || ' ' || email));
```

---

### 4.2.5 `interviews` (Interview Records)

```sql
CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

CREATE TABLE public.interviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id    UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    hr_id           UUID NOT NULL REFERENCES public.profiles(id),
    interview_date  DATE NOT NULL,
    interview_time  TIME NOT NULL,
    meet_link       TEXT NOT NULL,                     -- Google Meet URL
    calendar_event_id TEXT,                            -- Google Calendar event ID
    status          interview_status DEFAULT 'scheduled',
    reminder_sent   BOOLEAN DEFAULT false,             -- Whether 20-min reminder was sent
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interviews_applicant ON public.interviews(applicant_id);
CREATE INDEX idx_interviews_date ON public.interviews(interview_date);
CREATE INDEX idx_interviews_pending_reminder
    ON public.interviews(interview_date, interview_time, status)
    WHERE reminder_sent = false AND status = 'scheduled';

-- Unique constraint: one active interview per applicant
CREATE UNIQUE INDEX idx_interviews_active_applicant
    ON public.interviews(applicant_id)
    WHERE status = 'scheduled';
```

---

### 4.2.6 `status_history` (Audit Trail)

Every status change is logged for complete auditability.

```sql
CREATE TABLE public.status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id    UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    old_status      applicant_status,
    new_status      applicant_status NOT NULL,
    changed_by      UUID NOT NULL REFERENCES public.profiles(id),   -- HR or Admin
    notes           TEXT,                                           -- Optional reason
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_applicant ON public.status_history(applicant_id);
CREATE INDEX idx_status_history_created ON public.status_history(created_at DESC);
```

---

### 4.2.7 `document_types` (Lookup Table)

```sql
CREATE TABLE public.document_types (
    id          SMALLSERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,   -- 'agreement_letter', 'aadhaar_card', 'marksheet'
    description TEXT,
    is_required BOOLEAN DEFAULT true
);

INSERT INTO public.document_types (name, description, is_required) VALUES
    ('agreement_letter', 'Signed agreement letter from the candidate', true),
    ('aadhaar_card', 'Government-issued Aadhaar card', true),
    ('marksheet', 'Current academic marksheet', true);
```

---

### 4.2.8 `documents` (Uploaded Documents)

```sql
CREATE TYPE document_status AS ENUM ('pending', 'received', 'verified', 'rejected');

CREATE TABLE public.documents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id      UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    document_type_id  SMALLINT NOT NULL REFERENCES public.document_types(id),
    file_path         TEXT NOT NULL,                     -- Supabase Storage path
    file_name         VARCHAR(255) NOT NULL,             -- Original file name
    file_size         INTEGER,                           -- Size in bytes
    mime_type         VARCHAR(100),                      -- application/pdf, image/jpeg, etc.
    status            document_status DEFAULT 'received',
    verified_by       UUID REFERENCES public.profiles(id),
    verified_at       TIMESTAMPTZ,
    rejection_reason  TEXT,
    uploaded_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_applicant ON public.documents(applicant_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_applicant_type
    ON public.documents(applicant_id, document_type_id);
```

---

### 4.2.9 `workspaces` (Google Drive Workspace)

```sql
CREATE TABLE public.workspaces (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id    UUID NOT NULL UNIQUE REFERENCES public.applicants(id) ON DELETE CASCADE,
    folder_id       TEXT NOT NULL,                       -- Google Drive folder ID
    folder_url      TEXT NOT NULL,                       -- Google Drive folder URL
    sheet_id        TEXT NOT NULL,                       -- Google Sheet ID for Task Tracker
    sheet_url       TEXT NOT NULL,                       -- Google Sheet URL
    created_by      UUID NOT NULL REFERENCES public.profiles(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workspaces_applicant ON public.workspaces(applicant_id);
```

---

### 4.2.10 `notifications`

```sql
CREATE TYPE notification_type AS ENUM (
    'interview_reminder',     -- 20 minutes before interview
    'documents_received',     -- Candidate uploaded documents
    'documents_verified',     -- HR verified documents
    'workspace_created',      -- Workspace created for candidate
    'hr_request_pending',     -- New HR request for admin
    'hr_request_approved',    -- HR request approved
    'hr_request_rejected'     -- HR request rejected
);

CREATE TABLE public.notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id),       -- Recipient (HR or Admin)
    notification_type notification_type NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    link            TEXT,                   -- Optional: URL to open when clicked
    is_read         BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread
    ON public.notifications(user_id, is_read)
    WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
```

---

### 4.2.11 `sync_logs` (Google Sheet Sync Tracking)

```sql
CREATE TYPE sync_status AS ENUM ('running', 'completed', 'failed');

CREATE TABLE public.sync_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hr_id           UUID REFERENCES public.profiles(id),
    sheet_url       TEXT NOT NULL,
    rows_read       INTEGER DEFAULT 0,
    new_applicants  INTEGER DEFAULT 0,
    status          sync_status DEFAULT 'running',
    error_message   TEXT,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_sync_logs_hr ON public.sync_logs(hr_id);
CREATE INDEX idx_sync_logs_status ON public.sync_logs(status);
```

---

## 4.3 Entity Relationship Diagram (Textual)

```
public.roles
    ├── id (PK)
    └── Referenced by: public.profiles.role_id

public.profiles (extends auth.users)
    ├── id (PK) ─────────────────────┐
    ├── role_id ───► public.roles    │
    └── is_active                    │
        │                            │
        ├── Referenced as:           │
        │   applicants.hr_id         │
        │   interviews.hr_id         │
        │   hr_requests.admin_id     │
        │   documents.verified_by    │
        │   workspaces.created_by    │
        │   status_history.changed_by│
        │   notifications.user_id    │
        │   sync_logs.hr_id         │
        │   hr_requests.admin_id    │
        └────────────────────────────┘

public.applicants
    ├── id (PK) ─────────────────────────────┐
    ├── hr_id ────► public.profiles.id       │
    ├── status                               │
    └── interview_date / interview_time      │
        │                                    │
        ├── Referenced by:                   │
        │   interviews.applicant_id          │
        │   status_history.applicant_id      │
        │   documents.applicant_id           │
        │   workspaces.applicant_id          │
        └────────────────────────────────────┘

public.interviews
    ├── id (PK)
    ├── applicant_id ──► public.applicants.id
    └── hr_id ─────────► public.profiles.id

public.status_history
    ├── id (PK)
    ├── applicant_id ──► public.applicants.id
    └── changed_by ────► public.profiles.id

public.documents
    ├── id (PK)
    ├── applicant_id ────► public.applicants.id
    ├── document_type_id ─► public.document_types.id
    └── verified_by ──────► public.profiles.id

public.workspaces
    ├── id (PK)
    ├── applicant_id ──► public.applicants.id
    └── created_by ────► public.profiles.id
```

---

## 4.4 Row-Level Security (RLS) Policies

Supabase RLS ensures that users can only access data they are authorized to see.

### Enable RLS on All Tables

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
```

### Policy Definitions

```sql
-- ============================================================
-- 1. PROFILES
-- ============================================================

-- Admin: can see all profiles
CREATE POLICY "Admin can see all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role_id = (SELECT id FROM public.roles WHERE name = 'admin')
        )
    );

-- Admin: can insert new profiles (create HR accounts)
CREATE POLICY "Admin can create HR profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role_id = (SELECT id FROM public.roles WHERE name = 'admin')
        )
    );

-- Admin: can update any profile
CREATE POLICY "Admin can update any profile"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role_id = (SELECT id FROM public.roles WHERE name = 'admin')
        )
    );

-- HR: can see their own profile only
CREATE POLICY "HR can see own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

-- ============================================================
-- 2. HR REQUESTS
-- ============================================================

-- Admin: can see all requests
CREATE POLICY "Admin can see all requests"
    ON public.hr_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role_id = (SELECT id FROM public.roles WHERE name = 'admin')
        )
    );

-- Admin: can update requests (approve/reject)
CREATE POLICY "Admin can update requests"
    ON public.hr_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role_id = (SELECT id FROM public.roles WHERE name = 'admin')
        )
    );

-- Anyone (unauthenticated): can create a request
CREATE POLICY "Anyone can create a request"
    ON public.hr_requests FOR INSERT
    WITH CHECK (true);

-- ============================================================
-- 3. APPLICANTS
-- ============================================================

-- HR: can see applicants assigned to them
CREATE POLICY "HR can see own applicants"
    ON public.applicants FOR SELECT
    USING (hr_id = auth.uid());

-- HR: can update applicants assigned to them
CREATE POLICY "HR can update own applicants"
    ON public.applicants FOR UPDATE
    USING (hr_id = auth.uid());

-- Admin: can see all applicants
CREATE POLICY "Admin can see all applicants"
    ON public.applicants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role_id = (SELECT id FROM public.roles WHERE name = 'admin')
        )
    );

-- ============================================================
-- 4. INTERVIEWS
-- ============================================================

-- HR: can see interviews for their applicants
CREATE POLICY "HR can see own interviews"
    ON public.interviews FOR SELECT
    USING (hr_id = auth.uid());

-- HR: can create/update interviews for their applicants
CREATE POLICY "HR can manage own interviews"
    ON public.interviews FOR INSERT
    WITH CHECK (hr_id = auth.uid());

CREATE POLICY "HR can update own interviews"
    ON public.interviews FOR UPDATE
    USING (hr_id = auth.uid());

-- ============================================================
-- 5. DOCUMENTS
-- ============================================================

-- HR: can see documents for their applicants
CREATE POLICY "HR can see own applicant documents"
    ON public.documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applicants a
            WHERE a.id = documents.applicant_id AND a.hr_id = auth.uid()
        )
    );

-- HR: can update documents (verify/reject)
CREATE POLICY "HR can update own applicant documents"
    ON public.documents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.applicants a
            WHERE a.id = documents.applicant_id AND a.hr_id = auth.uid()
        )
    );

-- ============================================================
-- 6. WORKSPACES
-- ============================================================

-- HR: can see workspaces for their applicants
CREATE POLICY "HR can see own applicant workspaces"
    ON public.workspaces FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applicants a
            WHERE a.id = workspaces.applicant_id AND a.hr_id = auth.uid()
        )
    );

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================

-- User: can see their own notifications
CREATE POLICY "User can see own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

-- User: can mark own notifications as read
CREATE POLICY "User can update own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());

-- System: can insert notifications (via service role)
CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);
```

---

## 4.5 Supabase Storage Buckets

```sql
-- Bucket for candidate documents
-- Name: candidate-documents
-- Public: false (private, access via RLS + signed URLs)

-- Bucket policies (using Supabase Storage SQL)
CREATE POLICY "HR can read own applicant documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'candidate-documents'
        AND EXISTS (
            SELECT 1 FROM public.applicants a
            WHERE a.id = (storage.foldername(name))[2]::UUID
            AND a.hr_id = auth.uid()
        )
    );

CREATE POLICY "Candidate can upload their own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'candidate-documents'
        -- Authenticated via upload portal token (not Supabase auth)
    );
```

**Storage Path Convention:**

```
candidate-documents/
├── {candidate_uuid}/
│   ├── agreement_letter_{timestamp}.pdf
│   ├── aadhaar_card_{timestamp}.pdf
│   └── marksheet_{timestamp}.pdf
```

---

## 4.6 Supabase Configuration

### Auth Settings

| Setting | Value |
|---------|-------|
| Auth Type | Username + Password (no email confirmation for HR accounts) |
| Session Duration | 24 hours |
| JWT Expiry | 3600 seconds (1 hour, auto-refreshed) |
| Password Min Length | 8 characters |
| Email Confirmation | Disabled for MVP (HR accounts created by Admin) |
| Allow Signups | Disabled (only Admin can create accounts) |

### Database Functions

```sql
-- Function to mark interview as completed (called by cron job)
CREATE OR REPLACE FUNCTION mark_passed_interviews()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.interviews
    SET status = 'completed', completed_at = NOW()
    WHERE status = 'scheduled'
      AND interview_date < CURRENT_DATE
      AND interview_time < CURRENT_TIME;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send interview reminders (called by cron job every minute)
CREATE OR REPLACE FUNCTION send_interview_reminders()
RETURNS TABLE(interview_id UUID, applicant_name VARCHAR, meet_link TEXT, hr_id UUID) AS $$
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
```

---

## 4.7 Indexing Strategy

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `applicants` | `idx_applicants_hr_status` | B-tree | Filter by HR + status (most common query) |
| `applicants` | `idx_applicants_search` | GIN | Full-text search on name/email |
| `applicants` | `idx_applicants_created` | B-tree DESC | Show newest first |
| `interviews` | `idx_interviews_pending_reminder` | Partial B-tree | Find interviews needing reminders |
| `notifications` | `idx_notifications_unread` | Partial B-tree | Count unread notifications |
| `documents` | `idx_documents_applicant_type` | B-tree | Lookup specific document type for applicant |
| `status_history` | `idx_status_history_applicant` | B-tree | Get all history for one applicant |

---

## 4.8 Migration Strategy

Migrations should be managed using **Supabase Migration Files** (SQL files in `supabase/migrations/`):

```
supabase/migrations/
├── 001_create_roles.sql
├── 002_create_profiles.sql
├── 003_create_hr_requests.sql
├── 004_create_applicants.sql
├── 005_create_interviews.sql
├── 006_create_status_history.sql
├── 007_create_document_types.sql
├── 008_create_documents.sql
├── 009_create_workspaces.sql
├── 010_create_notifications.sql
├── 011_create_sync_logs.sql
├── 012_create_indexes.sql
├── 013_create_rls_policies.sql
├── 014_create_storage_buckets.sql
├── 015_create_functions.sql
└── 016_seed_data.sql
```

Each migration is applied in order. The `supabase migration up` command applies pending migrations.

---

> **Next Document:** [05 — Authentication & Authorization System](./05-authentication-and-authorization-system.md)
