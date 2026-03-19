-- Add deleted_at column to flowrev_insumos
ALTER TABLE public.flowrev_insumos 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index for better performance when filtering deleted items
CREATE INDEX IF NOT EXISTS idx_flowrev_insumos_deleted_at ON public.flowrev_insumos (deleted_at);

-- Update RLS policies if necessary (usually they already allow select if deleted_at is null)
-- We'll filter in the application layer or via a View, but it's good to have the column.
