-- Migration: Drop SKU constraint and column from products
-- Date: 2025-11-24

-- Drop unique constraint on sku (if present)
ALTER TABLE IF EXISTS products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Drop the column sku if it exists
ALTER TABLE IF EXISTS products DROP COLUMN IF EXISTS sku;

-- NOTE:
-- Apply this migration in your Supabase SQL editor or via your DB migration tool.
-- This will permanently remove the SKU column and its unique constraint.
