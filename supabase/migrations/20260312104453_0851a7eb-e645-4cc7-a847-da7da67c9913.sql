
-- Fix event_entries: restrict SELECT to admins only
DROP POLICY IF EXISTS "Event entries viewable by authenticated" ON public.event_entries;

CREATE POLICY "Admins can view event entries"
  ON public.event_entries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
