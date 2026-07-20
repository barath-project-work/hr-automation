-- ============================================================
-- Rivomind HR — Add Email Column to Profiles
-- Migration: 003_add_email_to_profiles.sql
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
