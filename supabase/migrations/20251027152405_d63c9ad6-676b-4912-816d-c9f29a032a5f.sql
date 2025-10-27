-- Allow admins to upload test items to storage
CREATE POLICY "Admins can upload test items"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'aiq-items' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update test items
CREATE POLICY "Admins can update test items"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'aiq-items' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete test items
CREATE POLICY "Admins can delete test items"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'aiq-items' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated users to read test items
CREATE POLICY "Authenticated users can download test items"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'aiq-items');