import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types
export interface AdmissionFormField {
  id: string;
  field_label: string;
  field_label_bn: string | null;
  field_type: string;
  field_name: string;
  placeholder: string | null;
  placeholder_bn: string | null;
  options: any;
  is_required: boolean;
  is_enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdmissionFormSubmission {
  id: string;
  applicant_name: string;
  applicant_phone: string | null;
  form_data: Record<string, any>;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============ FORM FIELDS ============
export function useAdmissionFormFields(enabledOnly = false) {
  return useQuery({
    queryKey: ['admission-form-fields', enabledOnly],
    queryFn: async () => {
      let query = (supabase as any)
        .from('admission_form_fields')
        .select('*')
        .order('display_order');
      if (enabledOnly) {
        query = query.eq('is_enabled', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as AdmissionFormField[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAdmissionFormField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (field: Omit<AdmissionFormField, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await (supabase as any)
        .from('admission_form_fields')
        .insert(field)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-form-fields'] });
      toast({ title: 'ফিল্ড যোগ হয়েছে' });
    },
    onError: (error: any) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateAdmissionFormField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdmissionFormField> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('admission_form_fields')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-form-fields'] });
      toast({ title: 'ফিল্ড আপডেট হয়েছে' });
    },
    onError: (error: any) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAdmissionFormField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('admission_form_fields')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-form-fields'] });
      toast({ title: 'ফিল্ড মুছে ফেলা হয়েছে' });
    },
    onError: (error: any) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ SUBMISSIONS ============
export function useAdmissionFormSubmissions() {
  return useQuery({
    queryKey: ['admission-form-submissions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('admission_form_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AdmissionFormSubmission[];
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useSubmitAdmissionForm() {
  return useMutation({
    mutationFn: async (submission: { applicant_name: string; applicant_phone?: string; form_data: Record<string, any> }) => {
      const { data, error } = await (supabase as any)
        .from('admission_form_submissions')
        .insert(submission)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'আবেদন সফলভাবে জমা হয়েছে', description: 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।' });
    },
    onError: (error: any) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateAdmissionSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; admin_notes?: string }) => {
      const { data, error } = await (supabase as any)
        .from('admission_form_submissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-form-submissions'] });
      toast({ title: 'আবেদন আপডেট হয়েছে' });
    },
    onError: (error: any) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAdmissionSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('admission_form_submissions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-form-submissions'] });
      toast({ title: 'আবেদন মুছে ফেলা হয়েছে' });
    },
    onError: (error: any) => {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    },
  });
}
