
-- Drop duplicate policies that failed
DROP POLICY IF EXISTS "Anyone can view admission info" ON public.website_admission_info;
DROP POLICY IF EXISTS "Admins can manage admission info" ON public.website_admission_info;

-- Recreate them cleanly
CREATE POLICY "Anyone can view admission info"
  ON public.website_admission_info FOR SELECT USING (true);

CREATE POLICY "Admins can manage admission info"
  ON public.website_admission_info FOR ALL
  USING (public.is_admin(auth.uid()));
