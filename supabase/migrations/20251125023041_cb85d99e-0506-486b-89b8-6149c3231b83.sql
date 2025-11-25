-- Insert Accounting & Finance Beginner Assessment
INSERT INTO assessment_products (
  slug, name, track, role, difficulty_level, description, target_audience,
  duration_minutes, question_count, total_points, passing_score,
  presentation_mode, total_bank_items, adaptive_selection, irt_enabled,
  json_file_path, is_active, display_order
) VALUES (
  'ac-beginner',
  'Accounting & Finance - Beginner',
  'role-based',
  'Accounting & Finance',
  'beginner',
  'Foundational AI literacy assessment for accounting and finance professionals',
  'Accountants, financial analysts, auditors, tax professionals, and finance managers',
  60,
  60,
  600,
  420,
  'fixed-sequential',
  60,
  false,
  false,
  'ac-beginner.json',
  true,
  100
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  total_points = EXCLUDED.total_points,
  passing_score = EXCLUDED.passing_score,
  presentation_mode = EXCLUDED.presentation_mode,
  total_bank_items = EXCLUDED.total_bank_items,
  adaptive_selection = EXCLUDED.adaptive_selection,
  irt_enabled = EXCLUDED.irt_enabled;

-- Insert Accounting & Finance Advanced Assessment
INSERT INTO assessment_products (
  slug, name, track, role, difficulty_level, description, target_audience,
  duration_minutes, question_count, total_points, passing_score,
  presentation_mode, total_bank_items, adaptive_selection, irt_enabled,
  json_file_path, is_active, display_order
) VALUES (
  'ac-advanced',
  'Accounting & Finance - Advanced',
  'role-based',
  'Accounting & Finance',
  'advanced',
  'Expert-level AI literacy assessment for CFOs, VPs, Controllers, and finance leaders',
  'CFO, VP Finance, Controller, Head of Accounting, Finance Transformation Leader',
  80,
  80,
  800,
  640,
  'adaptive-sequential',
  160,
  true,
  true,
  'ac-advanced.json',
  true,
  101
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  total_points = EXCLUDED.total_points,
  passing_score = EXCLUDED.passing_score,
  presentation_mode = EXCLUDED.presentation_mode,
  total_bank_items = EXCLUDED.total_bank_items,
  adaptive_selection = EXCLUDED.adaptive_selection,
  irt_enabled = EXCLUDED.irt_enabled;

-- Update Business Analyst Beginner with correct specs
UPDATE assessment_products 
SET 
  name = 'Business Analyst - Beginner',
  role = 'Business Analyst',
  description = 'Foundational AI literacy assessment for business analysis professionals',
  target_audience = 'Business analysts, requirements analysts, systems analysts',
  duration_minutes = 60,
  question_count = 60,
  total_points = 600,
  passing_score = 420,
  presentation_mode = 'fixed-sequential',
  total_bank_items = 60,
  adaptive_selection = false,
  irt_enabled = false,
  json_file_path = 'ba-beginner.json'
WHERE slug = 'ba-beginner';

-- Update Business Analyst Advanced with correct specs
UPDATE assessment_products 
SET 
  name = 'Business Analyst - Advanced',
  role = 'Business Analyst',
  description = 'Expert-level AI literacy assessment for senior business analysts and BA leaders',
  target_audience = 'Senior business analysts, lead BAs, business analysis managers, enterprise architects',
  duration_minutes = 80,
  question_count = 80,
  total_points = 800,
  passing_score = 640,
  presentation_mode = 'adaptive-sequential',
  total_bank_items = 160,
  adaptive_selection = true,
  irt_enabled = true,
  json_file_path = 'ba-advanced.json'
WHERE slug = 'ba-advanced';