-- Create website_programs table for academic levels
CREATE TABLE public.website_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL,
  level_bn TEXT,
  grades TEXT,
  grades_bn TEXT,
  description TEXT,
  description_bn TEXT,
  color_from TEXT DEFAULT '#4B0082',
  color_to TEXT DEFAULT '#6B2D8B',
  icon TEXT DEFAULT 'BookOpen',
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create website_facilities table
CREATE TABLE public.website_facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_bn TEXT,
  description TEXT,
  description_bn TEXT,
  icon TEXT DEFAULT 'Building',
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create website_methodologies table
CREATE TABLE public.website_methodologies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_bn TEXT,
  description TEXT,
  description_bn TEXT,
  icon TEXT DEFAULT 'Lightbulb',
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create website_home_sections table for controlling homepage sections
CREATE TABLE public.website_home_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_name TEXT NOT NULL,
  section_name_bn TEXT,
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create website_about_content table for About page
CREATE TABLE public.website_about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  title_bn TEXT,
  content TEXT,
  content_bn TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create website_admission_info table
CREATE TABLE public.website_admission_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL,
  title_bn TEXT,
  content TEXT,
  content_bn TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to website_settings
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS cta_button_color TEXT DEFAULT '#00D4FF',
ADD COLUMN IF NOT EXISTS secondary_button_color TEXT DEFAULT '#4B0082';

-- Enable RLS on all new tables
ALTER TABLE public.website_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_methodologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_admission_info ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view programs" ON public.website_programs FOR SELECT USING (true);
CREATE POLICY "Anyone can view facilities" ON public.website_facilities FOR SELECT USING (true);
CREATE POLICY "Anyone can view methodologies" ON public.website_methodologies FOR SELECT USING (true);
CREATE POLICY "Anyone can view home sections" ON public.website_home_sections FOR SELECT USING (true);
CREATE POLICY "Anyone can view about content" ON public.website_about_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view admission info" ON public.website_admission_info FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admins can manage programs" ON public.website_programs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage facilities" ON public.website_facilities FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage methodologies" ON public.website_methodologies FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage home sections" ON public.website_home_sections FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage about content" ON public.website_about_content FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage admission info" ON public.website_admission_info FOR ALL USING (public.is_admin(auth.uid()));

-- Insert default home sections
INSERT INTO public.website_home_sections (section_key, section_name, section_name_bn, display_order, is_enabled) VALUES
('hero', 'Hero Slider', 'হিরো স্লাইডার', 1, true),
('features', 'Features', 'বৈশিষ্ট্যসমূহ', 2, true),
('stats', 'Statistics', 'পরিসংখ্যান', 3, true),
('programs', 'Academic Programs', 'শিক্ষা কার্যক্রম', 4, true),
('alumni', 'Alumni Section', 'প্রাক্তন ছাত্র', 5, true),
('testimonials', 'Parent Testimonials', 'অভিভাবক মতামত', 6, true);

-- Insert default programs
INSERT INTO public.website_programs (level, level_bn, grades, grades_bn, description, description_bn, color_from, color_to, icon, display_order) VALUES
('Primary', 'প্রাথমিক', 'Class 1-5', 'প্রথম - পঞ্চম শ্রেণী', 'Foundation of learning with focus on literacy, numeracy and social skills', 'সাক্ষরতা, গণিত এবং সামাজিক দক্ষতার উপর জোর দিয়ে শিক্ষার ভিত্তি', '#22c55e', '#16a34a', 'BookOpen', 1),
('Junior Secondary', 'নিম্ন মাধ্যমিক', 'Class 6-8', 'ষষ্ঠ - অষ্টম শ্রেণী', 'Building academic foundation with diverse subjects', 'বিভিন্ন বিষয়ে একাডেমিক ভিত্তি তৈরি', '#3b82f6', '#2563eb', 'GraduationCap', 2),
('Secondary', 'মাধ্যমিক', 'Class 9-10', 'নবম - দশম শ্রেণী', 'SSC preparation with science, commerce and arts streams', 'বিজ্ঞান, বাণিজ্য এবং কলা বিভাগে এসএসসি প্রস্তুতি', '#a855f7', '#9333ea', 'Award', 3),
('Higher Secondary', 'উচ্চ মাধ্যমিক', 'Class 11-12', 'একাদশ - দ্বাদশ শ্রেণী', 'HSC preparation with specialized streams', 'বিশেষায়িত বিভাগে এইচএসসি প্রস্তুতি', '#f59e0b', '#d97706', 'Trophy', 4);

-- Insert default facilities
INSERT INTO public.website_facilities (title, title_bn, description, description_bn, icon, display_order) VALUES
('Library', 'লাইব্রেরি', 'Well-stocked library with thousands of books', 'হাজার হাজার বই সমৃদ্ধ লাইব্রেরি', 'Library', 1),
('Computer Lab', 'কম্পিউটার ল্যাব', 'Modern computer lab with internet facility', 'ইন্টারনেট সুবিধাসহ আধুনিক কম্পিউটার ল্যাব', 'Monitor', 2),
('Science Lab', 'বিজ্ঞান ল্যাব', 'Fully equipped science laboratories', 'সম্পূর্ণ সজ্জিত বিজ্ঞান পরীক্ষাগার', 'Flask', 3),
('Playground', 'খেলার মাঠ', 'Spacious playground for sports activities', 'খেলাধুলার জন্য প্রশস্ত মাঠ', 'Trees', 4);

-- Insert default about content
INSERT INTO public.website_about_content (section_key, title, title_bn, content, content_bn, display_order) VALUES
('intro', 'About Our School', 'আমাদের স্কুল সম্পর্কে', 'Our school has been providing quality education since establishment.', 'আমাদের স্কুল প্রতিষ্ঠালগ্ন থেকে মানসম্মত শিক্ষা প্রদান করে আসছে।', 1),
('vision', 'Our Vision', 'আমাদের দৃষ্টিভঙ্গি', 'To be a leading educational institution.', 'একটি অগ্রণী শিক্ষা প্রতিষ্ঠান হওয়া।', 2),
('mission', 'Our Mission', 'আমাদের লক্ষ্য', 'To provide quality education accessible to all.', 'সকলের জন্য মানসম্মত শিক্ষা প্রদান করা।', 3),
('principal', 'Principal Message', 'অধ্যক্ষের বাণী', 'Welcome to our school. We are committed to excellence.', 'আমাদের স্কুলে স্বাগতম। আমরা শ্রেষ্ঠত্বে প্রতিশ্রুতিবদ্ধ।', 4);