-- Enable RLS on rate_limits table
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow edge functions (service role) to access rate limits
CREATE POLICY "Service role can manage rate limits"
ON rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);