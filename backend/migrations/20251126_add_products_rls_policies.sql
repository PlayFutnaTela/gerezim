-- Migration: Add RLS Policies for Products Table
-- This fixes the "new row violates row-level security policy" error

-- Enable RLS on products table (if not already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view products (public read access)
CREATE POLICY "Public can view all products"
ON public.products
FOR SELECT
USING (true);

-- Policy 2: Authenticated users can insert their own products
-- Note: If your products table doesn't have a user_id column, 
-- you may need to add it first or modify this policy
CREATE POLICY "Authenticated users can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Authenticated users can update products
-- If you want to restrict updates to only the creator, add: WHERE user_id = auth.uid()
CREATE POLICY "Authenticated users can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 4: Authenticated users can delete products
-- If you want to restrict deletes to only the creator, add: WHERE user_id = auth.uid()
CREATE POLICY "Authenticated users can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (true);

-- OPTIONAL: If you want to add user_id tracking to products table
-- Uncomment the lines below if the products table doesn't have a user_id column yet:

-- ALTER TABLE public.products 
-- ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Then you could use more restrictive policies like:
-- CREATE POLICY "Users can update their own products"
-- ON public.products
-- FOR UPDATE
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);
