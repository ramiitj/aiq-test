-- Widen overall_score column to support scores up to 2000 with 2 decimal places
ALTER TABLE public.public_results 
ALTER COLUMN overall_score TYPE NUMERIC(7,2);