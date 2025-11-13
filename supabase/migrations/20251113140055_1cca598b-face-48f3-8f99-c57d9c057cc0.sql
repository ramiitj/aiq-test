-- Fix STORAGE_EXPOSURE: Make aiq-items bucket private and restrict access
UPDATE storage.buckets 
SET public = false 
WHERE name = 'aiq-items';

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Assessment files are publicly accessible" ON storage.objects;

-- Create admin-only access policy for assessment files
CREATE POLICY "Admin can manage assessment files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'aiq-items' 
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'aiq-items' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Service role can read assessment files (for Edge Functions)
CREATE POLICY "Service role can read assessment files"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'aiq-items');

-- Fix OTHER: Stricter test creation rate limiting
-- Update the check_test_rate_limit function to be more restrictive
CREATE OR REPLACE FUNCTION public.check_test_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
  daily_count INTEGER;
  incomplete_count INTEGER;
BEGIN
  -- Check hourly limit (reduced from 5 to 3)
  SELECT COUNT(*)
  INTO recent_count
  FROM public.tests
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded: You can only create 3 tests per hour. Please try again later.';
  END IF;
  
  -- Add daily limit
  SELECT COUNT(*)
  INTO daily_count
  FROM public.tests
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF daily_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: You can only create 10 tests per day. Please try again later.';
  END IF;
  
  -- Check for too many incomplete tests
  SELECT COUNT(*)
  INTO incomplete_count
  FROM public.tests
  WHERE user_id = NEW.user_id
    AND completed = false
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF incomplete_count >= 3 THEN
    RAISE EXCEPTION 'Please complete your existing tests before starting a new one. You have 3 incomplete tests.';
  END IF;
  
  RETURN NEW;
END;
$$;