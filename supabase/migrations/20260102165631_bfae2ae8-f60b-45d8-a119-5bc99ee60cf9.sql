-- Performance optimization indexes for common queries

-- Student queries optimization
CREATE INDEX IF NOT EXISTS idx_students_academic_year_active 
  ON students(academic_year_id, is_active);
CREATE INDEX IF NOT EXISTS idx_students_class_shift 
  ON students(class_id, shift_id);
CREATE INDEX IF NOT EXISTS idx_students_section 
  ON students(section_id);

-- Teacher queries optimization  
CREATE INDEX IF NOT EXISTS idx_teachers_academic_year_active 
  ON teachers(academic_year_id, is_active);
CREATE INDEX IF NOT EXISTS idx_teachers_shift 
  ON teachers(shift_id);

-- Attendance queries optimization
CREATE INDEX IF NOT EXISTS idx_student_attendance_date_year 
  ON student_attendance(attendance_date, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_student 
  ON student_attendance(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_date_year 
  ON teacher_attendance(attendance_date, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_teacher 
  ON teacher_attendance(teacher_id, attendance_date);

-- RFID card lookups
CREATE INDEX IF NOT EXISTS idx_rfid_students_card 
  ON rfid_cards_students(card_number, is_active);
CREATE INDEX IF NOT EXISTS idx_rfid_students_student 
  ON rfid_cards_students(student_id, is_active);
CREATE INDEX IF NOT EXISTS idx_rfid_teachers_card 
  ON rfid_cards_teachers(card_number, is_active);
CREATE INDEX IF NOT EXISTS idx_rfid_teachers_teacher 
  ON rfid_cards_teachers(teacher_id, is_active);

-- Punch logs optimization
CREATE INDEX IF NOT EXISTS idx_punch_logs_date_person 
  ON punch_logs(punch_date, person_type, person_id);
CREATE INDEX IF NOT EXISTS idx_punch_logs_card 
  ON punch_logs(card_number);

-- Classes and sections optimization
CREATE INDEX IF NOT EXISTS idx_classes_active 
  ON classes(is_active, grade_order);
CREATE INDEX IF NOT EXISTS idx_sections_class 
  ON sections(class_id, is_active);