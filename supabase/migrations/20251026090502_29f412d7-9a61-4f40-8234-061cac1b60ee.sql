-- Add new columns to tests table for duration tracking
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS test_duration_seconds INTEGER;

-- Add new columns to public_results table for comprehensive user info
ALTER TABLE public_results 
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS test_completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS test_duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS percentile_rank NUMERIC(5,2);

-- Create function to calculate percentile ranking
CREATE OR REPLACE FUNCTION calculate_percentile(user_score NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  total_count INTEGER;
  lower_count INTEGER;
  percentile NUMERIC;
BEGIN
  -- Get total number of completed tests
  SELECT COUNT(*) INTO total_count
  FROM public_results
  WHERE overall_score IS NOT NULL;
  
  -- Get count of scores lower than user's score
  SELECT COUNT(*) INTO lower_count
  FROM public_results
  WHERE overall_score < user_score;
  
  -- Calculate percentile
  IF total_count > 0 THEN
    percentile := (lower_count::NUMERIC / total_count::NUMERIC) * 100;
  ELSE
    percentile := 50; -- Default to 50th percentile if no data
  END IF;
  
  RETURN ROUND(percentile, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;