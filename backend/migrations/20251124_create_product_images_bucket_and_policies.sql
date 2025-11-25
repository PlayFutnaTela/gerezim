-- Migration: Ensure product-images bucket exists and add storage policies
-- Date: 2025-11-24

-- Create bucket record (id must match actual storage bucket name)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for product-images
-- Allow public SELECT (if desired)
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies p
		WHERE p.schemaname = 'storage' AND p.tablename = 'objects' AND p.policyname = 'Public access to product images'
	) THEN
		EXECUTE 'CREATE POLICY "Public access to product images" ON storage.objects FOR SELECT USING ( bucket_id = ''product-images'' )';
	END IF;
END$$;

-- Allow authenticated users to upload to product-images
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies p
		WHERE p.schemaname = 'storage' AND p.tablename = 'objects' AND p.policyname = 'Authenticated users can upload product images'
	) THEN
		EXECUTE 'CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = ''product-images'' AND auth.role() = ''authenticated'' )';
	END IF;
END$$;

-- Allow updating own images
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies p
		WHERE p.schemaname = 'storage' AND p.tablename = 'objects' AND p.policyname = 'Users can update their own product images'
	) THEN
		EXECUTE 'CREATE POLICY "Users can update their own product images" ON storage.objects FOR UPDATE USING ( bucket_id = ''product-images'' AND auth.uid() = owner )';
	END IF;
END$$;

-- Allow deleting own images
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies p
		WHERE p.schemaname = 'storage' AND p.tablename = 'objects' AND p.policyname = 'Users can delete their own product images'
	) THEN
		EXECUTE 'CREATE POLICY "Users can delete their own product images" ON storage.objects FOR DELETE USING ( bucket_id = ''product-images'' AND auth.uid() = owner )';
	END IF;
END$$;

-- NOTE: Run this in the Supabase SQL editor or via your migration tool.
-- Ensure the actual storage bucket exists in the Supabase project, and adjust 'public' flag accordingly.
