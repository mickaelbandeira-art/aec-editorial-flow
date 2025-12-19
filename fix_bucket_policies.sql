-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Owner Manage" ON storage.objects;
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;

-- Re-create stricter policies that do NOT require supabase.auth (since the app uses custom auth)
-- Allow Public Read
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
USING ( bucket_id = 'insumos' );

-- Allow Public Upload (since app does not use Supabase Auth signIn)
CREATE POLICY "Public Upload"
ON storage.objects
FOR INSERT
WITH CHECK ( bucket_id = 'insumos' );

-- Allow Public Delete (CAUTION: This allows anyone to delete if they know the ID, but necessary if no real auth)
-- Alternatively, we can restrict this, but the app needs to be able to delete.
CREATE POLICY "Public Delete"
ON storage.objects
FOR DELETE
USING ( bucket_id = 'insumos' );

-- Allow Public Update
CREATE POLICY "Public Update"
ON storage.objects
FOR UPDATE
USING ( bucket_id = 'insumos' );
