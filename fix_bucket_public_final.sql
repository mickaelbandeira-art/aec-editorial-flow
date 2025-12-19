-- Force update based on NAME (in case ID is different)
UPDATE storage.buckets
SET public = true
WHERE name = 'insumos';

-- Ensure RLS is open (Redundant safety)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;

CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
USING ( bucket_id = (SELECT id FROM storage.buckets WHERE name = 'insumos') );
