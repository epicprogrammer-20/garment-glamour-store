
-- Site visits tracking table
CREATE TABLE public.site_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  page text DEFAULT '/',
  country text,
  user_agent text,
  session_id text
);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site visits are insertable by anyone" ON public.site_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Site visits are viewable by authenticated users" ON public.site_visits FOR SELECT USING (auth.role() = 'authenticated');

-- Add payment_method and country to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'card';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name text;

-- Refunds table
CREATE TABLE public.refunds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id),
  amount numeric NOT NULL,
  reason text,
  status text DEFAULT 'processed',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Refunds are viewable by authenticated users" ON public.refunds FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Refunds are insertable by authenticated users" ON public.refunds FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Index for performance
CREATE INDEX idx_site_visits_visited_at ON public.site_visits(visited_at);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_refunds_created_at ON public.refunds(created_at);
