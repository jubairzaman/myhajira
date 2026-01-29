-- Add hero slider images table for multiple hero images
CREATE TABLE public.website_hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  title_bn TEXT,
  subtitle TEXT,
  subtitle_bn TEXT,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_hero_slides ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view hero slides" 
ON public.website_hero_slides 
FOR SELECT 
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage hero slides" 
ON public.website_hero_slides 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Add parent testimonials table
CREATE TABLE public.website_parent_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  relation TEXT, -- Father/Mother/Guardian
  relation_bn TEXT,
  student_class TEXT,
  photo_url TEXT,
  comment TEXT NOT NULL,
  comment_bn TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_parent_testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view parent testimonials" 
ON public.website_parent_testimonials 
FOR SELECT 
USING (true);

-- Admin write access
CREATE POLICY "Admins can manage parent testimonials" 
ON public.website_parent_testimonials 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Add favicon_url column to website_settings if not exists
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- Insert sample hero slides
INSERT INTO public.website_hero_slides (image_url, title, title_bn, subtitle, subtitle_bn, display_order) VALUES
('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920', 'Welcome to Our School', 'আমাদের স্কুলে স্বাগতম', 'Building Future Leaders', 'আগামীর নেতৃত্ব গড়ে তুলছি', 1),
('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920', 'Excellence in Education', 'শিক্ষায় শ্রেষ্ঠত্ব', 'Quality Education for All', 'সবার জন্য মানসম্মত শিক্ষা', 2),
('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1920', 'Modern Learning', 'আধুনিক শিক্ষা', 'Preparing for Tomorrow', 'আগামীর জন্য প্রস্তুত', 3);