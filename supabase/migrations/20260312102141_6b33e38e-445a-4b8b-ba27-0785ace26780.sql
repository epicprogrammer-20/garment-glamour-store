
-- =============================================
-- 1. Tighten RLS on admin content tables
-- =============================================

-- gallery_images: drop permissive write policies, replace with admin-only
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated users can insert gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON public.gallery_images;

CREATE POLICY "Admins can manage gallery images"
  ON public.gallery_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- events: drop permissive write policy, replace with admin-only
DROP POLICY IF EXISTS "Events manageable by authenticated" ON public.events;

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- currency_rates: drop permissive write policy, replace with admin-only
DROP POLICY IF EXISTS "Currency rates manageable by authenticated" ON public.currency_rates;

CREATE POLICY "Admins can manage currency rates"
  ON public.currency_rates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- promotional_banners: drop permissive write policy, replace with admin-only
DROP POLICY IF EXISTS "Promotional banners are manageable by authenticated users" ON public.promotional_banners;

CREATE POLICY "Admins can manage promotional banners"
  ON public.promotional_banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- videos: drop permissive write policies, replace with admin-only
DROP POLICY IF EXISTS "Videos are deletable by authenticated users" ON public.videos;
DROP POLICY IF EXISTS "Videos are insertable by authenticated users" ON public.videos;
DROP POLICY IF EXISTS "Videos are updatable by authenticated users" ON public.videos;

CREATE POLICY "Admins can manage videos"
  ON public.videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 2. Make refunds storage bucket private
-- =============================================
UPDATE storage.buckets SET public = false WHERE id = 'refunds';

-- Drop old public SELECT policy
DROP POLICY IF EXISTS "Anyone can view refund images" ON storage.objects;

-- Admin-only SELECT policy for refund images
CREATE POLICY "Admins can view refund images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'refunds' AND public.has_role(auth.uid(), 'admin'));
