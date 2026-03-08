
-- Allow authenticated users to delete order_items
CREATE POLICY "Authenticated can delete order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to delete site_visits
CREATE POLICY "Authenticated can delete site visits"
ON public.site_visits
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to delete orders (currently missing)
CREATE POLICY "Authenticated can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (true);
