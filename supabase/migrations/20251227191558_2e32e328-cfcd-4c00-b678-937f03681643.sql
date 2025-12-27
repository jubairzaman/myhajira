-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'teacher', 'operator');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create academic_years table
CREATE TABLE public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shifts table
CREATE TABLE public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    name_bn TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create panels table
CREATE TABLE public.panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    name_bn TEXT,
    type TEXT NOT NULL CHECK (type IN ('primary', 'girls', 'boys', 'teacher')),
    start_time TIME NOT NULL,
    late_threshold_time TIME NOT NULL,
    absent_cutoff_time TIME NOT NULL,
    sms_trigger_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    name_bn TEXT,
    grade_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sections table
CREATE TABLE public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    name_bn TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE NOT NULL,
    panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    student_id_number TEXT,
    name TEXT NOT NULL,
    name_bn TEXT,
    guardian_mobile TEXT NOT NULL,
    blood_group TEXT,
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE NOT NULL,
    panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    name_bn TEXT,
    designation TEXT NOT NULL,
    mobile TEXT NOT NULL,
    blood_group TEXT,
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create devices table
CREATE TABLE public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 4370,
    location TEXT,
    device_type TEXT DEFAULT 'zkteco',
    is_online BOOLEAN NOT NULL DEFAULT false,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rfid_cards_students table
CREATE TABLE public.rfid_cards_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL UNIQUE,
    card_number TEXT NOT NULL UNIQUE,
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rfid_cards_teachers table
CREATE TABLE public.rfid_cards_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL UNIQUE,
    card_number TEXT NOT NULL UNIQUE,
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_attendance table
CREATE TABLE public.student_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL,
    punch_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'late', 'absent')),
    is_manual BOOLEAN NOT NULL DEFAULT false,
    manual_reason TEXT,
    manual_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (student_id, attendance_date)
);

-- Create teacher_attendance table
CREATE TABLE public.teacher_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL,
    punch_in_time TIMESTAMP WITH TIME ZONE,
    punch_out_time TIMESTAMP WITH TIME ZONE,
    late_minutes INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('present', 'late', 'absent')),
    is_manual BOOLEAN NOT NULL DEFAULT false,
    manual_reason TEXT,
    manual_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (teacher_id, attendance_date)
);

-- Create sms_settings table
CREATE TABLE public.sms_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key TEXT,
    sender_id TEXT,
    balance DECIMAL(10,2) DEFAULT 0,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    absent_sms_enabled BOOLEAN NOT NULL DEFAULT true,
    monthly_summary_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_template TEXT DEFAULT 'প্রিয় অভিভাবক, আপনার সন্তান {{StudentName}} ({{Class}}) আজ {{Date}} স্কুলে অনুপস্থিত। - {{SchoolName}}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sms_logs table
CREATE TABLE public.sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    mobile_number TEXT NOT NULL,
    message TEXT NOT NULL,
    sms_type TEXT NOT NULL CHECK (sms_type IN ('absent', 'late', 'monthly_summary', 'custom')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_settings table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name TEXT DEFAULT 'আমার হাজিরা স্কুল',
    school_name_bn TEXT DEFAULT 'আমার হাজিরা স্কুল',
    school_logo_url TEXT,
    timezone TEXT DEFAULT 'Asia/Dhaka',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_students_academic_year ON public.students(academic_year_id);
CREATE INDEX idx_students_class ON public.students(class_id);
CREATE INDEX idx_students_section ON public.students(section_id);
CREATE INDEX idx_student_attendance_date ON public.student_attendance(attendance_date);
CREATE INDEX idx_student_attendance_student ON public.student_attendance(student_id);
CREATE INDEX idx_teacher_attendance_date ON public.teacher_attendance(attendance_date);
CREATE INDEX idx_teacher_attendance_teacher ON public.teacher_attendance(teacher_id);
CREATE INDEX idx_sms_logs_status ON public.sms_logs(status);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_rfid_students_card ON public.rfid_cards_students(card_number);
CREATE INDEX idx_rfid_teachers_card ON public.rfid_cards_teachers(card_number);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfid_cards_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfid_cards_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- Create function to check if user has any role
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- RLS Policies for academic_years (viewable by all authenticated, manageable by admins)
CREATE POLICY "Authenticated users can view academic years" ON public.academic_years
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage academic years" ON public.academic_years
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for shifts
CREATE POLICY "Authenticated users can view shifts" ON public.shifts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage shifts" ON public.shifts
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for panels
CREATE POLICY "Authenticated users can view panels" ON public.panels
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage panels" ON public.panels
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for classes
CREATE POLICY "Authenticated users can view classes" ON public.classes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage classes" ON public.classes
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for sections
CREATE POLICY "Authenticated users can view sections" ON public.sections
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage sections" ON public.sections
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for students
CREATE POLICY "Authenticated users can view students" ON public.students
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage students" ON public.students
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for teachers
CREATE POLICY "Authenticated users can view teachers" ON public.teachers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage teachers" ON public.teachers
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for devices
CREATE POLICY "Authenticated users can view devices" ON public.devices
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage devices" ON public.devices
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for RFID cards
CREATE POLICY "Authenticated users can view student RFID cards" ON public.rfid_cards_students
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage student RFID cards" ON public.rfid_cards_students
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view teacher RFID cards" ON public.rfid_cards_teachers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage teacher RFID cards" ON public.rfid_cards_teachers
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for attendance
CREATE POLICY "Authenticated users can view student attendance" ON public.student_attendance
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage student attendance" ON public.student_attendance
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view teacher attendance" ON public.teacher_attendance
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage teacher attendance" ON public.teacher_attendance
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for SMS
CREATE POLICY "Admins can view SMS settings" ON public.sms_settings
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage SMS settings" ON public.sms_settings
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view SMS logs" ON public.sms_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage SMS logs" ON public.sms_logs
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- RLS Policies for system settings
CREATE POLICY "Authenticated users can view system settings" ON public.system_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage system settings" ON public.system_settings
    FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Create trigger function for profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
    RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_panels_updated_at BEFORE UPDATE ON public.panels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sms_settings_updated_at BEFORE UPDATE ON public.sms_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default SMS settings
INSERT INTO public.sms_settings (id) VALUES (gen_random_uuid());

-- Insert default system settings
INSERT INTO public.system_settings (id) VALUES (gen_random_uuid());

-- Enable realtime for attendance tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_attendance