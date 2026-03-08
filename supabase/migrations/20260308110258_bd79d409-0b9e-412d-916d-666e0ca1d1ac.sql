-- Drop restrictive insert policy
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

-- Create new policy allowing anyone to insert orders (for guest checkout)
CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view all orders (for admin analytics)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

CREATE POLICY "Authenticated can view all orders" ON orders
  FOR SELECT
  USING (auth.role() = 'authenticated');