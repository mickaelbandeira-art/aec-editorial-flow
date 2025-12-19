-- 1. Force the bucket to be PUBLIC
UPDATE storage.buckets
SET public = true
WHERE id = 'flowrev-insumos';

-- 2. Drop all potential existing policies for this bucket to start fresh
DROP POLICY IF EXISTS "Public Read flowrev-insumos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload flowrev-insumos" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete flowrev-insumos" ON storage.objects;
DROP POLICY IF EXISTS "Public Update flowrev-insumos" ON storage.objects;

-- 3. Re-create permissive policies explicitly for the 'public' role (anon + authenticated)
CREATE POLICY "Public Read flowrev-insumos"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'flowrev-insumos' );

CREATE POLICY "Public Upload flowrev-insumos"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'flowrev-insumos' );

CREATE POLICY "Public Update flowrev-insumos"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'flowrev-insumos' );

CREATE POLICY "Public Delete flowrev-insumos"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'flowrev-insumos' );
