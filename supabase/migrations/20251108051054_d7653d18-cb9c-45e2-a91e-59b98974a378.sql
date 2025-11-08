-- Add foreign key constraints with CASCADE DELETE for test-related tables
-- This ensures when a test is deleted, all related records are automatically cleaned up

-- Add foreign key for test_demographics
ALTER TABLE public.test_demographics
DROP CONSTRAINT IF EXISTS test_demographics_test_id_fkey;

ALTER TABLE public.test_demographics
ADD CONSTRAINT test_demographics_test_id_fkey
FOREIGN KEY (test_id)
REFERENCES public.tests(id)
ON DELETE CASCADE;

-- Add foreign key for security_violations
ALTER TABLE public.security_violations
DROP CONSTRAINT IF EXISTS security_violations_test_id_fkey;

ALTER TABLE public.security_violations
ADD CONSTRAINT security_violations_test_id_fkey
FOREIGN KEY (test_id)
REFERENCES public.tests(id)
ON DELETE CASCADE;

-- Add foreign key for public_results
ALTER TABLE public.public_results
DROP CONSTRAINT IF EXISTS public_results_test_id_fkey;

ALTER TABLE public.public_results
ADD CONSTRAINT public_results_test_id_fkey
FOREIGN KEY (test_id)
REFERENCES public.tests(id)
ON DELETE CASCADE;