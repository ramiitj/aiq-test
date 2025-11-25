-- Fix sales-advanced which has both ETC and ETS incorrectly
UPDATE assessment_products 
SET dimension_codes = '["SAI","LPO","CAC","FOA","PER","ETS","TSI","STR"]'::jsonb
WHERE slug = 'sales-advanced';