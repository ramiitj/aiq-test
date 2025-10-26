-- Fix search_path security issue for calculate_percentile function
DROP FUNCTION IF EXISTS calculate_percentile(NUMERIC);

CREATE OR REPLACE FUNCTION calculate_percentile(user_score NUMERIC)
RETURNS NUMERIC 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;