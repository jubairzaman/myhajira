-- Create table for custom alumni form fields
CREATE TABLE IF NOT EXISTS public.website_alumni_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name TEXT NOT NULL UNIQUE,
  field_label TEXT NOT NULL,
  field_label_bn TEXT,
  field_type TEXT DEFAULT 'text' CHECK (field_type IN ('text', 'textarea', 'number', 'select', 'email', 'phone')),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  options JSONB DEFAULT '[]'::jsonb,
  placeholder TEXT,
  placeholder_bn TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add custom_fields column to website_alumni table
ALTER TABLE public.website_alumni 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- Enable RLS
ALTER TABLE public.website_alumni_form_fields ENABLE ROW LEVEL SECURITY;

-- Public can read enabled fields
CREATE POLICY "Anyone can view enabled form fields"
ON public.website_alumni_form_fields
FOR SELECT
USING (is_enabled = true);

-- Admins can manage form fields
CREATE POLICY "Admins can manage form fields"
ON public.website_alumni_form_fields
FOR ALL
USING (public.is_admin(auth.uid()));

-- Create index for ordering
CREATE INDEX idx_alumni_form_fields_order ON public.website_alumni_form_fields(display_order);

-- Add updated_at trigger
CREATE TRIGGER update_alumni_form_fields_updated_at
BEFORE UPDATE ON public.website_alumni_form_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();