-- NUCLEAR OPTION: Grant ALL permissions to anon and authenticated

-- 1. Schema Access
GRANT ALL ON SCHEMA storage TO postgres, anon, authenticated, service_role;

-- 2. Table Access
GRANT ALL ON TABLE storage.buckets TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE storage.objects TO postgres, anon, authenticated, service_role;

-- 3. Force Bucket Public (Again)
UPDATE storage.buckets
SET public = true
WHERE id = 'flowrev-insumos';

-- 4. Drop ALL policies on objects to remove conflict
DROP POLICY IF EXISTS "Public Read flowrev-insumos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload flowrev-insumos" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete flowrev-insumos" ON storage.objects;
DROP POLICY IF EXISTS "Public Update flowrev-insumos" ON storage.objects;

DROP POLICY IF EXISTS "Give me access to everything" ON storage.objects;
DROP POLICY IF EXISTS "Allow Anon Read" ON storage.objects;

-- 5. Create a SINGLE, SIMPLE, UNIVERSAL policy for this bucket
CREATE POLICY "Allow All Access flowrev-insumos"
ON storage.objects
FOR ALL
TO public
USING ( bucket_id = 'flowrev-insumos' )
WITH CHECK ( bucket_id = 'flowrev-insumos' );
