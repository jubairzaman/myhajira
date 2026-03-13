
-- Add comprehensive SEO fields to website_settings
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS seo_keywords text NULL,
ADD COLUMN IF NOT EXISTS og_title text NULL,
ADD COLUMN IF NOT EXISTS og_description text NULL,
ADD COLUMN IF NOT EXISTS og_image_url text NULL,
ADD COLUMN IF NOT EXISTS twitter_card_title text NULL,
ADD COLUMN IF NOT EXISTS twitter_card_description text NULL,
ADD COLUMN IF NOT EXISTS twitter_card_image_url text NULL,
ADD COLUMN IF NOT EXISTS canonical_url text NULL,
ADD COLUMN IF NOT EXISTS robots_txt_override text NULL,
ADD COLUMN IF NOT EXISTS json_ld_type text NULL DEFAULT 'EducationalOrganization',
ADD COLUMN IF NOT EXISTS json_ld_extra jsonb NULL DEFAULT '{}'::jsonb;
