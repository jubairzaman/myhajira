-- =============================================
-- SCHOOL WEBSITE & CMS MODULE - DATABASE SCHEMA
-- =============================================

-- 1. Website Settings (Global CMS Configuration)
CREATE TABLE public.website_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name text DEFAULT 'আমার স্কুল',
  school_name_bn text DEFAULT 'আমার স্কুল',
  logo_url text,
  favicon_url text,
  hero_title text DEFAULT 'Welcome to Our School',
  hero_title_bn text DEFAULT 'আমাদের স্কুলে স্বাগতম',
  hero_subtitle text DEFAULT 'Building Tomorrow''s Leaders Today',
  hero_subtitle_bn text DEFAULT 'আজকের শিক্ষায় আগামীর নেতৃত্ব',
  hero_image_url text,
  hero_video_url text,
  primary_color text DEFAULT '#4B0082',
  secondary_color text DEFAULT '#00D4FF',
  contact_email text,
  contact_phone text,
  contact_address text,
  contact_address_bn text,
  google_map_embed text,
  office_hours text DEFAULT 'Sunday - Thursday: 8:00 AM - 4:00 PM',
  office_hours_bn text DEFAULT 'রবিবার - বৃহস্পতিবার: সকাল ৮:০০ - বিকাল ৪:০০',
  facebook_url text,
  youtube_url text,
  twitter_url text,
  instagram_url text,
  is_website_enabled boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Website Pages (Page Enable/Disable & SEO)
CREATE TABLE public.website_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  title_bn text,
  is_enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Website Sections (CMS Content Blocks)
CREATE TABLE public.website_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug text NOT NULL REFERENCES public.website_pages(slug) ON DELETE CASCADE,
  section_type text NOT NULL,
  title text,
  title_bn text,
  content text,
  content_bn text,
  image_url text,
  video_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Website Notices (Notice Board)
CREATE TABLE public.website_notices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  title_bn text,
  content text NOT NULL,
  content_bn text,
  category text NOT NULL DEFAULT 'general',
  attachment_url text,
  is_published boolean NOT NULL DEFAULT false,
  publish_date timestamp with time zone DEFAULT now(),
  is_pinned boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. Website Results (Class-wise PDF Results)
CREATE TABLE public.website_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  pdf_url text NOT NULL,
  title text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(academic_year_id, class_id, exam_id)
);

