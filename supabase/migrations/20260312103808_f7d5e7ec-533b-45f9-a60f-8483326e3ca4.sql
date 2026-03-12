
-- Fix storage policies: restrict banners and events buckets to admin-only
DROP POLICY IF EXISTS "Auth users upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users delete banner images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users delete event images" ON storage.objects;

CREATE POLICY "Admins can upload banner images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete banner images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload event images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'events' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'events' AND public.has_role(auth.uid(), 'admin'));
