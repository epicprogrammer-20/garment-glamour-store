
CREATE POLICY "Authenticated can update refunds"
ON public.refunds
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
