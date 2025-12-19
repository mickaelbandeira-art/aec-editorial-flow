-- Create the NEW storage bucket 'flowrev-insumos'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('flowrev-insumos', 'flowrev-insumos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for flowrev-insumos
-- Allow Public Read
CREATE POLICY "Public Read flowrev-insumos" 
ON storage.objects 
FOR SELECT 
USING ( bucket_id = 'flowrev-insumos' );

-- Allow Public Upload
CREATE POLICY "Public Upload flowrev-insumos" 
ON storage.objects 
FOR INSERT 
WITH CHECK ( bucket_id = 'flowrev-insumos' );

-- Allow Public Delete
CREATE POLICY "Public Delete flowrev-insumos" 
ON storage.objects 
FOR DELETE 
USING ( bucket_id = 'flowrev-insumos' );

-- Allow Public Update
CREATE POLICY "Public Update flowrev-insumos" 
ON storage.objects 
FOR UPDATE 
USING ( bucket_id = 'flowrev-insumos' );
