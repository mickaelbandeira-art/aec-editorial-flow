-- Force update the bucket to be public (in case it was created as private previously)
UPDATE storage.buckets
SET public = true
WHERE id = 'insumos';

-- Verify policies again (just to be safe)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;

CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
USING ( bucket_id = 'insumos' );
