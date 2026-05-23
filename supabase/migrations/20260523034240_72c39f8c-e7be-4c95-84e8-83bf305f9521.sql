-- Restrictive policy: only admins may INSERT into user_roles via the API.
-- The handle_new_user() trigger is SECURITY DEFINER and bypasses RLS, so
-- automatic 'user' role assignment on signup continues to work.
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated, anon
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));