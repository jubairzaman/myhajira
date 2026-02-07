-- Add report header image URL to system_settings
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS report_header_image_url TEXT DEFAULT NULL;