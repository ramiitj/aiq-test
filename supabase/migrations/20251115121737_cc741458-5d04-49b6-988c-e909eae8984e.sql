-- Update Product Manager Advanced to match standard advanced assessment pattern (80 questions, 80 minutes)
UPDATE public.assessment_products
SET 
  question_count = 80,
  duration_minutes = 80,
  total_points = 1280,
  passing_score = 1024,
  description = 'Advanced AI collaboration and strategy for senior product leaders'
WHERE slug = 'pm-advanced';