-- 6. Website Alumni (Alumni Hub)
CREATE TABLE public.website_alumni (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_bn text,
  passing_year integer NOT NULL,
  photo_url text,
  current_position text,
  current_position_bn text,
  comment text,
  comment_bn text,
  is_featured boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  show_in_bubble boolean NOT NULL DEFAULT false,
  submitted_at timestamp with time zone DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 7. Website Contacts (Contact Form Submissions)
CREATE TABLE public.website_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  replied_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 8. Website Testimonials
CREATE TABLE public.website_testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_bn text,
  role text DEFAULT 'Student',
  photo_url text,
  content text NOT NULL,
  content_bn text,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 9. Website Academics (Programs & Syllabus)
CREATE TABLE public.website_academics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  title_bn text,
  description text,
  description_bn text,
  syllabus_pdf_url text,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  category text DEFAULT 'program',
  display_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_academics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - PUBLIC READ ACCESS
-- =============================================

-- Website Settings - Public can read, Admins can manage
CREATE POLICY "Public can view website settings" ON public.website_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage website settings" ON public.website_settings
  FOR ALL USING (is_admin(auth.uid()));

-- Website Pages - Public can view enabled pages
CREATE POLICY "Public can view enabled pages" ON public.website_pages
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admins can manage pages" ON public.website_pages
  FOR ALL USING (is_admin(auth.uid()));

-- Website Sections - Public can view enabled sections on enabled pages
CREATE POLICY "Public can view enabled sections" ON public.website_sections
  FOR SELECT USING (
    is_enabled = true AND 
    EXISTS (SELECT 1 FROM public.website_pages WHERE slug = page_slug AND is_enabled = true)
  );

CREATE POLICY "Admins can manage sections" ON public.website_sections
  FOR ALL USING (is_admin(auth.uid()));

-- Website Notices - Public can view published notices
CREATE POLICY "Public can view published notices" ON public.website_notices
  FOR SELECT USING (is_published = true AND publish_date <= now());

CREATE POLICY "Admins can manage notices" ON public.website_notices
  FOR ALL USING (is_admin(auth.uid()));

-- Website Results - Public can view published results
CREATE POLICY "Public can view published results" ON public.website_results
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage results" ON public.website_results
  FOR ALL USING (is_admin(auth.uid()));

-- Website Alumni - Public can view approved alumni, anyone can insert (submit application)
CREATE POLICY "Public can view approved alumni" ON public.website_alumni
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can submit alumni application" ON public.website_alumni
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage alumni" ON public.website_alumni
  FOR ALL USING (is_admin(auth.uid()));

-- Website Contacts - Anyone can insert (submit contact form)
CREATE POLICY "Anyone can submit contact form" ON public.website_contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage contacts" ON public.website_contacts
  FOR ALL USING (is_admin(auth.uid()));

-- Website Testimonials - Public can view enabled testimonials
CREATE POLICY "Public can view enabled testimonials" ON public.website_testimonials
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admins can manage testimonials" ON public.website_testimonials
  FOR ALL USING (is_admin(auth.uid()));

-- Website Academics - Public can view enabled academics
CREATE POLICY "Public can view enabled academics" ON public.website_academics
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admins can manage academics" ON public.website_academics
  FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_website_settings_updated_at
  BEFORE UPDATE ON public.website_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_pages_updated_at
  BEFORE UPDATE ON public.website_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_sections_updated_at
  BEFORE UPDATE ON public.website_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_notices_updated_at
  BEFORE UPDATE ON public.website_notices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_results_updated_at
  BEFORE UPDATE ON public.website_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_alumni_updated_at
  BEFORE UPDATE ON public.website_alumni
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_testimonials_updated_at
  BEFORE UPDATE ON public.website_testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_academics_updated_at
  BEFORE UPDATE ON public.website_academics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DEFAULT DATA
-- =============================================

-- Insert default website settings
INSERT INTO public.website_settings (id) VALUES (gen_random_uuid());

-- Insert default pages
INSERT INTO public.website_pages (slug, title, title_bn, display_order) VALUES
  ('home', 'Home', 'হোম', 1),
  ('about', 'About Us', 'আমাদের সম্পর্কে', 2),
  ('academics', 'Academics', 'শিক্ষা কার্যক্রম', 3),
  ('admissions', 'Admissions', 'ভর্তি', 4),
  ('notices', 'Notice Board', 'নোটিশ বোর্ড', 5),
  ('results', 'Results', 'ফলাফল', 6),
  ('alumni', 'Alumni', 'প্রাক্তন ছাত্র', 7),
  ('contact', 'Contact Us', 'যোগাযোগ', 8);

-- Insert default home page sections
INSERT INTO public.website_sections (page_slug, section_type, title, title_bn, display_order, metadata) VALUES
  ('home', 'hero', 'Hero Banner', 'হিরো ব্যানার', 1, '{}'),
  ('home', 'features', 'Why Choose Us', 'কেন আমাদের বেছে নেবেন', 2, '{"items": [{"icon": "GraduationCap", "title": "Quality Education", "title_bn": "মানসম্মত শিক্ষা", "description": "Expert teachers and modern curriculum"}, {"icon": "Users", "title": "Experienced Faculty", "title_bn": "অভিজ্ঞ শিক্ষকমণ্ডলী", "description": "Dedicated and skilled educators"}, {"icon": "Award", "title": "Excellence", "title_bn": "শ্রেষ্ঠত্ব", "description": "Consistently outstanding results"}, {"icon": "Heart", "title": "Caring Environment", "title_bn": "যত্নশীল পরিবেশ", "description": "Safe and nurturing atmosphere"}]}'),
  ('home', 'stats', 'School Statistics', 'স্কুলের পরিসংখ্যান', 3, '{"items": [{"value": "1000+", "label": "Students", "label_bn": "শিক্ষার্থী"}, {"value": "50+", "label": "Teachers", "label_bn": "শিক্ষক"}, {"value": "25+", "label": "Years", "label_bn": "বছর"}, {"value": "95%", "label": "Success Rate", "label_bn": "সাফল্যের হার"}]}'),
  ('home', 'notices', 'Latest Notices', 'সর্বশেষ নোটিশ', 4, '{}'),
  ('home', 'testimonials', 'What People Say', 'মানুষ কি বলে', 5, '{}');

-- Insert default about page sections
INSERT INTO public.website_sections (page_slug, section_type, title, title_bn, content, content_bn, display_order) VALUES
  ('about', 'introduction', 'Our School', 'আমাদের স্কুল', 'Welcome to our prestigious institution dedicated to academic excellence and holistic development.', 'একাডেমিক শ্রেষ্ঠত্ব এবং সামগ্রিক উন্নয়নের জন্য নিবেদিত আমাদের মর্যাদাপূর্ণ প্রতিষ্ঠানে স্বাগতম।', 1),
  ('about', 'vision_mission', 'Vision & Mission', 'দৃষ্টিভঙ্গি ও লক্ষ্য', 'Our vision is to create future leaders. Our mission is to provide quality education.', 'আমাদের দৃষ্টিভঙ্গি হল ভবিষ্যতের নেতা তৈরি করা। আমাদের লক্ষ্য মানসম্মত শিক্ষা প্রদান করা।', 2),
  ('about', 'principal_message', 'Principal''s Message', 'অধ্যক্ষের বাণী', 'Dear students and parents, education is the key to success.', 'প্রিয় শিক্ষার্থী ও অভিভাবকগণ, শিক্ষা হল সাফল্যের চাবিকাঠি।', 3),
  ('about', 'facilities', 'Our Facilities', 'আমাদের সুবিধাসমূহ', 'Modern classrooms, computer labs, library, playground, and more.', 'আধুনিক শ্রেণীকক্ষ, কম্পিউটার ল্যাব, লাইব্রেরি, খেলার মাঠ এবং আরও অনেক কিছু।', 4);

-- Insert default academics page sections
INSERT INTO public.website_sections (page_slug, section_type, title, title_bn, content, content_bn, display_order) VALUES
  ('academics', 'programs', 'Our Programs', 'আমাদের প্রোগ্রামসমূহ', 'We offer comprehensive education from primary to higher secondary level.', 'আমরা প্রাথমিক থেকে উচ্চ মাধ্যমিক স্তর পর্যন্ত ব্যাপক শিক্ষা প্রদান করি।', 1),
  ('academics', 'methodology', 'Teaching Methodology', 'শিক্ষাদান পদ্ধতি', 'Student-centered learning with modern teaching techniques.', 'আধুনিক শিক্ষাদান কৌশল সহ শিক্ষার্থী-কেন্দ্রিক শিক্ষা।', 2),
  ('academics', 'curriculum', 'Curriculum', 'পাঠ্যক্রম', 'Following national curriculum with additional enrichment programs.', 'অতিরিক্ত সমৃদ্ধকরণ প্রোগ্রাম সহ জাতীয় পাঠ্যক্রম অনুসরণ।', 3);

-- Insert default admissions page sections
INSERT INTO public.website_sections (page_slug, section_type, title, title_bn, content, content_bn, display_order, metadata) VALUES
  ('admissions', 'process', 'Admission Process', 'ভর্তি প্রক্রিয়া', 'Follow these simple steps to enroll your child.', 'আপনার সন্তানকে ভর্তি করতে এই সহজ পদক্ষেপগুলি অনুসরণ করুন।', 1, '{"steps": [{"step": 1, "title": "Submit Application", "title_bn": "আবেদন জমা দিন"}, {"step": 2, "title": "Document Verification", "title_bn": "ডকুমেন্ট যাচাই"}, {"step": 3, "title": "Admission Test", "title_bn": "ভর্তি পরীক্ষা"}, {"step": 4, "title": "Confirm Admission", "title_bn": "ভর্তি নিশ্চিত করুন"}]}'),
  ('admissions', 'documents', 'Required Documents', 'প্রয়োজনীয় ডকুমেন্ট', 'Please prepare the following documents for admission.', 'ভর্তির জন্য নিম্নলিখিত ডকুমেন্টগুলি প্রস্তুত করুন।', 2, '{}');

-- Insert default contact page sections
INSERT INTO public.website_sections (page_slug, section_type, title, title_bn, display_order) VALUES
  ('contact', 'form', 'Contact Form', 'যোগাযোগ ফর্ম', 1),
  ('contact', 'info', 'Contact Information', 'যোগাযোগের তথ্য', 2),
  ('contact', 'map', 'Location Map', 'লোকেশন ম্যাপ', 3);

-- Insert default alumni page sections
INSERT INTO public.website_sections (page_slug, section_type, title, title_bn, display_order) VALUES
  ('alumni', 'hero', 'Alumni Network', 'প্রাক্তন ছাত্র নেটওয়ার্ক', 1),
  ('alumni', 'featured', 'Featured Alumni', 'বিশিষ্ট প্রাক্তন ছাত্র', 2),
  ('alumni', 'bubbles', 'Alumni Voices', 'প্রাক্তনদের কথা', 3),
  ('alumni', 'youtube', 'Alumni Podcasts', 'প্রাক্তন পডকাস্ট', 4),
  ('alumni', 'form', 'Join Alumni Network', 'প্রাক্তন নেটওয়ার্কে যোগ দিন', 5);