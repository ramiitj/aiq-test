-- Check and update storage bucket to be public for assessment files
UPDATE storage.buckets 
SET public = true 
WHERE name = 'aiq-items';

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Assessment files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assessment files" ON storage.objects;

-- Add storage policies for public access to assessment files
CREATE POLICY "Assessment files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'aiq-items');

-- Allow authenticated users to upload assessment files (for admin uploads)
CREATE POLICY "Authenticated users can upload assessment files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'aiq-items' AND auth.role() = 'authenticated');