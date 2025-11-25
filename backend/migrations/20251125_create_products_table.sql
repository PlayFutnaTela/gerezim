-- Migration: Create products table + idempotent RLS policies
-- Date: 2025-11-25
-- Purpose: Ensure products table exists with the expected schema and safe policies.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text,
  price numeric DEFAULT 0,
  commission_percent numeric(5,2) DEFAULT 0 CHECK (commission_percent >= 0 AND commission_percent <= 100),
  category text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','active','inactive','archived')),
  tags text[] DEFAULT array[]::text[],
  stock int DEFAULT 0,
  images text[] DEFAULT array[]::text[],
  type text DEFAULT 'produto' CHECK (type IN ('produto','oportunidade')),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Idempotent policies
DO $$
BEGIN
  -- Ensure user_id column exists (add as nullable if table was created earlier without it).
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'user_id'
  ) THEN
    -- Add user_id as nullable reference so migration doesn't fail on existing rows
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'products' AND p.policyname = 'users_can_view_their_own_products'
  ) THEN
    EXECUTE 'CREATE POLICY users_can_view_their_own_products ON public.products FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'products' AND p.policyname = 'public_can_view_products'
  ) THEN
    EXECUTE 'CREATE POLICY public_can_view_products ON public.products FOR SELECT USING (true)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'products' AND p.policyname = 'users_can_insert_their_own_products'
  ) THEN
    EXECUTE 'CREATE POLICY users_can_insert_their_own_products ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'products' AND p.policyname = 'users_can_update_their_own_products'
  ) THEN
    EXECUTE 'CREATE POLICY users_can_update_their_own_products ON public.products FOR UPDATE USING (auth.uid() = user_id)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = 'products' AND p.policyname = 'users_can_delete_their_own_products'
  ) THEN
    EXECUTE 'CREATE POLICY users_can_delete_their_own_products ON public.products FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END$$;

-- Note: Run this file in Supabase SQL Editor. It is safe to run multiple times.
