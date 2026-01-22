-- Add file_url column to student_documents table
ALTER TABLE public.student_documents 
ADD COLUMN file_url TEXT NULL;

-- Create storage bucket for student documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for student documents bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload student documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-documents');

-- Allow authenticated users to view/download files
CREATE POLICY "Authenticated users can view student documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'student-documents');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update student documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'student-documents');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete student documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-documents');