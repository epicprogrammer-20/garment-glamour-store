-- Add tracking_code to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_code text UNIQUE;

-- Allow anyone to select orders (for public tracking page)
DROP POLICY IF EXISTS "Authenticated can view all orders" ON public.orders;
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);

-- Allow authenticated users to update order status
CREATE POLICY "Authenticated can update orders" ON public.orders FOR UPDATE
  USING (auth.role() = 'authenticated'::text)
  WITH CHECK (auth.role() = 'authenticated'::text);

-- Allow anyone to view order_items (for tracking page)
DROP POLICY IF EXISTS "Authenticated can view order items" ON public.order_items;
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);