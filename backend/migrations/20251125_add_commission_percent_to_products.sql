-- Migration: Add commission_percent column to products
-- Date: 2025-11-25
-- Description: Stores the commission percentage (0-100) paid to the user for selling a product/opportunity

ALTER TABLE IF EXISTS products
ADD COLUMN IF NOT EXISTS commission_percent numeric(5,2) DEFAULT 0
CHECK (commission_percent >= 0 AND commission_percent <= 100);

-- NOTE: Apply this migration in your Supabase project or via your DB migration tooling.
