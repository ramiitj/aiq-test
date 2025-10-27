-- Add missing UPDATE policy to public_results table
CREATE POLICY "Users can update own results"
ON public.public_results
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);