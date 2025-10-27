-- Add location columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;