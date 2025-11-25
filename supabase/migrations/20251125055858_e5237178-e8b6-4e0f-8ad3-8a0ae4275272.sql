-- Fix ac-beginner empty dimension codes
UPDATE assessment_products 
SET dimension_codes = '["AAI","FAA","ATP","ADA","CRA","EGC","SAC","TAS"]'::jsonb
WHERE slug = 'ac-beginner';