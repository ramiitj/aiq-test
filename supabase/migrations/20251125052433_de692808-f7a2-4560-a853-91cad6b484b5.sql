-- Update Sales Professional Beginner assessment
UPDATE public.assessment_products
SET 
  dimension_codes = '["SAI", "LPO", "CII", "SFP", "CAE", "PWO", "ETC", "TSI"]',
  json_file_path = 'sales-beginner.json',
  total_points = 600,
  passing_score = 420,
  presentation_mode = 'fixed-sequential',
  adaptive_selection = false,
  irt_enabled = false,
  target_audience = 'Sales professionals, account executives, business development representatives, sales managers, CRM administrators, customer success managers',
  description = 'Foundational AI literacy for sales and CRM professionals'
WHERE slug = 'sales-beginner';

-- Update Sales Professional Advanced assessment
UPDATE public.assessment_products
SET 
  dimension_codes = '["SAI", "LPO", "CAC", "FOA", "PER", "ETC", "TSI", "STR"]',
  json_file_path = 'sales-advanced.json',
  total_points = 800,
  passing_score = 640,
  total_bank_items = 160,
  presentation_mode = 'adaptive-sequential',
  adaptive_selection = true,
  irt_enabled = true,
  target_audience = 'Chief Revenue Officer, VP Sales, Head of Sales Enablement, Sales Operations Leader, AI Sales Transformation Executive',
  description = 'Expert-level AI literacy for sales leadership'
WHERE slug = 'sales-advanced';

-- Update Software Development Engineer Beginner assessment
UPDATE public.assessment_products
SET 
  dimension_codes = '["AIC", "MIA", "DPM", "PAO", "TDE", "SRC", "UIF", "ADE"]',
  json_file_path = 'sde-beginner.json',
  total_points = 600,
  passing_score = 420,
  presentation_mode = 'fixed-sequential',
  adaptive_selection = false,
  irt_enabled = false,
  target_audience = 'Software engineers, backend/frontend/full-stack engineers, engineering leads',
  description = 'Foundational AI literacy for software development engineers'
WHERE slug = 'sde-beginner';

-- Update Software Development Engineer Advanced assessment
UPDATE public.assessment_products
SET 
  dimension_codes = '["AIA", "MLE", "DSE", "PAI", "SRS", "IAT", "TQA", "DAE"]',
  json_file_path = 'sde-advanced.json',
  total_points = 800,
  passing_score = 640,
  total_bank_items = 160,
  presentation_mode = 'adaptive-sequential',
  adaptive_selection = true,
  irt_enabled = true,
  target_audience = 'Senior SDE, technical leads, staff/principal engineers, AI/ML engineers, software architects',
  description = 'Expert-level AI literacy for software engineering leadership'
WHERE slug = 'sde-advanced';