
-- Add out of stock, shipping, duty, tax to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_out_of_stock boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS duty_fee numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0;

-- Add product_id to promotional_banners
ALTER TABLE promotional_banners ADD COLUMN IF NOT EXISTS product_id bigint REFERENCES products(id) ON DELETE SET NULL;

-- Currency rates table
CREATE TABLE IF NOT EXISTS currency_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code text NOT NULL UNIQUE,
  currency_name text NOT NULL,
  symbol text NOT NULL,
  rate numeric NOT NULL DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Currency rates viewable by everyone" ON currency_rates FOR SELECT USING (true);
CREATE POLICY "Currency rates manageable by authenticated" ON currency_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO currency_rates (currency_code, currency_name, symbol, rate) VALUES
  ('USD', 'US Dollar', '$', 1),
  ('ZAR', 'South African Rand', 'R', 18.5),
  ('EUR', 'Euro', '€', 0.92),
  ('GBP', 'British Pound', '£', 0.79)
ON CONFLICT (currency_code) DO NOTHING;

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text DEFAULT '',
  description text DEFAULT '',
  learn_more_text text DEFAULT '',
  image_url text DEFAULT '',
  gallery_images text[] DEFAULT '{}',
  is_active boolean DEFAULT false,
  competition_title text DEFAULT '',
  competition_description text DEFAULT '',
  competition_prize text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Events manageable by authenticated" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Event entries table
CREATE TABLE IF NOT EXISTS event_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE event_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event entries insertable by anyone" ON event_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Event entries viewable by authenticated" ON event_entries FOR SELECT TO authenticated USING (true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true) ON CONFLICT DO NOTHING;

-- Storage policies for banners
CREATE POLICY "Banner images publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Auth users upload banner images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Auth users delete banner images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banners');

-- Storage policies for events
CREATE POLICY "Event images publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'events');
CREATE POLICY "Auth users upload event images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'events');
CREATE POLICY "Auth users delete event images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'events');
