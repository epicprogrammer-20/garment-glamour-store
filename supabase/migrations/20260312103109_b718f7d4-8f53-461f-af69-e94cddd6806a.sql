
-- =============================================
-- 1. Fix orders SELECT policy: restrict to owners + admins
-- =============================================
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

-- Owners can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 2. Fix orders UPDATE policy: restrict to admins only
-- =============================================
DROP POLICY IF EXISTS "Authenticated can update orders" ON public.orders;

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 3. Fix orders DELETE policy: restrict to admins only
-- =============================================
DROP POLICY IF EXISTS "Authenticated can delete orders" ON public.orders;

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 4. Fix order_items SELECT: restrict to order owner + admins
-- =============================================
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 5. Fix order_items DELETE: restrict to admins only
-- =============================================
DROP POLICY IF EXISTS "Authenticated can delete order items" ON public.order_items;

CREATE POLICY "Admins can delete order items"
  ON public.order_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 6. Fix refunds policies: restrict SELECT/UPDATE to admins
-- =============================================
DROP POLICY IF EXISTS "Anyone can view refunds" ON public.refunds;
DROP POLICY IF EXISTS "Authenticated can update refunds" ON public.refunds;

CREATE POLICY "Admins can view refunds"
  ON public.refunds FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update refunds"
  ON public.refunds FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 7. Fix refunds storage: drop anonymous upload, add authenticated
-- =============================================
DROP POLICY IF EXISTS "Anyone can upload refund images" ON storage.objects;

CREATE POLICY "Authenticated users can upload refund images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'refunds');
