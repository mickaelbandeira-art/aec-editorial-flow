-- 1. DELETE the bucket if it exists (allows us to start fresh)
-- We use CASCADE to remove objects within it if necessary, though storage usually requires empty.
-- We can't easily CASCADE objects in SQL for storage without advanced scripts, 
-- so we'll try deleting the bucket entry. If it fails due to objects, we'll try update.

DELETE FROM storage.buckets WHERE id = 'flowrev-insumos';

-- 2. CREATE the bucket explicitly as PUBLIC
INSERT INTO storage.buckets (id, name, public)
VALUES ('flowrev-insumos', 'flowrev-insumos', true);

-- 3. RESET Policies (Just to be absolutely sure)
DROP POLICY IF EXISTS "Public Read flowrev-insumos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload flowrev-insumos" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete flowrev-insumos" ON storage.objects;
DROP POLICY IF EXISTS "Public Update flowrev-insumos" ON storage.objects;

CREATE POLICY "Public Read flowrev-insumos"
ON storage.objects FOR SELECT TO public
USING ( bucket_id = 'flowrev-insumos' );

CREATE POLICY "Public Upload flowrev-insumos"
ON storage.objects FOR INSERT TO public
WITH CHECK ( bucket_id = 'flowrev-insumos' );

CREATE POLICY "Public Update flowrev-insumos"
ON storage.objects FOR UPDATE TO public
USING ( bucket_id = 'flowrev-insumos' );

CREATE POLICY "Public Delete flowrev-insumos"
ON storage.objects FOR DELETE TO public
USING ( bucket_id = 'flowrev-insumos' );
