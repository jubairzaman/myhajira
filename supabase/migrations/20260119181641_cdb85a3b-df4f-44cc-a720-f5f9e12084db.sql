-- Add admission_date to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS admission_date DATE DEFAULT CURRENT_DATE;

-- Backfill existing students with their created_at date
UPDATE public.students 
SET admission_date = created_at::date 
WHERE admission_date IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_students_admission_date ON public.students(admission_date);