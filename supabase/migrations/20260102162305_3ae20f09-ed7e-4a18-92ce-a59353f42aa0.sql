-- Add scroller customization columns to system_settings
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS scroller_font_size integer DEFAULT 24,
ADD COLUMN IF NOT EXISTS scroller_font_family text DEFAULT 'Hind Siliguri',
ADD COLUMN IF NOT EXISTS scroller_speed integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS scroller_bg_color text DEFAULT '#991B1B',
ADD COLUMN IF NOT EXISTS scroller_text_color text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS scroller_bullet_color text DEFAULT '#FDE047';

-- Create videos storage bucket for autoplay support
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to videos bucket
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their videos
CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');