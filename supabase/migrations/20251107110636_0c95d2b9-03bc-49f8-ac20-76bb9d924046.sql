-- Create security_violations table to log all security violations during assessments
CREATE TABLE public.security_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  violation_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_agent TEXT,
  additional_data JSONB
);

-- Enable RLS on security_violations
ALTER TABLE public.security_violations ENABLE ROW LEVEL SECURITY;

-- Users can insert their own violations
CREATE POLICY "Users can insert own violations"
ON public.security_violations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own violations
CREATE POLICY "Users can view own violations"
ON public.security_violations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all violations
CREATE POLICY "Admins can view all violations"
ON public.security_violations FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add security-related columns to tests table
ALTER TABLE public.tests 
ADD COLUMN security_consent_given BOOLEAN DEFAULT FALSE,
ADD COLUMN security_violations_count INTEGER DEFAULT 0,
ADD COLUMN security_terminated BOOLEAN DEFAULT FALSE;

-- Add security consent to test_demographics table
ALTER TABLE public.test_demographics
ADD COLUMN consent_security_monitoring BOOLEAN DEFAULT FALSE;

-- Create index for faster violation queries
CREATE INDEX idx_security_violations_test_id ON public.security_violations(test_id);
CREATE INDEX idx_security_violations_user_id ON public.security_violations(user_id);
CREATE INDEX idx_security_violations_timestamp ON public.security_violations(timestamp DESC);