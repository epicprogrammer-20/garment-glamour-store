
-- Add thumbnail_url column to videos table to store thumbnail images
ALTER TABLE public.videos ADD COLUMN thumbnail_url TEXT;

-- Create gallery_images table to store images for the style gallery
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security to gallery_images (making it public readable)
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read gallery images
CREATE POLICY "Gallery images are publicly readable" 
  ON public.gallery_images 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Allow authenticated users to insert gallery images (for admin)
CREATE POLICY "Authenticated users can insert gallery images" 
  ON public.gallery_images 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Allow authenticated users to update gallery images (for admin)
CREATE POLICY "Authenticated users can update gallery images" 
  ON public.gallery_images 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Allow authenticated users to delete gallery images (for admin)
CREATE POLICY "Authenticated users can delete gallery images" 
  ON public.gallery_images 
  FOR DELETE 
  TO authenticated 
  USING (true);
