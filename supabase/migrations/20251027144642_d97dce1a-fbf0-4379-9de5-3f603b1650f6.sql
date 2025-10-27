-- Add test_version column to tests table
ALTER TABLE public.tests 
ADD COLUMN IF NOT EXISTS test_version TEXT NOT NULL DEFAULT 'beginner' 
CHECK (test_version IN ('beginner', 'professional', 'expert'));

-- Add test_version column to public_results table
ALTER TABLE public.public_results
ADD COLUMN IF NOT EXISTS test_version TEXT NOT NULL DEFAULT 'beginner' 
CHECK (test_version IN ('beginner', 'professional', 'expert'));

-- Update existing records to have beginner version
UPDATE public.tests 
SET test_version = 'beginner' 
WHERE test_version IS NULL;

UPDATE public.public_results 
SET test_version = 'beginner' 
WHERE test_version IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_tests_version ON public.tests(test_version);
CREATE INDEX IF NOT EXISTS idx_public_results_version ON public.public_results(test_version);