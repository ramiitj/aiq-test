-- Backward compatibility migration: Map existing test records to general assessment products

-- Update beginner tests to general-beginner product
UPDATE public.tests
SET 
  product_id = (SELECT id FROM public.assessment_products WHERE slug = 'general-beginner' LIMIT 1),
  product_slug = 'general-beginner'
WHERE test_version = 'beginner' 
  AND product_id IS NULL;

-- Update advanced tests to general-advanced product  
UPDATE public.tests
SET 
  product_id = (SELECT id FROM public.assessment_products WHERE slug = 'general-advanced' LIMIT 1),
  product_slug = 'general-advanced'
WHERE test_version = 'advanced' 
  AND product_id IS NULL;

-- Update professional/expert tests (legacy names) to advanced
UPDATE public.tests
SET 
  product_id = (SELECT id FROM public.assessment_products WHERE slug = 'general-advanced' LIMIT 1),
  product_slug = 'general-advanced'
WHERE test_version IN ('professional', 'expert')
  AND product_id IS NULL;

-- Update public_results for beginner tests
UPDATE public.public_results
SET 
  product_id = (SELECT id FROM public.assessment_products WHERE slug = 'general-beginner' LIMIT 1),
  product_slug = 'general-beginner'
WHERE test_version = 'beginner' 
  AND product_id IS NULL;

-- Update public_results for advanced tests
UPDATE public.public_results
SET 
  product_id = (SELECT id FROM public.assessment_products WHERE slug = 'general-advanced' LIMIT 1),
  product_slug = 'general-advanced'
WHERE test_version IN ('advanced', 'professional', 'expert')
  AND product_id IS NULL;