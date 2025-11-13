-- Create assessment_products table
CREATE TABLE IF NOT EXISTS public.assessment_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  
  -- Categorization
  track TEXT NOT NULL CHECK (track IN ('general', 'adolescent', 'role-based')),
  role TEXT,
  age_group TEXT,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'advanced')),
  
  -- Assessment Details
  description TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  question_count INTEGER NOT NULL,
  json_file_path TEXT NOT NULL,
  
  -- Dimension tracking (for analytics)
  dimension_codes JSONB DEFAULT '[]'::jsonb,
  
  -- Scoring
  total_points INTEGER NOT NULL,
  passing_score INTEGER,
  
  -- Display
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_assessment_products_track ON public.assessment_products(track);
CREATE INDEX idx_assessment_products_slug ON public.assessment_products(slug);
CREATE INDEX idx_assessment_products_role ON public.assessment_products(role);
CREATE INDEX idx_assessment_products_is_active ON public.assessment_products(is_active);

-- Enable RLS
ALTER TABLE public.assessment_products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active assessments
CREATE POLICY "Anyone can view active assessments"
  ON public.assessment_products
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage assessments
CREATE POLICY "Admins can manage assessments"
  ON public.assessment_products
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add product tracking to tests table
ALTER TABLE public.tests
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.assessment_products(id),
ADD COLUMN IF NOT EXISTS product_slug TEXT;

-- Add product tracking to public_results table
ALTER TABLE public.public_results
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.assessment_products(id),
ADD COLUMN IF NOT EXISTS product_slug TEXT;

-- Create index for product queries
CREATE INDEX IF NOT EXISTS idx_tests_product_id ON public.tests(product_id);
CREATE INDEX IF NOT EXISTS idx_tests_product_slug ON public.tests(product_slug);
CREATE INDEX IF NOT EXISTS idx_public_results_product_id ON public.public_results(product_id);
CREATE INDEX IF NOT EXISTS idx_public_results_product_slug ON public.public_results(product_slug);

COMMENT ON TABLE public.assessment_products IS 'Catalog of all available assessment products across general, adolescent, and role-based tracks';
COMMENT ON COLUMN public.assessment_products.dimension_codes IS 'Array of dimension codes used in this assessment (e.g., ["SAU", "PEI", "CEC"])';
COMMENT ON COLUMN public.tests.product_id IS 'Reference to the assessment product taken';
COMMENT ON COLUMN public.public_results.product_id IS 'Reference to the assessment product for these results';