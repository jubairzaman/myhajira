-- Create optimized dashboard stats function
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_academic_year_id UUID, p_date DATE)
RETURNS JSON
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_students', (SELECT COUNT(*) FROM students WHERE academic_year_id = p_academic_year_id AND is_active = true),
    'total_teachers', (SELECT COUNT(*) FROM teachers WHERE academic_year_id = p_academic_year_id AND is_active = true),
    'present_count', (SELECT COUNT(*) FROM student_attendance WHERE academic_year_id = p_academic_year_id AND attendance_date = p_date AND status = 'present'),
    'late_count', (SELECT COUNT(*) FROM student_attendance WHERE academic_year_id = p_academic_year_id AND attendance_date = p_date AND status = 'late'),
    'absent_count', (SELECT COUNT(*) FROM student_attendance WHERE academic_year_id = p_academic_year_id AND attendance_date = p_date AND status = 'absent')
  );
$$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_students_academic_year_active 
ON students(academic_year_id, is_active);

CREATE INDEX IF NOT EXISTS idx_students_class_shift
ON students(class_id, shift_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_student_attendance_date_status
ON student_attendance(academic_year_id, attendance_date, status);

CREATE INDEX IF NOT EXISTS idx_student_attendance_student_date
ON student_attendance(student_id, attendance_date);

CREATE INDEX IF NOT EXISTS idx_teacher_attendance_date_status
ON teacher_attendance(academic_year_id, attendance_date, status);

CREATE INDEX IF NOT EXISTS idx_teachers_academic_year_active
ON teachers(academic_year_id, is_active);

CREATE INDEX IF NOT EXISTS idx_classes_shift_active
ON classes(shift_id, is_active);

CREATE INDEX IF NOT EXISTS idx_shifts_academic_year_active
ON shifts(academic_year_id, is_active);