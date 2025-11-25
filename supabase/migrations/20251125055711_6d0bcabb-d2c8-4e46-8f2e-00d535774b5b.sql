-- Fix empty and incorrect dimension_codes for assessments

-- Fix ac-advanced (currently empty)
UPDATE assessment_products 
SET dimension_codes = '["AAI","FAA","ATP","ADA","CRA","EGC","SAC","TAS"]'::jsonb
WHERE slug = 'ac-advanced';

-- Fix ba-advanced (currently showing wrong generic codes)
UPDATE assessment_products 
SET dimension_codes = '["BAI","RDA","DIA","PSM","STE","ABV","CCI","TDA"]'::jsonb
WHERE slug = 'ba-advanced';

-- Fix dm-beginner and dm-advanced if they're showing generic codes
UPDATE assessment_products 
SET dimension_codes = '["MAI","CAC","CSI","CPO","PMM","PEC","ETC","TAP"]'::jsonb
WHERE slug = 'dm-beginner';

UPDATE assessment_products 
SET dimension_codes = '["SMA","AAD","AOM","AAM","AEX","AET","ALG","ATR"]'::jsonb
WHERE slug = 'dm-advanced';

-- Resolve dimension code conflicts by making codes globally unique with role context
-- PDM conflict: Product Manager vs Doctors
-- Change Product Manager PDM to PMD (Product Manager - Data)
UPDATE assessment_products 
SET dimension_codes = jsonb_set(dimension_codes, '{3}', '"PMD"')
WHERE slug IN ('pm-beginner', 'pm-advanced') 
  AND dimension_codes ? 'PDM';

-- DPM conflict: Product Manager (Data & Prompt Management) vs SDE
-- Change SDE DPM to DPE (Data & Prompt Engineering)
UPDATE assessment_products 
SET dimension_codes = jsonb_set(dimension_codes, '{2}', '"DPE"')
WHERE slug = 'sde-beginner' 
  AND dimension_codes ? 'DPM';

-- PAI conflict: Product Manager vs SDE
-- Change SDE PAI to AIP (AI Product Integration)
UPDATE assessment_products 
SET dimension_codes = jsonb_set(dimension_codes, '{3}', '"AIP"')
WHERE slug = 'sde-advanced' 
  AND dimension_codes ? 'PAI';

-- ETC appears in both Sales and Digital Marketer
-- Change Sales ETC to ETS (Ethics, Trust & Sales Compliance)
UPDATE assessment_products 
SET dimension_codes = jsonb_set(
  jsonb_set(dimension_codes, '{6}', '"ETS"'),
  '{7}', 
  dimension_codes->7
)
WHERE slug IN ('sales-beginner', 'sales-advanced') 
  AND dimension_codes ? 'ETC';

-- SAI might have conflicts - verify uniqueness
-- If Sales uses SAI, keep it as Sales-specific
COMMENT ON TABLE assessment_products IS 'Updated dimension codes to resolve conflicts and fix empty/incorrect arrays';