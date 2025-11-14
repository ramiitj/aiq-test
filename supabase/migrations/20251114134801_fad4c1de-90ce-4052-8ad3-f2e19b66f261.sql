-- Add test_started flag to track when test actually begins
ALTER TABLE public.tests 
ADD COLUMN IF NOT EXISTS test_started boolean DEFAULT false;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_tests_test_started ON public.tests(test_started, user_id, created_at);

-- Drop the existing INSERT trigger for rate limiting
DROP TRIGGER IF EXISTS enforce_test_rate_limit ON public.tests;

-- Create new function that checks rate limits only when test_started becomes true
CREATE OR REPLACE FUNCTION public.check_test_start_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recent_started_count INTEGER;
  daily_started_count INTEGER;
  incomplete_started_count INTEGER;
BEGIN
  -- Only check when test_started changes from false to true
  IF (OLD.test_started = false AND NEW.test_started = true) OR 
     (OLD IS NULL AND NEW.test_started = true) THEN
    
    -- Check hourly limit for STARTED tests
    SELECT COUNT(*)
    INTO recent_started_count
    FROM public.tests
    WHERE user_id = NEW.user_id
      AND test_started = true
      AND created_at > NOW() - INTERVAL '1 hour';
    
    IF recent_started_count >= 3 THEN
      RAISE EXCEPTION 'Rate limit exceeded: You can only start 3 tests per hour. Please try again later.';
    END IF;
    
    -- Check daily limit for STARTED tests
    SELECT COUNT(*)
    INTO daily_started_count
    FROM public.tests
    WHERE user_id = NEW.user_id
      AND test_started = true
      AND created_at > NOW() - INTERVAL '24 hours';
    
    IF daily_started_count >= 10 THEN
      RAISE EXCEPTION 'Rate limit exceeded: You can only start 10 tests per day. Please try again later.';
    END IF;
    
    -- Check for too many incomplete STARTED tests
    SELECT COUNT(*)
    INTO incomplete_started_count
    FROM public.tests
    WHERE user_id = NEW.user_id
      AND test_started = true
      AND completed = false
      AND created_at > NOW() - INTERVAL '24 hours';
    
    IF incomplete_started_count >= 3 THEN
      RAISE EXCEPTION 'Please complete your existing tests before starting a new one. You have 3 incomplete tests.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add UPDATE trigger to check rate limits when test_started becomes true
CREATE TRIGGER enforce_test_start_rate_limit
BEFORE UPDATE ON public.tests
FOR EACH ROW
EXECUTE FUNCTION public.check_test_start_rate_limit();

COMMENT ON COLUMN public.tests.test_started IS 'Indicates whether the user has actually started answering questions (rate limits apply when this becomes true)';
COMMENT ON FUNCTION public.check_test_start_rate_limit() IS 'Rate limits are enforced only when a test is actually started (first question displayed), not when test record is created during demographics phase';