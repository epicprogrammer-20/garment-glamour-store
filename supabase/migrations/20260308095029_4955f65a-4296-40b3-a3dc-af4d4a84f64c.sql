
CREATE TABLE public.promotional_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text DEFAULT '',
  description text DEFAULT '',
  image_url text DEFAULT '',
  button_text text DEFAULT 'Learn more',
  button_link text DEFAULT '#',
  secondary_button_text text DEFAULT '',
  secondary_button_link text DEFAULT '#',
  countdown_end timestamp with time zone,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promotional banners are viewable by everyone"
  ON public.promotional_banners FOR SELECT
  USING (true);

CREATE POLICY "Promotional banners are manageable by authenticated users"
  ON public.promotional_banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
