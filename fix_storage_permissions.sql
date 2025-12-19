-- Grant usage on the storage schema to ensure anon/authenticated can access it
GRANT USAGE ON SCHEMA storage TO anon, authenticated;

-- Grant permissions on storage.buckets (needed to check public status)
GRANT SELECT ON storage.buckets TO anon, authenticated;

-- Grant permissions on storage.objects (needed to read/write files)
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon, authenticated;

-- Ensure public access to the specific bucket (redundant but safe)
UPDATE storage.buckets
SET public = true
WHERE id = 'flowrev-insumos';

-- Double check policies (just to be safe)
DROP POLICY IF EXISTS "Public Read flowrev-insumos" ON storage.objects;
CREATE POLICY "Public Read flowrev-insumos"
ON storage.objects FOR SELECT TO public
USING ( bucket_id = 'flowrev-insumos' );
