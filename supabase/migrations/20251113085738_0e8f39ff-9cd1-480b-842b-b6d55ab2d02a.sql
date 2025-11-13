-- Update advanced tests to use 80 minutes duration and 80 questions (IRT-based selection: 80 items from 160)
UPDATE assessment_products
SET duration_minutes = 80, question_count = 80
WHERE slug IN (
  'pm-advanced',
  'ds-advanced',
  'dm-advanced',
  'ba-advanced',
  'sales-advanced',
  'ops-advanced',
  'hr-advanced',
  'sde-advanced'
);

-- Update adolescent 16-17 to use 50 minutes and 48 questions (as per JSON)
UPDATE assessment_products
SET duration_minutes = 50, question_count = 48
WHERE slug = 'adolescent-16-17';

-- Update adolescent 14-15 to use 24 minutes and 24 questions (as per JSON)
UPDATE assessment_products
SET duration_minutes = 24, question_count = 24
WHERE slug = 'adolescent-14-15';