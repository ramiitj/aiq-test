ALTER TABLE public.tests REPLICA IDENTITY FULL;
ALTER TABLE public.security_violations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_violations;