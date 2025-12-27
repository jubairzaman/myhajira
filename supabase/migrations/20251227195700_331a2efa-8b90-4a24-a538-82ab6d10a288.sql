-- Add timing fields to shifts table for attendance tracking
ALTER TABLE public.shifts 
ADD COLUMN IF NOT EXISTS late_threshold_time TIME WITHOUT TIME ZONE DEFAULT '08:30',
ADD COLUMN IF NOT EXISTS absent_cutoff_time TIME WITHOUT TIME ZONE DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS sms_trigger_time TIME WITHOUT TIME ZONE DEFAULT '09:30';

-- Make panel_id nullable in students table (we'll use shift for timing now)
ALTER TABLE public.students ALTER COLUMN panel_id DROP NOT NULL;

-- Make panel_id nullable in teachers table
ALTER TABLE public.teachers ALTER COLUMN panel_id DROP NOT NULL;

-- Make panel_id nullable in classes table (use shift_id instead)
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.shifts(id),
ALTER COLUMN panel_id DROP NOT NULL;

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('photos', 'photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for photos bucket
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'photos')
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos');