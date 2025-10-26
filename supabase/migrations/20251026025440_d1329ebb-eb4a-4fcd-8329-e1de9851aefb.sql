-- Add consent fields to tests table
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE;

-- Add pause/resume fields to tests table
ALTER TABLE tests
ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pause_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_remaining INTEGER,
ADD COLUMN IF NOT EXISTS current_dimension INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_item INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dimension_states JSONB DEFAULT '{}'::jsonb;

-- Add PDF report fields to public_results table
ALTER TABLE public_results
ADD COLUMN IF NOT EXISTS report_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '12 months'),
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Create index for verification lookups
CREATE INDEX IF NOT EXISTS idx_verification_code ON public_results(share_code);