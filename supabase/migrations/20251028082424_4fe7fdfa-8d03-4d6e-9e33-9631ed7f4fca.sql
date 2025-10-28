-- Create test_demographics table to store comprehensive demographic and consent data
CREATE TABLE public.test_demographics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Section 1: Basic Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  
  -- Section 2: Professional Background
  job_role TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  organization_size TEXT,
  industry_sector TEXT NOT NULL,
  years_experience TEXT NOT NULL,
  
  -- Section 3: AI Experience
  ai_familiarity TEXT NOT NULL,
  ai_tools_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_usage_frequency TEXT NOT NULL,
  ai_use_cases JSONB DEFAULT '[]'::jsonb,
  ai_training TEXT NOT NULL,
  
  -- Section 4: Assessment Purpose
  assessment_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  assessment_tier TEXT NOT NULL,
  results_usage JSONB DEFAULT '[]'::jsonb,
  
  -- Section 5: Optional Demographics
  age_range TEXT,
  education_level TEXT,
  country TEXT,
  primary_language TEXT,
  technical_background TEXT,
  
  -- Section 6: Consent Flags
  consent_assessment BOOLEAN NOT NULL DEFAULT false,
  consent_data_usage BOOLEAN NOT NULL DEFAULT false,
  consent_results_access BOOLEAN NOT NULL DEFAULT false,
  consent_research BOOLEAN DEFAULT false,
  consent_communications BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(test_id)
);

-- Enable Row Level Security
ALTER TABLE public.test_demographics ENABLE ROW LEVEL SECURITY;

-- Users can insert their own demographics
CREATE POLICY "Users can insert own demographics"
ON public.test_demographics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own demographics
CREATE POLICY "Users can view own demographics"
ON public.test_demographics
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own demographics
CREATE POLICY "Users can update own demographics"
ON public.test_demographics
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all demographics
CREATE POLICY "Admins can view all demographics"
ON public.test_demographics
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_test_demographics_test_id ON public.test_demographics(test_id);
CREATE INDEX idx_test_demographics_user_id ON public.test_demographics(user_id);