-- Create required_documents table for admin to define what documents are needed
CREATE TABLE public.required_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.required_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage required documents" 
ON public.required_documents 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view required documents" 
ON public.required_documents 
FOR SELECT 
USING (true);

-- Create student_documents table to track submitted documents
CREATE TABLE public.student_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.required_documents(id) ON DELETE CASCADE,
  is_submitted BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, document_id)
);

-- Enable RLS
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage student documents" 
ON public.student_documents 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view student documents" 
ON public.student_documents 
FOR SELECT 
USING (true);

-- Add custom_admission_fee to student_custom_fees table
ALTER TABLE public.student_custom_fees 
ADD COLUMN custom_admission_fee NUMERIC DEFAULT NULL;

-- Create indexes for performance
CREATE INDEX idx_student_documents_student_id ON public.student_documents(student_id);
CREATE INDEX idx_required_documents_active ON public.required_documents(is_active) WHERE is_active = true;

-- Insert some default required documents
INSERT INTO public.required_documents (name, name_bn, is_mandatory, display_order) VALUES
('Birth Certificate', 'জন্ম সনদ', true, 1),
('Previous School Certificate', 'পূর্ববর্তী স্কুলের সার্টিফিকেট', false, 2),
('Guardian NID Copy', 'অভিভাবকের NID কপি', true, 3),
('Passport Size Photo', 'পাসপোর্ট সাইজ ছবি', true, 4);