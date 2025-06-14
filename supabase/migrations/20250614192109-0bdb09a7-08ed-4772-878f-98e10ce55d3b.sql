
-- Create comments table for product comments
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id BIGINT NOT NULL,
  user_id UUID,
  author_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Add Row Level Security to comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read comments
CREATE POLICY "Comments are publicly readable" 
  ON public.comments 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Allow anyone to insert comments (for both authenticated and anonymous users)
CREATE POLICY "Anyone can insert comments" 
  ON public.comments 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Allow users to update their own comments (authenticated users only)
CREATE POLICY "Users can update their own comments" 
  ON public.comments 
  FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Allow users to delete their own comments (authenticated users only)
CREATE POLICY "Users can delete their own comments" 
  ON public.comments 
  FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());
