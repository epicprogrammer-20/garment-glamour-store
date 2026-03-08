-- Add estimated_delivery column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery timestamp with time zone;

-- Add refund request columns to refunds table
ALTER TABLE public.refunds ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.refunds ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.refunds ADD COLUMN IF NOT EXISTS tracking_code text;
ALTER TABLE public.refunds ADD COLUMN IF NOT EXISTS message text;

-- Allow anyone to insert refunds (guests can request refunds)
DROP POLICY IF EXISTS "Refunds are insertable by authenticated users" ON public.refunds;
CREATE POLICY "Anyone can insert refunds" ON public.refunds FOR INSERT WITH CHECK (true);

-- Allow anyone to view their refund by order_id
DROP POLICY IF EXISTS "Refunds are viewable by authenticated users" ON public.refunds;
CREATE POLICY "Anyone can view refunds" ON public.refunds FOR SELECT USING (true);