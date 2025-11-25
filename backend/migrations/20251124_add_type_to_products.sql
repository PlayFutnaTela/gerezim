-- Migration: Add type column to products table
-- Date: 2025-11-24
-- Description: Add a column to distinguish between 'produto' and 'oportunidade'

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'produto' 
CHECK (type IN ('produto', 'oportunidade'));
