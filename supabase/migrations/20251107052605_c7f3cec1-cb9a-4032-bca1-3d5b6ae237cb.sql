-- Update the test_version check constraint on public_results to allow 'beginner' and 'advanced'
-- Drop the old constraint
ALTER TABLE public.public_results DROP CONSTRAINT IF EXISTS public_results_test_version_check;

-- Add the updated constraint with new allowed values
ALTER TABLE public.public_results ADD CONSTRAINT public_results_test_version_check 
  CHECK (test_version IN ('beginner', 'advanced', 'professional', 'expert'));

-- Note: We keep 'professional' and 'expert' for backward compatibility with existing data