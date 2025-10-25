-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  region TEXT DEFAULT 'global',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    -- Check if signup code is ADMIN123 to grant admin access
    CASE WHEN NEW.raw_user_meta_data->>'signup_code' = 'ADMIN123' THEN TRUE ELSE FALSE END
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create tests table to store test attempts
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  json_version TEXT NOT NULL,
  start_time TIMESTAMPTZ DEFAULT now() NOT NULL,
  end_time TIMESTAMPTZ,
  answers JSONB DEFAULT '[]'::jsonb NOT NULL,
  scores JSONB DEFAULT '{}'::jsonb NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on tests
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

-- Tests policies: users can view/create/update their own tests
CREATE POLICY "Users can view own tests"
  ON public.tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tests"
  ON public.tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tests"
  ON public.tests FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin policy to view all tests for analytics
CREATE POLICY "Admins can view all tests"
  ON public.tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Create public_results table for shareable results
CREATE TABLE public.public_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  overall_score NUMERIC(5,2) NOT NULL,
  dimension_scores JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on public_results
ALTER TABLE public.public_results ENABLE ROW LEVEL SECURITY;

-- Public results policies: anyone can view by share code, users can create their own
CREATE POLICY "Anyone can view shared results"
  ON public.public_results FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create own shared results"
  ON public.public_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_tests_user_id ON public.tests(user_id);
CREATE INDEX idx_tests_completed ON public.tests(completed);
CREATE INDEX idx_public_results_share_code ON public.public_results(share_code);

-- Create storage bucket for AIQ test items JSON
INSERT INTO storage.buckets (id, name, public)
VALUES ('aiq-items', 'aiq-items', TRUE);

-- Storage policies for AIQ items bucket
CREATE POLICY "Anyone can view AIQ items"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'aiq-items');

CREATE POLICY "Admins can upload AIQ items"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'aiq-items' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update AIQ items"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'aiq-items' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete AIQ items"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'aiq-items' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = TRUE
    )
  );