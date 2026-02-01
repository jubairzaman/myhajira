-- 1. Popup Notice Table
CREATE TABLE public.website_popup_notice (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  title_bn TEXT,
  description TEXT,
  description_bn TEXT,
  image_url TEXT,
  button_text TEXT DEFAULT 'বিস্তারিত দেখুন',
  button_text_bn TEXT DEFAULT 'বিস্তারিত দেখুন',
  button_link TEXT DEFAULT '/website/notices',
  display_type TEXT DEFAULT 'card' CHECK (display_type IN ('image', 'card')),
  is_enabled BOOLEAN DEFAULT false,
  show_once_per_session BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. CTA Buttons Table (for dynamic button links)
CREATE TABLE public.website_cta_buttons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  button_key TEXT NOT NULL UNIQUE, -- 'hero_primary', 'hero_secondary', 'cta_primary', 'cta_secondary'
  label TEXT NOT NULL,
  label_bn TEXT,
  link_url TEXT NOT NULL DEFAULT '/',
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. All Available Sections Table (master list of all sections)
CREATE TABLE public.website_available_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE, -- 'hero', 'features', 'stats', 'alumni_bubbles', 'testimonials', 'cta', etc.
  section_name TEXT NOT NULL,
  section_name_bn TEXT,
  description TEXT,
  source_page TEXT, -- 'home', 'about', 'academics', etc.
  component_name TEXT, -- React component name
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update website_home_sections to reference available sections
ALTER TABLE public.website_home_sections 
ADD COLUMN IF NOT EXISTS section_name TEXT,
ADD COLUMN IF NOT EXISTS section_name_bn TEXT;

-- Enable RLS
ALTER TABLE public.website_popup_notice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_cta_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_available_sections ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read popup notice" ON public.website_popup_notice FOR SELECT USING (true);
CREATE POLICY "Public can read cta buttons" ON public.website_cta_buttons FOR SELECT USING (true);
CREATE POLICY "Public can read available sections" ON public.website_available_sections FOR SELECT USING (true);

-- Authenticated users can manage
CREATE POLICY "Authenticated can manage popup" ON public.website_popup_notice FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage cta buttons" ON public.website_cta_buttons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage available sections" ON public.website_available_sections FOR ALL USING (auth.role() = 'authenticated');

-- Insert default CTA buttons
INSERT INTO public.website_cta_buttons (button_key, label, label_bn, link_url, display_order) VALUES
('hero_primary', 'Admission Info', 'ভর্তি তথ্য', '/website/admissions', 1),
('hero_secondary', 'Contact Us', 'যোগাযোগ করুন', '/website/contact', 2),
('cta_primary', 'View Admission Info', 'ভর্তি তথ্য দেখুন', '/website/admissions', 1),
('cta_secondary', 'Contact Us', 'যোগাযোগ করুন', '/website/contact', 2);

-- Insert all available sections
INSERT INTO public.website_available_sections (section_key, section_name, section_name_bn, description, source_page, component_name) VALUES
('hero_slider', 'Hero Slider', 'হিরো স্লাইডার', 'Main hero section with slider and notices', 'home', 'HeroSlider'),
('features', 'Features', 'বৈশিষ্ট্য', 'Why choose us section', 'home', 'FeaturesSection'),
('stats', 'Statistics', 'পরিসংখ্যান', 'School statistics', 'home', 'StatsSection'),
('alumni_bubbles', 'Alumni Bubbles', 'প্রাক্তনী বাবল', 'Featured alumni photos', 'home', 'AlumniBubbles'),
('parent_testimonials', 'Parent Testimonials', 'অভিভাবকদের মতামত', 'Parent reviews', 'home', 'ParentTestimonials'),
('general_testimonials', 'General Testimonials', 'সাধারণ মতামত', 'General testimonials', 'home', 'GeneralTestimonials'),
('cta_section', 'Call to Action', 'কল টু অ্যাকশন', 'Bottom CTA section', 'home', 'CTASection'),
('about_intro', 'About Introduction', 'পরিচিতি', 'School introduction', 'about', 'AboutIntro'),
('principal_message', 'Principal Message', 'অধ্যক্ষের বাণী', 'Message from principal', 'about', 'PrincipalMessage'),
('facilities', 'Facilities', 'সুবিধাসমূহ', 'School facilities', 'about', 'FacilitiesSection'),
('programs', 'Academic Programs', 'শিক্ষা কার্যক্রম', 'Academic programs/levels', 'academics', 'ProgramsSection'),
('methodologies', 'Teaching Methods', 'শিক্ষাদান পদ্ধতি', 'Teaching methodologies', 'academics', 'MethodologiesSection');

-- Insert default popup notice (disabled)
INSERT INTO public.website_popup_notice (title, title_bn, description, description_bn, display_type, is_enabled) VALUES
('Important Notice', 'গুরুত্বপূর্ণ নোটিশ', 'Click to see details', 'বিস্তারিত দেখতে ক্লিক করুন', 'card', false);

-- Update existing home sections with names
UPDATE public.website_home_sections SET 
  section_name = 'Hero Slider', 
  section_name_bn = 'হিরো স্লাইডার' 
WHERE section_key = 'hero_slider';

UPDATE public.website_home_sections SET 
  section_name = 'Features', 
  section_name_bn = 'বৈশিষ্ট্য' 
WHERE section_key = 'features';

UPDATE public.website_home_sections SET 
  section_name = 'Statistics', 
  section_name_bn = 'পরিসংখ্যান' 
WHERE section_key = 'stats';

UPDATE public.website_home_sections SET 
  section_name = 'Alumni Bubbles', 
  section_name_bn = 'প্রাক্তনী বাবল' 
WHERE section_key = 'alumni_bubbles';

UPDATE public.website_home_sections SET 
  section_name = 'Parent Testimonials', 
  section_name_bn = 'অভিভাবকদের মতামত' 
WHERE section_key = 'parent_testimonials';

UPDATE public.website_home_sections SET 
  section_name = 'Call to Action', 
  section_name_bn = 'কল টু অ্যাকশন' 
WHERE section_key = 'cta_section';