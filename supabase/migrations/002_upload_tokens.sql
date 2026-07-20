-- ============================================================
-- Rivomind HR — Upload Tokens Migration
-- Migration: 002_upload_tokens.sql
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- Upload tokens: secure one-time links for candidates to submit documents
CREATE TABLE public.upload_tokens (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    token        TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    is_used      BOOLEAN DEFAULT false,
    expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upload_tokens_token     ON public.upload_tokens(token);
CREATE INDEX idx_upload_tokens_applicant ON public.upload_tokens(applicant_id);

-- RLS: public read allowed for token validation (service role used for writes)
ALTER TABLE public.upload_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read upload tokens"
    ON public.upload_tokens FOR SELECT
    USING (true);

CREATE POLICY "System can insert upload tokens"
    ON public.upload_tokens FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update upload tokens"
    ON public.upload_tokens FOR UPDATE
    USING (true);

-- ============================================================
-- STORAGE SETUP (do this in Supabase Dashboard manually)
-- ============================================================
-- 1. Go to Storage → New Bucket
-- 2. Name: documents
-- 3. Public: OFF (private)
-- 4. Add storage policy (via SQL Editor):

-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage RLS policy — HR can read their own applicants' documents:
-- CREATE POLICY "HR can read own applicant documents"
--     ON storage.objects FOR SELECT
--     USING (
--         bucket_id = 'documents'
--         AND EXISTS (
--             SELECT 1 FROM public.applicants a
--             WHERE a.id::text = (storage.foldername(name))[1]
--             AND a.hr_id = auth.uid()
--         )
--     );

-- Service role can insert (used from API route):
-- CREATE POLICY "Service role can insert documents"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'documents');
-- ============================================================
