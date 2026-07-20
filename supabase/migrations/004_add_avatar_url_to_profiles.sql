-- ============================================================
-- Rivomind HR — Add avatar_url Column to Profiles
-- Migration: 004_add_avatar_url_to_profiles.sql
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1000);
