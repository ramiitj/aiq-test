-- Add fullscreen_exit_count column to tests table
ALTER TABLE public.tests 
ADD COLUMN fullscreen_exit_count integer DEFAULT 0;