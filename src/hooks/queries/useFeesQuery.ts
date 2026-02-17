import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { toast } from 'sonner';

// Types
export interface FeeSettings {
  id: string;
  academic_year_id: string;
  monthly_due_date: number;
  late_fine_amount: number;
  late_fine_enabled: boolean;
  receipt_copy_mode: 'single' | 'dual';
}

export interface ClassMonthlyFee {
  id: string;
  class_id: string;
  academic_year_id: string;
  amount: number;
  admission_fee: number;
  session_charge: number;
  class?: {
    id: string;
    name: string;
    name_bn: string | null;
    grade_order: number;
  };
}

export interface Exam {
  id: string;
  name: string;
  name_bn: string | null;
  academic_year_id: string;
  exam_fee_amount: number;
  is_active: boolean;
}

// Fee Settings Query
export function useFeeSettings() {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['fee-settings', activeYear?.id],
    queryFn: async () => {
      if (!activeYear?.id) return null;

      const { data, error } = await supabase
        .from('fee_settings')
        .select('*')
        .eq('academic_year_id', activeYear.id)
        .maybeSingle();

      if (error) throw error;
      return data as FeeSettings | null;
    },
    enabled: !!activeYear?.id,
  });
}

// Upsert Fee Settings Mutation
export function useUpsertFeeSettings() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async (settings: Partial<FeeSettings>) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      const { data: existing } = await supabase
        .from('fee_settings')
        .select('id')
        .eq('academic_year_id', activeYear.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('fee_settings')
          .update(settings)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fee_settings')
          .insert({ ...settings, academic_year_id: activeYear.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-settings'] });
      toast.success('ফি সেটিংস সংরক্ষিত হয়েছে');
    },
    onError: (error) => {
      toast.error('সংরক্ষণে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}

// Class Monthly Fees Query
export function useClassMonthlyFees() {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['class-monthly-fees', activeYear?.id],
    queryFn: async () => {
      if (!activeYear?.id) return [];

      const { data, error } = await supabase
        .from('class_monthly_fees')
        .select(`
          *,
          class:classes(id, name, name_bn, grade_order)
        `)
        .eq('academic_year_id', activeYear.id);

      if (error) throw error;
      return (data || []) as ClassMonthlyFee[];
    },
    enabled: !!activeYear?.id,
  });
}

// Upsert Class Monthly Fee
export function useUpsertClassMonthlyFee() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async ({ 
      classId, 
      amount, 
      admissionFee, 
      sessionCharge 
    }: { 
      classId: string; 
      amount: number; 
      admissionFee: number; 
      sessionCharge: number;
    }) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      const { data: existing } = await supabase
        .from('class_monthly_fees')
        .select('id')
        .eq('class_id', classId)
        .eq('academic_year_id', activeYear.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('class_monthly_fees')
          .update({ amount, admission_fee: admissionFee, session_charge: sessionCharge })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('class_monthly_fees')
          .insert({ 
            class_id: classId, 
            academic_year_id: activeYear.id, 
            amount,
            admission_fee: admissionFee,
            session_charge: sessionCharge
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-monthly-fees'] });
      toast.success('শ্রেণী ফি সংরক্ষিত হয়েছে');
    },
    onError: (error) => {
      toast.error('সংরক্ষণে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}

// Exams Query
export function useExams() {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['exams', activeYear?.id],
    queryFn: async () => {
      if (!activeYear?.id) return [];

      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('academic_year_id', activeYear.id)
        .order('created_at');

      if (error) throw error;
      return (data || []) as Exam[];
    },
    enabled: !!activeYear?.id,
  });
}

// Create Exam
export function useCreateExam() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async (exam: { name: string; name_bn?: string; exam_fee_amount: number }) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      const { error } = await supabase
        .from('exams')
        .insert({ ...exam, academic_year_id: activeYear.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('পরীক্ষা যুক্ত হয়েছে');
    },
    onError: (error) => {
      toast.error('সংরক্ষণে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}

// Update Exam
export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; name_bn?: string; exam_fee_amount?: number; is_active?: boolean }) => {
      const { error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('পরীক্ষা আপডেট হয়েছে');
    },
    onError: (error) => {
      toast.error('আপডেটে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}

// Delete Exam
export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('পরীক্ষা মুছে ফেলা হয়েছে');
    },
    onError: (error) => {
      toast.error('মুছতে সমস্যা হয়েছে');
      console.error(error);
    },
  });
}
