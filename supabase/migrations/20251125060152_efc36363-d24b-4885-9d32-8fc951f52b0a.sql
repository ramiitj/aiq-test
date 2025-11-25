-- Fix adolescent-14-15 dimension codes to match JSON file
UPDATE assessment_products 
SET dimension_codes = '["SAU","PEI","CEC","II","ALC","EJC","CS","CRS"]'::jsonb
WHERE slug = 'adolescent-14-15';

-- Fix adolescent-16-17 with same standard dimensions
UPDATE assessment_products 
SET dimension_codes = '["SAU","PEI","CEC","II","ALC","EJC","CS","CRS"]'::jsonb
WHERE slug = 'adolescent-16-17';