-- Fix storage policy to require authentication
DROP POLICY IF EXISTS "Anyone can view AIQ items" ON storage.objects;

CREATE POLICY "Authenticated users can read AIQ items"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'aiq-items');

-- Drop overly permissive public_results policy
DROP POLICY IF EXISTS "Public access via valid share code" ON public.public_results;