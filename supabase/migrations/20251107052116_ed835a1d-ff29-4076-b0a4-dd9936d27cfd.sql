-- Update the test_version check constraint to allow 'beginner' and 'advanced'
-- Drop the old constraint
ALTER TABLE public.tests DROP CONSTRAINT IF EXISTS tests_test_version_check;

-- Add the updated constraint with new allowed values
ALTER TABLE public.tests ADD CONSTRAINT tests_test_version_check 
  CHECK (test_version IN ('beginner', 'advanced', 'professional', 'expert'));

-- Note: We keep 'professional' and 'expert' for backward compatibility with existing data