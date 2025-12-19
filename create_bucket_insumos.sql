-- Create the storage bucket 'insumos'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('insumos', 'insumos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket (optional if applied to storage.objects logic globally, but good practice)
-- Note: 'storage.objects' usually has RLS enabled by default.

-- Policy: Allow public read access to files in 'insumos'
CREATE POLICY "Public Read Access" 
ON storage.objects 
FOR SELECT 
USING ( bucket_id = 'insumos' );

-- Policy: Allow authenticated users to upload files to 'insumos'
CREATE POLICY "Authenticated Upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK ( bucket_id = 'insumos' AND auth.role() = 'authenticated' );

-- Policy: Allow users to update/delete their own files (optional, based on requirement)
CREATE POLICY "Owner Manage" 
ON storage.objects 
FOR DELETE 
USING ( bucket_id = 'insumos' AND auth.uid() = owner );

CREATE POLICY "Owner Update" 
ON storage.objects 
FOR UPDATE 
USING ( bucket_id = 'insumos' AND auth.uid() = owner );
