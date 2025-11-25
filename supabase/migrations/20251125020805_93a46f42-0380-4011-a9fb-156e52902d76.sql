-- Add new columns for IRT configuration and update assessment_products
ALTER TABLE assessment_products 
ADD COLUMN IF NOT EXISTS presentation_mode text DEFAULT 'fixed-sequential',
ADD COLUMN IF NOT EXISTS total_bank_items integer,
ADD COLUMN IF NOT EXISTS adaptive_selection boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS irt_enabled boolean DEFAULT false;

-- Update General Beginner
UPDATE assessment_products 
SET 
  duration_minutes = 60,
  question_count = 60,
  total_points = 600,
  passing_score = 420,
  presentation_mode = 'fixed-sequential',
  total_bank_items = 60,
  adaptive_selection = false,
  irt_enabled = false
WHERE slug = 'general-beginner';

-- Update General Advanced with corrected 800 points, 640 passing
UPDATE assessment_products 
SET 
  duration_minutes = 80,
  question_count = 80,
  total_points = 800,
  passing_score = 640,
  presentation_mode = 'adaptive-sequential',
  total_bank_items = 160,
  adaptive_selection = true,
  irt_enabled = true
WHERE slug = 'general-advanced';

-- Update Adolescent 14-15
UPDATE assessment_products 
SET 
  duration_minutes = 25,
  question_count = 24,
  total_points = 240,
  passing_score = 168,
  presentation_mode = 'fixed-sequential',
  total_bank_items = 24,
  adaptive_selection = false,
  irt_enabled = false
WHERE slug = 'adolescent-14-15';

-- Update Adolescent 16-17
UPDATE assessment_products 
SET 
  duration_minutes = 50,
  question_count = 48,
  total_points = 480,
  passing_score = 336,
  presentation_mode = 'fixed-sequential',
  total_bank_items = 48,
  adaptive_selection = false,
  irt_enabled = false
WHERE slug = 'adolescent-16-17';