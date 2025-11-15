-- Insert Product Manager Advanced assessment
INSERT INTO public.assessment_products (
  slug,
  name,
  track,
  role,
  difficulty_level,
  duration_minutes,
  question_count,
  description,
  target_audience,
  total_points,
  passing_score,
  dimension_codes,
  json_file_path,
  display_order,
  is_active
) VALUES (
  'pm-advanced',
  'Product Manager - Advanced',
  'role-based',
  'Product Manager',
  'advanced',
  150,
  160,
  'Advanced-level AI literacy assessment for product managers with 160 unique professional questions covering expert product strategy, AI feature development, and market positioning',
  'Senior product managers, VP/CPO-level leaders, AI product strategists, product executives leading AI transformation',
  1600,
  1280,
  '["PAI", "AIF", "UEA", "PDM", "RDC", "SMI", "PRL", "CPE"]'::jsonb,
  'pm-advanced.json',
  6,
  true
);

-- Update display_order for all subsequent assessments (increment by 1)
UPDATE public.assessment_products
SET display_order = display_order + 1
WHERE display_order >= 6 AND slug != 'pm-advanced';