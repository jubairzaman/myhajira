import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RequiredDocument {
  id: string;
  name: string;
  name_bn: string | null;
  is_mandatory: boolean;
  is_active: boolean;
  display_order: number;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  document_id: string;
  is_submitted: boolean;
  submitted_at: string | null;
  notes: string | null;
  document?: RequiredDocument;
}

// Fetch all required documents (active ones)
export function useRequiredDocuments() {
  return useQuery({
    queryKey: ['required-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('required_documents')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as RequiredDocument[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
}

// Fetch all required documents including inactive (for admin settings)
export function useAllRequiredDocuments() {
  return useQuery({
    queryKey: ['all-required-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('required_documents')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data as RequiredDocument[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch student's document submissions
export function useStudentDocuments(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-documents', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('student_documents')
        .select(`
          *,
          document:required_documents(*)
        `)
        .eq('student_id', studentId);

      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        document: Array.isArray(d.document) ? d.document[0] : d.document,
      })) as StudentDocument[];
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Upsert student document submission
export function useUpsertStudentDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      documentId,
      isSubmitted,
      notes,
    }: {
      studentId: string;
      documentId: string;
      isSubmitted: boolean;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('student_documents')
        .upsert({
          student_id: studentId,
          document_id: documentId,
          is_submitted: isSubmitted,
          submitted_at: isSubmitted ? new Date().toISOString() : null,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,document_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-documents', variables.studentId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'ডকুমেন্ট আপডেট ব্যর্থ হয়েছে');
    },
  });
}

// Bulk upsert student documents (for registration)
export function useBulkUpsertStudentDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      documents,
    }: {
      studentId: string;
      documents: { documentId: string; isSubmitted: boolean; notes?: string }[];
    }) => {
      const records = documents.map(doc => ({
        student_id: studentId,
        document_id: doc.documentId,
        is_submitted: doc.isSubmitted,
        submitted_at: doc.isSubmitted ? new Date().toISOString() : null,
        notes: doc.notes || null,
      }));

      const { data, error } = await supabase
        .from('student_documents')
        .upsert(records, {
          onConflict: 'student_id,document_id',
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-documents', variables.studentId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'ডকুমেন্ট সংরক্ষণ ব্যর্থ হয়েছে');
    },
  });
}

// Admin: Add new required document
export function useAddRequiredDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      nameBn,
      isMandatory,
      displayOrder,
    }: {
      name: string;
      nameBn?: string;
      isMandatory: boolean;
      displayOrder?: number;
    }) => {
      const { data, error } = await supabase
        .from('required_documents')
        .insert({
          name,
          name_bn: nameBn || null,
          is_mandatory: isMandatory,
          display_order: displayOrder || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['required-documents'] });
      queryClient.invalidateQueries({ queryKey: ['all-required-documents'] });
      toast.success('ডকুমেন্ট যুক্ত হয়েছে');
    },
    onError: (error: any) => {
      toast.error(error.message || 'ডকুমেন্ট যুক্ত করা ব্যর্থ');
    },
  });
}

// Admin: Update required document
export function useUpdateRequiredDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      nameBn,
      isMandatory,
      isActive,
      displayOrder,
    }: {
      id: string;
      name?: string;
      nameBn?: string;
      isMandatory?: boolean;
      isActive?: boolean;
      displayOrder?: number;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (nameBn !== undefined) updateData.name_bn = nameBn;
      if (isMandatory !== undefined) updateData.is_mandatory = isMandatory;
      if (isActive !== undefined) updateData.is_active = isActive;
      if (displayOrder !== undefined) updateData.display_order = displayOrder;

      const { data, error } = await supabase
        .from('required_documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['required-documents'] });
      queryClient.invalidateQueries({ queryKey: ['all-required-documents'] });
      toast.success('ডকুমেন্ট আপডেট হয়েছে');
    },
    onError: (error: any) => {
      toast.error(error.message || 'আপডেট ব্যর্থ হয়েছে');
    },
  });
}

// Admin: Delete required document
export function useDeleteRequiredDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('required_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['required-documents'] });
      queryClient.invalidateQueries({ queryKey: ['all-required-documents'] });
      toast.success('ডকুমেন্ট মুছে ফেলা হয়েছে');
    },
    onError: (error: any) => {
      toast.error(error.message || 'মুছে ফেলা ব্যর্থ');
    },
  });
}
