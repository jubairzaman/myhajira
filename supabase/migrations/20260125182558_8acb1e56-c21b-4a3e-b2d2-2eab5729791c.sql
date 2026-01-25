-- Create website_alumni_podcasts table for YouTube podcast showcase
CREATE TABLE public.website_alumni_podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_bn TEXT,
  description TEXT,
  description_bn TEXT,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alumni_id UUID REFERENCES public.website_alumni(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_alumni_podcasts ENABLE ROW LEVEL SECURITY;

-- Public can view enabled podcasts
CREATE POLICY "Anyone can view enabled podcasts"
ON public.website_alumni_podcasts
FOR SELECT
USING (is_enabled = true);

-- Only admins can manage podcasts
CREATE POLICY "Admins can manage podcasts"
ON public.website_alumni_podcasts
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_website_alumni_podcasts_updated_at
BEFORE UPDATE ON public.website_alumni_podcasts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();