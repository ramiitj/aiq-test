-- Add test_version column to public_results if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'public_results' 
    AND column_name = 'test_version'
  ) THEN
    ALTER TABLE public.public_results 
    ADD COLUMN test_version TEXT DEFAULT 'professional';
  END IF;
END $$;