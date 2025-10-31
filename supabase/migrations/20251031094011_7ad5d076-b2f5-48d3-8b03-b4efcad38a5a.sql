-- Fix 1: Remove duplicate email field from test_demographics (PII minimization)
-- The email is already stored in profiles table, no need to duplicate it

ALTER TABLE test_demographics DROP COLUMN IF EXISTS email;

-- Fix 2: Add rate limiting table for share code verification
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  count integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_time ON rate_limits(key, created_at);

-- Auto-cleanup old rate limit entries (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix 3: Create constant-time admin role check function
CREATE OR REPLACE FUNCTION public.check_admin_constant_time(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
  _sleep_time float;
BEGIN
  -- Check if user has admin role
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = 'admin'
  ) INTO _is_admin;
  
  -- Add small random delay to prevent timing attacks (50-100ms)
  _sleep_time := 0.05 + (random() * 0.05);
  PERFORM pg_sleep(_sleep_time);
  
  RETURN _is_admin;
END;
$$;