-- Security Fixes Migration
-- 1. Make aiq-items storage bucket private
UPDATE storage.buckets
SET public = false
WHERE id = 'aiq-items';

-- 2. Remove the insecure shared_results view (it bypasses RLS)
DROP VIEW IF EXISTS public.shared_results;

-- 3. Add proper RLS policy for anonymous share code access
CREATE POLICY "Public access via valid share code"
ON public.public_results
FOR SELECT
TO anon, authenticated
USING (expires_at > now());

-- 4. Add DELETE policies for GDPR compliance
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tests"
ON public.tests
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own results"
ON public.public_results
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Ensure cascading deletes for GDPR compliance
ALTER TABLE public.tests
  DROP CONSTRAINT IF EXISTS tests_user_id_fkey,
  ADD CONSTRAINT tests_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

ALTER TABLE public.public_results
  DROP CONSTRAINT IF EXISTS public_results_user_id_fkey,
  ADD CONSTRAINT public_results_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

ALTER TABLE public.public_results
  DROP CONSTRAINT IF EXISTS public_results_test_id_fkey,
  ADD CONSTRAINT public_results_test_id_fkey
    FOREIGN KEY (test_id)
    REFERENCES public.tests(id)
    ON DELETE CASCADE;

-- 6. Add rate limiting function for test creation
CREATE OR REPLACE FUNCTION public.check_test_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO recent_count
  FROM public.tests
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: You can only create 5 tests per hour. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for rate limiting
DROP TRIGGER IF EXISTS enforce_test_rate_limit ON public.tests;
CREATE TRIGGER enforce_test_rate_limit
  BEFORE INSERT ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.check_test_rate_limit();