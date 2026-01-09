
-- Fee Settings table (Late fine config, admission & session fees)
CREATE TABLE public.fee_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  monthly_due_date INTEGER NOT NULL DEFAULT 10 CHECK (monthly_due_date >= 1 AND monthly_due_date <= 31),
  late_fine_amount NUMERIC NOT NULL DEFAULT 50,
  late_fine_enabled BOOLEAN NOT NULL DEFAULT false,
  admission_fee NUMERIC NOT NULL DEFAULT 0,
  session_charge NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(academic_year_id)
);

-- Class Monthly Fees table
CREATE TABLE public.class_monthly_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, academic_year_id)
);

-- Exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  exam_fee_amount NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student Custom Fees table
CREATE TABLE public.student_custom_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  custom_monthly_fee NUMERIC,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Student Fee Records table (all fee transactions)
CREATE TABLE public.student_fee_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('admission', 'session', 'monthly', 'exam')),
  fee_month DATE,
  exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
  amount_due NUMERIC NOT NULL DEFAULT 0,
  late_fine NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  payment_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial')),
  receipt_number TEXT,
  collected_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.fee_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_monthly_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_custom_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fee_settings
CREATE POLICY "Admins can manage fee settings" ON public.fee_settings FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view fee settings" ON public.fee_settings FOR SELECT USING (true);

-- RLS Policies for class_monthly_fees
CREATE POLICY "Admins can manage class monthly fees" ON public.class_monthly_fees FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view class monthly fees" ON public.class_monthly_fees FOR SELECT USING (true);

-- RLS Policies for exams
CREATE POLICY "Admins can manage exams" ON public.exams FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view exams" ON public.exams FOR SELECT USING (true);

-- RLS Policies for student_custom_fees
CREATE POLICY "Admins can manage student custom fees" ON public.student_custom_fees FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view student custom fees" ON public.student_custom_fees FOR SELECT USING (true);

-- RLS Policies for student_fee_records
CREATE POLICY "Admins can manage student fee records" ON public.student_fee_records FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view student fee records" ON public.student_fee_records FOR SELECT USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_fee_settings_updated_at BEFORE UPDATE ON public.fee_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_class_monthly_fees_updated_at BEFORE UPDATE ON public.class_monthly_fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_custom_fees_updated_at BEFORE UPDATE ON public.student_custom_fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_fee_records_updated_at BEFORE UPDATE ON public.student_fee_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
