
-- Add images column to refunds table
ALTER TABLE public.refunds ADD COLUMN images text[] DEFAULT '{}';

-- Create storage bucket for refund images
INSERT INTO storage.buckets (id, name, public) VALUES ('refunds', 'refunds', true);

-- Allow anyone to upload refund images
CREATE POLICY "Anyone can upload refund images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'refunds');

-- Allow anyone to view refund images
CREATE POLICY "Anyone can view refund images"
ON storage.objects FOR SELECT
USING (bucket_id = 'refunds');
