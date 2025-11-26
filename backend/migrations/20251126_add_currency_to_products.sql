-- Migration: Add currency field to products table
-- Purpose: Allow products to be priced in different currencies (BRL, EUR, USD)
-- Date: 2025-11-26

-- Create ENUM type for currency
CREATE TYPE public.currency_type AS ENUM ('BRL', 'EUR', 'USD');

-- Add currency column to products table with default BRL
ALTER TABLE public.products
ADD COLUMN currency public.currency_type DEFAULT 'BRL' NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.products.currency IS 'Currency for product pricing: BRL (Brazilian Real), EUR (Euro), USD (US Dollar)';
