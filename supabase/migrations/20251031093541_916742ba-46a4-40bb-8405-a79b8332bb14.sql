-- Add missing DELETE policy for test_demographics table to enable GDPR Right to Erasure
CREATE POLICY "Users can delete own demographics"
ON test_demographics FOR DELETE
USING (auth.uid() = user_id);