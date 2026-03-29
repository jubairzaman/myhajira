
-- =============================================
-- RESULT MANAGEMENT MODULE - Full Schema
-- =============================================

-- 1. Grading Scales
CREATE TABLE public.grading_scales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_bn text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.grade_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grading_scale_id uuid REFERENCES public.grading_scales(id) ON DELETE CASCADE NOT NULL,
  grade text NOT NULL,
  grade_bn text,
  min_marks numeric NOT NULL,
  max_marks numeric NOT NULL,
  point numeric NOT NULL,
  remarks text,
  remarks_bn text,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. Subjects
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_bn text,
  subject_code text,
  subject_type text NOT NULL DEFAULT 'mandatory',
  full_marks numeric NOT NULL DEFAULT 100,
  pass_marks numeric NOT NULL DEFAULT 33,
  has_components boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.subject_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_bn text,
  full_marks numeric NOT NULL,
  pass_marks numeric NOT NULL DEFAULT 0,
  is_required_for_pass boolean DEFAULT false,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Exam Patterns (per class, versioned)
CREATE TABLE public.exam_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_bn text,
  pattern_type text NOT NULL DEFAULT 'term_based',
  version int DEFAULT 1,
  is_active boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Exam Terms (groupings within a pattern)
CREATE TABLE public.exam_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_pattern_id uuid REFERENCES public.exam_patterns(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_bn text,
  weight numeric NOT NULL DEFAULT 100,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5. Which exams belong to a term
CREATE TABLE public.term_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id uuid REFERENCES public.exam_terms(id) ON DELETE CASCADE NOT NULL,
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  weight numeric DEFAULT 100,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 6. Result Configuration per class
CREATE TABLE public.result_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  grading_scale_id uuid REFERENCES public.grading_scales(id),
  absent_as_zero boolean DEFAULT false,
  grace_marks numeric DEFAULT 0,
  grace_marks_enabled boolean DEFAULT false,
  practical_must_pass boolean DEFAULT true,
  optional_subject_bonus boolean DEFAULT false,
  ranking_priority jsonb DEFAULT '["gpa","total_marks"]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(academic_year_id, class_id)
);

-- 7. Marks Entries
CREATE TABLE public.marks_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid REFERENCES public.academic_years(id) NOT NULL,
  exam_id uuid REFERENCES public.exams(id) NOT NULL,
  class_id uuid REFERENCES public.classes(id) NOT NULL,
  section_id uuid REFERENCES public.sections(id) NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) NOT NULL,
  student_id uuid REFERENCES public.students(id) NOT NULL,
  component_id uuid REFERENCES public.subject_components(id),
  marks numeric,
  is_absent boolean DEFAULT false,
  entered_by uuid,
  status text NOT NULL DEFAULT 'draft',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, subject_id, student_id, component_id)
);

-- 8. Result Publish Status
CREATE TABLE public.result_publish_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid REFERENCES public.academic_years(id) NOT NULL,
  exam_id uuid REFERENCES public.exams(id) NOT NULL,
  class_id uuid REFERENCES public.classes(id) NOT NULL,
  section_id uuid REFERENCES public.sections(id),
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  published_by uuid,
  locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(academic_year_id, exam_id, class_id, section_id)
);

-- 9. Promotion Overrides
CREATE TABLE public.promotion_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid REFERENCES public.academic_years(id) NOT NULL,
  student_id uuid REFERENCES public.students(id) NOT NULL,
  original_status text NOT NULL,
  override_status text NOT NULL,
  reason text,
  overridden_by uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(academic_year_id, student_id)
);

-- 10. Marks Audit Log
CREATE TABLE public.marks_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marks_entry_id uuid REFERENCES public.marks_entries(id) ON DELETE SET NULL,
  student_id uuid REFERENCES public.students(id),
  subject_id uuid REFERENCES public.subjects(id),
  exam_id uuid REFERENCES public.exams(id),
  old_marks numeric,
  new_marks numeric,
  old_status text,
  new_status text,
  changed_by uuid,
  change_reason text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- RLS Policies
-- =============================================

ALTER TABLE public.grading_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.term_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_publish_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks_audit_log ENABLE ROW LEVEL SECURITY;

-- Grading Scales
CREATE POLICY "Admins can manage grading scales" ON public.grading_scales FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view grading scales" ON public.grading_scales FOR SELECT TO authenticated USING (true);

-- Grade Points
CREATE POLICY "Admins can manage grade points" ON public.grade_points FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view grade points" ON public.grade_points FOR SELECT TO authenticated USING (true);

-- Subjects
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);

-- Subject Components
CREATE POLICY "Admins can manage subject components" ON public.subject_components FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view subject components" ON public.subject_components FOR SELECT TO authenticated USING (true);

-- Exam Patterns
CREATE POLICY "Admins can manage exam patterns" ON public.exam_patterns FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view exam patterns" ON public.exam_patterns FOR SELECT TO authenticated USING (true);

-- Exam Terms
CREATE POLICY "Admins can manage exam terms" ON public.exam_terms FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view exam terms" ON public.exam_terms FOR SELECT TO authenticated USING (true);

-- Term Exams
CREATE POLICY "Admins can manage term exams" ON public.term_exams FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view term exams" ON public.term_exams FOR SELECT TO authenticated USING (true);

-- Result Configs
CREATE POLICY "Admins can manage result configs" ON public.result_configs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view result configs" ON public.result_configs FOR SELECT TO authenticated USING (true);

-- Marks Entries - teachers can insert/update their own drafts
CREATE POLICY "Admins can manage all marks" ON public.marks_entries FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Teachers can manage own draft marks" ON public.marks_entries FOR ALL TO authenticated USING (entered_by = auth.uid() AND status = 'draft') WITH CHECK (entered_by = auth.uid() AND status = 'draft');
CREATE POLICY "Authenticated can view marks" ON public.marks_entries FOR SELECT TO authenticated USING (true);

-- Result Publish Status
CREATE POLICY "Admins can manage publish status" ON public.result_publish_status FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view publish status" ON public.result_publish_status FOR SELECT TO authenticated USING (true);

-- Promotion Overrides
CREATE POLICY "Admins can manage promotions" ON public.promotion_overrides FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view promotions" ON public.promotion_overrides FOR SELECT TO authenticated USING (true);

-- Marks Audit Log
CREATE POLICY "Admins can view marks audit" ON public.marks_audit_log FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "System can insert marks audit" ON public.marks_audit_log FOR INSERT TO authenticated WITH CHECK (true);
