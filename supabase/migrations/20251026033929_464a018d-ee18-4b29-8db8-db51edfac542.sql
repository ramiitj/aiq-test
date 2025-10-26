-- Critical Security Fix: Implement Proper Admin Role Architecture
-- Step 1: Drop dependent policies first

-- Drop test policies that depend on is_admin
DROP POLICY IF EXISTS "Admins can view all tests" ON public.tests;

-- Drop storage policies that depend on is_admin
DROP POLICY IF EXISTS "Admins can upload AIQ items" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update AIQ items" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete AIQ items" ON storage.objects;

-- Step 2: Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Step 3: Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Step 4: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create security definer function to check roles (prevents recursive RLS issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 6: Migrate existing admin users to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::public.app_role
FROM public.profiles
WHERE is_admin = true;

-- Step 7: Add all users as 'user' role (if not already admin)
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'user'::public.app_role
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_roles.user_id = profiles.user_id
);

-- Step 8: Remove is_admin column from profiles (security risk)
ALTER TABLE public.profiles DROP COLUMN is_admin;

-- Step 9: Update handle_new_user function to NOT set admin via signup code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  -- Assign default 'user' role (admins must be assigned manually via backend)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role);
  
  RETURN NEW;
END;
$$;

-- Step 10: Update profiles RLS policies to prevent email exposure
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Step 11: Recreate tests table admin policy with new role system
CREATE POLICY "Admins can view all tests"
ON public.tests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Step 12: Recreate storage policies with new role system
CREATE POLICY "Admins can upload AIQ items"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'aiq-items' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update AIQ items"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'aiq-items' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete AIQ items"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'aiq-items' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Step 13: Fix public_results to hide user_id from public access
-- Create a view that excludes user_id for public sharing
CREATE OR REPLACE VIEW public.shared_results AS
SELECT 
  id,
  test_id,
  overall_score,
  dimension_scores,
  created_at,
  report_generated_at,
  expires_at,
  share_code,
  pdf_url
FROM public.public_results
WHERE expires_at > now();

-- Update public_results RLS policy to restrict user_id access
DROP POLICY IF EXISTS "Anyone can view shared results" ON public.public_results;

-- Only authenticated users who own the result can see the full record including user_id
CREATE POLICY "Users can view own results"
ON public.public_results
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all results
CREATE POLICY "Admins can view all results"
ON public.public_results
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Step 14: Add RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only admins can insert/update/delete roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));