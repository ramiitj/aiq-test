-- Fix STORAGE_EXPOSURE: Remove remaining overly permissive policies
-- that allow all authenticated users to read assessment files

-- Drop all old permissive policies that allow authenticated users to read
DROP POLICY IF EXISTS "Authenticated users can download test items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read AIQ items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assessment files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view AIQ items" ON storage.objects;

-- Also clean up duplicate admin policies
DROP POLICY IF EXISTS "Admins can upload AIQ items" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update AIQ items" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete AIQ items" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload test items" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update test items" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete test items" ON storage.objects;

-- The only two policies that should exist are:
-- 1. "Admin can manage assessment files" (already exists from previous migration)
-- 2. "Service role can read assessment files" (already exists from previous migration)

-- Verify bucket is private
UPDATE storage.buckets 
SET public = false 
WHERE name = 'aiq-items';