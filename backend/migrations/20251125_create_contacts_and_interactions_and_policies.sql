-- Migration: Create contacts and interactions tables + idempotent policies
-- Date: 2025-11-25
-- Purpose: Creates contacts & interactions tables if missing, enables RLS and creates safe, idempotent policies.

-- Ensure uuid extension (id generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  phone text,
  source text,
  interests text,
  status text DEFAULT 'novo' CHECK (status IN ('novo', 'quente', 'morno', 'frio')),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create interactions table (linked to contacts)
CREATE TABLE IF NOT EXISTS public.interactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (safe if already enabled)
ALTER TABLE IF EXISTS public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interactions ENABLE ROW LEVEL SECURITY;

-- Create idempotent policies for contacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'contacts' AND p.policyname = 'users_can_view_their_own_contacts'
  ) THEN
    EXECUTE 'CREATE POLICY users_can_view_their_own_contacts ON public.contacts FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'contacts' AND p.policyname = 'users_can_insert_their_own_contacts'
  ) THEN
    EXECUTE 'CREATE POLICY users_can_insert_their_own_contacts ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'contacts' AND p.policyname = 'users_can_update_their_own_contacts'
  ) THEN
    EXECUTE 'CREATE POLICY users_can_update_their_own_contacts ON public.contacts FOR UPDATE USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'contacts' AND p.policyname = 'users_can_delete_their_own_contacts'
  ) THEN
    EXECUTE 'CREATE POLICY users_can_delete_their_own_contacts ON public.contacts FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END$$;

-- Create idempotent policies for interactions (only allow access if the contact belongs to the user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'interactions' AND p.policyname = 'users_can_view_interactions_for_their_contacts'
  ) THEN
    EXECUTE $policy$CREATE POLICY users_can_view_interactions_for_their_contacts ON public.interactions
      FOR SELECT USING (
        exists (
          select 1 from public.contacts c where c.id = interactions.contact_id and c.user_id = auth.uid()
        )
      )$policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'interactions' AND p.policyname = 'users_can_insert_interactions_for_their_contacts'
  ) THEN
    EXECUTE $policy$CREATE POLICY users_can_insert_interactions_for_their_contacts ON public.interactions
      FOR INSERT WITH CHECK (
        exists (
          select 1 from public.contacts c where c.id = interactions.contact_id and c.user_id = auth.uid()
        )
      )$policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'interactions' AND p.policyname = 'users_can_update_interactions_for_their_contacts'
  ) THEN
    EXECUTE $policy$CREATE POLICY users_can_update_interactions_for_their_contacts ON public.interactions
      FOR UPDATE USING (
        exists (
          select 1 from public.contacts c where c.id = interactions.contact_id and c.user_id = auth.uid()
        )
      )$policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'interactions' AND p.policyname = 'users_can_delete_interactions_for_their_contacts'
  ) THEN
    EXECUTE $policy$CREATE POLICY users_can_delete_interactions_for_their_contacts ON public.interactions
      FOR DELETE USING (
        exists (
          select 1 from public.contacts c where c.id = interactions.contact_id and c.user_id = auth.uid()
        )
      )$policy$;
  END IF;
END$$;

-- Note:
-- Run this file in Supabase SQL Editor. This migration is safe to run multiple times (idempotent).
-- After running, verify by listing tables and policies.
